
import { useEffect, useState } from "react";
import {
  FileText,
  User,
  Mail,
  Phone,
  CalendarDays,
  Search,
  AlertCircle,
  Stethoscope,
  Pill,
  ClipboardList,
  Clock,
} from "lucide-react";
import api from "../services/api";

function DoctorMedicalRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await api.get(
          "/medical-records/doctor-records"
        );

        setRecords(response.data.records || []);
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.message ||
            "Failed to load medical records"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchRecords();
  }, []);

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "N/A";

    const [hours, minutes] = time.split(":");
    const date = new Date();

    date.setHours(Number(hours), Number(minutes), 0, 0);

    return date.toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredRecords = records.filter((record) => {
    const patient = record.patientId?.userId;

    const searchText = [
      patient?.name,
      patient?.email,
      patient?.phone,
      record.diagnosis,
      record.symptoms,
      record.treatmentNotes,
      record.prescription
  ?.map(
    (medicine) =>
      `${medicine.medicineName || ""} ${
        medicine.dosage || ""
      } ${medicine.frequency || ""} ${
        medicine.duration || ""
      } ${medicine.instructions || ""}`
  )
  .join(" "),,
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
            Loading medical records...
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
              Unable to load medical records
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
              <FileText size={25} />
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                Medical Records
              </h1>

              <p className="mt-1 text-sm text-blue-50">
                View and review medical records created for your
                patients.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-white/15 px-4 py-2 text-center">
            <p className="text-2xl font-bold">
              {records.length}
            </p>

            <p className="text-xs text-blue-50">
              Total Records
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
            placeholder="Search by patient, diagnosis, symptoms or prescription..."
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-800 outline-none transition focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* Record Count */}
      <div>
        <h2 className="text-lg font-bold text-gray-900">
          Patient Records
        </h2>

        <p className="mt-1 text-sm text-gray-500">
          {filteredRecords.length} record
          {filteredRecords.length !== 1 ? "s" : ""} found
        </p>
      </div>

      {/* Empty State */}
      {filteredRecords.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <FileText size={26} />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            {records.length === 0
              ? "No medical records found"
              : "No matching records"}
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            {records.length === 0
              ? "Medical records will appear here after you complete appointments and create records."
              : "Try searching with a different patient or medical detail."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          {filteredRecords.map((record) => {
            const patient = record.patientId?.userId;
            const appointment = record.appointmentId;

            return (
              <div
                key={record._id}
                className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm transition hover:shadow-md"
              >
                {/* Patient Header */}
                <div className="border-b border-gray-100 bg-gradient-to-r from-blue-50 to-cyan-50 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
                        <User size={23} />
                      </div>

                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {patient?.name || "Unknown Patient"}
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                          Patient ID:{" "}
                          {record.patientId?._id?.slice(-8) ||
                            "N/A"}
                        </p>
                      </div>
                    </div>

                    <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm">
                      Medical Record
                    </span>
                  </div>

                  {/* Contact */}
                  <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {patient?.email && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Mail
                          size={15}
                          className="text-blue-500"
                        />
                        <span className="break-all">
                          {patient.email}
                        </span>
                      </div>
                    )}

                    {patient?.phone && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Phone
                          size={15}
                          className="text-cyan-500"
                        />
                        <span>{patient.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Appointment Information */}
                {appointment && (
                  <div className="grid grid-cols-1 gap-3 border-b border-gray-100 p-5 sm:grid-cols-3">
                    <div className="rounded-xl bg-gray-50 p-3">
                      <div className="flex items-center gap-2">
                        <CalendarDays
                          size={16}
                          className="text-blue-600"
                        />

                        <span className="text-xs font-medium text-gray-500">
                          Appointment
                        </span>
                      </div>

                      <p className="mt-2 text-sm font-semibold text-gray-800">
                        {formatDate(
                          appointment.appointmentDate
                        )}
                      </p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-3">
                      <div className="flex items-center gap-2">
                        <Clock
                          size={16}
                          className="text-cyan-600"
                        />

                        <span className="text-xs font-medium text-gray-500">
                          Time
                        </span>
                      </div>

                      <p className="mt-2 text-sm font-semibold text-gray-800">
                        {formatTime(appointment.startTime)}
                      </p>
                    </div>

                    <div className="rounded-xl bg-gray-50 p-3">
                      <div className="flex items-center gap-2">
                        <ClipboardList
                          size={16}
                          className="text-green-600"
                        />

                        <span className="text-xs font-medium text-gray-500">
                          Created
                        </span>
                      </div>

                      <p className="mt-2 text-sm font-semibold text-gray-800">
                        {formatDate(record.createdAt)}
                      </p>
                    </div>
                  </div>
                )}

                {/* Medical Information */}
                <div className="space-y-4 p-5">
                  {/* Symptoms */}
                  {record.symptoms && (
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <Stethoscope
                          size={17}
                          className="text-blue-600"
                        />

                        <h4 className="text-sm font-semibold text-gray-800">
                          Symptoms
                        </h4>
                      </div>

                      <p className="rounded-xl bg-gray-50 p-3 text-sm leading-6 text-gray-600">
                        {record.symptoms}
                      </p>
                    </div>
                  )}

                  {/* Diagnosis */}
                  {record.diagnosis && (
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <ClipboardList
                          size={17}
                          className="text-cyan-600"
                        />

                        <h4 className="text-sm font-semibold text-gray-800">
                          Diagnosis
                        </h4>
                      </div>

                      <p className="rounded-xl border border-blue-100 bg-blue-50/60 p-3 text-sm font-medium leading-6 text-gray-700">
                        {record.diagnosis}
                      </p>
                    </div>
                  )}

                  {/* Treatment */}
                  {record.treatmentNotes && (
                    <div>
                      <div className="mb-2 flex items-center gap-2">
                        <FileText
                          size={17}
                          className="text-indigo-600"
                        />

                        <h4 className="text-sm font-semibold text-gray-800">
                          Treatment Notes
                        </h4>
                      </div>

                      <p className="rounded-xl bg-gray-50 p-3 text-sm leading-6 text-gray-600">
                        {record.treatmentNotes}
                      </p>
                    </div>
                  )}

                  {/* Prescription */}
{record.prescription?.length > 0 && (
  <div>
    <div className="mb-2 flex items-center gap-2">
      <Pill
        size={17}
        className="text-green-600"
      />

      <h4 className="text-sm font-semibold text-gray-800">
        Prescription
      </h4>
    </div>

    <div className="space-y-3">
      {record.prescription.map((medicine, index) => (
        <div
          key={index}
          className="rounded-xl border border-green-100 bg-green-50/60 p-4"
        >
          <p className="font-semibold text-gray-800">
            {medicine.medicineName || "Medicine"}
          </p>

          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-700">
                Dosage:
              </span>{" "}
              {medicine.dosage || "Not specified"}
            </p>

            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-700">
                Frequency:
              </span>{" "}
              {medicine.frequency || "Not specified"}
            </p>

            <p className="text-sm text-gray-600">
              <span className="font-medium text-gray-700">
                Duration:
              </span>{" "}
              {medicine.duration || "Not specified"}
            </p>

            <p className="text-sm text-gray-600 sm:col-span-2">
              <span className="font-medium text-gray-700">
                Instructions:
              </span>{" "}
              {medicine.instructions || "None"}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
)}

                  {/* Follow-up */}
                  {record.followUpDate && (
                    <div className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50 p-4">
                      <div className="flex items-center gap-3">
                        <CalendarDays
                          size={18}
                          className="text-amber-600"
                        />

                        <div>
                          <p className="text-xs font-medium text-amber-700">
                            Follow-up Date
                          </p>

                          <p className="mt-1 text-sm font-semibold text-gray-800">
                            {formatDate(record.followUpDate)}
                          </p>
                        </div>
                      </div>
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

export default DoctorMedicalRecords;
