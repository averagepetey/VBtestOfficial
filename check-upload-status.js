#!/usr/bin/env node
/**
 * Diagnostic script to check upload status and conversion results
 */

const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const uploadsJsonPath = path.join(projectRoot, 'uploads.json');
const uploadsDir = path.join(projectRoot, 'uploads');
const dstDir = path.join(projectRoot, 'dst');

console.log('🔍 Upload Status Diagnostic\n');
console.log('=' .repeat(50));

// Check uploads.json
console.log('\n1. Checking uploads.json...');
if (fs.existsSync(uploadsJsonPath)) {
  try {
    const data = fs.readFileSync(uploadsJsonPath, 'utf-8');
    const uploads = JSON.parse(data);
    console.log(`   ✅ uploads.json exists with ${uploads.length} entry/entries`);
    
    uploads.forEach((entry, index) => {
      console.log(`\n   Entry ${index + 1}:`);
      console.log(`   - ID: ${entry.id}`);
      console.log(`   - Client: ${entry.client_name}`);
      console.log(`   - Design: ${entry.design_name}`);
      console.log(`   - Status: ${entry.status}`);
      console.log(`   - Upload Path: ${entry.upload_path}`);
      console.log(`   - DST Path: ${entry.dst_path || 'Not generated yet'}`);
      console.log(`   - Created: ${entry.created_at}`);
      console.log(`   - Updated: ${entry.updated_at}`);
      
      // Check if files exist
      const uploadPath = path.join(projectRoot, entry.upload_path);
      if (fs.existsSync(uploadPath)) {
        const stats = fs.statSync(uploadPath);
        console.log(`   - Upload file exists: ${stats.size} bytes`);
      } else {
        console.log(`   - ⚠️  Upload file missing: ${uploadPath}`);
      }
      
      if (entry.dst_path) {
        const dstPath = path.join(projectRoot, entry.dst_path);
        if (fs.existsSync(dstPath)) {
          const stats = fs.statSync(dstPath);
          console.log(`   - ✅ DST file exists: ${stats.size} bytes`);
        } else {
          console.log(`   - ⚠️  DST file missing: ${dstPath}`);
        }
      }
    });
  } catch (err) {
    console.log(`   ❌ Error reading uploads.json: ${err.message}`);
  }
} else {
  console.log('   ❌ uploads.json does NOT exist');
  console.log('   This means no uploads have been recorded yet.');
}

// Check uploads directory
console.log('\n2. Checking uploads/ directory...');
if (fs.existsSync(uploadsDir)) {
  const files = fs.readdirSync(uploadsDir).filter(f => f !== '.gitkeep');
  if (files.length > 0) {
    console.log(`   ✅ Found ${files.length} file(s):`);
    files.forEach(file => {
      const filePath = path.join(uploadsDir, file);
      const stats = fs.statSync(filePath);
      console.log(`   - ${file} (${stats.size} bytes, modified: ${stats.mtime})`);
    });
  } else {
    console.log('   ⚠️  Directory exists but is empty (except .gitkeep)');
  }
} else {
  console.log('   ❌ uploads/ directory does NOT exist');
}

// Check dst directory
console.log('\n3. Checking dst/ directory...');
if (fs.existsSync(dstDir)) {
  const files = fs.readdirSync(dstDir);
  if (files.length > 0) {
    console.log(`   ✅ Found ${files.length} DST file(s):`);
    files.forEach(file => {
      const filePath = path.join(dstDir, file);
      const stats = fs.statSync(filePath);
      console.log(`   - ${file} (${stats.size} bytes, modified: ${stats.mtime})`);
    });
  } else {
    console.log('   ⚠️  Directory exists but is empty');
  }
} else {
  console.log('   ❌ dst/ directory does NOT exist');
}

// Summary
console.log('\n' + '='.repeat(50));
console.log('\n📊 Summary:');
console.log('   - If uploads.json is missing, the upload API may have failed');
console.log('   - If uploads.json exists but files are missing, check file permissions');
console.log('   - If status is "pending", run: npm run watcher');
console.log('   - If status is "processing", conversion is in progress');
console.log('   - If status is "ready", DST file should be available\n');

