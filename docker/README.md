# Docker Setup Guide

Complete Docker configuration for Backend Node.js application.

## 📁 File Structure

```
Backend_NodeJs/
├── Dockerfile                    # Production multi-stage build
├── Dockerfile.dev                # Development build with hot reload
├── docker-compose.yml            # Main Docker Compose configuration
├── docker-compose.override.example.yml  # Development override template
├── .dockerignore                 # Files to exclude from Docker build
├── .env.docker                   # Docker environment variables template
└── docker/
    ├── README.md                 # This file
    └── scripts/
        ├── wait-for-mysql.sh     # Wait for MySQL to be ready
        ├── verify-setup.sh       # Linux/macOS verification script
        ├── verify-setup.ps1      # Windows PowerShell verification script
        └── test-docker.ps1       # Windows PowerShell test script
```

## 🚀 Quick Start

### 1. Setup Environment

```bash
# Copy Docker environment file
cp .env.docker .env

# Edit .env and set NODE_ENV (development, test, or production)
# NODE_ENV=development
```

### 2. Start Services

**Production/Test Mode:**

```bash
docker-compose up -d --build
```

**Development Mode (with hot reload):**

```bash
# Copy override file
cp docker-compose.override.example.yml docker-compose.override.yml

# Start services
docker-compose up -d
```

### 3. Verify Setup

**Linux/macOS:**

```bash
bash docker/scripts/verify-setup.sh
```

**Windows PowerShell:**

```powershell
.\docker\scripts\verify-setup.ps1
```

**Or test manually:**

```bash
# Check container status
docker-compose ps

# View logs
docker-compose logs -f app

# Test API
curl http://localhost:8000/api/v1/health
```

## 📋 Dockerfiles

### Dockerfile (Production)

Multi-stage build optimized for production:

- **Base Stage**: Installs dependencies, generates Prisma client, builds TypeScript
- **Production Stage**: Copies only production artifacts, uses non-root user

**Features:**

- ✅ Optimized image size
- ✅ Production dependencies only
- ✅ Security best practices (non-root user)
- ✅ Health checks enabled

### Dockerfile.dev (Development)

Single-stage build for development:

- Installs all dependencies (including dev)
- Includes nodemon and ts-node for hot reload
- Source code mounted as volume

**Features:**

- ✅ Hot reload support
- ✅ Development tools included
- ✅ Fast rebuild times

## 🐳 Docker Compose

### Services

1. **app** - Node.js backend API (port 8000)
2. **mysql** - MySQL 8.0 database (port 3306)
3. **redis** - Redis cache (port 6379)

### Environment Configuration

**One `docker-compose.yml` works for all environments!**

Just change `NODE_ENV` in `.env`:

| Environment | NODE_ENV      | MYSQL_DATABASE        | Override File             |
| ----------- | ------------- | --------------------- | ------------------------- |
| Development | `development` | `backend_nodejs_dev`  | Optional (for hot reload) |
| Test        | `test`        | `backend_nodejs_test` | No                        |
| Production  | `production`  | `backend_nodejs_prod` | No                        |

### Important Notes

- **Database Host**: Always use service name `mysql` (not `localhost`) in Docker
- **Redis Host**: Always use service name `redis` (not `localhost`) in Docker
- **Volumes**: Data persists in Docker volumes (`mysql_data`, `redis_data`)
- **Health Checks**: Services wait for MySQL/Redis to be healthy before starting app

## 🔧 Common Commands

```bash
# Start all services
docker-compose up -d

# Start and rebuild
docker-compose up -d --build

# Stop all services
docker-compose down

# Stop and remove volumes (clean database)
docker-compose down -v

# View logs
docker-compose logs -f app
docker-compose logs -f mysql
docker-compose logs -f redis

# Restart a service
docker-compose restart app

# Execute command in container
docker-compose exec app sh
docker-compose exec mysql mysql -u app_user -p

# View container status
docker-compose ps

# Rebuild without cache
docker-compose build --no-cache
```

## 🗄️ Database Migrations

Migrations run automatically on container start:

- **Production/Test**: `prisma migrate deploy` (applies pending migrations)
- **Development**: `prisma migrate dev` (if using override file)

To run migrations manually:

```bash
docker-compose exec app pnpm prisma migrate deploy
docker-compose exec app pnpm prisma studio
```

## 🔍 Troubleshooting

### Container won't start

```bash
# Check logs
docker-compose logs app

# Check if MySQL is ready
docker-compose exec mysql mysqladmin ping -h localhost -u root -p

# Check if Redis is ready
docker-compose exec redis redis-cli ping
```

### Database connection issues

1. Ensure `MYSQL_HOST=mysql` in `.env` (not `localhost`)
2. Check MySQL is healthy: `docker-compose ps`
3. Verify credentials in `.env` match `docker-compose.yml`

### Port conflicts

If ports 8000, 3306, or 6379 are already in use:

```yaml
# In docker-compose.yml, change ports:
ports:
  - '8001:8000' # Use 8001 instead of 8000
```

### Clean rebuild

```bash
# Stop and remove everything
docker-compose down -v

# Remove images
docker-compose rm -f

# Rebuild from scratch
docker-compose build --no-cache
docker-compose up -d
```

## 📝 Environment Variables

Key environment variables (set in `.env`):

```env
# Environment
NODE_ENV=development  # or test, production

# Database (Docker - use service name 'mysql')
MYSQL_HOST=mysql
MYSQL_USER=app_user
MYSQL_PASSWORD=app_password
MYSQL_DATABASE=backend_nodejs_dev

# Redis (Docker - use service name 'redis')
REDIS_HOST=redis
REDIS_PORT=6379

# Server
PORT=8000
SERVER_URL=http://localhost:8000

# JWT (CHANGE IN PRODUCTION!)
JWT_ACCESS_TOKEN_SECRET=your-secret-key
JWT_REFRESH_TOKEN_SECRET=your-secret-key
```

## 🔐 Security Best Practices

1. **Change default passwords** in production
2. **Use strong JWT secrets** in production
3. **Non-root user** in production Dockerfile
4. **Don't commit `.env`** files
5. **Use secrets management** in production (Docker secrets, AWS Secrets Manager, etc.)

## 📚 Additional Resources

- [Docker Documentation](https://docs.docker.com/)
- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [Prisma Docker Guide](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-docker)
