<div align="center">

# DS3 — Commerce & Experience Platform

*A Next.js App Router storefront with Prisma/Postgres, NextAuth, Razorpay payments, and a gamified engagement layer.*

[![Next.js](https://img.shields.io/badge/Next.js-App%20Router-000?logo=nextdotjs&logoColor=white)]()
[![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?logo=typescript&logoColor=white)]()
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white)]()
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white)]()
[![Razorpay](https://img.shields.io/badge/Razorpay-Payments-0C2451)]()

</div>

---

## Overview

**DS3** is a production-grade e-commerce and engagement platform built on the Next.js App Router. It combines a catalogue-driven storefront, Razorpay-backed checkout, and a gamified *Dungeon Raid* engagement engine that drives retention and rewards-linked ordering.

Architecture follows a vertical-slice layout with route groups (`app/(store)`), typed server actions, Prisma as the single source of truth for persistence, and NextAuth for identity.

## Features

- **Storefront** — catalogue, categories, product detail, and cart pages under `app/(store)/`.
- **Checkout** — Razorpay order creation + signature verification (`app/api/razorpay/*`, `app/api/checkout`).
- **Identity** — NextAuth with Prisma adapter, email/password (`bcrypt`) flow.
- **Inventory sync** — scheduled job under `app/api/cron/sync-inventory` for vendor reconciliation.
- **Engagement: Dungeon Raid** — gamified co-op engagement module via `app/api/dungeon-raid/`.
- **Store admin APIs** — `app/api/store/boxes/[id]` for SKU / mystery-box management.
- **Design system** — documented in `DESIGN_SYSTEM.md`, `DESIGN_SUMMARY.md`.

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router, Route Handlers, Server Actions) |
| Language | TypeScript |
| ORM / DB | Prisma · PostgreSQL (via `@prisma/adapter-pg`) |
| Auth | NextAuth (`@auth/prisma-adapter`) + bcrypt |
| Payments | Razorpay |
| UI | React 19, Framer Motion, Lucide, Radix primitives |
| State | Zustand |
| Email | Nodemailer |
| Container | Dockerfile (multi-stage) |

## Architecture

Detailed docs in this repo:

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — overall system design.
- [`IDENTITY_GRAPH_ARCHITECTURE.md`](./IDENTITY_GRAPH_ARCHITECTURE.md) — identity/relationship modelling.
- [`SCALABLE_VENDOR_ARCHITECTURE.md`](./SCALABLE_VENDOR_ARCHITECTURE.md) — vendor / inventory scaling strategy.
- [`IMPLEMENTATION_ROADMAP.md`](./IMPLEMENTATION_ROADMAP.md) — delivery roadmap.
- [`CODE_REVIEW_REPORT.md`](./CODE_REVIEW_REPORT.md) · [`PROJECT_REVIEW_COMPLETE.md`](./PROJECT_REVIEW_COMPLETE.md) — engineering review artefacts.
- [`DEPLOYMENT_CHECKLIST.md`](./DEPLOYMENT_CHECKLIST.md) · [`README-DEPLOYMENT.md`](./README-DEPLOYMENT.md) — ops.

## Getting started

### Prerequisites

- Node.js 20+
- PostgreSQL 14+
- Razorpay account (test keys)
- SMTP credentials (optional, for transactional email)

### Setup

```bash
# 1. Install
npm install

# 2. Configure
cp .env.example .env.local        # then fill in the values

# 3. Database
npm run db:push                   # apply Prisma schema
npm run db:seed                   # seed initial data

# 4. Dev server
npm run dev
# → http://localhost:3000
```

### Environment variables

Minimum required:

```bash
DATABASE_URL="postgres://user:pass@host:5432/ds3"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="..."
RAZORPAY_KEY_ID="..."
RAZORPAY_KEY_SECRET="..."
SMTP_HOST="..."
SMTP_USER="..."
SMTP_PASS="..."
```

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm start` | Run production build |
| `npm run lint` | Lint |
| `npm run db:push` | Push schema to DB |
| `npm run db:migrate` | Create & run a Prisma migration |
| `npm run db:seed` | Seed initial data |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:reset` | Reset DB (destructive) |

## Deployment

Containerized via the included `Dockerfile`. Production deployment notes live in [`README-DEPLOYMENT.md`](./README-DEPLOYMENT.md) and [`DEPLOYMENT_CHECKLIST.md`](./DEPLOYMENT_CHECKLIST.md).

## License

All rights reserved.

## Author

**Dhamodaran Narayana Perumal** — [dhamodaran@outlook.in](mailto:dhamodaran@outlook.in) · [dhamo.in](https://dhamo.in)
