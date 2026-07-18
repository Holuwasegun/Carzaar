# Carzaar AI Agent Handbook

## Project Summary
Carzaar is a Nigeria-focused online car marketplace that connects buyers to dealers exclusively via WhatsApp. It features a vanilla HTML/CSS/JS frontend for fast, mobile-first browsing, backed by Next.js API routes, Prisma, and PostgreSQL. The platform is operated by a single admin who manages the inventory.

## Group 1: Locked Choices
- **Framework:** The framework is locked to Next.js 14 (App Router). Do not use React for the frontend; use Next.js strictly for API routes.
- **Language:** The language is locked to TypeScript 5.3. Do not write new JavaScript files in the API layer.
- **Database Engine:** The database is locked to PostgreSQL (Neon). Do not introduce MongoDB, MySQL, or other engines.
- **ORM:** The ORM is locked to Prisma 5.8. Do not write raw SQL unless explicitly required for performance tuning not supported by Prisma.
- **Frontend:** The frontend is locked to Vanilla HTML5, CSS Custom Properties, and ES Modules. Do not introduce React, Vue, Svelte, or SPA frameworks like Next.js frontend pages.
- **Validation:** Validation is locked to Zod 3.22. Do not use Joi, Yup, or custom validation functions for payload verification.
- **Authentication:** Authentication is locked to Custom JWT (jose 6.2 + bcryptjs 3.0). Do not install NextAuth, Auth.js, Clerk, or Supabase Auth.
- **Hosting:** The deployment target is locked to Vercel.

## Group 2: Business and User Protection Rules
- **Currency Format:** You must always use Nigerian Naira (NGN). You must store all prices as whole integers. You must never use kobo or decimal pricing.
- **Pricing Bounds:** You must enforce a price range of ₦1 to ₦999,999,999 across all validation layers.
- **Communication Channel:** You must route all buyer-to-dealer communication through WhatsApp deep-links. You must never build in-platform messaging, chat, or contact forms.
- **Single Admin Model:** You must assume a single-dealer, single-admin operational model. You must not build multi-tenant architecture or dealer registration flows in the current version.
- **No Buyer Accounts:** You must not create user accounts, login flows, or wishlists for public buyers.
- **Transaction Boundary:** You must not build online payment processing or checkout flows.

## Group 3: System Arrangement Rules
- **Processing Model:** You must process all API requests synchronously. You must not introduce background workers, BullMQ, or async job queues.
- **Counter Operations:** You must implement view and click counters as synchronous fire-and-forget API calls from the client.
- **Image Storage:** You must use the `r2-client.ts` abstraction for all image operations. You must anticipate the migration from local `public/uploads/` to Cloudflare R2, as local storage is ephemeral on Vercel.
- **Auth Flow:** You must verify sessions server-side using `getSessionFromRequest()` and client-side using `initAuthGuard()`.
- **API Response Structure:** You must always return JSON responses in the format `{ success: boolean, data?: any, error?: string }` from all API routes.

## Folder Layout Structure
- `/app/api/`: Next.js 14 App Router API endpoints.
- `/public/`: Vanilla HTML/CSS/JS frontend files.
- `/public/admin/`: Protected admin dashboard files.
- `/prisma/`: Database schema and migrations.
- `/src/lib/`: Shared utilities (`prisma.ts`, `r2-client.ts`).
- `/src/validators/`: Zod validation schemas.

## Definition of Done
1. Code strictly follows the vanilla frontend / Next.js backend architecture.
2. Zod validation is implemented for all inputs.
3. No React components were created.
4. Currency is handled as whole Naira.
5. All errors return the standard `{ success: false, error: "..." }` response.

## When Unsure
If an implementation requires a new dependency, a change to the database schema, or a deviation from the vanilla HTML frontend, STOP and ask the user for explicit approval.
