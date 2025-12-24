#!/usr/bin/env node
/**
 * Test script to verify upload API is working
 * Usage: node test-upload.js [port]
 */

const http = require('http');
const fs = require('fs');
const path = require('path');

const port = process.argv[2] || '3006';
const testImagePath = path.join(__dirname, 'test.svg'); // Using test.svg as a test file

console.log(`🧪 Testing upload API on localhost:${port}\n`);

// Check if test file exists, if not create a dummy one
let testFile;
let testFileName = 'test.jpg';
let testFileContent;

if (fs.existsSync(testImagePath)) {
  testFileContent = fs.readFileSync(testImagePath);
  testFileName = 'test.svg';
} else {
  // Create a minimal test file (1x1 pixel JPG header)
  testFileContent = Buffer.from([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01
  ]);
}

// Create form data
const boundary = '----WebKitFormBoundary' + Math.random().toString(36);
const formData = [];

// Add form fields
formData.push(`--${boundary}\r\n`);
formData.push('Content-Disposition: form-data; name="name"\r\n\r\n');
formData.push('Test User\r\n');

formData.push(`--${boundary}\r\n`);
formData.push('Content-Disposition: form-data; name="email"\r\n\r\n');
formData.push('test@example.com\r\n');

formData.push(`--${boundary}\r\n`);
formData.push('Content-Disposition: form-data; name="design"\r\n\r\n');
formData.push('Test Design\r\n');

// Add file
formData.push(`--${boundary}\r\n`);
formData.push(`Content-Disposition: form-data; name="file"; filename="${testFileName}"\r\n`);
formData.push('Content-Type: image/jpeg\r\n\r\n');
const formDataBuffer = Buffer.concat([
  Buffer.from(formData.join('')),
  testFileContent,
  Buffer.from(`\r\n--${boundary}--\r\n`)
]);

const options = {
  hostname: 'localhost',
  port: port,
  path: '/api/upload',
  method: 'POST',
  headers: {
    'Content-Type': `multipart/form-data; boundary=${boundary}`,
    'Content-Length': formDataBuffer.length
  }
};

console.log('📤 Sending test upload request...');
const req = http.request(options, (res) => {
  let data = '';

  res.on('data', (chunk) => {
    data += chunk;
  });

  res.on('end', () => {
    console.log(`\n📥 Response Status: ${res.statusCode}`);
    console.log('📥 Response Headers:', res.headers);
    
    try {
      const json = JSON.parse(data);
      console.log('📥 Response Body:', JSON.stringify(json, null, 2));
      
      if (res.statusCode === 200 && json.success) {
        console.log('\n✅ Upload test PASSED!');
        console.log(`   Upload ID: ${json.id}`);
        console.log('\n📋 Next steps:');
        console.log('   1. Check uploads.json was created');
        console.log('   2. Check uploads/ directory for the file');
        console.log('   3. Run: node check-upload-status.js');
        console.log('   4. Run: npm run watcher (to process conversion)');
      } else {
        console.log('\n❌ Upload test FAILED');
        console.log('   Error:', json.error || 'Unknown error');
      }
    } catch (e) {
      console.log('📥 Response (not JSON):', data);
      console.log('\n❌ Failed to parse response');
    }
  });
});

req.on('error', (e) => {
  console.error(`\n❌ Request error: ${e.message}`);
  console.log('\n💡 Make sure:');
  console.log('   - Next.js server is running on port', port);
  console.log('   - Run: npm run dev');
  process.exit(1);
});

req.write(formDataBuffer);
req.end();

