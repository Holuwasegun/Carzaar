const sdk = require('node-appwrite');

const DATABASE_ID = 'carzaar';
const COLLECTION_ID = 'listings';
const ALLOWED_FIELDS = ['viewCount', 'whatsappClickCount'];

module.exports = async function (req, res) {
  const client = new sdk.Client();

  if (!req.variables['APPWRITE_FUNCTION_ENDPOINT'] || !req.variables['APPWRITE_FUNCTION_API_KEY'] || !req.variables['APPWRITE_FUNCTION_PROJECT_ID']) {
    res.json({ success: false, error: 'Missing environment variables' }, 500);
    return;
  }

  client
    .setEndpoint(req.variables['APPWRITE_FUNCTION_ENDPOINT'])
    .setProject(req.variables['APPWRITE_FUNCTION_PROJECT_ID'])
    .setKey(req.variables['APPWRITE_FUNCTION_API_KEY']);

  const databases = new sdk.Databases(client);

  try {
    const payload = JSON.parse(req.payload);

    if (!payload.listingId || !payload.field) {
      res.json({ success: false, error: 'Missing listingId or field' }, 400);
      return;
    }

    if (!ALLOWED_FIELDS.includes(payload.field)) {
      res.json({ success: false, error: `Field "${payload.field}" is not allowed. Must be one of: ${ALLOWED_FIELDS.join(', ')}` }, 400);
      return;
    }

    await databases.incrementDocumentAttribute(
      DATABASE_ID,
      COLLECTION_ID,
      payload.listingId,
      payload.field,
      1
    );

    res.json({ success: true });
  } catch (err) {
    console.error('Counter increment error:', err);
    res.json({ success: false, error: err.message }, 500);
  }
};
