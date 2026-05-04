# Database Rules - QRPH Custom Display Name Generator

## General Rules
- Use **MySQL**.
- Table names: `snake_case`, plural (e.g., `users`, `generated_qrs`).
- Column names: `snake_case`, singular (e.g., `first_name`, `is_active`).

## Core Tables
- **users**: `id`, `email`, `password`, `role`, `balance`, `created_at`, `updated_at`.
- **generated_qrs**: `id`, `user_id`, `original_payload`, `modified_payload`, `custom_name`, `created_at`.
- **credit_transactions**: `id`, `user_id`, `amount`, `type` (spend, topup, refund), `payment_proof_id`, `created_at`.
- **payment_proofs**: `id`, `user_id`, `amount`, `reference_number`, `image_path`, `status` (pending, approved, rejected), `admin_id`, `created_at`.

## Data Integrity
- Use Foreign Keys for relationships.
- Use `created_at` and `updated_at` (managed by Knex timestamps).
- Use `decimal(10,2)` for any monetary values (if applicable).
- Use `text` or `longtext` for QR payloads.

## Soft Deletes
- Implement `deleted_at` for critical tables like `users` if needed.

## Indexes
- Index frequently queried columns: `email` (unique), `user_id`, `status`, `reference_number`.
