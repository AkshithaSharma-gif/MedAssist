import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  HeartPulse,
  Mail,
  Lock,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  UserRound,
  Eye,
  EyeOff,
} from "lucide-react";
import { loginUser } from "../services/authService";

function Login() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const data = await loginUser(formData);

      console.log("Login successful:", data);

      const role =
        data?.user?.role ||
        data?.role ||
        localStorage.getItem("medassist_role");

      if (role) {
        navigate(`/${role}`);
      } else {
        navigate("/login");
      }
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Login failed. Please check your credentials."
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
          {/* Background decorations */}
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
                Healthcare made
                <span className="block text-cyan-200">
                  simpler for everyone.
                </span>
              </h2>

              <p className="mt-6 max-w-lg text-base leading-7 text-blue-100">
                Manage appointments, medical records, invoices,
                notifications, and healthcare services from one
                secure platform.
              </p>

              {/* Feature cards */}
              <div className="mt-10 grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                  <Stethoscope
                    size={22}
                    className="mb-3 text-cyan-200"
                  />
                  <p className="font-semibold text-white">
                    Connected Care
                  </p>
                  <p className="mt-1 text-sm text-blue-100">
                    Connect patients and healthcare teams.
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm">
                  <UserRound
                    size={22}
                    className="mb-3 text-cyan-200"
                  />
                  <p className="font-semibold text-white">
                    Easy Management
                  </p>
                  <p className="mt-1 text-sm text-blue-100">
                    Access everything from one portal.
                  </p>
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
                WELCOME BACK
              </p>

              <h2 className="text-3xl font-bold text-slate-900">
                Sign in to MedAssist
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Enter your credentials to access your healthcare
                portal.
              </p>
            </div>

            {/* Login Card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm sm:p-8">

              <form onSubmit={handleSubmit} className="space-y-5">

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
                      placeholder="Enter your password"
                      autoComplete="current-password"
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

                {/* Error */}
                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3">
                    <p className="text-sm font-medium text-red-600">
                      {error}
                    </p>
                  </div>
                )}

                {/* Login */}
                <button
                  type="submit"
                  disabled={loading}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Logging in...
                    </>
                  ) : (
                    <>
                      Sign In
                      <ArrowRight size={18} />
                    </>
                  )}
                </button>
              </form>

              {/* Register */}
              <div className="mt-7 border-t border-slate-100 pt-6 text-center">
                <p className="text-sm text-slate-500">
                  Don't have an account?
                </p>

                <button
                  type="button"
                  onClick={() => navigate("/register")}
                  className="mt-1 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
                >
                  Create an account
                </button>
              </div>
            </div>

            {/* Security note */}
            <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-400">
              <ShieldCheck size={15} />
              Your connection is secured and protected.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;

