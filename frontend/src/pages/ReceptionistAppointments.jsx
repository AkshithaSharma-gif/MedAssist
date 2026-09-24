import { useEffect, useState, useCallback } from "react";
import {
  CalendarDays,
  Search,
  CheckCircle2,
  XCircle,
  Clock3,
  CheckCheck,
  Filter,
  Loader2,
  AlertCircle,
  Plus,
  User2,
  Stethoscope,
  Building2,
  ClipboardList,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

const STATUS_FILTERS = ["all", "scheduled", "confirmed", "completed", "cancelled"];

const statusBadge = {
  scheduled: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  confirmed: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  completed: "bg-blue-50 text-blue-700 ring-1 ring-blue-200",
  cancelled: "bg-red-50 text-red-700 ring-1 ring-red-200",
};

const statusIcon = {
  scheduled: <Clock3 size={13} />,
  confirmed: <CheckCircle2 size={13} />,
  completed: <CheckCheck size={13} />,
  cancelled: <XCircle size={13} />,
};

function ReceptionistAppointments() {
  const navigate = useNavigate();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [updatingId, setUpdatingId] = useState(null);
  const [actionError, setActionError] = useState("");
  const [actionSuccess, setActionSuccess] = useState("");

  const fetchAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/appointments");

      setAppointments(response.data.appointments || []);
    } catch (err) {
      console.error("Failed to fetch appointments:", err);
      setError(err.response?.data?.message || "Failed to load appointments");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments();
  }, [fetchAppointments]);

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    setUpdatingId(appointmentId);
    setActionError("");
    setActionSuccess("");

    try {
      await api.put(`/appointments/${appointmentId}/status`, {
        status: newStatus,
      });

      setActionSuccess(
        `Appointment ${newStatus === "confirmed" ? "confirmed" : "cancelled"} successfully.`
      );

      await fetchAppointments();

      setTimeout(() => setActionSuccess(""), 3500);
    } catch (err) {
      console.error("Status update error:", err);
      setActionError(
        err.response?.data?.message || "Failed to update appointment status"
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "";
    const [hours, minutes] = time.split(":").map(Number);
    const d = new Date();
    d.setHours(hours, minutes, 0, 0);
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const filteredAppointments = appointments.filter((appt) => {
    const patientName = appt.patientId?.userId?.name || "";
    const doctorName = appt.doctorId?.userId?.name || "";
    const department = appt.departmentId?.name || "";
    const service = appt.serviceId?.name || "";

    const matchesSearch =
      patientName.toLowerCase().includes(search.toLowerCase()) ||
      doctorName.toLowerCase().includes(search.toLowerCase()) ||
      department.toLowerCase().includes(search.toLowerCase()) ||
      service.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "all" || appt.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
          <p className="mt-1 text-sm text-gray-500">
            View and manage all patient appointments
          </p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/receptionist/appointments/create")}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <Plus size={19} />
          Create Appointment
        </button>
      </div>

      {/* Feedback */}
      {actionSuccess && (
        <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <CheckCircle2 size={18} />
          {actionSuccess}
        </div>
      )}

      {actionError && (
        <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle size={18} />
          {actionError}
        </div>
      )}

      {/* Filters */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              placeholder="Search by patient, doctor, department or service..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <Filter size={17} className="shrink-0 text-gray-400" />
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-lg px-3 py-2 text-xs font-semibold capitalize transition ${statusFilter === status
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center rounded-2xl bg-white py-16 shadow-sm">
          <div className="flex items-center gap-3 text-gray-500">
            <Loader2 size={22} className="animate-spin" />
            <span className="text-sm">Loading appointments...</span>
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-2xl bg-red-50 p-5 text-red-700">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold">Unable to load appointments</p>
              <p className="mt-1 text-sm">{error}</p>
              <button
                type="button"
                onClick={fetchAppointments}
                className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filteredAppointments.length === 0 && (
        <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <CalendarDays size={26} />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            No appointments found
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {search || statusFilter !== "all"
              ? "Try adjusting your search or filter."
              : "No appointments have been created yet."}
          </p>
        </div>
      )}

      {/* Appointments List */}
      {!loading && !error && filteredAppointments.length > 0 && (
        <div className="space-y-4">
          {filteredAppointments.map((appt) => {
            const isUpdating = updatingId === appt._id;
            const canConfirm = appt.status === "scheduled";
            const canCancel =
              appt.status === "scheduled" || appt.status === "confirmed";

            return (
              <div
                key={appt._id}
                className="rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  {/* Left Info */}
                  <div className="flex-1 space-y-3">
                    {/* Status Badge */}
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${statusBadge[appt.status] || "bg-gray-100 text-gray-600"
                          }`}
                      >
                        {statusIcon[appt.status]}
                        {appt.status}
                      </span>

                      <span className="text-xs text-gray-400">
                        {formatDate(appt.appointmentDate)}
                        {appt.startTime && ` · ${formatTime(appt.startTime)}`}
                        {appt.endTime && ` – ${formatTime(appt.endTime)}`}
                      </span>
                    </div>

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <User2 size={15} className="shrink-0 text-gray-400" />
                        <span className="font-medium text-gray-800">
                          {appt.patientId?.userId?.name || "Unknown Patient"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <Stethoscope
                          size={15}
                          className="shrink-0 text-gray-400"
                        />
                        <span>
                          {appt.doctorId?.userId?.name || "Unknown Doctor"}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <Building2
                          size={15}
                          className="shrink-0 text-gray-400"
                        />
                        <span>{appt.departmentId?.name || "N/A"}</span>
                      </div>

                      <div className="flex items-center gap-2 text-gray-600">
                        <ClipboardList
                          size={15}
                          className="shrink-0 text-gray-400"
                        />
                        <span>{appt.serviceId?.name || "N/A"}</span>
                      </div>
                    </div>

                    {/* Reason */}
                    {appt.reason && (
                      <p className="rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
                        <span className="font-medium text-gray-700">
                          Reason:{" "}
                        </span>
                        {appt.reason}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  {(canConfirm || canCancel) && (
                    <div className="flex shrink-0 flex-row gap-2 sm:flex-col">
                      {canConfirm && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() =>
                            handleStatusUpdate(appt._id, "confirmed")
                          }
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isUpdating ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <CheckCircle2 size={16} />
                          )}
                          Confirm
                        </button>
                      )}

                      {canCancel && (
                        <button
                          type="button"
                          disabled={isUpdating}
                          onClick={() =>
                            handleStatusUpdate(appt._id, "cancelled")
                          }
                          className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isUpdating ? (
                            <Loader2 size={16} className="animate-spin" />
                          ) : (
                            <XCircle size={16} />
                          )}
                          Cancel
                        </button>
                      )}
                    </div>
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

export default ReceptionistAppointments;