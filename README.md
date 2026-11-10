# SaralYojna (सरल योजना)

> **National Citizen Facilitation Portal for Central & State Welfare Schemes**

[![License: MIT](https://img.shields.io/badge/License-MIT-0C2340.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.2-61dafb.svg?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933.svg?logo=node.js)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.22-2D3748.svg?logo=prisma)](https://www.prisma.io/)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-336791.svg?logo=postgresql)](https://www.postgresql.org/)
[![Pinecone](https://img.shields.io/badge/Vector_DB-Pinecone-000000.svg)](https://www.pinecone.io/)
[![Google Gemini](https://img.shields.io/badge/AI-Gemini_2.5_Flash-8E75C2.svg)](https://ai.google.dev/)
[![Languages](https://img.shields.io/badge/Languages-13_Official_Indian-047857.svg)](#-13-official-indian-languages)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Pillars & Highlights](#-key-pillars--highlights)
- [13 Official Indian Languages](#-13-official-indian-languages)
- [Civic Design System](#-civic-design-system)
- [System Architecture](#-system-architecture)
- [AI & Vector RAG Pipeline](#-ai--vector-rag-pipeline)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
  - [Database Setup](#database-setup)
  - [Running the Application](#running-the-application)
- [Testing & Quality Assurance](#-testing--quality-assurance)
- [API Reference](#-api-reference)
- [Security & Compliance](#-security--compliance)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🎯 Overview

**SaralYojna** is a citizen facilitation platform that bridges the gap between Indian citizens and government welfare schemes across all states and union territories. Citizens often struggle to navigate complex guidelines, multilingual documentation, and fragmented ministerial portals.

SaralYojna solves this with:
1. **Unified Scheme Repository**: Centralized, structured data covering agriculture, healthcare, housing, education, finance, women empowerment, and social welfare.
2. **Transparent Eligibility Engine**: Real-time matching against user demographics, income, education, occupation, and state without requiring opaque approvals.
3. **Conversational RAG Assistant**: Retrieval-Augmented Generation that searches verified scheme knowledge bases to answer citizen queries in natural language with source references.
4. **Multilingual Inclusivity**: Full end-to-end interface support in 13 official Indian languages with native scripts and bidirectional layout support (LTR and Urdu RTL).
5. **Civic Trust & Anti-Vibe-Coding**: Designed with institutional dignity—no purple gradients, no fake counters or synthetic reviews, and clear legal protections (Privacy Policy & Terms).

---

## 🚀 Key Pillars & Highlights

| Pillar | Capability | Technical Details |
|---|---|---|
| **Multilingual Access** | 13 official Indian scheduled languages | Full client-side i18next localization with 357 keys, 100% key parity, Indian flag markers (`🇮🇳`), and Urdu RTL. |
| **Civic Design** | High-contrast, institutional visual design | Deep Civic Navy (`#0C2340`), Emerald Green (`#047857`), unified skeleton loaders, zero layout shifts. |
| **AI Scheme Guidance** | Grounded question-answering with citations | Pinecone 768-dim vector embeddings via `gemini-embedding-001`, generative reasoning via `gemini-2.5-flash`. |
| **Fast Scheme Catalog** | Sub-100ms catalog discovery | Server-side pagination with field projection, smart debounce search, state/category filters. |
| **Security & Privacy** | AES-256 PII protection & RBAC | Scrypt key derivation, AES-256-CBC field encryption, JWT with 2FA/TOTP support, CSRF protection, rate limiting. |
| **Compliance** | Transparent legal terms & privacy policy | Dedicated `/privacy` and `/terms` routes outlining citizen data protection and fair usage. |

---

## 🇮🇳 13 Official Indian Languages

SaralYojna provides native-language accessibility for citizens across India. The entire interface, navigation, dialogs, forms, errors, and chatbot controls are translated across all 13 languages with zero missing keys:

| Language | Code | Native Script | Direction | Coverage |
|---|---|---|---|---|
| **English** | `en` | English | LTR | 100% (357 keys) |
| **हिन्दी (Hindi)** | `hi` | हिन्दी | LTR | 100% (357 keys) |
| **বাংলা (Bengali)** | `bn` | বাংলা | LTR | 100% (357 keys) |
| **தமிழ் (Tamil)** | `ta` | தமிழ் | LTR | 100% (357 keys) |
| **తెలుగు (Telugu)** | `te` | తెలుగు | LTR | 100% (357 keys) |
| **मराठी (Marathi)** | `mr` | मराठी | LTR | 100% (357 keys) |
| **ગુજરાતી (Gujarati)** | `gu` | ગુજરાતી | LTR | 100% (357 keys) |
| **ਪੰਜਾਬੀ (Punjabi)** | `pa` | ਪੰਜਾਬੀ | LTR | 100% (357 keys) |
| **മലയാളം (Malayalam)** | `ml` | മലയാളം | LTR | 100% (357 keys) |
| **ಕನ್ನಡ (Kannada)** | `kn` | ಕನ್ನಡ | LTR | 100% (357 keys) |
| **اردو (Urdu)** | `ur` | اردو | **RTL** | 100% (357 keys) |
| **অসমীয়া (Assamese)** | `as` | অসমীয়া | LTR | 100% (357 keys) |
| **ଓଡ଼ିଆ (Odia)** | `or` | ଓଡ଼ିଆ | LTR | 100% (357 keys) |

Language switching is client-side and instantaneous, automatically updating document `lang` and `dir` attributes for appropriate text shaping and alignment.

---

## 🏛️ Civic Design System

SaralYojna intentionally adheres to government portal standards of trust, clarity, and accessibility:
- **Palette**: Deep Civic Navy (`#0C2340`) for primary elements, Institutional Slate (`#1E293B`) for body text, and Emerald Green (`#047857`) for confirmations and active status badges.
- **Button Standards**: Rectangular buttons with subtle `borderRadius: 4px` - `6px` (avoiding rounded bubble/pill styling).
- **Zero Vibe-Coding**: Eliminates synthetic floating blur circles, purple/neon gradients, fake counter metrics, and AI slop placeholders.
- **Skeleton Loaders**: Dedicated `<SchemeCardSkeleton>` and `<SchemeDetailsSkeleton>` components ensure smooth transitions and zero Cumulative Layout Shift (CLS) during network fetches.
- **Responsive Layout**: Designed mobile-first, ensuring zero horizontal overflow on small screens and accessible touch targets.

---

## 🏗️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                        Citizen Browser / Client                        │
│   React 18 + Vite + TypeScript + Material UI + i18next (13 Languages)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTPS / REST (JSON)
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                   Express API Server (or Vercel Serverless)             │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │ Middlewares: Auth (JWT), Rate Limiter, Helmet, CORS, Validation  │  │
│  └────────────────────────────────┬─────────────────────────────────┘  │
│                                   │                                    │
│  ┌─────────────────────────┐      │      ┌──────────────────────────┐  │
│  │   Core Domain Routes    │◄─────┼─────►│     AI & RAG Services    │  │
│  │  /schemes, /eligibility │      │      │  Pinecone Vector Search  │  │
│  │  /applications, /users  │      │      │  Google Gemini 2.5 Flash │  │
│  └────────────┬────────────┘      │      └─────────────┬────────────┘  │
└───────────────┼───────────────────┼────────────────────┼───────────────┘
                │                   │                    │
                ▼                   │                    ▼
┌───────────────────────────────┐   │   ┌────────────────────────────────┐
│   PostgreSQL via Prisma ORM   │   │   │     Pinecone Vector Index      │
│  Users, Schemes, Applications,│   │   │  768-dim Scheme Embeddings     │
│  Audit Logs, Documents        │   │   │  (gemini-embedding-001)        │
└───────────────────────────────┘   │   └────────────────────────────────┘
                                    ▼
                        ┌────────────────────────┐
                        │   Google Gemini API    │
                        │  (gemini-2.5-flash)    │
                        └────────────────────────┘
```

---

## 🧠 AI & Vector RAG Pipeline

The platform uses Retrieval-Augmented Generation (RAG) to provide contextual, verifiable scheme guidance without hallucination:

1. **Embedding Generation**: Scheme attributes (name, description, eligibility, benefits, application steps) are encoded into 768-dimensional vector embeddings using Google's `gemini-embedding-001` model.
2. **Vector Indexing**: Embeddings are stored in a Pinecone serverless index (`gov-schemes`) with cosine similarity metric.
3. **Retrieval**: When a citizen asks a question (e.g., *"How can a marginal farmer apply for PM-KISAN?"*), the query is converted to a vector and top-matching scheme contexts are retrieved via cosine similarity.
4. **Grounded Generation**: The retrieved official documentation is provided as system grounding to `gemini-2.5-flash`, which composes a clear, structured response citing verified criteria and documentation requirements.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [React 18](https://react.dev/) + [TypeScript 5](https://www.typescriptlang.org/)
- **Build Tool**: [Vite 5](https://vitejs.dev/)
- **UI Components**: [Material UI (MUI 5)](https://mui.com/)
- **Icons**: [Lucide React](https://lucide.dev/)
- **Internationalization**: [i18next](https://www.i18next.com/) & [react-i18next](https://react.i18next.com/)
- **Routing**: [React Router 6](https://reactrouter.com/)
- **Notifications**: [Notistack](https://notistack.com/)

### Backend
- **Runtime**: [Node.js](https://nodejs.org/) (v18+)
- **Framework**: [Express 4](https://expressjs.com/) + TypeScript
- **Database & ORM**: [Prisma ORM 5](https://www.prisma.io/) with [PostgreSQL](https://www.postgresql.org/)
- **Validation**: [Zod](https://zod.dev/) & [express-validator](https://express-validator.github.io/)
- **Security**: [Helmet](https://helmetjs.github.io/), [bcryptjs](https://github.com/dcodeIO/bcrypt.js), [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)
- **Encryption**: AES-256-CBC with Node.js crypto & Scrypt key derivation
- **Documentation**: [Swagger / OpenAPI 3.0](https://swagger.io/)

### AI & Vector Services
- **Generative AI**: [Google Generative AI](https://ai.google.dev/) (`gemini-2.5-flash`)
- **Embeddings**: `models/gemini-embedding-001` (768 dimensions)
- **Vector Database**: [Pinecone](https://www.pinecone.io/) (Serverless)

---

## 📁 Project Structure

```
GovScheme/
├── client/                               # Frontend Application
│   ├── public/
│   │   ├── favicon.svg                   # Custom civic emblem favicon
│   │   └── manifest.json                 # PWA configuration
│   ├── src/
│   │   ├── components/                   # UI components
│   │   │   ├── common/Skeletons.tsx      # Skeleton loaders for zero layout shift
│   │   │   ├── LandingPage.tsx           # Civic hero & scheme showcase
│   │   │   ├── SchemeList.tsx            # Paginated scheme directory with filters
│   │   │   ├── SchemeDetails.tsx         # Detailed scheme view & eligibility check
│   │   │   ├── EnhancedChatbot.tsx       # AI assistant with RAG grounding
│   │   │   ├── LanguageSwitcher.tsx      # 13-language native switcher
│   │   │   ├── PrivacyPolicy.tsx         # Formal privacy compliance page
│   │   │   └── TermsOfService.tsx        # Terms of service and usage policies
│   │   ├── locales/                      # 13 official language JSON bundles
│   │   │   ├── en.json, hi.json, bn.json, ta.json, te.json, mr.json...
│   │   │   └── languages.ts              # Language metadata & flags
│   │   ├── i18n.ts                       # i18next configuration & auto-direction
│   │   ├── App.tsx                       # Client application routes
│   │   └── main.tsx                      # Entry point
│   ├── vite.config.ts                    # Vite build configuration
│   └── package.json
│
├── server/                               # Backend API Service
│   ├── src/
│   │   ├── config/prisma.ts              # Prisma PostgreSQL client instance
│   │   ├── middleware/                   # JWT auth, validation, rate limiting
│   │   ├── routes/                       # Express route controllers
│   │   │   ├── schemes.ts                # Paginated scheme directory
│   │   │   ├── chatbot.ts                # AI chatbot endpoint
│   │   │   ├── eligibility.ts            # Profile evaluation engine
│   │   │   ├── applications.ts           # Scheme application management
│   │   │   └── users.ts                  # User profile and PII handling
│   │   ├── services/
│   │   │   ├── geminiAI.ts               # Gemini 2.5 Flash conversational engine
│   │   │   ├── pineconeRAG.ts            # Vector search & context retrieval
│   │   │   ├── eligibilityChecker.ts     # Rule-based eligibility scoring
│   │   │   └── encryption.ts             # AES-256 field encryption
│   │   ├── __tests__/                    # Backend test suites (35 unit/integration tests)
│   │   └── index.ts                      # Express application entrypoint
│   ├── jest.config.js                    # Jest configuration
│   └── package.json
│
├── prisma/
│   ├── schema.prisma                     # Prisma schema (PostgreSQL)
│   └── migrations/                       # Schema migration history
│
├── data/                                 # Seed and reference datasets
│   ├── schemes.seed.json                 # Comprehensive government scheme seed data
│   └── schemes.seed.csv
│
├── scripts/                              # ETL & ingestion scripts
│   ├── clean_data.py                     # Data cleaning & normalization
│   ├── ingest.py                         # Pinecone embedding ingestion script
│   └── config.py
│
├── api/
│   └── index.js                          # Vercel serverless bundle
├── vercel.json                           # Vercel deployment routing configuration
├── .gitignore                            # Clean Git ignore rules
└── README.md
```

---

## ⚡ Getting Started

### Prerequisites

- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **npm**: v9.0.0 or higher
- **PostgreSQL**: Local PostgreSQL or cloud instance ([Neon](https://neon.tech), [Supabase](https://supabase.com))
- **Google AI Studio API Key**: For Gemini 2.5 Flash and Embeddings ([Get Key](https://aistudio.google.com/))
- **Pinecone API Key**: For Vector Database ([Get Key](https://www.pinecone.io/))

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/lakshaymanchanda18/GovScheme.git
   cd GovScheme
   ```

2. **Install all dependencies** (root, backend, and frontend):
   ```bash
   npm install
   ```

### Environment Variables

#### 1. Backend Configuration (`server/.env`)
Create a file at `server/.env` based on `server/.env.production.example`:

```env
# Database (PostgreSQL)
DATABASE_URL="postgresql://username:password@localhost:5432/govscheme?schema=public"

# Security & Tokens
JWT_SECRET="generate-a-secure-random-secret-key-at-least-32-characters"
JWT_EXPIRE="7d"
ENCRYPTION_KEY="generate-a-secure-random-32-char-key-for-pii"

# Server Configuration
PORT=5001
NODE_ENV="development"
FRONTEND_URL="http://localhost:5173"
CORS_ORIGIN="http://localhost:5173"

# Google Gemini AI & Pinecone Vector DB
GEMINI_API_KEY="your-google-ai-studio-api-key"
PINECONE_API_KEY="your-pinecone-api-key"
PINECONE_INDEX_NAME="gov-schemes"

# Optional Email Service
EMAIL_HOST="smtp.gmail.com"
EMAIL_PORT=587
EMAIL_USER=""
EMAIL_PASS=""
```

#### 2. Frontend Configuration (`client/.env`)
Create a file at `client/.env`:

```env
VITE_API_URL="http://localhost:5001/api"
```

### Database Setup

1. **Generate Prisma Client & Run Migrations**:
   ```bash
   npm run postinstall
   cd server
   npx prisma migrate dev --name init
   cd ..
   ```

2. **Seed Initial Schemes Data** (optional):
   ```bash
   cd server
   node add-schemes-prisma.js
   cd ..
   ```

### Running the Application

#### Start Backend (Terminal 1)
```bash
cd server
npm run dev
```
The server will start on `http://localhost:5001`. Swagger documentation is available at `http://localhost:5001/api-docs`.

#### Start Frontend (Terminal 2)
```bash
cd client
npm run dev
```
The client will start on `http://localhost:5173`.

---

## 🧪 Testing & Quality Assurance

The backend includes a comprehensive Jest test suite covering eligibility evaluation, cryptographic security, and payload validation:

```bash
# Run server test suite
npm test --prefix server
```

**Current Test Status**:
```
PASS  src/__tests__/services/validation.test.ts (11 tests)
PASS  src/__tests__/services/encryption.test.ts (7 tests)
PASS  src/__tests__/services/eligibilityChecker.test.ts (17 tests)

Test Suites: 3 passed, 3 total
Tests:       35 passed, 35 total
Snapshots:   0 total
Time:        ~2.5s
```

Frontend production build verification:
```bash
npm run build --prefix client
```

---

## 📚 API Reference

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/schemes` | List schemes with server-side pagination (`page`, `limit`, `search`, `category`, `state`) | No |
| `GET` | `/api/schemes/:id` | Get full scheme details | No |
| `POST` | `/api/schemes` | Create new scheme | Admin |
| `POST` | `/api/eligibility/check` | Evaluate citizen eligibility criteria | Optional |
| `POST` | `/api/chatbot/message` | Query conversational RAG assistant | No |
| `POST` | `/api/auth/register` | Register citizen account | No |
| `POST` | `/api/auth/login` | Authenticate citizen and receive JWT | No |
| `GET` | `/api/auth/profile` | Retrieve citizen profile and applications | Yes |
| `POST` | `/api/applications` | Submit application for a scheme | Yes |
| `GET` | `/api/applications` | List citizen submitted applications | Yes |

---

## 🔒 Security & Compliance

- **PII Encryption**: Sensitive user profile fields (e.g., Aadhaar number, bank account details) are encrypted at rest using AES-256-CBC with per-user salt derivation.
- **Stateless Authentication**: Signed JWTs with configurable expiration and secure HTTP-only cookies.
- **Brute Force & DoS Protection**: Express rate limiting applied globally and specifically tuned for authentication and chatbot endpoints.
- **SQL Injection Prevention**: Strongly-typed queries via Prisma ORM prevent raw SQL injection vulnerabilities.
- **Legal Compliance**: Full transparency via `/privacy` (Privacy Policy) and `/terms` (Terms of Service) following the Indian Digital Personal Data Protection (DPDP) principles.

---

## 🚀 Deployment

The repository is configured for serverless deployment on [Vercel](https://vercel.com):

1. **Deploying on Vercel**:
   - Set the root directory as the repository root.
   - Build Command: `npm run build`
   - Output Directory: `client/dist`
   - Add all environment variables listed in [Environment Variables](#environment-variables) into the Vercel Project Settings.
2. **Serverless API Function**:
   - `api/index.js` automatically routes `/api/*` and `/health` requests to the Express server bundle.

---

## 🤝 Contributing

We welcome contributions from developers passionate about civic technology and public service delivery:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/improvement-name`.
3. Ensure all tests pass: `npm test --prefix server` and `npm run build --prefix client`.
4. Commit your changes: `git commit -m 'feat: description of improvement'`.
5. Push to the branch: `git push origin feature/improvement-name`.
6. Open a Pull Request.

---

## 📝 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

```
Copyright (c) 2026 Lakshay Manchanda
```

---

<div align="center">

**SaralYojna — Dedicated to transparent, accessible public welfare for every citizen.**

[⬆ Back to Top](#saralyojna-सरल-योजना)

</div>
