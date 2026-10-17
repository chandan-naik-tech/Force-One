# Force One — personal garage website

```
force-one/
├─ start.js · start.bat · start.sh   ← one-command launcher
├─ backend/    Node + Express API, SQLite database, media storage (.env lives here)
└─ frontend/   React + Vite + Tailwind + Framer Motion           (.env lives here)
```

## Run it
Needs only [Node 20+](https://nodejs.org).

| System | Command |
|---|---|
| Windows | double-click `start.bat` |
| Mac / Linux | `./start.sh` |
| Any | `node start.js` |

First run installs dependencies, creates `backend/.env`, creates the SQLite database (pre-filled with the Force One data) and opens the site.
The terminal then prints a **connection summary** (website, admin URL, database, storage status). `Ctrl+C` stops everything.
Production-style run (backend serves the built site on one port): `node start.js --prod`.

Admin: `/admin` — email and password are `ADMIN_EMAIL` / `ADMIN_PASSWORD` in `backend/.env` (change them).

## Configuration
- `backend/.env` — `DATABASE_PATH` (SQLite file), JWT secret, admin login, storage (S3). Template: `backend/.env.example`.
- `frontend/.env` — `VITE_API_TARGET`, where the dev server forwards `/api` and `/uploads`.

## Storage
With `S3_BUCKET` empty, uploads go to `backend/uploads` (development only). For a real deployment set the `S3_*` values
(Cloudflare R2, AWS S3, Backblaze B2, Supabase) so media lives outside your app and survives every redeploy.
Videos upload straight from the browser to the bucket, so add a CORS rule: origins = your site, methods = `PUT`, headers = `*`.

## Deploy
Any Node host with a **persistent disk**: `npm run build`, then `npm run serve` with the `backend/.env` values as environment variables (`NODE_ENV=production`).
Point `DATABASE_PATH` at the persistent disk (e.g. `/data/forceone.db`) so the database survives redeploys, and back that file up — it is your whole site's content. Express serves the built frontend, so there is a single origin and no CORS.

## Logo
`frontend/public/logo.png` is the default badge (loader, nav, footer, page transitions, tilt badge). Admin → Settings can upload a replacement.

## Editing everything
Admin → **Vehicle** (all facts, launch info, dimensions), **Variants** (EX / SX / LX), **Features**, **Hero**, **Page text** (section titles and show/hide toggles),
**Gallery / Videos / Journey / Memories / Services**, **About**, **Settings** (logo, social links) and **Account** (change password; `ADMIN_PASSWORD` is only used the first time).

## Admin access
A **🔒 Admin** button sits in the top navigation (and in the footer / mobile menu) → `/admin`. After signing in, the nav shows **Dashboard**, every home-page section gets an **Edit this section** chip, and a floating bar offers **Add photos / Add videos / Dashboard / Sign out**.

## 3D view
`/3d` and the "Explore in 3D" home section show a built-in 3D Force One (drag to rotate, view presets, lights, paint preview, info hotspots). It is a model built from the published dimensions and the profile of the real vehicle — not a scan.
To use a better model, export a `.glb` and upload it in Admin → Settings → "Custom 3D model". (If your storage bucket is cloud-hosted, allow `GET` from your site origin in its CORS rules.)

## The car drawing
The hero and the Dimensions section use `frontend/public/car-blueprint.webp` (transparent line art) and `frontend/public/car-fill.webp` (its body silhouette, used for the light-blue tint). The Force emblem on the grille is your uploaded logo, drawn over the artwork.
To use a **photo or video** in the hero instead, set it in Admin → Hero; it replaces the drawing.

## Start with Python
`python main.py` does the same as `node start.js` (flags such as `--no-open` and `--prod` are passed through). Node.js 20+ is still required, because the site runs on Node.

## Starting with Python
If you prefer Python, `python main.py` does the same as `node start.js` (it checks Node 20+ is installed, then runs `start.js`). It accepts the same flags: `--no-open` and `--prod`.

## Deploying
The site has two parts, and **Vercel can only host the frontend**. The backend keeps a SQLite file and uploaded images on disk, which Vercel's serverless functions cannot do.

1. **Backend** → a host with a persistent disk (Render, Railway or Fly.io). Root directory `backend`, build `npm install`, start `npm start`. Mount the disk and point `DATABASE_PATH` and uploads at it. Set `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD` and `NODE_ENV=production`. (Or set the `S3_*` variables to keep uploads in a bucket.)
2. **Frontend** → Vercel. Import the repo and set **Root Directory to `frontend`** (this is what stops Vercel from seeing `main.py` and failing with `PYTHON_ENTRYPOINT_NOT_FOUND`). Framework preset: Vite. Build `npm run build`, output `dist`.
3. Open `frontend/vercel.json` and replace `YOUR-BACKEND-URL` with your backend's address, then redeploy. The rewrites keep `/api` and `/uploads` on the same domain, so the admin login cookie works.
