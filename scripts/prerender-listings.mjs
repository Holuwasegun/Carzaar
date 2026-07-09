import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = join(__dirname, '..');
const LISTINGS_DIR = join(ROOT_DIR, 'listings');

const APPWRITE_ENDPOINT = process.env.APPWRITE_ENDPOINT || '';
const APPWRITE_PROJECT_ID = process.env.APPWRITE_PROJECT_ID || '';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || '';
const APPWRITE_DATABASE_ID = process.env.APPWRITE_DATABASE_ID || '';
const APPWRITE_BUCKET_ID = process.env.APPWRITE_BUCKET_ID || 'car-images';
const SITE_URL = process.env.SITE_URL || 'https://carzaar.vercel.app';

const SHOW_COUNT = 20;

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

function escapeHtml(str) {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function encodeUri(str) {
  if (typeof str !== 'string') return '';
  return encodeURIComponent(str);
}

function getImageUrl(storageFileId) {
  return `${APPWRITE_ENDPOINT}/storage/buckets/${APPWRITE_BUCKET_ID}/files/${encodeUri(storageFileId)}/view?project=${encodeUri(APPWRITE_PROJECT_ID)}`;
}

function getOptimizedImageUrl(storageFileId) {
  return `${APPWRITE_ENDPOINT}/storage/buckets/${APPWRITE_BUCKET_ID}/files/${encodeUri(storageFileId)}/view?project=${encodeUri(APPWRITE_PROJECT_ID)}`;
}

function formatPrice(price) {
  return '\u20A6' + Number(price).toLocaleString('en-NG');
}

function formatMileage(km) {
  return Number(km).toLocaleString('en-NG') + ' km';
}

function getConditionClass(condition) {
  if (condition === 'Brand New') return 'brand-new';
  if (condition === 'Nigerian Used') return 'nigerian-used';
  return 'foreign-used';
}

function getListingTitle(listing) {
  return `${listing.make} ${listing.model} ${listing.year}`;
}

function generateCardHtml(listing, imageUrl) {
  const title = getListingTitle(listing);
  const safeTitle = escapeHtml(title);
  const safeId = encodeUri(listing.$id);
  const imgSrc = imageUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" fill="%23e9ecef"%3E%3Crect width="400" height="300"/%3E%3Ctext x="50%" y="50%" fill="%23adb5bd" font-size="16" text-anchor="middle" dy=".3em"%3ENo Image%3C/text%3E%3C/svg%3E';
  const safeImgSrc = escapeHtml(imgSrc);

  const conditionLabel = listing.condition === 'Foreign Used (Tokunbo)' ? 'Tokunbo'
    : listing.condition === 'Nigerian Used' ? 'Nigerian Used' : 'Brand New';

  const safeConditionLabel = escapeHtml(conditionLabel);
  const safeConditionClass = escapeHtml(getConditionClass(listing.condition));
  const safeColor = listing.color ? escapeHtml(` (${listing.color})`) : '';
  const safePrice = escapeHtml(formatPrice(listing.price));
  const safeLocation = escapeHtml(listing.location || 'Nigeria');
  const safeMileage = escapeHtml(formatMileage(listing.mileage));
  const isSold = listing.status === 'sold';

  return `
    <article class="card" role="listitem" data-id="${escapeHtml(listing.$id)}" onclick="window.location.href='/listings/detail.html?id=${safeId}'">
      <div class="card-image${isSold ? ' sold' : ''}">
        <img src="${safeImgSrc}" alt="${safeTitle}" loading="lazy">
        <span class="condition-badge ${safeConditionClass}">${safeConditionLabel}</span>
        ${isSold ? '<div class="sold-overlay"><span>SOLD</span></div>' : ''}
      </div>
      <div class="card-body">
        <div class="card-title">${safeTitle}${safeColor}</div>
        <div class="card-price">${safePrice}</div>
        <div class="card-meta">
          <span class="location">${safeLocation}</span>
          <span>·</span>
          <span class="mileage">${safeMileage}</span>
        </div>
      </div>
    </article>`;
}

function generateListingPage(listing, imageUrl) {
  const safeMake = escapeHtml(listing.make);
  const safeModel = escapeHtml(listing.model);
  const safeYear = escapeHtml(String(listing.year));
  const safeLocation = escapeHtml(listing.location || 'Nigeria');
  const safeCondition = escapeHtml(listing.condition);
  const safeMileage = listing.mileage ? listing.mileage.toLocaleString('en-NG') + ' km' : '';
  const safePrice = formatPrice(listing.price);
  const safePriceEscaped = escapeHtml(safePrice);

  const title = `${safeMake} ${safeModel} ${safeYear} - ${safePriceEscaped}`;
  const description = `${safeMake} ${safeModel} ${safeYear} in ${safeLocation}. ${safeCondition}.${safeMileage ? ' ' + escapeHtml(safeMileage) + '.' : ''} Price: ${safePriceEscaped}.`;
  const safeDescription = description.replace(/"/g, '&quot;');

  const ogImage = imageUrl || `${SITE_URL}/og-default.jpg`;
  const safeOgImage = escapeHtml(ogImage);
  const safeId = encodeUri(listing.$id);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} \u2014 Carzaar</title>
  <meta name="description" content="${safeDescription}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${safeDescription}">
  <meta property="og:image" content="${safeOgImage}">
  <meta property="og:url" content="${SITE_URL}/listings/detail.html?id=${safeId}">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="Carzaar">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="canonical" href="${SITE_URL}/listings/detail.html?id=${safeId}">
  <meta http-equiv="refresh" content="0;url=${SITE_URL}/listings/detail.html?id=${safeId}">
  <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>C</text></svg>">
</head>
<body>
  <script>window.location.href='${SITE_URL}/listings/detail.html?id=${safeId}';</script>
</body>
</html>`;
}

async function fetchImagesForListings(ids) {
  const imagesMap = {};
  const chunkSize = 25;
  for (let i = 0; i < ids.length; i += chunkSize) {
    const chunk = ids.slice(i, i + chunkSize);
    try {
      const data = await databases.listDocuments(APPWRITE_DATABASE_ID, 'listing_images', [
        Query.equal('listingId', chunk),
        Query.orderAsc('sortOrder'),
        Query.limit(50),
      ]);
      for (const doc of data.documents || []) {
        if (!imagesMap[doc.listingId]) imagesMap[doc.listingId] = [];
        imagesMap[doc.listingId].push(doc);
      }
    } catch (err) {
      console.warn('  Failed to fetch images chunk:', err);
    }
  }
  return imagesMap;
}

async function generatePrerenderedIndexHtml(prerenderListings) {
  console.log(`\nPrerendering ${prerenderListings.length} listings into index.html...`);

  const ids = prerenderListings.map(l => l.$id);
  const imagesMap = await fetchImagesForListings(ids);

  let cardsHtml = '';
  const imageUrlMap = {};

  for (const listing of prerenderListings) {
    const images = imagesMap[listing.$id] || [];
    const firstImage = images.length > 0 ? images[0] : null;
    const imageUrl = firstImage ? getOptimizedImageUrl(firstImage.storageFileId) : null;
    imageUrlMap[listing.$id] = imageUrl;
    cardsHtml += generateCardHtml(listing, imageUrl) + '\n        ';
  }

  const lastDocument = prerenderListings.length > 0
    ? { $id: prerenderListings[prerenderListings.length - 1].$id }
    : null;

  const embeddedData = JSON.stringify({
    listings: prerenderListings,
    imageUrls: imageUrlMap,
    lastDocument,
  });

  const indexHtmlPath = join(ROOT_DIR, 'index.html');
  let html = readFileSync(indexHtmlPath, 'utf-8');

  const placeholder = '<!-- PRERENDERED_LISTINGS -->';

  if (!html.includes(placeholder)) {
    console.log('  index.html already prerendered. Restore the placeholder comment from git to regenerate.');
    return;
  }

  html = html.replace(placeholder, cardsHtml.trim());

  const dataScript = `<script>window.__PRERENDERED__ = ${embeddedData};<\/script>`;
  html = html.replace('</head>', `${dataScript}\n</head>`);

  html = html.replace(
    /(<span[^>]*id="resultsCount"[^>]*>).*?(<\/span>)/,
    `$1${prerenderListings.length} car${prerenderListings.length !== 1 ? 's' : ''} match your search$2`
  );

  writeFileSync(indexHtmlPath, html, 'utf-8');
  console.log(`  Generated index.html with ${prerenderListings.length} prerendered listings`);
}

async function main() {
  if (!existsSync(LISTINGS_DIR)) {
    mkdirSync(LISTINGS_DIR, { recursive: true });
  }

  console.log('Fetching listings...');
  const data = await databases.listDocuments(APPWRITE_DATABASE_ID, 'listings', [
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

  const prerenderListings = listings.slice(0, SHOW_COUNT);
  await generatePrerenderedIndexHtml(prerenderListings);

  console.log(`\nDone. Generated ${listings.length} listing pages + prerendered homepage.`);
}

main().catch(err => {
  console.error('Prerender failed:', err);
  process.exit(1);
});
