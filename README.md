# Carzaar — Nigerian Car Marketplace

A serverless, static JAMstack car marketplace for Nigeria built with vanilla HTML/CSS/JS and [Appwrite](https://appwrite.io) as the backend. Designed for speed, SEO, and simplicity — no framework overhead.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Vanilla HTML5, CSS3 (custom properties, responsive grid), ES Modules |
| **Backend** | Appwrite v14 (Database, Storage, Auth, Serverless Functions) |
| **Hosting** | Vercel (static output, no server) |
| **Build** | Node.js ESM scripts for SEO prerendering |
| **Infra** | PowerShell scripts for Appwrite setup automation |

## Architecture

```
┌─────────────────────┐     ┌──────────────────┐     ┌─────────────┐
│   Static Frontend   │────▶│   Appwrite BaaS  │────▶│  Vercel CDN │
│  (HTML/CSS/JS ESM)  │     │  DB · Storage    │     │  (static)   │
│                     │     │  Auth · Functions│     │             │
│  index.html         │     │                  │     │  listings/  │
│  listings/detail    │     │  increment-      │     │  *.html     │
│  admin/ pages       │     │  counter fn      │     │  (SEO)      │
└─────────────────────┘     └──────────────────┘     └─────────────┘
```

- **Client-side rendering**: All pages are static HTML with ES module scripts that fetch data from Appwrite at runtime.
- **SEO prerendering**: A build-time script generates one HTML page per listing (with meta tags and a meta-refresh redirect) so crawlers see rich content.
- **Counter function**: An Appwrite serverless function increments `viewCount` / `whatsappClickCount` with a server-side API key (no anonymous write access to the database).

## Project Structure

```
carzaar/
├── index.html                     # Homepage — listing grid with filters
├── listings/
│   └── detail.html                # Listing detail page (gallery, specs, WhatsApp)
├── admin/
│   ├── login.html                 # Admin email/password login
│   ├── dashboard.html             # Manage listings (table, edit, sold, delete)
│   └── listing-form.html          # Create/edit listing form
├── css/
│   ├── tokens.css                 # Design tokens (colors, spacing, shadows, typography)
│   ├── base.css                   # CSS reset and base element styles
│   ├── layout.css                 # Grid layouts (sidebar, listings, detail page)
│   ├── components.css             # All UI components (cards, forms, buttons, modals)
│   └── admin.css                  # Admin-specific overrides
├── js/
│   ├── appwrite-config.js         # Appwrite endpoint, project ID, function ID
│   ├── appwrite-client.js         # SDK client initialization (re-exported)
│   ├── admin-auth.js              # Login, logout, session guard
│   ├── admin-dashboard.js         # Dashboard: list, mark sold/available, delete
│   ├── admin-listing-form.js      # Form: create/edit listing, image upload
│   ├── listings.js                # Public listing grid: filter, sort, paginate
│   ├── listing-detail.js          # Detail page: gallery, specs, features, WhatsApp
│   ├── whatsapp.js                # WhatsApp number retrieval from admin_profile
│   ├── counter.js                 # View/click counter via Appwrite function
│   └── validation.js              # Form validation utilities
├── appwrite/
│   ├── permissions-notes.md       # Appwrite permission reference
│   ├── seed-features.json         # 24 car features for seeding
│   └── functions/
│       └── increment-counter/     # Serverless function for counter increments
│           ├── index.js
│           └── package.json
├── scripts/
│   ├── setup-appwrite.ps1         # Full Appwrite infra automation
│   ├── fix-attributes.ps1         # Remedial script for missing attributes
│   └── prerender-listings.mjs     # Build-time SEO page generation
├── vercel.json                    # Vercel deployment config
└── package.json
```

## Data Model

### Collection: `listings`

| Attribute | Type | Required | Notes |
|-----------|------|----------|-------|
| `make` | string | ✓ | e.g. Toyota |
| `model` | string | ✓ | e.g. Camry |
| `year` | integer | ✓ | 1980 – current+1 |
| `price` | integer | ✓ | NGN, whole naira |
| `condition` | string | ✓ | Brand New / Nigerian Used / Foreign Used (Tokunbo) |
| `location` | string | ✓ | e.g. Lagos, Nigeria |
| `description` | string | ✓ | Max 5000 chars |
| `mileage` | integer | ✓ | km |
| `bodyType` | string | ✓ | sedan / suv / hatchback / coupe / pickup / van / wagon / convertible |
| `color` | string | ✓ | |
| `transmission` | string | ✓ | automatic / manual |
| `fuel` | string | ✓ | petrol / diesel / hybrid / electric |
| `drivetrain` | string | ✓ | fwd / rwd / awd / 4wd |
| `engineCapacity` | double | | Litres (e.g. 1.6, 2.0, 3.5) |
| `numberOfDoors` | integer | | 2–6 |
| `numberOfSeats` | integer | | 2–9 |
| `vin` | string | | 17 characters (no I, O, Q) |
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

## Setup Guide

### Prerequisites

- Node.js 18+
- An [Appwrite](https://appwrite.io) Cloud account (or self-hosted instance)
- A [Vercel](https://vercel.com) account for deployment

### 1. Clone & Install

```bash
git clone https://github.com/your-org/carzaar.git
cd carzaar
npm install
```

### 2. Configure Appwrite

Update `js/appwrite-config.js` with your Appwrite project credentials:

```js
const APPWRITE_CONFIG = {
  endpoint: 'https://your-region.cloud.appwrite.io/v1',
  projectId: 'your-project-id',
  databaseId: 'carzaar',
  functionId: 'your-function-id',   // after deploying the counter function
};
```

### 3. Set Up Appwrite Infrastructure

**Option A — Automated (PowerShell):**

Run the setup script with an Appwrite API key (requires `projects.delete` scope):

```powershell
.\scripts\setup-appwrite.ps1
```

This creates all collections, attributes, indexes, the storage bucket, seeds features, and creates the admin profile document.

**Option B — Manual (Console):**

1. Create a database named `carzaar`.
2. Create 4 collections: `listings`, `listing_images`, `features`, `admin_profile`.
3. Add all attributes listed in the Data Model section above.
4. Create indexes:
   - `listings`: `status` (ASC), `$createdAt` (DESC)
   - `listing_images`: `listingId` (ASC), `sortOrder` (ASC)
5. Create a storage bucket: `car-images` (max 5MB, JPG/PNG/WebP only).
6. Seed 24 features from `appwrite/seed-features.json`.
7. Create the admin profile document with ID `"main"`:
   ```json
   { "whatsappNumber": "2349158461502" }
   ```
8. Create an admin user via Appwrite Console > Auth > Users (email/password).

### 4. Set Permissions

| Resource | Read | Create | Update | Delete |
|----------|------|--------|--------|--------|
| `listings` | anyone | admin user | admin user | admin user |
| `listing_images` | anyone | admin user | admin user | admin user |
| `features` | anyone | admin user | admin user | admin user |
| `admin_profile` | anyone | admin user | admin user | admin user |
| `car-images` bucket | anyone | admin user | admin user | admin user |

> Counter increments use a server-side API key — do NOT grant anonymous update permission on `listings`.

### 5. Deploy the Counter Function

```bash
cd appwrite/functions/increment-counter
npm install
```

Deploy via Appwrite Console or CLI. Set the function's **Execute** permission to `any` (HTTP execution is called from the browser).

Add these environment variables to the function:

| Variable | Description |
|----------|-------------|
| `APPWRITE_FUNCTION_ENDPOINT` | Your Appwrite endpoint URL |
| `APPWRITE_FUNCTION_PROJECT_ID` | Your project ID |
| `APPWRITE_FUNCTION_API_KEY` | API key with `documents.write` scope |

Update `js/appwrite-config.js` with the function ID after deployment.

> **Note**: The function receives `{ listingId, field }` from the client via `req.bodyJson`, validates the field is in the allowed set (`viewCount`, `whatsappClickCount`), reads the current document, and increments it atomically.

### 6. Configure Admin User ID

After creating the admin user in Appwrite Auth, note their user ID and update the collection permissions in the Console to use `User(<adminUserId>)` for Create/Update/Delete.

### 7. Run Locally

This is a static site — serve any web server:

```bash
npx serve .
```

Or open the files directly (though ES modules require a server).

### 8. Deploy to Vercel

Connect your GitHub repository to Vercel. The `vercel.json` already configures the output:

```json
{
  "outputDirectory": "."
}
```

Vercel will run `npm run build` (prerender script) on each deploy, generating SEO HTML pages.

### 9. Prerender SEO Pages

The build script generates one HTML page per listing in `listings/`:

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
| `SITE_URL` | Your live site URL (for canonical/og:url) |

Each generated page contains:
- Full Open Graph / Twitter Card meta tags
- Canonical URL pointing to the dynamic detail page
- A `<meta http-equiv="refresh">` and JavaScript redirect to `listings/detail.html?id=<id>`
- Structured data for search engine indexing

## Pages Overview

### Public Pages

| Route | File | Description |
|-------|------|-------------|
| `/` | `index.html` | Listing grid with sidebar filters (price, make, year, condition, transmission, mileage, body type, color, fuel), sort, pagination, and mobile filter drawer |
| `/listings/detail.html?id=<id>` | `listings/detail.html` | Full car detail: image gallery with thumbnails, specs grid, history & documentation, features tags, WhatsApp buy button, SOLD overlay |

### Admin Pages

| Route | File | Description |
|-------|------|-------------|
| `/admin/login.html` | `admin/login.html` | Email/password login form with validation |
| `/admin/dashboard.html` | `admin/dashboard.html` | Table of all listings with edit, mark sold/available, and delete actions (with confirmation dialogs) |
| `/admin/listing-form.html?id=<id>` | `admin/listing-form.html` | Create/edit form with all fields, feature checkboxes, image upload (max 8), and preview with remove |

## Features

### Public

- **Advanced filtering**: Price range, year range, mileage range, make, condition, transmission, body type, color, fuel — all with live count badges
- **Sort**: Newest first, price low-to-high, high-to-low
- **Pagination**: Load more with cursor-based pagination
- **Responsive**: Mobile-first with sticky sidebar on desktop, slide-up filter panel on mobile
- **Image gallery**: Main image with thumbnail strip, prev/next navigation
- **WhatsApp integration**: One-click buy button generates a pre-filled `wa.me` link with the car details
- **View/Click tracking**: Anonymous counters via Appwrite serverless function

### Admin

- **Auth guard**: Automatic redirect to login if session expires
- **CRUD**: Create, read, update, delete listings
- **Image management**: Upload multiple images, preview, remove before submit, delete existing images on edit
- **Status management**: Mark as sold (records date) or available (clears sold date) with confirmation
- **Validation**: Client-side validation for all fields (VIN format, year range, mileage sanity, plate number requirements, image type/size)
- **Sold overlay**: Visual watermark on sold listings

## Security

- **No anonymous writes**: Database mutations require admin authentication
- **Counter function**: Uses server-side API key with scoped `documents.write` permission — no anonymous update access to documents
- **Admin session**: Email/password sessions with Appwrite Auth; session guard on all admin pages
- **Image validation**: Client-side file type (JPG/PNG/WebP) and size (5MB max) validation; enforced server-side by bucket settings

## File Conventions

- **CSS**: 5-file architecture — tokens → base → layout → components → admin overrides
- **JavaScript**: ES modules with `type="module"` script tags; single default export per utility file; named exports for main modules
- **HTML**: Semantic HTML5 with `role` and `aria-*` attributes; no framework markup
- **Appwrite SDK**: Loaded via CDN (`appwrite@14.0.1`) on every page that uses it
- **No bundler**: Pure ESM in the browser, no Webpack/Vite/Parcel

## Known Caveats

- **Filtering is client-side**: All listings are fetched once and filtered in the browser. For large inventories (>500 listings), consider server-side filtering with Appwrite queries.
- **Image URLs are generated client-side**: `storage.getFileView()` produces a signed URL valid until the next page refresh. Pre-generated URLs in prerendered pages may expire.
- **Counter function is fire-and-forget**: The `async: true` execution means failures are silently logged. For critical analytics, implement retry logic or a queue.
- **Soft delete**: Deleting a listing removes its images from storage but does not archive the document. Consider adding a `deletedAt` field for soft deletion.
