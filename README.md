# Appointment Booking Platform (Dentist)

**Full‑stack project**: React frontend + FastAPI backend.

---

## Project Overview

This project is an appointment booking platform for a dentist. Patients can:

* Choose an appointment type (Regular Check‑up, Specific Treatment, Operation).
* Pick a date using a calendar UI.
* See available time slots (09:30–20:00) adjusted by appointment duration and existing bookings.
* Book a slot by providing name and contact information.

Optional features included or available to add:

* Fixed lunch break (13:00–14:00) where slots are blocked.
* Dentist dashboard to view/cancel appointments for a selected date.

---

## Features

**Frontend (React)**

* Clean homepage with appointment type selector and calendar.
* Dynamic slot calculation based on selected type and booked appointments.
* Booking form with validation (name + contact).
* Confirmation screen after successful booking.

**Backend (FastAPI)**

* REST API endpoints to fetch booked appointments and available slots, and to create/cancel appointments.
* Validation to prevent overlapping bookings and enforce working hours & lunch break.
* Simple in‑memory storage or file/DB persistence (configurable).

---

## Technologies Used

* Frontend: React (Create React App structure shown in your file list)
* Backend: Python 3.9+ with FastAPI and Uvicorn
* Optional DB: SQLite (via SQLModel or SQLAlchemy) or JSON file for small demos
* Dev tools: npm / yarn, pip, virtualenv

---

## File structure (frontend)

```
public/
  favicon.ico
  index.html
  logo192.png
  logo512.png
  manifest.json
  robots.txt
src/
  App.css
  App.js
  App.test.js
  index.css
  index.js
  logo.svg
  reportWebVitals.js
  setupTests.js
.gitignore
README.md (this file)
package-lock.json
package.json
```

> Backend files (example) should be in a sibling folder (e.g. `server/`) with FastAPI app, models and persistence.

---

## Backend API Specification

### Endpoints

* `GET /appointments?date=YYYY-MM-DD`

  * Returns list of booked appointments for the requested date.
  * Response example:

    ```json
    [
      {
        "id": "uuid-or-int",
        "name": "Alice",
        "contact": "alice@example.com",
        "type": "Regular Check-up",
        "duration": 30,
        "start": "2025-09-30T09:30:00"
      }
    ]
    ```

* `GET /allAvailableSlots?date=YYYY-MM-DD&type={appointmentType}`

  * Returns all available start times for the requested date and appointment type.
  * Query `type` should be one of: `regular` / `treatment` / `operation` (or textual names).
  * Response example:

    ```json
    ["09:30","10:00","10:30", ...]
    ```

* `POST /appointments`

  * Payload:

    ```json
    {
      "name": "Alice",
      "contact": "alice@example.com",
      "type": "Regular Check-up",
      "date": "2025-09-30",
      "start": "09:30"
    }
    ```
  * Validations performed:

    * `start` must be within working hours (09:30–20:00) and not inside lunch break (if enabled).
    * No overlap with existing appointments.
    * Duration derived from `type` (30 / 60 / 120 minutes).
  * Response: success message + appointment object with `id`.

* `DELETE /appointments/{id}` (optional)

  * Cancels/deletes an appointment by id.

---

## Appointment Model

```json
{
  "id": "string",
  "name": "string",
  "contact": "string",
  "type": "Regular Check-up|Specific Treatment|Operation",
  "duration": 30|60|120,
  "start": "YYYY-MM-DDTHH:MM:SS"
}
```

---

## Slot Calculation Algorithm (high level)

1. Define working window: `09:30` → `20:00`.
2. Optionally define lunch block: `13:00` → `14:00` (treated as unavailable).
3. Convert the window to minutes and generate candidate start times with a granularity (typically 30 minutes) — but more flexible approach: allow start times every 15 minutes or every appointment duration chunk.
4. For each candidate start time:

   * Compute candidate end time = start + duration.
   * If candidate end > working end or overlaps lunch block → skip.
   * Check against booked appointments for the date — if overlap → skip.
   * Otherwise include it in available slots.

Notes:

* Example: For a 60‑minute appointment, 09:30 is valid if 09:30–10:30 is free.
* You can allow start times aligned to 30‑minute grid (09:30, 10:00, 10:30, ...), or allow flexible offsets (every 15 minutes). Choose based on UX.

---

## Frontend — Integration & Usage

1. On date or appointment type change, frontend calls `GET /allAvailableSlots` to show the list.
2. When user selects a slot and submits the booking form, frontend does `POST /appointments` with necessary fields.
3. On success, show confirmation (e.g., modal or dedicated page) showing appointment ID, date & time.
4. To keep UX responsive, optimistically disable slot immediately after successful booking and refresh slots from server.

---

## Quick Setup Instructions (Development)

### Prerequisites

* Node.js (14+)
* npm or yarn
* Python 3.9+
* pip
* Optional: virtualenv

### Backend (FastAPI) — example

```bash
# from repository root
cd server
python -m venv .venv
source .venv/bin/activate     # Windows: .venv\Scripts\activate
pip install -r requirements.txt
# requirements.txt example: fastapi, uvicorn, pydantic, sqlmodel (optional)
uvicorn main:app --reload --port 8000
```

Example `main.py` minimal structure:

```py
from fastapi import FastAPI
from pydantic import BaseModel
# define models, in-memory store or DB connection
app = FastAPI()
# implement endpoints described above
```

### Frontend (React)

```bash
cd frontend   # or root if CRA is in project root
npm install
npm start
# frontend default runs on http://localhost:3000 and will talk to backend at http://localhost:8000 (configure proxy or CORS)
```

**CORS note**: If backend is on a different origin, enable CORS in FastAPI:

```py
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
  CORSMiddleware,
  allow_origins=["http://localhost:3000"],
  allow_methods=["*"],
  allow_headers=["*"],
)
```

---

## Example cURL Requests

* Get appointments for a date:

```bash
curl "http://localhost:8000/appointments?date=2025-09-30"
```

* Get available slots:

```bash
curl "http://localhost:8000/allAvailableSlots?date=2025-09-30&type=regular"
```

* Book an appointment:

```bash
curl -X POST "http://localhost:8000/appointments" -H "Content-Type: application/json" -d '{"name":"Anuja","contact":"anuja@example.com","type":"Regular Check-up","date":"2025-09-30","start":"09:30"}'
```

---

## Optional Enhancements (Ideas)

* Add authentication for dentist/admin.
* Dentist dashboard showing day/week view with cancel/reschedule functionality.
* Email or SMS confirmations (use an external service like SendGrid/Twilio).
* Persistent DB (Postgres / SQLite) and migrations.
* Prevent double booking with database transactions / row locks.
* Add timezone handling for multi-region usage.

---

## Testing

* Unit test backend endpoints (pytest + TestClient from FastAPI).
* Integration tests that start a test DB and verify slot calculation and booking rules.
* Frontend: react-testing-library for components, and e2e tests with Playwright or Cypress.

---

## Deployment Notes

* Serve frontend as static build (e.g., `npm run build`) with Netlify / Vercel / static host.
* FastAPI can be deployed with Uvicorn/Gunicorn behind Nginx. Use HTTPS for production.
* Use environment variables for configuration (DB URL, PORT, LUNCH_BREAK flag, etc.).


