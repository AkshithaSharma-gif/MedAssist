import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays,
  Clock,
  User,
  Phone,
  Mail,
  Stethoscope,
  CheckCircle,
  AlertCircle,
  ClipboardList,
  FileText,
} from "lucide-react";
import api from "../services/api";

function DoctorAppointments() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/appointments/doctor-appointments"
      );

      const fetchedAppointments =
        response.data.appointments || [];

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

  const handleComplete = async (appointmentId) => {
    try {
      setUpdatingId(appointmentId);

      await api.put(
        `/appointments/${appointmentId}/status`,
        {
          status: "completed",
        }
      );

      await fetchAppointments();
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to update appointment"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleConsultation = (appointment) => {
    navigate("/doctor/consultation", {
      state: {
        appointment,
      },
    });
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "scheduled":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "completed":
        return "bg-green-50 text-green-700 border-green-200";

      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const totalAppointments = appointments.length;

  const confirmedAppointments = appointments.filter(
    (appointment) =>
      appointment.status === "confirmed"
  ).length;

  const completedAppointments = appointments.filter(
    (appointment) =>
      appointment.status === "completed"
  ).length;

  const filteredAppointments =
    statusFilter === "all"
      ? appointments
      : appointments.filter(
          (appointment) =>
            appointment.status === statusFilter
        );

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

          <p className="text-sm font-medium text-gray-500">
            Loading appointments...
          </p>
        </div>
      </div>
    );
  }

  if (error && appointments.length === 0) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle
            className="mt-0.5 text-red-600"
            size={22}
          />

          <div>
            <h2 className="font-semibold text-red-700">
              Unable to load appointments
            </h2>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white shadow-sm">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
            <CalendarDays size={25} />
          </div>

          <div>
            <h1 className="text-2xl font-bold">
              My Appointments
            </h1>

            <p className="mt-1 text-sm text-blue-50">
              View and manage your scheduled patient
              appointments.
            </p>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Total Appointments
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {totalAppointments}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <CalendarDays size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Confirmed
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {confirmedAppointments}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
              <CheckCircle size={21} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">
                Completed
              </p>

              <h2 className="mt-2 text-3xl font-bold text-gray-900">
                {completedAppointments}
              </h2>
            </div>

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <ClipboardList size={21} />
            </div>
          </div>
        </div>
      </div>

      {/* Error after an update */}
      {error && appointments.length > 0 && (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Appointment Filters */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Filter Appointments
            </h2>

            <p className="text-xs text-gray-500">
              View appointments by their current status.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {[
              { label: "All", value: "all" },
              {
                label: "Scheduled",
                value: "scheduled",
              },
              {
                label: "Confirmed",
                value: "confirmed",
              },
              {
                label: "Completed",
                value: "completed",
              },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() =>
                  setStatusFilter(filter.value)
                }
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  statusFilter === filter.value
                    ? "bg-blue-600 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Appointment List */}
      {filteredAppointments.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <CalendarDays size={26} />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            No appointments found
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            You currently don't have any appointments.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => {
            const patient =
              appointment.patientId?.userId;

            return (
              <div
                key={appointment._id}
                className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                {/* Top */}
                <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <User size={23} />
                    </div>

                    <div>
                      <h2 className="font-semibold text-gray-900">
                        {patient?.name ||
                          "Unknown Patient"}
                      </h2>

                      <p className="text-sm text-gray-500">
                        Patient
                      </p>
                    </div>
                  </div>

                  <span
                    className={`w-fit rounded-full border px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(
                      appointment.status
                    )}`}
                  >
                    {appointment.status}
                  </span>
                </div>

                {/* Details */}
                <div className="grid grid-cols-1 gap-4 py-5 sm:grid-cols-2 lg:grid-cols-4">
                  <div className="flex items-start gap-3">
                    <CalendarDays
                      size={19}
                      className="mt-0.5 text-blue-600"
                    />

                    <div>
                      <p className="text-xs font-medium text-gray-400">
                        Date
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {formatDate(
                          appointment.appointmentDate
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock
                      size={19}
                      className="mt-0.5 text-cyan-600"
                    />

                    <div>
                      <p className="text-xs font-medium text-gray-400">
                        Time
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {appointment.startTime ||
                          "N/A"}{" "}
                        -{" "}
                        {appointment.endTime ||
                          "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Stethoscope
                      size={19}
                      className="mt-0.5 text-indigo-600"
                    />

                    <div>
                      <p className="text-xs font-medium text-gray-400">
                        Department
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {appointment.departmentId
                          ?.name || "N/A"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <ClipboardList
                      size={19}
                      className="mt-0.5 text-violet-600"
                    />

                    <div>
                      <p className="text-xs font-medium text-gray-400">
                        Service
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {appointment.serviceId
                          ?.name || "N/A"}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Patient Contact */}
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-400">
                    Patient Contact
                  </p>

                  <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
                    {patient?.email && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Mail
                          size={16}
                          className="text-blue-500"
                        />
                        {patient.email}
                      </div>
                    )}

                    {patient?.phone && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone
                          size={16}
                          className="text-cyan-500"
                        />
                        {patient.phone}
                      </div>
                    )}
                  </div>
                </div>

                {/* Reason */}
                {appointment.reason && (
                  <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                      Reason for Visit
                    </p>

                    <p className="mt-1 text-sm leading-6 text-gray-700">
                      {appointment.reason}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-5 flex flex-col justify-end gap-3 border-t border-gray-100 pt-5 sm:flex-row">
                  {appointment.status ===
                    "confirmed" && (
                    <button
                      onClick={() =>
                        handleComplete(
                          appointment._id
                        )
                      }
                      disabled={
                        updatingId ===
                        appointment._id
                      }
                      className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <CheckCircle size={17} />

                      {updatingId ===
                      appointment._id
                        ? "Completing..."
                        : "Mark as Completed"}
                    </button>
                  )}

                  {appointment.status ===
                    "completed" && (
                    <button
                      onClick={() =>
                        handleConsultation(
                          appointment
                        )
                      }
                      className="flex items-center justify-center gap-2 rounded-xl bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-cyan-700"
                    >
                      <FileText size={17} />
                      Consult / Medical Record
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default DoctorAppointments;