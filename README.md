# JobTrack

JobTrack is a full-stack job platform with two sides: **candidates** browse roles, apply with a resume, and track every application stage — while **recruiters** manage companies, post jobs, and move applicants through a hiring pipeline. AI resume scoring, real-time-ish notifications, and a guest chatbot round out the experience.

## Features

**Candidates**
- Browse and filter open roles (keyword, location, remote type, employment, experience, skills, min salary)
- One-click apply with a chosen resume; application timeline (Applied → Screening → Shortlisted → Interview → Selected/Rejected)
- My Applications dashboard, Saved Jobs, and profile management
- Resume uploads with AI scoring against real job descriptions (Groq) — strengths, gaps, and fix suggestions
- Notification bell: under review, shortlisted, interview, selected, rejected

**Recruiters**
- Company profiles (logo, industry, size, location)
- Post, edit, pause, and close job listings
- Applicant pipeline per job with status updates that notify candidates instantly
- Notification bell: new applicants on your jobs

**Platform**
- Email OTP verification on signup (Gmail SMTP)
- JWT access + rotating refresh tokens (httpOnly cookie)
- Guest chatbot on the landing page — 5 free questions, then a login wall
- Light theme throughout (`#2563EB` primary)

## Tech stack

| Layer    | Tech |
|----------|------|
| Frontend | React 18 + Vite, React Router, Tailwind CSS |
| Backend  | Node.js + Express (ESM), Mongoose |
| Database | MongoDB |
| Files    | Cloudinary (resume PDFs/DOCs) |
| AI       | Groq (`openai/gpt-oss-120b`) for resume analysis |
| Email    | Nodemailer via Gmail SMTP (app password) |
| Logging  | Winston + daily rotate files |

## Project structure

```
JobTrack/
├── client/                  # React + Vite frontend
│   └── src/
│       ├── api/             # Per-domain API modules (jobs, auth, applications, …)
│       ├── assets/          # Mascot + chatbot artwork
│       ├── components/      # Navbar, NotificationBell, GuestChatbot, …
│       ├── context/         # AuthContext
│       └── pages/           # Landing, Jobs, Dashboard, Applicants, …
├── server/
│   └── src/
│       ├── App.js           # Express app, middleware + route mounting
│       ├── controllers/     # auth, company, job, application, savedJob,
│       │                    # profile, resume, resumeAnalysis, notification
│       ├── models/          # Mongoose schemas
│       ├── routes/          # /api/* route definitions
│       ├── middlewares/     # auth (protect), requestLogger, errorHandler, upload
│       └── utils/           # logger, cloudinary, groq, resumeText, notify
└── README.md
```

## Getting started

**Prerequisites:** Node.js 18+, a MongoDB connection string, a Cloudinary account, a Groq API key, and a Gmail app password (for OTP emails).

**1. Backend**
```bash
cd server
npm install
```

Create `server/.env`:
```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@<cluster>/jobtrack
CORS_ORIGIN=http://localhost:5173

JWT_ACCESS_SECRET=<random-string>
JWT_REFRESH_SECRET=<random-string>

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASS=<16-char-gmail-app-password>

CLOUDINARY_CLOUD_NAME=<name>
CLOUDINARY_API_KEY=<key>
CLOUDINARY_API_SECRET=<secret>

GROQ_API_KEY=<key>
GROQ_MODEL=openai/gpt-oss-120b
```

> Cloudinary: enable **Settings → Security → Allow delivery of PDF and ZIP files**, or resume downloads will fail.

```bash
npm run dev
```

**2. Frontend**
```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173. Without `CORS_ORIGIN=http://localhost:5173` in the backend `.env`, the browser blocks the refresh-token cookie and login silently fails.

---