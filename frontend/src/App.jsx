import { useState, useEffect } from 'react'

const API_URL = '/api/todos'

function App() {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all') // all, active, completed
  const [search, setSearch] = useState('')
  const [selectedTodos, setSelectedTodos] = useState(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

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
      setSelectedTodos(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    } catch (err) {
      setError(err.message)
    }
  }

  // Toggle selection
  const toggleSelection = (id) => {
    setSelectedTodos(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  // Select all visible
  const toggleSelectAll = () => {
    if (selectedTodos.size === filteredTodos.length) {
      setSelectedTodos(new Set())
    } else {
      setSelectedTodos(new Set(filteredTodos.map(t => t.id)))
    }
  }

  // Bulk delete
  const bulkDelete = async () => {
    try {
      await Promise.all(
        Array.from(selectedTodos).map(id =>
          fetch(`${API_URL}/${id}`, { method: 'DELETE' })
        )
      )
      fetchTodos()
      setSelectedTodos(new Set())
      setShowDeleteConfirm(false)
    } catch (err) {
      setError(err.message)
    }
  }

  // Bulk complete
  const bulkComplete = async () => {
    try {
      await Promise.all(
        Array.from(selectedTodos).map(id => {
          const todo = todos.find(t => t.id === id)
          return fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ completed: !todo.completed })
          })
        })
      )
      fetchTodos()
      setSelectedTodos(new Set())
    } catch (err) {
      setError(err.message)
    }
  }

  // Filter and search
  const filteredTodos = todos.filter(todo => {
    const matchesFilter = 
      filter === 'all' || 
      (filter === 'active' && !todo.completed) ||
      (filter === 'completed' && todo.completed)
    
    const matchesSearch = 
      !search || 
      todo.title.toLowerCase().includes(search.toLowerCase()) ||
      (todo.description && todo.description.toLowerCase().includes(search.toLowerCase()))
    
    return matchesFilter && matchesSearch
  })

  // Stats
  const stats = {
    total: todos.length,
    active: todos.filter(t => !t.completed).length,
    completed: todos.filter(t => t.completed).length
  }

  const priorityColors = {
    low: { bg: '#dcfce7', border: '#22c55e', text: '#166534' },
    medium: { bg: '#fef3c7', border: '#f59e0b', text: '#92400e' },
    high: { bg: '#fee2e2', border: '#ef4444', text: '#991b1b' }
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loader}>
          <div style={styles.spinner}></div>
          <p>Loading your tasks...</p>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>
            <span style={styles.emoji}>📝</span> Todo App
          </h1>
          <p style={styles.subtitle}>Stay organized, get things done</p>
        </div>
      </header>

      {/* Stats */}
      <div style={styles.stats}>
        <div style={styles.statCard}>
          <span style={styles.statNumber}>{stats.total}</span>
          <span style={styles.statLabel}>Total</span>
        </div>
        <div style={{...styles.statCard, ...styles.statActive}}>
          <span style={styles.statNumber}>{stats.active}</span>
          <span style={styles.statLabel}>Active</span>
        </div>
        <div style={{...styles.statCard, ...styles.statCompleted}}>
          <span style={styles.statNumber}>{stats.completed}</span>
          <span style={styles.statLabel}>Completed</span>
        </div>
      </div>

      {error && (
        <div style={styles.error}>
          <span>⚠️</span> {error}
          <button onClick={() => setError(null)} style={styles.errorClose}>×</button>
        </div>
      )}

      {/* Add Form */}
      <form onSubmit={addTodo} style={styles.form}>
        <div style={styles.formRow}>
          <input
            type="text"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={styles.input}
            required
          />
          <button type="submit" style={styles.addButton}>
            <span>➕</span> Add Task
          </button>
        </div>
        <div style={styles.formRow}>
          <input
            type="text"
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{...styles.input, ...styles.inputDesc}}
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            style={styles.select}
          >
            <option value="low">🟢 Low</option>
            <option value="medium">🟡 Medium</option>
            <option value="high">🔴 High</option>
          </select>
        </div>
      </form>

      {/* Filters & Search */}
      <div style={styles.toolbar}>
        <div style={styles.filterGroup}>
          <button
            onClick={() => setFilter('all')}
            style={{...styles.filterBtn, ...(filter === 'all' ? styles.filterBtnActive : {})}}
          >
            All
          </button>
          <button
            onClick={() => setFilter('active')}
            style={{...styles.filterBtn, ...(filter === 'active' ? styles.filterBtnActive : {})}}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('completed')}
            style={{...styles.filterBtn, ...(filter === 'completed' ? styles.filterBtnActive : {})}}
          >
            Completed
          </button>
        </div>
        <div style={styles.searchBox}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={styles.searchInput}
          />
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedTodos.size > 0 && (
        <div style={styles.bulkActions}>
          <span style={styles.selectedCount}>{selectedTodos.size} selected</span>
          <button onClick={bulkComplete} style={styles.bulkBtn}>
            {todos.filter(t => selectedTodos.has(t.id)).every(t => t.completed) ? '↩️ Mark Active' : '✅ Mark Complete'}
          </button>
          <button onClick={() => setShowDeleteConfirm(true)} style={{...styles.bulkBtn, ...styles.bulkBtnDanger}}>
            🗑️ Delete
          </button>
          <button onClick={() => setSelectedTodos(new Set())} style={styles.bulkBtnCancel}>
            Cancel
          </button>
        </div>
      )}

      {/* Todo List */}
      <div style={styles.list}>
        {filteredTodos.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyIcon}>
              {search ? '🔍' : filter === 'completed' ? '🎉' : '✨'}
            </div>
            <p style={styles.emptyText}>
              {search 
                ? 'No tasks match your search'
                : filter === 'completed'
                ? 'No completed tasks yet'
                : filter === 'active'
                ? 'All tasks completed! Great job!'
                : 'No tasks yet. Add one above!'}
            </p>
          </div>
        ) : (
          <>
            <div style={styles.listHeader}>
              <input
                type="checkbox"
                checked={selectedTodos.size === filteredTodos.length && filteredTodos.length > 0}
                onChange={toggleSelectAll}
                style={styles.selectAll}
              />
              <span style={styles.listHeaderText}>
                {filteredTodos.length} task{filteredTodos.length !== 1 ? 's' : ''}
              </span>
            </div>
            {filteredTodos.map(todo => (
              <div
                key={todo.id}
                style={{
                  ...styles.todo,
                  opacity: todo.completed ? 0.7 : 1,
                  borderLeft: `4px solid ${priorityColors[todo.priority].border}`,
                  background: todo.completed ? '#f9fafb' : 'white'
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedTodos.has(todo.id)}
                  onChange={() => toggleSelection(todo.id)}
                  style={styles.checkbox}
                />
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo(todo.id, todo.completed)}
                  style={styles.completeCheckbox}
                />
                <div style={styles.todoContent}>
                  <span style={{
                    ...styles.todoTitle,
                    textDecoration: todo.completed ? 'line-through' : 'none',
                    color: todo.completed ? '#9ca3af' : '#1f2937'
                  }}>
                    {todo.title}
                  </span>
                  {todo.description && (
                    <span style={styles.todoDesc}>{todo.description}</span>
                  )}
                  <div style={styles.todoMeta}>
                    <span style={{
                      ...styles.priorityBadge,
                      background: priorityColors[todo.priority].bg,
                      color: priorityColors[todo.priority].text
                    }}>
                      {todo.priority}
                    </span>
                    <span style={styles.date}>
                      {new Date(todo.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  style={styles.deleteBtn}
                  title="Delete task"
                >
                  🗑️
                </button>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3 style={styles.modalTitle}>Delete {selectedTodos.size} task(s)?</h3>
            <p style={styles.modalText}>This action cannot be undone.</p>
            <div style={styles.modalActions}>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                style={styles.modalCancel}
              >
                Cancel
              </button>
              <button onClick={bulkDelete} style={styles.modalDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer style={styles.footer}>
        <span>Made with ❤️ using OpenClaw</span>
      </footer>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
  },
  header: {
    background: 'rgba(255,255,255,0.15)',
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
  },
  headerContent: {
    textAlign: 'center',
    color: 'white'
  },
  title: {
    fontSize: '32px',
    fontWeight: '700',
    margin: '0 0 8px 0',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px'
  },
  emoji: {
    fontSize: '36px'
  },
  subtitle: {
    fontSize: '16px',
    opacity: 0.9,
    margin: 0
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '20px'
  },
  statCard: {
    background: 'rgba(255,255,255,0.95)',
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  statActive: {
    background: '#fef3c7'
  },
  statCompleted: {
    background: '#dcfce7'
  },
  statNumber: {
    display: 'block',
    fontSize: '32px',
    fontWeight: '700',
    color: '#1f2937'
  },
  statLabel: {
    display: 'block',
    fontSize: '14px',
    color: '#6b7280',
    marginTop: '4px'
  },
  error: {
    background: '#fee2e2',
    color: '#991b1b',
    padding: '12px 16px',
    borderRadius: '8px',
    marginBottom: '15px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  errorClose: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#991b1b',
    padding: '0 4px'
  },
  form: {
    background: 'white',
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
  },
  formRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '12px'
  },
  input: {
    flex: '1',
    padding: '14px 18px',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '16px',
    transition: 'all 0.2s',
    outline: 'none'
  },
  inputDesc: {
    flex: '2'
  },
  select: {
    padding: '14px 18px',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '16px',
    background: 'white',
    cursor: 'pointer',
    outline: 'none'
  },
  addButton: {
    padding: '14px 24px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'transform 0.2s, box-shadow 0.2s',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    flexWrap: 'wrap',
    gap: '12px'
  },
  filterGroup: {
    display: 'flex',
    gap: '8px',
    background: 'rgba(255,255,255,0.2)',
    padding: '6px',
    borderRadius: '10px'
  },
  filterBtn: {
    padding: '10px 18px',
    background: 'transparent',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  filterBtnActive: {
    background: 'white',
    color: '#667eea'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    background: 'white',
    borderRadius: '10px',
    padding: '8px 14px',
    gap: '8px'
  },
  searchIcon: {
    fontSize: '18px'
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    width: '200px'
  },
  bulkActions: {
    background: 'white',
    borderRadius: '10px',
    padding: '12px 16px',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  selectedCount: {
    fontWeight: '600',
    color: '#667eea'
  },
  bulkBtn: {
    padding: '8px 16px',
    background: '#f3f4f6',
    border: 'none',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  bulkBtnDanger: {
    background: '#fee2e2',
    color: '#991b1b'
  },
  bulkBtnCancel: {
    padding: '8px 16px',
    background: 'transparent',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    fontSize: '14px',
    cursor: 'pointer',
    marginLeft: 'auto'
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  listHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 0',
    color: 'rgba(255,255,255,0.8)',
    fontSize: '14px'
  },
  selectAll: {
    width: '18px',
    height: '18px',
    cursor: 'pointer'
  },
  listHeaderText: {
    flex: '1'
  },
  todo: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    padding: '16px',
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: 'all 0.2s'
  },
  checkbox: {
    width: '18px',
    height: '18px',
    marginTop: '2px',
    cursor: 'pointer'
  },
  completeCheckbox: {
    width: '22px',
    height: '22px',
    marginTop: '1px',
    cursor: 'pointer',
    accentColor: '#667eea'
  },
  todoContent: {
    flex: '1',
    minWidth: 0
  },
  todoTitle: {
    display: 'block',
    fontSize: '16px',
    fontWeight: '500',
    marginBottom: '4px'
  },
  todoDesc: {
    display: 'block',
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '8px'
  },
  todoMeta: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center'
  },
  priorityBadge: {
    padding: '3px 10px',
    borderRadius: '12px',
    fontSize: '12px',
    fontWeight: '600',
    textTransform: 'capitalize'
  },
  date: {
    fontSize: '12px',
    color: '#9ca3af'
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '4px',
    opacity: 0.5,
    transition: 'opacity 0.2s'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px',
    background: 'rgba(255,255,255,0.15)',
    borderRadius: '16px',
    backdropFilter: 'blur(10px)'
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px'
  },
  emptyText: {
    color: 'white',
    fontSize: '18px',
    margin: 0
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  modal: {
    background: 'white',
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '400px',
    width: '90%',
    textAlign: 'center'
  },
  modalTitle: {
    margin: '0 0 12px 0',
    fontSize: '20px',
    color: '#1f2937'
  },
  modalText: {
    margin: '0 0 24px 0',
    color: '#6b7280'
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'center'
  },
  modalCancel: {
    padding: '12px 24px',
    background: '#f3f4f6',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '500'
  },
  modalDelete: {
    padding: '12px 24px',
    background: '#ef4444',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '16px',
    cursor: 'pointer',
    fontWeight: '600'
  },
  footer: {
    textAlign: 'center',
    marginTop: '40px',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '14px'
  },
  loader: {
    textAlign: 'center',
    padding: '60px 20px',
    color: 'white'
  },
  spinner: {
    width: '50px',
    height: '50px',
    border: '4px solid rgba(255,255,255,0.3)',
    borderTop: '4px solid white',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 20px'
  }
}

export default App
