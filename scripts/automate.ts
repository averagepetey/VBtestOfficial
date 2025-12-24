/**
 * Main automation: JPG → SVG → DST conversion
 */

import * as fs from 'fs/promises';
import * as fsSync from 'fs';
import * as path from 'path';
import { execSync } from 'child_process';
import { convertSvgToDst } from './convert-dst';
import { updateUploadStatus } from './watcher';

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

const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const DST_DIR = path.join(process.cwd(), 'dst');

async function convertJpgToSvg(jpgPath: string, svgPath: string): Promise<boolean> {
  try {
    // Try Inkscape first
    const inkscape = '/Applications/Inkscape.app/Contents/MacOS/inkscape';
    if (fsSync.existsSync(inkscape)) {
      execSync(`"${inkscape}" "${jpgPath}" --export-filename="${svgPath}"`, { stdio: 'inherit' });
      return true;
    }
  } catch {}
  
  // Fallback: Create SVG wrapper with embedded image
  const imageData = fsSync.readFileSync(jpgPath);
  const base64 = imageData.toString('base64');
  const ext = path.extname(jpgPath).slice(1).toLowerCase();
  const svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="100mm" height="100mm" viewBox="0 0 100 100">
  <image href="data:image/${ext};base64,${base64}" width="100" height="100"/>
</svg>`;
  await fs.writeFile(svgPath, svgContent);
  return true;
}

export async function processUpload(entry: UploadEntry): Promise<void> {
  try {
    await updateUploadStatus(entry.id, 'processing');
    await fs.mkdir(UPLOADS_DIR, { recursive: true });
    await fs.mkdir(DST_DIR, { recursive: true });
    
    const jpgPath = path.join(process.cwd(), entry.upload_path);
    const fileName = path.basename(entry.upload_path, path.extname(entry.upload_path));
    const svgPath = path.join(UPLOADS_DIR, `${fileName}.svg`);
    
    console.log(`Converting: ${entry.design_name}`);
    await convertJpgToSvg(jpgPath, svgPath);
    
    const result = await convertSvgToDst(svgPath, DST_DIR);
    if (!result.success) throw new Error('Conversion failed');
    
    const relativeDstPath = path.relative(process.cwd(), result.dstPath!);
    await updateUploadStatus(entry.id, 'ready', relativeDstPath);
    
    const notifyModule = await import('./notify-clients');
    await notifyModule.notifyClient(entry);
    
    console.log(`✓ Ready: ${result.dstPath}`);
  } catch (error: any) {
    console.error(`Error: ${error.message}`);
    await updateUploadStatus(entry.id, 'error');
  }
}

if (require.main === module) {
  (async () => {
    const entryId = process.argv[2];
    if (!entryId) {
      console.error('Usage: ts-node automate.ts <entry-id>');
      process.exit(1);
    }
    const watcherModule = await import('./watcher');
    const uploads = await watcherModule.readUploads();
    const entry = uploads.find(u => u.id === entryId);
    if (!entry) {
      console.error(`Entry not found: ${entryId}`);
      process.exit(1);
    }
    await processUpload(entry);
  })().catch(console.error);
}

