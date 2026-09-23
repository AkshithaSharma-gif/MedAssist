
import { useEffect, useState } from "react";
import {
  Users,
  User,
  Mail,
  Phone,
  CalendarDays,
  Search,
  AlertCircle,
  ClipboardList,
} from "lucide-react";
import api from "../services/api";

function DoctorPatients() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await api.get(
          "/appointments/doctor-appointments"
        );

        setAppointments(response.data.appointments || []);
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.message ||
            "Failed to load patients"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPatients();
  }, []);

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // Create a unique patient list from appointments
  const patientMap = new Map();

  appointments.forEach((appointment) => {
    const patient = appointment.patientId;

    if (!patient?._id) return;

    if (!patientMap.has(patient._id)) {
      patientMap.set(patient._id, {
        patient,
        appointments: [],
      });
    }

    patientMap
      .get(patient._id)
      .appointments.push(appointment);
  });

  const patients = Array.from(patientMap.values());

  const filteredPatients = patients.filter(({ patient }) => {
    const user = patient.userId;

    const searchText = [
      user?.name,
      user?.email,
      user?.phone,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return searchText.includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

          <p className="text-sm font-medium text-gray-500">
            Loading patients...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle
            size={22}
            className="mt-0.5 text-red-600"
          />

          <div>
            <h2 className="font-semibold text-red-700">
              Unable to load patients
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
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <Users size={25} />
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                My Patients
              </h1>

              <p className="mt-1 text-sm text-blue-50">
                View patients associated with your appointments.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-white/15 px-4 py-2 text-center">
            <p className="text-2xl font-bold">
              {patients.length}
            </p>

            <p className="text-xs text-blue-50">
              Total Patients
            </p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
        <div className="relative">
          <Search
            size={19}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search patients by name, email or phone..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* Patient Count */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-gray-900">
            Patient List
          </h2>

          <p className="text-sm text-gray-500">
            {filteredPatients.length} patient
            {filteredPatients.length !== 1 ? "s" : ""} found
          </p>
        </div>
      </div>

      {/* Empty State */}
      {filteredPatients.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Users size={26} />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            {patients.length === 0
              ? "No patients found"
              : "No matching patients"}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {patients.length === 0
              ? "Patients will appear here after they have appointments with you."
              : "Try searching with a different name, email or phone number."}
          </p>
        </div>
      ) : (
        /* Patient Cards */
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {filteredPatients.map(
            ({ patient, appointments: patientAppointments }) => {
              const user = patient.userId;

              const latestAppointment =
                patientAppointments[0];

              const completedCount =
                patientAppointments.filter(
                  (appointment) =>
                    appointment.status === "completed"
                ).length;

              return (
                <div
                  key={patient._id}
                  className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  {/* Patient Header */}
                  <div className="flex items-start justify-between gap-4 border-b border-gray-100 pb-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                        <User size={23} />
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {user?.name || "Unknown Patient"}
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                          Patient ID:{" "}
                          {patient._id.slice(-8)}
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      {patientAppointments.length}{" "}
                      {patientAppointments.length === 1
                        ? "Visit"
                        : "Visits"}
                    </span>
                  </div>

                  {/* Contact */}
                  <div className="space-y-3 py-5">
                    {user?.email && (
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Mail
                          size={17}
                          className="text-blue-500"
                        />

                        <span className="break-all">
                          {user.email}
                        </span>
                      </div>
                    )}

                    {user?.phone && (
                      <div className="flex items-center gap-3 text-sm text-gray-600">
                        <Phone
                          size={17}
                          className="text-cyan-500"
                        />

                        <span>{user.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Appointment Summary */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-gray-50 p-4">
                      <div className="flex items-center gap-2">
                        <CalendarDays
                          size={17}
                          className="text-blue-600"
                        />

                        <p className="text-xs font-medium text-gray-500">
                          Last Appointment
                        </p>
                      </div>

                      <p className="mt-2 text-sm font-semibold text-gray-800">
                        {formatDate(
                          latestAppointment?.appointmentDate
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-4">
                      <div className="flex items-center gap-2">
                        <ClipboardList
                          size={17}
                          className="text-green-600"
                        />

                        <p className="text-xs font-medium text-gray-500">
                          Completed
                        </p>
                      </div>

                      <p className="mt-2 text-sm font-semibold text-gray-800">
                        {completedCount}
                      </p>
                    </div>
                  </div>

                  {/* Latest Service */}
                  {latestAppointment?.serviceId?.name && (
                    <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                        Latest Service
                      </p>

                      <p className="mt-1 text-sm font-semibold text-gray-800">
                        {latestAppointment.serviceId.name}
                      </p>
                    </div>
                  )}
                </div>
              );
            }
          )}
        </div>
      )}
    </div>
  );
}

export default DoctorPatients;

