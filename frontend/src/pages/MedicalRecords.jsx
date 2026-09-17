import { useEffect, useState } from "react";
import {
  FileText,
  Stethoscope,
  UserRound,
  CalendarDays,
  ClipboardList,
  Pill,
  Clock3,
  AlertCircle,
  Loader2,
  Activity,
} from "lucide-react";
import api from "../services/api";

function MedicalRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRecords = async () => {
      try {
        const response = await api.get(
          "/medical-records/my-records"
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

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
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
                Loading your medical records...
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
                  Unable to load medical records
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
                <FileText size={25} />
              </div>

              <h1 className="text-2xl font-bold sm:text-3xl">
                My Medical Records
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-50 sm:text-base">
                Access your consultation history, diagnoses,
                treatment details, and prescriptions securely.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
              <FileText size={20} />

              <div>
                <p className="text-xs text-blue-100">
                  Total Records
                </p>

                <p className="text-xl font-bold">
                  {records.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {records.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <FileText size={30} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-800">
              No medical records found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Your medical records will appear here after
              consultations and visits.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {records.map((record, index) => (
              <div
                key={record._id}
                className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
              >
                {/* Record Header */}
                <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <FileText size={23} />
                    </div>

                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                        Medical Record #{records.length - index}
                      </p>

                      <h2 className="mt-0.5 text-lg font-bold text-slate-800">
                        Consultation Record
                      </h2>
                    </div>
                  </div>

                  <div className="flex w-fit items-center gap-2 rounded-full border border-blue-200 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                    <CalendarDays size={15} />
                    {formatDate(record.createdAt)}
                  </div>
                </div>

                {/* Doctor Information */}
                <div className="p-5 sm:p-6">
                  <div className="rounded-xl border border-blue-100 bg-blue-50/60 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-blue-600 shadow-sm">
                        <UserRound size={19} />
                      </div>

                      <div>
                        <p className="text-xs font-medium text-blue-500">
                          Consulting Doctor
                        </p>

                        <p className="text-sm font-bold text-slate-700">
                          {record.doctorId?.userId?.name ||
                            "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Clinical Information */}
                  <div className="mt-5 grid gap-4 md:grid-cols-2">

                    {/* Symptoms */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Activity
                          size={18}
                          className="text-cyan-600"
                        />

                        <h3 className="text-sm font-semibold text-slate-700">
                          Symptoms
                        </h3>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {record.symptoms || "Not specified"}
                      </p>
                    </div>

                    {/* Diagnosis */}
                    <div className="rounded-xl border border-slate-200 bg-white p-4">
                      <div className="flex items-center gap-2 text-slate-500">
                        <Stethoscope
                          size={18}
                          className="text-blue-600"
                        />

                        <h3 className="text-sm font-semibold text-slate-700">
                          Diagnosis
                        </h3>
                      </div>

                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        {record.diagnosis || "Not specified"}
                      </p>
                    </div>
                  </div>

                  {/* Treatment Notes */}
                  <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex items-center gap-2">
                      <ClipboardList
                        size={18}
                        className="text-blue-600"
                      />

                      <h3 className="text-sm font-semibold text-slate-700">
                        Treatment Notes
                      </h3>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {record.treatmentNotes || "N/A"}
                    </p>
                  </div>

                  {/* Prescription */}
                  {record.prescription?.length > 0 && (
                    <div className="mt-5">
                      <div className="mb-3 flex items-center gap-2">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600">
                          <Pill size={18} />
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-slate-800">
                            Prescription
                          </h3>

                          <p className="text-xs text-slate-400">
                            {record.prescription.length}{" "}
                            {record.prescription.length === 1
                              ? "medicine"
                              : "medicines"}
                          </p>
                        </div>
                      </div>

                      <div className="overflow-hidden rounded-xl border border-slate-200">
                        {record.prescription.map(
                          (medicine, medicineIndex) => (
                            <div
                              key={medicineIndex}
                              className={`p-4 ${
                                medicineIndex !==
                                record.prescription.length - 1
                                  ? "border-b border-slate-200"
                                  : ""
                              }`}
                            >
                              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <p className="text-sm font-bold text-slate-800">
                                    {medicine.medicineName ||
                                      "Medicine"}
                                  </p>

                                  <p className="mt-1 text-xs text-slate-400">
                                    Prescription Item{" "}
                                    {medicineIndex + 1}
                                  </p>
                                </div>

                                {medicine.dosage && (
                                  <span className="w-fit rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                                    {medicine.dosage}
                                  </span>
                                )}
                              </div>

                              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                <div className="rounded-lg bg-slate-50 p-3">
                                  <p className="text-xs font-medium text-slate-400">
                                    Frequency
                                  </p>

                                  <p className="mt-1 text-sm font-semibold text-slate-600">
                                    {medicine.frequency ||
                                      "N/A"}
                                  </p>
                                </div>

                                <div className="rounded-lg bg-slate-50 p-3">
                                  <p className="text-xs font-medium text-slate-400">
                                    Duration
                                  </p>

                                  <p className="mt-1 text-sm font-semibold text-slate-600">
                                    {medicine.duration ||
                                      "N/A"}
                                  </p>
                                </div>

                                <div className="rounded-lg bg-slate-50 p-3">
                                  <p className="text-xs font-medium text-slate-400">
                                    Instructions
                                  </p>

                                  <p className="mt-1 text-sm font-semibold text-slate-600">
                                    {medicine.instructions ||
                                      "N/A"}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}

                  {/* Follow-up */}
                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 text-amber-600">
                        <Clock3 size={18} />
                      </div>

                      <div>
                        <p className="text-xs font-medium text-slate-400">
                          Follow-up Date
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {record.followUpDate
                            ? formatDate(
                                record.followUpDate
                              )
                            : "Not specified"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                        <CalendarDays size={18} />
                      </div>

                      <div>
                        <p className="text-xs font-medium text-slate-400">
                          Record Created
                        </p>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {formatDate(record.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MedicalRecords;

