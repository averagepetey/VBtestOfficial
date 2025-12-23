import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { checkPending, updateStatus, loadUploads } from './watcher';

/**
 * Convert JPG to DST using Ink/Stitch CLI
 * 
 * Note: This requires:
 * 1. Inkscape installed (for JPG → SVG conversion)
 * 2. Ink/Stitch extension installed in Inkscape
 * 3. inkstitch-cli available in PATH
 * 
 * For now, this is a template that you can customize based on your setup.
 */

function convertJpgToSvg(jpgPath: string, svgPath: string): boolean {
  try {
    // Convert JPG to SVG using Inkscape CLI
    // This is a placeholder - adjust based on your Inkscape installation
    execSync(`inkscape "${jpgPath}" --export-filename="${svgPath}"`, {
      stdio: 'inherit',
    });
    return true;
  } catch (error) {
    console.error(`Error converting JPG to SVG: ${error}`);
    return false;
  }
}

function convertSvgToDst(svgPath: string, dstPath: string): boolean {
  try {
    // Convert SVG to DST using Ink/Stitch CLI
    // This is a placeholder - adjust based on your Ink/Stitch installation
    execSync(`inkstitch-cli --export-dst "${svgPath}"`, {
      stdio: 'inherit',
    });
    
    // Ink/Stitch typically outputs to the same directory with .dst extension
    const expectedDst = svgPath.replace('.svg', '.dst');
    if (fs.existsSync(expectedDst)) {
      // Move to destination
      fs.renameSync(expectedDst, dstPath);
      return true;
    }
    
    return false;
  } catch (error) {
    console.error(`Error converting SVG to DST: ${error}`);
    return false;
  }
}

function processPendingUploads() {
  const pending = checkPending();
  
  if (!pending.length) {
    console.log('✅ No pending uploads to process');
    return;
  }

  console.log(`\n🔄 Processing ${pending.length} pending upload(s)...\n`);

  // Ensure dst directory exists
  const dstDir = path.join(process.cwd(), 'dst');
  if (!fs.existsSync(dstDir)) {
    fs.mkdirSync(dstDir, { recursive: true });
  }

  pending.forEach((upload) => {
    console.log(`Processing: ${upload.design_name} (${upload.id})`);
    
    try {
      // Update status to processing
      updateStatus(upload.id, 'processing');

      const uploadPath = path.join(process.cwd(), upload.upload_path);
      const fileExtension = path.extname(uploadPath).toLowerCase();
      
      // Create temporary SVG path
      const tempSvgPath = path.join(process.cwd(), 'uploads', `${upload.id}.svg`);
      const dstPath = path.join(process.cwd(), 'dst', `${upload.id}.dst`);

      let success = false;

      if (fileExtension === '.jpg' || fileExtension === '.jpeg' || fileExtension === '.png') {
        // Step 1: Convert JPG/PNG to SVG
        console.log(`  → Converting ${fileExtension} to SVG...`);
        if (convertJpgToSvg(uploadPath, tempSvgPath)) {
          // Step 2: Convert SVG to DST
          console.log(`  → Converting SVG to DST...`);
          if (convertSvgToDst(tempSvgPath, dstPath)) {
            // Update status to ready
            updateStatus(upload.id, 'ready', `dst/${upload.id}.dst`);
            console.log(`  ✅ Successfully converted to DST`);
            success = true;
            
            // Clean up temporary SVG
            if (fs.existsSync(tempSvgPath)) {
              fs.unlinkSync(tempSvgPath);
            }
          }
        }
      } else {
        console.log(`  ⚠️  Unsupported file type: ${fileExtension}`);
        updateStatus(upload.id, 'error');
      }

      if (!success) {
        console.log(`  ❌ Failed to convert ${upload.design_name}`);
        updateStatus(upload.id, 'error');
      }
    } catch (error) {
      console.error(`  ❌ Error processing ${upload.id}:`, error);
      updateStatus(upload.id, 'error');
    }
    
    console.log('');
  });

  console.log('✅ Processing complete\n');
}

// Export for use in other scripts
export { processPendingUploads, convertJpgToSvg, convertSvgToDst };

// If run directly, execute conversion
if (require.main === module) {
  processPendingUploads();
}
