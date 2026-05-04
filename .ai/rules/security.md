# Security & Compliance Rules - QRPH Custom Display Name Generator

## Authentication
- Use `bcrypt` for password hashing (salt rounds: 10).
- Use `JWT` for session management (stored in HttpOnly cookies or Authorization header).
- Include `userId` and `role` in the JWT payload.

## Input Validation
- Use `Zod` (frontend) and `Joi` or `Express-Validator` (backend) for all inputs.
- Sanitize any data that will be part of the QR payload.

## QR Security
- Validate that the uploaded QR is a legitimate QRPH/EMVCo payload.
- Do not allow modifications to sensitive fields like bank accounts or transaction IDs (if any).
- Recalculate and verify CRC before generation.

## Product Compliance (CRITICAL)
- **Forbidden Claims**: Never use words like "100% anonymous", "fully private", "bypass verification", or "fake merchant".
- **Safe Wording**: Always use "Customize display name", "For supported wallets", "Legitimate branding".
- **Notice**: Every QR generation page must display the "Important Display Notice".
- **Consent**: User must check a box acknowledging display variability before generation.

## Environment Variables
- Keep `.env` files in `.gitignore`.
- Use `.env.example` as a template.
- Required: `DB_PASSWORD`, `JWT_SECRET`, `ADMIN_EMAIL`.

## Admin Security
- Protect admin routes with middleware checking for `role === 'admin'`.
- Audit log all admin actions (credit adjustments, proof approvals).
