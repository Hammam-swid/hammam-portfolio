# Running and deploying the portfolio

This repo holds three separate projects:

| Folder   | What it is                                   | Runs as                    | Domain (example)    |
| -------- | -------------------------------------------- | -------------------------- | ------------------- |
| `/`      | Public portfolio (Vite + React)              | static files               | `hammam.ly`         |
| `admin/` | Admin panel to manage content (Vite + React) | static files               | `admin.hammam.ly`   |
| `api/`   | Express + TypeORM + MySQL API, media uploads | Node.js app (Passenger)    | `api.hammam.ly`     |

Only `api/` needs Node.js on the server. The other two are plain files after `npm run build`.

---

## Local development

Requirements: Node 20.19+ and a local MySQL 8.

```powershell
# 1. API
cd api
npm install
copy .env.example .env        # then set DB_USER / DB_PASSWORD / JWT_SECRET
npm run hash-password -- "choose-a-password"   # paste the output into ADMIN_PASSWORD_HASH (keep the quotes)
# create the database once:  CREATE DATABASE portfolio CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
npm run migration:run
npm run db:seed               # imports api/seed/*.json + media (use --force to wipe and re-seed)
npm run dev                   # http://localhost:4000

# 2. Admin panel (new terminal)
cd admin
npm install
npm run dev                   # http://localhost:5174

# 3. Portfolio (new terminal, repo root)
npm install
npm run dev                   # http://localhost:5173
```

Both frontends read the API URL from `VITE_API_URL` (`.env.local`, defaults to `http://localhost:4000`).

Changing the database schema: edit an entity in `api/src/entities/`, then run
`npm run migration:generate -- src/migrations/<Name>` and `npm run migration:run`.

---

## Deploying to cPanel (Libyan Spider)

Before buying or upgrading, ask support to confirm that your plan has **Setup Node.js App**
with **Node 20.19 or newer**, plus at least one MySQL database and two subdomains.

### 1. Database
cPanel → **MySQL Databases**: create a database and user, add the user to the database with
*All privileges*. Note the full names (cPanel prefixes them, e.g. `cpuser_portfolio`).

### 2. Subdomains
cPanel → **Domains**: create `api.<domain>` and `admin.<domain>`. Give each its own document
root (e.g. `api.<domain>` and `admin.<domain>` folders), then run **SSL/TLS Status → Run AutoSSL**.

### 3. API (`api.<domain>`)
1. Locally: `cd api && npm run build`.
2. Upload these into a folder **outside** `public_html`, e.g. `~/portfolio-api/`:
   `dist/`, `seed/` (only needed for the first seed), `package.json`, `package-lock.json`.
3. cPanel → **Setup Node.js App** → *Create application*:
   - Node.js version: **20.19+** (22 recommended)
   - Application mode: Production
   - Application root: `portfolio-api`
   - Application URL: `api.<domain>`
   - Application startup file: `dist/server.js`
   - Environment variables: everything from `.env.example`, with:
     - `NODE_ENV=production`
     - `DB_HOST=localhost`, and the cPanel `DB_USER` / `DB_PASSWORD` / `DB_NAME`
     - `CORS_ORIGINS=https://<domain>,https://www.<domain>,https://admin.<domain>`
     - `UPLOAD_DIR=/home/<cpanel-user>/portfolio-uploads` (outside the app folder, so redeploys don't delete uploads)
     - a long random `JWT_SECRET` and your `ADMIN_PASSWORD_HASH`
4. Click **Run NPM Install**, then **Restart**. Migrations run automatically on start.
5. Seed once: in the app page, use *Run JS script* → `db:seed:prod`, or from the cPanel Terminal:
   `source ~/nodevenv/portfolio-api/<version>/bin/activate && cd ~/portfolio-api && npm run db:seed:prod`.
   Afterwards you can delete the uploaded `seed/` folder.
6. Check `https://api.<domain>/api/health` returns `{"ok":true}`.

### 4. Admin panel (`admin.<domain>`)
```powershell
cd admin
"VITE_API_URL=https://api.<domain>" | Set-Content -Encoding ascii .env.production.local
npm run build
```
Upload the **contents** of `admin/dist/` (including `.htaccess`) into the `admin.<domain>` document root.

### 5. Portfolio (`<domain>`)
```powershell
"VITE_API_URL=https://api.<domain>" | Set-Content -Encoding ascii .env.production.local
npm run build
```
Upload the **contents** of `dist/` (including `.htaccess`) into `public_html`.

### Updating later
- Content: use the admin panel; no redeploy needed.
- API code: rebuild, re-upload `dist/` (and `package.json` if dependencies changed → *Run NPM Install*), then *Restart*.
- Frontends: rebuild and re-upload `dist/`.
