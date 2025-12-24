/**
 * SVG to DST conversion using pyembroidery
 */

import { execSync } from 'child_process';
import * as fs from 'fs/promises';
import * as path from 'path';

export async function convertSvgToDst(svgPath: string, outputDir: string) {
  const fileName = path.basename(svgPath, '.svg');
  const dstPath = path.join(outputDir, `${fileName}.dst`);
  // Use process.cwd() to get the project root, then navigate to scripts
  const scriptPath = path.join(process.cwd(), 'scripts', 'convert-dst-reliable.py');
  
  await fs.mkdir(outputDir, { recursive: true });
  execSync(`python3 "${scriptPath}" "${svgPath}" "${dstPath}"`, { stdio: 'inherit' });
  await fs.access(dstPath);
  
  return { success: true, dstPath };
}

if (require.main === module) {
  const [svgPath, outputDir] = process.argv.slice(2);
  if (!svgPath || !outputDir) {
    console.error('Usage: ts-node convert-dst.ts <svg-path> <output-dir>');
    process.exit(1);
  }
  convertSvgToDst(svgPath, outputDir)
    .then(result => console.log(`✓ ${result.dstPath}`))
    .catch(err => { console.error('✗', err.message); process.exit(1); });
}

