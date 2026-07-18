---
trigger: glob
pattern: "**/*.html, public/**/*.css, public/**/*.js"
---

# Design System Rules

- **No Frameworks:** You must build all UI components using Vanilla HTML5, CSS Custom Properties, and ES Modules. Do not use React, Vue, Tailwind CSS, or Bootstrap.
- **CSS Tokens:** You must use the established CSS variables defined in `public/css/tokens.css` for colors, spacing, typography, and shadows.
- **Mobile-First:** You must implement mobile-first responsive design using media queries for larger breakpoints.
- **DOM Manipulation:** You must use standard DOM APIs (`document.getElementById`, `addEventListener`, etc.) for interactivity.
- **State Management:** You must manage client-side state locally within the respective ES modules, avoiding complex global state managers.
