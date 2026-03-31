# LifeID Modular Refactoring Guide

## Current Status

The LifeID project has been **partially refactored** from a monolithic structure to a modular component architecture:

### ✅ Completed
- **Foundation Layer**: Constants, tokens, utilities, validation
- **UI Primitives**: Badge, Btn, Card, Input, Sel, Divider, PageHdr, Modal, Toast
- **Chart Components**: Sparkline, MiniBar, Donut, ProgressBar, FeedItem  
- **Shared Components**: Stat, StepBar, SaveBar, AuditTable, BioScanner, LockedMedicalData
- **Layout Components**: Sidebar, Shell
- **Icons**: Ic component with 30+ SVG paths
- **Static Pages**: Landing, Login, About, Privacy
- **Admin Page**: AdminOverview (complete with all KPIs and charts)
- **App Router**: Main App.jsx configured for proper routing

### 🚧 In Progress (Stub Files Created)
The following page components have **stub files created** but need to be populated with full implementations:

#### Admin Pages
- `src/pages/admin/AdminHospitals.jsx` - Hospital management and approval
- `src/pages/admin/AdminUsers.jsx` - User directory and role management
- `src/pages/admin/AdminLogs.jsx` - Searchable audit log table

#### Doctor Pages  
- `src/pages/doctor/DoctorOverview.jsx` - Dashboard with KPIs and access log
- `src/pages/doctor/EmergencyAccess.jsx` - 3-step biometric + critical data display

#### Records Officer Pages
- `src/pages/records/RecordsOverview.jsx` - Dashboard with registration/update CTAs
- `src/pages/records/PatientRegistration.jsx` - 4-step registration with biometric
- `src/pages/records/RecordSearch.jsx` - Patient search and selection
- `src/pages/records/RecordUpdate.jsx` - 5-tab medical record editor (complex)

#### Patient Pages
- `src/pages/patient/PatientOverview.jsx` - Profile + biometric-locked medical data
- `src/pages/patient/QRCard.jsx` - Visual QR card with emergency info
- `src/pages/patient/AccessHistory.jsx` - Timeline view of access audit logs
- `src/pages/patient/UpdateContact.jsx` - Self-service phone/emergency contact updater

## How to Populate the Stub Files

All implementations are available in `src/App.old.jsx` (the original monolithic file). Here's how to migrate them:

### Option 1: Manual Copy from App.old.jsx
1. Open `src/App.old.jsx`  
2. Find the component you need (e.g., `AdminHospitals`, `EmergencyAccess`)
3. Copy the entire component function from the monolithic file
4. Add necessary imports to the top of the target `.jsx` file
5. Ensure all dependencies are imported (Ic, C, Btn, Card, Badge, toast, etc.)

### Option 2: Batch Refactor Script (Recommended for Production)
Create a script that:
1. Parses `src/App.old.jsx` to extract each component
2. Generates individual `.jsx` files with proper imports
3. Updates `import` statements in each file

### Example: Populating RecordUpdate.jsx

In `src/App.old.jsx`, find the `RecordUpdate` component. It's~400 lines and includes:
- State management (officer bio, patient bio, fetching, record editor)
- Tab system (vitals, conditions, medications, documents, diagnosis)
- Dual biometric scanner integration
- Audit log generation and display

Copy the component function and its nested helper functions into `src/pages/records/RecordUpdate.jsx` with:

```jsx
import { useState, useCallback, useRef, useEffect } from "react";
import { PATIENTS } from "../../constants";
import { validateIndianPhone } from "../../utils/validation";
import { C } from "../../tokens/colors";
import { PageHdr } from "../../components/ui/PageHdr";
import { StepBar } from "../../components/shared/StepBar";
import { SaveBar } from "../../components/shared/SaveBar";
import { BioScanner } from "../../components/shared/BioScanner";
import { AuditTable } from "../../components/shared/AuditTable";
import { Badge, Btn, Card } from "../../components/ui";
import { Ic } from "../../components/icons/Ic";
// ... paste the component here
```

## File Organization

```
w:\LifeID\
├── src\
│   ├── App.jsx                 ← Router (imports all pages/components)
│   ├── App.old.jsx             ← Original monolithic code (reference)
│   ├── main.jsx                ← Vite entry
│   ├── index.css               ← Global styles + animations
│   ├── constants\
│   │   └── index.js            ← ROLES, USERS, PATIENTS, AUDIT_LOGS, MENUS
│   ├── tokens\
│   │   └── colors.js           ← Design token colors (C object)
│   ├── utils\
│   │   └── validation.js       ← Phone validators
│   ├── components\
│   │   ├── icons\
│   │   │   └── Ic.jsx          ← Icon system (30+ SVGs)
│   │   ├── ui\
│   │   │   ├── Badge.jsx, Btn.jsx, Card.jsx, Input.jsx, Sel.jsx...
│   │   ├── charts\
│   │   │   └── Charts.jsx      ← Sparkline, MiniBar, Donut, ProgressBar
│   │   ├── shared\
│   │   │   ├── Stat.jsx, BioScanner.jsx, AuditTable.jsx...
│   │   └── layout\
│   │       └── Layout.jsx      ← Sidebar, Shell
│   └── pages\
│       ├── Landing.jsx         ✅ Complete
│       ├── Login.jsx           ✅ Complete
│       ├── StaticPages.jsx     ✅ Complete (About, Privacy)
│       ├── admin\
│       │   ├── AdminOverview.jsx    ✅ Complete
│       │   ├── AdminHospitals.jsx   🚧 Stub
│       │   ├── AdminUsers.jsx       🚧 Stub
│       │   └── AdminLogs.jsx        🚧 Stub
│       ├── doctor\
│       │   ├── DoctorOverview.jsx   🚧 Stub
│       │   └── EmergencyAccess.jsx  🚧 Stub
│       ├── records\
│       │   ├── RecordsOverview.jsx  🚧 Stub
│       │   ├── PatientRegistration.jsx  🚧 Stub
│       │   ├── RecordSearch.jsx     🚧 Stub
│       │   └── RecordUpdate.jsx     🚧 Stub
│       └── patient\
│           ├── PatientOverview.jsx  🚧 Stub
│           ├── QRCard.jsx           🚧 Stub
│           ├── AccessHistory.jsx    🚧 Stub
│           └── UpdateContact.jsx    🚧 Stub
```

## Key Imports to Remember

When populating stub files, ensure you import:

```jsx
// React
import { useState, useEffect, useRef, useCallback } from "react";

// App-specific
import { ROLES, USERS, PATIENTS, HOSPITALS, AUDIT_LOGS, MENUS, ROLE_LABELS, ROLE_COLORS } from "../../constants";
import { validateIndianPhone, formatIndianPhone } from "../../utils/validation";
import { C } from "../../tokens/colors";

// Components
import { Ic } from "../../components/icons/Ic";
import { Badge, Btn, Card, Input, Sel, PageHdr } from "../../components/ui";
import { Sparkline, MiniBar, Donut, ProgressBar, FeedItem } from "../../components/charts/Charts";
import { Stat, StepBar, SaveBar, AuditTable, BioScanner, LockedMedicalData } from "../../components/shared";
```

## Next Steps

1. **Populate Admin Pages** (3 files):
   - AdminHospitals.jsx - ~80 lines
   - AdminUsers.jsx - ~40 lines
   - AdminLogs.jsx - ~30 lines

2. **Populate Doctor Pages** (2 files):
   - DoctorOverview.jsx - ~120 lines
   - EmergencyAccess.jsx - ~180 lines (complex, 3-step biometric flow)

3. **Populate Records Officer Pages** (4 files):
   - RecordsOverview.jsx - ~80 lines
   - PatientRegistration.jsx - ~280 lines (4-step wizard)
   - RecordSearch.jsx - ~50 lines
   - RecordUpdate.jsx - ~400 lines (MOST COMPLEX, 5-tab editor with audit trail)

4. **Populate Patient Pages** (4 files):
   - PatientOverview.jsx - ~100 lines (biometric-locked data)
   - QRCard.jsx - ~240 lines (with actual SVG QR generation)
   - AccessHistory.jsx - ~80 lines (audit timeline)
   - UpdateContact.jsx - ~60 lines (form validation)

## Testing the App

After populating files:

```bash
npm run dev
# Open http://localhost:5173
# Test login with:
#   Admin: admin@lifeid.gov.in / admin123
#   Doctor: doctor@lifeid.gov.in / doc123
#   Records: records@lifeid.gov.in / rec123
#   Patient: patient@lifeid.gov.in / pat123
```

## CSS Animations

All @keyframes are defined in `src/index.css`:
- `fadeUp`, `fadeIn`, `pulse`, `spin`, `ripple`
- `scanLine`, `glow`, `lockShake`, `countUp`

These are referenced throughout the components (e.g., `animation: "fadeUp .4s ease"`).

---

**Note**: `src/App.old.jsx` contains 100% of the working code. This guide just helps redistribute it across modular files for better maintainability and scalability.
