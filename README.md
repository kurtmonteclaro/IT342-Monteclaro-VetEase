# VetEase

VetEase is a veterinary reservation and clinic management platform for pet owners and clinic staff. Pet owners can register, sign in, manage pet profiles, browse services, request appointments, and track appointment status. Clinic staff can review booking requests, manage daily appointments, configure clinic availability, block dates, and maintain the service catalog.

## Project Structure

The project is organized around Vertical Slice Architecture, with code grouped by feature or module where practical.

```text
backend/   Spring Boot REST API
web/       React + Vite frontend
mobile/    Android/Kotlin application
docs/      System design and testing documentation
```

Key refactor documentation:

- Test plan: `docs/testing/SOFTWARE_TEST_PLAN.md`
- Regression report: `docs/testing/REGRESSION_TEST_REPORT.md`

## Core Features

- Account registration and login
- Google OAuth login
- JWT-secured backend API
- Pet profile management with photo upload
- Clinic service catalog browsing and administration
- Appointment availability lookup
- Appointment booking, cancellation, and rescheduling
- Admin appointment review, confirmation, cancellation, and completion
- Clinic settings and blocked date management
- External dog breed lookup
- Web and Android client applications

## Backend

Location: `backend/`

Requirements:

- Java 17+
- Maven Wrapper, included in the repository
- PostgreSQL database credentials

Run:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Test:

```powershell
cd backend
.\mvnw.cmd test
```

## Web Frontend

Location: `web/`

Requirements:

- Node.js 18+

Install and run:

```powershell
cd web
npm install
npm run dev
```

Test and build:

```powershell
cd web
npm run test
npm run lint
npm run build
```

The web app runs on `http://localhost:5173` by default.

## Mobile App

Location: `mobile/`

Requirements:

- Android Studio or Android SDK
- Java compatible with the configured Gradle/Android plugin

Run unit tests:

```powershell
cd mobile
.\gradlew.bat test
```

The Android emulator uses `http://10.0.2.2:8080` to reach the local backend.

## Environment Setup

Create a root `.env.local` file for local-only configuration:

```env
SUPABASE_DB_URL=jdbc:postgresql://your-host:5432/postgres?sslmode=require
SUPABASE_DB_USER=your-db-user
SUPABASE_DB_PASSWORD=your-db-password
SERVER_PORT=8080
VITE_API_BASE_URL=http://localhost:8080
GOOGLE_OAUTH_CLIENT_ID=your-google-client-id
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

Do not commit `.env.local`.

## Regression Verification

The latest vertical slice refactor was verified with:

- `cd backend && .\mvnw.cmd test`
- `cd web && npm run test`
- `cd web && npm run lint`
- `cd web && npm run build`
- `cd mobile && .\gradlew.bat test`

See `docs/testing/REGRESSION_TEST_REPORT.md` for the recorded results.
