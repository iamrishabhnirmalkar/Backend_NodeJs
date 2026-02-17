# Switching Database: MySQL → MariaDB or PostgreSQL

The app uses **Prisma** and **Docker**. You can run the same codebase with **MySQL**, **MariaDB**, or **PostgreSQL** by changing the database service and Prisma provider.

---

## Option 1: Switch to MariaDB (easiest)

MariaDB is MySQL-compatible. **No Prisma schema change** — keep `provider = "mysql"`. Only Docker and env change.

### Steps

1. **Use the MariaDB compose override** (recommended):

   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.mariadb.yml up -d --build
   ```

2. **Or** edit `docker-compose.yml` manually:
   - Replace the `mysql` service image with `mariadb:11` and use `MARIADB_*` env vars (see `docker-compose.mariadb.yml`).
   - Keep the service name as `mysql` so the app’s `DATABASE_URL` host stays `mysql` and no app env change is needed.

3. **Env**: Use the same `DATABASE_URL` format: `mysql://USER:PASSWORD@HOST:3306/DATABASE`
   - With the override, the DB service name stays `mysql`, so your existing `.env` (e.g. `DATABASE_URL=mysql://...@mysql:3306/...`) still works. Optionally set `MARIADB_*` to match your `MYSQL_*` values.

4. **Migrations**: Existing MySQL migrations work. Run:

   ```bash
   docker-compose exec app prisma migrate deploy
   ```

   Or start fresh: remove the volume and run again (new DB).

5. **Local (no Docker)**: Install MariaDB, keep `provider = "mysql"` and point `DATABASE_URL` to your MariaDB (e.g. `mysql://user:pass@localhost:3306/db`).

---

## Option 2: Switch to PostgreSQL

PostgreSQL uses a different Prisma provider and URL format. You need a **new Prisma schema** and **new migrations**.

### Steps

1. **Prisma schema**  
   In `prisma/schema.prisma` change the datasource to:

   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```

2. **DATABASE_URL** format for PostgreSQL:

   ```
   postgresql://USER:PASSWORD@HOST:5432/DATABASE?schema=public
   ```

   Example (Docker, service name `postgres`):  
   `postgresql://app_user:app_password@postgres:5432/backend_nodejs_dev?schema=public`

3. **Use the PostgreSQL compose override**:

   ```bash
   docker-compose -f docker-compose.yml -f docker-compose.postgres.yml up -d --build
   ```

4. **New migrations** (PostgreSQL cannot reuse MySQL migration history):

   ```bash
   # Remove old migrations for a clean start (optional; backup first)
   # Then create a new initial migration for PostgreSQL:
   docker-compose exec app sh -c "prisma migrate dev --name init_postgres"
   # Or deploy existing migrations if you already created them:
   docker-compose exec app prisma migrate deploy
   ```

5. **Regenerate Prisma Client** after changing provider:

   ```bash
   pnpm prisma:init
   ```

6. **Local (no Docker)**: Install PostgreSQL, set `DATABASE_URL=postgresql://user:pass@localhost:5432/dbname?schema=public`, run `pnpm prisma migrate dev`.

---

## Summary

| Target         | Prisma `provider` | DATABASE_URL format                                 | Docker override file          |
| -------------- | ----------------- | --------------------------------------------------- | ----------------------------- |
| **MySQL**      | `mysql`           | `mysql://user:pass@host:3306/db`                    | (default)                     |
| **MariaDB**    | `mysql`           | `mysql://user:pass@host:3306/db`                    | `docker-compose.mariadb.yml`  |
| **PostgreSQL** | `postgresql`      | `postgresql://user:pass@host:5432/db?schema=public` | `docker-compose.postgres.yml` |

---

## Env examples

### MariaDB (Docker)

```env
# Override keeps service name "mysql"; set MARIADB_* to match (or use MYSQL_* in .env)
MARIADB_ROOT_PASSWORD=rootpassword
MARIADB_DATABASE=backend_nodejs_dev
MARIADB_USER=app_user
MARIADB_PASSWORD=app_password
# App still connects to host "mysql"
DATABASE_URL=mysql://app_user:app_password@mysql:3306/backend_nodejs_dev
```

### PostgreSQL (Docker)

```env
# Service name in compose: postgres
POSTGRES_USER=app_user
POSTGRES_PASSWORD=app_password
POSTGRES_DB=backend_nodejs_dev
DATABASE_URL=postgresql://app_user:app_password@postgres:5432/backend_nodejs_dev?schema=public
```

Use these in your `.env` when running with the corresponding override file.
