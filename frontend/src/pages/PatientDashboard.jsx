import { useEffect, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  FileText,
  Receipt,
  ArrowRight,
  Clock3,
  HeartPulse,
  ShieldCheck,
  Activity,
  Stethoscope,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function PatientDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/dashboard/patient");

        setDashboard(response.data.dashboard);
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
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

          <p className="mt-4 text-sm font-medium text-gray-500">
            Loading your healthcare dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="flex items-center gap-3">
            <Activity className="text-red-600" size={24} />

            <div>
              <h2 className="font-semibold text-red-700">
                Unable to load dashboard
              </h2>

              <p className="mt-1 text-sm text-red-600">
                {error}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const upcomingAppointments =
    dashboard?.upcomingAppointments ?? 0;

  const completedAppointments =
    dashboard?.completedAppointments ?? 0;

  const medicalRecords =
    dashboard?.medicalRecords ?? 0;

  const pendingInvoices =
    dashboard?.pendingInvoices ?? 0;

  const stats = [
    {
      title: "Upcoming Appointments",
      value: upcomingAppointments,
      description: "Scheduled visits",
      icon: CalendarDays,
      bg: "bg-blue-50",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      valueColor: "text-blue-700",
    },
    {
      title: "Completed Visits",
      value: completedAppointments,
      description: "Visits completed",
      icon: CheckCircle2,
      bg: "bg-emerald-50",
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
      valueColor: "text-emerald-700",
    },
    {
      title: "Medical Records",
      value: medicalRecords,
      description: "Records available",
      icon: FileText,
      bg: "bg-violet-50",
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
      valueColor: "text-violet-700",
    },
    {
      title: "Pending Invoices",
      value: pendingInvoices,
      description: "Awaiting payment",
      icon: Receipt,
      bg: "bg-amber-50",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
      valueColor: "text-amber-700",
    },
  ];

  const quickActions = [
    {
      title: "Book Appointment",
      description: "Find a doctor and schedule a visit",
      icon: CalendarDays,
      path: "/patient/appointments",
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "My Appointments",
      description: "View and manage your appointments",
      icon: Clock3,
      path: "/patient/my-appointments",
      iconBg: "bg-cyan-100",
      iconColor: "text-cyan-600",
    },
    {
      title: "Medical Records",
      description: "Access your medical history",
      icon: FileText,
      path: "/patient/records",
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
    },
    {
      title: "My Invoices",
      description: "Review your billing information",
      icon: Receipt,
      path: "/patient/invoices",
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-7 pb-8">

      {/* =====================================================
          WELCOME HERO
      ====================================================== */}

      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-600 to-cyan-500 p-6 text-white shadow-lg sm:p-8">

        {/* Decorative circles */}
        <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-white/10" />

        <div className="absolute -bottom-24 right-20 h-48 w-48 rounded-full bg-cyan-300/10" />

        <div className="absolute right-8 top-8 hidden opacity-20 sm:block">
          <HeartPulse size={120} strokeWidth={1} />
        </div>

        <div className="relative z-10 max-w-2xl">

          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium backdrop-blur-sm">
            <HeartPulse size={15} />
            Your health, simplified
          </div>

          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back! 👋
          </h1>

          <p className="mt-3 max-w-xl text-sm leading-6 text-blue-50 sm:text-base">
            Manage your appointments, medical records, invoices,
            and healthcare information — all in one place.
          </p>

          <button
            onClick={() => navigate("/patient/appointments")}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-700 shadow-md transition hover:-translate-y-0.5 hover:bg-blue-50 hover:shadow-lg"
          >
            Book an Appointment
            <ArrowRight size={17} />
          </button>

        </div>
      </section>


      {/* =====================================================
          STATISTICS
      ====================================================== */}

      <section>
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Your Overview
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            A quick look at your healthcare activity.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <div
                key={stat.title}
                className={`group relative overflow-hidden rounded-2xl border border-gray-100 ${stat.bg} p-5 shadow-sm transition duration-200 hover:-translate-y-1 hover:shadow-md`}
              >

                <div className="flex items-start justify-between">

                  <div>
                    <p className="text-sm font-medium text-gray-600">
                      {stat.title}
                    </p>

                    <p
                      className={`mt-3 text-3xl font-bold ${stat.valueColor}`}
                    >
                      {stat.value}
                    </p>

                    <p className="mt-1 text-xs text-gray-500">
                      {stat.description}
                    </p>
                  </div>

                  <div
                    className={`rounded-xl ${stat.iconBg} p-3 ${stat.iconColor} transition group-hover:scale-110`}
                  >
                    <Icon size={22} />
                  </div>

                </div>

                <div className="absolute -bottom-8 -right-8 h-20 w-20 rounded-full bg-white/30" />

              </div>
            );
          })}

        </div>
      </section>


      {/* =====================================================
          QUICK ACTIONS
      ====================================================== */}

      <section>

        <div className="mb-4 flex items-end justify-between">

          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Quick Actions
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Access your most frequently used features.
            </p>
          </div>

        </div>

        <div className="grid gap-4 sm:grid-cols-2">

          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <button
                key={action.path}
                onClick={() => navigate(action.path)}
                className="group flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm transition duration-200 hover:-translate-y-1 hover:border-blue-100 hover:shadow-md"
              >

                <div className="flex items-center gap-4">

                  <div
                    className={`rounded-xl ${action.iconBg} ${action.iconColor} p-3 transition duration-200 group-hover:scale-105`}
                  >
                    <Icon size={23} />
                  </div>

                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {action.title}
                    </h3>

                    <p className="mt-1 text-sm text-gray-500">
                      {action.description}
                    </p>
                  </div>

                </div>

                <div className="ml-3 rounded-full bg-gray-50 p-2 text-gray-400 transition group-hover:bg-blue-50 group-hover:text-blue-600">
                  <ArrowRight
                    size={18}
                    className="transition group-hover:translate-x-0.5"
                  />
                </div>

              </button>
            );
          })}

        </div>

      </section>


      {/* =====================================================
          HEALTHCARE SERVICES
      ====================================================== */}

      <section>

        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Healthcare at Your Fingertips
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            Everything you need to stay on top of your healthcare.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">

          {/* Appointments */}
          <div className="rounded-2xl border border-blue-100 bg-gradient-to-br from-blue-50 to-white p-5">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <CalendarDays size={22} />
            </div>

            <h3 className="font-semibold text-gray-900">
              Easy Appointments
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Schedule and manage your doctor appointments
              whenever you need them.
            </p>
          </div>


          {/* Records */}
          <div className="rounded-2xl border border-violet-100 bg-gradient-to-br from-violet-50 to-white p-5">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <Stethoscope size={22} />
            </div>

            <h3 className="font-semibold text-gray-900">
              Digital Health Records
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Keep your medical information organized and
              accessible in one secure place.
            </p>
          </div>


          {/* Security */}
          <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-white p-5">
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <ShieldCheck size={22} />
            </div>

            <h3 className="font-semibold text-gray-900">
              Secure Healthcare
            </h3>

            <p className="mt-2 text-sm leading-6 text-gray-500">
              Your healthcare information is managed through
              secure authenticated access.
            </p>
          </div>

        </div>

      </section>


      {/* =====================================================
          BOTTOM HEALTH CARD
      ====================================================== */}

      <section className="overflow-hidden rounded-2xl border border-cyan-100 bg-gradient-to-r from-cyan-50 via-white to-blue-50 p-6">

        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">

          <div className="flex items-start gap-4">

            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-cyan-100 text-cyan-600">
              <Activity size={24} />
            </div>

            <div>
              <h2 className="font-semibold text-gray-900">
                Stay on top of your health
              </h2>

              <p className="mt-1 max-w-xl text-sm leading-6 text-gray-500">
                Keep your appointments, records, and healthcare
                information organized with MedAssist.
              </p>
            </div>

          </div>

          <button
            onClick={() => navigate("/patient/notifications")}
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-blue-200 bg-white px-4 py-2.5 text-sm font-semibold text-blue-600 shadow-sm transition hover:bg-blue-50"
          >
            View Notifications
            <ArrowRight size={16} />
          </button>

        </div>

      </section>

    </div>
  );
}

export default PatientDashboard;