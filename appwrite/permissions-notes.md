# Appwrite Permissions Setup

## Database: carzaar

### Collection: listings

| Permission | Role |
|---|---|
| Read | `Role.any()` |
| Create | `Role.user(<adminUserId>)` |
| Update | `Role.user(<adminUserId>)` only — do NOT grant `Role.any()` |
| Delete | `Role.user(<adminUserId>)` |

Counter increments (`viewCount`, `whatsappClickCount`) are handled exclusively by the `increment-counter` Appwrite Function using a server API key. No anonymous update permission is granted.

### Collection: listing_images

| Permission | Role |
|---|---|
| Read | `Role.any()` |
| Create | `Role.user(<adminUserId>)` |
| Update | `Role.user(<adminUserId>)` |
| Delete | `Role.user(<adminUserId>)` |

### Collection: features

| Permission | Role |
|---|---|
| Read | `Role.any()` |
| Create | `Role.user(<adminUserId>)` |
| Update | `Role.user(<adminUserId>)` |
| Delete | `Role.user(<adminUserId>)` |

### Collection: admin_profile

Single document with ID `"main"`.

| Permission | Role |
|---|---|
| Read | `Role.any()` |
| Create | `Role.user(<adminUserId>)` |
| Update | `Role.user(<adminUserId>)` |
| Delete | `Role.user(<adminUserId>)` |

## Storage Bucket: car-images

| Permission | Role |
|---|---|
| Read | `Role.any()` |
| Create | `Role.user(<adminUserId>)` |
| Update | `Role.user(<adminUserId>)` |
| Delete | `Role.user(<adminUserId>)` |

### Bucket Settings
- Max file size: 5MB
- Allowed extensions: jpg, jpeg, png, webp

## Seeding Steps

1. Create the database named `carzaar`.
2. Create all 4 collections (`listings`, `listing_images`, `features`, `admin_profile`) with the attributes defined in Section 5 of the build spec.
3. Create the `car-images` storage bucket.
4. Apply the permissions above to each collection and bucket.
5. Seed the `features` collection from `appwrite/seed-features.json` — create one document per feature with `{ "label": "..." }`.
6. Create the `admin_profile` document with ID `"main"`:
   ```json
   {
     "whatsappNumber": "2349158461502"
   }
   ```
7. Create the admin user in Appwrite Authentication (email/password). Copy the user's ID to use as `<adminUserId>` in permissions.
8. Update the `DATABASE_ID` constant in `appwrite/functions/increment-counter/index.js`.

## Function Deployment

1. Navigate to `appwrite/functions/increment-counter/`.
2. Install dependencies: `npm install`.
3. Deploy the function via Appwrite CLI or Console.
4. Set the function's execute permission to `Role.any()` (HTTP execution).
5. Add the following environment variables to the function:
   - `APPWRITE_FUNCTION_ENDPOINT`
   - `APPWRITE_FUNCTION_API_KEY` (with `documents.write` scope)
   - `APPWRITE_FUNCTION_PROJECT_ID`
6. The function URL will be used by the frontend as the `COUNTER_FUNCTION_ENDPOINT` in `js/whatsapp.js` and `js/listing-detail.js`.
