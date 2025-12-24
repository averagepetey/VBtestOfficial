# Start Server Instructions

## Step 1: Kill Background Server
I just killed the background server. Port 3006 should now be free.

## Step 2: Start Server in Your Terminal
Run this command in your terminal:
```bash
npm run dev
```

You should see:
```
> next dev -p 3006
- ready started server on 0.0.0.0:3006
```

## Step 3: Keep Terminal Visible
**IMPORTANT:** Keep this terminal window visible and watch for logs!

## Step 4: Test Upload
In a NEW terminal window, run:
```bash
curl -X POST http://localhost:3006/api/upload \
  -F "name=Test User" \
  -F "email=test@test.com" \
  -F "design=Test Design" \
  -F "file=@test.svg"
```

## Step 5: Watch for Logs
In the server terminal (where `npm run dev` is running), you should see:
```
[UPLOAD API] Request received
[UPLOAD API] Form data: { hasName: true, ... }
[UPLOAD API] Current working directory: ...
[UPLOAD API] Saving file to: ...
[UPLOAD API] File write completed
[UPLOAD API] File verified, size on disk: ...
[UPLOAD API] Saved uploads.json successfully
```

**Copy and paste those logs here so I can see what's happening!**

