# 📝 Todo App

A full-stack todo application with React frontend, Node.js/Express backend, and Docker deployment.

## 🚀 Features

- ✅ Create, read, update, delete todos
- 🏷️ Priority levels (low, medium, high)
- ✅ Mark tasks as complete/incomplete
- 📅 Timestamps for creation and updates
- 🐳 Docker Compose for easy deployment
- 🔄 CI/CD with GitHub Actions

## 🛠️ Tech Stack

**Backend:**
- Node.js 20
- Express.js
- SQLite (better-sqlite3)
- CORS enabled

**Frontend:**
- React 18
- Vite (fast build tool)
- No external UI libraries (pure CSS)

**DevOps:**
- Docker & Docker Compose
- GitHub Actions CI/CD

## 📦 Quick Start

### Prerequisites
- Docker & Docker Compose
- OR Node.js 18+ for local development

### Docker (Recommended)

```bash
# Start all services
docker compose up -d

# View logs
docker compose logs -f

# Stop services
docker compose down

# Access:
# Frontend: http://localhost:3000
# Backend API: http://localhost:3001
# API Health: http://localhost:3001/api/health
```

### Local Development

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (in another terminal)
cd frontend
npm install
npm run dev

# Access:
# Frontend: http://localhost:5173
# Backend API: http://localhost:3001
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

## 🔄 CI/CD

The GitHub Actions workflow (`.github/workflows/ci.yml`) runs on every push/PR:

1. **Test Job**: Tests on Node.js 18 & 20
2. **Build Docker**: Builds and tests Docker images
3. **Deploy**: Runs only on main branch push

### Manual Deploy

```bash
# Pull latest images and restart
docker compose pull
docker compose up -d

# View deployment status
docker compose ps
```

## 📁 Project Structure

```
todo-app/
├── backend/
│   ├── src/
│   │   └── server.js      # Express API server
│   ├── package.json
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── main.jsx       # React entry point
│   │   └── App.jsx        # Main React component
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── Dockerfile
├── .github/
│   └── workflows/
│       └── ci.yml         # CI/CD pipeline
├── docker-compose.yml
└── README.md
```

## 🔧 Configuration

### Environment Variables

**Backend:**
- `PORT` - API port (default: 3001)
- `DB_PATH` - SQLite database path (default: `/app/data/todos.db`)
- `NODE_ENV` - Environment (development/production)

**Frontend:**
- `VITE_API_URL` - Backend API URL (handled by proxy in dev)

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Docker integration test
docker compose up -d
curl http://localhost:3001/api/health
docker compose down
```

## 📝 License

MIT

---

Built with ❤️ using OpenClaw
