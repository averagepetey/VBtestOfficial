# Testing Plan

## ✅ Already Tested

1. **Python Converter (SVG → DST)** ✅
   - Test: `python3 scripts/convert-dst-reliable.py test.svg output.dst`
   - Result: ✅ Success - DST file created (641 bytes)

## 🧪 Next Tests

### Test 1: Verify Converter Still Works
```bash
cd "/Users/johnpetersenhomefolder/Desktop/Coding Projects"
python3 scripts/convert-dst-reliable.py test.svg test-output.dst
ls -lh test-output.dst
```
**Expected:** DST file created successfully

### Test 2: Test TypeScript Integration
```bash
cd "/Users/johnpetersenhomefolder/Desktop/Coding_projects"
npx ts-node scripts/convert-dst.ts test.svg dst/
ls -lh dst/*.dst
```
**Expected:** DST file created via TypeScript wrapper

### Test 3: Test Full Workflow (JPG → SVG → DST)
```bash
# Option A: Use existing upload
cd "/Users/johnpetersenhomefolder/Desktop/Coding_projects"
# Find an entry ID from uploads.json
npm run automate <entry-id>

# Option B: Create test JPG and process it
# 1. Create a simple test JPG
# 2. Upload via Next.js homepage
# 3. Get entry ID from uploads.json
# 4. Run: npm run automate <entry-id>
```

### Test 4: Test Watcher (Automated Processing)
```bash
cd "/Users/johnpetersenhomefolder/Desktop/Coding_projects"
npm run watcher
```
**Expected:** Watcher detects pending uploads and processes them automatically

### Test 5: Validate DST File
- Open generated DST file in embroidery software (if available)
- Or use online DST viewer to verify format
- Check file size and structure

## 🎯 Recommended Testing Order

1. **Quick verification** - Test 1 (2 minutes)
2. **Integration test** - Test 2 (2 minutes)  
3. **Full workflow** - Test 3 (5 minutes)
4. **Automation** - Test 4 (10 minutes)
5. **Validation** - Test 5 (if software available)

## 🚨 What to Watch For

- **Errors:** Missing dependencies, file not found, conversion failures
- **File creation:** DST files should appear in `dst/` folder
- **Status updates:** `uploads.json` should update from `pending` → `processing` → `ready`
- **Notifications:** Console should show notification messages

## 📝 Test Checklist

- [ ] Converter works standalone
- [ ] TypeScript wrapper works
- [ ] JPG → SVG conversion works
- [ ] SVG → DST conversion works
- [ ] Full workflow end-to-end
- [ ] Watcher processes pending automatically
- [ ] Status updates correctly
- [ ] DST file is valid format
