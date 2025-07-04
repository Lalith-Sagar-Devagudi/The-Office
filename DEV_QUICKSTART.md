# 🔥 Development Quick Start - Hot Reload Enabled

## TL;DR - One Command Setup

```bash
./run-docker-dev.sh
```

That's it! Your app will start with hot reload enabled.

## 🚀 What This Gives You

- **Backend Hot Reload**: Edit Python files → Server auto-restarts
- **Frontend Hot Reload**: Edit React files → Browser auto-refreshes  
- **No Container Rebuilds**: Make changes without stopping/starting containers
- **Live Logs**: See real-time output from both services

## 📍 Access Points

- **Frontend**: http://localhost:3000 (React dev server)
- **Backend**: http://localhost:8001 (FastAPI with hot reload)
- **API Docs**: http://localhost:8001/docs

## 🛠️ Development Workflow

1. **Start development mode**:
   ```bash
   ./run-docker-dev.sh
   ```

2. **Make changes to your code**:
   - Edit files in `backend/` → Backend reloads automatically
   - Edit files in `frontend-react/src/` → Frontend reloads automatically

3. **Test your changes**:
   - Changes appear instantly in browser
   - No need to rebuild or restart containers

4. **View logs** (optional):
   ```bash
   docker compose -f docker-compose.dev.yml logs -f
   ```

5. **Stop when done**:
   ```bash
   docker compose -f docker-compose.dev.yml down
   ```

## 🔄 Development vs Production

| Task | Development | Production |
|------|-------------|------------|
| **Start** | `./run-docker-dev.sh` | `./run-docker.sh` |
| **Code Changes** | Auto-reload | Need rebuild |
| **Speed** | ⚡ Instant | 🐌 Rebuild time |
| **Use Case** | Active development | Testing/deployment |

## 🐛 Common Issues

### Hot Reload Not Working?
```bash
# Restart development services
docker compose -f docker-compose.dev.yml restart
```

### Port Already in Use?
```bash
# Stop all containers and try again
docker compose -f docker-compose.dev.yml down
./run-docker-dev.sh
```

### Want to Reset Everything?
```bash
# Nuclear option - clean slate
docker compose -f docker-compose.dev.yml down
docker system prune -f
./run-docker-dev.sh
```

## 🎯 Agent Selection Testing

The hot reload works perfectly with your agent selection feature:

1. Start development mode
2. Select different agents (CEO, Developer, HR)
3. Test chat functionality
4. Make code changes to agents
5. Changes apply instantly without losing your chat session

## 💡 Pro Tips

- **Keep containers running**: No need to stop/start for code changes
- **Use split terminal**: One for logs, one for editing
- **Test both modes**: Use development for coding, production for final testing
- **Check logs**: If something breaks, logs will show you what happened

Happy coding! 🎉 