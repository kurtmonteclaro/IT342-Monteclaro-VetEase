# VetEase Task Checklist (Current Milestone)

Scope: **Only Registration and Login**

## 1. User Registration
- [x] Accept `name`, `email`, `password`
- [x] Validate required fields
- [x] Prevent duplicate email registration
- [x] Store user data in database (Supabase PostgreSQL)
- [x] Store passwords securely (BCrypt hash)

## 2. User Login
- [x] Accept `email` and `password`
- [x] Validate credentials from database
- [x] Block invalid credentials
- [x] Allow successful login to access system (web dashboard state)

## 3. Environment and Database Connection
- [x] Configure backend datasource for Supabase PostgreSQL via environment variables
- [x] Add root `.env.local` local-only configuration
- [x] Configure frontend API base URL through env variable

## 4. Documentation and Project Hygiene
- [x] Create root `README.md` aligned with current phase scope
- [x] Create root `TASK_CHECKLIST.md`
- [ ] Create and push to a new GitHub repository (manual step by project owner)
- [ ] Produce clear feature commits in remote repository (manual step after push)
