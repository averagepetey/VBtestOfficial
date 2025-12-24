# Upload Troubleshooting Guide

## What I've Done

1. **Enhanced Error Logging**: Added detailed console logging to the upload API route (`app/api/upload/route.ts`) to help diagnose issues. All logs are prefixed with `[UPLOAD API]` for easy identification.

2. **Created Test Endpoint**: Added `/api/test` endpoint to verify the API server is working.

3. **Created Diagnostic Script**: The `check-upload-status.js` script shows the current state of uploads.

## How to Troubleshoot

### Step 1: Verify the Server is Running

Make sure your Next.js development server is running:
```bash
npm run dev
```

You should see output like:
```
- ready started server on 0.0.0.0:3000
- event compiled client and server successfully
```

### Step 2: Test the API Endpoint

Open your browser and navigate to:
```
http://localhost:3006/api/test
```

Or use the test script:
```bash
node test-upload.js 3006
```

You should see:
```json
{
  "status": "ok",
  "message": "API is working",
  "timestamp": "..."
}
```

If this doesn't work, the server isn't running or there's a routing issue.

### Step 3: Check Server Logs

When you upload a file, watch the terminal where `npm run dev` is running. You should see logs like:

```
[UPLOAD API] Request received
[UPLOAD API] Form data: { hasName: true, hasEmail: true, ... }
[UPLOAD API] Uploads directory exists
[UPLOAD API] Saving file to: /path/to/uploads/...
[UPLOAD API] File saved successfully, size: 12345
[UPLOAD API] uploads.json does not exist, creating new file
[UPLOAD API] Added entry: 1234567890-abc123
[UPLOAD API] Saved uploads.json successfully
```

### Step 4: Check Browser Console

1. Open your browser's Developer Tools (F12 or Cmd+Option+I)
2. Go to the **Console** tab
3. Try uploading a file
4. Look for any error messages

Also check the **Network** tab:
1. Go to the **Network** tab
2. Try uploading a file
3. Find the request to `/api/upload`
4. Check:
   - Status code (should be 200)
   - Response body
   - Request payload

### Step 5: Verify Files Were Created

After attempting an upload, run:
```bash
node check-upload-status.js
```

This will show:
- Whether `uploads.json` exists
- What entries are in it
- Whether the uploaded files exist
- Whether DST files were generated

### Step 6: Check File Permissions

The diagnostic script verified that:
- ✅ `uploads/` directory is writable
- ✅ Current directory is writable

If permissions are an issue, you'll see errors in the server logs.

## Common Issues

### Issue: No logs appear in server terminal
**Solution**: The request might not be reaching the server. Check:
- Is the server running?
- Is the URL correct? (should be `http://localhost:3006/api/upload`)
- Check browser Network tab for failed requests

### Issue: "Missing required fields" error
**Solution**: Check the browser console and Network tab to see what data is being sent. The form might not be submitting correctly.

### Issue: File saves but `uploads.json` doesn't update
**Solution**: Check server logs for errors when writing `uploads.json`. There might be a permissions issue or the file might be locked.

### Issue: Upload succeeds but no DST file
**Solution**: The upload worked, but the conversion hasn't run yet. You need to:
1. Start the watcher: `npm run watcher`
2. Or manually process: `node processUploads.js`

## Next Steps After Upload Succeeds

Once you see the upload succeed in the logs and `uploads.json` is created:

1. **Start the watcher** (in a separate terminal):
   ```bash
   npm run watcher
   ```

2. **Or manually process**:
   ```bash
   node processUploads.js
   ```

3. **Check the result**:
   ```bash
   node check-upload-status.js
   ```

## What the Logs Tell You

- `[UPLOAD API] Request received` - API endpoint was called
- `[UPLOAD API] Form data: ...` - Shows what data was received
- `[UPLOAD API] Saving file to: ...` - File path being used
- `[UPLOAD API] File saved successfully` - File was written to disk
- `[UPLOAD API] Saved uploads.json successfully` - Database entry was created

If any of these logs are missing, that's where the process is failing.

