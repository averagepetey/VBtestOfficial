# JPG to DST Conversion Service

## Setup

```bash
# Install Python dependencies
pip3 install --user pyembroidery svgelements

# Install Node.js dependencies
npm install
```

## Usage

### Start Automation Watcher
```bash
npm run watcher
```

Monitors `uploads.json` and automatically converts pending uploads.

### Manual Conversion
```bash
npm run convert input.svg dst/
```

### Process Specific Entry
```bash
npm run automate <entry-id>
```

## Workflow

1. Client uploads JPG → Saved to `uploads/` → Entry in `uploads.json` (status: `pending`)
2. Watcher detects pending → Converts JPG → SVG → DST
3. Status updated to `ready` → Client notified

## Files

- `app/page.tsx` - Upload homepage
- `app/api/upload/route.ts` - Upload API
- `scripts/watcher.ts` - Monitors for pending uploads
- `scripts/automate.ts` - Main conversion workflow
- `scripts/convert-dst.ts` - SVG → DST converter
- `scripts/convert-dst-reliable.py` - Python converter (pyembroidery)
- `scripts/notify-clients.ts` - Client notifications
