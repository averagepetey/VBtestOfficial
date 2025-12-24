# Quick Start Guide

## 🚀 Getting Started with Automation

### Step 1: Install Dependencies

```bash
npm install
npm install --save-dev ts-node
```

### Step 2: Test the Upload Form

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Visit http://localhost:3000

3. Fill out the form and upload a JPG file

4. The file will be saved to `uploads/` and an entry added to `uploads.json`

### Step 3: Check for Pending Uploads

```bash
npm run watcher
```

This will show you all files with status "pending".

### Step 4: Manual Conversion (For Now)

Since full automation requires Inkscape and Ink/Stitch, you can:

1. **Manually convert files** using your preferred method
2. **Update uploads.json** manually:
   ```json
   {
     "id": "your-upload-id",
     "status": "ready",
     "dst_path": "dst/your-file.dst"
   }
   ```

### Step 5: Test Notifications

```bash
npm run notify
```

This will show what emails would be sent (email sending is commented out until you configure it).

## 📋 Workflow Summary

```
Client Upload → uploads.json (status: pending)
     ↓
Watcher Script → Finds pending files
     ↓
Convert Script → JPG → SVG → DST (if tools installed)
     ↓
uploads.json (status: ready, dst_path: set)
     ↓
Notify Script → Email client with download link
```

## 🔧 Next Steps

1. **Install Inkscape & Ink/Stitch** (see AUTOMATION.md)
2. **Configure email** (see AUTOMATION.md)
3. **Set up cron job** for automatic processing
4. **Create download API** for clients to retrieve files

## 📚 Full Documentation

See [AUTOMATION.md](./AUTOMATION.md) for complete documentation.
