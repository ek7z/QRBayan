# API Rules - QRPH Custom Display Name Generator

## REST Conventions
- Use plural nouns for resources (e.g., `/api/users`, `/api/qrs`).
- Use HTTP verbs correctly:
  - `GET`: Retrieve data.
  - `POST`: Create data / Perform action (e.g., `/generate`).
  - `PATCH/PUT`: Update data.
  - `DELETE`: Remove data.

## Route Naming
- Auth: `/api/auth/register`, `/api/auth/login`.
- User: `/api/user/profile`, `/api/user/credits`.
- QR: `/api/qr/decode`, `/api/qr/generate`, `/api/qr/history`.
- Admin: `/api/admin/users`, `/api/admin/proofs`, `/api/admin/logs`.

## Request/Response
- Headers: `Content-Type: application/json`, `Authorization: Bearer <token>`.
- Paginate large lists using `?page=1&limit=20`.

## Status Codes
- `200 OK`: Success.
- `201 Created`: Successfully created resource.
- `400 Bad Request`: Validation error.
- `401 Unauthorized`: Missing or invalid token.
- `403 Forbidden`: Insufficient permissions (non-admin).
- `404 Not Found`: Resource doesn't exist.
- `500 Internal Server Error`: Something broke.
