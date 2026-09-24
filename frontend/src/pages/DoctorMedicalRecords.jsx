
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
  Pencil,
  X,
  Save,
  Loader2,
  CheckCircle,
} from "lucide-react";
import api from "../services/api";

function DoctorMedicalRecords() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  // Edit modal state
  const [editRecord, setEditRecord] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState("");
  const [editSuccess, setEditSuccess] = useState("");

  const fetchRecords = async () => {
    try {
      const response = await api.get("/medical-records/doctor-records");
      setRecords(response.data.records || []);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message || "Failed to load medical records"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
            `${medicine.medicineName || ""} ${medicine.dosage || ""} ${medicine.frequency || ""} ${medicine.duration || ""} ${medicine.instructions || ""}`
        )
        .join(" "),
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return searchText.includes(searchTerm.toLowerCase());
  });

  // ---- EDIT HELPERS ----

  const openEdit = (record) => {
    setEditRecord(record);
    setEditForm({
      symptoms: record.symptoms || "",
      diagnosis: record.diagnosis || "",
      treatmentNotes: record.treatmentNotes || "",
      prescription:
        record.prescription && record.prescription.length > 0
          ? record.prescription.map((m) => ({ ...m }))
          : [
            {
              medicineName: "",
              dosage: "",
              frequency: "",
              duration: "",
              instructions: "",
            },
          ],
      followUpDate: record.followUpDate
        ? new Date(record.followUpDate).toISOString().split("T")[0]
        : "",
    });
    setEditError("");
    setEditSuccess("");
  };

  const closeEdit = () => {
    setEditRecord(null);
    setEditForm(null);
    setEditError("");
    setEditSuccess("");
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditPrescriptionChange = (index, field, value) => {
    setEditForm((prev) => {
      const updated = [...prev.prescription];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, prescription: updated };
    });
  };

  const addEditMedicine = () => {
    setEditForm((prev) => ({
      ...prev,
      prescription: [
        ...prev.prescription,
        {
          medicineName: "",
          dosage: "",
          frequency: "",
          duration: "",
          instructions: "",
        },
      ],
    }));
  };

  const removeEditMedicine = (index) => {
    setEditForm((prev) => ({
      ...prev,
      prescription: prev.prescription.filter((_, i) => i !== index),
    }));
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditError("");
    setEditSuccess("");

    try {
      // Filter out fully empty prescription rows
      const prescription = editForm.prescription.filter(
        (m) =>
          m.medicineName.trim() ||
          m.dosage.trim() ||
          m.frequency.trim() ||
          m.duration.trim() ||
          m.instructions.trim()
      );

      await api.put(`/medical-records/${editRecord._id}`, {
        symptoms: editForm.symptoms,
        diagnosis: editForm.diagnosis,
        treatmentNotes: editForm.treatmentNotes,
        prescription,
        followUpDate: editForm.followUpDate || null,
      });

      setEditSuccess("Medical record updated successfully.");

      // Refresh the list
      await fetchRecords();

      setTimeout(() => {
        closeEdit();
      }, 1000);
    } catch (err) {
      console.error("Update medical record error:", err);
      setEditError(
        err.response?.data?.message ||
        "Failed to update medical record. Please try again."
      );
    } finally {
      setEditLoading(false);
    }
  };

  // ---- RENDER ----

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
          <AlertCircle size={22} className="mt-0.5 text-red-600" />
          <div>
            <h2 className="font-semibold text-red-700">
              Unable to load medical records
            </h2>
            <p className="mt-1 text-sm text-red-600">{error}</p>
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
              <h1 className="text-2xl font-bold">Medical Records</h1>
              <p className="mt-1 text-sm text-blue-50">
                View and review medical records created for your patients.
              </p>
            </div>
          </div>
          <div className="rounded-xl bg-white/15 px-4 py-2 text-center">
            <p className="text-2xl font-bold">{records.length}</p>
            <p className="text-xs text-blue-50">Total Records</p>
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
        <h2 className="text-lg font-bold text-gray-900">Patient Records</h2>
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
                          {record.patientId?._id?.slice(-8) || "N/A"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700 shadow-sm">
                        Medical Record
                      </span>
                      {/* EDIT BUTTON */}
                      <button
                        onClick={() => openEdit(record)}
                        className="flex items-center gap-1.5 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                        title="Edit medical record"
                      >
                        <Pencil size={13} />
                        Edit
                      </button>
                    </div>
                  </div>

                  {/* Contact */}
                  <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {patient?.email && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Mail size={15} className="text-blue-500" />
                        <span className="break-all">{patient.email}</span>
                      </div>
                    )}
                    {patient?.phone && (
                      <div className="flex items-center gap-2 text-xs text-gray-600">
                        <Phone size={15} className="text-cyan-500" />
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
                        <CalendarDays size={16} className="text-blue-600" />
                        <span className="text-xs font-medium text-gray-500">
                          Appointment
                        </span>
                      </div>
                      <p className="mt-2 text-sm font-semibold text-gray-800">
                        {formatDate(appointment.appointmentDate)}
                      </p>
                    </div>
                    <div className="rounded-xl bg-gray-50 p-3">
                      <div className="flex items-center gap-2">
                        <Clock size={16} className="text-cyan-600" />
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
                        <ClipboardList size={16} className="text-green-600" />
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
                        <Stethoscope size={17} className="text-blue-600" />
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
                        <ClipboardList size={17} className="text-cyan-600" />
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
                        <FileText size={17} className="text-indigo-600" />
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
                        <Pill size={17} className="text-green-600" />
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
                        <CalendarDays size={18} className="text-amber-600" />
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

      {/* ===== EDIT MODAL ===== */}
      {editRecord && editForm && (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4 py-8">
          <div className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white shadow-2xl">

            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-cyan-100 p-2">
                  <Pencil className="h-5 w-5 text-cyan-600" />
                </div>
                <div>
                  <h2 className="font-bold text-slate-800">Edit Medical Record</h2>
                  <p className="text-sm text-slate-500">
                    Patient: {editRecord.patientId?.userId?.name || "Unknown"}
                  </p>
                </div>
              </div>
              <button
                onClick={closeEdit}
                disabled={editLoading}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleEditSubmit} className="p-5 sm:p-6">

              {/* SYMPTOMS */}
              <div className="mb-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Symptoms
                </label>
                <textarea
                  name="symptoms"
                  value={editForm.symptoms}
                  onChange={handleEditChange}
                  rows="3"
                  placeholder="Enter patient's symptoms..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* DIAGNOSIS */}
              <div className="mb-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Diagnosis <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="diagnosis"
                  value={editForm.diagnosis}
                  onChange={handleEditChange}
                  rows="3"
                  required
                  placeholder="Enter diagnosis..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* TREATMENT */}
              <div className="mb-5">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Treatment Notes
                </label>
                <textarea
                  name="treatmentNotes"
                  value={editForm.treatmentNotes}
                  onChange={handleEditChange}
                  rows="4"
                  placeholder="Enter treatment details and recommendations..."
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* PRESCRIPTION */}
              <div className="mb-6">
                <div className="mb-4 flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                    <FileText className="h-4 w-4 text-blue-500" />
                    Prescription
                  </label>
                  <span className="text-xs text-slate-400">
                    Add medicines as needed
                  </span>
                </div>

                <div className="space-y-5">
                  {editForm.prescription.map((medicine, index) => (
                    <div
                      key={index}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-sm font-bold text-slate-800">
                          Medicine {index + 1}
                        </h3>
                        {editForm.prescription.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeEditMedicine(index)}
                            className="text-xs font-semibold text-red-500 transition hover:text-red-600"
                          >
                            Remove
                          </button>
                        )}
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <label className="mb-2 block text-xs font-semibold text-slate-600">
                            Medicine Name
                          </label>
                          <input
                            type="text"
                            value={medicine.medicineName}
                            onChange={(e) =>
                              handleEditPrescriptionChange(
                                index,
                                "medicineName",
                                e.target.value
                              )
                            }
                            placeholder="e.g. Crocin"
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-semibold text-slate-600">
                            Dosage
                          </label>
                          <input
                            type="text"
                            value={medicine.dosage}
                            onChange={(e) =>
                              handleEditPrescriptionChange(
                                index,
                                "dosage",
                                e.target.value
                              )
                            }
                            placeholder="e.g. 650 mg"
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-semibold text-slate-600">
                            Frequency
                          </label>
                          <input
                            type="text"
                            value={medicine.frequency}
                            onChange={(e) =>
                              handleEditPrescriptionChange(
                                index,
                                "frequency",
                                e.target.value
                              )
                            }
                            placeholder="e.g. Twice a day"
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>
                        <div>
                          <label className="mb-2 block text-xs font-semibold text-slate-600">
                            Duration
                          </label>
                          <input
                            type="text"
                            value={medicine.duration}
                            onChange={(e) =>
                              handleEditPrescriptionChange(
                                index,
                                "duration",
                                e.target.value
                              )
                            }
                            placeholder="e.g. 3 days"
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <label className="mb-2 block text-xs font-semibold text-slate-600">
                            Instructions
                          </label>
                          <textarea
                            value={medicine.instructions}
                            onChange={(e) =>
                              handleEditPrescriptionChange(
                                index,
                                "instructions",
                                e.target.value
                              )
                            }
                            rows="2"
                            placeholder="e.g. Take after food"
                            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addEditMedicine}
                  className="mt-4 flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-600 transition hover:bg-blue-100"
                >
                  <span className="text-lg leading-none">+</span>
                  Add Medicine
                </button>
              </div>

              {/* FOLLOW UP */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  Follow-up Date
                </label>
                <input
                  type="date"
                  name="followUpDate"
                  value={editForm.followUpDate}
                  onChange={handleEditChange}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:max-w-xs"
                />
              </div>

              {/* SUCCESS */}
              {editSuccess && (
                <div className="mb-5 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
                  <CheckCircle className="h-5 w-5 shrink-0" />
                  {editSuccess}
                </div>
              )}

              {/* ERROR */}
              {editError && (
                <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
                  <AlertCircle className="h-5 w-5 shrink-0" />
                  {editError}
                </div>
              )}

              {/* ACTIONS */}
              <div className="flex justify-end gap-3 border-t border-slate-100 pt-5">
                <button
                  type="button"
                  onClick={closeEdit}
                  disabled={editLoading}
                  className="rounded-xl px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editLoading}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {editLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorMedicalRecords;
