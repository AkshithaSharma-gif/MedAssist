import { Link, Outlet, useNavigate } from "react-router-dom";
import { logoutUser } from "../services/authService";

function PatientLayout() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logoutUser();
    navigate("/login");
  };

  return (
    <div>
      <header>
        <h1>MedAssist</h1>

        <nav>
          {" "}
|{" "}
<Link to="/patient/notifications">
  Notifications
</Link>

{" "}
|{" "}
<Link to="/patient/invoices">
  My Invoices
</Link>{" "}
          <Link to="/patient">Dashboard</Link>{" "}
          |{" "}
          <Link to="/patient/appointments">
  Book Appointment
</Link>{" "}
|{" "}
<Link to="/patient/my-appointments">
  My Appointments
</Link>
          {" "}
          |{" "}
          <Link to="/patient/records">Medical Records</Link>{" "}
          |{" "}
          <Link to="/patient/invoices">Invoices</Link>{" "}

          <button onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </header>

      <hr />

      <main>
        <Outlet />
      </main>
    </div>
  );
}

export default PatientLayout;