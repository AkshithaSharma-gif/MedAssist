import { useEffect, useState } from "react";
import api from "../services/api";

function PatientDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/dashboard/patient");

        setDashboard(response.data);
      } catch (err) {
        console.error("Dashboard error:", err);

        setError(
          err.response?.data?.message ||
            "Failed to load dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <h2>Loading Patient Dashboard...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  return (
    <div>
      <h1>Patient Dashboard</h1>

      <p>Welcome to MedAssist</p>

      <hr />

      <h2>Dashboard Summary</h2>

      <div>
        <h3>Upcoming Appointments</h3>
        <p>
          {dashboard?.upcomingAppointments ?? 0}
        </p>
      </div>

      <div>
        <h3>Completed Appointments</h3>
        <p>
          {dashboard?.completedAppointments ?? 0}
        </p>
      </div>

      <div>
        <h3>Medical Records</h3>
        <p>
          {dashboard?.medicalRecords ?? 0}
        </p>
      </div>

      <div>
        <h3>Pending Invoices</h3>
        <p>
          {dashboard?.pendingInvoices ?? 0}
        </p>
      </div>
    </div>
  );
}

export default PatientDashboard;