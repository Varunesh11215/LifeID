# LifeID - Biometric Healthcare Identity System

**Version:** 2.1.0  
**Status:** Production Ready  
**License:** Government of India (NHA)

## 🏥 Overview

LifeID is a comprehensive biometric-protected healthcare identity and records management system developed for the **National Health Authority, Government of India**. It combines facial biometric authentication, emergency medical records, AI-powered clinical decision support, and complete audit trails.

### Key Features

- **🔐 Dual Biometric Authentication** - Fingerprint + system-level verification
- **🧠 AI Clinical Decision Support** - Real-time drug-allergy conflict detection & condition contraindication analysis
- **📋 Secure Medical Records** - Encrypted patient data with granular access control
- **📊 Complete Audit Trails** - Every access permanently logged and auditable
- **🏥 Role-Based Access** - Admin, Doctor, Records Officer, Patient portals
- **🆔 LifeID Card** - QR-encoded emergency data with AES-256 encryption
- **⚕️ Multi-Hospital Support** - Centralized records across provider networks

---

## 🏗️ Project Structure

```
LifeID/
├── frontend/                    # React.js frontend application
│   ├── src/
│   │   ├── components/
│   │   │   ├── UI/             # Reusable UI components
│   │   │   ├── Layout/         # Shell, Sidebar, Header
│   │   │   ├── RiskAnalysis/   # AI alert system
│   │   │   ├── Biometric/      # BioScanner component
│   │   │   └── Pages/          # Role-based pages
│   │   ├── utils/
│   │   │   ├── constants.js    # Colors, roles, configs
│   │   │   ├── icons.js        # SVG icon library
│   │   │   ├── validators.js   # Form & data validation
│   │   │   └── mockData.js     # Test data
│   │   ├── styles/
│   │   └── App.jsx             # Root component
│   ├── package.json
│   └── .env.example
│
├── backend/                     # Express.js backend API
│   ├── src/
│   │   ├── api/
│   │   │   ├── routes/         # API endpoints
│   │   │   └── middleware/     # Auth, CORS, logging
│   │   ├── models/             # Data models (User, Patient, etc)
│   │   ├── services/           # Business logic
│   │   │   ├── riskAnalysis.js # AI drug-allergy engine
│   │   │   ├── auth.js
│   │   │   ├── audit.js
│   │   │   └── biometric.js
│   │   ├── config/             # Environment & settings
│   │   └── index.js            # Server entry point
│   ├── package.json
│   └── .env.example
│
├── docs/                        # Documentation
│   ├── API.md                  # API endpoints reference
│   ├── ARCHITECTURE.md         # System design & flows
│   ├── SETUP.md                # Installation & deployment
│   └── AI_RISK_ENGINE.md       # Risk analysis details
│
├── .gitignore
└── README.md                    # This file
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 16+
- **MongoDB** 5.0+
- **Modern Browser** (Chrome, Firefox, Safari, Edge)

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Access at `http://localhost:5173`

### Backend Setup

```bash
cd backend
npm install
cp .env.example .env
npm run db:bootstrap
npm run dev
```

Server runs on `http://localhost:3001`

Use `npm run db:indexes` to apply indexes only, or `npm run db:seed` to insert default data into empty collections.
If unique index creation fails because of old duplicate demo data, run `npm run db:reset` once to clear and re-bootstrap collections.
Use `npm run db:check-duplicates` for a read-only precheck of duplicate key values before creating unique indexes.
Use `npm run db:check-duplicates:strict` to fail on duplicate values and missing collections/fields.
Use `npm run db:check-duplicates:md` for a markdown-formatted report output.
Use `npm run db:check-duplicates -- reports/db-duplicates.json` to write a JSON artifact file.
Use `npm run db:check-duplicates:md -- reports/db-duplicates.md` to write a markdown artifact file.
Optional explicit flag form is also supported: `--output <path>`.

---

## 🔐 Role-Based Access

### System Admin
- Platform overview & statistics
- Hospital management & approvals
- User management & permissions
- Complete audit log access

### Medical Officer (Doctor)
- Emergency patient access with biometric verification
- Real-time AI risk alerts for drug-allergy conflicts
- Patient record view (restricted: biometric-protected)
- Access history tracking

### Records Officer
- Patient registration & biometric capture
- Medical record updates & version control
- Record search & retrieval
- Data entry audit trail

### Patient
- Personal LifeID card & QR code
- Biometric-protected medical records view
- 30-second auto-lock for data protection
- Complete access history transparency
- Self-service contact information update

---

## 🧠 AI Risk Analysis Engine

### Features

1. **Drug-Allergy Conflict Detection**
   - Cross-reactivity analysis (penicillin → beta-lactams)
   - Sulfonamide class warnings
   - NSAID sensitivity patterns
   - Opioid interaction checks

2. **Condition-Specific Contraindications**
   - **Type 2 Diabetes:** Corticosteroid hyperglycemia risk
   - **Hypertension:** NSAID efficacy reduction
   - **Coronary Artery Disease:** MI/stroke risk from NSAIDs, ergot alkaloids, PDE-5 inhibitors
   - **Asthma:** Bronchospasm risk from NSAIDs, beta-blockers
   - **Chronic Kidney Disease:** Nephrotoxicity (aminoglycosides), metformin lactic acidosis

3. **Real-Time Alerts**
   - **HIGH** - Critical allergy conflicts, absolute contraindications
   - **MEDIUM** - Caution interactions, monitoring required
   - **SAFE** - No conflicts detected

### Implementation
See [docs/AI_RISK_ENGINE.md](docs/AI_RISK_ENGINE.md) for database schema and algorithm details.

---

## 📊 API Endpoints

### Authentication
```
POST   /api/auth/login                 # Login with email/password
POST   /api/auth/logout                # Logout & clear session
GET    /api/auth/profile               # Get current user profile
```

### Patients
```
GET    /api/patients/:lifeId           # Fetch patient by LifeID
POST   /api/patients                   # Register new patient
PUT    /api/patients/:id               # Update patient data
GET    /api/patients/:id/medical-records  # Patient records
```

### Risk Analysis
```
POST   /api/risk/analyze               # Analyze drug risks
GET    /api/risk/check-patient/:id    # Patient risk profile
```

### Audit
```
GET    /api/audit/logs                 # All audit logs
GET    /api/audit/logs/patient/:lifeId # Patient access history
POST   /api/audit/log                  # Create log entry
GET    /api/audit/export               # Export logs (JSON/CSV)
```

Full API documentation: [docs/API.md](docs/API.md)

---

## 🔒 Security Features

- **Biometric Dual Authentication** - Fingerprint + system verification
- **AES-256 Encryption** - Data at rest and in transit
- **Role-Based Access Control (RBAC)** - Granular permissions
- **JWT Tokens** - Stateless session management
- **Audit Trails** - Immutable access logs with timestamps
- **HTTPS/TLS** - Encrypted API communication
- **Rate Limiting** - DDoS protection
- **Input Validation** - SQL injection & XSS prevention

---

## 📱 Tech Stack

### Frontend
- **React 18** - UI component framework
- **Vite** - Build tool & dev server
- **Vanilla CSS** - No external styling library (lightweight)
- **SVG Icons** - Inline icon system
- **LocalStorage** - Client-side session storage

### Backend
- **Express.js** - REST API framework
- **MongoDB** - Document database
- **JWT** - Authentication tokens
- **Node.js** - Runtime environment

---

## 🚢 Deployment

### Production Checklist
- [ ] Set environment variables (.env)
- [ ] Enable HTTPS/TLS certificates
- [ ] Configure MongoDB connection string
- [ ] Run `npm --prefix backend run db:bootstrap` after MongoDB is reachable
- [ ] Set strong JWT_SECRET
- [ ] Enable audit log retention policies
- [ ] Configure CORS for production domain
- [ ] Setup monitoring & alerting
- [ ] Database backup strategy
- [ ] Load balancing (if needed)

### Docker Support (Planned)
```bash
docker-compose up -d
```

---

## 📚 Documentation

- [API.md](docs/API.md) - Complete API reference
- [ARCHITECTURE.md](docs/ARCHITECTURE.md) - System design & data flow
- [SETUP.md](docs/SETUP.md) - Installation & configuration
- [AI_RISK_ENGINE.md](docs/AI_RISK_ENGINE.md) - Risk analysis algorithm

---

## 🔄 Version History

### v2.1.0 (Current)
- ✅ AI clinical decision support system
- ✅ Drug-allergy conflict detection
- ✅ Condition contraindication analysis
- ✅ Multi-role dashboard system
- ✅ Complete audit logging

### v2.0.0
- Biometric authentication system
- QR card with encrypted data
- Patient self-service portal

### v1.0.0
- Initial launch
- Basic patient records

---

## 🤝 Contributing

This is a government project. Changes should follow:
- Code review & approval process
- Security audit requirements
- Compliance with NHA regulations
- Indian healthcare standards

---

## 📞 Support

**For Technical Issues:**
- Email: tech-support@lifeid.gov.in
- Ticket System: support.lifeid.gov.in

**For Security Concerns:**
- Email: security@lifeid.gov.in (encrypted preferred)
- Report responsibly - 90-day disclosure timeline

---

## ⚖️ License

© 2024 National Health Authority, Government of India  
All rights reserved.

---

**Building a Healthier India, One Identity at a Time** 🇮🇳
