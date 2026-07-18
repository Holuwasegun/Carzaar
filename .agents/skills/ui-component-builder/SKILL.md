---
name: ui-component-builder
description: Builds frontend components using Vanilla HTML, CSS Custom Properties, and ES Modules according to the project's design system.
---

# Vanilla UI Component Builder

**Purpose:** Creates new UI elements without relying on React or external frontend frameworks.
**Traces to:** PRD Section 7 (Frontend Technology), `design-system-rule.md`, `coding-standards.md`.

## Execution Steps

1. **HTML Structure:** Write semantic HTML in the target `.html` file inside the `/public/` directory.
2. **CSS Styling:** 
   - Add new styles to the relevant CSS file in `/public/css/`.
   - Strictly use CSS variables from `public/css/tokens.css` for all colors, spacing, fonts, and radii (e.g., `var(--color-brand)`, `var(--space-4)`).
   - Do NOT use hardcoded hex codes or pixel values for these properties.
3. **JavaScript Logic:**
   - Create an ES Module in `/public/js/`.
   - Query DOM elements using `document.getElementById` or `document.querySelector`.
   - Attach event listeners and manage state locally.
4. **Data Fetching:** Use the native `fetch` API to interact with `/api/...` endpoints. Parse the `{ success, data, error }` response format.

## Common Traps
- **Trap:** Trying to create a `.jsx` or `.tsx` file for a frontend component.
- **Avoidance:** Remember this project uses Next.js *only* as a backend API server. All UI is static HTML/JS.

## Verify Before Done
- [ ] Is the code completely free of React imports and JSX syntax?
- [ ] Are CSS custom properties (`var(--...)`) used for styling?
- [ ] Is state managed locally without Redux, Vuex, or context?
- [ ] Does it fetch data via standard `fetch` API?
