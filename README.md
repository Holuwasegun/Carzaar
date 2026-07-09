# Carzaar

Serverless car marketplace for Nigeria. Vanilla HTML/CSS/JS on the frontend, Appwrite BaaS on the backend, deployed to Vercel.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | Vanilla HTML5, CSS Custom Properties, ES Modules |
| Backend | Appwrite v14 (Database, Storage, Auth, Functions) |
| Hosting | Vercel (static output) |
| Build | Node.js ESM (SEO prerender script) |
| Infra | PowerShell scripts for Appwrite setup |

## Architecture

Static pages rendered client-side. ES module scripts fetch data from Appwrite at runtime. A build-time prerender script generates one HTML page per listing (Open Graph meta tags, meta-refresh redirect to dynamic page) so crawlers see rich content. Counter increments (viewCount, whatsappClickCount) run through an Appwrite serverless function with a scoped API key — no anonymous write access to the database.

## Project Structure

```
carzaar/
├── index.html                        # Homepage — listing grid with filters
├── listings/detail.html              # Listing detail page (gallery, specs, WhatsApp)
├── admin/
│   ├── login.html                    # Admin email/password login
│   ├── dashboard.html                # Manage listings (table, edit, sold, delete)
│   └── listing-form.html             # Create/edit listing form
├── css/
│   ├── tokens.css                    # Design tokens (colors, spacing, shadows, typography)
│   ├── base.css                      # CSS reset and base element styles
│   ├── layout.css                    # Grid layouts (sidebar, listings, detail page)
│   ├── components.css                # All UI components (cards, forms, buttons, modals)
│   └── admin.css                     # Admin-specific overrides
├── js/
│   ├── appwrite-config.js            # Appwrite endpoint, project ID, function ID
│   ├── appwrite-client.js            # SDK client initialization
│   ├── admin-auth.js                 # Login, logout, session guard
│   ├── admin-dashboard.js            # Dashboard: list, mark sold/available, delete
│   ├── admin-listing-form.js         # Create/edit listing, image upload
│   ├── listings.js                   # Public listing grid: filter, sort, paginate
│   ├── listing-detail.js             # Detail page: gallery, specs, features, WhatsApp
│   ├── whatsapp.js                   # WhatsApp number retrieval from admin_profile
│   ├── sell-car.js                   # Sell Your Car modal: form, preview, WhatsApp pre-fill
│   ├── sell-car-init.js              # DOM wiring for the sell car button
│   ├── counter.js                    # View/click counter via Appwrite function
│   └── validation.js                 # Form validation utilities
├── appwrite/
│   ├── permissions-notes.md          # Appwrite permission reference
│   ├── seed-features.json            # 24 car features for seeding
│   └── functions/increment-counter/  # Serverless function for counter increments
│       ├── index.js
│       └── package.json
├── scripts/
│   ├── setup-appwrite.ps1            # Full Appwrite infra automation
│   ├── fix-attributes.ps1            # Remedial script for missing attributes
│   └── prerender-listings.mjs        # Build-time SEO page generation
├── vercel.json
└── package.json
```

## Data Model

### Collection: `listings`

| Attribute | Type | Required | Notes |
|-----------|------|----------|-------|
| `make` | string | ✓ | e.g. Toyota |
| `model` | string | ✓ | e.g. Camry |
| `year` | integer | ✓ | 1980 – current+1 |
| `price` | integer | ✓ | NGN |
| `condition` | string | ✓ | Brand New / Nigerian Used / Foreign Used (Tokunbo) |
| `location` | string | ✓ | |
| `description` | string | ✓ | Max 5000 chars |
| `mileage` | integer | ✓ | km |
| `bodyType` | string | ✓ | sedan / suv / hatchback / coupe / pickup / van / wagon / convertible |
| `color` | string | ✓ | |
| `transmission` | string | ✓ | automatic / manual |
| `fuel` | string | ✓ | petrol / diesel / hybrid / electric |
| `drivetrain` | string | ✓ | fwd / rwd / awd / 4wd |
| `engineCapacity` | double | | Litres |
| `numberOfDoors` | integer | | 2–6 |
| `numberOfSeats` | integer | | 2–9 |
| `vin` | string | | 17 chars (no I, O, Q) |
| `plateNumber` | string | | Required if documentation = registered |
| `numberOfPreviousOwners` | integer | ✓ | Default 0 |
| `accidentHistory` | string | ✓ | none / minor / major / unknown |
| `serviceHistoryAvailable` | boolean | ✓ | |
| `hasSpareKey` | boolean | ✓ | Default true |
| `documentationStatus` | string | ✓ | registered_valid_papers / registered_papers_pending / unregistered |
| `warrantyRemaining` | boolean | ✓ | |
| `features` | string[] | | Array of feature labels |
| `status` | string | ✓ | available / reserved / sold |
| `viewCount` | integer | ✓ | |
| `whatsappClickCount` | integer | ✓ | |
| `soldAt` | datetime | | Set when marked sold |

### Collection: `listing_images`

| Attribute | Type | Required | Notes |
|-----------|------|----------|-------|
| `listingId` | string | ✓ | FK to `listings.$id` |
| `storageFileId` | string | ✓ | FK to storage file |
| `sortOrder` | integer | ✓ | Display order (0-based) |

### Collection: `features`

| Attribute | Type | Required | Notes |
|-----------|------|----------|-------|
| `label` | string | ✓ | Display name (e.g. "Sunroof") |

### Collection: `admin_profile`

Single document with ID `"main"`.

| Attribute | Type | Required | Notes |
|-----------|------|----------|-------|
| `whatsappNumber` | string | ✓ | Full international format (e.g. 2349158461502) |

## Key Features

### Public

- **Advanced filtering**: Price, year, mileage ranges; make, condition, transmission, body type, color, fuel — all with live count badges
- **Sort & paginate**: Newest / price asc-desc; cursor-based load-more pagination
- **Responsive**: Mobile-first layout with sticky desktop sidebar and slide-up mobile filter panel
- **Image gallery**: Main image + thumbnail strip + prev/next navigation
- **WhatsApp buy button**: One-click `wa.me` link pre-filled with car details; tracked via serverless counter
- **Sell Your Car**: Modal form (Make / Model / Year) with live message preview — on submit, opens WhatsApp pre-filled with the listing details using the admin's number from `admin_profile`
- **View/Click tracking**: Anonymous counters via Appwrite function with scoped API key

### Admin

- **Auth guard**: Auto-redirect to login on expired session
- **Full CRUD**: Create, read, update, delete listings
- **Image management**: Upload up to 8 images, preview, remove before submit; deletes existing images on edit
- **Status management**: Mark sold (records timestamp) / available (clears soldAt) with confirmation dialog
- **Validation**: Client-side for all fields (VIN format, year range, mileage sanity, plate requirements, image type/size)
- **Sold overlay**: Visual watermark on sold listings

## Setup

### Prerequisites

- Node.js 18+
- Appwrite Cloud account
- Vercel account (for deployment)

### Quick Start

```bash
git clone <repo>
cd carzaar
npm install
```

Update `js/appwrite-config.js` with your Appwrite project credentials, then run the setup script:

```powershell
.\scripts\setup-appwrite.ps1
```

Or configure manually via Appwrite Console (collections, attributes, indexes, storage bucket, seed data, permissions — see Data Model section above for details).

### Permissions

| Resource | Read | Create | Update | Delete |
|----------|------|--------|--------|--------|
| `listings` | anyone | admin user | admin user | admin user |
| `listing_images` | anyone | admin user | admin user | admin user |
| `features` | anyone | admin user | admin user | admin user |
| `admin_profile` | anyone | admin user | admin user | admin user |
| `car-images` bucket | anyone | admin user | admin user | admin user |

Counter increments use a server-side API key — do NOT grant anonymous update on `listings`.

### Deploy Counter Function

```bash
cd appwrite/functions/increment-counter
npm install
```

Deploy via Appwrite Console. Set **Execute** permission to `any`. Add environment variables:

| Variable | Description |
|----------|-------------|
| `APPWRITE_FUNCTION_ENDPOINT` | Appwrite endpoint |
| `APPWRITE_FUNCTION_PROJECT_ID` | Project ID |
| `APPWRITE_FUNCTION_API_KEY` | API key with `documents.write` scope |

The function receives `{ listingId, field }` via `req.bodyJson` and atomically increments the specified counter.

### Run Locally

```bash
npx serve .
```

### Deploy to Vercel

Push to GitHub and connect the repo to Vercel. `vercel.json` configures the output. The `build` command runs the prerender script on each deploy.

### SEO Prerender

```bash
npm run prerender
```

Requires these environment variables:

| Variable | Description |
|----------|-------------|
| `APPWRITE_ENDPOINT` | Appwrite endpoint |
| `APPWRITE_PROJECT_ID` | Project ID |
| `APPWRITE_API_KEY` | API key with read access |
| `APPWRITE_DATABASE_ID` | Database ID |
| `SITE_URL` | Live site URL (canonical/og:url) |

Each generated page includes Open Graph / Twitter Card meta tags, canonical URL, meta-refresh redirect to `listings/detail.html?id=<id>`, and JSON-LD structured data.

## Security

- All database mutations require admin authentication
- Counter function uses a server-side API key with `documents.write` scope — no anonymous update access
- Email/password sessions with Appwrite Auth; session guard on all admin pages
- Client-side image validation (JPG/PNG/WebP, 5MB max) enforced server-side by bucket settings

## Known Trade-offs

- **Filtering is client-side**: All listings are fetched once and filtered in the browser. For >500 listings, consider server-side queries with Appwrite.
- **Image URLs are signed**: `storage.getFileView()` generates URLs valid until the next page refresh. Pre-generated URLs in prerendered pages may expire.
- **Counter function is fire-and-forget**: Failed executions are silently logged. For critical analytics, add retry logic or a queue.
- **Soft delete**: Deleting a listing removes its images from storage but does not archive the document. Consider a `deletedAt` field for soft deletion.
