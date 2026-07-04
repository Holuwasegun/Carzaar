import APPWRITE_CONFIG from './appwrite-config.js';

const { endpoint, projectId, databaseId } = APPWRITE_CONFIG;

if (!endpoint || !projectId || !databaseId) {
  console.error(
    'Appwrite config missing. Set endpoint, projectId, and databaseId in js/appwrite-config.js'
  );
}

let client, account, databases, storage;
let Query, ID, Permission, Role;

function initAppwrite() {
  if (typeof appwrite === 'undefined') {
    throw new Error(
      'Appwrite SDK not loaded. Add <script src="https://cdn.jsdelivr.net/npm/appwrite@14.0.1/dist/umd/sdk.js"></script> to your HTML.'
    );
  }

  const { Client, Account, Databases, Storage } = appwrite;
  Query = appwrite.Query;
  ID = appwrite.ID;
  Permission = appwrite.Permission;
  Role = appwrite.Role;

  client = new Client()
    .setEndpoint(endpoint)
    .setProject(projectId);

  account = new Account(client);
  databases = new Databases(client);
  storage = new Storage(client);

  return { client, account, databases, storage };
}

initAppwrite();

export {
  client,
  account,
  databases,
  storage,
  databaseId,
  Query,
  ID,
  Permission,
  Role,
};
