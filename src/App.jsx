import { useState } from "react";
import { ROLES, USERS, PATIENTS, HOSPITALS, AUDIT_LOGS, MENUS, ROLE_LABELS, ROLE_COLORS } from "./constants";
import { validateIndianPhone, formatIndianPhone } from "./utils/validation";
import { Toast } from "./components/ui/Toast";
import { Shell } from "./components/layout/Layout";
import { Landing } from "./pages/Landing";
import { Login } from "./pages/Login";
import { About, Privacy } from "./pages/StaticPages";

// Import admin pages
import { AdminOverview } from "./pages/admin/AdminOverview";
import { AdminHospitals } from "./pages/admin/AdminHospitals";
import { AdminUsers } from "./pages/admin/AdminUsers";
import { AdminLogs } from "./pages/admin/AdminLogs";

// Import doctor pages
import { DoctorOverview } from "./pages/doctor/DoctorOverview";
import { EmergencyAccess } from "./pages/doctor/EmergencyAccess";

// Import records pages
import { RecordsOverview } from "./pages/records/RecordsOverview";
import { PatientRegistration } from "./pages/records/PatientRegistration";
import { RecordSearch } from "./pages/records/RecordSearch";
import { RecordUpdate } from "./pages/records/RecordUpdate";

// Import patient pages
import { PatientOverview } from "./pages/patient/PatientOverview";
import { QRCard } from "./pages/patient/QRCard";
import { AccessHistory } from "./pages/patient/AccessHistory";
import { UpdateContact } from "./pages/patient/UpdateContact";

export default function App() {
  const [route, setRoute] = useState("landing");
  const [user, setUser] = useState(null);
  const [sub, setSub] = useState("overview");
  const [toastData, setToastData] = useState(null);

  const toast = (msg, type = "success") => {
    setToastData({ msg, type, k: Date.now() });
  };

  const handleLogin = (u) => {
    setUser(u);
    setSub("overview");
    setRoute("dashboard");
  };

  const handleLogout = () => {
    setUser(null);
    setRoute("landing");
  };

  const nav = (p) => {
    if (p === "logout") {
      handleLogout();
      return;
    }
    if (["landing", "login", "about", "privacy"].includes(p)) {
      setRoute(p);
      return;
    }
    setSub(p);
  };

  const renderDashboard = () => {
    const R = user.role;

    if (R === ROLES.ADMIN) {
      if (sub === "hospitals") return <AdminHospitals toast={toast} />;
      if (sub === "users") return <AdminUsers toast={toast} />;
      if (sub === "logs") return <AdminLogs />;
      return <AdminOverview />;
    }

    if (R === ROLES.DOCTOR) {
      if (sub === "emergency") return <EmergencyAccess user={user} />;
      return <DoctorOverview user={user} />;
    }

    if (R === ROLES.RECORDS) {
      if (sub === "register") return <PatientRegistration toast={toast} />;
      if (sub === "search") return <RecordSearch />;
      if (sub === "update") return <RecordUpdate user={user} />;
      return <RecordsOverview user={user} />;
    }

    if (R === ROLES.PATIENT) {
      if (sub === "medical") return <PatientOverview user={user} />;
      if (sub === "qrcard") return <QRCard user={user} />;
      if (sub === "history") return <AccessHistory />;
      if (sub === "contact") return <UpdateContact toast={toast} />;
      return <PatientOverview user={user} />;
    }
  };

  return (
    <>
      {route === "landing" && <Landing onNav={nav} />}
      {route === "about" && <About onNav={nav} />}
      {route === "privacy" && <Privacy onNav={nav} />}
      {route === "login" && <Login onLogin={handleLogin} onNav={nav} />}
      {route === "dashboard" && user && (
        <Shell user={user} page={sub} onNav={nav}>
          {renderDashboard()}
        </Shell>
      )}
      {toastData && <Toast key={toastData.k} msg={toastData.msg} type={toastData.type} onDone={() => setToastData(null)} />}
    </>
  );
}
