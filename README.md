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

- ✅ Start MySQL database (with automatic initialization, user/password from .env)
- ✅ Start Redis
- ✅ Build and start Node.js backend
- ✅ Run database migrations automatically
- ✅ Be available at `http://localhost:8001` (or `http://localhost:${PORT}` from .env)

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

# Access MySQL CLI (use your MYSQL_PASSWORD from .env)
docker-compose exec mysql mysql -u app_user -p backend_nodejs_dev
# Or with password inline (replace app_password with your MYSQL_PASSWORD):
docker-compose exec mysql mysql -u app_user -papp_password backend_nodejs_dev

# MySQL as root (use MYSQL_ROOT_PASSWORD from .env)
docker-compose exec mysql mysql -u root -p

# Access Redis CLI (no password by default)
docker-compose exec redis redis-cli

# Run Prisma commands inside container
docker-compose exec app pnpm prisma:studio
docker-compose exec app pnpm prisma:migrate
docker-compose exec app pnpm prisma:seed
```

#### Docker Environment Variables

Create `.env` file (copy from `.env.docker.example`; never commit `.env`):

```env
# Environment (development, test, or production)
NODE_ENV=development

# Database (Docker - use service name 'mysql' inside containers)
MYSQL_HOST=mysql
MYSQL_PORT=3307              # Host port for DBeaver/CLI (localhost:3307)
MYSQL_USER=app_user
MYSQL_PASSWORD=app_password
MYSQL_ROOT_PASSWORD=rootpassword
MYSQL_DATABASE=backend_nodejs_dev
DATABASE_URL=mysql://app_user:app_password@mysql:3306/backend_nodejs_dev

# Redis (Docker - use service name 'redis' inside containers)
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=              # Optional; leave empty for no auth

# JWT (CHANGE IN PRODUCTION!)
JWT_ACCESS_TOKEN_SECRET=your-secret-key
JWT_REFRESH_TOKEN_SECRET=your-refresh-secret-key
```

**Important:** For Docker, always use service names (`mysql`, `redis`) in `MYSQL_HOST`/`REDIS_HOST`, not `localhost`. Use `localhost` and `MYSQL_PORT` only when connecting from your host (e.g. DBeaver).

#### Database password setup

Set these in `.env` (copy from `.env.docker.example`):

| Variable              | Purpose                 | Default (example)    |
| --------------------- | ----------------------- | -------------------- |
| `MYSQL_ROOT_PASSWORD` | Root user (admin tasks) | `rootpassword`       |
| `MYSQL_USER`          | App database user       | `app_user`           |
| `MYSQL_PASSWORD`      | App database password   | `app_password`       |
| `MYSQL_DATABASE`      | Database name           | `backend_nodejs_dev` |

**Production:** Use strong passwords and change all defaults.

#### Accessing the database (DBeaver GUI or CLI)

**From your host machine** (e.g. DBeaver, MySQL CLI), use **localhost** and the **host port** (not the container port):

| Item     | Value                                        |
| -------- | -------------------------------------------- |
| Host     | `localhost`                                  |
| Port     | `MYSQL_PORT` from `.env` (default `3307`)    |
| Database | `MYSQL_DATABASE` (e.g. `backend_nodejs_dev`) |
| Username | `MYSQL_USER` (e.g. `app_user`)               |
| Password | `MYSQL_PASSWORD` (e.g. `app_password`)       |

**DBeaver (GUI):**

1. New Connection → MySQL.
2. **Host:** `localhost`
3. **Port:** `3307` (or your `MYSQL_PORT`)
4. **Database:** `backend_nodejs_dev` (or your `MYSQL_DATABASE`)
5. **Username:** `app_user` (or your `MYSQL_USER`)
6. **Password:** `app_password` (or your `MYSQL_PASSWORD`)
7. Test connection → Finish.

**CLI (from host):**

```bash
# If mysql client is installed locally (use MYSQL_PORT from .env)
mysql -h 127.0.0.1 -P 3307 -u app_user -p backend_nodejs_dev
```

**CLI (inside Docker):**

```bash
docker-compose exec mysql mysql -u app_user -p backend_nodejs_dev
# Enter MYSQL_PASSWORD when prompted
```

**Redis (CLI only, from Docker):**

```bash
docker-compose exec redis redis-cli
# No password by default; set REDIS_PASSWORD in .env if you add auth later.
```

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

**Why is the health API hit automatically (e.g. in Docker)?**  
The **Dockerfile** defines a `HEALTHCHECK` that calls `http://localhost:8000/api/v1/health` every **30 seconds**. Docker uses this to mark the container healthy (HTTP 200) or unhealthy. So you’ll see health requests in `docker-compose logs -f app` even when no one is opening the API in a browser.

**How is the database assessed?**  
The handler runs a simple DB query (`SELECT 1` via Prisma). If it succeeds, the response includes `"database": "CONNECTED"`; if it fails, `"database": "DISCONNECTED"`. This works for MySQL, MariaDB, and PostgreSQL.

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
curl http://localhost:8001/api/v1/health
# Or use PORT from your .env (e.g. 8000)
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

- Swagger UI: `http://localhost:8001/api-docs` (or `http://localhost:${PORT}/api-docs` from .env)

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
