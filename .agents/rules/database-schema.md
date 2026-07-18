---
trigger: glob
pattern: "prisma/schema.prisma"
---

# Database Schema Rules

- **Schema Truth:** You must treat `prisma/schema.prisma` as the single source of truth for the data model.
- **UUIDs:** You must use UUIDs (`@default(uuid())`) for all primary keys. Do not use auto-incrementing integers.
- **Cascading Deletes:** You must use `@onDelete(Cascade)` for child records (e.g., `ListingImage` when a `Listing` is deleted) to prevent orphaned data.
- **Nigeria Context:** You must enforce string literals in application logic that match the Prisma schema requirements (e.g., condition must be "Brand New", "Nigerian Used", or "Foreign Used (Tokunbo)").
- **Migration Protocol:** After modifying the schema, you must run `npx prisma migrate dev` to generate migrations.
