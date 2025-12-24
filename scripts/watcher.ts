/**
 * Watches uploads.json for pending conversions
 */

import * as fs from 'fs/promises';
import * as path from 'path';

interface UploadEntry {
  id: string;
  client_name: string;
  client_email: string;
  design_name: string;
  upload_path: string;
  dst_path: string;
  status: 'pending' | 'processing' | 'ready' | 'error';
  created_at: string;
  updated_at: string;
}

const UPLOADS_FILE = path.join(process.cwd(), 'uploads.json');
const CHECK_INTERVAL = 5000;

export async function readUploads(): Promise<UploadEntry[]> {
  try {
    return JSON.parse(await fs.readFile(UPLOADS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

export async function updateUploadStatus(id: string, status: UploadEntry['status'], dstPath?: string): Promise<void> {
  const uploads = await readUploads();
  const entry = uploads.find(u => u.id === id);
  if (entry) {
    entry.status = status;
    entry.updated_at = new Date().toISOString();
    if (dstPath) entry.dst_path = dstPath;
    await fs.writeFile(UPLOADS_FILE, JSON.stringify(uploads, null, 2));
  }
}

async function processPending(): Promise<void> {
  const pending = (await readUploads()).filter(u => u.status === 'pending');
  if (pending.length === 0) return;
  
  console.log(`Processing ${pending.length} pending conversion(s)`);
  const automateModule = await import('./automate');
  for (const entry of pending) {
    await automateModule.processUpload(entry);
  }
}

async function watch(): Promise<void> {
  console.log(`Watching ${UPLOADS_FILE} (every ${CHECK_INTERVAL / 1000}s)`);
  while (true) {
    try {
      await processPending();
    } catch (error) {
      console.error('Error:', error);
    }
    await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
  }
}

if (require.main === module) {
  watch().catch((error) => {
    console.error('Fatal error in watcher:', error);
    process.exit(1);
  });
}

export { watch, processPending };

