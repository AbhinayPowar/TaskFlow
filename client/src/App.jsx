// App.jsx — the main React component.
// "State" (useState) holds data that, when changed, makes React re-draw the page.
// "Effects" (useEffect) run code after rendering — here, loading data from the server.

import { useEffect, useState, useCallback } from 'react';
import { api } from './api.js';
import TaskForm from './components/TaskForm.jsx';
import TaskItem from './components/TaskItem.jsx';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'done', label: 'Done' },
];

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, done: 0, active: 0 });
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Load tasks + stats from the backend
  const load = useCallback(async () => {
    try {
      setError('');
      const [t, s] = await Promise.all([api.getTasks(filter), api.getStats()]);
      setTasks(t);
      setStats(s);
    } catch (e) {
      setError('Could not reach the server. Is it running on port 5000?');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async (task) => { await api.createTask(task); load(); };
  const handleToggle = async (task) => { await api.updateTask(task.id, { completed: !task.completed }); load(); };
  const handleEdit = async (id, changes) => { await api.updateTask(id, changes); load(); };
  const handleDelete = async (id) => { await api.deleteTask(id); load(); };

  const percent = stats.total ? Math.round((stats.done / stats.total) * 100) : 0;

  return (
    <div className="page">
      <header className="hero">
        <div>
          <p className="eyebrow">React · Node.js · SQLite</p>
          <h1>TaskFlow</h1>
          <p className="subtitle">A full-stack task manager. Every change is saved to a real database.</p>
        </div>
        <div className="stats">
          <div className="stat"><span>{stats.total}</span>Total</div>
          <div className="stat"><span>{stats.active}</span>Active</div>
          <div className="stat"><span>{stats.done}</span>Done</div>
        </div>
      </header>

      <div className="progress" aria-label={`${percent}% complete`}>
        <div className="progress-bar" style={{ width: `${percent}%` }} />
        <span className="progress-label">{percent}% complete</span>
      </div>

      <main className="layout">
        <section className="card">
          <h2>New task</h2>
          <TaskForm onSubmit={handleCreate} />
        </section>

        <section className="card">
          <div className="list-header">
            <h2>Your tasks</h2>
            <div className="tabs" role="tablist">
              {FILTERS.map((f) => (
                <button
                  key={f.key}
                  role="tab"
                  aria-selected={filter === f.key}
                  className={filter === f.key ? 'tab active' : 'tab'}
                  onClick={() => setFilter(f.key)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="error">{error}</p>}
          {loading ? (
            <p className="muted">Loading…</p>
          ) : tasks.length === 0 ? (
            <p className="muted empty">Nothing here yet. Add a task to get started.</p>
          ) : (
            <ul className="task-list">
              {tasks.map((t) => (
                <TaskItem key={t.id} task={t} onToggle={handleToggle} onEdit={handleEdit} onDelete={handleDelete} />
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
