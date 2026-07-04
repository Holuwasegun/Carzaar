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
  if (typeof Appwrite === 'undefined') {
    throw new Error(
      'Appwrite SDK not loaded. Add <script src="https://cdn.jsdelivr.net/npm/appwrite@14.0.1/dist/iife/sdk.js"></script> to your HTML.'
    );
  }

  const { Client, Account, Databases, Storage } = Appwrite;
  Query = Appwrite.Query;
  ID = Appwrite.ID;
  Permission = Appwrite.Permission;
  Role = Appwrite.Role;

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
