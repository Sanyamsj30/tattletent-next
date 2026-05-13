# TattleTent

City-level grievance tracking platform with role-based portals (Citizen/Staff/Admin), image-based complaint submissions, SLA reminders/escalation, and a public transparency view including a geospatial heatmap.

## Tech

- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express + Mongoose
- Database: MongoDB (GeoJSON + `2dsphere` index for heatmap)

## Run (local)

### 1) Start MongoDB

Run a local MongoDB instance (for example on `mongodb://localhost:27017`).

### 2) Backend

From `backend/`:

- Configure `backend/.env` (at minimum `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRE`, and email creds if you want OTP/notifications).
- Install deps: `npm install`
- (Optional) seed departments + SLA rules: `npm run seed:defaults`
- Start API: `npm run start`

### 3) Frontend

From `frontend/`:

- Install deps: `npm install`
- Start UI: `npm run dev`

Frontend expects the backend at `http://localhost:5000` and runs at `http://localhost:5173`.

## Notes

- Do not commit real secrets in `.env` to git; use env vars or a private secrets manager for production.

