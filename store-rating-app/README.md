# Storefront Ratings

Role-based store rating app. Stack: Express + Prisma + PostgreSQL, React (Vite) + Tailwind.

## Features
- **One login for three roles**: System Administrator, Normal User, Store Owner. Normal users self-register.
- **Admin**: analytics dashboard (totals, average rating, rating distribution, top stores, recent ratings), add users/admins/owners/stores, filter and sort every list, user detail view (owners show their store's rating).
- **Normal user**: browse and search stores, 1-5 star rating that can be changed later, filters (All / Rated by me / Not rated yet), sorting, pagination.
- **Store owner**: average rating, rating breakdown chart, searchable and sortable list of raters, CSV export.
- **Everyone**: change password, live password-rule checklist, light and dark mode, responsive layout with a mobile drawer, toasts, skeleton loaders, accessible controls (labels, keyboard, aria, reduced motion).
- **Backend**: server-side pagination, Zod validation, JWT auth, role guards, rate limiting, helmet, hashed passwords, DB-level CHECK on ratings.

## Run locally

Requirements: Node 18+, PostgreSQL.

```bash
# 1. Database
psql -U postgres -c "CREATE DATABASE store_rating;"

# 2. Backend
cd backend
cp .env.example .env     # then edit DATABASE_URL and JWT_SECRET
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"   # paste output as JWT_SECRET
npm install
npm run migrate:deploy               # applies the included migration (tables, indexes, CHECK 1-5)
npm run seed                         # creates first admin (see SEED_ADMIN_* in .env)
npm run dev                          # http://localhost:5000

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev                          # http://localhost:5173
```

Log in as the seeded admin (default `admin@example.com` / `Admin@12345`, change it at once under Password).

## Try the full flow
1. Admin: Add user with role **Store owner**, then Add store and pick that owner.
2. Sign up a normal user at `/signup`, rate the store.
3. Log in as the owner to see the average and who rated.

## Tests
- `cd backend && npm test`: validation, auth and role tests (no database needed).
- `cd backend && npm run test:e2e`: full-flow tests against your real database (10 scenarios: roles, ratings, search, sorting, filters, password change, cascades). It cleans up after itself. Needs a migrated database and a valid `.env`.

Both suites and a browser walkthrough of all three roles (including pagination, dark mode and mobile) passed before this was packaged.

## Changing the schema later
Edit `backend/prisma/schema.prisma`, then run `npm run migrate` (creates a new migration) and commit it. The included `init` migration also adds a database-level CHECK so a rating can never be outside 1-5.

## Roles and rules
- Signup always creates a normal user. Admins and owners are created by an admin.
- Name 20-60 chars, address max 400, password 8-16 with an uppercase letter and a special character. Enforced on both client and server (Zod).
- One rating per user per store (unique index); submitting again updates it.
- Average rating is computed from the ratings table, never stored.

## API summary
| Method | Path | Access |
|---|---|---|
| POST | /api/auth/signup, /api/auth/login | Public |
| GET | /api/auth/me | Any user |
| PATCH | /api/auth/password | Any user |
| GET | /api/admin/stats | Admin |
| GET/POST | /api/admin/users | Admin |
| GET | /api/admin/users/:id | Admin |
| GET/POST | /api/admin/stores | Admin |
| GET | /api/admin/owners/available | Admin |
| GET | /api/stores?search&sortBy&order | Normal user |
| PUT | /api/stores/:id/rating | Normal user |
| GET | /api/owner/dashboard | Store owner |

## Production checklist
- Set `NODE_ENV=production`, a strong `JWT_SECRET`, real `CLIENT_URL` (CORS), HTTPS.
- Use `npm run migrate:deploy` in production (never `migrate dev`).
- Change the seeded admin password. Build the frontend with `npm run build` and serve `dist/`; set `VITE_API_URL` if the API is on another domain.
- Enable database backups and log shipping/monitoring.

## Known limits (by design, to keep the MVP lean)
- Store lists sorted by rating are sorted in memory before paging (fine for thousands of stores; move to SQL for much larger data).
- No email-based password reset, no admin edit/delete screens (not in the brief).
- JWT is kept in localStorage; for a higher-security deployment move it to an httpOnly cookie.
