const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Database setup
const dbPath = process.env.DB_PATH || path.join(__dirname, '../data/todos.db');
const db = new Database(dbPath);

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS todos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    completed INTEGER DEFAULT 0,
    priority TEXT DEFAULT 'medium',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Helper to convert SQLite rows to plain objects
function rowToObject(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    completed: row.completed === 1,
    priority: row.priority,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

// Routes

// Get all todos
app.get('/api/todos', (req, res) => {
  try {
    const { completed, priority } = req.query;
    let query = 'SELECT * FROM todos WHERE 1=1';
    const params = [];
    
    if (completed !== undefined) {
      query += ' AND completed = ?';
      params.push(completed === 'true' ? 1 : 0);
    }
    
    if (priority) {
      query += ' AND priority = ?';
      params.push(priority);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const rows = db.prepare(query).all(...params);
    res.json(rows.map(rowToObject));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single todo
app.get('/api/todos/:id', (req, res) => {
  try {
    const row = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id);
    if (!row) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    res.json(rowToObject(row));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create todo
app.post('/api/todos', (req, res) => {
  try {
    const { title, description, priority } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }
    
    const stmt = db.prepare(`
      INSERT INTO todos (title, description, priority)
      VALUES (?, ?, ?)
    `);
    
    const result = stmt.run(title, description || '', priority || 'medium');
    const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(result.lastInsertRowid);
    
    res.status(201).json(rowToObject(todo));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update todo
app.put('/api/todos/:id', (req, res) => {
  try {
    const { title, description, completed, priority } = req.body;
    const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id);
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    const stmt = db.prepare(`
      UPDATE todos 
      SET title = ?, description = ?, completed = ?, priority = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(
      title !== undefined ? title : todo.title,
      description !== undefined ? description : todo.description,
      completed !== undefined ? (completed ? 1 : 0) : todo.completed,
      priority || todo.priority,
      req.params.id
    );
    
    const updated = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id);
    res.json(rowToObject(updated));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete todo
app.delete('/api/todos/:id', (req, res) => {
  try {
    const todo = db.prepare('SELECT * FROM todos WHERE id = ?').get(req.params.id);
    
    if (!todo) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    db.prepare('DELETE FROM todos WHERE id = ?').run(req.params.id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Todo API running on port ${PORT}`);
  console.log(`📦 Database: ${dbPath}`);
});
