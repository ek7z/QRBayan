# Backend Rules - QRPH Custom Display Name Generator

## Structure
- Use **Controller-Service-Repository** pattern.
  - **Controllers**: Handle HTTP requests, input validation, and responses.
  - **Services**: Business logic, QR payload manipulation, credit deduction logic.
  - **Repositories**: Database queries using Knex.
  - **Utils**: Shared helper functions (CRC16 calculation, QR parsing).

## API Response Format
- Success: `{ success: true, data: { ... } }`
- Error: `{ success: false, message: "Error message", error: {} }`

## Error Handling
- Use a central error handler middleware.
- Throw custom error classes for different HTTP statuses (400, 401, 403, 404, 500).

## Credit System Logic
- Credits must be deducted **only** after successful QR generation.
- Check credit balance **before** starting the generation process.
- All credit movements (purchase, spend, admin adjustment) must be recorded in `credit_transactions`.

## QR Decoding/Generation
- Use a dedicated utility or service for EMVCo/QRPH parsing.
- Recalculate CRC16 (Polynomial 0x1021) whenever the payload is modified.
- Validate the input QR payload before attempting to decode.

## File Uploads
- Use `Multer` for local file uploads.
- Store payment proofs and temporary QR uploads in `uploads/` (gitignored).
- Validate file types (jpg, png) and size limits.

## Logging
- Use `Morgan` for request logging.
- Use a logger (like `winston` or `console.log` for now) for system errors and audit events.
