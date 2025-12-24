// Node.js script to process pending uploads:
// JPG -> SVG (Inkscape) -> DST (Ink/Stitch) and update uploads.json
// Preflight reminders:
// 1) uploads.json entries must be status: "pending"
// 2) upload_path must point to a file that exists in /uploads
// 3) inkscape and inkstitch-cli must be available on PATH

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths
const projectRoot = process.cwd();
const uploadsJsonPath = path.join(projectRoot, 'uploads.json');
const dstFolder = path.join(projectRoot, 'dst');

// Ensure dst directory exists
if (!fs.existsSync(dstFolder)) {
  fs.mkdirSync(dstFolder, { recursive: true });
}

// Load JSON
let uploads = [];
if (fs.existsSync(uploadsJsonPath)) {
  try {
    uploads = JSON.parse(fs.readFileSync(uploadsJsonPath, 'utf-8'));
  } catch (err) {
    console.error('Failed to read or parse uploads.json:', err);
    process.exit(1);
  }
} else {
  console.log('No uploads.json found.');
  process.exit(0);
}

// Preflight: verify required tools
function checkTool(cmd, args = ['--version']) {
  try {
    execSync([cmd, ...args].join(' '), { stdio: 'ignore' });
    return true;
  } catch (err) {
    console.error(`Missing or unavailable CLI tool: ${cmd}. Error: ${err.message}`);
    return false;
  }
}

const hasInkscape = checkTool('inkscape');
const hasInkStitch = checkTool('inkstitch-cli', ['--help']);

if (!hasInkscape || !hasInkStitch) {
  console.error('\nPreflight failed. Please ensure these commands work and rerun:');
  console.error('  inkscape --version');
  console.error('  inkstitch-cli --help\n');
  process.exit(1);
}

// Helper to safe path -> absolute
function toAbsoluteUploadPath(uploadPath) {
  // upload_path in JSON is like "uploads/xxxx.jpg"
  if (path.isAbsolute(uploadPath)) {
    return uploadPath;
  }
  return path.join(projectRoot, uploadPath);
}

let processedCount = 0;
let skippedCount = 0;

// Process pending uploads
uploads.forEach((entry, index) => {
  if (entry.status === 'pending') {
    try {
      const inputFile = toAbsoluteUploadPath(entry.upload_path); // Local JPG path

      if (!fs.existsSync(inputFile)) {
        console.error(`Input file does not exist: ${inputFile}`);
        uploads[index].status = 'error';
        uploads[index].updated_at = new Date().toISOString();
        return;
      }

      // Use client_name and design_name from our JSON schema
      const clientSafe =
        (entry.client_name || 'client').toString().replace(/\s+/g, '');
      const designSafe =
        (entry.design_name || 'design').toString().replace(/\s+/g, '');

      const baseName = `${clientSafe}_${designSafe}_${Date.now()}`;
      const svgFile = path.join(dstFolder, baseName + '.svg');
      const dstFile = path.join(dstFolder, baseName + '.dst');

      // Step 1: Convert JPG -> SVG (Inkscape CLI)
      console.log(`\nConverting JPG → SVG for ${inputFile}`);
      execSync(`inkscape "${inputFile}" --export-filename="${svgFile}"`, {
        stdio: 'inherit',
      });

      // Step 2: Convert SVG -> DST (Ink/Stitch CLI)
      console.log(`Converting SVG → DST for ${svgFile}`);
      execSync(`inkstitch-cli --export-dst "${svgFile}"`, {
        stdio: 'inherit',
      });

      // Ink/Stitch typically outputs DST next to the SVG or in cwd
      const generatedDstCandidates = [
        svgFile.replace(/\.svg$/i, '.dst'),
        path.join(projectRoot, baseName + '.dst'),
      ];

      let foundDst = null;
      for (const candidate of generatedDstCandidates) {
        if (fs.existsSync(candidate)) {
          foundDst = candidate;
          break;
        }
      }

      if (!foundDst) {
        console.error('DST file not found after conversion for:', svgFile);
        return;
      }

      // Move DST into /dst folder with our chosen name
      fs.renameSync(foundDst, dstFile);

      // Update JSON entry
      uploads[index].dst_path = path.relative(projectRoot, dstFile);
      uploads[index].status = 'ready';
      uploads[index].updated_at = new Date().toISOString();
      processedCount += 1;

      console.log(`DST generated: ${dstFile}`);
    } catch (err) {
      console.error(`Error processing ${entry.upload_path}:`, err);
      // Optionally mark as error
      uploads[index].status = 'error';
      uploads[index].updated_at = new Date().toISOString();
    }
  } else {
    skippedCount += 1;
  }
});

// Save updated JSON
try {
  fs.writeFileSync(uploadsJsonPath, JSON.stringify(uploads, null, 2));
  console.log(`\nProcessing complete. Ready: ${processedCount}, Skipped (non-pending): ${skippedCount}`);
} catch (err) {
  console.error('Failed to write uploads.json:', err);
  process.exit(1);
}

