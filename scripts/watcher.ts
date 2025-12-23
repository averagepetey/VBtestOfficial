import fs from 'fs';
import path from 'path';

// Define the upload entry type
type UploadEntry = {
  id: string;
  client_name: string;
  client_email: string;
  design_name: string;
  upload_path: string;
  dst_path: string | null;
  status: 'pending' | 'processing' | 'ready' | 'error';
  created_at: string;
  updated_at: string;
};

const jsonPath = path.join(process.cwd(), 'uploads.json');

function loadUploads(): UploadEntry[] {
  if (!fs.existsSync(jsonPath)) {
    return [];
  }
  const data = fs.readFileSync(jsonPath, 'utf-8');
  return JSON.parse(data);
}

function saveUploads(data: UploadEntry[]) {
  fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2));
}

function checkPending(): UploadEntry[] {
  const uploads = loadUploads();
  const pending = uploads.filter((u) => u.status === 'pending');
  return pending;
}

function updateStatus(id: string, status: UploadEntry['status'], dstPath?: string | null) {
  const uploads = loadUploads();
  const index = uploads.findIndex((u) => u.id === id);
  
  if (index !== -1) {
    uploads[index].status = status;
    uploads[index].updated_at = new Date().toISOString();
    if (dstPath !== undefined) {
      uploads[index].dst_path = dstPath;
    }
    saveUploads(uploads);
    return true;
  }
  return false;
}

function notifyAdmin(pending: UploadEntry[]) {
  if (!pending.length) {
    console.log('✅ No pending uploads');
    return;
  }
  
  console.log(`\n📋 Found ${pending.length} pending upload(s):\n`);
  pending.forEach((u) => {
    console.log(`  • ID: ${u.id}`);
    console.log(`    Client: ${u.client_name} (${u.client_email})`);
    console.log(`    Design: ${u.design_name}`);
    console.log(`    File: ${u.upload_path}`);
    console.log(`    Created: ${new Date(u.created_at).toLocaleString()}\n`);
  });
}

function runWatcher() {
  console.log('🔍 Checking for pending uploads...\n');
  const pending = checkPending();
  notifyAdmin(pending);
  return pending;
}

// Export functions for use in other scripts
export { loadUploads, saveUploads, checkPending, updateStatus, notifyAdmin, runWatcher };

// If run directly, execute watcher
if (require.main === module) {
  runWatcher();
}
