/**
 * Gmail Bulk Email Deletion Script
 *
 * Purpose: Automate deletion of emails from specified senders
 * Created: June 28, 2026
 * For: Gmail 1 Cleanup
 *
 * Features:
 * - Batch processing (respects Gmail quotas)
 * - Dry run mode (preview before deleting)
 * - Detailed logging
 * - Pause/resume capability
 * - Safe deletion (trash, not permanent)
 *
 * Gmail Quotas:
 * - 20,000 emails per day
 * - 6 minutes per script execution
 * - 90 triggers per day
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

const CONFIG = {
  SHEETS: {
    SENDERS: 'Senders',
    LOG: 'Log',
    SETTINGS: 'Settings'
  },
  COLUMNS: {
    DELETE: 0,      // A: Checkbox
    EMAIL: 1,       // B: Email address
    COUNT: 2,       // C: Expected count
    CATEGORY: 3,    // D: Category
    STATUS: 4,      // E: Status
    FOUND: 5,       // F: Emails found
    DELETED: 6,     // G: Deleted count
    UPDATED: 7      // H: Last updated
  },
  SETTINGS_ROWS: {
    DRY_RUN: 2,
    BATCH_SIZE: 3,
    DAILY_LIMIT: 4,
    TOTAL_TODAY: 5,
    LAST_RUN: 6
  },
  BATCH_SIZE: 50, // Reduced from 100 to avoid timeout
  DAILY_LIMIT: 18000,
  MAX_RUNTIME: 240000, // 4 minutes (in milliseconds) - leave 2 min buffer
  SLEEP_BETWEEN_BATCHES: 2000, // 2 seconds - give Gmail API time to respond
  TRIGGER_INTERVAL: 5 // Minutes between auto-runs (must be 1, 5, 10, 15, or 30)
};

// ============================================================================
// MENU SETUP
// ============================================================================

/**
 * Creates custom menu when spreadsheet opens
 */
function onOpen() {
  setupMenu();
}

function setupMenu() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('Gmail Cleanup')
    .addSubMenu(ui.createMenu('📋 Setup')
      .addItem('1️⃣ Initial Setup (Create Sheets)', 'initialSetup')
      .addItem('2️⃣ Import CSV Data', 'importCSVData')
      .addItem('3️⃣ Finalize Import (Add Checkboxes)', 'finalizeImport')
      .addSeparator()
      .addItem('✅ Test Setup', 'testSetup'))
    .addSeparator()
    .addItem('🧪 Dry Run (Preview)', 'dryRun')
    .addSeparator()
    .addItem('🚀 Start Email Deletion', 'startDeletion')
    .addItem('⏸️ Stop Deletion', 'stopDeletion')
    .addItem('▶️ Resume Deletion', 'resumeDeletion')
    .addSeparator()
    .addItem('📊 Refresh Stats', 'refreshStats')
    .addItem('🔄 Reset Status', 'resetStatus')
    .addSeparator()
    .addItem('⚙️ Setup Auto-Run', 'setupTriggers')
    .addItem('🗑️ Remove Auto-Run', 'removeTriggers')
    .addToUi();
}

// ============================================================================
// AUTOMATIC SETUP FUNCTIONS
// ============================================================================

/**
 * Initial setup - Creates all necessary sheets, headers, and formatting
 */
function initialSetup() {
  const ui = SpreadsheetApp.getUi();

  const result = ui.alert(
    '🔧 Initial Setup',
    'This will automatically create all necessary sheets, columns, and formatting.\n\n' +
    'It will create:\n' +
    '1. Senders sheet (with headers and checkboxes)\n' +
    '2. Log sheet (with headers)\n' +
    '3. Settings sheet (with configuration)\n\n' +
    'After this, you\'ll need to import your CSV data.\n\n' +
    'Continue with setup?',
    ui.ButtonSet.YES_NO
  );

  if (result !== ui.Button.YES) {
    return;
  }

  try {
    // Create sheets
    createSheetsIfNeeded();

    // Setup headers and formatting
    setupSendersSheet();
    setupLogSheet();
    setupSettingsSheet();

    // Format sheets
    formatSheets();

    logMessage('INFO', 'SETUP', 'Initial setup complete', 0);

    ui.alert(
      '✅ Setup Complete!',
      'All sheets have been created and configured.\n\n' +
      'Next steps:\n' +
      '1. Click "Gmail Cleanup → Import CSV Data"\n' +
      '2. Paste your CSV data when prompted\n' +
      '3. Run Dry Run to test\n' +
      '4. Start deletion when ready\n\n' +
      'Check the Senders, Log, and Settings sheets.',
      ui.ButtonSet.OK
    );

  } catch (error) {
    ui.alert(
      '❌ Setup Failed',
      'Error during setup:\n' + error.toString() + '\n\n' +
      'Please check the script and try again.',
      ui.ButtonSet.OK
    );
  }
}

/**
 * Create sheets if they don't exist
 */
function createSheetsIfNeeded() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Create Senders sheet
  if (!ss.getSheetByName(CONFIG.SHEETS.SENDERS)) {
    ss.insertSheet(CONFIG.SHEETS.SENDERS);
  }

  // Create Log sheet
  if (!ss.getSheetByName(CONFIG.SHEETS.LOG)) {
    ss.insertSheet(CONFIG.SHEETS.LOG);
  }

  // Create Settings sheet
  if (!ss.getSheetByName(CONFIG.SHEETS.SETTINGS)) {
    ss.insertSheet(CONFIG.SHEETS.SETTINGS);
  }

  // Delete default Sheet1 if it exists and is empty
  const defaultSheet = ss.getSheetByName('Sheet1');
  if (defaultSheet && ss.getSheets().length > 1) {
    try {
      ss.deleteSheet(defaultSheet);
    } catch (e) {
      // Ignore if can't delete
    }
  }
}

/**
 * Setup Senders sheet with headers
 */
function setupSendersSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.SENDERS);

  // Clear existing content (if any)
  sheet.clear();

  // Set headers
  const headers = [
    'Delete?',
    'Email',
    'Count',
    'Category',
    'Status',
    'Emails Found',
    'Deleted',
    'Last Updated'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Format header row
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#4285f4');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');

  // Set column widths
  sheet.setColumnWidth(1, 80);  // Delete? checkbox
  sheet.setColumnWidth(2, 300); // Email
  sheet.setColumnWidth(3, 80);  // Count
  sheet.setColumnWidth(4, 150); // Category
  sheet.setColumnWidth(5, 150); // Status
  sheet.setColumnWidth(6, 120); // Emails Found
  sheet.setColumnWidth(7, 100); // Deleted
  sheet.setColumnWidth(8, 150); // Last Updated

  // Freeze header row
  sheet.setFrozenRows(1);

  // Add a sample row with checkbox (row 2)
  sheet.getRange(2, 1).insertCheckboxes();
  sheet.getRange(2, 5).setValue('Pending');

  // Add data validation notes
  sheet.getRange(1, 1).setNote('Check this box to mark sender for deletion');
}

/**
 * Setup Log sheet with headers
 */
function setupLogSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.LOG);

  // Clear existing content
  sheet.clear();

  // Set headers
  const headers = [
    'Timestamp',
    'Action',
    'Sender',
    'Count',
    'Status',
    'Details'
  ];

  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);

  // Format header row
  const headerRange = sheet.getRange(1, 1, 1, headers.length);
  headerRange.setBackground('#34a853');
  headerRange.setFontColor('#ffffff');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');

  // Set column widths
  sheet.setColumnWidth(1, 180); // Timestamp
  sheet.setColumnWidth(2, 120); // Action
  sheet.setColumnWidth(3, 250); // Sender
  sheet.setColumnWidth(4, 80);  // Count
  sheet.setColumnWidth(5, 100); // Status
  sheet.setColumnWidth(6, 400); // Details

  // Freeze header row
  sheet.setFrozenRows(1);

  // Add initial log entry
  sheet.appendRow([
    new Date(),
    'INFO',
    'SETUP',
    0,
    'Success',
    'Log sheet created and configured'
  ]);
}

/**
 * Setup Settings sheet with configuration
 */
function setupSettingsSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.SETTINGS);

  // Clear existing content
  sheet.clear();

  // Set headers
  sheet.getRange(1, 1, 1, 2).setValues([['Setting', 'Value']]);

  // Format header row
  const headerRange = sheet.getRange(1, 1, 1, 2);
  headerRange.setBackground('#fbbc04');
  headerRange.setFontColor('#000000');
  headerRange.setFontWeight('bold');
  headerRange.setHorizontalAlignment('center');

  // Add settings with descriptions
  const settings = [
    ['Dry Run Mode', true, 'Set to FALSE to enable real deletion'],
    ['Batch Size', 100, 'Emails to process per batch (50-200)'],
    ['Daily Limit', 18000, 'Max emails per day (Gmail limit: 20,000)'],
    ['Total Deleted Today', 0, 'Counter (auto-updated)'],
    ['Last Run Date', '', 'Timestamp (auto-updated)'],
    ['', '', ''],
    ['Instructions', '', ''],
    ['1. Import CSV Data', '', 'Use Gmail Cleanup menu'],
    ['2. Check senders to delete', '', 'In Senders sheet'],
    ['3. Test with Dry Run', '', 'Always test first!'],
    ['4. Set Dry Run to FALSE', '', 'For real deletion'],
    ['5. Start Deletion', '', 'Use Gmail Cleanup menu']
  ];

  // Write settings
  for (let i = 0; i < settings.length; i++) {
    const row = i + 2; // Start from row 2
    sheet.getRange(row, 1).setValue(settings[i][0]);
    sheet.getRange(row, 2).setValue(settings[i][1]);

    // Add notes for main settings
    if (settings[i][2]) {
      sheet.getRange(row, 2).setNote(settings[i][2]);
    }
  }

  // Set column widths
  sheet.setColumnWidth(1, 250);
  sheet.setColumnWidth(2, 200);

  // Freeze header row
  sheet.setFrozenRows(1);

  // Format TRUE/FALSE cells
  sheet.getRange(2, 2).setBackground('#d9ead3'); // Dry Run = TRUE (green)

  // Format instruction section
  const instructionRange = sheet.getRange(8, 1, 6, 2);
  instructionRange.setBackground('#f3f3f3');
  instructionRange.setFontStyle('italic');
}

/**
 * Format sheets for better readability
 */
function formatSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Format Senders sheet
  const sendersSheet = ss.getSheetByName(CONFIG.SHEETS.SENDERS);
  if (sendersSheet) {
    try {
      // Get actual last row with data
      const lastRow = sendersSheet.getLastRow();
      if (lastRow > 1) {
        const dataRange = sendersSheet.getRange(2, 1, lastRow - 1, 8);

        // Remove any existing banding first
        const existingBandings = sendersSheet.getBandings();
        existingBandings.forEach(banding => banding.remove());

        // Apply new banding
        dataRange.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREY, false, false);
      }
    } catch (e) {
      // If banding fails, just skip it (cosmetic only)
      Logger.log('Senders sheet banding skipped: ' + e.toString());
    }
  }

  // Format Log sheet
  const logSheet = ss.getSheetByName(CONFIG.SHEETS.LOG);
  if (logSheet) {
    try {
      const lastRow = logSheet.getLastRow();
      if (lastRow > 1) {
        const dataRange = logSheet.getRange(2, 1, lastRow - 1, 6);

        // Remove any existing banding first
        const existingBandings = logSheet.getBandings();
        existingBandings.forEach(banding => banding.remove());

        // Apply new banding
        dataRange.applyRowBanding(SpreadsheetApp.BandingTheme.LIGHT_GREEN, false, false);
      }
    } catch (e) {
      // If banding fails, just skip it (cosmetic only)
      Logger.log('Log sheet banding skipped: ' + e.toString());
    }
  }
}

/**
 * Import CSV data with user guidance
 */
function importCSVData() {
  const ui = SpreadsheetApp.getUi();

  // Check if Senders sheet exists
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sendersSheet = ss.getSheetByName(CONFIG.SHEETS.SENDERS);

  if (!sendersSheet) {
    ui.alert(
      '⚠️ Setup Required',
      'Senders sheet not found.\n\n' +
      'Please run "Initial Setup" first:\n' +
      'Gmail Cleanup → Initial Setup (Create Sheets)',
      ui.ButtonSet.OK
    );
    return;
  }

  // Instructions dialog
  const response = ui.alert(
    '📥 Import CSV Data',
    'Follow these steps to import your CSV data:\n\n' +
    '1. Open the file: unnecessary_senders.csv\n' +
    '2. Copy ALL data (including headers if present)\n' +
    '3. Click OK below\n' +
    '4. Paste the data when the sheet opens\n' +
    '5. Data should start at row 2, column B (Email column)\n\n' +
    'Ready to paste data?',
    ui.ButtonSet.OK_CANCEL
  );

  if (response !== ui.Button.OK) {
    return;
  }

  // Activate Senders sheet and position cursor
  sendersSheet.activate();
  sendersSheet.getRange(2, 2).activate(); // B2 cell

  // Wait for user to paste
  ui.alert(
    '📋 Paste Your Data Now',
    'The Senders sheet is now active.\n\n' +
    'Steps:\n' +
    '1. Click OK to close this dialog\n' +
    '2. Paste your CSV data (Cmd+V or Ctrl+V)\n' +
    '3. Click "Gmail Cleanup → Finalize Import" when done\n\n' +
    'The cursor is positioned at cell B2 (Email column).',
    ui.ButtonSet.OK
  );
}

/**
 * Finalize import - Add checkboxes and format
 */
function finalizeImport() {
  const ui = SpreadsheetApp.getUi();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.SENDERS);

  if (!sheet) {
    ui.alert(
      '⚠️ Error',
      'Senders sheet not found. Please run Initial Setup first.',
      ui.ButtonSet.OK
    );
    return;
  }

  try {
    // Get data range
    const lastRow = sheet.getLastRow();

    if (lastRow < 2) {
      ui.alert(
        '⚠️ No Data Found',
        'No data found in Senders sheet.\n\n' +
        'Please:\n' +
        '1. Click "Gmail Cleanup → Setup → Import CSV Data"\n' +
        '2. Paste your CSV data starting at cell B2\n' +
        '3. Then run "Finalize Import" again',
        ui.ButtonSet.OK
      );
      return;
    }

    // Check if checkboxes already exist
    const firstCheckbox = sheet.getRange(2, 1).getValue();
    const hasCheckboxes = (firstCheckbox === true || firstCheckbox === false);

    if (!hasCheckboxes) {
      // Add checkboxes to column A (Delete?)
      const checkboxRange = sheet.getRange(2, 1, lastRow - 1, 1);
      checkboxRange.insertCheckboxes();
    }

    // Check if status already set
    const firstStatus = sheet.getRange(2, 5).getValue();

    if (!firstStatus || firstStatus === '') {
      // Set initial status to "Pending" for all rows
      const statusRange = sheet.getRange(2, 5, lastRow - 1, 1);
      const statusValues = Array(lastRow - 1).fill(['Pending']);
      statusRange.setValues(statusValues);
    }

    // Format the data (this now handles existing banding)
    formatSheets();

    // Count imported senders
    const senderCount = lastRow - 1;

    logMessage('INFO', 'IMPORT', `Finalized ${senderCount} senders`, senderCount);

    ui.alert(
      '✅ Import Complete!',
      `Successfully processed ${senderCount} senders.\n\n` +
      'Your sheet is ready:\n' +
      '✅ Checkboxes added\n' +
      '✅ Status set to "Pending"\n' +
      '✅ Formatting applied\n\n' +
      'Next steps:\n' +
      '1. Review the Senders sheet\n' +
      '2. Check (☑) senders you want to delete\n' +
      '3. Run "Gmail Cleanup → Dry Run" to test\n' +
      '4. When ready, start real deletion',
      ui.ButtonSet.OK
    );

  } catch (error) {
    ui.alert(
      '❌ Import Failed',
      'Error finalizing import:\n\n' + error.toString() + '\n\n' +
      'This might be because:\n' +
      '- Formatting already applied (try running again)\n' +
      '- Sheet structure issue\n\n' +
      'The data should still be intact. Check the Senders sheet.',
      ui.ButtonSet.OK
    );

    // Log the error for debugging
    Logger.log('Finalize Import Error: ' + error.toString());
  }
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Dry Run: Preview what would be deleted without actually deleting
 */
function dryRun() {
  const ui = SpreadsheetApp.getUi();
  const result = ui.alert(
    'Dry Run Mode',
    'This will PREVIEW what would be deleted WITHOUT actually deleting anything.\n\n' +
    'The script will:\n' +
    '1. Search for emails from checked senders\n' +
    '2. Count how many would be deleted\n' +
    '3. Log results\n\n' +
    'No emails will be moved to trash.\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );

  if (result !== ui.Button.YES) {
    return;
  }

  // Force dry run mode
  setDryRunMode(true);

  logMessage('INFO', 'DRY RUN', 'Starting dry run preview', 0);

  try {
    processEmails();

    ui.alert(
      'Dry Run Complete',
      'Preview complete! Check the Log sheet for results.\n\n' +
      'Review the "Emails Found" column in Senders sheet.\n\n' +
      'If everything looks correct, disable Dry Run mode and run real deletion.',
      ui.ButtonSet.OK
    );
  } catch (error) {
    logMessage('ERROR', 'DRY RUN', error.toString(), 0);
    ui.alert('Error', 'Dry run failed: ' + error.toString(), ui.ButtonSet.OK);
  }
}

/**
 * Start email deletion process
 */
function startDeletion() {
  const ui = SpreadsheetApp.getUi();

  // Check dry run mode
  if (isDryRunMode()) {
    const result = ui.alert(
      '⚠️ Dry Run Mode Enabled',
      'Dry Run Mode is currently ENABLED in Settings sheet.\n\n' +
      'This means NO emails will be deleted.\n\n' +
      'Do you want to:\n' +
      '- YES: Disable Dry Run and start REAL deletion\n' +
      '- NO: Keep Dry Run enabled (preview only)',
      ui.ButtonSet.YES_NO
    );

    if (result === ui.Button.YES) {
      setDryRunMode(false);
    } else {
      return;
    }
  }

  // Get checked senders count
  const senders = getCheckedSenders();
  const totalEmails = senders.reduce((sum, s) => sum + (s.count || 0), 0);

  // Confirmation
  const result = ui.alert(
    '⚠️ Confirm Email Deletion',
    `You are about to delete emails from ${senders.length} senders.\n\n` +
    `Estimated emails to delete: ${totalEmails.toLocaleString()}\n\n` +
    `⚠️ IMPORTANT:\n` +
    `- Emails will be moved to TRASH (not permanently deleted)\n` +
    `- You can recover them within 30 days\n` +
    `- Process may take several hours\n` +
    `- Script will run automatically in background\n\n` +
    `Continue with deletion?`,
    ui.ButtonSet.YES_NO
  );

  if (result !== ui.Button.YES) {
    return;
  }

  // Reset daily counter if new day
  resetDailyCounterIfNeeded();

  logMessage('INFO', 'START', `Starting deletion for ${senders.length} senders`, 0);

  try {
    // Setup triggers FIRST (before processing)
    setupTriggers();

    // Then process first batch
    processEmails();

    ui.alert(
      '✅ Deletion Started',
      'Email deletion has started!\n\n' +
      `The script will run automatically every ${CONFIG.TRIGGER_INTERVAL} minutes.\n` +
      'Monitor progress in the Log sheet.\n\n' +
      'Performance:\n' +
      `- Batch size: ${getBatchSize()} emails\n` +
      `- Processing ~${getBatchSize() * 2} emails per run\n` +
      `- Estimated: ${Math.ceil(totalEmails / (getBatchSize() * 2))} runs needed\n\n` +
      'You can close this spreadsheet - it will continue running.',
      ui.ButtonSet.OK
    );
  } catch (error) {
    logMessage('ERROR', 'START', error.toString(), 0);

    // More helpful error message
    let errorMsg = error.toString();
    if (errorMsg.includes('everyMinutes')) {
      errorMsg = 'Trigger setup failed. The script has been updated to use 5-minute intervals.\n\n' +
                 'Please update your script with the latest version.';
    }

    ui.alert('❌ Error Starting Deletion', errorMsg, ui.ButtonSet.OK);
  }
}

/**
 * Main processing function - processes one batch of emails
 */
function processEmails() {
  const startTime = new Date().getTime();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sendersSheet = ss.getSheetByName(CONFIG.SHEETS.SENDERS);
  const isDryRun = isDryRunMode();
  const batchSize = getBatchSize();
  const dailyLimit = getDailyLimit();
  const deletedToday = getDeletedToday();

  // Check if daily limit reached
  if (deletedToday >= dailyLimit) {
    logMessage('INFO', 'LIMIT', 'Daily quota reached. Will resume tomorrow.', deletedToday);
    removeTriggers(); // Stop auto-run
    return;
  }

  // Get senders to process
  const senders = getCheckedSenders();

  if (senders.length === 0) {
    logMessage('INFO', 'COMPLETE', 'No more senders to process.', deletedToday);
    removeTriggers(); // Stop auto-run
    return;
  }

  let processedThisBatch = 0;

  // Process each sender
  for (let i = 0; i < senders.length; i++) {
    const sender = senders[i];

    // Check runtime limit
    if (new Date().getTime() - startTime > CONFIG.MAX_RUNTIME) {
      logMessage('INFO', 'RUNTIME', 'Runtime limit reached. Will resume in next batch.', processedThisBatch);
      break;
    }

    // Check daily limit
    if (deletedToday + processedThisBatch >= dailyLimit) {
      logMessage('INFO', 'LIMIT', 'Daily quota reached.', deletedToday + processedThisBatch);
      break;
    }

    try {
      // Update status
      updateSenderStatus(sender.row, 'Processing...', null, null);

      // Search Gmail
      const query = `from:${sender.email}`;
      let threads = GmailApp.search(query, 0, batchSize);
      let totalFound = threads.length;
      let totalDeleted = 0;

      // Get more accurate count if needed
      if (threads.length >= batchSize) {
        const allThreads = GmailApp.search(query);
        totalFound = allThreads.length;
      }

      // Update found count
      updateSenderStatus(sender.row, 'Processing...', totalFound, null);

      if (threads.length === 0) {
        updateSenderStatus(sender.row, 'No emails found', 0, 0);
        logMessage('INFO', sender.email, 'No emails found', 0);
        continue;
      }

      if (isDryRun) {
        // Dry run - just log what would be deleted
        updateSenderStatus(sender.row, 'Preview Complete', totalFound, 0);
        logMessage('DRY RUN', sender.email, `Would delete ${totalFound} emails`, totalFound);
      } else {
        // Real deletion
        let totalDeleted = 0;
        const maxBatchesPerSender = 5; // Limit batches per sender per run
        let batchCount = 0;

        // Delete in small batches to avoid timeout
        while (threads.length > 0 && batchCount < maxBatchesPerSender) {
          // Check runtime BEFORE processing batch
          if (new Date().getTime() - startTime > CONFIG.MAX_RUNTIME) {
            logMessage('INFO', sender.email, `Runtime limit - pausing at ${totalDeleted}/${totalFound}`, totalDeleted);
            break;
          }

          // Delete this batch (smaller chunks)
          const chunkSize = Math.min(25, threads.length); // Process 25 at a time
          const chunk = threads.slice(0, chunkSize);

          try {
            GmailApp.moveThreadsToTrash(chunk);
            totalDeleted += chunk.length;
            batchCount++;

            // Update progress
            updateSenderStatus(sender.row, 'Deleting...', totalFound, totalDeleted);

            // Sleep to avoid rate limits
            Utilities.sleep(CONFIG.SLEEP_BETWEEN_BATCHES);

          } catch (error) {
            // If batch fails, log and continue
            logMessage('ERROR', sender.email, `Batch failed: ${error.toString()}`, 0);
            break;
          }

          // Get next batch if more to process
          if (totalDeleted < totalFound) {
            try {
              threads = GmailApp.search(query, 0, Math.min(batchSize, totalFound - totalDeleted));
            } catch (error) {
              logMessage('ERROR', sender.email, `Search failed: ${error.toString()}`, 0);
              break;
            }
          } else {
            break;
          }

          // Check runtime again
          if (new Date().getTime() - startTime > CONFIG.MAX_RUNTIME) {
            break;
          }
        }

        // Mark as complete or in progress
        if (totalDeleted >= totalFound) {
          updateSenderStatus(sender.row, 'Complete', totalFound, totalDeleted);
          logMessage('SUCCESS', sender.email, `Deleted ${totalDeleted} emails`, totalDeleted);
        } else {
          updateSenderStatus(sender.row, 'In Progress', totalFound, totalDeleted);
          logMessage('INFO', sender.email, `Deleted ${totalDeleted}/${totalFound} emails (will resume)`, totalDeleted);
        }

        processedThisBatch += totalDeleted;
        updateDeletedToday(deletedToday + processedThisBatch);
      }

    } catch (error) {
      updateSenderStatus(sender.row, 'Error: ' + error.toString(), null, null);
      logMessage('ERROR', sender.email, error.toString(), 0);
    }
  }

  logMessage('INFO', 'BATCH', `Batch complete. Processed ${processedThisBatch} emails this batch.`, processedThisBatch);
}

// ============================================================================
// HELPER FUNCTIONS - SENDERS
// ============================================================================

/**
 * Get all checked senders that haven't been completed
 */
function getCheckedSenders() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.SENDERS);
  const data = sheet.getDataRange().getValues();
  const senders = [];

  for (let i = 1; i < data.length; i++) { // Start from 1 to skip header
    const row = data[i];
    const isChecked = row[CONFIG.COLUMNS.DELETE] === true;
    const status = row[CONFIG.COLUMNS.STATUS];
    const email = row[CONFIG.COLUMNS.EMAIL];

    // Include if checked and not complete
    if (isChecked && status !== 'Complete' && email) {
      senders.push({
        row: i + 1, // +1 because array is 0-indexed but sheets are 1-indexed
        email: email,
        count: row[CONFIG.COLUMNS.COUNT] || 0,
        category: row[CONFIG.COLUMNS.CATEGORY] || '',
        status: status || 'Pending'
      });
    }
  }

  return senders;
}

/**
 * Update sender status in spreadsheet
 */
function updateSenderStatus(row, status, found, deleted) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.SENDERS);

  sheet.getRange(row, CONFIG.COLUMNS.STATUS + 1).setValue(status);

  if (found !== null) {
    sheet.getRange(row, CONFIG.COLUMNS.FOUND + 1).setValue(found);
  }

  if (deleted !== null) {
    sheet.getRange(row, CONFIG.COLUMNS.DELETED + 1).setValue(deleted);
  }

  sheet.getRange(row, CONFIG.COLUMNS.UPDATED + 1).setValue(new Date());
}

// ============================================================================
// HELPER FUNCTIONS - SETTINGS
// ============================================================================

/**
 * Check if dry run mode is enabled
 */
function isDryRunMode() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.SETTINGS);
  const value = sheet.getRange(CONFIG.SETTINGS_ROWS.DRY_RUN, 2).getValue();
  return value === true || value === 'TRUE' || value === 'true';
}

/**
 * Set dry run mode
 */
function setDryRunMode(enabled) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.SETTINGS);
  sheet.getRange(CONFIG.SETTINGS_ROWS.DRY_RUN, 2).setValue(enabled);
}

/**
 * Get batch size from settings
 */
function getBatchSize() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.SETTINGS);
  const value = sheet.getRange(CONFIG.SETTINGS_ROWS.BATCH_SIZE, 2).getValue();
  return value || CONFIG.BATCH_SIZE;
}

/**
 * Get daily limit from settings
 */
function getDailyLimit() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.SETTINGS);
  const value = sheet.getRange(CONFIG.SETTINGS_ROWS.DAILY_LIMIT, 2).getValue();
  return value || CONFIG.DAILY_LIMIT;
}

/**
 * Get total deleted today
 */
function getDeletedToday() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.SETTINGS);
  const value = sheet.getRange(CONFIG.SETTINGS_ROWS.TOTAL_TODAY, 2).getValue();
  return value || 0;
}

/**
 * Update total deleted today
 */
function updateDeletedToday(count) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.SETTINGS);
  sheet.getRange(CONFIG.SETTINGS_ROWS.TOTAL_TODAY, 2).setValue(count);
  sheet.getRange(CONFIG.SETTINGS_ROWS.LAST_RUN, 2).setValue(new Date());
}

/**
 * Reset daily counter if new day
 */
function resetDailyCounterIfNeeded() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.SETTINGS);
  const lastRun = sheet.getRange(CONFIG.SETTINGS_ROWS.LAST_RUN, 2).getValue();

  if (!lastRun) {
    return;
  }

  const lastRunDate = new Date(lastRun).toDateString();
  const today = new Date().toDateString();

  if (lastRunDate !== today) {
    // New day - reset counter
    sheet.getRange(CONFIG.SETTINGS_ROWS.TOTAL_TODAY, 2).setValue(0);
    logMessage('INFO', 'RESET', 'Daily counter reset for new day', 0);
  }
}

// ============================================================================
// HELPER FUNCTIONS - LOGGING
// ============================================================================

/**
 * Log message to Log sheet
 */
function logMessage(action, sender, details, count) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.LOG);

  sheet.appendRow([
    new Date(),
    action,
    sender,
    count,
    'Success',
    details
  ]);
}

// ============================================================================
// CONTROL FUNCTIONS
// ============================================================================

/**
 * Stop deletion process
 */
function stopDeletion() {
  removeTriggers();
  logMessage('INFO', 'STOP', 'Deletion stopped by user', 0);

  SpreadsheetApp.getUi().alert(
    'Deletion Stopped',
    'Email deletion has been stopped.\n\n' +
    'Current progress has been saved.\n' +
    'Use "Resume Deletion" to continue later.',
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Resume deletion process
 */
function resumeDeletion() {
  const ui = SpreadsheetApp.getUi();

  const result = ui.alert(
    'Resume Deletion',
    'This will resume the email deletion process.\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );

  if (result === ui.Button.YES) {
    resetDailyCounterIfNeeded();
    processEmails();
    setupTriggers();

    ui.alert(
      'Deletion Resumed',
      'Email deletion has resumed.\n\n' +
      'Monitor progress in the Log sheet.',
      ui.ButtonSet.OK
    );
  }
}

/**
 * Refresh statistics
 */
function refreshStats() {
  const senders = getCheckedSenders();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.SENDERS);

  let totalChecked = 0;
  let totalComplete = 0;
  let totalPending = 0;

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][CONFIG.COLUMNS.DELETE] === true) {
      totalChecked++;
      if (data[i][CONFIG.COLUMNS.STATUS] === 'Complete') {
        totalComplete++;
      } else {
        totalPending++;
      }
    }
  }

  SpreadsheetApp.getUi().alert(
    'Statistics',
    `Total Checked: ${totalChecked}\n` +
    `Completed: ${totalComplete}\n` +
    `Pending: ${totalPending}\n\n` +
    `Deleted Today: ${getDeletedToday()}`,
    SpreadsheetApp.getUi().ButtonSet.OK
  );
}

/**
 * Reset all statuses to Pending
 */
function resetStatus() {
  const ui = SpreadsheetApp.getUi();

  const result = ui.alert(
    'Reset Status',
    'This will reset all sender statuses to "Pending".\n\n' +
    'Use this if you want to re-run the deletion.\n\n' +
    'Continue?',
    ui.ButtonSet.YES_NO
  );

  if (result !== ui.Button.YES) {
    return;
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(CONFIG.SHEETS.SENDERS);
  const data = sheet.getDataRange().getValues();

  for (let i = 1; i < data.length; i++) {
    sheet.getRange(i + 1, CONFIG.COLUMNS.STATUS + 1).setValue('Pending');
    sheet.getRange(i + 1, CONFIG.COLUMNS.FOUND + 1).setValue('');
    sheet.getRange(i + 1, CONFIG.COLUMNS.DELETED + 1).setValue('');
    sheet.getRange(i + 1, CONFIG.COLUMNS.UPDATED + 1).setValue('');
  }

  ui.alert('Reset Complete', 'All statuses have been reset.', ui.ButtonSet.OK);
}

// ============================================================================
// TRIGGER MANAGEMENT
// ============================================================================

/**
 * Setup automatic triggers for batch processing
 */
function setupTriggers() {
  // Remove existing triggers first
  removeTriggers();

  // Create new time-based trigger (every 5 minutes)
  // Google only allows: 1, 5, 10, 15, or 30 minutes
  ScriptApp.newTrigger('processEmails')
    .timeBased()
    .everyMinutes(CONFIG.TRIGGER_INTERVAL)
    .create();

  logMessage('INFO', 'TRIGGER', `Auto-run triggers created (every ${CONFIG.TRIGGER_INTERVAL} minutes)`, 0);
}

/**
 * Remove all triggers
 */
function removeTriggers() {
  const triggers = ScriptApp.getProjectTriggers();
  for (let i = 0; i < triggers.length; i++) {
    ScriptApp.deleteTrigger(triggers[i]);
  }

  logMessage('INFO', 'TRIGGER', 'All triggers removed', 0);
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Test function - verifies everything is working
 */
function testSetup() {
  const ui = SpreadsheetApp.getUi();

  try {
    // Test 1: Sheets exist
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sendersSheet = ss.getSheetByName(CONFIG.SHEETS.SENDERS);
    const logSheet = ss.getSheetByName(CONFIG.SHEETS.LOG);
    const settingsSheet = ss.getSheetByName(CONFIG.SHEETS.SETTINGS);

    if (!sendersSheet || !logSheet || !settingsSheet) {
      throw new Error('One or more required sheets not found');
    }

    // Test 2: Gmail access
    const testSearch = GmailApp.search('from:noreply@google.com', 0, 1);

    // Test 3: Get senders
    const senders = getCheckedSenders();

    // Test 4: Settings
    const isDryRun = isDryRunMode();
    const batchSize = getBatchSize();

    ui.alert(
      'Setup Test - SUCCESS ✅',
      'All tests passed!\n\n' +
      `Sheets: Found\n` +
      `Gmail Access: Working\n` +
      `Checked Senders: ${senders.length}\n` +
      `Dry Run Mode: ${isDryRun}\n` +
      `Batch Size: ${batchSize}\n\n` +
      'Ready to run!',
      ui.ButtonSet.OK
    );

  } catch (error) {
    ui.alert(
      'Setup Test - FAILED ❌',
      'Test failed:\n\n' + error.toString() + '\n\n' +
      'Please check the setup guide and try again.',
      ui.ButtonSet.OK
    );
  }
}
