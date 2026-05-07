# GovScheme

> **Intelligent Government Scheme Discovery & Application Platform**

A comprehensive full-stack web application designed to help citizens discover, evaluate eligibility for, and apply to government schemes through an AI-powered chatbot interface. Built with modern web technologies and enterprise-grade security practices.

[![MIT License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-61dafb?logo=react)](https://react.dev/)

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Running the Application](#running-the-application)
- [API Documentation](#api-documentation)
- [Database](#database)
- [Security Features](#security-features)
- [Development](#development)
- [Scripts](#scripts)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**GovScheme** is an innovative digital platform that bridges the gap between Indian citizens and government welfare schemes. The application leverages AI and machine learning to:

- **Discover**: Browse and search across hundreds of government schemes
- **Evaluate**: Automatically assess eligibility based on user profile
- **Apply**: Submit applications directly through the platform
- **Track**: Monitor application status in real-time
- **Communicate**: AI-powered chatbot for assistance and guidance

The platform is designed with accessibility, scalability, and security at its core, ensuring a seamless experience for citizens across diverse demographics.

---

## ✨ Features

### User-Centric Features
- 🔐 **Secure Authentication**: JWT-based auth with 2FA support
- 👤 **User Profiles**: Comprehensive demographic and socioeconomic data management
- 🔍 **Scheme Discovery**: Advanced search and filtering across 500+ government schemes
- 🎯 **Eligibility Assessment**: AI-powered eligibility scoring with Pinecone vector database
- 📋 **Application Management**: Submit, track, and manage multiple scheme applications
- 📄 **Document Upload**: Secure file management with verification support
- 🔔 **Real-time Notifications**: Status updates and alerts
- 💬 **AI Chatbot**: Google Generative AI-powered assistance

### Administrative Features
- 📊 **Analytics Dashboard**: Comprehensive metrics and insights
- 👨‍💼 **Scheme Management**: CRUD operations for government schemes
- 👥 **User Management**: Role-based access control
- 🔄 **Application Workflow**: Multi-stage approval pipeline
- 📈 **Reporting**: Detailed analytics and audit logs

### Technical Features
- 🛡️ **Security**: CSRF protection, rate limiting, helmet, CORS
- 🗃️ **Caching**: Redis-powered caching for performance
- 📧 **Email Notifications**: Welcome emails and status updates
- 🎙️ **Voice Interface**: Voice-based interaction support
- 🌍 **Internationalization**: Multi-language support (i18n)
- 🔄 **Job Queue**: Background job processing for async operations
- 📱 **PWA Ready**: Progressive Web App capabilities with service workers

---

## 🛠️ Tech Stack

### Frontend
```
- React 18.2.0 - UI library
- TypeScript 5.2.2 - Type safety
- Vite 5.0.0 - Build tool & dev server
- Material-UI (MUI) 5.14.3 - Component library
- React Router 6.20.1 - Client-side routing
- Redux Toolkit 1.9.5 - State management
- TanStack React Query 5.91.0 - Server state management
- React Hook Form 7.45.4 - Form handling
- React i18next 12.3.1 - Internationalization
- Axios 1.6.2 - HTTP client
- Notistack 3.0.1 - Notifications
```

### Backend
```
- Express 4.18.2 - Web framework
- TypeScript 5.3.3 - Type safety
- Prisma 5.7.0 - ORM & database migrations
- SQLite - Primary database
- JWT - Authentication
- bcryptjs 2.4.3 - Password hashing
- Google Generative AI 0.24.1 - AI chatbot
- Pinecone 7.2.0 - Vector database for ML
- Nodemailer 6.9.7 - Email service
- Redis - Caching & sessions
```

### Development & Testing
```
- Jest 30.3.0 - Testing framework
- ts-jest - TypeScript support for Jest
- Nodemon 3.0.2 - Auto-reload during development
- Swagger/OpenAPI - API documentation
```

---

## 🏗️ Architecture

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Components | Pages | Hooks | Contexts | State (Redux)  │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP/REST
┌──────────────────────▼──────────────────────────────────────┐
│                   Backend (Express + Node)                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Routes | Controllers | Services | Middleware | Utils   │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Auth | Schemes | Applications | Documents | Chatbot    │ │
│  └────────────────────────────────────────────────────────┘ │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Email Queue | Job Processing | Background Tasks       │ │
│  └────────────────────────────────────────────────────────┘ │
└──────────┬─────────────────┬──────────────┬─────────────────┘
           │                 │              │
      ┌────▼────┐     ┌──────▼──────┐  ┌───▼────┐
      │ SQLite  │     │   Redis     │  │ Pinecone
      │ (Data)  │     │ (Cache/Que) │  │ (Vector)
      └─────────┘     └─────────────┘  └────────┘
```

### Database Schema

The application uses **Prisma ORM** with SQLite, featuring these core models:

- **User**: User profiles with demographic and financial information
- **GovernmentScheme**: Comprehensive scheme data with eligibility criteria
- **Application**: User applications to schemes with workflow tracking
- **EligibilityCheck**: AI-based eligibility assessment results
- **Document**: Secure document storage and management
- **Notification**: User notifications and alerts
- **ApplicationStatusUpdate**: Audit trail for application lifecycle
- **AuditLog**: System-wide audit logging

---

## 📁 Project Structure

```
GovScheme/
├── client/                          # React Frontend
│   ├── src/
│   │   ├── components/              # Reusable React components
│   │   ├── contexts/                # React Context providers
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── locales/                 # i18n translation files
│   │   ├── App.tsx                  # Main App component
│   │   ├── main.tsx                 # React entry point
│   │   ├── i18n.ts                  # i18n configuration
│   │   ├── index.css                # Global styles
│   │   └── service-worker.ts        # PWA service worker
│   ├── public/                      # Static assets
│   ├── vite.config.ts               # Vite configuration
│   ├── tsconfig.json                # TypeScript config
│   ├── package.json                 # Frontend dependencies
│   └── index.html                   # HTML template
│
├── server/                          # Express Backend
│   ├── src/
│   │   ├── index.ts                 # Server entry point
│   │   ├── swagger.ts               # OpenAPI/Swagger configuration
│   │   ├── config/
│   │   │   └── prisma.ts            # Prisma client setup
│   │   ├── routes/                  # API route handlers
│   │   │   ├── auth.ts              # Authentication routes
│   │   │   ├── schemes.ts           # Scheme management routes
│   │   │   ├── applications.ts      # Application routes
│   │   │   ├── users.ts             # User management routes
│   │   │   ├── documents.ts         # Document handling
│   │   │   ├── chatbot.ts           # AI chatbot routes
│   │   │   ├── eligibility.ts       # Eligibility check routes
│   │   │   ├── admin.ts             # Admin dashboard routes
│   │   │   ├── notifications.ts     # Notification routes
│   │   │   ├── integrations.ts      # External integrations
│   │   │   └── voice.ts             # Voice interaction routes
│   │   ├── middleware/
│   │   │   ├── auth.ts              # JWT authentication
│   │   │   ├── validation.ts        # Zod schema validation
│   │   │   └── csrf.ts              # CSRF protection
│   │   ├── services/
│   │   │   ├── encryption.ts        # PII encryption/decryption
│   │   │   ├── queue.ts             # Job queue management
│   │   │   ├── cache.ts             # Redis caching
│   │   │   ├── email.ts             # Email service
│   │   │   ├── schemeImport.ts      # Scheme data import
│   │   │   └── [other services]     # Domain-specific services
│   │   ├── utils/
│   │   │   └── errors.ts            # Custom error classes
│   │   └── __tests__/               # Unit and integration tests
│   ├── scripts/
│   │   ├── seed.ts                  # Database seeding
│   │   ├── importSchemes.ts         # Scheme import script
│   │   └── [migration scripts]
│   ├── jest.config.js               # Jest test configuration
│   ├── tsconfig.json                # TypeScript config
│   ├── package.json                 # Backend dependencies
│   └── test.sql                     # Database test queries
│
├── prisma/
│   ├── schema.prisma                # Database schema definition
│   └── migrations/                  # Database migration history
│
├── data/
│   ├── schemes.seed.json            # 500+ government schemes dataset
│   ├── schemes.seed.csv             # CSV format seed data
│   ├── scripts/                     # Data processing scripts
│   └── processed/                   # Processed/normalized data
│
├── scripts/
│   ├── clean_data.py                # Data cleaning utilities
│   ├── scrape_schemes.py            # Web scraping for schemes
│   ├── config.py                    # Python configuration
│   ├── ingest.py                    # Data ingestion pipeline
│   ├── export_dataset.py            # Export utilities
│   ├── validate_data.py             # Data validation
│   ├── run_pipeline.py              # ETL pipeline orchestration
│   ├── test_apis.py                 # Python API tests
│   ├── test_apis.js                 # Node.js API tests
│   └── requirements.txt             # Python dependencies
│
├── .vscode/                         # VS Code configuration
├── .gitignore                       # Git ignore rules
├── package.json                     # Root workspace config
├── package-lock.json                # Dependency lock file
├── LICENSE                          # MIT License
└── README.md                        # This file
```

---

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js**: v18.0.0 or higher ([Download](https://nodejs.org/))
- **npm**: v9.0.0 or higher (comes with Node.js)
- **Git**: For version control ([Download](https://git-scm.com/))
- **SQLite**: v3.0 or higher (usually pre-installed)
- **Redis** (Optional): For production deployment
- **Python**: v3.8+ (for data scripts)

### Optional Services
- **Google Generative AI API Key**: For AI chatbot features
- **Pinecone API Key**: For semantic search and eligibility assessment
- **SMTP Server**: For email notifications (or use SendGrid/similar)

---

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/lakshaymanchanda18/GovScheme.git
cd GovScheme
```

### 2. Install Dependencies

Install root dependencies:
```bash
npm install
npm run prisma:generate
```

Install frontend dependencies:
```bash
cd client
npm install
cd ..
```

Install backend dependencies:
```bash
cd server
npm install
cd ..
```

### 3. Install Python Scripts Dependencies (Optional)

```bash
cd scripts
pip install -r requirements.txt
cd ..
```

---

## ⚙️ Configuration

### 1. Environment Variables

Create a `.env.local` file in the `server` directory:

```env
# Database
DATABASE_URL="file:./dev.db"

# Server Configuration
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key-min-32-characters
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# Security
CSRF_SECRET=your-csrf-secret-key

# Email Service
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@govscheme.com

# AI & ML Services
GOOGLE_API_KEY=your-google-generative-ai-key
PINECONE_API_KEY=your-pinecone-api-key
PINECONE_ENVIRONMENT=your-pinecone-environment
PINECONE_INDEX=govscheme-index

# Redis (Optional)
REDIS_URL=redis://localhost:6379

# Two-Factor Authentication
2FA_WINDOW_SIZE=30
```

### 2. Frontend Configuration

Create a `.env.local` file in the `client` directory:

```env
VITE_API_URL=http://localhost:5000/api
VITE_APP_NAME=GovScheme
VITE_APP_VERSION=1.0.0
```

### 3. Database Setup

Initialize the database:

```bash
cd server
npm run prisma:migrate
npm run prisma:generate
cd ..
```

Seed the database with government schemes:

```bash
cd server
npm run seed
cd ..
```

---

## 🚀 Running the Application

### Development Mode (Full Stack)

**Terminal 1 - Backend Server:**
```bash
cd server
npm run dev
```
The backend will start on `http://localhost:5000`
API docs available at `http://localhost:5000/api-docs`

**Terminal 2 - Frontend Dev Server:**
```bash
cd client
npm run dev
```
The frontend will start on `http://localhost:5173`

### Production Mode

**Build Frontend:**
```bash
cd client
npm run build
```

**Build & Start Backend:**
```bash
cd server
npm run build
npm start
```

---

## 📚 API Documentation

The API is fully documented using **Swagger/OpenAPI**. After starting the server, visit:

```
http://localhost:5000/api-docs
```

### Key API Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile
- `POST /api/auth/refresh` - Refresh JWT token
- `GET /api/auth/csrf-token` - Get CSRF token

#### Schemes
- `GET /api/schemes` - List all schemes (paginated)
- `GET /api/schemes/:id` - Get scheme details
- `POST /api/schemes` - Create scheme (admin)
- `PUT /api/schemes/:id` - Update scheme (admin)
- `DELETE /api/schemes/:id` - Delete scheme (admin)

#### Applications
- `GET /api/applications` - List user's applications
- `POST /api/applications` - Submit new application
- `GET /api/applications/:id` - Get application details
- `PUT /api/applications/:id` - Update application
- `DELETE /api/applications/:id` - Cancel application

#### Eligibility
- `POST /api/eligibility/check` - Check scheme eligibility
- `GET /api/eligibility/results` - Get eligibility history

#### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/:id` - Download document
- `DELETE /api/documents/:id` - Delete document

#### Chatbot
- `POST /api/chatbot/message` - Send message to AI chatbot
- `GET /api/chatbot/context` - Get chat context

#### Admin
- `GET /api/admin/analytics` - Dashboard analytics
- `GET /api/admin/users` - List all users
- `GET /api/admin/applications` - List all applications

---

## 🗄️ Database

### Database Schema Highlights

**User Model**:
- Complete demographic information
- Financial data (encrypted)
- Document references
- Application history

**GovernmentScheme Model**:
- Comprehensive scheme details
- Eligibility criteria
- Benefits information
- Application process steps

**Application Model**:
- Multi-stage workflow (PENDING → APPROVED/REJECTED)
- Document attachments
- Status history tracking
- Audit trail

**EligibilityCheck Model**:
- AI-based assessment scores
- Matched/unmatched criteria
- Confidence scores
- Historical records

### Database Migrations

Run migrations:
```bash
cd server
npm run prisma:migrate
```

View database in Prisma Studio:
```bash
npm run prisma:studio
```

---

## 🔒 Security Features

### Authentication & Authorization
- ✅ JWT-based stateless authentication
- ✅ bcryptjs password hashing (salt rounds: 12)
- ✅ 2FA/TOTP support
- ✅ Role-based access control (RBAC)
- ✅ HTTP-only secure cookies

### Data Protection
- ✅ PII encryption/decryption
- ✅ HTTPS enforcement (production)
- ✅ CORS configuration
- ✅ CSRF token protection
- ✅ SQL injection prevention (Prisma ORM)

### Rate Limiting
- ✅ Global rate limiter: 200 requests/15min
- ✅ Auth limiter: 100 requests/15min
- ✅ Chatbot limiter: 30 requests/min
- ✅ Upload limiter: 10 requests/min

### Security Headers
- ✅ Helmet.js for secure HTTP headers
- ✅ Content-Security-Policy
- ✅ X-Frame-Options
- ✅ X-Content-Type-Options

### Audit & Logging
- ✅ Request ID tracking
- ✅ Structured logging
- ✅ Audit trail for all operations
- ✅ Error tracking without sensitive data exposure

---

## 👨‍💻 Development

### Project Scripts

**Frontend**:
```bash
cd client
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
```

**Backend**:
```bash
cd server
npm run dev                  # Start with nodemon
npm run build               # Compile TypeScript
npm run start               # Run compiled code
npm test                    # Run tests
npm run test:coverage       # Generate coverage report
npm run prisma:migrate      # Run migrations
npm run prisma:studio       # Open Prisma Studio
npm run import:schemes      # Import schemes data
```

**Data Scripts**:
```bash
cd scripts
python scrape_schemes.py       # Scrape schemes from web
python clean_data.py           # Clean and validate data
python validate_data.py        # Run data validation
python export_dataset.py       # Export processed data
python run_pipeline.py         # Run full ETL pipeline
python test_apis.py            # Test APIs with Python
```

### Code Quality

The project uses:
- **TypeScript** for type safety
- **Zod** for runtime schema validation
- **Jest** for unit and integration testing
- **ESLint** (recommended) for code linting
- **Prettier** (recommended) for code formatting

### Testing

Run tests:
```bash
cd server
npm test
npm run test:coverage
```

---

## 📊 Key Features Deep Dive

### AI-Powered Eligibility Assessment
The platform uses **Pinecone vector database** with semantic search to:
1. Parse user profile
2. Create embeddings
3. Compare against scheme requirements
4. Generate confidence scores
5. Recommend matching schemes

### Real-time Notifications
- Application status updates
- Chatbot assistance notifications
- Administrative alerts
- Document verification notices

### Multi-language Support (i18n)
- English (en) - Default
- Hindi (hi)
- Regional language support
- Dynamic language switching

### Background Job Processing
- Email delivery
- Document processing
- Analytics refresh
- Scheme validation

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Contribution Guidelines
- Follow the existing code style
- Add tests for new features
- Update documentation
- Keep commits atomic and descriptive

---

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

```
MIT License

Copyright (c) 2026 Lakshay Manchanda

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.
```

---

## 📞 Support & Contact

- **Author**: Lakshay Manchanda
- **GitHub**: [@lakshaymanchanda18](https://github.com/lakshaymanchanda18)
- **Email**: [Contact through GitHub](https://github.com/lakshaymanchanda18)

---

## 🙏 Acknowledgments

- Google Generative AI for AI chatbot capabilities
- Pinecone for vector search infrastructure
- Material-UI for component library
- Express.js community
- Prisma team for excellent ORM

---

## 📈 Project Status

- ✅ MVP Complete
- ✅ Core Features Implemented
- 🚀 Production Ready
- 📋 Continuous Improvements Ongoing

**Last Updated**: May 2026  
**Version**: 1.0.0

---

<div align="center">

**Built with ❤️ to serve Indian citizens**

[⬆ back to top](#govscheme)

</div>