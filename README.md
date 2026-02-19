# Backend Node.js

Express + TypeScript + Prisma (MySQL) API backend with health check, rate limiting, and Swagger docs.

## Database & technology stack

| Component        | Default / used in this project | Notes                                                                                                                            |
| ---------------- | ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| **Database**     | **MySQL 8.0**                  | Defined in `prisma/schema.prisma` as `provider = "mysql"`. Prisma connects via `DATABASE_URL`.                                   |
| **ORM**          | **Prisma**                     | Schema: `prisma/schema.prisma`. Client output: `generated/prisma`.                                                               |
| **Cache**        | **Redis 7**                    | Optional; used for sessions/cache. Host/port from env.                                                                           |
| **Optional DBs** | MariaDB, PostgreSQL            | Same codebase; use extra compose files or change Prisma provider. See [Database options](#database-options-mariadb--postgresql). |

**Connection:** The app and Prisma use a single connection string: `DATABASE_URL` (e.g. `mysql://USER:PASSWORD@HOST:3306/DATABASE`). For Docker, `HOST` is the service name (`mysql`). For local, `HOST` is `localhost`.

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

### 🐳 Run with Docker (complete steps)

**Works on Windows, Linux, macOS. Uses MySQL 8 + Redis + Node from containers.**

#### Step 1: Clone and env

```bash
git clone <repository-url>
cd Backend_NodeJs

# Single env file for both Docker and local (never commit .env)
cp .env.example .env

# Edit .env: set NODE_ENV (development | test | production) and passwords if needed.
# For Docker, keep MYSQL_HOST=mysql and REDIS_HOST=redis (service names).
# Defaults in .env.example work for development.
```

#### Step 2: (Optional) Development hot reload

For **development with hot reload** (nodemon, source mounted):

```bash
cp docker-compose.override.example.yml docker-compose.override.yml
```

For **production or test**, do **not** create this file (or remove it).

#### Step 3: Build and start

```bash
# Build images and start all services (MySQL, Redis, app)
docker-compose up -d --build
```

**What runs when the app starts:**

| Mode                             | App start command                                         | Migrations                                                         |
| -------------------------------- | --------------------------------------------------------- | ------------------------------------------------------------------ |
| **With override** (dev)          | `pnpm prisma:init` → `prisma migrate deploy` → `pnpm dev` | Applied automatically with `prisma migrate deploy` (no shadow DB). |
| **Without override** (prod/test) | `prisma migrate deploy` → `node dist/server.js`           | Applied automatically with `prisma migrate deploy`.                |

So **migrations run automatically on every container start**; you do not need to run them manually unless you want to re-run or seed.

#### Step 4: Verify

```bash
# Check all containers (mysql, redis, app should be Up)
docker-compose ps

# App and API (use PORT from .env, default 8000 or 8001)
curl http://localhost:8000/api/v1/health
# Or: curl http://localhost:8001/api/v1/health
```

**Summary:** One command `docker-compose up -d --build` brings up MySQL, Redis, runs Prisma migrations, and starts the app. Use the same `.env` and optional `docker-compose.override.yml` for dev.

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

#### Docker: useful commands

```bash
# Start / stop
docker-compose up -d
docker-compose down
docker-compose down -v          # also remove volumes (clean DB)

# Logs and rebuild
docker-compose logs -f app
docker-compose build --no-cache
docker-compose restart app

# Database CLI (MySQL: user app_user, password from MYSQL_PASSWORD in .env)
docker-compose exec mysql mysql -u app_user -p backend_nodejs_dev
docker-compose exec mysql mysql -u root -p    # root: MYSQL_ROOT_PASSWORD

# Redis CLI (no password by default)
docker-compose exec redis redis-cli
```

#### Docker: Prisma and migration commands

Run these **inside the app container** (database is MySQL, same as when running locally):

| What you want                                                         | Command (Docker)                                                                                                                              |
| --------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| Generate Prisma client                                                | `docker-compose exec app pnpm prisma:init`                                                                                                    |
| Apply migrations (deploy, no new migration file)                      | `docker-compose exec app pnpm exec prisma migrate deploy`                                                                                     |
| Create a new migration (dev; needs shadow DB – not default in Docker) | See [Prisma migrations – complete command reference](#prisma-migrations--complete-command-reference) below; or run locally against Docker DB. |
| Open Prisma Studio                                                    | `docker-compose exec app pnpm prisma:studio`                                                                                                  |
| Seed database (roles, permissions, optional admin)                    | `docker-compose exec app pnpm prisma:seed`                                                                                                    |
| Reset DB (drops DB, reapplies migrations, optional seed)              | `docker-compose exec app pnpm prisma:reset`                                                                                                   |

Migrations are **already applied on container start** (`prisma migrate deploy`). Use the commands above only when you want to run deploy/seed/studio manually.

#### Docker environment variables

Create `.env` from the single example (copy from `.env.example`; never commit `.env`):

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

Set these in `.env` (copy from `.env.example`):

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

### 📦 Run without Docker (local)

**Requires:** Node.js 18+, pnpm, MySQL 8.x (or MariaDB) and optionally Redis on your machine.

#### Step 1: Clone and install

```bash
git clone <repository-url>
cd Backend_NodeJs
pnpm install
```

#### Step 2: Environment (one file per NODE_ENV)

The app uses **dotenv-flow** and loads env by `NODE_ENV`:

| NODE_ENV    | File loaded        |
| ----------- | ------------------ |
| development | `.env.development` |
| production  | `.env.production`  |
| test        | `.env.test`        |

**Copy the single example and edit:**

```bash
cp .env.example .env.development
# Edit .env.development: set MYSQL_HOST=localhost, REDIS_HOST=localhost,
# and DATABASE_URL=mysql://USER:PASSWORD@localhost:3306/backend_nodejs_dev
```

For production or test, copy and edit the right file:

```bash
cp .env.example .env.production
cp .env.example .env.test
```

**Required for local:** `MYSQL_HOST=localhost`, `REDIS_HOST=localhost`, and `DATABASE_URL` must point to your MySQL (e.g. `mysql://root:yourpassword@localhost:3306/backend_nodejs_dev`). Prisma uses only `DATABASE_URL`; no variable expansion in `.env`.

#### Step 3: Create database and run migrations

**Create the MySQL database** (if it does not exist):

```sql
CREATE DATABASE backend_nodejs_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

For test: `CREATE DATABASE backend_nodejs_test ...`;

**Generate Prisma client and apply migrations:**

```bash
pnpm prisma:init
pnpm prisma:migrate
```

- `prisma:init` → runs `prisma generate` (client in `generated/prisma`).
- `prisma:migrate` → runs `prisma migrate dev` (applies migrations; can create new migration files; uses a shadow DB).

**Reset DB (dev only):**

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

## Prisma migrations – complete command reference

**Database used by Prisma:** MySQL 8 (default). Schema: `prisma/schema.prisma` with `provider = "mysql"`. Connection: `DATABASE_URL` in `.env` (e.g. `mysql://USER:PASSWORD@HOST:3306/DATABASE`).

| What you want                                                   | Local (no Docker)                 | Docker (inside app container)                                                                                                                                                                   |
| --------------------------------------------------------------- | --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Generate Prisma client                                          | `pnpm prisma:init`                | `docker-compose exec app pnpm prisma:init`                                                                                                                                                      |
| Apply migrations (no new migration file)                        | `pnpm exec prisma migrate deploy` | `docker-compose exec app pnpm exec prisma migrate deploy`                                                                                                                                       |
| Apply migrations and create new migration (dev; uses shadow DB) | `pnpm prisma:migrate`             | Prefer running locally with `DATABASE_URL` pointing at Docker MySQL (port 3307), or run `docker-compose exec app pnpm exec prisma migrate dev --name your_name` (needs DB user with CREATE DB). |
| Push schema (no migration files; dev only)                      | `pnpm prisma:push`                | `docker-compose exec app pnpm prisma:push`                                                                                                                                                      |
| Reset DB (drop, re-migrate, optional seed)                      | `pnpm prisma:reset`               | `docker-compose exec app pnpm prisma:reset`                                                                                                                                                     |
| Seed (roles, permissions, optional admin)                       | `pnpm prisma:seed`                | `docker-compose exec app pnpm prisma:seed`                                                                                                                                                      |
| Open Prisma Studio                                              | `pnpm prisma:studio`              | `docker-compose exec app pnpm prisma:studio`                                                                                                                                                    |

**When migrations run:** With Docker, migrations run **automatically on app start** via `prisma migrate deploy`. Locally, run `pnpm prisma:init` and `pnpm prisma:migrate` (or `prisma migrate deploy`) yourself after creating the database.

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
