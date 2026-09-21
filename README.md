# The Grand Azure Hotel — AI Guest Assistant

An AI-powered hotel concierge chatbot built with Next.js 15, Google Gemini, MySQL, and Prisma.

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Gemini](https://img.shields.io/badge/Gemini-AI-purple)

## Features

- 🤖 **AI-Powered Chat** — Natural language conversations powered by Google Gemini
- 🏨 **Knowledge Base** — Answers grounded in real hotel data from MySQL
- 📅 **Availability Checker** — Real-time room availability with deterministic logic
- 🛡️ **Anti-Hallucination** — LLM answers only from known data; fallback when unsure
- 📱 **Responsive UI** — Mobile-first chat interface with accessibility support
- 🔧 **Degraded Mode** — Keyword-based FAQ matching when Gemini is unavailable

## Prerequisites

- **Node.js** 18+
- **Docker** (for MySQL)
- **Google Gemini API Key** — Get one at [ai.google.dev](https://ai.google.dev/)

## Quick Start

### 1. Start MySQL

```bash
docker compose up -d
```

### 2. Configure Environment

```bash
cp .env.example .env.local
```

Open `.env.local` and **add your Gemini API key**:

```env
GEMINI_API_KEY="your-actual-api-key-here"
```

### 3. Set Up Database

```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 4. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm test` | Run unit tests (Vitest) |
| `npm run e2e` | Run E2E tests (Playwright) |
| `npm run eval` | Run evaluation scenarios against live API |
| `npm run lint` | Run ESLint |

## Pages Overview
- `/` - Marketing home page with floating AI chat widget
- `/about` & `/contact` - Static brand pages
- `/stay` - Room booking and availability
- `/dine` - Restaurant menu with search and filters
- `/cart` - Unified cart for rooms and food
- `/login` - Demo email login (no password)
- `/checkout` - Demo payment flow

## Demo Test Values
- **Login**: Any valid email (e.g., `test@example.com`)
- **Success Card**: `4242 4242 4242 4242`
- **Declined Card**: `4000 0000 0000 0002`

## Project Structure

```
├── prisma/
│   ├── schema.prisma    # Database schema (8 models)
│   └── seed.ts          # Seed data (hotel, rooms, FAQs, policies)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── chat/    # POST /api/chat — main chat endpoint
│   │   │   └── health/  # GET /api/health — DB health check
│   │   ├── layout.tsx
│   │   └── page.tsx     # Chat UI
│   ├── components/      # React components
│   ├── lib/             # Backend logic
│   │   ├── availability.ts  # Deterministic room availability
│   │   ├── gemini.ts        # Gemini client (server-only)
│   │   ├── knowledge.ts     # Knowledge base loader + FAQ fallback
│   │   ├── env.ts           # Environment validation
│   │   ├── prisma.ts        # Prisma client singleton
│   │   ├── rate-limit.ts    # In-memory rate limiter
│   │   ├── types.ts         # Shared TypeScript types
│   │   └── validation.ts    # Zod request schemas
│   └── scripts/
│       └── eval.ts      # Evaluation script
├── e2e/                 # Playwright E2E tests
├── docs/                # Documentation
└── docker-compose.yml   # MySQL container
```

## Documentation

- [Architecture](docs/architecture.md) — System design, data flow, component diagram
- [API Examples](docs/api-examples.md) — curl examples for all API scenarios
- [Decisions](docs/decisions.md) — Product, UX, engineering, and AI decisions
- [Evaluation](docs/evaluation.md) — Test scenarios and evaluation methodology
- [AI Tools Used](docs/ai-tools-used.md) — AI tools and models used in development

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 15 (App Router), React 19, Tailwind CSS |
| Backend | Next.js Route Handlers, TypeScript |
| Database | MySQL 8, Prisma ORM |
| AI/LLM | Google Gemini (`@google/genai`) |
| Validation | Zod |
| Logging | Pino |
| Testing | Vitest, React Testing Library, Playwright |
