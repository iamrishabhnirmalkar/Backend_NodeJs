# Backend Node.js

Express + TypeScript + Prisma (MySQL) API backend with health check, rate limiting, and Swagger docs.

## Prerequisites

### Option 1: Docker (Recommended - Works on Windows, Linux, macOS)

- **Docker** 20.10+ and **Docker Compose** 2.0+
- No need to install Node.js, MySQL, or Redis separately

### Option 2: Local Development

- **Node.js** 18+ (LTS recommended)
- **pnpm** (`npm install -g pnpm`)
- **MySQL** 8.x (or MariaDB) running locally or remotely
- **Redis** (optional, for future use)

## Setup

### 🐳 Docker Setup (Recommended)

**Works on Windows, Linux, macOS, and Ubuntu - Just run Docker!**

#### Quick Start

```bash
# Clone repository
git clone <repository-url>
cd Backend_NodeJs

# Copy Docker environment file (never commit .env)
cp .env.docker.example .env

# Edit .env and set NODE_ENV (development, test, or production)
# NODE_ENV=development

# For Development: Copy override file (enables hot reload)
cp docker-compose.override.example.yml docker-compose.override.yml

# Start everything
docker-compose up -d
```

That's it! The application will:

- ✅ Start MySQL database (with automatic initialization)
- ✅ Start Redis
- ✅ Build and start Node.js backend
- ✅ Run database migrations automatically
- ✅ Be available at `http://localhost:8000`

#### One Docker Compose for All Environments

**ONE `docker-compose.yml` works for development, test, and production!**

Just change `NODE_ENV` in `.env` file:

| Environment     | NODE_ENV in .env | MYSQL_DATABASE in .env | Hot Reload Override                                   |
| --------------- | ---------------- | ---------------------- | ----------------------------------------------------- |
| **Development** | `development`    | `backend_nodejs_dev`   | Optional (copy `docker-compose.override.example.yml`) |
| **Test**        | `test`           | `backend_nodejs_test`  | No                                                    |
| **Production**  | `production`     | `backend_nodejs_prod`  | No                                                    |

**Example - Switch to Production:**

```bash
# Edit .env file
NODE_ENV=production
MYSQL_DATABASE=backend_nodejs_prod

# Remove override file (if exists) for production
rm docker-compose.override.yml

# Start

docker-compose up -d --build
```

**Example - Switch to Test:**

```bash
# Edit .env file
NODE_ENV=test
MYSQL_DATABASE=backend_nodejs_test

# Start
docker-compose up -d
```

**Example - Development with Hot Reload:**

```bash
# Edit .env file
NODE_ENV=development
MYSQL_DATABASE=backend_nodejs_dev

# Copy override file for hot reload
cp docker-compose.override.example.yml docker-compose.override.yml

# Start
docker-compose up -d
```

#### Docker Commands

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop all services
docker-compose down

# Stop and remove volumes (clean database)
docker-compose down -v

# Rebuild containers
docker-compose build --no-cache

# Restart app
docker-compose restart app

# Access MySQL CLI
docker-compose exec mysql mysql -u app_user -papp_password backend_nodejs_dev

# Access Redis CLI
docker-compose exec redis redis-cli

# Run Prisma commands inside container
docker-compose exec app pnpm prisma:studio
docker-compose exec app pnpm prisma:migrate
docker-compose exec app pnpm prisma:seed
```

#### Docker Environment Variables

Create `.env` file (copy from `.env.docker.example`; never commit `.env`):

```env
# Environment (change this: development, test, or production)
NODE_ENV=development

# Database (Docker - ALWAYS use service name 'mysql', not localhost!)
MYSQL_HOST=mysql          # Service name in docker-compose
MYSQL_USER=app_user
MYSQL_PASSWORD=app_password
MYSQL_DATABASE=backend_nodejs_dev
DATABASE_URL=mysql://app_user:app_password@mysql:3306/backend_nodejs_dev

# Redis (Docker - ALWAYS use service name 'redis', not localhost!)
REDIS_HOST=redis          # Service name in docker-compose

# JWT Secrets (CHANGE IN PRODUCTION!)
JWT_ACCESS_TOKEN_SECRET=your-secret-key
JWT_REFRESH_TOKEN_SECRET=your-refresh-secret-key
```

**Important:** For Docker, always use service names (`mysql`, `redis`), not `localhost`!

#### Docker Volumes

- **MySQL data**: Persisted in `mysql_data` volume
- **Redis data**: Persisted in `redis_data` volume
- **Logs**: Mounted to `./logs` directory

#### Health Checks

All services include health checks:

- MySQL: Checks connection every 10s
- Redis: Pings every 10s
- App: HTTP health check at `/api/v1/health`

#### Production Deployment

```bash
# In .env: NODE_ENV=production, MYSQL_DATABASE=backend_nodejs_prod
# Remove docker-compose.override.yml if present (no hot reload in prod)
docker-compose up -d --build
```

#### Database options (MariaDB / PostgreSQL)

You can run the same app with **MariaDB** or **PostgreSQL** instead of MySQL:

- **MariaDB**: `docker-compose -f docker-compose.yml -f docker-compose.mariadb.yml up -d` (no Prisma change)
- **PostgreSQL**: Change `prisma/schema.prisma` to `provider = "postgresql"`, then `docker-compose -f docker-compose.yml -f docker-compose.postgres.yml up -d`

See **[docs/DATABASE-SWITCH.md](docs/DATABASE-SWITCH.md)** for full steps and env examples.

---

### 📦 Local Setup (Without Docker)

### 1. Clone and install

```bash
git clone <repository-url>
cd Backend_NodeJs
pnpm install
```

### 2. Environment configuration

The app uses **dotenv-flow** and loads env by `NODE_ENV`:

| NODE_ENV    | File loaded        |
| ----------- | ------------------ |
| development | `.env.development` |
| production  | `.env.production`  |
| test        | `.env.test`        |

**Copy the example and edit with your values:**

```bash
cp .env.example .env.development
# Edit .env.development (see below)
```

For **production** or **test**, copy and edit the right file:

```bash
cp .env.example .env.production   # for production
cp .env.example .env.test         # for test
```

**Required variables:**

- `DATABASE_URL` – Full MySQL connection string (Prisma does not expand `${VAR}` in .env).
  - **Docker**: `mysql://app_user:app_password@mysql:3306/backend_nodejs_dev` (use service name `mysql`)
  - **Local**: `mysql://root:yourpassword@localhost:3306/backend_nodejs_dev` (use `localhost`)
- `MYSQL_HOST` – Database host
  - **Docker**: `mysql` (service name)
  - **Local**: `localhost`
- `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE` – Database credentials
- `REDIS_HOST` – Redis host
  - **Docker**: `redis` (service name)
  - **Local**: `localhost`
- `PORT`, `SERVER_URL`, `NODE_ENV`, `FRONTEND_URL`, Redis and rate-limit vars as in `.env.example`.

### 3. Database

Create the MySQL database (if it does not exist):

```sql
CREATE DATABASE backend_nodejs_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

For test:

```sql
CREATE DATABASE backend_nodejs_test CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Generate Prisma client and run migrations:

```bash
pnpm prisma:init
pnpm prisma:migrate
```

- `prisma:init` – runs `prisma generate` (generates client in `generated/prisma`).
- `prisma:migrate` – runs `prisma migrate dev` (applies migrations and keeps DB in sync).

To reset DB (dev only):

```bash
pnpm prisma:reset
```

#### Seeding (MySQL, MariaDB, or PostgreSQL)

The same seed script works for **MySQL**, **MariaDB**, and **PostgreSQL**. It creates roles (`admin`, `user`), permissions (e.g. `user:create`, `user:read`), and optionally an admin user.

**Local (any DB):** Set `DATABASE_URL` in your env (e.g. `.env.development`) to point to your database, then run:

```bash
pnpm prisma:init
pnpm prisma:seed
```

To create a seeded admin user, set `SEED_ADMIN_PASSWORD` in `.env` (e.g. `SEED_ADMIN_PASSWORD=your-secure-password`). The seed will create `admin@example.com` with role `admin`.

**Docker (MySQL):**

```bash
docker-compose exec app pnpm prisma:seed
```

**Docker (MariaDB):** Same as MySQL (service name stays `mysql`):

```bash
docker-compose -f docker-compose.yml -f docker-compose.mariadb.yml exec app pnpm prisma:seed
```

**Docker (PostgreSQL):**

```bash
docker-compose -f docker-compose.yml -f docker-compose.postgres.yml exec app pnpm prisma:seed
```

Seeding is **idempotent** (safe to run multiple times). It also runs automatically after `pnpm prisma:reset` unless you pass `--skip-seed`.

### 4. Run the app

**Development** (uses `.env.development`):

```bash
pnpm dev
```

**Production** (uses `.env.production`):

```bash
pnpm build
pnpm start
```

**Test** (uses `.env.test`):

```bash
pnpm test
```

Server listens on `PORT` from env (default development: `8000`).

## Health check and database status

**GET** `/api/v1/health` returns application, system, and **database connection status**.

Example when the database is connected:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "application": { "version": "1.0.0", "environment": "development", "uptime": "..." },
    "system": { "cpuUsage": "...", "totalMemory": "...", "freeMemory": "..." },
    "database": "CONNECTED",
    "timestamp": 1678888888888
  }
}
```

If the database is unreachable:

```json
"database": "DISCONNECTED"
```

**Quick test:**

```bash
curl http://localhost:8000/api/v1/health
```

Ensure `DATABASE_URL` in your `.env.development` (or `.env.production` / `.env.test`) is correct and MySQL is running; then run migrations and start the server. The health endpoint will report `CONNECTED` or `DISCONNECTED` accordingly.

## Scripts

| Script                | Description                                  |
| --------------------- | -------------------------------------------- |
| `pnpm dev`            | Start dev server (nodemon)                   |
| `pnpm start`          | Start production server                      |
| `pnpm build`          | Compile TypeScript to `dist/`                |
| `pnpm test`           | Start server in test env                     |
| `pnpm prisma:init`    | Generate Prisma client                       |
| `pnpm prisma:migrate` | Run migrations (dev)                         |
| `pnpm prisma:push`    | Push schema (no migrations)                  |
| `pnpm prisma:reset`   | Reset DB (dev)                               |
| `pnpm prisma:seed`    | Seed DB (roles, permissions, optional admin) |
| `pnpm prisma:studio`  | Open Prisma Studio                           |

## API docs

- Swagger UI: `http://localhost:8000/api-docs`

## Docker Deployment

### Quick Start (All Platforms)

```bash
# 1. Clone repository
git clone <repository-url>
cd Backend_NodeJs

# 2. Copy Docker environment file
cp .env.docker.example .env

# 3. (Optional) Edit .env with your values
# Default values work for development

# 4. Start everything
docker-compose up -d

# 5. Check logs
docker-compose logs -f app

# 6. Access API
curl http://localhost:8000/api/v1/health
```

### Docker Compose Files

| File                      | Purpose                  | Usage                                                                   |
| ------------------------- | ------------------------ | ----------------------------------------------------------------------- |
| `docker-compose.yml`      | Production               | `docker-compose up -d`                                                  |
| `docker-compose.dev.yml`  | Development (hot reload) | `docker-compose -f docker-compose.dev.yml up -d`                        |
| `docker-compose.test.yml` | Testing                  | `docker-compose -f docker-compose.test.yml up -d`                       |
| `docker-compose.prod.yml` | Production overrides     | `docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d` |

### Docker Services

- **app** - Node.js backend (port 8000)
- **mysql** - MySQL 8.0 database (port 3306)
- **redis** - Redis cache (port 6379)

### Environment Variables for Docker

Create `.env` file (see `.env.docker.example`):

```env
# Database (use Docker service names)
MYSQL_HOST=mysql                    # Service name, not localhost!
MYSQL_USER=app_user
MYSQL_PASSWORD=app_password
MYSQL_DATABASE=backend_nodejs_dev
DATABASE_URL=mysql://app_user:app_password@mysql:3306/backend_nodejs_dev

# Redis (use Docker service name)
REDIS_HOST=redis                    # Service name, not localhost!

# JWT (CHANGE IN PRODUCTION!)
JWT_ACCESS_TOKEN_SECRET=your-secret-key
JWT_REFRESH_TOKEN_SECRET=your-refresh-secret-key
```

### Common Docker Commands

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

# Execute commands in container
docker-compose exec app pnpm prisma:studio
docker-compose exec app pnpm prisma:migrate
docker-compose exec mysql mysql -u app_user -papp_password backend_nodejs_dev

# Check service status
docker-compose ps

# Restart a service
docker-compose restart app
```

### Database Migrations

Migrations run automatically on container start. To run manually:

```bash
docker-compose exec app pnpm prisma:migrate
docker-compose exec app pnpm prisma:init
```

### Production Deployment

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
   ```

3. **Start production**:
   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d
   ```

### Troubleshooting

**Database connection issues:**

- Ensure `MYSQL_HOST=mysql` (service name, not localhost)
- Check MySQL is healthy: `docker-compose ps`
- View MySQL logs: `docker-compose logs mysql`

**Port conflicts:**

- Change ports in `.env`: `MYSQL_PORT=3307`, `PORT=8001`

**Reset everything:**

```bash
docker-compose down -v
docker-compose up -d
```

## Git Hooks & Commit Conventions

This project uses **Husky** to enforce code quality and commit standards.

### Pre-commit Hook

Before each commit:

- **Prettier** automatically formats staged files (`.ts`, `.js`, `.json`, `.md`)
- Code is formatted according to `.prettierrc` rules

### Commit Message Format

Commits must follow the **Conventional Commits** format:

```
<type>(<scope>): <subject>
```

**Types:**

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style (formatting, semicolons, etc.)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Adding or updating tests
- `build` - Build system or dependencies
- `ci` - CI/CD changes
- `chore` - Other changes (no src/test changes)
- `revert` - Revert a previous commit

**Examples:**

```bash
feat: add user authentication endpoint
fix(api): resolve database connection timeout
docs: update README with XAMPP setup instructions
style: format code with prettier
refactor(controllers): simplify error handling
```

**Invalid examples:**

```bash
# ❌ Missing type
add new feature

# ❌ Wrong format
Added user login

# ❌ Type should be lowercase
FEAT: add authentication
```

### Pre-push Hook

Before pushing to remote:

- **Build** runs (`pnpm run build`)
- If build fails, push is blocked with error details
- Fix TypeScript errors before pushing

**To skip hooks (not recommended):**

```bash
git commit --no-verify  # Skip pre-commit
git push --no-verify    # Skip pre-push
```

## License

ISC
