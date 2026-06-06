# LifeID Integration Guide

## Project Overview

LifeID is a professional biometric healthcare identity system with AI-powered clinical decision support. The project is fully integrated with:
- **Frontend**: React 18 + Vite with modular component architecture
- **Backend**: Express.js with REST API routes and comprehensive middleware

## Directory Structure

```
LifeID/
├── frontend/
│   ├── src/
│   │   ├── App.jsx                          # Main application with routing for 4 roles
│   │   ├── main.jsx                         # Vite entry point
│   │   ├── index.html                       # HTML template
│   │   ├── components/
│   │   │   ├── Pages/
│   │   │   │   ├── Admin/index.jsx          # 4 admin pages (Overview, Hospitals, Users, Logs)
│   │   │   │   ├── Doctor/index.jsx         # 2 doctor pages (Overview, Emergency Access)
│   │   │   │   ├── Patient/index.jsx        # 5 patient pages (Profile, Records, QR, History, Contact)
│   │   │   │   └── Records/index.jsx        # 4 records officer pages
│   │   │   ├── Biometric/Scanner.jsx        # Fingerprint scanner with animation
│   │   │   ├── RiskAnalysis/Alerts.jsx      # Risk alert display components
│   │   │   ├── Layout/Header.jsx            # Page header component
│   │   │   └── UI/                          # Reusable UI components (5 files)
│   │   ├── services/
│   │   │   └── riskAnalysis.js              # AI risk analysis engine
│   │   ├── utils/
│   │   │   ├── styles.js                    # Colors, roles, menu configs
│   │   │   ├── icons.jsx                    # SVG icon system (25+ icons)
│   │   │   ├── validators.js                # Form validation (Indian context)
│   │   │   └── mockData.js                  # Test users, patients, hospitals
│   │   └── styles/globals.css               # Global CSS with animations
│   ├── package.json
│   ├── .env                                 # Environment variables
│   └── vite.config.js
│
└── backend/
    ├── src/
    │   ├── server.js                        # Express entry point with middleware stack
    │   ├── api/
    │   │   ├── routes/
    │   │   │   ├── auth.js                  # Login, profile, token refresh (5 endpoints)
    │   │   │   ├── patients.js              # Patient CRUD & medical records (6 endpoints)
    │   │   │   ├── risk.js                  # Drug safety analysis (3 endpoints)
    │   │   │   └── audit.js                 # Access logging & statistics (6 endpoints)
    │   │   └── middleware/
    │   │       ├── auth.js                  # JWT verification & role authorization
    │   │       └── index.js                 # Utility middleware (logging, CORS, rate limiting)
    │   ├── services/
    │   │   ├── auth.js                      # Authentication service
    │   │   ├── biometric.js                 # Biometric verification
    │   │   ├── audit.js                     # Audit logging service
    │   │   └── riskAnalysis.js              # Risk analysis logic
    │   ├── models/
    │   │   ├── User.js                      # User schema
    │   │   ├── Patient.js                   # Patient schema
    │   │   ├── MedicalRecord.js             # Medical record schema
    │   │   └── AuditLog.js                  # Audit log schema
    │   ├── utils/
    │   │   ├── jwt.js                       # Token generation & verification
    │   │   └── helpers.js                   # Request/response formatters
    │   └── config/
    │       └── index.js                     # Configuration constants
    ├── package.json
    ├── .env                                 # Environment variables
    └── .gitignore

```

## Integration Points

### 1. Frontend-Backend Communication

**Base URL**: `http://localhost:3001/api`

**API Endpoints**:

```javascript
// Authentication
POST   /api/auth/login              # Login with credentials, returns JWT
GET    /api/auth/profile            # Get current user profile
POST   /api/auth/refresh            # Refresh authentication token

// Patient Management
GET    /api/patients/:lifeId         # Fetch patient by LifeID
POST   /api/patients                # Register new patient
PUT    /api/patients/:id            # Update patient info
GET    /api/patients/:id/medical-records   # Fetch medical records
POST   /api/patients/:id/medications      # Add medication to patient

// Risk Analysis
POST   /api/risk/analyze            # Analyze drug safety for patient
GET    /api/risk/check-patient/:patientId   # Get patient risk profile
POST   /api/risk/validate-medication        # Validate medication

// Audit Logging
GET    /api/audit/logs              # Fetch paginated audit logs
GET    /api/audit/logs/patient/:lifeId     # Filter logs by patient
GET    /api/audit/logs/user/:userId        # Filter logs by user (admin only)
POST   /api/audit/log               # Create audit entry
GET    /api/audit/export            # Export logs (JSON/CSV)
GET    /api/audit/stats             # Get audit statistics
```

### 2. Authentication Flow

```
1. User enters credentials on Login page
2. Frontend sends POST /api/auth/login with email & password
3. Backend validates against USERS mock database
4. Backend returns JWT token (24h expiry)
5. Frontend stores JWT in state
6. Subsequent requests include Authorization header: "Bearer {token}"
7. Middleware verifies token on protected routes
8. User redirected to role-specific dashboard
```

### 3. Role-Based Pages

**Admin Dashboard**:
- Overview: System statistics, user count, audit summary
- Hospitals: Hospital management interface
- Users: User account management
- Audit Logs: Complete access history

**Doctor Dashboard**:
- Overview: Patient list, alerts, medical statistics
- Emergency Access: Override access with biometric + audit trail

**Records Officer Dashboard**:
- Overview: Processing queue
- Register Patient: New patient registration form
- Search: Patient record lookup
- Update: Modify patient information

**Patient Dashboard**:
- Profile: Personal information, display preferences
- Medical Records: Biometric-protected health data
- QR Card: Generate portable QR code
- Access History: Audit trail of who accessed records
- Contact Update: Change phone/email

### 4. Component Integration

**App.jsx handles**:
- Route management (Landing → Login → Dashboard)
- User state management
- Page sub-navigation (e.g., Admin Overview → Admin Hospitals)
- Toast notifications

**Page Components import**:
- UI utilities from `utils/styles.js` (colors, role defs)
- Icon system from `utils/icons.jsx` (25+ SVG icons)
- Mock data from `utils/mockData.js` (test credentials)
- Validators from `utils/validators.js` (form validation)

### 5. Authentication & Authorization

**Middleware Stack**:
1. `authMiddleware`: Verifies JWT from Authorization header
2. `roleMiddleware`: Checks user role against allowed array
3. `validateInput`: Validates request body fields
4. `auditLogger`: Logs all API calls to audit trail
5. `corsMiddleware`: Handles cross-origin requests
6. `rateLimitMiddleware`: Prevents abuse (configurable limits)
7. `requireBiometric`: Enforces biometric verification for sensitive operations
8. `errorHandler`: Catches and formats all errors

**Protected Routes**:
- `/api/patients/:id` requires authentication + doctor/records role
- `/api/audit/logs/user/:userId` requires admin role
- `/api/risk/analyze` requires authentication

### 6. Data Models

**User Model**:
```javascript
{
  id, name, email, role, password, avatar, hospital (optional)
}
```

**Patient Model**:
```javascript
{
  lifeId, firstName, lastName, bloodGroup, age, allergies: [], medications: [], conditions: []
}
```

**Medical Record Model**:
```javascript
{
  patientId, recordType, data, timestamp, accessedBy
}
```

**Audit Log Model**:
```javascript
{
  timestamp, userId, action, resource, status, details
}
```

## Running the Application

### Terminal 1: Backend

```bash
cd backend
npm install    # Install dependencies (first time only)
npm run dev    # Start development server on http://localhost:3001
```

Expected output:
```
════════════════════════════════════════════════════════════
  ✓ LifeID Backend Server
════════════════════════════════════════════════════════════
  URL: http://localhost:3001
  Frontend: http://localhost:5173
  Environment: development
  Version: 2.1.0
════════════════════════════════════════════════════════════
```

### Terminal 2: Frontend

```bash
cd frontend
npm install    # Install dependencies (first time only)
npm run dev    # Start dev server on http://localhost:5173
```

### Access the Application

Open browser to: `http://localhost:5173`

**Test Credentials**:
- **Admin**: admin@lifeid.gov.in / admin123
- **Doctor**: doctor@lifeid.gov.in / doctor123
- **Records**: records@lifeid.gov.in / records123
- **Patient**: patient@lifeid.gov.in / patient123

## Key Features

### 1. AI Risk Analysis Engine

Located in `backend/src/api/routes/risk.js` and `frontend/src/services/riskAnalysis.js`

**Detects**:
- Drug-allergy conflicts
- Condition-specific drug contraindications
- Medication interactions
- Over-prescription patterns

**Returns**:
- Alert level (HIGH/MEDIUM)
- Risk description
- Recommended action

### 2. Audit Logging System

Every API call is logged with:
- Timestamp (IST timezone)
- User ID & role
- Action performed
- Resource accessed
- Success/failure status
- IP address & user agent

**Retention**: 1 year (configurable)

### 3. Biometric Integration

- Simulated fingerprint scanner with progress animation
- Locks sensitive data (medical records, emergency access)
- 5-second scan timeout
- Audit trail of biometric events

### 4. Role-Based Access Control (RBAC)

Each role has specific:
- Pages accessible
- API endpoints allowed
- Data fields visible
- Actions permitted

## Environment Configuration

### Backend `.env`

```
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
JWT_SECRET=lifeid_secret_key_2024_production_secure
BIOMETRIC_TIMEOUT=5000
SESSION_TIMEOUT=1800000
AUDIT_LOG_RETENTION=31536000000
MONGODB_URI=mongodb://localhost:27017/lifeid
```

### Frontend `.env`

```
VITE_API_URL=http://localhost:3001/api
VITE_APP_NAME=LifeID
VITE_APP_VERSION=2.1.0
```

## Testing Scenarios

### Scenario 1: Admin Dashboard
1. Login as admin
2. Navigate to Hospitals, Users, Audit Logs
3. Verify each page renders correctly
4. Check sidebar navigation highlighting

### Scenario 2: Doctor Emergency Access
1. Login as doctor
2. Click "Emergency Access" in sidebar
3. Verify form renders with audit warning
4. Submit medication data
5. Verify risk analysis results

### Scenario 3: Patient Medical Records
1. Login as patient
2. Click "Medical Records"
3. Trigger biometric scanner
4. Verify medical data appears after scan
5. Check access history

### Scenario 4: API Testing
```bash
# Health check
curl http://localhost:3001/health

# Login
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lifeid.gov.in","password":"admin123"}'

# Analyze risk
curl -X POST http://localhost:3001/api/risk/analyze \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{"allergies":["Penicillin"],"conditions":["Hypertension"],"medications":[],"proposedDrug":"Amoxicillin"}'
```

## Troubleshooting

**Issue**: Frontend can't connect to backend
- Solution: Check backend is running on port 3001
- Verify CORS origin in `backend/src/server.js`

**Issue**: JWT token invalid
- Solution: Clear browser localStorage and login again
- Check JWT_SECRET is same in backend .env

**Issue**: Roles/permissions not working
- Solution: Verify role value in ROLES constant matches user.role
- Check MENUS object has configuration for that role

**Issue**: Mock data not loading
- Solution: Verify mockData.js exists and exports USERS, PATIENTS, HOSPITALS, AUDIT_LOGS
- Check import paths use relative `./` notation

## Integration Checklist

- ✅ Frontend App.jsx imports all page components
- ✅ Backend server.js has all routes mounted
- ✅ Environment variables configured (.env files)
- ✅ Authentication middleware implemented
- ✅ Role-based page routing working
- ✅ API endpoints responding
- ✅ Audit logging functional
- ✅ Mock data available for testing
- ✅ Error handling on both frontend and backend
- ✅ CORS configured for localhost:5173
- ✅ All imports using correct relative paths
- ✅ 42+ files organized and populated
- ✅ Zero empty directories

## Next Steps

1. Start backend server: `npm run dev` in `/backend`
2. Start frontend server: `npm run dev` in `/frontend`
3. Open `http://localhost:5173` in browser
4. Test with provided credentials
5. For production: Connect to MongoDB, update JWT_SECRET, configure CORS origins

---

**Version**: 2.1.0
**Last Updated**: April 2024
**Status**: ✅ Fully Integrated
