// TaskForm.jsx — a "controlled form": each input's value lives in React state.

import { useState } from 'react';

export default function TaskForm({ onSubmit }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault(); // stop the browser from reloading the page
    if (!title.trim()) return;
    setSaving(true);
    await onSubmit({ title, description, priority });
    setTitle('');
    setDescription('');
    setPriority('medium');
    setSaving(false);
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <label>
        Title
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Finish lab record" required />
      </label>
      <label>
        Description
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Optional details" rows={3} />
      </label>
      <fieldset className="priority">
        <legend>Priority</legend>
        {['low', 'medium', 'high'].map((p) => (
          <label key={p} className={`chip ${p} ${priority === p ? 'selected' : ''}`}>
            <input type="radio" name="priority" value={p} checked={priority === p} onChange={() => setPriority(p)} />
            {p}
          </label>
        ))}
      </fieldset>
      <button className="primary" type="submit" disabled={saving}>
        {saving ? 'Saving…' : 'Add task'}
      </button>
    </form>
  );
}
