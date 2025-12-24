#!/usr/bin/env node
/**
 * Simple test to verify file writing works
 */

const fs = require('fs');
const path = require('path');

const testDir = path.join(process.cwd(), 'uploads');
const testFile = path.join(testDir, 'test-write.txt');
const jsonFile = path.join(process.cwd(), 'test-uploads.json');

console.log('🧪 Testing file write capability\n');
console.log('Current working directory:', process.cwd());
console.log('Test directory:', testDir);
console.log('Test file:', testFile);
console.log('JSON file:', jsonFile);
console.log('');

// Test directory creation
try {
  if (!fs.existsSync(testDir)) {
    fs.mkdirSync(testDir, { recursive: true });
    console.log('✅ Created uploads directory');
  } else {
    console.log('✅ Uploads directory exists');
  }
} catch (err) {
  console.error('❌ Failed to create directory:', err.message);
  process.exit(1);
}

// Test file write
try {
  fs.writeFileSync(testFile, 'Test content', 'utf-8');
  console.log('✅ Wrote test file');
  
  const stats = fs.statSync(testFile);
  console.log('✅ File verified, size:', stats.size);
  
  // Clean up
  fs.unlinkSync(testFile);
  console.log('✅ Cleaned up test file');
} catch (err) {
  console.error('❌ Failed to write file:', err.message);
  process.exit(1);
}

// Test JSON write
try {
  const testData = [{ id: 'test', status: 'pending' }];
  fs.writeFileSync(jsonFile, JSON.stringify(testData, null, 2), 'utf-8');
  console.log('✅ Wrote JSON file');
  
  const stats = fs.statSync(jsonFile);
  console.log('✅ JSON file verified, size:', stats.size);
  
  // Clean up
  fs.unlinkSync(jsonFile);
  console.log('✅ Cleaned up JSON file');
} catch (err) {
  console.error('❌ Failed to write JSON:', err.message);
  process.exit(1);
}

console.log('\n✅ All file write tests passed!');

