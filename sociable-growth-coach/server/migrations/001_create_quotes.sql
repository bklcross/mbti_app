CREATE TABLE IF NOT EXISTS quotes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  quote_text TEXT NOT NULL,
  author TEXT,
  source_url TEXT,
  fetched_at TEXT NOT NULL
);
