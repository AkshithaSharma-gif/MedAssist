import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
  CheckCircle2,
  ReceiptText,
  Users,
  ArrowRight,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function ReceptionistDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState({
    todayAppointments: 0,
    scheduledAppointments: 0,
    confirmedAppointments: 0,
    pendingInvoices: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get(
          "/dashboard/receptionist"
        );

        setDashboard(
          response.data.dashboard || {
            todayAppointments: 0,
            scheduledAppointments: 0,
            confirmedAppointments: 0,
            pendingInvoices: 0,
          }
        );
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.message ||
            "Failed to load receptionist dashboard"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-slate-500">
          <Loader2
            size={32}
            className="animate-spin text-blue-600"
          />

          <p className="text-sm font-medium">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
            <AlertCircle size={22} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-slate-800">
              Unable to load dashboard
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {error}
            </p>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Today's Appointments",
      value: dashboard.todayAppointments,
      icon: CalendarDays,
      iconBg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Scheduled",
      value: dashboard.scheduledAppointments,
      icon: Clock3,
      iconBg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
    {
      title: "Confirmed",
      value: dashboard.confirmedAppointments,
      icon: CheckCircle2,
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      title: "Pending Invoices",
      value: dashboard.pendingInvoices,
      icon: ReceiptText,
      iconBg: "bg-purple-50",
      iconColor: "text-purple-600",
    },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white shadow-lg sm:p-8">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
              <Users size={25} />
            </div>

            <h1 className="text-2xl font-bold sm:text-3xl">
              Receptionist Dashboard
            </h1>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-50 sm:text-base">
              Manage appointments, patients, and billing
              efficiently from one place.
            </p>
          </div>

          <div className="hidden rounded-xl bg-white/10 px-5 py-4 backdrop-blur-sm sm:block">
            <p className="text-xs text-blue-100">
              Today's Appointments
            </p>

            <p className="mt-1 text-3xl font-bold">
              {dashboard.todayAppointments}
            </p>
          </div>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    {stat.title}
                  </p>

                  <p className="mt-2 text-3xl font-bold text-slate-800">
                    {stat.value}
                  </p>
                </div>

                <div
                  className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.iconBg} ${stat.iconColor}`}
                >
                  <Icon size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-slate-800">
            Quick Actions
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Quickly access the tasks you manage most often.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

          {/* Patients */}
          <button
            type="button"
            onClick={() =>
              navigate("/receptionist/patients")
            }
            className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Users size={21} />
              </div>

              <ArrowRight
                size={18}
                className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600"
              />
            </div>

            <h3 className="mt-4 font-semibold text-slate-800">
              Manage Patients
            </h3>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              View and manage patient information.
            </p>
          </button>

          {/* Appointments */}
          <button
            type="button"
            onClick={() =>
              navigate("/receptionist/appointments")
            }
            className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                <CalendarDays size={21} />
              </div>

              <ArrowRight
                size={18}
                className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600"
              />
            </div>

            <h3 className="mt-4 font-semibold text-slate-800">
              Manage Appointments
            </h3>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              View, confirm, and manage appointments.
            </p>
          </button>

          {/* Invoices */}
          <button
            type="button"
            onClick={() =>
              navigate("/receptionist/invoices")
            }
            className="group rounded-2xl border border-slate-200 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
          >
            <div className="flex items-start justify-between">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                <ReceiptText size={21} />
              </div>

              <ArrowRight
                size={18}
                className="text-slate-300 transition group-hover:translate-x-1 group-hover:text-blue-600"
              />
            </div>

            <h3 className="mt-4 font-semibold text-slate-800">
              Manage Invoices
            </h3>

            <p className="mt-1 text-sm leading-5 text-slate-500">
              View invoices and record payments.
            </p>
          </button>
        </div>
      </div>

      {/* Overview */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-800">
              Reception Overview
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Keep track of today's front-desk activity.
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              navigate("/receptionist/appointments")
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            View Appointments
            <ArrowRight size={17} />
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Today
            </p>

            <p className="mt-1 text-xl font-bold text-slate-800">
              {dashboard.todayAppointments}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Appointments scheduled today
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Awaiting Confirmation
            </p>

            <p className="mt-1 text-xl font-bold text-amber-600">
              {dashboard.scheduledAppointments}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Scheduled appointments
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Billing
            </p>

            <p className="mt-1 text-xl font-bold text-purple-600">
              {dashboard.pendingInvoices}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Pending invoices
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ReceptionistDashboard;