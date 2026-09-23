import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Search,
  RefreshCw,
  CheckCircle2,
  XCircle,
  Clock3,
  User,
  Stethoscope,
  ClipboardList,
  Building2,
} from "lucide-react";
import api from "../services/api";

function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const fetchAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/appointments");

      setAppointments(response.data.appointments || []);
    } catch (err) {
      console.error("Fetch appointments error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load appointments. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const getPatientName = (appointment) => {
    return (
      appointment.patientId?.userId?.name ||
      appointment.patientId?.name ||
      appointment.patient?.userId?.name ||
      appointment.patient?.name ||
      "Unknown Patient"
    );
  };

  const getDoctorName = (appointment) => {
    return (
      appointment.doctorId?.userId?.name ||
      appointment.doctorId?.name ||
      appointment.doctor?.userId?.name ||
      appointment.doctor?.name ||
      "Unknown Doctor"
    );
  };

  const getDepartmentName = (appointment) => {
    return (
      appointment.departmentId?.name ||
      appointment.department?.name ||
      "Not specified"
    );
  };

  const getServiceName = (appointment) => {
    return (
      appointment.serviceId?.name ||
      appointment.service?.name ||
      "Not specified"
    );
  };

  const filteredAppointments = useMemo(() => {
    const query = search.toLowerCase().trim();

    return appointments.filter((appointment) => {
      const patient = getPatientName(appointment).toLowerCase();
      const doctor = getDoctorName(appointment).toLowerCase();
      const department =
        getDepartmentName(appointment).toLowerCase();
      const service = getServiceName(appointment).toLowerCase();

      const matchesSearch =
        !query ||
        patient.includes(query) ||
        doctor.includes(query) ||
        department.includes(query) ||
        service.includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        appointment.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [appointments, search, statusFilter]);

  const handleStatusChange = async (appointmentId, status) => {
    try {
      setUpdatingId(appointmentId);
      setError("");

      await api.put(
        `/appointments/${appointmentId}/status`,
        { status }
      );

      await fetchAppointments();
    } catch (err) {
      console.error("Update appointment status error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to update appointment status."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Not specified";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "Not specified";

    // Handles values such as "09:30"
    if (/^\d{1,2}:\d{2}$/.test(time)) {
      const [hours, minutes] = time.split(":");
      const date = new Date();

      date.setHours(Number(hours), Number(minutes), 0, 0);

      return date.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
      });
    }

    return time;
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-50 text-blue-600";

      case "confirmed":
        return "bg-emerald-50 text-emerald-600";

      case "completed":
        return "bg-purple-50 text-purple-600";

      case "cancelled":
        return "bg-red-50 text-red-600";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const total = appointments.length;

  const scheduled = appointments.filter(
    (item) => item.status === "scheduled"
  ).length;

  const confirmed = appointments.filter(
    (item) => item.status === "confirmed"
  ).length;

  const completed = appointments.filter(
    (item) => item.status === "completed"
  ).length;

  const cancelled = appointments.filter(
    (item) => item.status === "cancelled"
  ).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
            <CalendarDays size={17} />
            Appointment Management
          </div>

          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Appointments
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage and monitor all patient appointments.
          </p>
        </div>

        <button
          onClick={fetchAppointments}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60 sm:self-auto"
        >
          <RefreshCw
            size={17}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 p-5 text-white shadow-sm">
          <p className="text-sm text-blue-100">
            Total
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {total}
          </h2>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Scheduled
          </p>

          <h2 className="mt-2 text-3xl font-bold text-blue-600">
            {scheduled}
          </h2>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Confirmed
          </p>

          <h2 className="mt-2 text-3xl font-bold text-emerald-600">
            {confirmed}
          </h2>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Completed
          </p>

          <h2 className="mt-2 text-3xl font-bold text-purple-600">
            {completed}
          </h2>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Cancelled
          </p>

          <h2 className="mt-2 text-3xl font-bold text-red-600">
            {cancelled}
          </h2>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patient, doctor, department or service..."
              className="w-full rounded-xl bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">All Statuses</option>
            <option value="scheduled">Scheduled</option>
            <option value="confirmed">Confirmed</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl bg-white shadow-sm">
          <div className="text-center">
            <RefreshCw
              size={30}
              className="mx-auto animate-spin text-blue-600"
            />

            <p className="mt-3 text-sm text-slate-500">
              Loading appointments...
            </p>
          </div>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="rounded-2xl bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <CalendarDays size={26} />
          </div>

          <h3 className="mt-4 text-lg font-semibold text-slate-800">
            No appointments found
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Try changing your search or status filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filteredAppointments.length}
            </span>{" "}
            appointment
            {filteredAppointments.length !== 1
              ? "s"
              : ""}
          </p>

          {filteredAppointments.map((appointment) => {
            const patientName =
              getPatientName(appointment);

            const doctorName =
              getDoctorName(appointment);

            const departmentName =
              getDepartmentName(appointment);

            const serviceName =
              getServiceName(appointment);

            const isUpdating =
              updatingId === appointment._id;

            return (
              <div
                key={appointment._id}
                className="rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                  {/* Main information */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <CalendarDays size={22} />
                        </div>

                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {serviceName}
                          </h3>

                          <p className="text-xs text-slate-400">
                            Appointment ID:{" "}
                            {appointment._id}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(
                          appointment.status
                        )}`}
                      >
                        {appointment.status ||
                          "unknown"}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <div className="flex items-center gap-2">
                          <User
                            size={16}
                            className="text-slate-400"
                          />

                          <p className="text-xs text-slate-400">
                            Patient
                          </p>
                        </div>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {patientName}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <div className="flex items-center gap-2">
                          <Stethoscope
                            size={16}
                            className="text-slate-400"
                          />

                          <p className="text-xs text-slate-400">
                            Doctor
                          </p>
                        </div>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {doctorName}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <div className="flex items-center gap-2">
                          <Building2
                            size={16}
                            className="text-slate-400"
                          />

                          <p className="text-xs text-slate-400">
                            Department
                          </p>
                        </div>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {departmentName}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <div className="flex items-center gap-2">
                          <ClipboardList
                            size={16}
                            className="text-slate-400"
                          />

                          <p className="text-xs text-slate-400">
                            Service
                          </p>
                        </div>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {serviceName}
                        </p>
                      </div>
                    </div>

                    {/* Date and time */}
                    <div className="mt-4 flex flex-wrap gap-3">
                      <div className="flex items-center gap-2 rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-700">
                        <CalendarDays size={16} />

                        {formatDate(
                          appointment.appointmentDate
                        )}
                      </div>

                      <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
                        <Clock3 size={16} />

                        {formatTime(
                          appointment.appointmentTime
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex shrink-0 flex-wrap gap-2 xl:w-52 xl:flex-col">
                    {appointment.status ===
                      "scheduled" && (
                      <>
                        <button
                          onClick={() =>
                            handleStatusChange(
                              appointment._id,
                              "confirmed"
                            )
                          }
                          disabled={isUpdating}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isUpdating ? (
                            <RefreshCw
                              size={16}
                              className="animate-spin"
                            />
                          ) : (
                            <CheckCircle2 size={16} />
                          )}
                          Confirm
                        </button>

                        <button
                          onClick={() =>
                            handleStatusChange(
                              appointment._id,
                              "cancelled"
                            )
                          }
                          disabled={isUpdating}
                          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <XCircle size={16} />
                          Cancel
                        </button>
                      </>
                    )}

                    {appointment.status ===
                      "confirmed" && (
                      <button
                        onClick={() =>
                          handleStatusChange(
                            appointment._id,
                            "cancelled"
                          )
                        }
                        disabled={isUpdating}
                        className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {isUpdating ? (
                          <RefreshCw
                            size={16}
                            className="animate-spin"
                          />
                        ) : (
                          <XCircle size={16} />
                        )}
                        Cancel
                      </button>
                    )}

                    {appointment.status ===
                      "completed" && (
                      <div className="flex items-center justify-center gap-2 rounded-xl bg-purple-50 px-4 py-2.5 text-sm font-medium text-purple-600">
                        <CheckCircle2 size={16} />
                        Completed
                      </div>
                    )}

                    {appointment.status ===
                      "cancelled" && (
                      <div className="flex items-center justify-center gap-2 rounded-xl bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600">
                        <XCircle size={16} />
                        Cancelled
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdminAppointments;