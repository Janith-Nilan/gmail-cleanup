# Troubleshooting Guide

Common issues and solutions for Gmail Cleanup tool.

---

## Table of Contents

- [Installation Issues](#installation-issues)
- [Authorization Problems](#authorization-problems)
- [Execution Errors](#execution-errors)
- [Deletion Issues](#deletion-issues)
- [Performance Problems](#performance-problems)
- [Data Issues](#data-issues)
- [Recovery Procedures](#recovery-procedures)

---

## Installation Issues

### Issue: Can't Open Apps Script

**Symptom:**
```
Sorry, unable to open the file at this time.
Please check the address and try again.
```

**Cause:** Multiple Google accounts signed in

**Solution:**

1. Sign out of ALL Google accounts:
   ```
   Visit: accounts.google.com/Logout
   ```

2. Sign in to ONE account only

3. Try Extensions → Apps Script again

**Alternative Solutions:**

- Try incognito mode
- Use different browser (Chrome recommended)
- Clear browser cache and cookies

---

### Issue: Menu Not Appearing

**Symptom:** No "Gmail Cleanup" menu after installation

**Solutions:**

**Solution 1: Refresh**
```
Press F5 or Cmd+R/Ctrl+R
```

**Solution 2: Re-run setupMenu**
```
1. Extensions → Apps Script
2. Select setupMenu function
3. Click Run ▶
4. Close Apps Script tab
5. Refresh sheet
```

**Solution 3: Clear cache**
```
1. Cmd+Shift+Delete (Mac) or Ctrl+Shift+Delete (Windows)
2. Select "Cached images and files"
3. Clear data
4. Restart browser
```

---

### Issue: Authorization Fails

**Symptom:** "You do not have permission" error

**Solutions:**

**Solution 1: Re-authorize**
```
1. Apps Script → Run setupMenu
2. Click "Review permissions"
3. Choose your account
4. Click "Advanced"
5. Click "Go to script (unsafe)"
6. Click "Allow"
```

**Solution 2: Check popup blocker**
```
- Disable popup blocker for google.com
- Try authorization again
```

**Solution 3: Use different browser**
```
- Try Google Chrome
- Or Firefox
- Or Safari
```

---

## Authorization Problems

### Issue: "This app isn't verified"

**This is NORMAL!**

Google shows this warning for all personal scripts.

**Solution:**
```
1. Click "Advanced" (bottom left)
2. Click "Go to Gmail Cleanup Script (unsafe)"
3. Click "Allow"
```

Your script is safe - it's YOUR code!

---

### Issue: Authorization Expires

**Symptom:** Script stops working after some time

**Solution:**
```
1. Extensions → Apps Script
2. Run any function
3. Re-authorize when prompted
```

**Prevention:**
- Authorization typically lasts indefinitely
- May expire if you change password
- May expire if long period of inactivity

---

### Issue: Can't Access Gmail

**Symptom:** "Permission denied" for Gmail operations

**Cause:** Gmail scope not authorized

**Solution:**
```
1. Apps Script → Run setupMenu again
2. Grant Gmail permissions when asked
3. Ensure you see:
   - "View and manage spreadsheets" ✅
   - "View and modify Gmail" ✅
```

---

## Execution Errors

### Issue: "Exceeded maximum execution time"

**Symptom:**
```
Exceeded maximum execution time (360 seconds)
```

**This is NORMAL** for large deletions!

**What happens:**
- Script times out after 6 minutes
- Progress is saved
- Will auto-resume in 5 minutes

**No action needed** - this is expected behavior

**If happening too frequently:**

1. Reduce batch size:
   ```
   Settings sheet → Batch Size → Change to 25
   ```

2. Check internet connection
   ```
   Slow connection = more timeouts
   ```

---

### Issue: Script Doesn't Resume

**Symptom:** Script stops and doesn't continue

**Solutions:**

**Solution 1: Check triggers**
```
Gmail Cleanup → ⚙️ Setup Auto-Run
```

**Solution 2: Manual resume**
```
Gmail Cleanup → ▶️ Resume Deletion
```

**Solution 3: Check execution log**
```
1. Extensions → Apps Script
2. View → Executions
3. Look for errors
```

---

### Issue: "Service invoked too many times"

**Symptom:**
```
Service invoked too many times in a short time
```

**Cause:** Gmail API rate limit hit

**Solution:**

**Automatic:** Script will pause and resume

**Manual:**
1. Increase sleep time between batches:
   ```javascript
   // In Code.gs, change:
   SLEEP_BETWEEN_BATCHES: 3000,  // 3 seconds instead of 2
   ```

2. Reduce batch size:
   ```
   Settings → Batch Size → 25
   ```

---

### Issue: "Daily quota exceeded"

**Symptom:**
```
Daily quota for Gmail exceeded
```

**Cause:** Deleted 20,000 emails today (Gmail limit)

**Solution:**

**Automatic:** Script stops and resumes tomorrow

**Manual:** Wait 24 hours, then:
```
Gmail Cleanup → ▶️ Resume Deletion
```

**Normal behavior** for large cleanups!

---

## Deletion Issues

### Issue: Emails Not Deleting

**Symptom:** Dry Run shows emails but nothing deletes

**Cause:** Dry Run Mode still enabled

**Solution:**
```
1. Go to Settings sheet
2. Find "Dry Run Mode" row
3. Change TRUE to FALSE
4. Save
5. Try again
```

**Verify:**
```
Settings sheet:
Dry Run Mode    FALSE    ⚠️ REAL DELETION
```

---

### Issue: Wrong Emails Deleted

**Symptom:** Deleted emails you didn't want to delete

**Recovery:**
```
1. Go to Gmail Trash
2. Search: from:sender@example.com
3. Select emails
4. Move to Inbox (or other folder)
```

**Prevention:**
- ✅ Always test with Dry Run first
- ✅ Review sender list carefully
- ✅ Start with small batch
- ✅ Check boxes carefully

---

### Issue: "No emails found"

**Symptom:** Status shows "No emails found" but emails exist

**Causes & Solutions:**

**Cause 1: Email address typo**
```
Check sender email spelling in Senders sheet
```

**Cause 2: Emails already deleted**
```
Check Gmail Trash for previously deleted emails
```

**Cause 3: Different email format**
```
Some senders use multiple email addresses
Example: noreply@example.com vs no-reply@example.com
```

**Cause 4: Emails in different account**
```
Verify you're searching the correct Gmail account
```

---

### Issue: Partial Deletion

**Symptom:** Status "In Progress" - some deleted, some remaining

**This is NORMAL!**

**What it means:**
- Script timed out mid-deletion
- Will automatically resume
- No action needed

**If stuck:**
```
Gmail Cleanup → ▶️ Resume Deletion
```

---

## Performance Problems

### Issue: Very Slow Deletion

**Symptom:** Taking longer than expected

**Expected rates:**
- ~33 emails/minute
- ~2,000 emails/hour
- ~18,000 emails/day

**If slower:**

**Solution 1: Check batch size**
```
Settings → Batch Size
Recommended: 50
Try: 25 if unstable
Try: 100 if stable
```

**Solution 2: Check internet**
```
Slow connection = slower processing
Script runs on Google servers but API calls affected
```

**Solution 3: Check Gmail**
```
Very large mailboxes may be slower
Many labels/filters can slow searches
```

---

### Issue: Frequent Timeouts

**Symptom:** Script times out every execution

**Solutions:**

**Solution 1: Reduce batch size**
```
Settings → Batch Size → 25
```

**Solution 2: Reduce max batches per sender**
```javascript
// In Code.gs, find:
const maxBatchesPerSender = 5;
// Change to:
const maxBatchesPerSender = 3;
```

**Solution 3: Check execution time**
```
Extensions → Apps Script → View → Executions
Look for patterns
```

---

## Data Issues

### Issue: Checkboxes Not Working

**Symptom:** Can't check boxes in Senders sheet

**Solutions:**

**Solution 1: Re-run finalize**
```
Gmail Cleanup → Setup → Finalize Import
```

**Solution 2: Manual fix**
```
1. Select cell A2
2. Insert → Checkbox
3. Copy cell A2
4. Select range A3:A[last row]
5. Paste
```

**Solution 3: Re-import**
```
1. Delete all data in Senders sheet
2. Gmail Cleanup → Setup → Import CSV Data
3. Gmail Cleanup → Setup → Finalize Import
```

---

### Issue: Status Not Updating

**Symptom:** Status column doesn't change

**Solutions:**

**Solution 1: Refresh**
```
Press F5 or Cmd+R/Ctrl+R
```

**Solution 2: Check execution log**
```
Extensions → Apps Script → View → Executions
Verify script is running
```

**Solution 3: Check triggers**
```
Extensions → Apps Script → Triggers (clock icon)
Should see processEmails trigger
```

---

### Issue: Log Sheet Empty

**Symptom:** No entries in Log sheet

**Causes & Solutions:**

**Cause 1: Script hasn't run**
```
Check if deletion started
```

**Cause 2: Log sheet renamed**
```
Sheet must be named exactly: "Log"
Rename if changed
```

**Cause 3: Log sheet deleted**
```
Gmail Cleanup → Setup → Initial Setup
Creates new Log sheet
```

---

## Recovery Procedures

### Recover Deleted Emails

**All deleted emails are in Gmail Trash for 30 days**

**Recover all from a sender:**
```
1. Go to Gmail
2. Click "Trash" in sidebar
3. Search: from:sender@example.com
4. Select all
5. Move to → Inbox (or other folder)
```

**Bulk recovery:**
```
1. Gmail Trash
2. Click checkbox (select all on page)
3. Click "Select all conversations that match this search"
4. Move to → Inbox
```

**After 30 days:** Emails permanently deleted, cannot recover

---

### Reset Script State

**If script is completely stuck:**

**Option 1: Reset status**
```
Gmail Cleanup → 🔄 Reset Status
```

**Option 2: Delete and recreate sheets**
```
1. Delete Senders, Log, Settings sheets
2. Gmail Cleanup → Setup → Initial Setup
3. Re-import CSV data
```

**Option 3: Fresh start**
```
1. Create new Google Sheet
2. Install script again
3. Import data
```

---

### Remove Auto-Run

**If script keeps running and you want to stop:**

```
Gmail Cleanup → 🗑️ Remove Auto-Run
```

**Manual removal:**
```
1. Extensions → Apps Script
2. Click Triggers icon (clock)
3. Click ⋮ next to trigger
4. Click Delete
```

---

## Debug Mode

### Enable Detailed Logging

**For developers:**

```javascript
// In Code.gs, add at top of processEmails():
Logger.log('Starting processEmails');
Logger.log('Dry Run: ' + isDryRunMode());
Logger.log('Batch Size: ' + getBatchSize());
```

**View logs:**
```
1. Extensions → Apps Script
2. View → Logs
or
3. View → Executions → Click execution → View logs
```

---

## Error Messages

### Common Error Messages

| Error | Meaning | Solution |
|-------|---------|----------|
| "Cannot read property 'getRange' of null" | Sheet not found | Check sheet names |
| "You do not have permission" | Not authorized | Re-authorize |
| "Service invoked too many times" | Rate limit | Script auto-pauses |
| "Exceeded maximum execution time" | Timeout | Normal - auto-resumes |
| "Daily quota exceeded" | 20k limit | Wait 24 hours |
| "No emails found" | No matches | Check email address |

---

## Getting Help

### Before Asking for Help

1. Check this troubleshooting guide
2. Review [FAQ](../README.md#-faq)
3. Check execution log for errors
4. Try the suggested solutions

### Information to Provide

When reporting issues:

```markdown
**Environment:**
- Browser: [Chrome 120]
- OS: [macOS 14]
- Google Account Type: [Personal/Workspace]

**Issue:**
[Clear description]

**Steps to Reproduce:**
1. [First step]
2. [Second step]
3. [See error]

**Error Message:**
[Exact error text]

**Logs:**
[From Apps Script execution log]

**Screenshots:**
[If applicable]
```

### Support Channels

- **GitHub Issues**: Bug reports
- **GitHub Discussions**: Questions
- **Documentation**: This guide

---

## Quick Reference

### Common Solutions

| Problem | Quick Fix |
|---------|-----------|
| Menu missing | Refresh page (F5) |
| Can't authorize | Sign out all accounts, use one |
| Not deleting | Check Dry Run = FALSE |
| Script stopped | Resume Deletion |
| Too slow | Reduce batch size |
| Timeout errors | Normal - auto-resumes |
| Wrong account | Sign out, use correct account |

---

## Prevention Best Practices

✅ **Always test with Dry Run first**  
✅ **Start with small batches**  
✅ **Review sender list carefully**  
✅ **Monitor Log sheet initially**  
✅ **Keep Settings sheet visible**  
✅ **Don't modify script during execution**  
✅ **Use stable internet connection**

---

<p align="center">
<a href="USAGE.md">← Usage Guide</a> •
<a href="../README.md">Back to README</a> •
<a href="INSTALLATION.md">Installation Guide →</a>
</p>
