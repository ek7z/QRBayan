# Testing Rules - QRPH Custom Display Name Generator

## Backend Testing
- Use `Jest` as the test runner.
- Use `Supertest` for API integration tests.
- Mock database calls using repositories or a dedicated test database.

## Test Coverage Areas
- **Auth**: Login, registration, token validation.
- **QR Utility**: Payload decoding, name modification, CRC recalculation.
- **Credit System**: Transaction logging, balance updates, race condition prevention.
- **Admin**: Proof approval logic.

## Naming Conventions
- Files: `*.test.js` or `*.spec.js`.
- Folders: `backend/tests/`.

## Workflow
- Run tests before any major PR.
- "Fail fast" - ensure critical utilities (QR/CRC) have 100% coverage.
