# Verify Database Connection (Windows, Mac, Linux)

Use this to confirm the server runs and the **database connection works** for both **Docker** and **local** on any OS.

---

## 1. Docker (Windows, Mac, Linux – same steps)

Docker runs the same Linux containers on all hosts. Database connection uses the service name `mysql` inside the network.

### Steps

1. **Start stack**

   ```bash
   cp .env.docker.example .env
   docker-compose up -d --build
   ```

2. **Wait for healthy**
   Wait ~30–60 seconds for MySQL and app to be healthy. Optional:

   ```bash
   docker-compose ps
   ```

   All services should be “Up” and (for app) “healthy”.

3. **Check health (database connected)**
   - **Windows (PowerShell):**
     ```powershell
     Invoke-RestMethod -Uri http://localhost:8001/api/v1/health
     ```
   - **Windows (cmd) / Mac / Linux:**
     ```bash
     curl http://localhost:8001/api/v1/health
     ```
     Use port **8001** if your `.env` has `PORT=8001` (host port). Otherwise try `8000`.

4. **Expected**
   - HTTP 200.
   - JSON includes `"database": "CONNECTED"`.
   - If you see `"database": "DISCONNECTED"`, check `docker-compose logs app` (e.g. wrong `DATABASE_URL`, MySQL not ready).

### Summary (Docker)

| OS      | Start                  | Health URL                            | Same behavior |
| ------- | ---------------------- | ------------------------------------- | ------------- |
| Windows | `docker-compose up -d` | `http://localhost:8001/api/v1/health` | Yes           |
| Mac     | Same                   | Same                                  | Yes           |
| Linux   | Same                   | Same                                  | Yes           |

---

## 2. Local (Windows, Mac, Linux)

You run the app with Node on your machine. Database connection uses `DATABASE_URL` from `.env` or `.env.development` (dotenv-flow). No OS-specific logic in the app; only your env and MySQL setup differ.

### Steps

1. **MySQL running**
   - **Windows:** XAMPP / WAMP – start MySQL.
   - **Mac:** `brew services start mysql` or MAMP.
   - **Linux:** `sudo systemctl start mysql` (or mariadb).

2. **Create database**
   Create the database that matches `DATABASE_URL` (e.g. `backend_nodejs_dev`):
   - phpMyAdmin (XAMPP/WAMP/MAMP), or
   - MySQL CLI: `CREATE DATABASE backend_nodejs_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`

3. **Env**
   In project root, copy and edit env:

   ```bash
   cp .env.example .env
   # or for development: cp .env.example .env.development
   ```

   Set **exactly** (no variable expansion in Prisma):

   ```env
   DATABASE_URL=mysql://USER:PASSWORD@localhost:3306/backend_nodejs_dev
   ```

   Examples:
   - No password: `mysql://root:@localhost:3306/backend_nodejs_dev`
   - With password: `mysql://root:yourpass@localhost:3306/backend_nodejs_dev`
     Port **3306** unless your MySQL uses another (e.g. 3307).

4. **Generate client and migrate**

   ```bash
   pnpm prisma:init
   pnpm exec prisma db push
   # or: pnpm prisma:migrate
   ```

   If this fails, the app will not connect either. Fix `DATABASE_URL` and/or create the DB.

5. **Start server**

   ```bash
   pnpm dev
   ```

   You should see: `Server running at http://localhost:8000 (port 8000)`.

6. **Check health (database connected)**
   - **Windows (PowerShell):**
     ```powershell
     Invoke-RestMethod -Uri http://localhost:8000/api/v1/health
     ```
   - **Windows (cmd) / Mac / Linux:**
     ```bash
     curl http://localhost:8000/api/v1/health
     ```

7. **Expected**
   - HTTP 200.
   - JSON includes `"database": "CONNECTED"`.

### Summary (Local)

| OS      | MySQL / DB setup               | Env file                     | DATABASE_URL                          | Same behavior |
| ------- | ------------------------------ | ---------------------------- | ------------------------------------- | ------------- |
| Windows | XAMPP/WAMP, create DB          | `.env` or `.env.development` | `mysql://user:pass@localhost:3306/db` | Yes           |
| Mac     | Homebrew/MAMP, create DB       | Same                         | Same                                  | Yes           |
| Linux   | systemctl / MariaDB, create DB | Same                         | Same                                  | Yes           |

The app does not use OS-specific paths for the database; it only reads `DATABASE_URL` from the environment.

---

## 3. Quick reference

| Run    | How to verify DB connected                                             | Works on            |
| ------ | ---------------------------------------------------------------------- | ------------------- |
| Docker | `curl http://localhost:8001/api/v1/health` → `"database": "CONNECTED"` | Windows, Mac, Linux |
| Local  | `curl http://localhost:8000/api/v1/health` → `"database": "CONNECTED"` | Windows, Mac, Linux |

If you see `"database": "DISCONNECTED"`:

- **Docker:** Check `docker-compose logs app` and that `DATABASE_URL` in the app service uses host `mysql` and user `app_user`. See [TROUBLESHOOTING.md](TROUBLESHOOTING.md#local-mysql-xampp--wamp--mamp-database-not-connected).
- **Local:** Check `DATABASE_URL` in `.env` / `.env.development`, that the database exists, and that MySQL is running. See [TROUBLESHOOTING.md](TROUBLESHOOTING.md).
