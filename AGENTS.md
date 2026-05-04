# AGENTS.md - QRPH Custom Display Name Generator

## Project Goal
Build a legitimate QRPH Custom Display Name Generator for merchant/payment branding customization.

## Tech Stack
### Frontend
- React (Vite)
- Tailwind CSS
- Zustand (State Management)
- React Router (Routing)
- React Hook Form + Zod (Validation)
- Lucide React (Icons)
- Axios (API)

### Backend
- Node.js + Express.js
- MySQL
- Knex.js (Migrations/Seeds/Query Builder)
- JWT (Authentication)
- bcrypt (Hashing)
- Morgan (Logging)
- Multer (Local Uploads)
- Jest + Supertest (Testing)

## Architecture
Follow a clean Full-Stack separation:
- **Frontend**: Feature-based folder structure.
- **Backend**: Controller-Service-Repository pattern.

## AI Instructions
1. **Always Read Rules**: Before making any changes, read and follow all files inside `.ai/rules/`.
2. **Safety First**: Adhere to the safety and compliance wording in `security.md`. Never claim 100% anonymity or universal compatibility.
3. **Clean Code**: Follow the specific rules for Frontend, Backend, and Database layers.
4. **Automated Credits**: Ensure the credit system logic follows the rules in `backend.md` and `database.md`.
5. **Legitimacy**: This tool is for customization, not for bypassing security or impersonating official entities.

## Folder Structure Rules
- **Frontend**: Components should be modular and reusable. Use `features/` for domain-specific logic.
- **Backend**: Keep logic in services. Controllers handle HTTP concerns. Repositories handle DB operations.

## Checklist Before Implementation
- [ ] Read `.ai/project-plan.md`
- [ ] Read all `.ai/rules/*.md` files
- [ ] Verify environment variables in `.env.example`
- [ ] Check migration consistency
