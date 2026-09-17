
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HeartPulse,
  Mail,
  Lock,
  UserRound,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
} from "lucide-react";
import api from "../services/api";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "patient",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (error) {
      setError("");
    }

    if (message) {
      setMessage("");
    }
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

    // Redirect to login after successful registration
    setTimeout(() => {
      navigate("/login");
    }, 1000);
  } catch (error) {
    setError(
      error.response?.data?.message ||
        "Registration failed. Please try again."
    );
  } finally {
    setLoading(false);
  }
};



  return (
    <div className="min-h-screen bg-slate-50">
      <div className="flex min-h-screen">

        {/* ================= LEFT SIDE ================= */}

        <div className="relative hidden overflow-hidden bg-blue-700 lg:flex lg:w-1/2">
          <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-blue-500/30" />
          <div className="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-cyan-400/20" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-lg">
                <HeartPulse
                  size={28}
                  className="text-blue-600"
                />
              </div>

              <div>
                <h1 className="text-2xl font-bold text-white">
                  MedAssist
                </h1>

                <p className="text-sm text-blue-100">
                  Healthcare Management Portal
                </p>
              </div>
            </div>

            {/* Main content */}
            <div className="max-w-xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-blue-50 backdrop-blur-sm">
                <ShieldCheck size={17} />
                Secure Healthcare Platform
              </div>

              <h2 className="text-4xl font-bold leading-tight text-white xl:text-5xl">
                Your healthcare,
                <span className="block text-cyan-200">
                  all in one place.
                </span>
              </h2>

              <p className="mt-6 max-w-lg text-base leading-7 text-blue-100">
                Create your MedAssist account and get access to
                appointments, medical records, invoices, and
                important healthcare notifications.
              </p>

              {/* Benefits */}
              <div className="mt-10 space-y-4">
                <div className="flex items-center gap-3 text-blue-50">
                  <CheckCircle2
                    size={21}
                    className="text-cyan-200"
                  />
                  <span>Manage your appointments easily</span>
                </div>

                <div className="flex items-center gap-3 text-blue-50">
                  <CheckCircle2
                    size={21}
                    className="text-cyan-200"
                  />
                  <span>Access your medical records securely</span>
                </div>

                <div className="flex items-center gap-3 text-blue-50">
                  <CheckCircle2
                    size={21}
                    className="text-cyan-200"
                  />
                  <span>Stay updated with healthcare notifications</span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <p className="text-sm text-blue-200">
              © 2026 MedAssist. All rights reserved.
            </p>
          </div>
        </div>

        {/* ================= RIGHT SIDE ================= */}

        <div className="flex w-full items-center justify-center px-6 py-10 lg:w-1/2 lg:px-12">
          <div className="w-full max-w-md">

            {/* Mobile logo */}
            <div className="mb-10 flex items-center justify-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600 text-white shadow-md">
                <HeartPulse size={25} />
              </div>

              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  MedAssist
                </h1>

                <p className="text-xs text-slate-500">
                  Healthcare Portal
                </p>
              </div>
            </div>

            {/* Heading */}
            <div className="mb-8">
              <p className="mb-2 text-sm font-semibold text-blue-600">
                GET STARTED
              </p>

              <h2 className="text-3xl font-bold text-slate-900">
                Create your account
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Register to access your MedAssist healthcare portal.
              </p>
            </div>

            {/* Register Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">

              <form onSubmit={handleSubmit} className="space-y-5">

                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Full Name
                  </label>

                  <div className="relative">
                    <UserRound
                      size={19}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="name"
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Enter your full name"
                      autoComplete="name"
                      required
                      className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Email Address
                  </label>

                  <div className="relative">
                    <Mail
                      size={19}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="Enter your email"
                      autoComplete="email"
                      required
                      className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />
                  </div>
                </div>

                {/* Password */}
                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <Lock
                      size={19}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="Create a password"
                      autoComplete="new-password"
                      required
                      className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(!showPassword)
                      }
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff size={19} />
                      ) : (
                        <Eye size={19} />
                      )}
                    </button>
                  </div>
                </div>

                {/* Role */}
                <div>
                  <label
                    htmlFor="role"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Account Type
                  </label>

                  <div className="relative">
                    <UserRound
                      size={19}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <select
                      id="role"
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    >
                      <option value="patient">Patient</option>
                    </select>
                  </div>

                  <p className="mt-2 text-xs text-slate-400">
                    Patient accounts can be created through public
                    registration.
                  </p>
                </div>

                {/* Success */}
                {message && (
                  <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
                    <CheckCircle2
                      size={19}
                      className="mt-0.5 shrink-0 text-emerald-600"
                    />

                    <p className="text-sm font-medium text-emerald-700">
                      {message}
                    </p>
                  </div>
                )}

                {/* Error */}
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                    <p className="text-sm font-medium text-red-600">
                      {error}
                    </p>
                  </div>
                )}

                {/* Register */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Account
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              {/* Login */}
              <div className="mt-7 border-t border-slate-100 pt-6 text-center">
                <p className="text-sm text-slate-500">
                  Already have an account?
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/login")}
                  className="mt-1 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                >
                  Sign in instead
                </button>
              </div>
            </div>

            {/* Security note */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck size={15} />
              Your information is handled securely.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;

