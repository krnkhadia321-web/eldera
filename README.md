# EldEra — Elderly Care Platform

A full-stack care coordination platform that connects elders, family members, professional caregivers, and doctors. Built as an Indian-market-focused portfolio project with a real-time alert system, AI companion, predictive health analytics, and email notifications.

## Live stack

- **API:** Node.js / Express / TypeScript on Railway
- **Web:** Vite + React 18 + Tailwind + Zustand on Railway
- **DB:** PostgreSQL on Supabase (via Prisma 5)
- **Realtime:** Socket.io
- **Email:** Resend
- **LLM:** Groq (LLaMA 3.3 70B)
- **File storage:** Cloudinary
- **Payments:** Razorpay (test mode)

## Features

### Authentication & profiles
- JWT auth with role-based access (`elder`, `family`, `caregiver`, `doctor`)
- Elder profile with DOB, blood group, address, emergency contact, medical conditions, allergies
- Doctor profile with specialty, clinic, fees, telehealth toggle
- Caregiver profile with skills, languages, city, hourly rate, rating, availability
- Family model with multi-member support and `primary`/`secondary` roles

### Multi-role dashboards
- **Elder dashboard** — mood/BP/SpO₂ stats, today's medications, upcoming appointments, caregiver bookings, active alerts, and AI-driven health trends
- **Family dashboard** — per-elder profile cards with medical conditions, active medications, health trends, unresolved alerts, caregiver bookings
- **Caregiver dashboard** — pending + confirmed bookings, accept/reject flow
- **Doctor dashboard** — upcoming appointments, in-clinic vs telehealth, per-appointment video link modal

### Health & medication tracking
- Health logs: mood score, systolic/diastolic BP, SpO₂, weight, free-text notes
- Medications with dosage, frequency, reminder time (HH:MM), start/end dates
- Medication logging (taken / missed / skipped) with adherence percentage
- Documents module with doc-type tagging (medical_record, prescription, insurance, legal, identity, other)
- Expenses module with per-category breakdowns and summary totals

### Caregivers & appointments marketplace
- Browse/filter caregivers by city
- Booking flow with auto-calculated total (hours × rate) and 12% platform fee
- Booking state machine: `pending` → `confirmed` / `cancelled` / `completed`
- Doctor directory with specialty filter
- Appointment booking (in-clinic or telehealth)

### Alerts & real-time
- SOS button on elder alerts page → creates critical alert + emits realtime event + fans out email to every family member
- Alert types: `sos`, `missed_medication`, `low_mood`, `high_bp`, etc.
- Severity levels: `info`, `medium`, `high`, `critical`
- Socket.io rooms per family and per elder for live alert pushes
- In-app resolve workflow

### Background jobs (node-cron)
- Medication reminder cron — fires per-minute, emails elder at the exact `HH:MM` reminder time, only if today's dose isn't already logged
- Missed medication cron — runs hourly, creates a `missed_medication` alert if the dose window has passed without a log
- Weekly health digest cron — Sundays 8AM, runs Groq over each elder's recent data + emails every family member a summary with avg mood, latest BP, and 7-day med adherence
- Cleanup cron — daily at 2AM for stale records

### AI features
- **AI Companion** — Groq-backed chat tuned for warm, culturally-aware responses ("Namaste"-style). Conversations are stored, and messages flagged for concerning content are surfaced to family.
- **Predictive Health Trends** — statistical analysis of last 14 days of health logs, splits window in half and compares averages. Classifies mood, systolic BP, diastolic BP, SpO₂, and weight as `improving` / `declining` / `stable` with severity thresholds calibrated against clinical norms (BP ≥ 160/100 critical, SpO₂ < 92% critical, mood drop ≥ 2pts warning, weight drop ≥ 3% warning). Exposed on both elder and family dashboards as a "Health Trends" card with a concerns banner + per-metric breakdown.
- **Weekly AI digest** — Groq summary per elder + stat cards (mood, BP, adherence) in email.

### Email notifications (Resend)
- 🆘 SOS alert to all family members (with dedupe across families)
- 🤝 Booking request to caregiver on create
- ✅ Booking confirmed / ❌ cancelled to all family members on status change
- 💊 Medication reminder to elder at reminder time
- 📊 Weekly health report to all family members
- `EMAIL_DEV_OVERRIDE` env flag redirects all outgoing email to a single address for free-tier testing, preserving the original recipient in the subject line

## Monorepo layout

```
eldera/
├── apps/
│   ├── api/          # Express API, Prisma, cron jobs, socket gateway
│   └── web/          # Vite React frontend
└── packages/
    ├── config/       # Shared constants (alert types, severity, etc.)
    ├── types/        # Shared TypeScript types
    └── validators/   # Shared Zod schemas
```

## Local setup

```bash
# Install
pnpm install

# DB
cd apps/api
npx prisma migrate dev

# Seeds (optional — populates caregivers, doctors, a family, 14 days of health logs)
npx tsx src/lib/seed.ts
npx tsx src/lib/seed-family.ts
npx tsx src/lib/seed-family-member.ts
npx tsx src/lib/seed-health-logs.ts

# Run API
pnpm dev    # from apps/api, port 5000

# Run web
cd ../web
pnpm dev    # port 5173
```

## Required env vars (apps/api/.env)

```
DATABASE_URL="postgres://..."         # Supabase pooled URL
DIRECT_URL="postgres://..."           # Supabase direct URL (for migrations)
JWT_SECRET="..."
CLIENT_URL="http://localhost:5173"
GROQ_API_KEY="gsk_..."
RESEND_API_KEY="re_..."
EMAIL_DEV_OVERRIDE="you@example.com"  # optional: redirects all emails for free-tier testing
CLOUDINARY_CLOUD_NAME="..."
CLOUDINARY_API_KEY="..."
CLOUDINARY_API_SECRET="..."
RAZORPAY_KEY_ID="..."
RAZORPAY_KEY_SECRET="..."
```

## Test accounts

| Role | Email | Password |
|------|-------|----------|
| Elder | `test@eldera.com` | `password123` |
| Family | `krn.khadia321@gmail.com` | `password123` |
| Caregivers | `priya@eldera.com`, `anjali@eldera.com`, `ramesh@eldera.com`, `sunita@eldera.com`, `meena@eldera.com` | `password123` |
| Doctors | `arun@eldera.com`, `kavita@eldera.com`, `suresh@eldera.com`, `nisha@eldera.com`, `rajiv@eldera.com`, `lakshmi@eldera.com` | `password123` |

## Manual triggers (dev helpers)

```bash
# Fire the weekly digest cron on demand
npx tsx src/lib/run-weekly-digest.ts

# Reseed 14 days of health logs (first 7 healthy, last 7 declining — good for testing trend detection)
npx tsx src/lib/seed-health-logs.ts
```
