-- First, let's drop the existing meetings table with wrong schema
DROP TABLE IF EXISTS meetings;

-- Create meetings table with production schema
CREATE TABLE IF NOT EXISTS meetings (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  duration INTEGER,
  participants TEXT,
  fireflies_id TEXT,
  summary TEXT,
  autorag_doc_ids TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  project TEXT,
  category TEXT,
  priority TEXT,
  status TEXT,
  meeting_type TEXT,
  action_items TEXT,
  decisions TEXT,
  keywords TEXT,
  tags TEXT,
  department TEXT,
  client TEXT,
  word_count INTEGER,
  searchable_text TEXT,
  follow_up_required BOOLEAN DEFAULT FALSE,
  vector_processed BOOLEAN DEFAULT FALSE,
  insight_generated BOOLEAN DEFAULT FALSE,
  transcript_url TEXT,
  date_time DATETIME,
  organizer_email TEXT,
  attendees TEXT,
  meeting_url TEXT,
  transcript_downloaded BOOLEAN DEFAULT 0,
  processed_at DATETIME,
  r2_key TEXT,
  transcript_preview TEXT,
  updated_at DATETIME
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(date);
CREATE INDEX IF NOT EXISTS idx_meetings_client ON meetings(client);
CREATE INDEX IF NOT EXISTS idx_meetings_project ON meetings(project);