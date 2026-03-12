# 📝 Todo App

A modern, full-stack todo application with beautiful UI, powerful features, and Docker deployment.

![Todo App](https://img.shields.io/badge/React-18-61dafb?logo=react)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js)
![SQLite](https://img.shields.io/badge/SQLite-3-003b57?logo=sqlite)
![Docker](https://img.shields.io/badge/Docker-✅-2496ed?logo=docker)

## ✨ Features

### 🎯 Core Features
- ✅ Create, read, update, delete tasks
- 🏷️ Priority levels (Low, Medium, High)
- ✅ Mark tasks as complete/incomplete
- 📅 Automatic timestamps

### 🔍 Smart Organization
- 🔎 **Search** - Find tasks by title or description
- 📊 **Filters** - View All, Active, or Completed tasks
- 📈 **Statistics** - Real-time task counts

### ⚡ Bulk Operations
- ✓ **Multi-select** - Select multiple tasks
- ✅ **Bulk complete** - Mark multiple as done
- 🗑️ **Bulk delete** - Remove multiple at once
- ⚠️ **Confirmation** - Delete confirmation modal

### 🎨 Modern UI
- 🌈 Gradient background
- 💫 Smooth animations
- 📱 Responsive design
- 🎯 Intuitive interactions
- 🌓 Empty states with context

## 🛠️ Tech Stack

**Frontend:**
- React 18 with Hooks
- Vite (Lightning-fast HMR)
- Pure CSS (no external UI libraries)

**Backend:**
- Node.js 20+
- Express.js
- sql.js (SQLite in memory)
- CORS enabled

**DevOps:**
- Docker & Docker Compose
- GitHub Actions CI/CD

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- Docker (optional, for containerized deployment)

### Local Development

```bash
# Clone the repository
git clone https://github.com/yzy123yzy/AI_PRODUCTION.git
cd AI_PRODUCTION

# Install and start backend
cd backend
npm install
npm start

# In another terminal, install and start frontend
cd frontend
npm install
npm run dev
```

**Access:**
- Frontend: http://localhost:3000 (or next available port)
- Backend API: http://localhost:3001
- Health check: http://localhost:3001/api/health

### Docker Deployment

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 📡 API Reference

### Get all todos
```bash
GET /api/todos
# Query params: ?completed=true&priority=high
```

### Get single todo
```bash
GET /api/todos/:id
```

### Create todo
```bash
POST /api/todos
Content-Type: application/json

{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "priority": "high"
}
```

### Update todo
```bash
PUT /api/todos/:id
Content-Type: application/json

{
  "title": "Updated title",
  "completed": true,
  "priority": "medium"
}
```

### Delete todo
```bash
DELETE /api/todos/:id
```

### Health check
```bash
GET /api/health
```

## 📁 Project Structure

```
todo-app/
├── backend/
│   ├── src/
│   │   └── server.js      # Express API with sql.js
│   ├── package.json
│   ├── package-lock.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── main.jsx       # React entry
│   │   └── App.jsx        # Main component with full UI
│   ├── index.html
│   ├── package.json
│   ├── package-lock.json
│   ├── vite.config.js
│   └── Dockerfile
├── .github/
│   └── workflows/
│       └── ci.yml         # CI/CD pipeline
├── docker-compose.yml
├── .gitignore
└── README.md
```

## 🔄 CI/CD

GitHub Actions workflow runs on every push/PR:

1. **Test** - Node.js 18 & 20 compatibility
2. **Build Docker** - Build and test container images
3. **Deploy** - Auto-deploy notification on main branch

## 🎨 UI Preview

### Statistics Panel
- Total tasks count
- Active tasks (yellow highlight)
- Completed tasks (green highlight)

### Task Card
- Priority color indicator (🟢 Low, 🟡 Medium, 🔴 High)
- Checkbox for quick completion
- Selection checkbox for bulk ops
- Title and description
- Priority badge and timestamp
- Delete button

### Toolbar
- Filter buttons (All/Active/Completed)
- Search box with icon
- Bulk action bar (when items selected)

## 🔧 Configuration

### Environment Variables

**Backend:**
- `PORT` - API port (default: 3001)
- `DB_PATH` - SQLite database path
- `NODE_ENV` - Environment mode

**Frontend:**
- Handled by Vite proxy in development

## 🧪 Testing

```bash
# Test API
curl http://localhost:3001/api/health
curl http://localhost:3001/api/todos

# Test with sample data
curl -X POST http://localhost:3001/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Test","priority":"high"}'
```

## 📝 License

MIT

---

**Built with ❤️ using OpenClaw**

[View on GitHub](https://github.com/yzy123yzy/AI_PRODUCTION)
