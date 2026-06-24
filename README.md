# ⛺ TattleTent - Civic Grievance & SLA Governance Platform

TattleTent is a modern, full-stack, AI-assisted municipal grievance tracking and SLA governance platform. It empowers citizens to report local issues with photo evidence and high-accuracy GPS coordinates, while enabling civic administrators and contractors to manage, auto-assign, resolve, and audit grievances under strict SLA policies. A public Transparency Portal builds civic trust through real-time ledger data.

## 🔗 Live Deployment Links
*   **Production Frontend (Vercel)**: [https://tattletent-next.vercel.app](https://tattletent-next.vercel.app)
*   **Production Backend (Render)**: [https://tattletent-next-bakend.onrender.com](https://tattletent-next-bakend.onrender.com)
*   **SLA Escalation Webhook**: [https://tattletent-next-bakend.onrender.com/api/jobs/escalate](https://tattletent-next-bakend.onrender.com/api/jobs/escalate)

---

## 🚀 Key Features

### 1. Multi-Role Portals
*   **Citizen Console**: File complaints easily with title, category, description, and photo attachments. Features live, reactive geolocation coordinates. Citizens can view their filed grievances, support active local issues, and verify fixes.
*   **Contractor Dashboard**: A dedicated workspace for civic staff to view active work queues, track SLA deadlines, report resolution summaries, and submit completion reports.
*   **Executive Admin Panel**: Full administrative control with high-level statistics counters, a dual Queue Workspace vs. Interactive Map layout showing status-colored marker pins, assignment audit logs, and override options (manual staff reassignment and forced SLA escalation).

### 2. Proximity Detection & Duplicate Prevention
*   **Nearby Proximity Warn**: During grievance filing, the system performs a geospatial search (`$geoNear`) for similar unresolved complaints within 100 meters.
*   **Independent Action Paths**: Citizens are presented with duplicate options:
    *   *Support This Complaint*: Registers their endorsement to the existing ticket to boost its urgency/priority.
    *   *Still Submit My Complaint*: Files a separate ticket anyway without blockages.
*   **Smart Fallbacks**: Features robust location string matching to verify address differences and prevent false duplicates.

### 3. Priority Scoring & Automated SLA Escalations
*   **Dynamic Priority Scoring**: Every complaint is evaluated on a 0-100 scale using a deterministic breakdown of:
    *   Severity level (Up to 40 points)
    *   Duplicate support count (Up to 20 points)
    *   Days pending (Up to 10 points)
    *   Critical locations (Up to 10 points)
    *   SLA breach count (Up to 20 points)
*   **Automated Escalations**: An automated background checker evaluates SLA deadlines.
    *   *Low/Medium priority* tickets breach deadlines and automatically elevate.
    *   *High priority* tickets that breach deadlines trigger contractor unassignment, status reset to `NEW`, and flag administrative alerts.
*   **Staff Performance Impact**: SLA breaches directly affect contractor performance scores and adjust their auto-routing suitability rank.

### 4. Public Transparency Ledger
*   **Civic Transparency Portal**: A publicly accessible ledger of city grievances featuring advanced searches, status filters, and category breakdowns.
*   **Unique Complaints Tab**: Filters out redundant duplicates, showing only distinct physical incidents.
*   **PDF/CSV Exporting**: Citizens can download certified PDF receipts of grievances or export ledger summaries to CSV.

### 5. Security & Data Integrity Controls
*   **Service-Level BOLA Safeguards**: Enforces strict data ownership validation inside query filters (e.g., scoping citizen search queries to their own user IDs).
*   **Anti-Manipulation Protections**: Blocks authors from supporting/voting on their own complaints to prevent artificial escalation.
*   **Dynamic Performance Auditing**: Recalculates contractor average resolution times (`avgResolutionTime`) and compliance rates (`slaComplianceRate`) dynamically upon complaint resolution.
*   **Feedback Lock**: Validates that feedback and star ratings can only be submitted for grievances with a `RESOLVED` status.
*   **API Load Protections**: Implements strict date format verification on query filters and caps API search pagination to 100 entries.

---

## 🤖 Agentic AI Governance

TattleTent is built on autonomous agent workflows that operate in the background to streamline municipal workloads:

*   **Duplicate Detection Agent**: Integrates smart location comparison (matching addresses and coordinate proximity) and category alignment. If a candidate complaint matches an active grievance, the agent flags it, links it to the original master ticket (`duplicate_of`), and automatically upgrades the original ticket's severity and priority scores to account for the increased supporter volume.
*   **Assignment Recommendation Agent**: Runs instantly upon ticket creation to match the optimal contractor. The agent parses departmental guidelines, active workloads, and live contractor availability metrics. It calculates ranking suitability based on past SLA compliance rates, average resolution times, and citizen ratings, assigning the best candidate with zero administrative latency.
*   **AI Urgency Analysis Agent**: Triggers automatically in the background during manual or automated SLA escalations. The agent evaluates the complaint title, description, category, and historical delay factors using language model parameters (Groq/Gemini APIs) to generate a detailed, readable *Urgency Justification* for citizens and admins.

---

## 🛠️ Technology Stack
*   **Frontend**: React (Vite), Tailwind CSS, Leaflet Maps, Framer Motion, Axios, jsPDF
*   **Backend**: Node.js, Express, Mongoose, node-cron
*   **Database**: MongoDB (GeoJSON + `2dsphere` geospatial indexing)

---

## 📦 Local Development

### Prerequisites
*   Node.js (v18+)
*   MongoDB running locally (typically `mongodb://localhost:27017`)

### 1. Backend Setup
1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Configure your environmental variables in `backend/.env` (see template below).
4.  Seed departments and SLA rules:
    ```bash
    npm run seed:defaults
    ```
5.  *(Optional)* Seed simulated contractor performance profiles:
    ```bash
    node scripts/seed-staff-perf.js
    ```
6.  Start the development server:
    ```bash
    npm start
    ```

### 2. Frontend Setup
1.  Navigate to the frontend directory:
    ```bash
    cd ../frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the Vite development server:
    ```bash
    npm run dev
    ```

---

## ⚙️ Environment Variables (`backend/.env`)

Create a `.env` file in the `backend/` folder:

```env
MONGODB_URI=mongodb://localhost:27017/TattleTent
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=1d

# Email credentials for OTP/notifications
EMAIL_SERVICE=smtp # Options: resend, gmail, smtp, brevo, sendgrid (Optional: forces specific provider)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password
RESEND_API_KEY=re_your_resend_api_key_here

# Admin defaults
ADMIN_NAME=Executive Admin
ADMIN_EMAIL=admin@tattletent.gov
ADMIN_PASSWORD=secure_admin_password

# Webhook Security
CRON_API_KEY=your_secure_cron_key_here
```

---

## 🌐 Production Deployment

### 1. Database Configuration
*   Deploy a MongoDB cluster (e.g., MongoDB Atlas).
*   Ensure a `2dsphere` index is created on the `geolocation` field of the `complaints` collection:
    ```javascript
    db.complaints.createIndex({ "geolocation": "2dsphere" })
    ```

### 2. Backend (e.g., Render, Heroku)
*   Deploy the `backend` folder.
*   Configure the Environment Variables on your hosting provider dashboard.
*   Set the `BASE_URI` to your backend's production domain.

### 3. Frontend (e.g., Vercel, Netlify)
*   Set the environment variable `VITE_API_URL` to point to your deployed backend domain.
*   Build the application: `npm run build` and deploy the output `dist` folder.

### 4. Setup Secure SLA Escalation & Keep-Alive Cron Jobs
Render free tier web services spin down (sleep) after 15 minutes of inactivity. To prevent this without hitting email or database limits, you should split your cron jobs into two distinct tasks on your cron provider (such as [cron-job.org](https://cron-job.org)):

1.  **Lightweight Server Keep-Alive (Every 14 minutes)**:
    *   **URL**: `https://<your-backend-domain>/api/jobs/ping`
    *   **Method**: `GET`
    *   **Purpose**: Pings the server to keep it awake. This does **not** execute database queries or send emails, ensuring you do not deplete your limits.
2.  **Overdue SLA Escalation check (Every 6 to 12 hours)**:
    *   **URL**: `https://<your-backend-domain>/api/jobs/escalate`
    *   **Method**: `POST`
    *   **Headers**:
        *   **Key**: `x-cron-key`
        *   **Value**: `<your_secure_cron_key_here>` (matches the `CRON_API_KEY` defined in backend env variables)
    *   **Purpose**: Runs the heavy automated SLA priority escalation checks and triggers overdue alert notifications. Recommended to run twice a day (every 12 hours).

---

## 🔍 Verification & Diagnostics

We provide several utility scripts inside the `backend/scripts/` folder to check database states, reset data, and run tests:

### 1. Database Geolocation Check
To check the contents of your local database and output geolocation points:
```bash
cd backend
node scripts/check-db.js
```
This utility script connects directly to MongoDB, fetches active grievances, and prints their GeoJSON coordinate pairings.

### 2. Reset Database (Clean State)
To delete all non-admin users, complaints, feedback, audit logs, and OTPs while preserving default admin accounts:
```bash
cd backend
node scripts/purge-database.js
```

### 3. Backend API Smoke Test
To verify key backend API endpoints (without running a full browser):
```bash
cd backend
node scripts/smoke-test.js
```

---

## 🧪 Testing & Linting

For a detailed manual verification checklist of signup/login, citizen dashboard flows, contractor updates, and public maps, please refer to:
*   [TESTING.md](TESTING.md)

### Frontend Quality Checks
To run the React/Vite frontend lint and production build checks:
```bash
cd frontend
npm run lint
npm run build
```
