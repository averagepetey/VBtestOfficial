import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir, readFile, access } from 'fs/promises';
import { constants } from 'fs';
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

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const design = formData.get('design') as string;
    const file = formData.get('file') as File;

    if (!name || !email || !design || !file) {
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
    const uploadsDir = path.join(process.cwd(), 'uploads');
    try {
      await access(uploadsDir, constants.F_OK);
    } catch {
      await mkdir(uploadsDir, { recursive: true });
    }

    // Save file
    const filePath = path.join(uploadsDir, fileName);
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

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
    } catch {
      // File doesn't exist yet, start with empty array
    }

    // Add new entry
    uploads.push(entry);

    // Write back to uploads.json
    await writeFile(jsonPath, JSON.stringify(uploads, null, 2));

    return NextResponse.json(
      { 
        success: true, 
        id: entry.id,
        message: 'File uploaded successfully' 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
