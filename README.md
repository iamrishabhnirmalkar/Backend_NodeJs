# Backend Node.js

Express + TypeScript + Prisma (MySQL) API backend with health check, rate limiting, and Swagger docs.

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **pnpm** (`npm install -g pnpm`)
- **MySQL** 8.x (or MariaDB) running locally or remotely
- **Redis** (optional, for future use)

## Setup

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
  - Format: `mysql://USER:PASSWORD@HOST:3306/DATABASE`
  - Example: `mysql://root:yourpassword@localhost:3306/backend_nodejs_dev`
- `MYSQL_HOST`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_DATABASE` – Used by app config (e.g. non-Prisma code).
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

| Script                | Description                   |
| --------------------- | ----------------------------- |
| `pnpm dev`            | Start dev server (nodemon)    |
| `pnpm start`          | Start production server       |
| `pnpm build`          | Compile TypeScript to `dist/` |
| `pnpm test`           | Start server in test env      |
| `pnpm prisma:init`    | Generate Prisma client        |
| `pnpm prisma:migrate` | Run migrations (dev)          |
| `pnpm prisma:push`    | Push schema (no migrations)   |
| `pnpm prisma:reset`   | Reset DB (dev)                |
| `pnpm prisma:studio`  | Open Prisma Studio            |

## API docs

- Swagger UI: `http://localhost:8000/api-docs`

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
