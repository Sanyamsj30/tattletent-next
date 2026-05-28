## TattleTent Manual Test Checklist

### 1. Environment
- **MongoDB running**: Local instance on `mongodb://127.0.0.1:27017/tattletent`.
- **Backend**:
  - From `backend/`:
    - `MONGODB_URI` set in `.env` or shell.
    - (Optional) `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` if you want Google OAuth.
    - `npm run start`
- **Frontend**:
  - From `frontend/`:
    - `npm run dev`

Verify:
- Backend: `http://localhost:5000/api/complaints/counts` returns JSON (not an error page).
- Frontend: `http://localhost:5173` loads without console errors.

---

### 2. Citizen signup + login
1. Go to `http://localhost:5173`.
2. Open the **Login / Sign Up** flow.
3. **Signup**:
   - Use a fresh email address.
   - Fill in required fields, submit.
   - Confirm you receive an OTP email (if SMTP configured) and can complete registration.
4. **Login**:
   - Log in with the new account.
   - Confirm:
     - Token + user are stored in `sessionStorage`.
     - Navbar / UI reflects logged-in state.

Expected:
- Duplicate email shows a clear error and suggests logging in instead.
- Invalid credentials show a friendly error.

---

### 3. Citizen portal – lodge complaint
1. While logged in as a citizen, go to the complaint submission page.
2. Create a new complaint:
   - Choose a realistic category.
   - Add location details and description.
   - (Optional) Attach an image if configured.
3. Submit.

Verify:
- UI shows success feedback (toast/message).
- Complaint appears in your **My complaints** view with correct status (e.g. `NEW` / `PENDING`).
- Backend:
  - `GET /api/complaints/search?status=NEW` includes the new complaint.

---

### 4. Staff assignment + status updates
**Prereq**: At least one Staff account exists (via Admin invite or DB seed).

1. Log in as **Admin**.
2. Open **Admin Dashboard**:
   - Confirm counts (resolved/pending/in_progress) load without error.
   - Confirm new complaints list is populated.
3. Use the **Assign staff** flow:
   - Select a complaint.
   - Assign it to a staff member.

Verify:
- Complaint now appears in **Assigned** list for Admin.
- As that staff user:
  - Log in and open **Staff Dashboard**.
  - Complaint appears in the staff’s list with correct status.
  - Mark complaint as resolved; status and counts update accordingly.

---

### 5. Feedback flow
1. After a complaint is resolved, log in as the citizen who filed it.
2. Navigate to the feedback section for that complaint.
3. Submit feedback (rating + comment).

Verify:
- UI shows success.
- Backend:
  - `GET /api/feedback` (with auth token) returns your feedback.

---

### 6. Public heatmap & transparency
1. From the public or admin views, open the **Heatmap** page.
2. Ensure:
   - The Leaflet map renders (no JS errors).
   - Heatmap points appear for complaints that have valid geo coordinates.
   - Changing map zoom and panning works smoothly.
3. Confirm public endpoints:
   - `GET /api/public/complaints/heatmap` returns JSON with latitude/longitude.

---

### 7. Auth edge cases
- Try logging in with:
  - Wrong password.
  - Unregistered email.
- Test **Forgot password**:
  - Request reset OTP.
  - Complete password reset and log in with the new password.
- Test that:
  - Admin-only pages redirect non-admin users back to home.
  - Staff-only pages redirect non-staff users.

---

### 8. Smoke tests from CLI

From `backend/`:

```powershell
$env:MONGODB_URI="mongodb://127.0.0.1:27017/tattletent"
node scripts/smoke-test.js
```

Expected output (statuses may vary but should be non-5xx):

```text
✅ Backend smoke test results:
- GET /api/complaints/counts -> 200
- GET /api/complaints/heatmap -> 200
- GET /api/feedback -> 401
```

From `frontend/`:

```powershell
npm run lint
npm run build
```

Expected:
- `npm run lint`: passes with at most React hook dependency **warnings**, no errors.
- `npm run build`: Vite build completes successfully.

