# 🩸 CBE BloodConnect
### Coimbatore Blood Donor & Emergency Blood Request Management System

A complete, responsive, full-stack **MCA Mini Project**. It connects **Blood Donors**, **Blood Requesters** and an **Administrator** across **15 major Coimbatore locations**, with real-time matching, distance ranking and personal notifications.

> *"Find Blood. Connect Donors. Respond Faster."*

---

## 🧰 Technology Stack

| Layer | Technology |
|------|------------|
| **Frontend** | **React.js**, **Tailwind CSS**, **JavaScript (ES6)**, React Router, Fetch API |
| **Backend** | **Node.js**, **Express.js** |
| **Database** | **MongoDB Atlas**, **Mongoose** |
| **Auth** | **JWT** (JSON Web Token), **bcryptjs** |
| **Build** | **Vite** (React dev server & production build) |
| **Security** | **helmet**, **cors**, **express-rate-limit** |

---

## ✨ Key Features

- **Three roles** — Donor, Requester, Admin (JWT + bcrypt, role-based authorization).
- **Common Active Requests board** — every logged-in donor sees the live total count + per-blood-group demand summary.
- **Personal Matching Notifications** — only donors whose blood group **exactly** matches a request get a private notification and can **Accept/Reject**. Non-matching donors can *view* but cannot *respond*.
- **Editable donor display name** — changing the name in *Profile* updates it everywhere instantly (dashboard, notifications, requester & admin views).
- **Location-based matching** — Haversine distance ranks matching donors by proximity. Private addresses are never exposed.
- **Request lifecycle** — CREATED → MATCHING → DONORS_NOTIFIED → DONOR_RESPONDED → FULFILLED / CANCELLED / EXPIRED.
- **15 Coimbatore locations only** — enforced & validated in the database and backend.
- **Single-page React app** — clean routing, reusable components, responsive UI (mobile drawer nav, notification bell, toasts, tables, modals, charts).
- **Admin analytics** — donors by group, requests by group/location, status breakdown, donor responses.

---

## 📁 Project Structure

```
cbe-bloodconnect/
├── client/                      # React frontend (Vite)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js           # dev server + /api proxy to backend
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── main.jsx             # React entry
│       ├── App.jsx              # Routes (React Router)
│       ├── index.css            # Tailwind + design system
│       ├── api/client.js        # Fetch wrapper
│       ├── context/             # AuthContext, ToastContext
│       ├── components/          # Navbar, Layout, ProtectedRoute, UI
│       ├── utils/helpers.js
│       └── pages/               # Home, Login, Registers + donor/requester/admin
└── server/                      # Backend (Node + Express)
    ├── package.json
    ├── .env.example
    └── src/
        ├── server.js            # Entry point (also serves client/dist in prod)
        ├── config/              # DB connection + constants
        ├── models/              # 8 Mongoose collections
        ├── middleware/auth.js   # JWT + role authorization
        ├── routes/              # API route handlers
        ├── utils/               # Haversine, matching engine, request ID
        └── seed.js              # Locations + sample donors + admin
```

---

## 📦 Libraries to Install

### Frontend (`client/`) — `cd client && npm install`
| Library | Purpose |
|---------|---------|
| `react` | UI library |
| `react-dom` | React DOM renderer |
| `react-router-dom` | Client-side routing |
| `vite` *(dev)* | Dev server & production bundler |
| `@vitejs/plugin-react` *(dev)* | React plugin for Vite |
| `tailwindcss` *(dev)* | Utility-first CSS framework |
| `postcss` *(dev)* | CSS processing |
| `autoprefixer` *(dev)* | Vendor prefix automation |

Manual: `npm install react react-dom react-router-dom` then `npm install -D vite @vitejs/plugin-react tailwindcss postcss autoprefixer`

### Backend (`server/`) — `cd server && npm install`
| Library | Purpose |
|---------|---------|
| `express` | Web framework / REST API |
| `mongoose` | MongoDB ODM |
| `bcryptjs` | Password hashing |
| `jsonwebtoken` | JWT auth tokens |
| `dotenv` | Environment config |
| `cors` | Cross-origin requests |
| `helmet` | Security headers |
| `express-rate-limit` | API rate limiting |
| `morgan` | Request logging |
| `nodemon` *(dev)* | Auto-reload in development |
| `mongodb-memory-server` *(dev)* | In-memory MongoDB for local demos |

Manual: `npm install express mongoose bcryptjs jsonwebtoken dotenv cors helmet express-rate-limit morgan` then `npm install -D nodemon mongodb-memory-server`

---

## 🚀 Setup & Run

> 💡 **One-folder extraction** — unzip and you get a single `cbe-bloodconnect` folder with `client/`, `server/`, and a root `package.json`. No double nesting.
> 💡 **The React frontend is pre-built** (`client/dist`), so you only need to install the **backend** to run the app.

### ⚡ Easiest way (one install — backend only)

From the project root:
```bash
npm run install:server     # installs backend libraries (in server/)
npm start                  # serves API + pre-built React app on http://localhost:5000
```
Then open **http://localhost:5000** 🎉

> The frontend is already compiled, so you do **not** need to run `npm install` in `client/` unless you want to edit the React code. This keeps `node_modules` to a single folder.

### Option A — Development (two servers, hot reload — only if editing the React UI)

```bash
# From the project root:
npm run install:all        # installs both server/ and client/

# Terminal 1 — backend API
npm run dev:server         # → http://localhost:5000  (API)

# Terminal 2 — React app (live editing)
npm run dev:client         # → http://localhost:5173  (open this in your browser)
```
> The Vite dev server **proxies `/api` → `http://localhost:5000`** automatically.

### Option B — Rebuild the frontend after editing React code

```bash
npm run build:client       # rebuilds client/dist (served by the backend)
```

> 💡 If `MONGODB_URI` is blank, the app auto-starts an **in-memory MongoDB** so you can demo immediately without Atlas. Set your Atlas connection string in `.env` for persistent data.

---

## 🔑 Demo Credentials (auto-seeded on first run)

| Role | Username | Password |
|------|----------|----------|
| **Admin** | `admin` | `admin123` |
| **Requester** | `priya1` | `priya1` |
| **Donor (O+)** | `arun.o` | `donor123` |
| **Donor (A+)** | `arun.a` | `donor123` |
| **Donor (AB+)** | `prakash.ab` | `donor123` |
| **Donor (B-)** | `bala.b` | `donor123` |

All 26 sample donors (8 blood groups) use **`donor123`**.

---

## 🔄 Primary End-to-End Workflow

1. **Requester** logs in → *Create Blood Request* (e.g. **O+**, 2 units, **Peelamedu**, **Critical**) → Submit.
2. **System** saves the request → generates `REQ-CBE-2026-000001` → finds **O+** donors → validates location & availability → ranks by Haversine distance → creates match records + **personal notifications**.
3. **All donors** see the **Active Requests count increase** on the common board.
4. **O+ donor** logs in → 🔔 notification bell shows new match → *View* → **Accept** / **Reject**.
5. **A+ donor** sees the same request on the common board but receives **no notification** and **cannot** Accept/Reject.
6. **Requester** sees the donor response + status → `DONOR_RESPONDED`.
7. **Admin** monitors everything from the dashboard, request details & analytics.

---

## 🌐 API Endpoints (summary)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register/donor` | Donor registration |
| POST | `/api/auth/register/requester` | Requester registration |
| POST | `/api/auth/login` | Login (all roles) |
| GET | `/api/auth/me` | Current user |
| GET | `/api/locations` | List 15 locations |
| GET | `/api/blood-requests/active/summary` | Active count + blood-group breakdown |
| GET | `/api/blood-requests/active` | Common active request list |
| GET | `/api/blood-requests/:id` | Request detail (donor view) |
| GET | `/api/donors/dashboard` | Donor dashboard stats |
| PUT | `/api/donors/profile` | **Edit profile / display name** |
| GET | `/api/donors/matching` | My matching requests |
| POST | `/api/donors/:id/accept` | Accept matching request |
| POST | `/api/donors/:id/reject` | Reject matching request |
| GET | `/api/notifications` | Personal notifications |
| GET | `/api/notifications/unread/count` | Bell badge count |
| POST | `/api/requesters/requests` | Create blood request (triggers matching) |
| GET | `/api/requesters/requests` | My requests |
| GET | `/api/requesters/requests/:id` | Request detail + responses |
| GET | `/api/search` | Find blood donors |
| GET | `/api/admin/dashboard` | Admin stats |
| GET | `/api/admin/donors` | Donor management |
| GET | `/api/admin/requests` | Request management |
| GET | `/api/admin/analytics` | Analytics data |

---

## 🗄️ Database Collections

`users`, `donors`, `requesters`, `bloodRequests`, `donorMatches`, `notifications`, `locations`, `requestStatusHistory`

---

## ⚠️ Medical Disclaimer

CBE BloodConnect is an **academic blood donor coordination platform**. Donor availability shown on this application does **not** guarantee blood availability. Final donor eligibility, blood compatibility and donation approval must be determined by qualified medical and blood-bank professionals.

---

## 📝 Notes

- The **in-memory MongoDB** resets when the server restarts; use **MongoDB Atlas** for persistent data.
- Sample data is entirely **fictional** and created only for demonstration.
- React dev mode: the SPA runs on port 5173 and proxies API calls to port 5000.

---

© 2026 CBE BloodConnect — MCA Mini Project • Built with React, Node.js, Express & MongoDB Atlas
