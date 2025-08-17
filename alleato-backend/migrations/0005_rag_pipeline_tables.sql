-- Migration: Create RAG Pipeline Tables
-- Description: Tables for vector embeddings, insights, and processing queue

-- 1. Document chunks table for storing text chunks and their embeddings
CREATE TABLE IF NOT EXISTS document_chunks (
  id TEXT PRIMARY KEY,
  meeting_id TEXT NOT NULL,
  project_id TEXT,
  chunk_index INTEGER NOT NULL,
  chunk_text TEXT NOT NULL,
  chunk_start_time INTEGER, -- milliseconds from meeting start
  chunk_end_time INTEGER,
  speaker_info TEXT, -- JSON with speaker details
  embedding_id TEXT, -- Reference to Cloudflare Vectorize
  metadata TEXT, -- JSON metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (meeting_id) REFERENCES meetings(id),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

CREATE INDEX idx_chunks_meeting ON document_chunks(meeting_id);
CREATE INDEX idx_chunks_project ON document_chunks(project_id);
CREATE INDEX idx_chunks_created ON document_chunks(created_at);

-- 2. Project insights table for categorized insights
CREATE TABLE IF NOT EXISTS project_insights (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  meeting_id TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('general_info', 'positive_feedback', 'risks', 'action_items')),
  text TEXT NOT NULL,
  confidence_score REAL DEFAULT 0.0,
  metadata TEXT, -- JSON with additional details
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (meeting_id) REFERENCES meetings(id)
);

CREATE INDEX idx_insights_project ON project_insights(project_id);
CREATE INDEX idx_insights_meeting ON project_insights(meeting_id);
CREATE INDEX idx_insights_category ON project_insights(category);
CREATE INDEX idx_insights_created ON project_insights(created_at);

-- 3. Meeting summaries table
CREATE TABLE IF NOT EXISTS meeting_summaries (
  id TEXT PRIMARY KEY,
  meeting_id TEXT NOT NULL UNIQUE,
  summary_short TEXT, -- 1-2 sentences
  summary_medium TEXT, -- 1 paragraph
  summary_long TEXT, -- Detailed summary
  key_points TEXT, -- JSON array
  sentiment_score REAL DEFAULT 0.0, -- -1 to 1
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (meeting_id) REFERENCES meetings(id)
);

CREATE INDEX idx_summaries_meeting ON meeting_summaries(meeting_id);

-- 4. Project tasks table for extracted action items
CREATE TABLE IF NOT EXISTS project_tasks (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  meeting_id TEXT NOT NULL,
  task_description TEXT NOT NULL,
  assigned_to TEXT,
  due_date TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  source_chunk_id TEXT,
  confidence_score REAL DEFAULT 0.0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  FOREIGN KEY (project_id) REFERENCES projects(id),
  FOREIGN KEY (meeting_id) REFERENCES meetings(id),
  FOREIGN KEY (source_chunk_id) REFERENCES document_chunks(id)
);

CREATE INDEX idx_tasks_project ON project_tasks(project_id);
CREATE INDEX idx_tasks_meeting ON project_tasks(meeting_id);
CREATE INDEX idx_tasks_status ON project_tasks(status);
CREATE INDEX idx_tasks_due_date ON project_tasks(due_date);

-- 5. RAG query log for tracking and improving responses
CREATE TABLE IF NOT EXISTS rag_queries (
  id TEXT PRIMARY KEY,
  query_text TEXT NOT NULL,
  query_embedding_id TEXT, -- Reference to Cloudflare Vectorize
  retrieved_chunks TEXT, -- JSON array of chunk IDs
  response TEXT,
  relevance_scores TEXT, -- JSON array
  user_id TEXT,
  session_id TEXT,
  feedback_rating INTEGER, -- 1-5 stars
  feedback_text TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_rag_queries_user ON rag_queries(user_id);
CREATE INDEX idx_rag_queries_session ON rag_queries(session_id);
CREATE INDEX idx_rag_queries_created ON rag_queries(created_at);

-- 6. Processing queue for async operations
CREATE TABLE IF NOT EXISTS processing_queue (
  id TEXT PRIMARY KEY,
  source_id TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'meeting',
  operation TEXT NOT NULL CHECK (operation IN ('vectorize', 'generate_insights', 'extract_tasks', 'summarize')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  priority INTEGER DEFAULT 0,
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  error_message TEXT,
  metadata TEXT, -- JSON
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  started_at DATETIME,
  completed_at DATETIME
);

CREATE INDEX idx_queue_status ON processing_queue(status);
CREATE INDEX idx_queue_priority ON processing_queue(priority DESC, created_at ASC);
CREATE INDEX idx_queue_source ON processing_queue(source_id, source_type);

-- 7. Fireflies sync state table
CREATE TABLE IF NOT EXISTS fireflies_sync_state (
  id TEXT PRIMARY KEY DEFAULT 'singleton',
  last_sync_timestamp DATETIME,
  last_successful_sync DATETIME,
  total_synced INTEGER DEFAULT 0,
  last_error TEXT,
  sync_cursor TEXT, -- For pagination
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert initial sync state
INSERT OR IGNORE INTO fireflies_sync_state (id) VALUES ('singleton');

-- Add triggers for updated_at timestamps
CREATE TRIGGER update_chunks_timestamp 
AFTER UPDATE ON document_chunks
BEGIN
  UPDATE document_chunks SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_insights_timestamp 
AFTER UPDATE ON project_insights
BEGIN
  UPDATE project_insights SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_summaries_timestamp 
AFTER UPDATE ON meeting_summaries
BEGIN
  UPDATE meeting_summaries SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_tasks_timestamp 
AFTER UPDATE ON project_tasks
BEGIN
  UPDATE project_tasks SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER update_sync_state_timestamp 
AFTER UPDATE ON fireflies_sync_state
BEGIN
  UPDATE fireflies_sync_state SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;