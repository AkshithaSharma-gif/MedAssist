import { useEffect, useState } from "react";
import {
  CalendarDays,
  Clock3,
  Stethoscope,
  Building2,
  ClipboardList,
  XCircle,
  CheckCircle2,
  AlertCircle,
  Loader2,
  UserRound,
  FileText,
} from "lucide-react";
import api from "../services/api";

function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchAppointments = async () => {
    try {
      setError("");

      const response = await api.get("/appointments");

      const fetchedAppointments =
        response.data.appointments ||
        response.data.data ||
        [];

      // Do not display cancelled appointments
      setAppointments(
        fetchedAppointments.filter(
          (appointment) =>
            appointment.status !== "cancelled"
        )
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

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatTime = (time) => {
    if (!time) return "N/A";

    const [hour, minute] = time
      .split(":")
      .map(Number);

    const date = new Date();

    date.setHours(hour, minute, 0, 0);

    return date.toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getStatusStyles = (status) => {
    switch (status) {
      case "scheduled":
        return {
          container:
            "border-blue-200 bg-blue-50 text-blue-700",
          icon: <Clock3 size={15} />,
          label: "Scheduled",
        };

      case "confirmed":
        return {
          container:
            "border-emerald-200 bg-emerald-50 text-emerald-700",
          icon: <CheckCircle2 size={15} />,
          label: "Confirmed",
        };

      case "completed":
        return {
          container:
            "border-slate-200 bg-slate-100 text-slate-600",
          icon: <CheckCircle2 size={15} />,
          label: "Completed",
        };

      default:
        return {
          container:
            "border-slate-200 bg-slate-50 text-slate-600",
          icon: <AlertCircle size={15} />,
          label: status || "Unknown",
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <Loader2
                size={32}
                className="animate-spin text-blue-600"
              />
              <p className="text-sm font-medium">
                Loading your appointments...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <AlertCircle size={22} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Unable to load appointments
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setLoading(true);
                    fetchAppointments();
                  }}
                  className="mt-4 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
                >
                  Try Again
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">

        {/* Page Header */}
        <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                <CalendarDays size={25} />
              </div>

              <h1 className="text-2xl font-bold sm:text-3xl">
                My Appointments
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-50 sm:text-base">
                View and manage your upcoming and previous
                healthcare appointments in one place.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
              <CalendarDays size={20} />

              <div>
                <p className="text-xs text-blue-100">
                  Total Appointments
                </p>

                <p className="text-xl font-bold">
                  {appointments.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {appointments.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <CalendarDays size={30} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-800">
              No appointments found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              You don't have any appointments yet. Once you
              book an appointment, it will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {appointments.map((appointment) => {
              const status = getStatusStyles(
                appointment.status
              );

              const canCancel = [
                "scheduled",
                "confirmed",
              ].includes(appointment.status);

              return (
                <div
                  key={appointment._id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  {/* Appointment Card Header */}
                  <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Stethoscope size={23} />
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Appointment
                        </p>

                        <h2 className="mt-0.5 text-lg font-bold text-slate-800">
                          {appointment.doctorId?.name ||
                            "Doctor"}
                        </h2>
                      </div>
                    </div>

                    <div
                      className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${status.container}`}
                    >
                      {status.icon}
                      {status.label}
                    </div>
                  </div>

                  {/* Appointment Details */}
                  <div className="p-5 sm:p-6">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                      {/* Department */}
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Building2 size={17} />

                          <span className="text-xs font-semibold uppercase tracking-wide">
                            Department
                          </span>
                        </div>

                        <p className="mt-2 text-sm font-semibold text-slate-700">
                          {appointment.departmentId?.name ||
                            "N/A"}
                        </p>
                      </div>

                      {/* Service */}
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex items-center gap-2 text-slate-400">
                          <ClipboardList size={17} />

                          <span className="text-xs font-semibold uppercase tracking-wide">
                            Service
                          </span>
                        </div>

                        <p className="mt-2 text-sm font-semibold text-slate-700">
                          {appointment.serviceId?.name ||
                            "N/A"}
                        </p>
                      </div>

                      {/* Date */}
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex items-center gap-2 text-slate-400">
                          <CalendarDays size={17} />

                          <span className="text-xs font-semibold uppercase tracking-wide">
                            Date
                          </span>
                        </div>

                        <p className="mt-2 text-sm font-semibold text-slate-700">
                          {formatDate(
                            appointment.appointmentDate
                          )}
                        </p>
                      </div>

                      {/* Time */}
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Clock3 size={17} />

                          <span className="text-xs font-semibold uppercase tracking-wide">
                            Time
                          </span>
                        </div>

                        <p className="mt-2 text-sm font-semibold text-slate-700">
                          {formatTime(
                            appointment.startTime
                          )}

                          {appointment.endTime && (
                            <span className="font-normal text-slate-400">
                              {" "}
                              -{" "}
                              {formatTime(
                                appointment.endTime
                              )}
                            </span>
                          )}
                        </p>
                      </div>
                    </div>

                    {/* Doctor Information */}
                    <div className="mt-5 flex flex-col gap-4 rounded-xl border border-blue-100 bg-blue-50/60 p-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
                          <UserRound size={19} />
                        </div>

                        <div>
                          <p className="text-xs font-medium text-blue-500">
                            Consulting Doctor
                          </p>

                          <p className="text-sm font-bold text-slate-700">
                            {appointment.doctorId?.name ||
                              "Doctor"}
                          </p>
                        </div>
                      </div>

                      {appointment.reason && (
                        <div className="flex items-start gap-2 sm:max-w-md">
                          <FileText
                            size={17}
                            className="mt-0.5 shrink-0 text-blue-500"
                          />

                          <div>
                            <p className="text-xs font-medium text-blue-500">
                              Reason
                            </p>

                            <p className="mt-0.5 text-sm text-slate-600">
                              {appointment.reason}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {canCancel && (
                      <div className="mt-5 flex justify-end border-t border-slate-100 pt-5">
                        <button
                          type="button"
                          onClick={() =>
                            handleCancel(
                              appointment._id
                            )
                          }
                          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-white px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-50 hover:border-red-300"
                        >
                          <XCircle size={17} />
                          Cancel Appointment
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyAppointments;