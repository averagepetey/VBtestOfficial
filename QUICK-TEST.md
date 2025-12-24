# Quick Test Guide - Port 3006

## Current Status
✅ Enhanced logging added to upload API
✅ Test endpoint created at `/api/test`
✅ Diagnostic script ready
✅ Test upload script created

## Step-by-Step Testing

### 1. Verify Server is Running
Make sure your Next.js server is running on port 3006:
```bash
npm run dev
```

### 2. Test API Endpoint (Browser)
Open in your browser:
```
http://localhost:3006/api/test
```

You should see:
```json
{
  "status": "ok",
  "message": "API is working",
  "timestamp": "..."
}
```

### 3. Test Upload via Script
Run the automated test:
```bash
node test-upload.js 3006
```

This will:
- Send a test upload to your API
- Show you the response
- Tell you if it succeeded or failed

### 4. Test Upload via Browser
1. Go to `http://localhost:3006`
2. Fill out the form with:
   - Name: Test User
   - Email: test@example.com
   - Design: Test Design
   - File: Upload any JPG image
3. Click "Submit Design"
4. **Watch the terminal** where `npm run dev` is running
5. You should see logs like:
   ```
   [UPLOAD API] Request received
   [UPLOAD API] Form data: { hasName: true, ... }
   [UPLOAD API] Saving file to: ...
   [UPLOAD API] File saved successfully
   [UPLOAD API] Saved uploads.json successfully
   ```

### 5. Check Upload Status
After uploading, check what was created:
```bash
node check-upload-status.js
```

This shows:
- Whether uploads.json exists
- What entries are in it
- Whether files were saved
- Whether DST files were generated

### 6. Process the Upload (Convert to DST)
Once an upload is successful, you need to convert it:

**Option A: Use the watcher (automatic)**
```bash
npm run watcher
```
This will monitor for new uploads and convert them automatically.

**Option B: Manual processing**
```bash
node processUploads.js
```
This processes all pending uploads once.

### 7. Verify DST File Created
After conversion, check again:
```bash
node check-upload-status.js
```

You should see:
- Status changed from "pending" to "ready"
- DST path populated
- DST file exists in the `dst/` directory

## Troubleshooting

### If test endpoint doesn't work:
- Server might not be running
- Wrong port (should be 3006)
- Check terminal for errors

### If upload fails:
- Check browser console (F12) for errors
- Check server terminal for `[UPLOAD API]` logs
- Verify all form fields are filled
- Check file size (should be reasonable)

### If upload succeeds but no DST:
- Upload worked! Now run the watcher or processUploads.js
- Check that Python dependencies are installed:
  ```bash
  pip3 install --user pyembroidery svgelements
  ```
- Check that Inkscape is available (for JPG→SVG conversion)

## What to Look For

**Success indicators:**
- ✅ Server logs show `[UPLOAD API]` messages
- ✅ `uploads.json` file is created
- ✅ File appears in `uploads/` directory
- ✅ Status shows "ready" after conversion
- ✅ DST file appears in `dst/` directory

**Failure indicators:**
- ❌ No `[UPLOAD API]` logs (request not reaching server)
- ❌ Error messages in server logs
- ❌ Error messages in browser console
- ❌ `uploads.json` not created
- ❌ Files not in `uploads/` directory

