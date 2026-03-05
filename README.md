# 🔐 Multi-Factor Authentication System

A full-stack **MFA (Multi-Factor Authentication)** system built with **React + Node.js** that verifies user identity via a one-time password (OTP) sent to their email.

---

## ✨ Features

- 📧 **Email + Password Login** — Enter any email and password to begin
- 🔢 **OTP Verification** — A 6-digit OTP is generated and sent to the provided email
- ⏱️ **5-Minute Expiry** — OTP automatically expires with a live countdown timer
- 🔄 **Resend OTP** — Request a new OTP if it expires
- 💾 **User Storage** — Authenticated users are saved to `users.json`
- 🟣 **Demo Mode** — OTP shown on-screen (no email setup required)
- 📧 **Real Email Mode** — Configure Gmail to send OTPs to actual inboxes
- 🎨 **Premium Dark UI** — Glassmorphism design with animations

---

## 🛠️ Tech Stack

| Layer    | Technology                        |
|----------|-----------------------------------|
| Frontend | React 18, Vite, Vanilla CSS       |
| Backend  | Node.js, Express.js               |
| Email    | Nodemailer (Gmail / Ethereal)     |
| Storage  | `users.json` (file-based)         |

---

## 📁 Project Structure

```
sus-mfa/
├── backend/
│   ├── server.js           # Express API server
│   ├── package.json
│   ├── users.json          # Auto-created after first login
│   └── mail.config.json    # Auto-created after Gmail setup
│
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── api.js
    │   ├── index.css
    │   └── components/
    │       ├── LoginStep.jsx    # Step 1: Email + Password
    │       ├── OTPStep.jsx      # Step 2: OTP Entry
    │       ├── SuccessStep.jsx  # Step 3: Auth Granted
    │       └── MailSetup.jsx    # Gmail configuration modal
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) v18+
- npm

### 1. Clone the repository

```bash
git clone https://github.com/your-username/sus-mfa.git
cd sus-mfa
```

### 2. Install dependencies

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### 3. Run the app

Open **two terminals**:

```bash
# Terminal 1 — Backend (port 5000)
cd backend
npm run dev

# Terminal 2 — Frontend (port 5173)
cd frontend
npm run dev
```

Then open **http://localhost:5173** in your browser.

---

## 🔑 Authentication Flow

```
1. Enter email + password  →  Backend generates OTP
2. OTP sent to email       →  User enters 6-digit OTP
3. OTP verified            →  User data saved to users.json
4. Authentication Granted  ✅
```

---

## 📬 Email Modes

### 🟣 Demo Mode (default — no setup needed)
The OTP is displayed directly on screen in a glowing banner. Click it to auto-fill the input field. No email credentials required.

### 📧 Real Email Mode (Gmail)
Click **⚙️ Setup Email** on the login screen and enter your Gmail credentials. Saved to `mail.config.json`.

> ⚠️ Use a **Gmail App Password**, not your regular password.  
> Create one at: https://myaccount.google.com/apppasswords

---

## 📦 API Endpoints

| Method | Endpoint         | Description                     |
|--------|------------------|---------------------------------|
| POST   | `/api/send-otp`  | Generate & send OTP to email    |
| POST   | `/api/verify-otp`| Verify OTP, save user on success|
| POST   | `/api/resend-otp`| Resend a new OTP                |
| POST   | `/api/setup-mail`| Configure Gmail SMTP            |
| GET    | `/api/mail-status`| Check if Gmail is configured   |
| GET    | `/api/users`     | View all authenticated users    |

---

## 💾 users.json Sample

After a successful login, users are stored in `backend/users.json`:

```json
[
  {
    "email": "user@example.com",
    "password": "yourpassword",
    "authenticatedAt": "2026-03-05T10:30:00.000Z"
  }
]
```

---

## 📸 Screenshots

| Step 1 — Login | Step 2 — OTP | Step 3 — Success |
|---|---|---|
| Email + Password form | 6-digit OTP with timer | Authentication Granted |

---

## ⚙️ Environment

No `.env` file is required. Gmail credentials are optionally saved via the in-app setup UI to `backend/mail.config.json`.

---

## 📝 License

MIT — free to use and modify.
