/**
 * Client notifications
 */

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

export async function notifyClient(entry: UploadEntry): Promise<void> {
  if (entry.status !== 'ready') return;
  
  console.log(`\n📧 ${entry.client_email}: "${entry.design_name}" ready at ${entry.dst_path}\n`);
  // TODO: Add email service integration
}

export async function notifyAllReady(): Promise<void> {
  const watcherModule = await import('./watcher');
  const ready = (await watcherModule.readUploads()).filter(u => u.status === 'ready');
  for (const entry of ready) {
    await notifyClient(entry);
  }
}

if (require.main === module) {
  notifyAllReady().catch(console.error);
}

