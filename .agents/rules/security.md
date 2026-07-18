---
trigger: always_on
---

# Security Rules

- **Authentication Guard:** You must protect all mutation API routes (POST, PUT, DELETE) and admin HTML pages using the established authentication helpers.
- **Backend Auth:** You must use `getSessionFromRequest()` in API routes to verify the `auth-token` cookie before performing any privileged action.
- **Frontend Auth:** You must include `initAuthGuard()` in all `/public/admin/` HTML pages to enforce client-side redirection.
- **Password Hashing:** You must use `bcryptjs` with 12 salt rounds for any password hashing. Never store plain text passwords.
- **SQL Injection Prevention:** You must use Prisma ORM for all database queries. Do not use raw SQL queries (`$queryRaw`) unless absolutely necessary and properly parameterized.
