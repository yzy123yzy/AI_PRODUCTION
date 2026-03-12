import { useState, useEffect } from 'react'

const API_URL = '/api/todos'

function App() {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch todos
  const fetchTodos = async () => {
    try {
      const res = await fetch(API_URL)
      if (!res.ok) throw new Error('Failed to fetch')
      const data = await res.json()
      setTodos(data)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTodos()
  }, [])

  // Add todo
  const addTodo = async (e) => {
    e.preventDefault()
    if (!title.trim()) return

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, priority })
      })
      if (!res.ok) throw new Error('Failed to add')
      await fetchTodos()
      setTitle('')
      setDescription('')
      setPriority('medium')
    } catch (err) {
      setError(err.message)
    }
  }

  // Toggle complete
  const toggleTodo = async (id, completed) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: !completed })
      })
      if (!res.ok) throw new Error('Failed to update')
      fetchTodos()
    } catch (err) {
      setError(err.message)
    }
  }

  // Delete todo
  const deleteTodo = async (id) => {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE'
      })
      if (!res.ok) throw new Error('Failed to delete')
      fetchTodos()
    } catch (err) {
      setError(err.message)
    }
  }

  const priorityColors = {
    low: '#4caf50',
    medium: '#ff9800',
    high: '#f44336'
  }

  if (loading) return <div style={styles.center}>Loading...</div>

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>📝 Todo App</h1>
      
      {error && <div style={styles.error}>Error: {error}</div>}
      
      {/* Add Form */}
      <form onSubmit={addTodo} style={styles.form}>
        <input
          type="text"
          placeholder="What needs to be done?"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="text"
          placeholder="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={styles.input}
        />
        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          style={styles.select}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
        <button type="submit" style={styles.button}>Add</button>
      </form>

      {/* Todo List */}
      <div style={styles.list}>
        {todos.length === 0 ? (
          <p style={styles.empty}>No todos yet. Add one above!</p>
        ) : (
          todos.map(todo => (
            <div
              key={todo.id}
              style={{
                ...styles.todo,
                opacity: todo.completed ? 0.6 : 1,
                borderLeft: `4px solid ${priorityColors[todo.priority]}`
              }}
            >
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={() => toggleTodo(todo.id, todo.completed)}
                style={styles.checkbox}
              />
              <div style={styles.todoContent}>
                <span style={{
                  ...styles.todoTitle,
                  textDecoration: todo.completed ? 'line-through' : 'none'
                }}>
                  {todo.title}
                </span>
                {todo.description && (
                  <span style={styles.todoDesc}>{todo.description}</span>
                )}
                <span style={styles.todoMeta}>
                  <span style={styles.priority}>{todo.priority}</span>
                  <span>{new Date(todo.createdAt).toLocaleDateString()}</span>
                </span>
              </div>
              <button
                onClick={() => deleteTodo(todo.id)}
                style={styles.deleteBtn}
              >
                🗑️
              </button>
            </div>
          ))
        )}
      </div>

      <div style={styles.footer}>
        {todos.filter(t => !t.completed).length} remaining
      </div>
    </div>
  )
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '20px'
  },
  center: {
    textAlign: 'center',
    padding: '40px'
  },
  title: {
    textAlign: 'center',
    marginBottom: '20px',
    color: '#333'
  },
  error: {
    background: '#ffebee',
    color: '#c62828',
    padding: '10px',
    borderRadius: '4px',
    marginBottom: '15px'
  },
  form: {
    display: 'flex',
    gap: '10px',
    marginBottom: '20px',
    flexWrap: 'wrap'
  },
  input: {
    flex: '1',
    minWidth: '200px',
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px'
  },
  select: {
    padding: '12px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '16px',
    background: 'white'
  },
  button: {
    padding: '12px 24px',
    background: '#2196f3',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '16px',
    cursor: 'pointer'
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  todo: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '15px',
    background: 'white',
    borderRadius: '4px',
    boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
  },
  checkbox: {
    marginTop: '4px',
    width: '20px',
    height: '20px',
    cursor: 'pointer'
  },
  todoContent: {
    flex: '1'
  },
  todoTitle: {
    display: 'block',
    fontSize: '16px',
    marginBottom: '4px'
  },
  todoDesc: {
    display: 'block',
    fontSize: '14px',
    color: '#666',
    marginBottom: '6px'
  },
  todoMeta: {
    fontSize: '12px',
    color: '#999',
    display: 'flex',
    gap: '10px'
  },
  priority: {
    padding: '2px 6px',
    borderRadius: '3px',
    background: '#eee',
    textTransform: 'capitalize'
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '4px',
    opacity: 0.6
  },
  empty: {
    textAlign: 'center',
    color: '#999',
    padding: '40px'
  },
  footer: {
    textAlign: 'center',
    marginTop: '20px',
    color: '#999',
    fontSize: '14px'
  }
}

export default App
