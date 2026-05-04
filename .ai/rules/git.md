# Git Rules - QRPH Custom Display Name Generator

## Commit Message Style
- Use descriptive, imperative messages:
  - `feat: add QR decode service`
  - `fix: correct CRC calculation logic`
  - `docs: update setup instructions`
  - `refactor: simplify credit transaction service`

## Branching
- `main`: Production-ready code.
- `develop`: Ongoing development.
- `feat/[name]`: New features.
- `fix/[name]`: Bug fixes.

## PR Checklist
- [ ] Code follows `.ai/rules/` for the relevant layer.
- [ ] No sensitive data in `.env` or code.
- [ ] All tests pass.
- [ ] No lint errors.
- [ ] Commit messages are clean.

## Ignore List
- `node_modules/`
- `.env`
- `uploads/`
- `dist/` or `build/`
- `.DS_Store`
