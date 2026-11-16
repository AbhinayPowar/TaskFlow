# TaskFlow — React + Node.js + SQLite

A full-stack task manager: add, edit, complete, filter and delete tasks. Every change is saved in a database.

## How the three parts fit together

```
 Browser (React)  ──HTTP/JSON──▶  Node.js + Express  ──SQL──▶  SQLite (tasks.db)
   client/                          server/index.js              server/db.js
```

1. **React (frontend, `client/`)** draws the page. When you click "Add task", it calls `fetch('/api/tasks')`.
2. **Node.js + Express (backend, `server/index.js`)** receives that request, checks the data, and runs a SQL query.
3. **SQLite (database, `server/db.js`)** stores the rows in one file, `server/tasks.db`. It uses Node's built-in `node:sqlite`, so there is no database server to install.

## Requirements

- Node.js **22.5 or newer** (check with `node -v`). Download from https://nodejs.org

## Run it (development mode — two terminals)

**Terminal 1 — backend**
```bash
cd server
npm install
npm run dev
```
You should see `✅ Server running at http://localhost:5000`.
(An "ExperimentalWarning: SQLite" message is normal.)

**Terminal 2 — frontend**
```bash
cd client
npm install
npm run dev
```
Open **http://localhost:5173** in your browser.

## Run it (single server)

```bash
cd client && npm install && npm run build
cd ../server && npm install && npm start
```
Open **http://localhost:5000** — Express now serves the built React app and the API together.

## API endpoints (REST)

| Method | URL                           | What it does        | SQL used |
|--------|-------------------------------|---------------------|----------|
| GET    | `/api/tasks?filter=all`       | List tasks (`all`, `active`, `done`) | SELECT |
| GET    | `/api/stats`                  | Total / active / done counts | SELECT COUNT |
| POST   | `/api/tasks`                  | Create a task       | INSERT |
| PUT    | `/api/tasks/:id`              | Update a task       | UPDATE |
| DELETE | `/api/tasks/:id`              | Delete a task       | DELETE |

These four operations — **C**reate, **R**ead, **U**pdate, **D**elete — are called **CRUD**, the core of almost every web app.

## Project structure

```
taskflow/
├── server/
│   ├── index.js        # Express routes (the API)
│   ├── db.js           # Database connection + table creation
│   └── package.json
└── client/
    ├── index.html
    ├── vite.config.js  # Forwards /api calls to port 5000 during development
    └── src/
        ├── main.jsx            # Starts React
        ├── App.jsx             # Main page: state, loading data, layout
        ├── api.js              # All fetch() calls to the backend
        ├── styles.css
        └── components/
            ├── TaskForm.jsx    # The "New task" form
            └── TaskItem.jsx    # One task row (complete / edit / delete)
```

## Want MongoDB or MySQL instead?

Only `server/db.js` and the queries in `server/index.js` change — the React side stays exactly the same, because it only talks to the API.
