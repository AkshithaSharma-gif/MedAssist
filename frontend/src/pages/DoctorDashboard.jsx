import { useEffect, useState } from "react";
import {
  CalendarDays,
  Users,
  FileText,
  Bell,
  Clock,
  ArrowRight,
  Stethoscope,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function DoctorDashboard() {
  const navigate = useNavigate();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/dashboard/doctor");

        setDashboard(response.data.dashboard || response.data);
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.message ||
            "Unable to load doctor dashboard"
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
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />
          <p className="text-sm font-medium text-gray-500">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
        <h2 className="text-lg font-semibold text-red-700">
          Unable to load dashboard
        </h2>
        <p className="mt-1 text-sm text-red-600">{error}</p>
      </div>
    );
  }

  const stats = [
    {
      title: "Today's Appointments",
      value:
        dashboard?.todayAppointments ??
        dashboard?.todaysAppointments ??
        0,
      icon: CalendarDays,
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      title: "Total Patients",
      value: dashboard?.totalPatients ?? 0,
      icon: Users,
      bg: "bg-cyan-50",
      iconColor: "text-cyan-600",
    },
    {
      title: "Medical Records",
      value: dashboard?.medicalRecords ?? 0,
      icon: FileText,
      bg: "bg-indigo-50",
      iconColor: "text-indigo-600",
    },
    {
      title: "Notifications",
      value: dashboard?.unreadNotifications ?? 0,
      icon: Bell,
      bg: "bg-violet-50",
      iconColor: "text-violet-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white shadow-sm">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-white/20">
              <Stethoscope size={24} />
            </div>

            <h1 className="text-2xl font-bold">
              Doctor Dashboard
            </h1>

            <p className="mt-1 text-sm text-blue-50">
              Manage your appointments, patients and medical records.
            </p>
          </div>

          <button
            onClick={() => navigate("/doctor/appointments")}
            className="flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-600 shadow-sm transition hover:bg-blue-50"
          >
            <CalendarDays size={18} />
            View Appointments
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">
                    {stat.title}
                  </p>

                  <h2 className="mt-2 text-3xl font-bold text-gray-900">
                    {stat.value}
                  </h2>
                </div>

                <div
                  className={`flex h-11 w-11 items-center justify-center rounded-xl ${stat.bg}`}
                >
                  <Icon size={21} className={stat.iconColor} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <div className="mb-4">
          <h2 className="text-lg font-bold text-gray-900">
            Quick Actions
          </h2>
          <p className="text-sm text-gray-500">
            Access your most frequently used doctor tools.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <button
            onClick={() => navigate("/doctor/appointments")}
            className="group rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-blue-200 hover:shadow-md"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <CalendarDays size={21} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Appointments
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  View and manage appointments
                </p>
              </div>

              <ArrowRight
                size={18}
                className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-blue-600"
              />
            </div>
          </button>

          <button
            onClick={() => navigate("/doctor/patients")}
            className="group rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-cyan-200 hover:shadow-md"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
              <Users size={21} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Patients
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  View your patient information
                </p>
              </div>

              <ArrowRight
                size={18}
                className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-cyan-600"
              />
            </div>
          </button>

          <button
            onClick={() => navigate("/doctor/records")}
            className="group rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <FileText size={21} />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900">
                  Medical Records
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Manage patient medical records
                </p>
              </div>

              <ArrowRight
                size={18}
                className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-indigo-600"
              />
            </div>
          </button>
        </div>
      </div>

      {/* Information Card */}
      <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-6">
        <div className="flex gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <Clock size={21} />
          </div>

          <div>
            <h3 className="font-semibold text-gray-900">
              Stay on top of your schedule
            </h3>
            <p className="mt-1 text-sm leading-6 text-gray-600">
              Review your appointments, keep patient records updated,
              and stay informed through notifications.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DoctorDashboard;

