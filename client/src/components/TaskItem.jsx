// TaskItem.jsx — one row in the list. Supports complete, edit and delete.

import { useState } from 'react';

export default function TaskItem({ task, onToggle, onEdit, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [priority, setPriority] = useState(task.priority);

  const save = async () => {
    if (!title.trim()) return;
    await onEdit(task.id, { title, description, priority });
    setEditing(false);
  };

  if (editing) {
    return (
      <li className="task editing">
        <input value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Title" />
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} aria-label="Description" />
        <div className="row">
          <select value={priority} onChange={(e) => setPriority(e.target.value)} aria-label="Priority">
            <option value="low">low</option>
            <option value="medium">medium</option>
            <option value="high">high</option>
          </select>
          <div className="actions">
            <button className="ghost" onClick={() => setEditing(false)}>Cancel</button>
            <button className="primary small" onClick={save}>Save</button>
          </div>
        </div>
      </li>
    );
  }

  return (
    <li className={`task ${task.completed ? 'done' : ''}`}>
      <input
        type="checkbox"
        className="check"
        checked={task.completed}
        onChange={() => onToggle(task)}
        aria-label={`Mark "${task.title}" as ${task.completed ? 'not done' : 'done'}`}
      />
      <div className="task-body">
        <div className="task-title">
          {task.title}
          <span className={`badge ${task.priority}`}>{task.priority}</span>
        </div>
        {task.description && <p className="task-desc">{task.description}</p>}
        <p className="task-date">Added {new Date(task.created_at + 'Z').toLocaleString()}</p>
      </div>
      <div className="actions">
        <button className="ghost" onClick={() => setEditing(true)}>Edit</button>
        <button className="ghost danger" onClick={() => onDelete(task.id)}>Delete</button>
      </div>
    </li>
  );
}
