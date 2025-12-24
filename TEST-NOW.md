# Test Now - Step by Step

## ✅ Step 1: Verify Converter (30 seconds)

```bash
cd "/Users/johnpetersenhomefolder/Desktop/Coding Projects"
python3 scripts/convert-dst-reliable.py test.svg test-verify.dst
```

**Expected:** `✓ Converted to: test-verify.dst`

---

## ✅ Step 2: Test Full Workflow with Real Upload

### Option A: Use Existing Upload

You have 5 pending uploads. Test with one:

```bash
cd "/Users/johnpetersenhomefolder/Desktop/Coding_projects"
npm run automate 1766453505032-uzwn5l
```

**What to check:**
- Does it find the JPG file?
- Does it create SVG?
- Does it create DST?
- Does `uploads.json` update to `ready`?

### Option B: New Upload Test

1. **Start Next.js dev server:**
   ```bash
   cd "/Users/johnpetersenhomefolder/Desktop/Coding_projects"
   npm run dev
   ```

2. **Upload a test JPG** via `http://localhost:3000`

3. **Check uploads.json** for new entry ID

4. **Run automation:**
   ```bash
   npm run automate <new-entry-id>
   ```

---

## ✅ Step 3: Test Automated Watcher

```bash
cd "/Users/johnpetersenhomefolder/Desktop/Coding_projects"
npm run watcher
```

**What happens:**
- Watcher starts
- Checks `uploads.json` every 5 seconds
- Automatically processes any `pending` entries
- Updates status to `ready`
- Shows notifications

**To stop:** Press `Ctrl+C`

---

## 🎯 Quick Test (Recommended)

**Test the converter with an existing upload:**

```bash
cd "/Users/johnpetersenhomefolder/Desktop/Coding_projects"
npm run automate 1766453505032-uzwn5l
```

This will:
1. Find the JPG file
2. Convert JPG → SVG
3. Convert SVG → DST (using our tested converter)
4. Update status
5. Show notification

**Watch for:**
- ✅ Success messages
- ✅ DST file created in `dst/` folder
- ✅ Status updated in `uploads.json`

---

## 🚨 If Errors Occur

**Missing dependencies:**
```bash
pip3 install --user pyembroidery svgelements
```

**File not found:**
- Check if JPG exists at path in `uploads.json`
- Verify file permissions

**Conversion fails:**
- Check Python error messages
- Verify SVG file is valid

---

## 📊 Success Criteria

✅ Converter creates DST file  
✅ File appears in `dst/` folder  
✅ `uploads.json` status updates to `ready`  
✅ No errors in console
