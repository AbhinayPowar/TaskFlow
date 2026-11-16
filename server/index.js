// index.js — the Node.js + Express backend (the "API").
// The React app sends HTTP requests here; this file talks to the database
// and sends JSON back.

import express from 'express';
import cors from 'cors';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import db from './db.js';

const app = express();
const PORT = process.env.PORT || 5000;
const __dirname = path.dirname(fileURLToPath(import.meta.url));

app.use(cors());          // allow the React dev server (port 5173) to call us
app.use(express.json());  // parse JSON request bodies into req.body

const PRIORITIES = ['low', 'medium', 'high'];
const toTask = (row) => ({ ...row, completed: Boolean(row.completed) });

// READ all tasks  →  GET /api/tasks?filter=all|active|done
app.get('/api/tasks', (req, res) => {
  const { filter = 'all' } = req.query;
  let sql = 'SELECT * FROM tasks';
  if (filter === 'active') sql += ' WHERE completed = 0';
  if (filter === 'done') sql += ' WHERE completed = 1';
  sql += ` ORDER BY completed ASC,
           CASE priority WHEN 'high' THEN 0 WHEN 'medium' THEN 1 ELSE 2 END,
           id DESC`;
  res.json(db.prepare(sql).all().map(toTask));
});

// Simple statistics  →  GET /api/stats
app.get('/api/stats', (req, res) => {
  const stats = db.prepare(`
    SELECT COUNT(*) AS total,
           COALESCE(SUM(completed), 0) AS done
    FROM tasks`).get();
  res.json({ total: stats.total, done: stats.done, active: stats.total - stats.done });
});

// CREATE a task  →  POST /api/tasks
app.post('/api/tasks', (req, res) => {
  const { title, description = '', priority = 'medium' } = req.body;
  if (!title || !title.trim()) return res.status(400).json({ error: 'Title is required' });
  if (!PRIORITIES.includes(priority)) return res.status(400).json({ error: 'Invalid priority' });

  const result = db
    .prepare('INSERT INTO tasks (title, description, priority) VALUES (?, ?, ?)')
    .run(title.trim(), description.trim(), priority);
  const task = db.prepare('SELECT * FROM tasks WHERE id = ?').get(result.lastInsertRowid);
  res.status(201).json(toTask(task));
});

// UPDATE a task  →  PUT /api/tasks/:id
app.put('/api/tasks/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id);
  if (!existing) return res.status(404).json({ error: 'Task not found' });

  const title = req.body.title ?? existing.title;
  const description = req.body.description ?? existing.description;
  const priority = req.body.priority ?? existing.priority;
  const completed = req.body.completed ?? Boolean(existing.completed);
  if (!String(title).trim()) return res.status(400).json({ error: 'Title is required' });
  if (!PRIORITIES.includes(priority)) return res.status(400).json({ error: 'Invalid priority' });

  db.prepare('UPDATE tasks SET title = ?, description = ?, priority = ?, completed = ? WHERE id = ?')
    .run(String(title).trim(), description, priority, completed ? 1 : 0, req.params.id);
  res.json(toTask(db.prepare('SELECT * FROM tasks WHERE id = ?').get(req.params.id)));
});

// DELETE a task  →  DELETE /api/tasks/:id
app.delete('/api/tasks/:id', (req, res) => {
  const result = db.prepare('DELETE FROM tasks WHERE id = ?').run(req.params.id);
  if (result.changes === 0) return res.status(404).json({ error: 'Task not found' });
  res.status(204).end();
});

// In production, also serve the built React app from ../client/dist
const clientDist = path.join(__dirname, '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get(/^\/(?!api).*/, (req, res) => res.sendFile(path.join(clientDist, 'index.html')));
}

app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));
