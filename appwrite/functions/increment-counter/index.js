const sdk = require('node-appwrite');

const DATABASE_ID = 'carzaar';
const COLLECTION_ID = 'listings';
const ALLOWED_FIELDS = ['viewCount', 'whatsappClickCount'];

module.exports = async function (context) {
  const { req, res } = context;

  const rawPayload = req.bodyJson || req.bodyText || req.bodyRaw || req.body;

  if (!rawPayload) {
    return res.json({ success: false, error: 'Missing payload' }, 400);
  }

  const client = new sdk.Client();

  const vars = req.variables || process.env;

  const endpoint = vars['APPWRITE_FUNCTION_ENDPOINT'] || vars['APPWRITE_ENDPOINT'];
  const projectId = vars['APPWRITE_FUNCTION_PROJECT_ID'] || vars['APPWRITE_PROJECT_ID'];
  const apiKey = vars['APPWRITE_FUNCTION_API_KEY'] || vars['APPWRITE_API_KEY'];

  if (!endpoint || !apiKey || !projectId) {
    return res.json({ success: false, error: 'Missing environment variables' }, 500);
  }

  client
    .setEndpoint(endpoint)
    .setProject(projectId)
    .setKey(apiKey);

  const databases = new sdk.Databases(client);

  try {
    const payload = typeof rawPayload === 'string' ? JSON.parse(rawPayload) : rawPayload;

    if (!payload.listingId || !payload.field) {
      return res.json({ success: false, error: 'Missing listingId or field' }, 400);
    }

    if (!ALLOWED_FIELDS.includes(payload.field)) {
      return res.json({ success: false, error: `Field "${payload.field}" is not allowed. Must be one of: ${ALLOWED_FIELDS.join(', ')}` }, 400);
    }

    const doc = await databases.getDocument(DATABASE_ID, COLLECTION_ID, payload.listingId);
    const currentVal = doc[payload.field] || 0;

    await databases.updateDocument(DATABASE_ID, COLLECTION_ID, payload.listingId, {
      [payload.field]: currentVal + 1
    });

    return res.json({ success: true, count: currentVal + 1 });
  } catch (err) {
    console.error('Counter increment error:', err);
    return res.json({ success: false, error: err.message }, 500);
  }
};
