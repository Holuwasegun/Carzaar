import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { promises as fs } from 'fs';
import path from 'path';

const isS3Configured = process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID && process.env.R2_SECRET_ACCESS_KEY && process.env.R2_BUCKET_NAME;

const s3Client = isS3Configured ? new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID as string,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY as string,
  },
}) : null;

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const PUBLIC_BASE = '/uploads';

async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

export async function uploadToR2(key: string, buffer: Buffer, contentType: string): Promise<string> {
  if (s3Client) {
    const command = new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });
    await s3Client.send(command);
    return key;
  }

  // Fallback to local file system if S3 is not configured
  console.warn('⚠️ S3/R2 is not configured. Falling back to ephemeral local storage.');
  const filePath = path.join(UPLOAD_DIR, key);
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, buffer);
  return key;
}

export async function deleteFromR2(key: string): Promise<void> {
  if (s3Client) {
    const command = new DeleteObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME,
      Key: key,
    });
    await s3Client.send(command);
    return;
  }

  // Fallback to local file system
  const filePath = path.join(UPLOAD_DIR, key);
  try {
    await fs.unlink(filePath);
  } catch {
    // File may not exist
  }
}

export function getLocalImageUrl(key: string): string {
  if (isS3Configured && process.env.R2_PUBLIC_URL) {
    return `${process.env.R2_PUBLIC_URL}/${key}`;
  }
  return `${PUBLIC_BASE}/${key}`;
}


