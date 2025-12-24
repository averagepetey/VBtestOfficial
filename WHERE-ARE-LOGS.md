# Where to Find Upload API Logs

## Location of Logs

The `[UPLOAD API]` logs appear in the **terminal/command line window** where you ran `npm run dev`.

## How to See the Logs

### Step 1: Find Your Server Terminal
Look for the terminal window where you see output like:
```
> jpg-to-dst-converter@1.0.0 dev
> next dev -p 3006

- ready started server on 0.0.0.0:3006
```

### Step 2: Upload a File
1. Go to `http://localhost:3006` in your browser
2. Fill out the form and upload a JPG file
3. Click "Submit Design"

### Step 3: Watch the Terminal
You should see logs like:
```
[UPLOAD API] Request received
[UPLOAD API] Form data: { hasName: true, hasEmail: true, ... }
[UPLOAD API] Current working directory: /Users/johnpetersenhomefolder/Desktop/Coding Projects
[UPLOAD API] Uploads directory path: /Users/johnpetersenhomefolder/Desktop/Coding Projects/uploads
[UPLOAD API] Saving file to: ...
[UPLOAD API] File buffer created, size: 12345
[UPLOAD API] File write completed
[UPLOAD API] File verified, size on disk: 12345
[UPLOAD API] Saved uploads.json successfully
```

## If You Don't See Logs

### Check 1: Is the server running?
- Look for the terminal with `npm run dev` output
- If you don't see it, the server might not be running
- Run `npm run dev` in a terminal

### Check 2: Are you looking at the right terminal?
- The logs appear in the **same terminal** where `npm run dev` is running
- Not in your browser console
- Not in a different terminal window

### Check 3: Did the upload actually happen?
- Check browser console (F12) for any errors
- Check Network tab to see if the request was sent
- Look for a success message on the page

## Test the Logs

Run this command to trigger an upload and see logs:
```bash
curl -X POST http://localhost:3006/api/upload \
  -F "name=Test User" \
  -F "email=test@test.com" \
  -F "design=Test Design" \
  -F "file=@test.svg"
```

Then immediately check your server terminal for `[UPLOAD API]` logs.

## What the Logs Tell You

- `[UPLOAD API] Request received` → API was called
- `[UPLOAD API] Form data: ...` → Shows what data was received
- `[UPLOAD API] Current working directory: ...` → Shows where files will be saved
- `[UPLOAD API] File write completed` → File was written to disk
- `[UPLOAD API] File verified` → File exists and size matches
- `[UPLOAD API] Saved uploads.json successfully` → Database entry was created

If any of these are missing, that's where the process is failing.

