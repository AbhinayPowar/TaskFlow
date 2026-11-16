// api.js — all communication between React and the Node.js server lives here.
// fetch() sends an HTTP request; the server replies with JSON.

const BASE = '/api';

async function request(path, options = {}) {
  const res = await fetch(BASE + path, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (res.status === 204) return null;
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export const api = {
  getTasks: (filter) => request(`/tasks?filter=${filter}`),
  getStats: () => request('/stats'),
  createTask: (task) => request('/tasks', { method: 'POST', body: JSON.stringify(task) }),
  updateTask: (id, changes) => request(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(changes) }),
  deleteTask: (id) => request(`/tasks/${id}`, { method: 'DELETE' }),
};
