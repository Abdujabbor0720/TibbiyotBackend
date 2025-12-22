# Eski TASHMI

> Telegram Bot + WebApp Backend for Student Information System

A production-grade NestJS backend for a Telegram-based student information system with multi-language support, privacy-focused encrypted messaging, and comprehensive admin tools.

## 🌟 Features

### For Students (via Telegram Bot & WebApp)
- 📰 View news and announcements (Uzbek, Russian, English)
- 👥 Browse contact persons by department
- 💬 Send encrypted messages to contact persons
- 🌐 Multi-language interface (uz/ru/en)

### For Admins (via Telegram Bot & WebApp)
- 📝 Create/edit/publish news posts with media
- 👤 Manage contact persons
- 📢 Broadcast messages to users (rate-limited)
- 📊 View audit logs
- 👥 User management

### Security Features
- 🔐 Telegram WebApp initData verification (HMAC SHA-256)
- 🔒 AES-256-GCM encryption for messages at rest
- 🛡️ Role-based access control (RBAC)
- 🚦 Rate limiting (API & broadcast)
- 📁 Magic byte file validation
- 🔑 Short-lived JWT tokens (1 hour)

## 🏗️ Tech Stack

- **Framework**: NestJS 11.x with TypeScript
- **Database**: PostgreSQL 16 with TypeORM
- **Cache/Queue**: Redis with BullMQ
- **Bot**: grammY (Telegram Bot Framework)
- **Storage**: S3-compatible (MinIO/AWS S3)
- **Security**: Helmet, CORS, Throttler
- **Validation**: class-validator, Zod

## 📁 Project Structure

```
src/
├── common/                 # Shared utilities
│   ├── decorators/         # @CurrentUser, @Auth
│   ├── filters/            # Exception handling
│   ├── guards/             # JWT, Admin, TelegramWebApp
│   ├── interceptors/       # Logging, Transform
│   └── utils/              # Encryption, Telegram auth, File validation
├── config/                 # Configuration (Zod validation)
├── database/
│   ├── entities/           # TypeORM entities
│   └── migrations/         # Database migrations
└── modules/
    ├── auth/               # Telegram WebApp authentication
    ├── bot/                # grammY Telegram bot
    ├── broadcast/          # Queue-based message broadcasting
    ├── contacts/           # Contact person management
    ├── health/             # Health check endpoint
    ├── media/              # S3 file uploads
    ├── messaging/          # Encrypted user-to-contact messaging
    ├── news/               # News/announcements CRUD
    └── users/              # User management
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Telegram Bot Token (from @BotFather)

### 1. Clone and Install

```bash
git clone <repository-url>
cd eski-tashmi
npm install
```

### 2. Environment Setup

```bash
cp .env.example .env
# Edit .env with your values
```

**Required environment variables:**
- `TELEGRAM_BOT_TOKEN` - From @BotFather
- `JWT_SECRET` - Generate: `node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"`
- `DATA_ENCRYPTION_KEY` - Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`
- `DATABASE_PASSWORD` - Your PostgreSQL password

### 3. Start Services (Development)

```bash
# Start PostgreSQL, Redis, MinIO
npm run docker:dev

# Run migrations
npm run migration:run

# Start the application
npm run start:dev
```

### 4. Verify Installation

```bash
# Health check
curl http://localhost:3000/health

# API documentation
open http://localhost:3000/api
```

## 🐳 Docker Deployment

### Production

```bash
# Configure production environment
cp .env.example .env
# Edit .env with production values

# Build and start all services
npm run docker:prod

# Run migrations
docker exec -it eski_tashmi_app npm run migration:run
```

### Development

```bash
# Start only infrastructure (DB, Redis, MinIO)
npm run docker:dev

# Run app locally with hot reload
npm run start:dev
```

## 📚 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/telegram` | Authenticate via Telegram initData |
| GET | `/api/auth/me` | Get current user |

### News (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/news` | List published news |
| GET | `/api/news/:id` | Get news by ID |

### Contacts (Public)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/contacts` | List active contacts |
| GET | `/api/contacts/:id` | Get contact by ID |

### Admin Endpoints
All admin endpoints require `@Auth('admin')` decorator.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/news` | Create news |
| PUT | `/api/admin/news/:id` | Update news |
| DELETE | `/api/admin/news/:id` | Delete news |
| POST | `/api/admin/contacts` | Create contact |
| PUT | `/api/admin/contacts/:id` | Update contact |
| DELETE | `/api/admin/contacts/:id` | Delete contact |
| POST | `/api/admin/broadcasts` | Create broadcast |
| GET | `/api/admin/broadcasts` | List broadcasts |
| POST | `/api/admin/media/upload` | Upload media |
| GET | `/api/admin/users` | List users |
| GET | `/api/admin/audit-logs` | View audit logs |

## 🔐 Security Checklist

### OWASP Top 10 Mapping

| Risk | Mitigation |
|------|------------|
| A01:2021 Broken Access Control | RBAC with guards, JWT verification |
| A02:2021 Cryptographic Failures | AES-256-GCM encryption, HTTPS only |
| A03:2021 Injection | TypeORM parameterized queries, input validation |
| A04:2021 Insecure Design | Telegram initData verification, short-lived tokens |
| A05:2021 Security Misconfiguration | Helmet headers, environment validation |
| A06:2021 Vulnerable Components | npm audit, Dependabot |
| A07:2021 Auth Failures | Rate limiting, no password storage |
| A08:2021 Data Integrity Failures | Signed Telegram data, checksum validation |
| A09:2021 Logging Failures | Structured logging, audit trail |
| A10:2021 SSRF | No user-controlled URLs, S3 presigned URLs |

### Pre-Deployment Checklist

- [ ] All environment variables set
- [ ] Database migrations run
- [ ] JWT_SECRET is unique and strong (64+ chars)
- [ ] ENCRYPTION_KEY is unique and strong (32 bytes hex)
- [ ] CORS_ORIGINS restricted to your domains
- [ ] HTTPS enforced (via reverse proxy)
- [ ] Rate limiting configured
- [ ] File upload limits set
- [ ] Audit logging enabled
- [ ] Health check endpoint accessible
- [ ] Telegram webhook secured (if using webhooks)

## 🧪 Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage report
npm run test:cov
```

## 📝 Database Migrations

```bash
# Generate new migration
npm run migration:generate -- src/database/migrations/MigrationName

# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Show migration status
npm run migration:show
```

## 🔄 Bot Commands

| Command | Description |
|---------|-------------|
| `/start` | Start bot, language selection |
| `/language` | Change language |
| `/help` | Show help message |
| `/admin` | Admin menu (admins only) |

## 📊 Monitoring

### Health Check
```bash
GET /health
```
Returns database connectivity and app status.

### Logs
Structured JSON logging with correlation IDs for request tracing.

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is proprietary software. All rights reserved.

---

Built with ❤️ using [NestJS](https://nestjs.com/)
