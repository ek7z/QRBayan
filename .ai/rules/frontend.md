# Frontend Rules - QRPH Custom Display Name Generator

## React Structure
- Use functional components and Hooks.
- Prefer `const ComponentName = () => { ... }` syntax.
- Use `Vite` as the build tool.

## Component Rules
- Keep components small and focused.
- Store shared components in `src/components/`.
- Store feature-specific components in `src/features/[feature-name]/components/`.
- Use `Lucide React` for icons.

## Styling Rules
- Use `Tailwind CSS` for all styling.
- Follow a mobile-first responsive design.
- Use standard color palettes (don't hardcode hex codes unless necessary).

## Routing Rules
- Use `react-router-dom`.
- Define routes in `src/routes/`.
- Use Protected Routes for authenticated sections (Dashboard, History).

## Form Validation
- Use `react-hook-form` for all forms.
- Use `Zod` for schema validation.
- Show clear error messages under inputs.

## State Management
- Use `Zustand` for global state (Auth, UI state, Credits).
- Use local `useState` for component-level state.

## API Handling
- Use `Axios` with a base instance in `src/api/`.
- Centralize API calls in `src/api/` or within features.
- Handle loading and error states for every request.

## UI/UX Rules
- **Generate Button**: Must be disabled until the "Important Display Notice" checkbox is checked.
- **Loading States**: Use skeletons or spinners during API calls.
- **Empty States**: Show helpful messages if history or credits are empty.
- **Feedback**: Show success/error toasts after actions (e.g., QR generated, credits bought).

## Accessibility
- Use semantic HTML.
- Ensure proper ARIA labels where needed.
- Maintain readable color contrast.
