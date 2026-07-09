import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const LISTINGS_DIR = join(__dirname, '..', 'listings');

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || '';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || '';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || '';
const APPWRITE_DATABASE_ID = process.env.APPWRITE_DATABASE_ID || '';
const APPWRITE_BUCKET_ID = process.env.APPWRITE_BUCKET_ID || 'car-images';
const SITE_URL = process.env.SITE_URL || 'https://carzaar.vercel.app';

if (!APPWRITE_ENDPOINT || !APPWRITE_PROJECT_ID || !APPWRITE_API_KEY || !APPWRITE_DATABASE_ID) {
  console.error('Missing required environment variables. Set APPWRITE_ENDPOINT, APPWRITE_PROJECT_ID, APPWRITE_API_KEY, APPWRITE_DATABASE_ID');
  process.exit(1);
}

const require = createRequire(import.meta.url);
const { Client, Databases, Query } = require('node-appwrite');

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID)
  .setKey(APPWRITE_API_KEY);

const databases = new Databases(client);

function getImageUrl(storageFileId) {
  return `${APPWRITE_ENDPOINT}/storage/buckets/${APPWRITE_BUCKET_ID}/files/${storageFileId}/view?project=${APPWRITE_PROJECT_ID}`;
}

function formatPrice(price) {
  return '₦' + Number(price).toLocaleString('en-NG');
}

function generateListingPage(listing, imageUrl) {
  const title = `${listing.make} ${listing.model} ${listing.year} - ${formatPrice(listing.price)}`;
  const description = `${listing.make} ${listing.model} ${listing.year} in ${listing.location || 'Nigeria'}. ${listing.condition}. ${listing.mileage ? listing.mileage.toLocaleString() + ' km' : ''}. Price: ${formatPrice(listing.price)}.`;

  const ogImage = imageUrl || `${SITE_URL}/og-default.jpg`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — Carzaar</title>
  <meta name="description" content="${description.replace(/"/g, '&quot;')}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description.replace(/"/g, '&quot;')}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:url" content="${SITE_URL}/listings/detail.html?id=${listing.$id}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Carzaar">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="canonical" href="${SITE_URL}/listings/detail.html?id=${listing.$id}">
  <meta http-equiv="refresh" content="0;url=${SITE_URL}/listings/detail.html?id=${listing.$id}">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>C</text></svg>">
</head>
<body>
  <script>window.location.href='${SITE_URL}/listings/detail.html?id=${listing.$id}';</script>
</body>
</html>`;
}

async function main() {
  if (!existsSync(LISTINGS_DIR)) {
    mkdirSync(LISTINGS_DIR, { recursive: true });
  }

  console.log('Fetching listings...');
  const data = await databases.listDocuments(APPWRITE_DATABASE_ID, 'listings', [
    Query.equal('status', 'available'),
    Query.limit(100),
  ]);
  const listings = data.documents || [];

  console.log(`Found ${listings.length} listings. Generating pages...`);

  for (const listing of listings) {
    let imageUrl = null;
    try {
      const imagesData = await databases.listDocuments(APPWRITE_DATABASE_ID, 'listing_images', [
        Query.equal('listingId', listing.$id),
        Query.orderAsc('sortOrder'),
      ]);
      const images = imagesData.documents || [];
      const firstImage = images.length > 0 ? images[0] : null;
      imageUrl = firstImage ? getImageUrl(firstImage.storageFileId) : null;
    } catch (err) {
      console.warn(`  Failed to fetch images for ${listing.$id}: ${err.message}`);
    }

    const html = generateListingPage(listing, imageUrl);
    const filePath = join(LISTINGS_DIR, `${listing.$id}.html`);
    writeFileSync(filePath, html, 'utf-8');
    console.log(`  Generated: ${listing.$id}.html`);
  }

  console.log(`Done. Generated ${listings.length} listing pages.`);
}

main().catch(err => {
  console.error('Prerender failed:', err);
  process.exit(1);
});
