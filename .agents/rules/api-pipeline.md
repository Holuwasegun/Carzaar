---
trigger: glob
pattern: "app/api/**/*.ts"
---

# API Pipeline Rules

- **Thin Handlers:** You must keep API route handlers thin. Extract complex business logic or multi-step database operations into separate service files in `/src/lib/`.
- **Synchronous Execution:** You must write synchronous API logic. Do not implement background jobs or message queues.
- **Standardized Responses:** You must return standard Next.js `NextResponse.json()` objects with the shape `{ success: boolean, error?: string, ...data }`.
- **Error Catching:** You must wrap all database and external calls in `try/catch` blocks.
- **Zod Error Handling:** You must catch Zod validation errors (check if `error.name === 'ZodError'`) and return a 400 status code with detailed validation failure messages.
