import { useState } from "react";
import api from "../services/api";

function Register() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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
    setLoading(true);

    try {
      const response = await api.post("/auth/register", formData);

      setMessage(
        response.data.message || "Registration successful!"
      );

      setFormData({
        name: "",
        email: "",
        password: "",
        role: "patient",
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Registration failed."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>MedAssist</h1>
      <h2>Create Account</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
        </div>

        <div>
          <label>Role</label>

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="patient">Patient</option>
          </select>
        </div>

        {message && <p>{message}</p>}
        {error && <p>{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? "Creating Account..." : "Register"}
        </button>
      </form>
    </div>
  );
}

export default Register;
