# VetEase Regression Test Report

## Project Information

- Project: VetEase
- Refactor branch: `feature/vertical-slice-refactor`
- Regression date: 2026-05-08
- Applications covered: Backend, web frontend, Android mobile app

## Refactoring Summary

The project was reorganized around feature ownership while preserving existing behavior:

- Backend security classes moved into the auth slice under `auth/security`.
- Web workspace UI moved from generic `components` into `features/workspace`.
- Web API configuration, session persistence, routing contracts, and form defaults were extracted into focused modules.
- Android activities moved into `features/auth`, `features/home`, and `features/launch`.
- Android API and session helpers moved into `core/api` and `core/session`.
- Automated tests and regression documentation were added under the affected apps and `docs/testing`.

## Updated Project Structure

```text
backend/src/main/java/edu/cit/monteclaro/vetease
  appointment/
  auth/
    controller/
    dto/
    exception/
    model/
    repository/
    security/
    service/
  common/
  config/
  external/
  notification/
  pet/
  servicecatalog/
  settings/

web/src
  features/
    workspace/
      WorkspaceView.jsx
      formState.js
      formState.test.mjs
  shared/
    api/
    routing/
    session/

mobile/app/src/main/java/com/example/vetease
  core/
    api/
    session/
  features/
    auth/
    home/
    launch/
```

## Test Plan Documentation

Full plan: [SOFTWARE_TEST_PLAN.md](./SOFTWARE_TEST_PLAN.md)

## Automated Test Evidence

| Area | Command | Result | Notes |
| --- | --- | --- | --- |
| Backend | `cd backend && .\mvnw.cmd test` | Passed | 5 tests passed; Maven build successful. Warnings: deprecated `@MockBean`, Mockito dynamic agent notice. |
| Web lint | `cd web && npm run lint` | Passed with warnings | 0 errors, 5 existing React hook dependency warnings in `App.jsx`. |
| Web unit | `cd web && npm run test` | Passed | Route and form-state contract tests passed. |
| Web build | `cd web && npm run build` | Passed | Vite production build completed successfully. |
| Mobile unit | `cd mobile && .\gradlew.bat test` | Passed | Gradle build successful; Android JVM tests passed. |

## Regression Test Results

| Test ID | Feature | Result | Evidence |
| --- | --- | --- | --- |
| TC-AUTH-001 | Registration | Passed automated | Backend controller test validates successful registration response; web/mobile builds validate refactored entry points compile. |
| TC-AUTH-002 | Duplicate registration | Passed automated | Backend controller test validates conflict response. |
| TC-AUTH-003 | Login | Passed automated | Backend controller test validates successful login response. |
| TC-AUTH-004 | Invalid login | Passed automated | Backend controller test validates unauthorized response. |
| TC-PET-001 | Pet create/update/delete/photo | Passed compile regression | Backend, web, and mobile builds compile the refactored pet flow. Requires live API smoke test for end-to-end file upload evidence. |
| TC-SVC-001 | Service catalog | Passed compile regression | Backend, web, and mobile builds compile service catalog paths. |
| TC-BOOK-001 | Availability | Passed compile regression | Backend, web, and mobile builds compile availability paths. |
| TC-BOOK-002 | Booking | Passed compile regression | Backend, web, and mobile builds compile booking paths. |
| TC-APPT-001 | Reschedule | Passed compile regression | Backend, web, and mobile builds compile reschedule paths. |
| TC-APPT-002 | Cancel | Passed compile regression | Backend, web, and mobile builds compile cancel paths. |
| TC-ADMIN-001 | Admin review | Passed compile regression | Backend, web, and mobile builds compile admin review paths. |
| TC-ADMIN-002 | Complete visit | Passed compile regression | Backend, web, and mobile builds compile completion paths. |
| TC-ADMIN-003 | Clinic settings | Passed compile regression | Backend, web, and mobile builds compile settings paths. |
| TC-ADMIN-004 | Blocked dates | Passed compile regression | Backend, web, and mobile builds compile blocked-date paths. |
| TC-ADMIN-005 | Service management | Passed compile regression | Backend, web, and mobile builds compile service administration paths. |

## Issues Found

- Initial backend Maven wrapper execution failed inside the sandbox; rerun with normal wrapper permissions passed.
- Initial mobile Gradle wrapper execution failed because Gradle could not create its cache lock under the sandbox user directory; rerun with normal wrapper permissions passed.
- Initial web `node --test` execution failed because the sandbox blocked child-process spawning. Replaced it with a single-process Node assertion runner.
- Web lint reports 5 React hook dependency warnings in `App.jsx`; no lint errors were reported.

## Fixes Applied

- Moved web unit checks to `web/src/test/run-web-tests.mjs` and updated `npm run test`.
- Updated Android manifest and layout preview contexts to match feature packages.
- Updated backend security package references to `auth/security`.
- Added web and mobile automated tests for route/form/API contracts.
