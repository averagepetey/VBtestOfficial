import { NextResponse } from 'next/server';
import { writeFile, mkdir, access, stat } from 'fs/promises';
import { constants } from 'fs';
import path from 'path';

export async function GET() {
  try {
    const cwd = process.cwd();
    const testDir = path.join(cwd, 'uploads');
    const testFile = path.join(testDir, 'test-write.txt');
    
    // Ensure directory exists
    try {
      await access(testDir, constants.F_OK);
    } catch {
      await mkdir(testDir, { recursive: true });
    }
    
    // Write test file
    const content = `Test write at ${new Date().toISOString()}`;
    await writeFile(testFile, content, 'utf-8');
    
    // Verify it was written
    const stats = await stat(testFile);
    
    return NextResponse.json({
      success: true,
      cwd,
      testDir,
      testFile,
      fileSize: stats.size,
      message: 'File write test successful'
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}

