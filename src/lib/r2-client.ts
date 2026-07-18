import { promises as fs } from 'fs';
import path from 'path';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');
const PUBLIC_BASE = '/uploads';

async function ensureDir(dirPath: string): Promise<void> {
  await fs.mkdir(dirPath, { recursive: true });
}

export async function uploadToR2(key: string, buffer: Buffer, _contentType: string): Promise<string> {
  const filePath = path.join(UPLOAD_DIR, key);
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, buffer);
  return key;
}

export async function deleteFromR2(key: string): Promise<void> {
  const filePath = path.join(UPLOAD_DIR, key);
  try {
    await fs.unlink(filePath);
  } catch {
    // File may not exist
  }
}

export function getLocalImageUrl(key: string): string {
  return `${PUBLIC_BASE}/${key}`;
}


