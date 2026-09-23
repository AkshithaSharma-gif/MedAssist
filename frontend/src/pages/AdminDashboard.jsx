import { useEffect, useState } from "react";
import {
  Users,
  Stethoscope,
  CalendarDays,
  Building2,
  Receipt,
  Activity,
  RefreshCw,
  UserCheck,
  Clock3,
} from "lucide-react";
import api from "../services/api";

function AdminDashboard() {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/dashboard/admin");

      setDashboard(response.data);
    } catch (err) {
      console.error("Fetch admin dashboard error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load dashboard. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[500px] items-center justify-center">
        <div className="text-center">
          <RefreshCw
            size={32}
            className="mx-auto animate-spin text-blue-600"
          />

          <p className="mt-3 text-sm text-slate-500">
            Loading admin dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-500">
            <Activity size={26} />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-800">
            Unable to load dashboard
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {error}
          </p>

          <button
            onClick={fetchDashboard}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700"
          >
            <RefreshCw size={16} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  /*
    Backend response structure:

    dashboard: {
      users: {
        totalPatients,
        totalDoctors
      },
      resources: {
        totalDepartments,
        totalServices
      },
      appointments: {
        total,
        today,
        status: {
          scheduled,
          confirmed,
          completed,
          cancelled
        }
      },
      revenue: {
        totalRevenue,
        pendingRevenue
      }
    }
  */

  const stats = dashboard?.dashboard || {};

  const totalPatients =
    stats.users?.totalPatients ?? 0;

  const totalDoctors =
    stats.users?.totalDoctors ?? 0;

  const totalAppointments =
    stats.appointments?.total ?? 0;

  const totalDepartments =
    stats.resources?.totalDepartments ?? 0;

  const totalInvoices = 0;

  const pendingInvoices = 0;

  const completedAppointments =
    stats.appointments?.status?.completed ?? 0;

  const upcomingAppointments =
    (stats.appointments?.status?.scheduled ?? 0) +
    (stats.appointments?.status?.confirmed ?? 0);

  const statCards = [
    {
      title: "Total Patients",
      value: totalPatients,
      icon: Users,
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Total Doctors",
      value: totalDoctors,
      icon: Stethoscope,
      bg: "bg-cyan-50",
      iconColor: "text-cyan-600",
    },
    {
      title: "Appointments",
      value: totalAppointments,
      icon: CalendarDays,
      bg: "bg-violet-50",
      iconColor: "text-violet-600",
    },
    {
      title: "Departments",
      value: totalDepartments,
      icon: Building2,
      bg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
            <Activity size={17} />
            Administration
          </div>

          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Admin Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Overview of your hospital management system.
          </p>
        </div>

        <button
          onClick={fetchDashboard}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
        >
          <RefreshCw size={17} />
          Refresh
        </button>
      </div>

      {/* Main statistics */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.title}
              className="rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-500">
                    {card.title}
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-slate-900">
                    {card.value}
                  </h2>
                </div>

                <div
                  className={`rounded-xl p-3 ${card.bg} ${card.iconColor}`}
                >
                  <Icon size={25} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Appointment overview */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 p-6 text-white shadow-sm lg:col-span-2">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-blue-100">
                Appointment Overview
              </p>

              <h2 className="mt-1 text-2xl font-bold">
                {totalAppointments} Total Appointments
              </h2>
            </div>

            <div className="rounded-xl bg-white/15 p-3">
              <CalendarDays size={25} />
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-white/10 p-4">
              <p className="text-xs text-blue-100">
                Upcoming
              </p>

              <p className="mt-1 text-2xl font-bold">
                {upcomingAppointments}
              </p>
            </div>

            <div className="rounded-xl bg-white/10 p-4">
              <p className="text-xs text-blue-100">
                Completed
              </p>

              <p className="mt-1 text-2xl font-bold">
                {completedAppointments}
              </p>
            </div>

            <div className="rounded-xl bg-white/10 p-4">
              <p className="text-xs text-blue-100">
                Total
              </p>

              <p className="mt-1 text-2xl font-bold">
                {totalAppointments}
              </p>
            </div>
          </div>
        </div>

        {/* Patient / Doctor summary */}
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <h3 className="font-semibold text-slate-900">
            Healthcare Staff
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Current registered users
          </p>

          <div className="mt-5 space-y-4">
            <div className="flex items-center justify-between rounded-xl bg-blue-50 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-white p-2 text-blue-600">
                  <Users size={19} />
                </div>

                <span className="text-sm font-medium text-slate-700">
                  Patients
                </span>
              </div>

              <span className="font-bold text-slate-900">
                {totalPatients}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-cyan-50 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-white p-2 text-cyan-600">
                  <UserCheck size={19} />
                </div>

                <span className="text-sm font-medium text-slate-700">
                  Doctors
                </span>
              </div>

              <span className="font-bold text-slate-900">
                {totalDoctors}
              </span>
            </div>

            <div className="flex items-center justify-between rounded-xl bg-emerald-50 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-white p-2 text-emerald-600">
                  <Building2 size={19} />
                </div>

                <span className="text-sm font-medium text-slate-700">
                  Departments
                </span>
              </div>

              <span className="font-bold text-slate-900">
                {totalDepartments}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice overview */}
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Total Invoices
              </p>

              <h2 className="mt-1 text-3xl font-bold text-slate-900">
                {totalInvoices}
              </h2>
            </div>

            <div className="rounded-xl bg-violet-50 p-3 text-violet-600">
              <Receipt size={25} />
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
            <Receipt size={16} />
            All generated invoices
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Pending Invoices
              </p>

              <h2 className="mt-1 text-3xl font-bold text-slate-900">
                {pendingInvoices}
              </h2>
            </div>

            <div className="rounded-xl bg-amber-50 p-3 text-amber-600">
              <Clock3 size={25} />
            </div>
          </div>

          <div className="mt-5 flex items-center gap-2 text-sm text-slate-500">
            <Clock3 size={16} />
            Awaiting payment
          </div>
        </div>
      </div>

      {/* System overview */}
      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-blue-50 p-3 text-blue-600">
            <Activity size={22} />
          </div>

          <div>
            <h3 className="font-semibold text-slate-900">
              System Overview
            </h3>

            <p className="text-sm text-slate-500">
              MedAssist hospital management system
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-400">
              Patients
            </p>

            <p className="mt-1 text-lg font-semibold text-slate-800">
              {totalPatients}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-400">
              Doctors
            </p>

            <p className="mt-1 text-lg font-semibold text-slate-800">
              {totalDoctors}
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs text-slate-400">
              Appointments
            </p>

            <p className="mt-1 text-lg font-semibold text-slate-800">
              {totalAppointments}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;