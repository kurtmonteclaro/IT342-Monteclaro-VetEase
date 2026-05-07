# VetEase Software Test Plan

## Project Information

- Project: VetEase veterinary reservation platform
- Scope: Spring Boot backend, React web frontend, Android mobile app
- Branch: `feature/vertical-slice-refactor`
- Test objective: verify all implemented functional requirements after vertical slice refactoring.

## Functional Requirements Coverage

| Requirement | Backend | Web | Mobile | Automated Coverage |
| --- | --- | --- | --- | --- |
| Account registration | `/api/auth/register` | Register form | Register screen | `AuthControllerTest.registerReturnsCreated`, web form defaults |
| Login and session persistence | `/api/auth/login`, JWT filter | Login form, local storage session | Login screen, `SessionManager` | `AuthControllerTest.loginReturnsSuccess`, route/session smoke through build |
| Google OAuth login | `/api/auth/oauth/google` | Google Identity button | Credential Manager login | Manual regression steps |
| Role-based workspace routing | Spring Security config | Admin/client route guards | Launch/auth/home navigation | Web route contract tests |
| Pet profile management | `/api/pets` CRUD, photo upload | Pets workspace | Home pet flow | Manual regression steps |
| Service catalog browsing | `/api/services` | Services workspace | Home service list | Manual regression steps |
| Appointment availability | `/api/availability` | Booking slot grid | Booking slot list | Manual regression steps |
| Appointment booking | `/api/appointments` | Booking form | Home booking flow | Manual regression steps |
| Appointment cancel/reschedule | appointment mutation endpoints | Appointment manager | Home appointment actions | Manual regression steps |
| Admin appointment review | `/api/admin/appointments/*` | Admin control center | Admin home controls | Manual regression steps |
| Clinic settings | `/api/admin/settings` | Admin settings dock | Admin home controls | Manual regression steps |
| Blocked dates | `/api/admin/blocked-dates` | Admin blocked date panel | Admin home controls | Manual regression steps |
| Service administration | `/api/admin/services` | Admin service form | Admin home controls | Manual regression steps |
| External dog breed lookup | `/api/external/dog-breeds` | Pet breed datalist | Pet breed selector | Manual regression steps |

## Test Cases and Steps

| ID | Feature | Test Steps | Expected Result |
| --- | --- | --- | --- |
| TC-AUTH-001 | Registration | Open register, enter valid username, name, email, password, CLIENT role, submit. | Account is created, token is returned, user lands in dashboard. |
| TC-AUTH-002 | Duplicate registration | Register using an already-used email. | API returns conflict and UI shows the duplicate email message. |
| TC-AUTH-003 | Login | Submit valid username and password. | Session is saved and workspace routes become available. |
| TC-AUTH-004 | Invalid login | Submit bad credentials. | API returns unauthorized and UI displays the error. |
| TC-PET-001 | Pet create/update/delete | Add a pet, edit notes/breed, upload a valid image, then delete it. | Pet list reflects each change and rejects unsupported/oversized images. |
| TC-SVC-001 | Service catalog | Open client service catalog. | Active services display name, description, and duration. |
| TC-BOOK-001 | Availability | Select service and future date. | Available slots load; past dates are blocked by the UI. |
| TC-BOOK-002 | Booking | Choose pet, service, date, time, notes, submit. | Appointment is created as pending and appears in appointments. |
| TC-APPT-001 | Reschedule | Open an active appointment, choose new future slot, submit. | Appointment returns to pending review with the new date/time. |
| TC-APPT-002 | Cancel | Cancel an active appointment. | Appointment status becomes cancelled and no longer offers active actions. |
| TC-ADMIN-001 | Review booking | Login as admin, accept a pending appointment. | Appointment status becomes confirmed. |
| TC-ADMIN-002 | Complete visit | Mark a confirmed appointment for today as complete. | Appointment status becomes completed. |
| TC-ADMIN-003 | Clinic settings | Change open/close time and slot length. | Settings persist and availability follows the new schedule. |
| TC-ADMIN-004 | Blocked dates | Add then remove a blocked date. | Blocked dates prevent booking while present and allow booking after removal. |
| TC-ADMIN-005 | Manage services | Add, edit, deactivate a clinic service. | Catalog reflects active services; inactive services are hidden from client booking. |

## Automated Test Cases

| Command | Coverage |
| --- | --- |
| `cd backend && .\mvnw test` | Spring context plus auth controller success/error paths. |
| `cd web && npm run test` | Workspace route contract and form-state default coverage. |
| `cd web && npm run lint` | React source quality and hook rule validation. |
| `cd web && npm run build` | Production frontend compile regression. |
| `cd mobile && .\gradlew test` | Android JVM unit tests including API encoding contract. |

## Regression Procedure

1. Confirm branch is `feature/vertical-slice-refactor` and working tree contains only intended refactor/test/doc changes.
2. Run backend automated tests.
3. Run web lint, web unit tests, and web production build.
4. Run mobile JVM tests.
5. Manually smoke-test registration, login, client booking, pet management, admin review, settings, blocked dates, and service management against a local backend.
6. Record failures, fixes, and remaining risks in the regression report.
