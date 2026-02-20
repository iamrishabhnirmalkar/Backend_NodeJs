# Troubleshooting

## Nodemon

### “Restarting due to changes” many times / “Server running” twice

**Cause:** Nodemon was watching the whole project, including the **`logs/`** folder. The app writes log files there on every request, so each write triggered a restart → many restarts and “Server running” appearing again after each one.

**Fix:** The project has a **`nodemon.json`** that:

- **Watches only** `src` and `prisma` (so only code changes restart the server).
- **Ignores** `logs/`, `generated/`, `dist/`, `node_modules/`, `.env`, etc., so log files and generated files no longer trigger restarts.

After pulling this, run `pnpm dev` again; you should see at most one “Server running” and no repeated restarts unless you change files in `src` or `prisma`.

**“Terminate batch job (Y/N)?” twice:** On Windows, pressing Ctrl+C once can show the message; sometimes the shell asks again. Press **Y** and Enter once; if it asks again, press Y and Enter again to exit.

---

## Prisma

### Windows: EPERM when running `prisma generate` or `prisma:init:clean`

**Errors you might see:**

- `EPERM: operation not permitted, rename '...\query_engine-windows.dll.node.tmp...' -> '...\query_engine-windows.dll.node'` (during `prisma generate`)
- `EPERM: operation not permitted, unlink '...\query_engine-windows.dll.node'` (during `pnpm prisma:init:clean` / rimraf)

**Cause:** A process on Windows has `query_engine-windows.dll.node` open (e.g. Node, VS Code, `pnpm dev`, Prisma Studio, or antivirus). Until that process releases the file, neither Prisma nor rimraf can rename or delete it.

**Fix: close what’s holding the file, then run again**

1. **Close everything that might be using the project:**
   - Stop `pnpm dev` (Ctrl+C in the terminal where it’s running).
   - Close **Prisma Studio** if it’s open.
   - Close **VS Code** completely (or at least close this folder/workspace).
   - In **Task Manager** (Ctrl+Shift+Esc), end every **“Node.js JavaScript Runtime”** process.

2. **Run clean generate again:**

   ```bash
   pnpm prisma:init:clean
   ```

3. **If it still fails:** Restart your PC, open **only** a new terminal (don’t open VS Code or start the dev server yet), `cd` to the project, and run:

   ```bash
   pnpm prisma:init:clean
   ```

4. **If you develop with Docker only:** You can avoid the lock by generating inside the container (Linux, no Windows lock):

   ```bash
   docker-compose up -d
   docker-compose exec app pnpm prisma:init
   ```

   Use this when you run the app in Docker; the host `generated/` folder is not used for that.

5. **Antivirus:** If the lock persists, add the project folder (or `generated\`) to your antivirus exclusions.

**Summary:** `prisma:init:clean` also needs to **delete** the same file; if something has it open, the delete fails too. Always close Node, VS Code, and dev tools first, then run `pnpm prisma:init:clean`.

**Mac / Linux / Docker:** This EPERM issue is uncommon; `pnpm prisma:init` or `pnpm prisma:init:clean` usually works without extra steps.

---

### Prisma config deprecation warning

**Message:**  
`The configuration property package.json#prisma is deprecated and will be removed in Prisma 7. Please migrate to a Prisma config file (e.g., prisma.config.ts).`

**Fix:** This project uses **`prisma.config.ts`** at the repo root for the seed command. The `package.json` "prisma" block has been removed. If you still see the warning, ensure you have no `"prisma": { "seed": "..." }` in `package.json` and that `prisma.config.ts` exists with a `migrations.seed` entry. Seed then runs the same on Windows, Mac, Linux, and Docker.

---

### Local MySQL (XAMPP / WAMP / MAMP): “Database not connected”

**Symptom:** XAMPP MySQL is running, but the app shows **database: DISCONNECTED** (e.g. at `/api/v1/health`) or Prisma errors when starting or calling the API.

**Prisma uses only `DATABASE_URL`.** The app loads env from `.env` and, if `NODE_ENV=development`, from `.env.development` (dotenv-flow). Whichever file sets `DATABASE_URL` last wins.

**Checklist:**

1. **`DATABASE_URL` format (exact)**  
   Must be a single URL:  
   `mysql://USER:PASSWORD@HOST:PORT/DATABASE`  
   Examples:
   - XAMPP default (root, no password):  
     `DATABASE_URL=mysql://root:@localhost:3306/backend_nodejs_dev`
   - With password:  
      `DATABASE_URL=mysql://root:yourpassword@localhost:3306/backend_nodejs_dev`  
     If the password contains `@`, `#`, or `:`, [URL-encode](https://developer.mozilla.org/en-US/docs/Glossary/Percent-encoding) it (e.g. `@` → `%40`).

2. **Database must exist**  
   The database name in `DATABASE_URL` (e.g. `backend_nodejs_dev`) must exist in MySQL.
   - In XAMPP: open **phpMyAdmin** → **Databases** → create database `backend_nodejs_dev` (e.g. utf8mb4_unicode_ci).
   - Or in MySQL CLI:  
     `CREATE DATABASE backend_nodejs_dev CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`

3. **Port**  
   XAMPP MySQL is usually **3306**. If you changed it (e.g. to 3307), use that port in `DATABASE_URL`:  
   `mysql://root:@localhost:3307/backend_nodejs_dev`

4. **Which file sets `DATABASE_URL`**
   - If you run with `NODE_ENV=development` (e.g. `pnpm dev`), dotenv-flow loads `.env` then `.env.development`.
   - Put the correct `DATABASE_URL` in **`.env`** or **`.env.development`**; the one loaded last wins.
   - Avoid leaving an old/wrong `DATABASE_URL` in `.env.development` if you fixed it only in `.env`.

5. **Test the connection**  
   In the project folder (same env as the app):

   ```bash
   pnpm prisma:init
   pnpm exec prisma db push
   ```

   If this fails, the app will not connect either. Fix `DATABASE_URL` and/or create the database, then try again.

6. **Redis (optional)**  
   The app may start even if Redis is down; if you don’t use Redis locally, you can ignore Redis errors. Database connection is separate and uses only `DATABASE_URL`.

**Quick XAMPP setup:**

- In **phpMyAdmin**: create database `backend_nodejs_dev`.
- In **`.env`** (or `.env.development`):  
  `DATABASE_URL=mysql://root:@localhost:3306/backend_nodejs_dev`  
  (Change `root` and password if you use another user.)
- Run:  
  `pnpm prisma:init` then `pnpm exec prisma db push` or `pnpm prisma:migrate`
- Start the app:  
  `pnpm dev`
- Check:  
  `GET http://localhost:8000/api/v1/health` → `"database": "CONNECTED"`.
