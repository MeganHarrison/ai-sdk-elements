CREATE TABLE IF NOT EXISTS meetings (
  id TEXT PRIMARY KEY,
  database_id TEXT NOT NULL,
  title TEXT NOT NULL,
  type TEXT,
  status TEXT,
  date TEXT,
  time TEXT,
  duration INTEGER,
  location TEXT,
  organizer TEXT,
  attendees TEXT,
  agenda TEXT,
  notes TEXT,
  action_items TEXT,
  recording_url TEXT,
  updated_at INTEGER DEFAULT (unixepoch('now')*1000) NOT NULL,
  updated_by TEXT,
  version INTEGER DEFAULT 0 NOT NULL,
  deleted_at INTEGER
);

CREATE INDEX IF NOT EXISTS idx_meetings_database ON meetings(database_id);
CREATE INDEX IF NOT EXISTS idx_meetings_updated ON meetings(updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_meetings_date ON meetings(date);