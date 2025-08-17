CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  database_id TEXT NOT NULL,          -- <-- renamed from account_id
  title TEXT NOT NULL,
  status_id TEXT,
  status_name TEXT,
  client_id TEXT,
  company_id TEXT,
  priority INTEGER,
  start_date TEXT,
  due_date TEXT,
  updated_at INTEGER DEFAULT (unixepoch('now')*1000) NOT NULL,
  updated_by TEXT,
  version INTEGER DEFAULT 0 NOT NULL,
  deleted_at INTEGER
);

CREATE TABLE IF NOT EXISTS notion_pages (
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  notion_page_id TEXT PRIMARY KEY,
  notion_db_id TEXT NOT NULL,
  last_seen INTEGER
);

CREATE TABLE IF NOT EXISTS outbox (
  id TEXT PRIMARY KEY,
  entity TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  op TEXT NOT NULL,
  payload TEXT NOT NULL,
  origin TEXT NOT NULL,
  attempt INTEGER NOT NULL DEFAULT 0,
  next_attempt_at INTEGER,
  created_at INTEGER NOT NULL DEFAULT (unixepoch('now')*1000)
);

CREATE INDEX IF NOT EXISTS idx_projects_database ON projects(database_id);
CREATE INDEX IF NOT EXISTS idx_projects_updated ON projects(updated_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_notion_map ON notion_pages(entity, entity_id);