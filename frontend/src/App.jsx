import { useState, useEffect } from 'react'

const API_URL = '/api/todos'

function App() {
  const [todos, setTodos] = useState([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [priority, setPriority] = useState('medium')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedTodos, setSelectedTodos] = useState(new Set())
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode')
    return saved ? JSON.parse(saved) : false
  })

  // Save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode))
  }, [darkMode])

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

  const priorityColorsDark = {
    low: { bg: '#14532d', border: '#22c55e', text: '#86efac' },
    medium: { bg: '#78350f', border: '#f59e0b', text: '#fcd34d' },
    high: { bg: '#7f1d1d', border: '#ef4444', text: '#fca5a5' }
  }

  const colors = darkMode ? {
    bg: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)',
    header: 'rgba(30, 41, 59, 0.8)',
    statBg: 'rgba(51, 65, 85, 0.9)',
    statActive: '#78350f',
    statCompleted: '#14532d',
    statNumber: '#f1f5f9',
    statLabel: '#94a3b8',
    formBg: '#1e293b',
    inputBg: '#334155',
    inputBorder: '#475569',
    inputText: '#f1f5f9',
    inputPlaceholder: '#94a3b8',
    cardBg: '#1e293b',
    cardText: '#f1f5f9',
    cardTextMuted: '#94a3b8',
    toolbarBg: 'rgba(51, 65, 85, 0.3)',
    searchBg: '#334155',
    filterBtn: 'rgba(255,255,255,0.1)',
    filterBtnActive: '#3b82f6',
    emptyBg: 'rgba(51, 65, 85, 0.5)',
    modalBg: '#1e293b',
    modalText: '#f1f5f9',
    footer: 'rgba(148, 163, 184, 0.7)'
  } : {
    bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    header: 'rgba(255,255,255,0.15)',
    statBg: 'rgba(255,255,255,0.95)',
    statActive: '#fef3c7',
    statCompleted: '#dcfce7',
    statNumber: '#1f2937',
    statLabel: '#6b7280',
    formBg: 'white',
    inputBg: 'white',
    inputBorder: '#e5e7eb',
    inputText: '#1f2937',
    inputPlaceholder: '#9ca3af',
    cardBg: 'white',
    cardText: '#1f2937',
    cardTextMuted: '#6b7280',
    toolbarBg: 'rgba(255,255,255,0.2)',
    searchBg: 'white',
    filterBtn: 'transparent',
    filterBtnActive: 'white',
    emptyBg: 'rgba(255,255,255,0.15)',
    modalBg: 'white',
    modalText: '#1f2937',
    footer: 'rgba(255,255,255,0.7)'
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
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={styles.themeToggle}
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </header>

      {/* Stats */}
      <div style={styles.stats}>
        <div style={{...styles.statCard, background: colors.statBg}}>
          <span style={{...styles.statNumber, color: colors.statNumber}}>{stats.total}</span>
          <span style={{...styles.statLabel, color: colors.statLabel}}>Total</span>
        </div>
        <div style={{...styles.statCard, background: colors.statActive}}>
          <span style={{...styles.statNumber, color: colors.statNumber}}>{stats.active}</span>
          <span style={{...styles.statLabel, color: colors.statLabel}}>Active</span>
        </div>
        <div style={{...styles.statCard, background: colors.statCompleted}}>
          <span style={{...styles.statNumber, color: colors.statNumber}}>{stats.completed}</span>
          <span style={{...styles.statLabel, color: colors.statLabel}}>Completed</span>
        </div>
      </div>

      {error && (
        <div style={styles.error}>
          <span>⚠️</span> {error}
          <button onClick={() => setError(null)} style={styles.errorClose}>×</button>
        </div>
      )}

      {/* Add Form */}
      <form onSubmit={addTodo} style={{...styles.form, background: colors.formBg}}>
        <div style={styles.formRow}>
          <input
            type="text"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{
              ...styles.input,
              background: colors.inputBg,
              borderColor: colors.inputBorder,
              color: colors.inputText
            }}
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
            style={{
              ...styles.input,
              ...styles.inputDesc,
              background: colors.inputBg,
              borderColor: colors.inputBorder,
              color: colors.inputText
            }}
          />
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            style={{
              ...styles.select,
              background: colors.inputBg,
              borderColor: colors.inputBorder,
              color: colors.inputText
            }}
          >
            <option value="low">🟢 Low</option>
            <option value="medium">🟡 Medium</option>
            <option value="high">🔴 High</option>
          </select>
        </div>
      </form>

      {/* Filters & Search */}
      <div style={styles.toolbar}>
        <div style={{...styles.filterGroup, background: colors.toolbarBg}}>
          <button
            onClick={() => setFilter('all')}
            style={{
              ...styles.filterBtn,
              background: filter === 'all' ? colors.filterBtnActive : colors.filterBtn,
              color: filter === 'all' && !darkMode ? '#667eea' : 'white'
            }}
          >
            All
          </button>
          <button
            onClick={() => setFilter('active')}
            style={{
              ...styles.filterBtn,
              background: filter === 'active' ? colors.filterBtnActive : colors.filterBtn,
              color: filter === 'active' && !darkMode ? '#667eea' : 'white'
            }}
          >
            Active
          </button>
          <button
            onClick={() => setFilter('completed')}
            style={{
              ...styles.filterBtn,
              background: filter === 'completed' ? colors.filterBtnActive : colors.filterBtn,
              color: filter === 'completed' && !darkMode ? '#667eea' : 'white'
            }}
          >
            Completed
          </button>
        </div>
        <div style={{...styles.searchBox, background: colors.searchBg}}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              ...styles.searchInput,
              color: colors.inputText
            }}
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
          <div style={{...styles.emptyState, background: colors.emptyBg}}>
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
                  background: todo.completed ? (darkMode ? '#0f172a' : '#f9fafb') : colors.cardBg,
                  borderLeft: `4px solid ${darkMode ? priorityColorsDark[todo.priority].border : priorityColors[todo.priority].border}`,
                  color: colors.cardText
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
                    color: todo.completed ? (darkMode ? '#475569' : '#9ca3af') : colors.cardText
                  }}>
                    {todo.title}
                  </span>
                  {todo.description && (
                    <span style={{...styles.todoDesc, color: colors.cardTextMuted}}>
                      {todo.description}
                    </span>
                  )}
                  <div style={styles.todoMeta}>
                    <span style={{
                      ...styles.priorityBadge,
                      background: (darkMode ? priorityColorsDark : priorityColors)[todo.priority].bg,
                      color: (darkMode ? priorityColorsDark : priorityColors)[todo.priority].text
                    }}>
                      {todo.priority}
                    </span>
                    <span style={{...styles.date, color: colors.cardTextMuted}}>
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
          <div style={{...styles.modal, background: colors.modalBg}}>
            <h3 style={{...styles.modalTitle, color: colors.modalText}}>Delete {selectedTodos.size} task(s)?</h3>
            <p style={{...styles.modalText, color: colors.cardTextMuted}}>This action cannot be undone.</p>
            <div style={styles.modalActions}>
              <button onClick={() => setShowDeleteConfirm(false)} style={styles.modalCancel}>
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
      <footer style={{...styles.footer, color: colors.footer}}>
        <span>Made with ❤️ using OpenClaw</span>
      </footer>
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    padding: '20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    transition: 'background 0.3s ease'
  },
  header: {
    backdropFilter: 'blur(10px)',
    borderRadius: '16px',
    padding: '24px',
    marginBottom: '20px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
    position: 'relative'
  },
  headerContent: {
    textAlign: 'center'
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
  themeToggle: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    borderRadius: '50%',
    width: '44px',
    height: '44px',
    fontSize: '22px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    backdropFilter: 'blur(5px)'
  },
  stats: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '20px'
  },
  statCard: {
    borderRadius: '12px',
    padding: '16px',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    transition: 'background 0.3s ease'
  },
  statNumber: {
    display: 'block',
    fontSize: '32px',
    fontWeight: '700',
    transition: 'color 0.3s ease'
  },
  statLabel: {
    display: 'block',
    fontSize: '14px',
    marginTop: '4px',
    transition: 'color 0.3s ease'
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
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    transition: 'background 0.3s ease'
  },
  formRow: {
    display: 'flex',
    gap: '12px',
    marginBottom: '12px'
  },
  input: {
    flex: '1',
    padding: '14px 18px',
    border: '2px solid',
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
    border: '2px solid',
    borderRadius: '10px',
    fontSize: '16px',
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
    padding: '6px',
    borderRadius: '10px',
    transition: 'background 0.3s ease'
  },
  filterBtn: {
    padding: '10px 18px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  searchBox: {
    display: 'flex',
    alignItems: 'center',
    borderRadius: '10px',
    padding: '8px 14px',
    gap: '8px',
    transition: 'background 0.3s ease'
  },
  searchIcon: {
    fontSize: '18px'
  },
  searchInput: {
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    width: '200px',
    background: 'transparent'
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
    marginBottom: '4px',
    transition: 'color 0.2s'
  },
  todoDesc: {
    display: 'block',
    fontSize: '14px',
    marginBottom: '8px',
    transition: 'color 0.2s'
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
    transition: 'color 0.2s'
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
    borderRadius: '16px',
    backdropFilter: 'blur(10px)',
    transition: 'background 0.3s ease'
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
    borderRadius: '16px',
    padding: '24px',
    maxWidth: '400px',
    width: '90%',
    textAlign: 'center',
    transition: 'background 0.3s ease'
  },
  modalTitle: {
    margin: '0 0 12px 0',
    fontSize: '20px',
    transition: 'color 0.3s ease'
  },
  modalText: {
    margin: '0 0 24px 0',
    transition: 'color 0.3s ease'
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
    fontSize: '14px',
    transition: 'color 0.3s ease'
  },
  loader: {
    textAlign: 'center',
    padding: '60px 20px'
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
