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
import PatientLayout from "./components/PatientLayout";
import BookAppointment from "./pages/BookAppointment";
import MyAppointments from "./pages/MyAppointments";

import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Doctor */}
        <Route
          path="/doctor"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />

        {/* Patient */}
<Route
  path="/patient"
  element={
    <ProtectedRoute allowedRoles={["patient"]}>
      <PatientLayout />
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

</Route>

        {/* Receptionist */}
        <Route
          path="/receptionist"
          element={
            <ProtectedRoute allowedRoles={["receptionist"]}>
              <ReceptionistDashboard />
            </ProtectedRoute>
          }
        />

        {/* Default */}
        <Route
          path="*"
          element={<Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;