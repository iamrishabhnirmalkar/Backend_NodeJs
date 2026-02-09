# Docker Setup - Quick Verification

## ✅ Setup Complete!

Your Docker setup is ready. Here's how to verify it works:

## Quick Test

```bash
# 1. Copy environment file
cp .env.docker .env

# 2. For Development: Copy override file
cp docker-compose.override.example.yml docker-compose.override.yml

# 3. Start everything
docker-compose up -d

# 4. Wait for services to start (30-60 seconds)
# Check logs
docker-compose logs -f app

# 5. Test health endpoint
curl http://localhost:8000/api/v1/health
```

## Expected Output

**Health Check Response:**

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "application": { ... },
    "system": { ... },
    "database": "CONNECTED",
    "timestamp": 1234567890
  }
}
```

## Troubleshooting

### Services won't start

```bash
# Check Docker is running
docker ps

# Check logs
docker-compose logs

# Rebuild
docker-compose build --no-cache
docker-compose up -d
```

### Database connection error

- Ensure `MYSQL_HOST=mysql` (not localhost) in `.env`
- Check MySQL is healthy: `docker-compose ps`
- Wait for MySQL to be ready (health check takes ~30s)

### Port conflicts

- Change ports in `.env`: `PORT=8001`, `MYSQL_PORT=3307`

### Reset everything

```bash
docker-compose down -v
docker-compose up -d
```

## Verification Checklist

- [ ] Docker Desktop is running
- [ ] `.env` file exists (copied from `.env.docker`)
- [ ] `NODE_ENV` is set in `.env`
- [ ] For development: `docker-compose.override.yml` exists
- [ ] Services start: `docker-compose ps` shows all services "Up"
- [ ] Health check works: `curl http://localhost:8000/api/v1/health`
- [ ] Database shows "CONNECTED" in health response

## All Systems Working? ✅

If health check returns `"database": "CONNECTED"`, everything is working!

Access:

- **API**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/api-docs
- **Health Check**: http://localhost:8000/api/v1/health
