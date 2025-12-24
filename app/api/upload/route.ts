import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readFile, access, stat } from 'fs/promises';
import { constants } from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import * as fsSync from 'fs';

// Configure route for file uploads
export const runtime = 'nodejs';
export const maxDuration = 30;

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

export async function POST(request: NextRequest) {
  try {
    console.log('[UPLOAD API] Request received');
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const design = formData.get('design') as string;
    const file = formData.get('file') as File;

    console.log('[UPLOAD API] Form data:', { 
      hasName: !!name, 
      hasEmail: !!email, 
      hasDesign: !!design, 
      hasFile: !!file,
      fileName: file?.name,
      fileSize: file?.size,
      fileType: file?.type
    });

    if (!name || !email || !design || !file) {
      console.error('[UPLOAD API] Missing required fields:', { name: !!name, email: !!email, design: !!design, file: !!file });
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Generate unique ID and filename
    const id = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const fileExtension = path.extname(file.name);
    const fileName = `${id}${fileExtension}`;
    
    // Ensure uploads directory exists
    const cwd = process.cwd();
    console.log('[UPLOAD API] Current working directory:', cwd);
    const uploadsDir = path.join(cwd, 'uploads');
    console.log('[UPLOAD API] Uploads directory path:', uploadsDir);
    try {
      await access(uploadsDir, constants.F_OK);
      console.log('[UPLOAD API] Uploads directory exists');
    } catch (err) {
      console.log('[UPLOAD API] Creating uploads directory, error was:', err);
      await mkdir(uploadsDir, { recursive: true });
      console.log('[UPLOAD API] Uploads directory created');
    }

    // Save file
    const filePath = path.join(uploadsDir, fileName);
    console.log('[UPLOAD API] Saving file to:', filePath);
    console.log('[UPLOAD API] Absolute path:', path.resolve(filePath));
    
    try {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      console.log('[UPLOAD API] File buffer created, size:', buffer.length);
      
      await writeFile(filePath, buffer);
      console.log('[UPLOAD API] File write completed');
      
      // Verify file was actually written
      await access(filePath, constants.F_OK);
      const stats = await stat(filePath);
      console.log('[UPLOAD API] File verified, size on disk:', stats.size);
      
      if (stats.size !== buffer.length) {
        throw new Error(`File size mismatch: expected ${buffer.length}, got ${stats.size}`);
      }
    } catch (fileError) {
      console.error('[UPLOAD API] File write error:', fileError);
      throw fileError;
    }

    // Create upload entry
    const entry: UploadEntry = {
      id,
      client_name: name,
      client_email: email,
      design_name: design,
      upload_path: `uploads/${fileName}`,
      dst_path: null,
      status: 'pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    // Read existing uploads.json
    const jsonPath = path.join(process.cwd(), 'uploads.json');
    let uploads: UploadEntry[] = [];
    
    try {
      await access(jsonPath, constants.F_OK);
      const data = await readFile(jsonPath, 'utf-8');
      uploads = JSON.parse(data);
      console.log('[UPLOAD API] Loaded existing uploads.json with', uploads.length, 'entries');
    } catch {
      // File doesn't exist yet, start with empty array
      console.log('[UPLOAD API] uploads.json does not exist, creating new file');
    }

    // Add new entry
    uploads.push(entry);
    console.log('[UPLOAD API] Added entry:', entry.id);

    // Write back to uploads.json
    try {
      const jsonContent = JSON.stringify(uploads, null, 2);
      console.log('[UPLOAD API] Writing uploads.json, size:', jsonContent.length);
      await writeFile(jsonPath, jsonContent, 'utf-8');
      console.log('[UPLOAD API] uploads.json write completed');
      
      // Verify JSON file was written
      await access(jsonPath, constants.F_OK);
      const stats = await stat(jsonPath);
      console.log('[UPLOAD API] uploads.json verified, size:', stats.size);
    } catch (jsonError) {
      console.error('[UPLOAD API] JSON write error:', jsonError);
      throw jsonError;
    }

    // Start automatic conversion in the background (don't await - return response immediately)
    convertToDstAsync(entry).catch((error) => {
      console.error('[UPLOAD API] Background conversion error:', error);
    });

    return NextResponse.json(
      { 
        success: true, 
        id: entry.id,
        message: 'File uploaded successfully. Conversion started automatically.' 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[UPLOAD API] Upload error:', error);
    if (error instanceof Error) {
      console.error('[UPLOAD API] Error message:', error.message);
      console.error('[UPLOAD API] Error stack:', error.stack);
    }
    return NextResponse.json(
      { 
        error: 'Failed to upload file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Helper function to update upload status
async function updateUploadStatus(id: string, status: 'pending' | 'processing' | 'ready' | 'error', dstPath?: string): Promise<void> {
  const jsonPath = path.join(process.cwd(), 'uploads.json');
  try {
    const data = await readFile(jsonPath, 'utf-8');
    const uploads: UploadEntry[] = JSON.parse(data);
    const entry = uploads.find(u => u.id === id);
    if (entry) {
      entry.status = status;
      entry.updated_at = new Date().toISOString();
      if (dstPath) entry.dst_path = dstPath;
      await writeFile(jsonPath, JSON.stringify(uploads, null, 2));
    }
  } catch (error) {
    console.error('[UPLOAD API] Failed to update status:', error);
  }
}

// Convert JPG to SVG (if needed)
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
  await writeFile(svgPath, svgContent);
  return true;
}

// Convert SVG to DST
async function convertSvgToDst(svgPath: string, outputDir: string): Promise<{ success: boolean; dstPath?: string }> {
  try {
    const fileName = path.basename(svgPath, '.svg');
    const dstPath = path.join(outputDir, `${fileName}.dst`);
    const scriptPath = path.join(process.cwd(), 'scripts', 'convert-dst-reliable.py');
    
    await mkdir(outputDir, { recursive: true });
    execSync(`python3 "${scriptPath}" "${svgPath}" "${dstPath}"`, { stdio: 'inherit' });
    await access(dstPath, constants.F_OK);
    
    return { success: true, dstPath };
  } catch (error) {
    console.error('[UPLOAD API] SVG to DST conversion error:', error);
    return { success: false };
  }
}

// Automatic conversion function (runs in background)
async function convertToDstAsync(entry: UploadEntry): Promise<void> {
  try {
    console.log(`[UPLOAD API] Starting automatic conversion for: ${entry.design_name}`);
    await updateUploadStatus(entry.id, 'processing');
    
    const cwd = process.cwd();
    const uploadsDir = path.join(cwd, 'uploads');
    const dstDir = path.join(cwd, 'dst');
    const inputPath = path.join(cwd, entry.upload_path);
    const fileExt = path.extname(entry.upload_path).toLowerCase();
    
    let svgPath: string;
    
    // If JPG/JPEG, convert to SVG first
    if (fileExt === '.jpg' || fileExt === '.jpeg') {
      const fileName = path.basename(entry.upload_path, fileExt);
      svgPath = path.join(uploadsDir, `${fileName}.svg`);
      console.log(`[UPLOAD API] Converting JPG to SVG: ${inputPath} -> ${svgPath}`);
      await convertJpgToSvg(inputPath, svgPath);
    } else if (fileExt === '.svg') {
      // Already SVG, use it directly
      svgPath = inputPath;
      console.log(`[UPLOAD API] File is already SVG: ${svgPath}`);
    } else {
      throw new Error(`Unsupported file type: ${fileExt}`);
    }
    
    // Convert SVG to DST
    console.log(`[UPLOAD API] Converting SVG to DST: ${svgPath}`);
    const result = await convertSvgToDst(svgPath, dstDir);
    
    if (!result.success || !result.dstPath) {
      throw new Error('DST conversion failed');
    }
    
    const relativeDstPath = path.relative(cwd, result.dstPath);
    await updateUploadStatus(entry.id, 'ready', relativeDstPath);
    
    console.log(`[UPLOAD API] ✓ Conversion complete: ${result.dstPath}`);
    
    // Optionally notify client
    try {
      const notifyModule = await import('../../scripts/notify-clients');
      await notifyModule.notifyClient(entry);
    } catch (notifyError) {
      console.log('[UPLOAD API] Notification skipped:', notifyError);
    }
  } catch (error: any) {
    console.error(`[UPLOAD API] Conversion error: ${error.message}`);
    await updateUploadStatus(entry.id, 'error');
  }
}
