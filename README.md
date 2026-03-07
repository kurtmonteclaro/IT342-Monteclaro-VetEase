# VetEase

VetEase is a veterinary reservation and scheduling platform where pet owners can book clinic appointments online while clinic staff manage schedules and bookings efficiently.

This repository currently implements **Phase 1 only**:
- User Registration
- User Login

Future SDD features (pets, services, appointments, admin tools, OAuth, email, uploads, etc.) are intentionally out of scope for this phase.

## Current Architecture
- Backend: Spring Boot REST API (`backend/`)
- Web Frontend: React + Vite SPA (`web/`)
- Mobile: Android/Kotlin placeholder (`mobile/`)
- Documentation: `docs/`

## Phase 1 Features Implemented
1. Registration (`POST /api/auth/register`)
- Required fields: `name`, `email`, `password`
- Validates input
- Prevents duplicate email registration
- Stores password using BCrypt hashing
- Persists users in PostgreSQL (Supabase)

2. Login (`POST /api/auth/login`)
- Accepts `email` and `password`
- Validates credentials from the database
- Rejects invalid credentials
- Returns success response for frontend dashboard access

## API Contract (Phase 1)
### Register
`POST /api/auth/register`

Request body:
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "Password123"
}
```

Success response (`201`):
```json
{
  "id": 1,
  "name": "Jane Doe",
  "email": "jane@example.com",
  "message": "Registration successful"
}
```

### Login
`POST /api/auth/login`

Request body:
```json
{
  "email": "jane@example.com",
  "password": "Password123"
}
```

Success response (`200`):
```json
{
  "id": 1,
  "name": "Jane Doe",
  "email": "jane@example.com",
  "message": "Login successful"
}
```

## Environment Setup
Create/edit root `.env` (already added in this repo) with your Supabase values:

```env
SUPABASE_DB_URL=jdbc:postgresql://db.<your-project-ref>.supabase.co:5432/postgres?sslmode=require
SUPABASE_DB_USER=postgres
SUPABASE_DB_PASSWORD=your-supabase-db-password
SERVER_PORT=8080
VITE_API_BASE_URL=http://localhost:8080
```

## Run Instructions
### 1. Backend
Requirements:
- Java 17+
- Maven Wrapper (already included)

Commands:
```bash
cd backend
./mvnw spring-boot:run
```

Windows PowerShell:
```powershell
Set-Location backend
.\mvnw.cmd spring-boot:run
```

### 2. Web
Requirements:
- Node.js 18+

Commands:
```bash
cd web
npm install
npm run dev
```

Web app runs on `http://localhost:5173` and connects to backend via `VITE_API_BASE_URL`.

## Notes
- Spring Boot 3 requires Java 17 or newer.
- This phase does not yet include JWT, role management, appointments, or admin modules.
- Keep commit history focused and feature-based (registration and login milestones).
