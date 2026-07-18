---
trigger: always_on
---

# Coding Standards

- **TypeScript in Backend:** You must write all backend code (Next.js API routes, lib, validators) in TypeScript.
- **Vanilla JS in Frontend:** You must write all frontend code (`public/js/`) in vanilla JavaScript (ES Modules). Do not use JSX or TypeScript for frontend files.
- **No React Components:** You must not create React components (`.tsx` or `.jsx`). The Next.js installation is exclusively for API routes.
- **Naming Conventions:** You must use `camelCase` for variables and functions, `PascalCase` for classes and types, and `kebab-case` for file names.
- **Response Format:** You must format all API responses as `{ success: boolean, data?: any, error?: string }`.
- **Validation:** You must use Zod for all server-side request body validation. Return 400 Bad Request if validation fails.
