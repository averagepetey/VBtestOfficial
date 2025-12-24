# Automation Guide

This document explains the automation system for the JPG → DST converter service.

## Overview

The automation system handles:
1. **File Tracking** - Monitors uploads via `uploads.json`
2. **DST Conversion** - Converts JPG → SVG → DST (semi-automated)
3. **Client Notifications** - Sends emails when files are ready
4. **Status Management** - Tracks pending, processing, ready, and error states

## File Structure

```
.
├── uploads/              # Uploaded JPG files
├── dst/                  # Generated DST files
├── uploads.json         # Database of all uploads
└── scripts/
    ├── watcher.ts       # Monitor pending uploads
    ├── convert-dst.ts   # Convert JPG → SVG → DST
    ├── notify-clients.ts # Send email notifications
    └── automate.ts       # Main automation workflow
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Install TypeScript Runner (if not already installed)

```bash
npm install --save-dev ts-node
```

### 3. Install Conversion Tools (Optional - for full automation)

For automatic DST conversion, you'll need:

- **Inkscape** - For JPG → SVG conversion
  ```bash
  # macOS
  brew install inkscape
  
  # Linux
  sudo apt-get install inkscape
  
  # Windows
  # Download from https://inkscape.org/
  ```

- **Ink/Stitch** - Inkscape extension for SVG → DST
  - Install via Inkscape: Extensions → Manage Extensions → Install Ink/Stitch
  - Or follow: https://inkstitch.org/docs/install/

### 4. Configure Email (Optional - for notifications)

Create a `.env.local` file:

```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
BASE_URL=http://localhost:3000
```

For Gmail, you'll need an [App Password](https://support.google.com/accounts/answer/185833).

Then install nodemailer:

```bash
npm install nodemailer @types/nodemailer
```

## Usage

### Manual Workflow

1. **Client uploads file** via the web form
2. **Check pending uploads:**
   ```bash
   npm run watcher
   ```
3. **Convert files manually** (or use automation)
4. **Update uploads.json** with DST path and status
5. **Notify clients:**
   ```bash
   npm run notify
   ```

### Automated Workflow

Run the complete automation workflow:

```bash
npm run automate
```

This will:
1. Check for pending uploads
2. Convert JPG → SVG → DST (if tools are installed)
3. Update status in uploads.json
4. Send email notifications to clients

### Individual Scripts

**Check for pending uploads:**
```bash
npm run watcher
```

**Convert pending files to DST:**
```bash
npm run convert
```

**Send notifications to clients:**
```bash
npm run notify
```

## uploads.json Structure

Each entry in `uploads.json` follows this structure:

```json
{
  "id": "1234567890-abc123",
  "client_name": "John Doe",
  "client_email": "john@example.com",
  "design_name": "Company Logo",
  "upload_path": "uploads/1234567890-abc123.jpg",
  "dst_path": "dst/1234567890-abc123.dst",
  "status": "ready",
  "created_at": "2024-01-15T10:30:00.000Z",
  "updated_at": "2024-01-15T10:35:00.000Z"
}
```

**Status values:**
- `pending` - File uploaded, waiting for conversion
- `processing` - Currently being converted
- `ready` - DST file ready for download
- `error` - Conversion failed

## Customization

### Modify Conversion Process

Edit `scripts/convert-dst.ts` to customize:
- File conversion commands
- Output paths
- Error handling

### Modify Email Notifications

Edit `scripts/notify-clients.ts` to customize:
- Email templates
- Notification triggers
- Email service provider

### Schedule Automation

Use cron (Linux/macOS) or Task Scheduler (Windows) to run automation periodically:

```bash
# Run every 5 minutes
*/5 * * * * cd /path/to/project && npm run automate
```

Or use a process manager like PM2:

```bash
npm install -g pm2
pm2 start npm --name "dst-automation" -- run automate
pm2 save
```

## Troubleshooting

### "Command not found" errors

Make sure Inkscape and Ink/Stitch are in your PATH, or update the commands in `convert-dst.ts` with full paths.

### Email not sending

1. Check `.env.local` has correct credentials
2. For Gmail, ensure you're using an App Password (not your regular password)
3. Check that nodemailer is installed: `npm install nodemailer @types/nodemailer`

### Files not converting

1. Verify Inkscape is installed: `inkscape --version`
2. Check that Ink/Stitch extension is installed in Inkscape
3. Review error messages in the console output
4. Manually test conversion: `inkscape input.jpg --export-filename=output.svg`

## Next Steps

1. **Set up cron job** for automatic processing
2. **Configure email service** for client notifications
3. **Add download API route** for clients to retrieve DST files
4. **Implement admin dashboard** to monitor all uploads
5. **Add error logging** and monitoring

## Support

For issues or questions, check the main README.md or create an issue in the repository.
