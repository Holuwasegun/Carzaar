---
trigger: always_on
---

# Uploads and Storage Rules

- **Ephemeral Storage Warning:** You must not rely on the local filesystem (`public/uploads/`) for permanent file storage, as Vercel serverless functions are ephemeral.
- **Storage Abstraction:** You must route all file upload and deletion operations through the `src/lib/r2-client.ts` abstraction.
- **File Constraints:** You must enforce a maximum file size of 5MB per image. You must only accept JPG, PNG, and WebP formats.
- **Listing Limit:** You must enforce a maximum of 8 images per vehicle listing.
- **Key Generation:** You must generate unique file keys using the pattern `listings/{listingId}/{timestamp}-{random}.{extension}`.
