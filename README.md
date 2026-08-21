# Task Management App — Node/Express + MySQL + React

This is the MERN-stack reference doc converted to use **MySQL** instead of MongoDB
(raw SQL via `mysql2`, no ORM needed) and **local disk storage** for file uploads
instead of Cloudinary (so it runs without any cloud storage account).

## What's done (~80%)
- ✅ Full JWT auth (register/login/me) with bcrypt password hashing
- ✅ Full task CRUD, scoped per-user
- ✅ Filtering by status/priority, text search, due-date range, pagination
- ✅ File attachment upload (multer, stored in `backend/uploads/`, served statically)
- ✅ Weather lookup endpoint + frontend badge (OpenWeatherMap)
- ✅ Email notifications on task create/complete (Nodemailer, Gmail App Password)
- ✅ Full React frontend: login/register/dashboard, filters, search, pagination,
  create/edit modal with file upload, protected routes, axios JWT interceptor
- ✅ MySQL schema + one-command DB init script

## What YOU still need to do (the remaining ~20%)
1. **Install MySQL locally** (or use a free cloud MySQL like PlanetScale/Railway) and create a `.env`
   in `backend/` from `.env.example` with your real `DB_USER` / `DB_PASSWORD`.
2. Get a **free OpenWeatherMap API key** (openweathermap.org) — paste into `OPENWEATHER_API_KEY`.
   Without it, weather badges just won't show (nothing breaks).
3. **Gmail App Password** (or swap to Resend/SendGrid) for `EMAIL_USER`/`EMAIL_PASS`.
   Without it, emails are silently skipped (nothing breaks).
4. Generate a random `JWT_SECRET` (any long random string works).
5. Deploy: backend → Render/Railway, frontend → Vercel/Netlify (set `VITE_API_URL`
   to your deployed backend's `/api` URL).
6. Optional polish for interviews: loading skeletons, toast notifications instead
   of `alert`/`confirm`, unit tests, rate limiting on auth routes.

## How to run locally

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env
# edit .env with your MySQL credentials, JWT secret, etc.
npm run db:init      # creates the database + tables
npm run dev           # starts on http://localhost:5000
```

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev           # starts on http://localhost:5173
```

Open http://localhost:5173, register an account, and start creating tasks.

## Why MySQL instead of MongoDB here
- The models (`backend/models/User.js`, `backend/models/Task.js`) use plain
  parameterized SQL queries via `mysql2/promise` — no Mongoose syntax, no
  schema-less documents. If you already know SQL joins/filters, this will
  feel familiar.
- `backend/sql/schema.sql` is the single source of truth for your tables —
  open it any time to see exactly what's stored, no hidden ODM magic.
- Everything else (Express routes, JWT auth, React frontend) stays the same
  shape as the original MERN reference doc, so this is still a legitimate
  answer to "build a full-stack task app" even though it's MySQL instead of Mongo.

## Talking points for interviews
- Explain the trade-off: MongoDB is schema-flexible and horizontally scalable;
  MySQL enforces referential integrity (the `ON DELETE CASCADE` foreign key
  from tasks → users) and is a better fit when your data is naturally relational.
- Walk through the dynamic filter-building in `Task.js findAllForUser()` —
  it's a good example of building parameterized SQL safely (no string
  concatenation, no SQL injection risk).
- Mention the fire-and-forget pattern for email/weather in `taskController.js`
  createTask — the API responds immediately and side effects happen after,
  so a slow third-party API never blocks the user.
