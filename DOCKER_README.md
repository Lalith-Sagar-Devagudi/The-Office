# The Office - Docker Setup

This guide explains how to run both the frontend and backend using Docker with support for development hot reload.

## 🐳 Prerequisites

- [Docker](https://www.docker.com/get-started) installed on your system
- [Docker Compose](https://docs.docker.com/compose/install/) installed
- Make sure ports 3000 and 8001 are available on your system

## 🚀 Quick Start

### 🔥 Development Mode (Hot Reload) - Recommended for Development

For development with automatic file watching and hot reload:

1. **Navigate to the project root:**
   ```bash
   cd /path/to/The-Office
   ```

2. **Make sure your `.env` file is set up:**
   ```bash
   # backend/.env should contain:
   OPENAI_API_KEY=your_openai_api_key_here
   ```

3. **Start development mode:**
   ```bash
   ./run-docker-dev.sh
   ```

4. **Access the application:**
   - Frontend: http://localhost:3000 (with hot reload)
   - Backend API: http://localhost:8001 (with hot reload)

**Development Features:**
- ✅ **Backend Hot Reload**: Changes to Python files automatically restart the server
- ✅ **Frontend Hot Reload**: Changes to React files automatically refresh the browser
- ✅ **File Watching**: No need to rebuild containers for code changes
- ✅ **Live Logs**: See real-time logs from both services

### 🏭 Production Mode

For production deployment with optimized builds:

1. **Navigate to the project root:**
   ```bash
   cd /path/to/The-Office
   ```

2. **Start production mode:**
   ```bash
   ./run-docker.sh
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000 (served by Nginx)
   - Backend API: http://localhost:8001

## 🛠️ Docker Compose Commands

### Development Mode Commands
```bash
# Start development services
docker compose -f docker-compose.dev.yml up --build

# Stop development services
docker compose -f docker-compose.dev.yml down

# View development logs
docker compose -f docker-compose.dev.yml logs -f

# Restart development services
docker compose -f docker-compose.dev.yml restart
```

### Production Mode Commands
```bash
# Start production services
docker compose up --build

# Stop production services
docker compose down

# View production logs
docker compose logs -f

# Restart production services
docker compose restart
```

## 📁 Architecture

```
The-Office/
├── docker-compose.yml          # Production configuration
├── docker-compose.dev.yml      # Development configuration with hot reload
├── run-docker.sh              # Production runner script
├── run-docker-dev.sh          # Development runner script
├── backend/
│   ├── Dockerfile             # Backend container (production)
│   ├── .dockerignore          # Backend build context exclusions
│   ├── requirements.txt       # Python dependencies
│   └── ...
├── frontend-react/
│   ├── Dockerfile             # Frontend container (production)
│   ├── Dockerfile.dev         # Frontend container (development)
│   ├── nginx.conf             # Nginx configuration (production)
│   ├── .dockerignore          # Frontend build context exclusions
│   └── ...
└── DOCKER_README.md           # This file
```

## 🔧 Configuration

### Development Mode
- **Backend**: 
  - Hot reload enabled with `--reload` flag
  - Volume mounting for live code changes
  - Port: 8001
- **Frontend**: 
  - React development server (`npm start`)
  - Hot reload enabled with file watching
  - Port: 3000

### Production Mode
- **Backend**: 
  - Optimized Python container
  - Port: 8001
- **Frontend**: 
  - Optimized React build served by Nginx
  - Port: 3000 (mapped from internal port 80)
  - API proxy from `/api/*` to backend

## 🏃‍♂️ Development Workflow

### For Active Development (Recommended)
```bash
# Start development mode
./run-docker-dev.sh

# Make changes to your code
# Changes will automatically reload!

# Stop when done
docker compose -f docker-compose.dev.yml down
```

### For Production Testing
```bash
# Start production mode
./run-docker.sh

# Test the production build
# Stop when done
docker compose down
```

## 🐛 Troubleshooting

### Hot Reload Not Working
1. **Check file permissions**:
   ```bash
   # Make sure Docker has access to your files
   docker compose -f docker-compose.dev.yml logs frontend
   ```

2. **Restart development services**:
   ```bash
   docker compose -f docker-compose.dev.yml restart
   ```

3. **Check volume mounts**:
   ```bash
   docker compose -f docker-compose.dev.yml exec frontend ls -la /app
   ```

### Port Conflicts
```bash
# Stop all containers
docker compose down
docker compose -f docker-compose.dev.yml down

# Check what's using the ports
lsof -i :3000
lsof -i :8001
```

### Container Logs
```bash
# Development logs
docker compose -f docker-compose.dev.yml logs backend
docker compose -f docker-compose.dev.yml logs frontend

# Production logs
docker compose logs backend
docker compose logs frontend
```

### Reset Everything
```bash
# Stop all containers
docker compose down
docker compose -f docker-compose.dev.yml down

# Remove images
docker rmi the-office-backend the-office-frontend

# Remove volumes
docker volume prune

# Start fresh
./run-docker-dev.sh
```

## 📝 Development vs Production Comparison

| Feature | Development Mode | Production Mode |
|---------|------------------|-----------------|
| **Hot Reload** | ✅ Enabled | ❌ Disabled |
| **File Watching** | ✅ Enabled | ❌ Disabled |
| **Build Optimization** | ❌ Minimal | ✅ Optimized |
| **Nginx Proxy** | ❌ Direct React | ✅ Nginx serving |
| **Docker Rebuild** | ❌ Not needed | ✅ Needed for changes |
| **Startup Time** | ⚡ Fast | 🐌 Slower (build time) |
| **Resource Usage** | 🔋 Higher | 🔋 Lower |

## 🎯 Agent Selection Feature

Both development and production modes fully support the agent selection feature:
- Click on agent buttons (CEO, Developer, HR) to select specific agents
- Chat directly with selected agents or use Supreme Agent routing
- All agent functionality works seamlessly in both modes

## 🚀 Quick Development Setup

**For the fastest development experience:**

1. **One-command startup:**
   ```bash
   ./run-docker-dev.sh
   ```

2. **Start coding:**
   - Edit Python files in `backend/` → Backend auto-reloads
   - Edit React files in `frontend-react/src/` → Frontend auto-reloads
   - No container rebuilds needed!

3. **Access your app:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8001/docs

That's it! Your Office chat system is now running with hot reload enabled. Make changes to your code and watch them appear instantly! 🔥🎉 