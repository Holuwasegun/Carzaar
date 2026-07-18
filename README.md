# Carzaar

Nigerian car marketplace. Vanilla HTML/CSS/JS frontend, Next.js API routes, PostgreSQL, deployed on Vercel.

## Tech Stack

| Layer | Choice |
|-------|--------|
| Frontend | Vanilla HTML5, CSS Custom Properties, ES Modules |
| Backend | Next.js 14 App Router (API routes) |
| Database | PostgreSQL (Neon) + Prisma ORM |
| Auth | Auth.js (Credentials Provider) |
| Storage | Local file system (Cloudflare R2 ready) |
| Validation | Zod |
| Hosting | Vercel |

## Project Structure

```
carzaar/
├── app/api/                          # Next.js API routes
│   ├── auth/[...nextauth]/route.ts   # Auth.js handler
│   └── listings/
│       ├── route.ts                  # GET (list) / POST (create)
│       ├── [id]/route.ts             # GET / PUT / DELETE single listing
│       ├── [id]/images/route.ts      # POST (upload) / DELETE images
│       ├── [id]/increment/route.ts   # Atomic counter increments
│       └── images/[id]/route.ts      # Image file serving
├── public/                           # Static files
│   ├── index.html                    # Homepage — listing grid with filters
│   ├── listings/detail.html          # Listing detail page
│   ├── admin/
│   │   ├── login.html                # Admin login
│   │   ├── dashboard.html            # Manage listings
│   │   └── listing-form.html         # Create/edit listing form
│   ├── css/                          # Stylesheets
│   ├── js/                           # Frontend JavaScript (API-based)
│   └── uploads/                      # Uploaded images (local storage)
├── prisma/
│   ├── schema.prisma                 # Database schema
│   └── seed.ts                       # Initial data seeding
├── src/
│   ├── config/constants.ts           # App configuration
│   ├── domain/listing-utils.ts       # Validation utilities
│   ├── lib/
│   │   ├── auth.ts                   # Auth.js configuration
│   │   ├── prisma.ts                 # Prisma client singleton
│   │   └── r2-client.ts              # File storage (local/R2)
│   └── validators/listing.validator.ts # Zod schemas
├── middleware.ts                      # Route protection
├── next.config.js
├── vercel.json
└── package.json
```

## Database Schema

### Listing

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Auto-generated |
| legacyId | String? | Appwrite document ID (migration) |
| make / model | String | |
| year | Int | 1980 – current+1 |
| price | Int | NGN (no decimals) |
| condition | String | Brand New / Nigerian Used / Foreign Used (Tokunbo) |
| mileage | Int | km |
| bodyType / color / transmission / fuel / drivetrain | String | |
| features | String[] | |
| status | String | available / reserved / sold |
| viewCount / whatsappClickCount | Int | Atomic counters |
| images | ListingImage[] | Related images |

### ListingImage

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | Auto-generated |
| listingId | UUID | FK to Listing |
| r2Key | String | Storage path |
| sortOrder | Int | Display order |

### AdminProfile

Single record with WhatsApp number for buy-button links.

### User / Session

Auth.js managed tables for admin authentication.

## Setup

### Prerequisites

- Node.js 18+
- PostgreSQL database (Neon recommended)

### Quick Start

```bash
git clone <repo>
cd carzaar
npm install
```

Configure `.env`:

```env
DATABASE_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-secret"
```

Set up database and seed admin user:

```bash
npx prisma migrate dev
npx prisma db seed
```

Run locally:

```bash
npm run dev
```

### Default Admin

The default admin user is seeded from your environment variables. 
Make sure you have set the following in your `.env` file before running the seed script:
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_WHATSAPP`

### Deploy to Vercel

1. Push to GitHub
2. Connect repo to Vercel
3. Add environment variables
4. Run `npx prisma migrate deploy` as a build step

## API Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | /api/listings | No | List all listings |
| POST | /api/listings | Yes | Create listing |
| GET | /api/listings/[id] | No | Get single listing |
| PUT | /api/listings/[id] | Yes | Update listing |
| DELETE | /api/listings/[id] | Yes | Delete listing |
| POST | /api/listings/[id]/images | Yes | Upload images |
| DELETE | /api/listings/[id]/images?imageId= | Yes | Delete image |
| GET | /api/listings/images/[id] | No | Serve image file |
| POST | /api/listings/[id]/increment | No | Increment view/WhatsApp count |

## Security

- Admin routes protected by middleware (session check)
- All mutations require authenticated session
- Image validation server-side (JPG/PNG/WebP, 5MB max)
- CSRF protection via Auth.js
