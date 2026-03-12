const express = require('express');
const cors = require('cors');
const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3001;
const DB_PATH = process.env.DB_PATH || path.join(__dirname, '../data/todos.db');

// Middleware
app.use(cors());
app.use(express.json());

// Database
let db;

// Initialize database
async function initDB() {
  const SQL = await initSqlJs();
  
  // Load existing database or create new one
  try {
    if (fs.existsSync(DB_PATH)) {
      const fileBuffer = fs.readFileSync(DB_PATH);
      db = new SQL.Database(fileBuffer);
      console.log('📦 Loaded existing database');
    } else {
      db = new SQL.Database();
      console.log('📦 Created new database');
    }
  } catch (err) {
    console.error('Failed to load database, creating new one:', err.message);
    db = new SQL.Database();
  }
  
  // Create table
  db.run(`
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
  
  saveDB();
  console.log('🚀 Database initialized');
}

// Save database to file
function saveDB() {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
  } catch (err) {
    console.error('Failed to save database:', err.message);
  }
}

// Helper to convert rows to objects
function rowToObject(row) {
  return {
    id: row[0],
    title: row[1],
    description: row[2],
    completed: row[3] === 1,
    priority: row[4],
    createdAt: row[5],
    updatedAt: row[6]
  };
}

// Routes

// Get all todos
app.get('/api/todos', (req, res) => {
  try {
    const { completed, priority } = req.query;
    let query = 'SELECT * FROM todos WHERE 1=1';
    
    if (completed !== undefined) {
      query += ` AND completed = ${completed === 'true' ? 1 : 0}`;
    }
    
    if (priority) {
      query += ` AND priority = '${priority}'`;
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = db.exec(query);
    if (result.length === 0) {
      return res.json([]);
    }
    
    const columns = result[0].columns;
    const todos = result[0].values.map(row => {
      const obj = {};
      columns.forEach((col, i) => {
        if (col === 'completed') {
          obj[col] = row[i] === 1;
        } else {
          obj[col] = row[i];
        }
      });
      return obj;
    });
    
    res.json(todos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single todo
app.get('/api/todos/:id', (req, res) => {
  try {
    const result = db.exec(`SELECT * FROM todos WHERE id = ${req.params.id}`);
    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    const columns = result[0].columns;
    const row = result[0].values[0];
    const todo = {};
    columns.forEach((col, i) => {
      if (col === 'completed') {
        todo[col] = row[i] === 1;
      } else {
        todo[col] = row[i];
      }
    });
    
    res.json(todo);
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
    
    db.run(
      'INSERT INTO todos (title, description, priority) VALUES (?, ?, ?)',
      [title, description || '', priority || 'medium']
    );
    
    const result = db.exec('SELECT last_insert_rowid()');
    const id = result[0].values[0][0];
    
    saveDB();
    
    // Fetch the created todo
    const todoResult = db.exec(`SELECT * FROM todos WHERE id = ${id}`);
    const columns = todoResult[0].columns;
    const row = todoResult[0].values[0];
    const todo = {};
    columns.forEach((col, i) => {
      if (col === 'completed') {
        todo[col] = row[i] === 1;
      } else {
        todo[col] = row[i];
      }
    });
    
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update todo
app.put('/api/todos/:id', (req, res) => {
  try {
    const { title, description, completed, priority } = req.body;
    
    // Check if exists
    const checkResult = db.exec(`SELECT * FROM todos WHERE id = ${req.params.id}`);
    if (checkResult.length === 0 || checkResult[0].values.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    const columns = checkResult[0].columns;
    const currentRow = checkResult[0].values[0];
    const current = {};
    columns.forEach((col, i) => {
      if (col === 'completed') {
        current[col] = currentRow[i] === 1;
      } else {
        current[col] = currentRow[i];
      }
    });
    
    db.run(
      `UPDATE todos 
       SET title = ?, description = ?, completed = ?, priority = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [
        title !== undefined ? title : current.title,
        description !== undefined ? description : current.description,
        completed !== undefined ? (completed ? 1 : 0) : (current.completed ? 1 : 0),
        priority || current.priority,
        req.params.id
      ]
    );
    
    saveDB();
    
    // Fetch updated todo
    const result = db.exec(`SELECT * FROM todos WHERE id = ${req.params.id}`);
    const row = result[0].values[0];
    const updated = {};
    columns.forEach((col, i) => {
      if (col === 'completed') {
        updated[col] = row[i] === 1;
      } else {
        updated[col] = row[i];
      }
    });
    
    res.json(updated);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete todo
app.delete('/api/todos/:id', (req, res) => {
  try {
    // Check if exists
    const checkResult = db.exec(`SELECT * FROM todos WHERE id = ${req.params.id}`);
    if (checkResult.length === 0 || checkResult[0].values.length === 0) {
      return res.status(404).json({ error: 'Todo not found' });
    }
    
    db.run('DELETE FROM todos WHERE id = ?', [req.params.id]);
    saveDB();
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
initDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Todo API running on port ${PORT}`);
    console.log(`📦 Database: ${DB_PATH}`);
  });
});
