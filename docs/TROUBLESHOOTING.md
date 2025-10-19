# UCM AI - Troubleshooting Guide

## Common Issues and Solutions

### Frontend Errors

#### Error: "Cannot read properties of undefined (reading 'call')"

**Symptoms:**
- Runtime error in browser console
- Error mentions webpack or module loading
- Pages may still load but show error overlay

**Causes:**
- Next.js build cache corruption
- Module resolution issues
- Browser cache problems

**Solutions:**

1. **Clear Next.js Cache (Recommended)**
   ```bash
   # Stop frontend
   docker-compose stop frontend
   
   # Clear .next cache
   docker-compose exec frontend rm -rf .next
   
   # Restart frontend
   docker-compose start frontend
   ```

2. **Full Rebuild**
   ```bash
   # Stop all services
   docker-compose down
   
   # Rebuild and start
   docker-compose up --build
   ```

3. **Clear Browser Cache**
   - Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
   - Or clear browser cache completely
   - Try incognito/private mode

4. **Restart Frontend Service**
   ```bash
   docker-compose restart frontend
   ```

---

### Port Already in Use

**Error:** `Port 3000/8000/5432 is already in use`

**Solution:**
```bash
# Find process using port
lsof -i :3000  # or :8000, :5432

# Kill process
kill -9 <PID>

# Or use docker-compose down first
docker-compose down
```

---

### Docker Issues

#### Containers Won't Start

**Solution:**
```bash
# Clean up Docker resources
docker-compose down -v
docker system prune -a

# Rebuild
docker-compose up --build
```

#### Database Connection Errors

**Solution:**
```bash
# Check database health
docker-compose ps

# View database logs
docker-compose logs db

# Restart database
docker-compose restart db
```

---

### Frontend Issues

#### Page Not Loading

**Solution:**
```bash
# Check frontend logs
docker-compose logs frontend

# Restart frontend
docker-compose restart frontend

# Clear cache and rebuild
docker-compose exec frontend rm -rf .next node_modules
docker-compose restart frontend
```

#### Cookie Banner Not Appearing

**Solution:**
```javascript
// Clear localStorage in browser console
localStorage.clear();

// Reload page
location.reload();
```

#### GPC Not Detected

**Solution:**
1. Check if browser supports GPC
2. Install GPC extension (Chrome/Edge)
3. Enable GPC in browser settings (Firefox/Brave)
4. Use test page to simulate: http://localhost:3000/test-gpc

---

### Backend Issues

#### API Not Responding

**Solution:**
```bash
# Check backend logs
docker-compose logs backend

# Restart backend
docker-compose restart backend

# Test API directly
curl http://localhost:8000/api/ucm/vendors
```

#### Database Errors

**Solution:**
```bash
# Check database connection
docker-compose exec backend python -c "from app import engine; print(engine.connect())"

# Reset database
docker-compose down -v
docker-compose up -d db
# Wait for db to be healthy
docker-compose up backend frontend
```

---

### Module/Import Errors

#### "Module not found" Errors

**Solution:**
```bash
# Reinstall dependencies
docker-compose exec frontend npm install

# Or rebuild container
docker-compose up --build frontend
```

#### TypeScript Errors

**Solution:**
```bash
# Check diagnostics
docker-compose exec frontend npm run build

# Fix type errors in code
# Restart TypeScript server in IDE
```

---

### Performance Issues

#### Slow Page Loads

**Solution:**
1. Check Docker resource allocation
2. Increase Docker memory/CPU limits
3. Clear browser cache
4. Check network tab in DevTools

#### High Memory Usage

**Solution:**
```bash
# Check container stats
docker stats

# Restart services
docker-compose restart

# Reduce log verbosity
```

---

### Development Issues

#### Hot Reload Not Working

**Solution:**
```bash
# Check if volumes are mounted correctly
docker-compose config

# Restart with fresh build
docker-compose down
docker-compose up --build
```

#### Changes Not Reflecting

**Solution:**
1. Check file is saved
2. Wait for compilation (check logs)
3. Hard refresh browser
4. Restart service if needed

---

### API Issues

#### 401 Unauthorized (Admin Endpoints)

**Solution:**
```bash
# Ensure X-Admin-Key header is set
curl -H "X-Admin-Key: dev-admin-key" http://localhost:8000/api/ucm/audit

# Check environment variable
docker-compose exec backend env | grep ADMIN_API_KEY
```

#### 422 Validation Error

**Solution:**
- Check request body format
- Ensure all required fields are present
- Verify data types match schema
- Check API docs: http://localhost:8000/docs

---

### Database Issues

#### "Database does not exist" Errors

**Solution:**
```bash
# These are health check logs, not errors
# Database creates itself on first connection
# Wait for backend to start fully
```

#### Migration Errors

**Solution:**
```bash
# Run migrations manually
docker-compose exec backend alembic upgrade head

# Or reset database
docker-compose down -v
docker-compose up
```

---

### Browser-Specific Issues

#### Safari Issues

**Solution:**
- Enable "Develop" menu
- Disable "Prevent cross-site tracking"
- Clear website data
- Try Chrome/Firefox

#### Firefox Issues

**Solution:**
- Check Enhanced Tracking Protection settings
- Clear cookies and site data
- Try private window

---

## Quick Fixes

### Nuclear Option (Reset Everything)

```bash
# Stop everything
docker-compose down -v

# Clean Docker
docker system prune -a --volumes

# Remove node_modules and .next
rm -rf frontend/node_modules frontend/.next

# Rebuild from scratch
docker-compose up --build
```

### Quick Restart

```bash
# Restart all services
docker-compose restart

# Or restart specific service
docker-compose restart frontend
docker-compose restart backend
```

### Check Everything

```bash
# Check all services
docker-compose ps

# Check logs
docker-compose logs --tail=50

# Test endpoints
curl http://localhost:3000
curl http://localhost:8000/api/ucm/vendors
```

---

## Debugging Tips

### Enable Verbose Logging

**Backend:**
```python
# In app.py, add:
import logging
logging.basicConfig(level=logging.DEBUG)
```

**Frontend:**
```javascript
// In browser console:
localStorage.setItem('debug', '*');
```

### Check Network Requests

1. Open browser DevTools (F12)
2. Go to Network tab
3. Reload page
4. Check failed requests
5. Inspect request/response

### Check Console Errors

1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for red errors
4. Check error stack trace

---

## Getting Help

### Information to Provide

When reporting issues, include:

1. **Error message** (full text)
2. **Browser** (name and version)
3. **Operating system**
4. **Steps to reproduce**
5. **Docker logs**:
   ```bash
   docker-compose logs > logs.txt
   ```
6. **Service status**:
   ```bash
   docker-compose ps
   ```

### Useful Commands

```bash
# Get all logs
docker-compose logs > all-logs.txt

# Get specific service logs
docker-compose logs frontend > frontend-logs.txt
docker-compose logs backend > backend-logs.txt

# Check service health
docker-compose ps

# Check Docker resources
docker stats

# Check disk space
df -h
```

---

## Prevention

### Best Practices

1. **Regular Cleanup**
   ```bash
   # Weekly cleanup
   docker system prune
   ```

2. **Keep Dependencies Updated**
   ```bash
   # Check for updates
   docker-compose exec frontend npm outdated
   docker-compose exec backend pip list --outdated
   ```

3. **Monitor Resources**
   ```bash
   # Check Docker stats
   docker stats
   ```

4. **Backup Data**
   ```bash
   # Backup database
   docker-compose exec db pg_dump -U ucm ucmdb > backup.sql
   ```

---

## Still Having Issues?

1. Check [STATUS.md](./STATUS.md) for known issues
2. Review [TESTING.md](./TESTING.md) for test procedures
3. Check API docs: http://localhost:8000/docs
4. Try the nuclear option (reset everything)
5. Check Docker Desktop is running and healthy

---

**Last Updated**: 2025-10-19
