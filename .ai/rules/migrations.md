# Migration Rules - QRPH Custom Display Name Generator

## Knex Migrations
- Use `knex migrate:make migration_name`.
- Migration naming: `YYYYMMDDHHMMSS_description.js`.
- Always implement both `up` and `down` functions.

## Schema Changes
- **NEVER** edit a migration file after it has been pushed/applied in a shared environment.
- Create a **new** migration file to modify existing tables (e.g., adding a column).

## Seeds
- Use seeds for initial roles or admin user creation.
- Do not seed large amounts of mock data in production.

## Workflow
1. Create migration.
2. Run `knex migrate:latest`.
3. If failure occurs, fix and run `knex migrate:rollback` before retrying.
