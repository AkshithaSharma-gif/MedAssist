import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";

import AdminDashboard from "./pages/AdminDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import PatientDashboard from "./pages/PatientDashboard";
import ReceptionistDashboard from "./pages/ReceptionistDashboard";

import BookAppointment from "./pages/BookAppointment";
import MyAppointments from "./pages/MyAppointments";
import Notifications from "./pages/Notifications";
import MyInvoices from "./pages/MyInvoices";
import MedicalRecords from "./pages/MedicalRecords";
import Profile from "./pages/Profile";
import DoctorAppointments from "./pages/DoctorAppointments";
import DoctorPatients from "./pages/DoctorPatients";
import DoctorMedicalRecords from "./pages/DoctorMedicalRecords";
import DoctorNotifications from "./pages/DoctorNotifications";
import DoctorConsultation from "./pages/DoctorConsultation";
import AdminPatients from "./pages/AdminPatients";
import AdminDoctors from "./pages/AdminDoctors";
import AdminDepartments from "./pages/AdminDepartments";
import AdminServices from "./pages/AdminServices";
import AdminAppointments from "./pages/AdminAppointments";
import AdminInvoices from "./pages/AdminInvoices";
import AdminNotifications from "./pages/AdminNotifications";

import ProtectedRoute from "./components/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import DoctorProfile from "./pages/DoctorProfile";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* ==================== PUBLIC ==================== */}

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />


        {/* ==================== ADMIN ==================== */}

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardLayout role="admin" />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="patients" element={<AdminPatients />} />
          <Route path="doctors" element={<AdminDoctors />} />
          <Route path="departments" element={<AdminDepartments />} />
          <Route path="services" element={<AdminServices />} />
          <Route
    path="appointments"
    element={<AdminAppointments />}
  />
  <Route
  path="invoices"
  element={<AdminInvoices />}
/>
<Route
  path="notifications"
  element={<AdminNotifications />}
/>
        </Route>


        {/* ==================== DOCTOR ==================== */}

        <Route
  path="/doctor"
  element={
    <ProtectedRoute allowedRoles={["doctor"]}>
      <DashboardLayout role="doctor" />
    </ProtectedRoute>
  }
>
  <Route index element={<DoctorDashboard />} />
  <Route path="appointments" element={<DoctorAppointments />} />
  <Route path="patients" element={<DoctorPatients />} />
  <Route path="records" element={<DoctorMedicalRecords />} />
  <Route path="notifications" element={<DoctorNotifications />} />
  <Route path="consultation" element={<DoctorConsultation />} />
  <Route path="profile" element={<DoctorProfile />} />
  
</Route>


        {/* ==================== PATIENT ==================== */}

        <Route
          path="/patient"
          element={
            <ProtectedRoute allowedRoles={["patient"]}>
              <DashboardLayout role="patient" />
            </ProtectedRoute>
          }
        >
          <Route index element={<PatientDashboard />} />

          <Route
            path="appointments"
            element={<BookAppointment />}
          />

          <Route
            path="my-appointments"
            element={<MyAppointments />}
          />

          <Route
            path="notifications"
            element={<Notifications />}
          />

          <Route
            path="records"
            element={<MedicalRecords />}
          />

          <Route
            path="invoices"
            element={<MyInvoices />}
          />

          <Route
            path="profile"
            element={<Profile />}
          />
        </Route>


        {/* ==================== RECEPTIONIST ==================== */}

        <Route
          path="/receptionist"
          element={
            <ProtectedRoute allowedRoles={["receptionist"]}>
              <DashboardLayout role="receptionist" />
            </ProtectedRoute>
          }
        >
          <Route index element={<ReceptionistDashboard />} />
        </Route>


        {/* ==================== DEFAULT ==================== */}

        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
