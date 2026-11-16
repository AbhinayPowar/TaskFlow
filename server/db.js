// db.js — sets up the SQLite database.
// We use Node's built-in "node:sqlite" module, so there is nothing extra to install.
// The whole database lives in one file: tasks.db (created automatically).

import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const db = new DatabaseSync(path.join(__dirname, 'tasks.db'));

// Create the table the first time the server runs.
db.exec(`
  CREATE TABLE IF NOT EXISTS tasks (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT    NOT NULL,
    description TEXT    DEFAULT '',
    priority    TEXT    DEFAULT 'medium' CHECK (priority IN ('low','medium','high')),
    completed   INTEGER DEFAULT 0,
    created_at  TEXT    DEFAULT (datetime('now'))
  )
`);

// Add a few sample rows so the page isn't empty on first launch.
const { count } = db.prepare('SELECT COUNT(*) AS count FROM tasks').get();
if (count === 0) {
  const insert = db.prepare('INSERT INTO tasks (title, description, priority) VALUES (?, ?, ?)');
  insert.run('Learn React components', 'Understand props and state', 'high');
  insert.run('Build an Express API', 'GET, POST, PUT, DELETE routes', 'medium');
  insert.run('Practice SQL queries', 'SELECT, INSERT, UPDATE, DELETE', 'low');
}

export default db;
