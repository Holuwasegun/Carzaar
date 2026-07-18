---
name: r2-storage-handler
description: Handles image uploads and deletions using the defined Cloudflare R2 abstraction layer.
---

# R2 Storage Handler

**Purpose:** Ensures image uploads interact correctly with the Cloudflare R2 abstraction layer.
**Traces to:** PRD Section 9 (Risk 1), PRD Section 5.8, `uploads-and-storage.md`.

## Execution Steps

1. **Receive FormData:** Extract the `File` object from the incoming `FormData` request.
2. **Validate File:** Check file size (< 5MB) and mime type (image/jpeg, image/png, image/webp).
3. **Generate Key:** Create a unique key: `listings/${listingId}/${Date.now()}-${crypto.randomUUID()}.${ext}`.
4. **Convert to Buffer:** Convert the `File` to an `ArrayBuffer` then to a Node `Buffer`.
5. **Call Abstraction:** Pass the key and buffer to the `uploadToR2` function (currently found in `src/lib/r2-client.ts`).
6. **Save to DB:** Save the resulting key to the `ListingImage` Prisma model.

## Common Traps
- **Trap:** Saving directly using `fs.writeFileSync`.
- **Avoidance:** ALWAYS use the `uploadToR2` helper function so that when the R2 bucket is wired up, no API routes need to change.

## Verify Before Done
- [ ] Are file sizes and types validated before processing?
- [ ] Is the generated key unique and prefixed correctly?
- [ ] Is the `uploadToR2` abstraction used instead of raw `fs` commands?
