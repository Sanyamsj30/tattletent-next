# ⛺ TattleTent - Civic Grievance & SLA Governance Platform

TattleTent is a modern, full-stack, AI-assisted municipal grievance tracking and SLA governance platform. It empowers citizens to report local issues with photo evidence and high-accuracy GPS coordinates, while enabling civic administrators and contractors to manage, auto-assign, resolve, and audit grievances under strict SLA policies. A public Transparency Portal builds civic trust through real-time ledger data.

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
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_app_password

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

### 4. Setup Secure SLA Escalation Cron Job
Automated escalations require a regular trigger to check SLA violations.
1.  Set up an external cron service (such as [cron-job.org](https://cron-job.org)).
2.  Point the cron job to your production backend webhook:
    *   **URL**: `https://<your-backend-domain>/api/jobs/escalate`
    *   **Method**: `POST`
    *   **Headers**:
        *   **Key**: `x-cron-key`
        *   **Value**: `<your_secure_cron_key_here>` (matches the `CRON_API_KEY` defined in backend env variables)
3.  Configure the job schedule to run regularly (e.g., every 6 hours).

---

## 🔍 Verification & Diagnostics

To check the contents of your local database and output geolocation points:
```bash
cd backend
node scripts/check-db.js
```
This utility script connects directly to MongoDB, fetches active grievances, and prints their GeoJSON coordinate pairings.
