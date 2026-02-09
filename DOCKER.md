# Docker Setup Guide

Complete Docker setup for Backend Node.js - Works on **Windows, Linux, macOS, and Ubuntu**.

## Quick Start

```bash
# 1. Clone and navigate
git clone <repository-url>
cd Backend_NodeJs

# 2. Copy Docker environment file
cp .env.docker .env

# 3. Edit .env and set NODE_ENV (development, test, or production)
# NODE_ENV=development  # or test, or production

# 4. For Development: Copy override file (enables hot reload)
cp docker-compose.override.example.yml docker-compose.override.yml

# 5. Start everything
docker-compose up -d

# 6. Check status
docker-compose ps

# 7. View logs
docker-compose logs -f app

# 8. Test API
curl http://localhost:8000/api/v1/health
```

## One Docker Compose for All Environments

**ONE `docker-compose.yml` works for development, test, and production!**

Just change `NODE_ENV` in `.env` file:

| Environment     | NODE_ENV in .env | MYSQL_DATABASE in .env | Hot Reload Override                                   |
| --------------- | ---------------- | ---------------------- | ----------------------------------------------------- |
| **Development** | `development`    | `backend_nodejs_dev`   | Optional (copy `docker-compose.override.example.yml`) |
| **Test**        | `test`           | `backend_nodejs_test`  | No                                                    |
| **Production**  | `production`     | `backend_nodejs_prod`  | No                                                    |

### Development Mode

```bash
# 1. Edit .env
NODE_ENV=development
MYSQL_DATABASE=backend_nodejs_dev

# 2. (Optional) Copy override file for hot reload
cp docker-compose.override.example.yml docker-compose.override.yml

# 3. Start
docker-compose up -d
```

**Features:**

- ✅ Hot reload (nodemon) - if override file exists
- ✅ Source code mounted as volume - if override file exists
- ✅ Development dependencies - if override file exists
- ✅ Or compiled production build - if no override file

### Production Mode

```bash
# 1. Edit .env
NODE_ENV=production
MYSQL_DATABASE=backend_nodejs_prod

# 2. Remove override file (if exists)
rm docker-compose.override.yml

# 3. Start
docker-compose up -d --build
```

**Features:**

- ✅ Optimized production build
- ✅ Production dependencies only
- ✅ Compiled TypeScript
- ✅ Health checks enabled

### Test Mode

```bash
# 1. Edit .env
NODE_ENV=test
MYSQL_DATABASE=backend_nodejs_test

# 2. Start
docker-compose up -d
```

**Features:**

- ✅ Same as production (compiled, optimized)
- ✅ Separate test database

## Services

- **app** - Node.js backend API (port 8000)
- **mysql** - MySQL 8.0 database (port 3306)
- **redis** - Redis cache (port 6379)

## Environment Configuration

### For Docker (Always use service names)

```env
# Database - Use service name 'mysql' (not localhost!)
MYSQL_HOST=mysql
MYSQL_USER=app_user
MYSQL_PASSWORD=app_password
DATABASE_URL=mysql://app_user:app_password@mysql:3306/backend_nodejs_dev

# Redis - Use service name 'redis' (not localhost!)
REDIS_HOST=redis

# Environment
NODE_ENV=development  # or test, or production
```

### For Local Development (Without Docker)

```env
MYSQL_HOST=localhost
REDIS_HOST=localhost
DATABASE_URL=mysql://root:@localhost:3306/backend_nodejs_dev
```

## Common Commands

```bash
# Start services
docker-compose up -d

# Stop services
docker-compose down

# Stop and remove volumes (clean database)
docker-compose down -v

# View logs
docker-compose logs -f app
docker-compose logs -f mysql

# Rebuild containers
docker-compose build --no-cache

# Restart a service
docker-compose restart app

# Execute commands
docker-compose exec app pnpm prisma:studio
docker-compose exec app pnpm prisma:migrate
docker-compose exec mysql mysql -u app_user -papp_password backend_nodejs_dev

# Check service status
docker-compose ps
```

## Database Migrations

Migrations run automatically on container start. To run manually:

```bash
docker-compose exec app pnpm prisma:migrate
docker-compose exec app pnpm prisma:init
```

## Production Deployment

1. **Set strong passwords** in `.env`:

   ```env
   MYSQL_ROOT_PASSWORD=strong_root_password
   MYSQL_PASSWORD=strong_app_password
   JWT_ACCESS_TOKEN_SECRET=very-strong-secret-key
   JWT_REFRESH_TOKEN_SECRET=very-strong-refresh-secret-key
   ```

2. **Update SERVER_URL**:

   ```env
   SERVER_URL=https://yourdomain.com
   NODE_ENV=production
   ```

3. **Remove override file** (if exists):

   ```bash
   rm docker-compose.override.yml
   ```

4. **Start production**:
   ```bash
   docker-compose up -d --build
   ```

## Troubleshooting

**Port conflicts:**

- Edit `.env`: `PORT=8001`, `MYSQL_PORT=3307`

**Database connection:**

- Ensure `MYSQL_HOST=mysql` (not localhost)
- Check: `docker-compose ps`
- Logs: `docker-compose logs mysql`

**Reset everything:**

```bash
docker-compose down -v
docker-compose up -d
```

**Development hot reload not working:**

- Ensure `docker-compose.override.yml` exists
- Check volumes are mounted: `docker-compose exec app ls -la /app/src`
