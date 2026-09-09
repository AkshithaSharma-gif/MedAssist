import { useEffect, useState } from "react";
import api from "../services/api";

function BookAppointment() {
  const [departments, setDepartments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [services, setServices] = useState([]);

  const [formData, setFormData] = useState({
    departmentId: "",
    doctorId: "",
    serviceId: "",
    appointmentDate: "",
    startTime: "",
    reason: "",
  });

  const [loading, setLoading] = useState(true);
  const [booking, setBooking] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [departmentRes, doctorRes, serviceRes] =
          await Promise.all([
            api.get("/departments"),
            api.get("/doctors"),
            api.get("/services"),
          ]);

        setDepartments(
          departmentRes.data.departments ||
          departmentRes.data.data ||
          []
        );

        setDoctors(
          doctorRes.data.doctors ||
          doctorRes.data.data ||
          []
        );

        setServices(
          serviceRes.data.services ||
          serviceRes.data.data ||
          []
        );
      } catch (err) {
        console.error(err);
        setError(
          err.response?.data?.message ||
          "Failed to load appointment data"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setMessage("");
    setError("");
    setBooking(true);

    try {
      const response = await api.post(
        "/appointments",
        formData
      );

      setMessage(
        response.data.message ||
        "Appointment booked successfully!"
      );

      setFormData({
        departmentId: "",
        doctorId: "",
        serviceId: "",
        appointmentDate: "",
        startTime: "",
        reason: "",
      });
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
        "Failed to book appointment"
      );
    } finally {
      setBooking(false);
    }
  };

  if (loading) {
    return <h2>Loading appointment data...</h2>;
  }

  return (
    <div>
      <h1>Book an Appointment</h1>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div>
          <label>Department</label>
          <br />

          <select
            name="departmentId"
            value={formData.departmentId}
            onChange={handleChange}
            required
          >
            <option value="">
              Select Department
            </option>

            {departments.map((department) => (
              <option
                key={department._id}
                value={department._id}
              >
                {department.name}
              </option>
            ))}
          </select>
        </div>

        <br />

        <div>
          <label>Doctor</label>
          <br />

          <select
            name="doctorId"
            value={formData.doctorId}
            onChange={handleChange}
            required
          >
            <option value="">
              Select Doctor
            </option>

            {doctors.map((doctor) => (
              <option
                key={doctor._id}
                value={doctor._id}
              >
                {doctor.name}
              </option>
            ))}
          </select>
        </div>

        <br />

        <div>
          <label>Service</label>
          <br />

          <select
            name="serviceId"
            value={formData.serviceId}
            onChange={handleChange}
            required
          >
            <option value="">
              Select Service
            </option>

            {services.map((service) => (
              <option
                key={service._id}
                value={service._id}
              >
                {service.name}
              </option>
            ))}
          </select>
        </div>

        <br />

        <div>
          <label>Appointment Date</label>
          <br />

          <input
            type="date"
            name="appointmentDate"
            value={formData.appointmentDate}
            onChange={handleChange}
            required
          />
        </div>

        <br />

        <div>
          <label>Start Time</label>
          <br />

          <input
            type="time"
            name="startTime"
            value={formData.startTime}
            onChange={handleChange}
            required
          />
        </div>

        <br />

        <div>
          <label>Reason</label>
          <br />

          <textarea
            name="reason"
            value={formData.reason}
            onChange={handleChange}
            placeholder="Enter reason for appointment"
            rows="4"
          />
        </div>

        <br />

        <button type="submit" disabled={booking}>
          {booking
            ? "Booking..."
            : "Book Appointment"}
        </button>
      </form>
    </div>
  );
}

export default BookAppointment;