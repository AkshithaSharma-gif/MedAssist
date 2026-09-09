import { useEffect, useState } from "react";
import api from "../services/api";

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAppointments = async () => {
    try {
      const response = await api.get("/appointments");

      setAppointments(
        response.data.appointments ||
        response.data.data ||
        []
      );
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        "Failed to load appointments"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmed) return;

    try {
      await api.put(`/appointments/${id}/cancel`);

      await fetchAppointments();
    } catch (err) {
      console.error(err);

      alert(
        err.response?.data?.message ||
        "Failed to cancel appointment"
      );
    }
  };

  if (loading) {
    return <h2>Loading appointments...</h2>;
  }

  if (error) {
    return <h2>{error}</h2>;
  }

  return (
    <div>
      <h1>My Appointments</h1>

      {appointments.length === 0 ? (
        <p>No appointments found.</p>
      ) : (
        appointments.map((appointment) => (
          <div key={appointment._id}>
            <hr />

            <h3>
              {appointment.doctorId?.name ||
                "Doctor"}
            </h3>

            <p>
              <strong>Department:</strong>{" "}
              {appointment.departmentId?.name ||
                "N/A"}
            </p>

            <p>
              <strong>Service:</strong>{" "}
              {appointment.serviceId?.name ||
                "N/A"}
            </p>

            <p>
              <strong>Date:</strong>{" "}
              {appointment.appointmentDate
                ? new Date(
                    appointment.appointmentDate
                  ).toLocaleDateString()
                : "N/A"}
            </p>

            <p>
              <strong>Time:</strong>{" "}
              {appointment.startTime || "N/A"}
            </p>

            <p>
              <strong>Status:</strong>{" "}
              {appointment.status}
            </p>

            {["scheduled", "confirmed"].includes(
              appointment.status
            ) && (
              <button
                onClick={() =>
                  handleCancel(appointment._id)
                }
              >
                Cancel Appointment
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default MyAppointments;