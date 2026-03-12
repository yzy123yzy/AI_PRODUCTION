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
  const [showAddModal, setShowAddModal] = useState(false)
  const [showSearch, setShowSearch] = useState(false)

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
      setShowAddModal(false)
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
    bg: '#0f172a',
    header: '#1e293b',
    headerText: '#f1f5f9',
    cardBg: '#1e293b',
    cardText: '#f1f5f9',
    cardTextMuted: '#94a3b8',
    border: '#334155',
    inputBg: '#334155',
    inputText: '#f1f5f9',
    bottomNav: '#1e293b',
    modalBg: '#1e293b'
  } : {
    bg: '#f1f5f9',
    header: '#ffffff',
    headerText: '#1e293b',
    cardBg: '#ffffff',
    cardText: '#1e293b',
    cardTextMuted: '#64748b',
    border: '#e2e8f0',
    inputBg: '#ffffff',
    inputText: '#1e293b',
    bottomNav: '#ffffff',
    modalBg: '#ffffff'
  }

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loader}>
          <div style={styles.spinner}></div>
        </div>
      </div>
    )
  }

  return (
    <div style={styles.container}>
      {/* Status Bar */}
      <div style={styles.statusBar}>
        <span style={styles.statusTime}>
          {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </span>
        <div style={styles.statusIcons}>
          <span>📶</span>
          <span>🔋</span>
        </div>
      </div>

      {/* Header */}
      <header style={{...styles.header, background: colors.header}}>
        <div style={styles.headerLeft}>
          <h1 style={{...styles.headerTitle, color: colors.headerText}}>
            📝 Tasks
          </h1>
          <span style={{...styles.headerSubtitle, color: colors.cardTextMuted}}>
            {stats.active} pending
          </span>
        </div>
        <div style={styles.headerRight}>
          <button
            onClick={() => setShowSearch(!showSearch)}
            style={styles.headerBtn}
          >
            🔍
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            style={styles.headerBtn}
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {/* Search Bar */}
      {showSearch && (
        <div style={styles.searchBar}>
          <span style={styles.searchIcon}>🔍</span>
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{...styles.searchInput, background: colors.inputBg, color: colors.inputText}}
            autoFocus
          />
          {search && (
            <button onClick={() => setSearch('')} style={styles.searchClear}>×</button>
          )}
        </div>
      )}

      {/* Filter Tabs */}
      <div style={styles.filterTabs}>
        {['all', 'active', 'completed'].map(f => (
          <button
            key={f}
            onClick={() => { setFilter(f); setSearch(''); }}
            style={{
              ...styles.filterTab,
              background: filter === f ? '#667eea' : 'transparent',
              color: filter === f ? 'white' : colors.cardTextMuted
            }}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            {f === 'all' && ` (${stats.total})`}
            {f === 'active' && ` (${stats.active})`}
            {f === 'completed' && ` (${stats.completed})`}
          </button>
        ))}
      </div>

      {/* Content */}
      <div style={styles.content}>
        {error && (
          <div style={styles.error}>
            <span>⚠️</span> {error}
            <button onClick={() => setError(null)} style={styles.errorClose}>×</button>
          </div>
        )}

        {/* Bulk Actions */}
        {selectedTodos.size > 0 && (
          <div style={styles.bulkBar}>
            <span style={styles.bulkCount}>{selectedTodos.size} selected</span>
            <button onClick={bulkComplete} style={styles.bulkAction}>
              ✅
            </button>
            <button onClick={() => setShowDeleteConfirm(true)} style={styles.bulkAction}>
              🗑️
            </button>
            <button onClick={() => setSelectedTodos(new Set())} style={styles.bulkAction}>
              ✕
            </button>
          </div>
        )}

        {/* Task List */}
        <div style={styles.list}>
          {filteredTodos.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>
                {search ? '🔍' : filter === 'completed' ? '🎉' : '✨'}
              </div>
              <p style={styles.emptyText}>
                {search 
                  ? 'No matches found'
                  : filter === 'completed'
                  ? 'No completed tasks'
                  : filter === 'active'
                  ? 'All done! 🎉'
                  : 'No tasks yet'}
              </p>
            </div>
          ) : (
            filteredTodos.map(todo => (
              <div
                key={todo.id}
                style={{
                  ...styles.card,
                  background: colors.cardBg,
                  borderLeft: `4px solid ${darkMode ? priorityColorsDark[todo.priority].border : priorityColors[todo.priority].border}`
                }}
              >
                <div style={styles.cardLeft}>
                  <input
                    type="checkbox"
                    checked={selectedTodos.has(todo.id)}
                    onChange={() => toggleSelection(todo.id)}
                    style={styles.selectCheckbox}
                  />
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={() => toggleTodo(todo.id, todo.completed)}
                    style={{...styles.completeCheckbox, accentColor: '#667eea'}}
                  />
                </div>
                <div style={styles.cardContent}>
                  <span style={{
                    ...styles.cardTitle,
                    color: todo.completed ? colors.cardTextMuted : colors.cardText,
                    textDecoration: todo.completed ? 'line-through' : 'none'
                  }}>
                    {todo.title}
                  </span>
                  {todo.description && (
                    <span style={{...styles.cardDesc, color: colors.cardTextMuted}}>
                      {todo.description}
                    </span>
                  )}
                  <div style={styles.cardMeta}>
                    <span style={{
                      ...styles.priorityTag,
                      background: (darkMode ? priorityColorsDark : priorityColors)[todo.priority].bg,
                      color: (darkMode ? priorityColorsDark : priorityColors)[todo.priority].text
                    }}>
                      {todo.priority}
                    </span>
                    <span style={{color: colors.cardTextMuted, fontSize: '12px'}}>
                      {new Date(todo.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                  </div>
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
      </div>

      {/* Bottom Navigation */}
      <nav style={{...styles.bottomNav, background: colors.bottomNav, borderTop: `1px solid ${colors.border}`}}>
        <button style={styles.navItem}>
          <span style={styles.navIcon}>📊</span>
          <span style={{...styles.navLabel, color: colors.cardTextMuted}}>Stats</span>
        </button>
        <button
          onClick={() => setShowAddModal(true)}
          style={styles.addButton}
        >
          ➕
        </button>
        <button
          onClick={() => setDarkMode(!darkMode)}
          style={styles.navItem}
        >
          <span style={styles.navIcon}>{darkMode ? '☀️' : '🌙'}</span>
          <span style={{...styles.navLabel, color: colors.cardTextMuted}}>Theme</span>
        </button>
      </nav>

      {/* Add Task Modal */}
      {showAddModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <div style={styles.modalHeader}>
              <h2 style={{...styles.modalTitle, color: colors.cardText}}>New Task</h2>
              <button onClick={() => setShowAddModal(false)} style={styles.modalClose}>×</button>
            </div>
            <form onSubmit={addTodo}>
              <input
                type="text"
                placeholder="Task title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{...styles.modalInput, background: colors.inputBg, color: colors.inputText, borderColor: colors.border}}
                required
                autoFocus
              />
              <input
                type="text"
                placeholder="Description (optional)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                style={{...styles.modalInput, ...styles.modalTextarea, background: colors.inputBg, color: colors.inputText, borderColor: colors.border}}
              />
              <div style={styles.prioritySelector}>
                {['low', 'medium', 'high'].map(p => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPriority(p)}
                    style={{
                      ...styles.priorityOption,
                      background: priority === p ? '#667eea' : colors.inputBg,
                      color: priority === p ? 'white' : colors.cardText,
                      borderColor: priority === p ? '#667eea' : colors.border
                    }}
                  >
                    {p === 'low' && '🟢'}
                    {p === 'medium' && '🟡'}
                    {p === 'high' && '🔴'}
                    {' '}{p}
                  </button>
                ))}
              </div>
              <button type="submit" style={styles.submitBtn}>
                Create Task
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div style={styles.modalOverlay}>
          <div style={{...styles.modalContent, padding: '24px'}}>
            <h3 style={{...styles.modalTitle, color: colors.cardText}}>Delete {selectedTodos.size} task(s)?</h3>
            <p style={{...styles.modalDesc, color: colors.cardTextMuted}}>This cannot be undone.</p>
            <div style={styles.modalButtons}>
              <button onClick={() => setShowDeleteConfirm(false)} style={{...styles.modalBtn, background: colors.inputBg, color: colors.cardText}}>
                Cancel
              </button>
              <button onClick={bulkDelete} style={{...styles.modalBtn, ...styles.modalBtnDanger}}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const styles = {
  container: {
    minHeight: '100vh',
    maxWidth: '480px',
    margin: '0 auto',
    position: 'relative',
    overflow: 'hidden'
  },
  statusBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 16px',
    background: '#667eea',
    color: 'white',
    fontSize: '14px'
  },
  statusTime: {
    fontWeight: '500'
  },
  statusIcons: {
    display: 'flex',
    gap: '8px'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
    borderBottom: '1px solid #e2e8f0'
  },
  headerLeft: {
    flex: '1'
  },
  headerTitle: {
    margin: '0 0 4px 0',
    fontSize: '24px',
    fontWeight: '700'
  },
  headerSubtitle: {
    fontSize: '14px'
  },
  headerRight: {
    display: 'flex',
    gap: '12px'
  },
  headerBtn: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    padding: '8px'
  },
  searchBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 20px',
    borderBottom: '1px solid #e2e8f0'
  },
  searchIcon: {
    fontSize: '18px'
  },
  searchInput: {
    flex: '1',
    border: 'none',
    borderRadius: '8px',
    padding: '10px 14px',
    fontSize: '16px',
    outline: 'none'
  },
  searchClear: {
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#94a3b8'
  },
  filterTabs: {
    display: 'flex',
    background: '#f1f5f9',
    padding: '4px',
    gap: '4px'
  },
  filterTab: {
    flex: '1',
    padding: '10px',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  content: {
    flex: '1',
    overflowY: 'auto',
    paddingBottom: '80px'
  },
  error: {
    margin: '12px 20px',
    padding: '12px 16px',
    background: '#fee2e2',
    color: '#991b1b',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  errorClose: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    fontSize: '20px',
    cursor: 'pointer',
    color: '#991b1b'
  },
  bulkBar: {
    position: 'sticky',
    top: '0',
    margin: '12px 20px',
    padding: '12px 16px',
    background: '#667eea',
    color: 'white',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
    zIndex: '100'
  },
  bulkCount: {
    flex: '1',
    fontWeight: '600'
  },
  bulkAction: {
    background: 'rgba(255,255,255,0.2)',
    border: 'none',
    borderRadius: '8px',
    padding: '8px 12px',
    fontSize: '16px',
    cursor: 'pointer'
  },
  list: {
    padding: '12px 20px'
  },
  card: {
    display: 'flex',
    gap: '12px',
    padding: '16px',
    borderRadius: '12px',
    marginBottom: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
    transition: 'all 0.2s'
  },
  cardLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingTop: '2px'
  },
  selectCheckbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer'
  },
  completeCheckbox: {
    width: '22px',
    height: '22px',
    cursor: 'pointer'
  },
  cardContent: {
    flex: '1',
    minWidth: 0
  },
  cardTitle: {
    display: 'block',
    fontSize: '16px',
    fontWeight: '500',
    marginBottom: '4px'
  },
  cardDesc: {
    display: 'block',
    fontSize: '14px',
    marginBottom: '8px'
  },
  cardMeta: {
    display: 'flex',
    gap: '8px',
    alignItems: 'center'
  },
  priorityTag: {
    padding: '2px 8px',
    borderRadius: '6px',
    fontSize: '11px',
    fontWeight: '600',
    textTransform: 'capitalize'
  },
  deleteBtn: {
    background: 'none',
    border: 'none',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '8px',
    opacity: '0.5'
  },
  emptyState: {
    textAlign: 'center',
    padding: '60px 20px'
  },
  emptyIcon: {
    fontSize: '64px',
    marginBottom: '16px'
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: '16px',
    margin: 0
  },
  bottomNav: {
    position: 'fixed',
    bottom: '0',
    left: '50%',
    transform: 'translateX(-50%)',
    width: '100%',
    maxWidth: '480px',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
    padding: '12px 0',
    paddingBottom: 'calc(12px + env(safe-area-inset-bottom))',
    borderTop: '1px solid #e2e8f0'
  },
  navItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px 16px'
  },
  navIcon: {
    fontSize: '24px'
  },
  navLabel: {
    fontSize: '11px'
  },
  addButton: {
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    border: 'none',
    borderRadius: '50%',
    width: '56px',
    height: '56px',
    fontSize: '28px',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)',
    transform: 'translateY(-12px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  modalOverlay: {
    position: 'fixed',
    top: '0',
    left: '0',
    right: '0',
    bottom: '0',
    background: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'flex-end',
    zIndex: '1000'
  },
  modalContent: {
    background: 'white',
    width: '100%',
    maxWidth: '480px',
    margin: '0 auto',
    borderRadius: '20px 20px 0 0',
    padding: '24px'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px'
  },
  modalTitle: {
    margin: '0',
    fontSize: '20px',
    fontWeight: '600'
  },
  modalClose: {
    background: 'none',
    border: 'none',
    fontSize: '28px',
    cursor: 'pointer',
    color: '#94a3b8'
  },
  modalInput: {
    width: '100%',
    padding: '14px 16px',
    border: '2px solid',
    borderRadius: '12px',
    fontSize: '16px',
    marginBottom: '12px',
    outline: 'none',
    boxSizing: 'border-box'
  },
  modalTextarea: {
    minHeight: '80px',
    resize: 'vertical'
  },
  prioritySelector: {
    display: 'flex',
    gap: '8px',
    marginBottom: '20px'
  },
  priorityOption: {
    flex: '1',
    padding: '12px',
    border: '2px solid',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  submitBtn: {
    width: '100%',
    padding: '16px',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: '600',
    cursor: 'pointer'
  },
  modalDesc: {
    margin: '0 0 24px 0',
    fontSize: '14px'
  },
  modalButtons: {
    display: 'flex',
    gap: '12px'
  },
  modalBtn: {
    flex: '1',
    padding: '14px',
    border: 'none',
    borderRadius: '10px',
    fontSize: '16px',
    fontWeight: '500',
    cursor: 'pointer'
  },
  modalBtnDanger: {
    background: '#ef4444',
    color: 'white'
  },
  loader: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid #e2e8f0',
    borderTop: '4px solid #667eea',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  }
}

export default App
