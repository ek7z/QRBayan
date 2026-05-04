# Project Plan - QRPH Custom Display Name Generator

## Overview
A web application allowing users to upload a QRPH payment code, decode it, customize the display name, and generate a new QR code.

## Main Modules
1. **Auth**: Login/Register with JWT.
2. **QR Engine**: Decode existing QRs, modify payload, recalculate CRC, and generate new QRs.
3. **Credit System**: 1 credit per generation. Support for manual payment proof uploads.
4. **Admin Dashboard**: User management, credit management, payment proof approval, audit logs.
5. **User Dashboard**: Credit balance, history, QR generation tool, compatibility guide.

## Tech Stack
- **Frontend**: React, Tailwind, Zustand, Vite.
- **Backend**: Node.js, Express, MySQL, Knex.
- **Testing**: Jest, Supertest.

## MVP Scope
- User registration and login.
- QR upload and decoding.
- Custom name input and QR generation.
- Basic credit purchase via payment proof upload.
- Admin approval of credits.
- Downloadable QR images.
- Generation history.

## Out of Scope (Initial Phase)
- Real-time payment gateway integration (PayMongo, etc.).
- Advanced QR analytics.
- Bulk generation.

## Product Safety Notes
- **Required Warning**: "Display may vary depending on wallet, bank, or QR source."
- **Legitimacy**: "For legitimate merchant/payment display customization only."
- **No False Claims**: Do NOT promise 100% privacy or universal bank support.

## Development Phases
1. **Phase 1**: Project Setup & Documentation (Rules, Folders, Config).
2. **Phase 2**: Database Schema & Auth.
3. **Phase 3**: QR Core (Decode/Generate) & Utility logic.
4. **Phase 4**: Credit System & Admin Dashboard.
5. **Phase 5**: Frontend UI/UX & Integration.
6. **Phase 6**: Testing & Final Refinements.
