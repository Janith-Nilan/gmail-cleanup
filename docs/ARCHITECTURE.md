# Architecture Documentation

Technical architecture and design documentation for Gmail Cleanup tool.

---

## Table of Contents

- [System Overview](#system-overview)
- [Component Architecture](#component-architecture)
- [Data Flow](#data-flow)
- [Core Functions](#core-functions)
- [State Management](#state-management)
- [Error Handling](#error-handling)
- [Performance Optimization](#performance-optimization)
- [API Integration](#api-integration)

---

## System Overview

### High-Level Architecture

```mermaid
graph TB
    subgraph "User Interface"
        A[Google Sheets UI]
        B[Custom Menu]
    end
    
    subgraph "Application Layer"
        C[Apps Script Runtime]
        D[Menu Functions]
        E[Core Processing]
        F[Helper Functions]
    end
    
    subgraph "Data Layer"
        G[Senders Sheet]
        H[Log Sheet]
        I[Settings Sheet]
    end
    
    subgraph "External APIs"
        J[Gmail API]
        K[Trigger API]
    end
    
    A --> B
    B --> D
    D --> E
    E --> F
    F --> G
    F --> H
    F --> I
    E --> J
    E --> K
    
    style A fill:#4285f4,color:#fff
    style C fill:#34a853,color:#fff
    style J fill:#ea4335,color:#fff
```

### Technology Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **Frontend** | Google Sheets | User interface |
| **Backend** | Google Apps Script | Business logic |
| **Storage** | Google Sheets | Data persistence |
| **Email API** | Gmail API | Email operations |
| **Scheduling** | Apps Script Triggers | Automation |

---

## Component Architecture

### 1. User Interface Layer

```mermaid
graph LR
    A[Google Sheets] --> B[Custom Menu]
    B --> C[Setup Menu]
    B --> D[Control Menu]
    B --> E[Status Menu]
    
    C --> C1[Initial Setup]
    C --> C2[Import Data]
    C --> C3[Test Setup]
    
    D --> D1[Start Deletion]
    D --> D2[Stop Deletion]
    D --> D3[Resume]
    
    E --> E1[Refresh Stats]
    E --> E2[Reset Status]
```

**Components:**

- **Custom Menu**: User-facing actions
- **Senders Sheet**: Interactive data grid
- **Log Sheet**: Real-time activity log
- **Settings Sheet**: Configuration interface

### 2. Application Layer

```mermaid
graph TD
    A[Menu Layer] --> B[Business Logic Layer]
    B --> C[Data Access Layer]
    B --> D[Gmail Integration Layer]
    B --> E[Trigger Management Layer]
    
    B --> F{Core Functions}
    F --> F1[processEmails]
    F --> F2[startDeletion]
    F --> F3[dryRun]
    
    C --> G{Helper Functions}
    G --> G1[getCheckedSenders]
    G --> G2[updateSenderStatus]
    G --> G3[logMessage]
    
    D --> H{Gmail Operations}
    H --> H1[Search Emails]
    H --> H2[Move to Trash]
    H --> H3[Batch Processing]
```

**Layers:**

1. **Menu Layer**: User-triggered functions
2. **Business Logic**: Core processing logic
3. **Data Access**: Sheet read/write operations
4. **Gmail Integration**: API calls
5. **Trigger Management**: Automation

### 3. Data Layer

```mermaid
erDiagram
    SENDERS {
        boolean Delete
        string Email
        number Count
        string Category
        string Status
        number EmailsFound
        number Deleted
        datetime LastUpdated
    }
    
    LOG {
        datetime Timestamp
        string Action
        string Sender
        number Count
        string Status
        string Details
    }
    
    SETTINGS {
        string Setting
        variant Value
    }
    
    SENDERS ||--o{ LOG : "generates"
    SETTINGS ||--|| SENDERS : "configures"
```

**Sheets:**

- **Senders**: Master deletion list
- **Log**: Activity audit trail
- **Settings**: Runtime configuration

---

## Data Flow

### Complete Deletion Flow

```mermaid
sequenceDiagram
    participant U as User
    participant M as Menu
    participant P as ProcessEmails
    participant G as Gmail API
    participant S as Sheets
    participant T as Triggers
    
    U->>M: Start Deletion
    M->>S: Read Settings
    S-->>M: Dry Run = FALSE
    M->>U: Confirm?
    U->>M: Yes
    
    M->>T: Setup Triggers
    T-->>M: Triggers Created
    
    M->>P: Start Processing
    
    loop For Each Sender
        P->>S: Get Next Sender
        S-->>P: Sender Data
        
        P->>S: Update Status: Processing
        
        P->>G: Search Emails
        G-->>P: Thread List
        
        P->>G: Move to Trash
        G-->>P: Success
        
        P->>S: Update Status: Complete
        P->>S: Log Activity
    end
    
    P->>S: Save Progress
    P->>U: Show Results
    
    Note over T,P: Trigger fires every 5 min
    T->>P: Auto-run
```

### State Transitions

```mermaid
stateDiagram-v2
    [*] --> Pending: Import Complete
    
    Pending --> Processing: Checked & Started
    Processing --> InProgress: Timeout/Partial
    Processing --> Complete: All Deleted
    Processing --> Error: Exception
    
    InProgress --> Processing: Resume
    InProgress --> Pending: Reset
    
    Complete --> Pending: Reset
    Error --> Pending: Reset
    Error --> Processing: Retry
    
    Complete --> [*]
```

**States:**

- **Pending**: Initial state, not started
- **Processing**: Currently deleting emails
- **InProgress**: Partially complete, will resume
- **Complete**: All emails deleted
- **Error**: Exception occurred
- **No emails found**: Sender has no emails

---

## Core Functions

### Function Hierarchy

```mermaid
graph TD
    A[onOpen] --> B[setupMenu]
    
    C[Menu Functions] --> D[startDeletion]
    C --> E[dryRun]
    C --> F[stopDeletion]
    C --> G[resumeDeletion]
    
    D --> H[processEmails]
    E --> H
    G --> H
    
    H --> I[getCheckedSenders]
    H --> J[updateSenderStatus]
    H --> K[logMessage]
    H --> L[GmailApp.search]
    H --> M[GmailApp.moveThreadsToTrash]
    
    D --> N[setupTriggers]
    F --> O[removeTriggers]
    
    style H fill:#34a853,color:#fff
```

### Key Functions

#### 1. processEmails()

**Purpose**: Main processing loop

**Pseudocode:**
```javascript
function processEmails() {
  // Check daily quota
  if (quotaReached) return;
  
  // Get pending senders
  senders = getCheckedSenders();
  if (senders.length == 0) {
    removeTriggers();
    return;
  }
  
  // Process each sender
  for each sender {
    // Check runtime limit
    if (timeoutReached) break;
    
    // Search Gmail
    threads = GmailApp.search(query);
    
    // Delete (if not dry run)
    if (!isDryRun) {
      GmailApp.moveThreadsToTrash(threads);
    }
    
    // Update status
    updateSenderStatus(sender, status);
    logMessage(action, sender, count);
  }
  
  // Save progress
  updateDeletedToday(count);
}
```

**Key Features:**
- ⏰ Runtime limit checking
- 📊 Quota management
- 🔄 Resume capability
- 📝 Progress tracking

#### 2. startDeletion()

**Purpose**: Initialize deletion process

**Workflow:**
```mermaid
graph TD
    A[startDeletion] --> B{Dry Run?}
    B -->|Yes| C[Ask to Disable]
    C -->|No| Z[Exit]
    C -->|Yes| D[Set FALSE]
    B -->|No| D
    
    D --> E[Get Sender Count]
    E --> F[Show Confirmation]
    F -->|No| Z
    F -->|Yes| G[Reset Daily Counter]
    
    G --> H[Setup Triggers]
    H --> I[Process First Batch]
    I --> J[Show Success Message]
    
    style I fill:#34a853,color:#fff
```

#### 3. setupTriggers()

**Purpose**: Create automated execution schedule

**Implementation:**
```javascript
function setupTriggers() {
  // Remove existing
  removeTriggers();
  
  // Create new trigger
  ScriptApp.newTrigger('processEmails')
    .timeBased()
    .everyMinutes(5)  // Google limit: 1,5,10,15,30
    .create();
}
```

---

## State Management

### Configuration State

Stored in **Settings** sheet:

```javascript
const CONFIG = {
  SHEETS: {
    SENDERS: 'Senders',
    LOG: 'Log',
    SETTINGS: 'Settings'
  },
  COLUMNS: {
    DELETE: 0,    // A
    EMAIL: 1,     // B
    COUNT: 2,     // C
    CATEGORY: 3,  // D
    STATUS: 4,    // E
    FOUND: 5,     // F
    DELETED: 6,   // G
    UPDATED: 7    // H
  },
  SETTINGS_ROWS: {
    DRY_RUN: 2,
    BATCH_SIZE: 3,
    DAILY_LIMIT: 4,
    TOTAL_TODAY: 5,
    LAST_RUN: 6
  },
  BATCH_SIZE: 50,
  DAILY_LIMIT: 18000,
  MAX_RUNTIME: 240000,  // 4 min
  SLEEP_BETWEEN_BATCHES: 2000,  // 2 sec
  TRIGGER_INTERVAL: 5  // min
};
```

### Runtime State

Tracked in sheets:

```javascript
// Sender State
{
  row: 2,
  email: "sender@example.com",
  count: 1250,
  status: "Processing",
  found: 1248,
  deleted: 625
}

// Session State
{
  dryRun: false,
  batchSize: 50,
  dailyLimit: 18000,
  deletedToday: 1234,
  lastRun: new Date()
}
```

---

## Error Handling

### Error Strategy

```mermaid
graph TD
    A[Function Call] --> B{Try}
    B --> C[Execute]
    C --> D{Success?}
    D -->|Yes| E[Return Result]
    D -->|No| F[Catch Error]
    
    F --> G[Log Error]
    G --> H{Retryable?}
    H -->|Yes| I[Mark InProgress]
    H -->|No| J[Mark Error]
    
    I --> K[Will Retry Next Run]
    J --> L[User Action Needed]
    
    style G fill:#ea4335,color:#fff
```

### Error Categories

| Category | Action | Example |
|----------|--------|---------|
| **Transient** | Retry | API timeout |
| **Quota** | Pause | Daily limit |
| **Permission** | Alert user | Auth expired |
| **Data** | Skip | Invalid email |
| **System** | Log & continue | Sheet error |

### Implementation

```javascript
try {
  // Risky operation
  GmailApp.moveThreadsToTrash(threads);
  
} catch (error) {
  // Log for debugging
  logMessage('ERROR', sender, error.toString(), 0);
  
  // Update status
  updateSenderStatus(row, 'Error: ' + error.message);
  
  // Continue processing next sender
  continue;
}
```

---

## Performance Optimization

### Batch Processing Strategy

```mermaid
graph LR
    A[Large Dataset] --> B[Split into Batches]
    B --> C[Batch 1: 50 emails]
    B --> D[Batch 2: 50 emails]
    B --> E[Batch 3: 50 emails]
    
    C --> F[Process]
    D --> F
    E --> F
    
    F --> G[Sleep 2s]
    G --> H[Next Batch]
    
    style F fill:#34a853,color:#fff
```

### Optimization Techniques

#### 1. Runtime Management

```javascript
const MAX_RUNTIME = 240000;  // 4 min (leave 2 min buffer)
const startTime = new Date().getTime();

while (hasSenders && !timeoutReached) {
  // Process batch
  
  // Check time
  if (new Date().getTime() - startTime > MAX_RUNTIME) {
    break;  // Will resume on next trigger
  }
}
```

#### 2. Quota Management

```javascript
// Daily quota tracking
const DAILY_LIMIT = 18000;
let deletedToday = getDeletedToday();

if (deletedToday >= DAILY_LIMIT) {
  logMessage('INFO', 'LIMIT', 'Daily quota reached');
  removeTriggers();  // Stop until tomorrow
  return;
}
```

#### 3. API Call Optimization

```javascript
// Batch API calls
const threads = GmailApp.search(query, 0, BATCH_SIZE);

// Single move operation (not per-thread)
GmailApp.moveThreadsToTrash(threads);

// Sleep between batches
Utilities.sleep(SLEEP_BETWEEN_BATCHES);
```

### Performance Metrics

| Metric | Value | Notes |
|--------|-------|-------|
| **Batch Size** | 50 emails | Optimal for stability |
| **Processing Rate** | 33 emails/min | With 2s sleep |
| **Max per execution** | ~100 emails | 4 min runtime |
| **Executions/hour** | 12 | Every 5 minutes |
| **Throughput/hour** | ~1,200 emails | Automated |
| **Daily capacity** | 18,000 emails | Gmail limit |

---

## API Integration

### Gmail API Usage

```mermaid
graph TD
    A[Apps Script] --> B[GmailApp]
    B --> C[search]
    B --> D[moveThreadsToTrash]
    
    C --> E[Gmail API]
    D --> E
    
    E --> F{Quota Check}
    F -->|OK| G[Execute]
    F -->|Exceeded| H[Error]
    
    G --> I[Return Result]
    
    style E fill:#ea4335,color:#fff
```

### API Methods Used

| Method | Purpose | Quota Impact |
|--------|---------|--------------|
| `GmailApp.search()` | Find emails | 1 call |
| `GmailApp.moveThreadsToTrash()` | Delete batch | 1 call per batch |
| `SpreadsheetApp.*` | Sheet operations | Minimal |
| `ScriptApp.newTrigger()` | Create triggers | 1 per setup |

### Quota Limits

**Gmail API (per day):**
- 20,000 emails can be deleted
- Unlimited searches (within reason)

**Apps Script (per day):**
- 6 minutes per execution
- 90 minutes total runtime
- 20,000 UrlFetch calls
- Unlimited sheet operations

**Trigger Limits:**
- 20 concurrent triggers
- 90 triggers per day

---

## Security Considerations

### Authorization Scopes

Required OAuth scopes:
```
https://www.googleapis.com/auth/gmail.modify
https://www.googleapis.com/auth/spreadsheets
https://www.googleapis.com/auth/script.scriptapp
```

### Data Privacy

- ✅ All data stays in user's Google account
- ✅ No external API calls
- ✅ No data sent to third parties
- ✅ Script runs under user's permissions

### Best Practices

1. **Least Privilege**: Only request needed scopes
2. **Dry Run**: Test before deletion
3. **Audit Log**: Track all actions
4. **Reversible**: Use trash, not permanent delete
5. **User Confirmation**: Require explicit approval

---

## Scalability

### Current Limits

```mermaid
graph LR
    A[1,000 emails] --> B[~30 min]
    C[10,000 emails] --> D[~5 hours]
    E[50,000 emails] --> F[~2.5 days]
    G[100,000 emails] --> H[~5.5 days]
    
    style D fill:#34a853,color:#fff
    style F fill:#fbbc04,color:#000
```

### Scaling Strategies

**Current:**
- Single-threaded processing
- Sequential sender processing
- Automatic resume on timeout

**Potential Improvements:**
- Parallel sender processing (if Google allows)
- Adaptive batch sizing
- Predictive scheduling
- Multi-account support

---

## Testing Architecture

### Test Levels

```mermaid
graph TD
    A[Testing] --> B[Unit Tests]
    A --> C[Integration Tests]
    A --> D[E2E Tests]
    
    B --> B1[Helper Functions]
    B --> B2[Data Access]
    B --> B3[Config]
    
    C --> C1[Gmail API]
    C --> C2[Sheet Operations]
    C --> C3[Triggers]
    
    D --> D1[Full Deletion Flow]
    D --> D2[Dry Run Flow]
    D --> D3[Error Recovery]
```

### Manual Testing

See [Testing Guide](TESTING.md) for:
- Setup validation
- Dry run testing
- Small batch testing
- Error scenario testing

---

## Future Architecture

### Roadmap Considerations

1. **Multi-Label Support**
   - Search within specific labels
   - Selective deletion by folder

2. **Advanced Filters**
   - Date ranges
   - Subject patterns
   - Attachment filters

3. **Statistics Dashboard**
   - Visual progress charts
   - Deletion history
   - Storage savings

4. **Export Feature**
   - Backup before delete
   - Archive to Drive
   - CSV export of logs

---

## References

- [Google Apps Script Documentation](https://developers.google.com/apps-script)
- [Gmail API Reference](https://developers.google.com/gmail/api)
- [Apps Script Best Practices](https://developers.google.com/apps-script/guides/services/best-practices)

---

<p align="center">
<a href="../README.md">← Back to README</a> •
<a href="INSTALLATION.md">Installation Guide</a> •
<a href="USAGE.md">Usage Guide</a>
</p>
