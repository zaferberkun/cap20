// Interface to Google Secrets cloud service

import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
const client: SecretManagerServiceClient = new SecretManagerServiceClient({ projectId: 'bipoc-322918' });

// name - 
async function accessSecretVersion(name: string) {
  let version: any;
  [version] = await client.accessSecretVersion({
    name: name,
  });

  // Extract the payload as a string.
  const payload = version.payload.data.toString();

  return payload;
}

const MONGO_URI = await accessSecretVersion('projects/334220063553/secrets/MONGO_LOGIN_URL_CAP20/versions/1');

export { MONGO_URI }