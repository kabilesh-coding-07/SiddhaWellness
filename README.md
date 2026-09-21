# 🌿 SiddhaWellness.in

**A full-stack Siddha Medicine Clinic Platform — built with Next.js 16, Supabase, Tailwind CSS & TypeScript.**

> Ancient healing. Modern technology. One seamless experience.

[![Live Demo](https://img.shields.io/badge/🌐_Live_Demo-demo--lime--delta--12.vercel.app-047857?style=for-the-badge)](https://demo-lime-delta-12.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_&_DB-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://typescriptlang.org)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com)

---

## ✨ Features

### 🏠 Public Website
- **Home** — Hero section, About Siddha medicine, Services, Doctors, Testimonials, Blog, Contact CTA
- **Services** — 9 traditional Siddha treatments with pricing & descriptions
- **Doctors** — 6 physician profiles with specialties & experience
- **Blog** — Health articles with individual post pages (Supabase-backed)
- **Contact** — Form with clinic info & location
- **i18n** — Full English 🇬🇧 + Tamil 🇮🇳 language support

### 👤 Patient Dashboard (`/dashboard`)
- 📅 Book appointments — Select doctor, date, time slot, describe symptoms
- 📋 Appointment history — Filter by status (Pending/Confirmed/Completed/Cancelled)
- 👤 Profile — Update personal info & medical history
- 📊 Health summary — Visit count, active plans, next appointment

### 🩺 Doctor Portal (`/doctor`)
- 📊 Dashboard — Today's schedule, stats overview, quick actions
- ✅ Manage appointments — Accept / Reject / Complete with patient notes
- 👥 Patient records — Search, view medical history, add treatment notes
- 🕐 Availability — Configure weekly schedule with add/remove time slots
- 📝 Blog management — Create, edit, and publish articles

### 🔐 Authentication
- Email + Password login with Supabase Auth
- Google OAuth sign-in
- Role-based access (Patient vs Doctor portals)
- Middleware-based route protection

---

## 🎨 Design System

| Property | Value |
|----------|-------|
| Background | Deep dark emerald `#0a0f0d` |
| Primary | Emerald green `#047857` → `#065f46` |
| Accent | Gold `#d4a017` → `#b8860b` |
| Typography | **Outfit** (sans) + **Playfair Display** (serif) |
| Style | Glassmorphism cards, gradient text, micro-animations |

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Turbopack) |
| Styling | [Tailwind CSS v4](https://tailwindcss.com) |
| Language | [TypeScript 5](https://typescriptlang.org) |
| Auth & DB | [Supabase](https://supabase.com) (Auth, PostgreSQL, Row-Level Security) |
| Icons | Emoji-based (zero dependency) |
| Deployment | [Vercel](https://vercel.com) |

---

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── page.tsx            # Home (7 sections)
│   ├── about/              # About page
│   ├── services/           # Services + [id] detail
│   ├── doctors/            # Doctors + [id] profile
│   ├── blog/               # Blog + [slug] posts
│   ├── contact/            # Contact form
│   ├── login/              # Login (Patient/Doctor toggle)
│   ├── register/           # Registration
│   ├── dashboard/          # Patient portal
│   │   ├── page.tsx        # Overview
│   │   ├── book/           # Book appointment
│   │   ├── appointments/   # History
│   │   └── profile/        # Profile & medical history
│   ├── doctor/             # Doctor portal
│   │   ├── page.tsx        # Dashboard
│   │   ├── appointments/   # Manage appointments
│   │   ├── patients/       # Patient records
│   │   ├── availability/   # Schedule management
│   │   └── blogs/          # Blog CRUD
│   └── auth/callback/      # OAuth callback
├── components/             # Navbar, Footer, Providers
├── i18n/                   # English + Tamil translations
├── lib/                    # Supabase client
├── providers/              # UserContext (auth state)
├── types/                  # TypeScript interfaces
└── utils/supabase/         # Client & Server Supabase utils
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project

### 1. Clone & Install
```bash
git clone https://github.com/kabilesh-coding-07/SiddhaWellness.git
cd SiddhaWellness
npm install
```

### 2. Configure Environment
Create `.env.local` at the root:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Set Up Supabase Tables
Create these tables in your Supabase dashboard:

- **users** — `id (uuid, PK)`, `name`, `email`, `role` (USER/DOCTOR), `phone`, `image`
- **doctors** — `id`, `userId (FK → users)`, `specialty`, `experience`, `bio`, `availability`
- **appointments** — `id`, `userId (FK)`, `doctorId (FK)`, `date`, `time`, `status`, `symptoms`, `notes`
- **blogs** — `id`, `title`, `slug`, `content`, `excerpt`, `published`, `createdAt`, `authorId`
- **services** — `id`, `name`, `description`, `icon`, `price`, `duration`

### 4. Run
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** 🎉

---

## 📦 Deployment

This project is configured for **Vercel**:

1. Import the repo on [vercel.com](https://vercel.com)
2. Set environment variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
3. Deploy — Vercel auto-detects the Next.js framework

---

## 📄 License

MIT © [Kabilesh](https://github.com/kabilesh-coding-07)
