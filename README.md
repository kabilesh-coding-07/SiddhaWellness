# 🌿 SiddhaWellness.in

**Full-Stack Siddha Medicine Clinic Platform**

An end-to-end healthcare web application for a Siddha medicine clinic featuring patient booking, doctor management, and a stunning public website.

🚀 **Live Preview:** [https://frontend-mu-lovat-45.vercel.app](https://frontend-mu-lovat-45.vercel.app)
## Tech Stack

| Layer | Technology |
|-------|-----------| 
| Frontend | Next.js 16 + TypeScript |
| Backend | Node.js + Express + TypeScript |
| Database | SQLite (dev) / PostgreSQL (prod) + Prisma ORM |
| Auth | JWT + Google OAuth (NextAuth.js) |
| Deploy | Vercel (frontend) + Render (backend) |

## Getting Started

### Prerequisites
- Node.js 18+ and npm

### Backend Setup
```bash
cd backend
npm install
npx prisma migrate dev --name init
npx prisma db seed
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
cp .env.local.example .env.local  # Edit with your credentials
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Environment Variables

#### Backend (`.env`)
```
DATABASE_URL="file:./dev.db"
JWT_SECRET=your-secret-key
PORT=5000
FRONTEND_URL=http://localhost:3000
```

#### Frontend (`.env.local`)
```
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Test Accounts
| Role | Email | Password |
|------|-------|----------|
| Patient | `patient@test.com` | `password123` |
| Doctor | `kavitha@siddha.in` | `password123` |
| Admin | `admin@siddha.in` | `password123` |

## Features

### Public Pages
- 🏠 Home — Hero, About, Services, Doctors, Testimonials, Blog, CTA
- 📖 About — Story, values, timeline
- 💊 Services — 9 Siddha treatments with pricing (API-backed)
- 👨‍⚕️ Doctors — 6 physician profiles (API-backed)
- 📰 Blog — Health articles (API-backed)
- 📞 Contact — Form + clinic info (saves to DB)

### User Dashboard (`/dashboard`)
- 📅 Book appointments (doctor, date, time, symptoms)
- 📋 Appointment history with status filters & cancel
- 👤 Profile & medical history management

### Doctor Portal (`/doctor`)
- 📊 Dashboard with today's schedule & stats
- ✅ Accept/reject/complete appointments with notes
- 👥 Patient records & treatment notes
- 🕐 Weekly availability management (loads saved data)

### Auth
- 🔐 Email/password registration & login
- 🔑 Google OAuth sign-in (NextAuth.js)

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login |
| POST | `/api/auth/google` | — | Google OAuth upsert |
| GET | `/api/auth/me` | ✓ | Get current user |
| PUT | `/api/auth/profile` | ✓ | Update profile |
| GET | `/api/doctors` | — | List all doctors |
| GET | `/api/doctors/me/profile` | Doctor | Doctor's own profile |
| GET | `/api/doctors/:id` | — | Doctor by ID |
| PUT | `/api/doctors/availability` | Doctor | Update availability |
| POST | `/api/appointments` | ✓ | Book appointment |
| GET | `/api/appointments/my` | ✓ | User's appointments |
| GET | `/api/appointments/doctor` | Doctor | Doctor's appointments |
| PATCH | `/api/appointments/:id/status` | Doctor | Update status |
| PATCH | `/api/appointments/:id/cancel` | ✓ | Cancel appointment |
| GET | `/api/blogs` | — | List blogs |
| GET | `/api/blogs/:slug` | — | Blog by slug |
| GET | `/api/services` | — | List services |
| GET | `/api/services/:id` | — | Service by ID |
| POST | `/api/contact` | — | Submit contact form |

## License
MIT
