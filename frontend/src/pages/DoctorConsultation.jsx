import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  ArrowLeft,
  User,
  Calendar,
  Clock,
  Stethoscope,
  FileText,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import api from "../services/api";

function DoctorConsultation() {
  const location = useLocation();
  const navigate = useNavigate();

  const appointment = location.state?.appointment;

  const [formData, setFormData] = useState({
    symptoms: "",
    diagnosis: "",
    treatmentNotes: "",
    prescription: [
      {
        medicineName: "",
        dosage: "",
        frequency: "",
        duration: "",
        instructions: "",
      },
    ],
    followUpDate: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  if (!appointment) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-2xl border border-red-100 bg-white p-8 text-center shadow-sm">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-500" />

            <h2 className="text-xl font-bold text-slate-800">
              Appointment not found
            </h2>

            <p className="mt-2 text-slate-500">
              Please open the consultation from the Doctor Appointments page.
            </p>

            <button
              onClick={() => navigate("/doctor/appointments")}
              className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Back to Appointments
            </button>
          </div>
        </div>
      </div>
    );
  }

  const patient = appointment.patientId?.userId;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePrescriptionChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedPrescription = [...prev.prescription];

      updatedPrescription[index] = {
        ...updatedPrescription[index],
        [field]: value,
      };

      return {
        ...prev,
        prescription: updatedPrescription,
      };
    });
  };

  const addMedicine = () => {
    setFormData((prev) => ({
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

  const removeMedicine = (index) => {
    setFormData((prev) => ({
      ...prev,
      prescription: prev.prescription.filter(
        (_, medicineIndex) => medicineIndex !== index
      ),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setSuccess("");
    setError("");

    try {
      const prescription = formData.prescription.filter(
        (medicine) =>
          medicine.medicineName.trim() ||
          medicine.dosage.trim() ||
          medicine.frequency.trim() ||
          medicine.duration.trim() ||
          medicine.instructions.trim()
      );

      await api.post("/medical-records/", {
        appointmentId: appointment._id,
        symptoms: formData.symptoms,
        diagnosis: formData.diagnosis,
        treatmentNotes: formData.treatmentNotes,
        prescription,
        followUpDate: formData.followUpDate || null,
      });

      setSuccess("Medical record created successfully.");

      setTimeout(() => {
        navigate("/doctor/records");
      }, 1200);
    } catch (err) {
      console.error("Create medical record error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to create medical record. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-5xl">

        {/* HEADER */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/doctor/appointments")}
            className="mb-4 flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Appointments
          </button>

          <div>
            <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
              Patient Consultation
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Record consultation details and update the patient's medical record.
            </p>
          </div>
        </div>

        {/* PATIENT INFORMATION */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-blue-100 p-3">
              <User className="h-5 w-5 text-blue-600" />
            </div>

            <div>
              <h2 className="font-bold text-slate-800">
                Patient Information
              </h2>

              <p className="text-sm text-slate-500">
                Appointment details
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Patient
              </p>

              <p className="mt-1 font-semibold text-slate-800">
                {patient?.name || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Email
              </p>

              <p className="mt-1 text-sm text-slate-600">
                {patient?.email || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Date
              </p>

              <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                <Calendar className="h-4 w-4 text-blue-500" />

                {new Date(
                  appointment.appointmentDate
                ).toLocaleDateString()}
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Time
              </p>

              <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
                <Clock className="h-4 w-4 text-blue-500" />

                {appointment.startTime} - {appointment.endTime}
              </div>
            </div>

          </div>

          <div className="mt-5 grid gap-4 border-t border-slate-100 pt-5 sm:grid-cols-2">

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Department
              </p>

              <p className="mt-1 text-sm font-medium text-slate-700">
                {appointment.departmentId?.name || "N/A"}
              </p>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Service
              </p>

              <p className="mt-1 text-sm font-medium text-slate-700">
                {appointment.serviceId?.name || "N/A"}
              </p>
            </div>

          </div>

          {appointment.reason && (
            <div className="mt-5 rounded-xl bg-blue-50 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                Reason for Visit
              </p>

              <p className="mt-1 text-sm text-slate-700">
                {appointment.reason}
              </p>
            </div>
          )}
        </div>

        {/* CONSULTATION FORM */}
        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
        >
          <div className="mb-6 flex items-center gap-3">
            <div className="rounded-xl bg-cyan-100 p-3">
              <Stethoscope className="h-5 w-5 text-cyan-600" />
            </div>

            <div>
              <h2 className="font-bold text-slate-800">
                Consultation Details
              </h2>

              <p className="text-sm text-slate-500">
                Enter the findings and treatment information.
              </p>
            </div>
          </div>

          {/* SYMPTOMS */}
          <div className="mb-5">
            <label className="mb-2 block text-sm font-semibold text-slate-700">
              Symptoms
            </label>

            <textarea
              name="symptoms"
              value={formData.symptoms}
              onChange={handleChange}
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
              value={formData.diagnosis}
              onChange={handleChange}
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
              value={formData.treatmentNotes}
              onChange={handleChange}
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
              {formData.prescription.map((medicine, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-slate-200 bg-slate-50 p-5"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-sm font-bold text-slate-800">
                      Medicine
                    </h3>

                    {formData.prescription.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeMedicine(index)}
                        className="text-xs font-semibold text-red-500 transition hover:text-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">

                    {/* MEDICINE NAME */}
                    <div>
                      <label className="mb-2 block text-xs font-semibold text-slate-600">
                        Medicine Name
                      </label>

                      <input
                        type="text"
                        value={medicine.medicineName}
                        onChange={(e) =>
                          handlePrescriptionChange(
                            index,
                            "medicineName",
                            e.target.value
                          )
                        }
                        placeholder="e.g. Crocin"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    {/* DOSAGE */}
                    <div>
                      <label className="mb-2 block text-xs font-semibold text-slate-600">
                        Dosage
                      </label>

                      <input
                        type="text"
                        value={medicine.dosage}
                        onChange={(e) =>
                          handlePrescriptionChange(
                            index,
                            "dosage",
                            e.target.value
                          )
                        }
                        placeholder="e.g. 650 mg"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    {/* FREQUENCY */}
                    <div>
                      <label className="mb-2 block text-xs font-semibold text-slate-600">
                        Frequency
                      </label>

                      <input
                        type="text"
                        value={medicine.frequency}
                        onChange={(e) =>
                          handlePrescriptionChange(
                            index,
                            "frequency",
                            e.target.value
                          )
                        }
                        placeholder="e.g. Twice a day"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    {/* DURATION */}
                    <div>
                      <label className="mb-2 block text-xs font-semibold text-slate-600">
                        Duration
                      </label>

                      <input
                        type="text"
                        value={medicine.duration}
                        onChange={(e) =>
                          handlePrescriptionChange(
                            index,
                            "duration",
                            e.target.value
                          )
                        }
                        placeholder="e.g. 3 days"
                        className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                      />
                    </div>

                    {/* INSTRUCTIONS */}
                    <div className="sm:col-span-2">
                      <label className="mb-2 block text-xs font-semibold text-slate-600">
                        Instructions
                      </label>

                      <textarea
                        value={medicine.instructions}
                        onChange={(e) =>
                          handlePrescriptionChange(
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

            {/* ADD MEDICINE */}
            <button
              type="button"
              onClick={addMedicine}
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
              value={formData.followUpDate}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 sm:max-w-xs"
            />
          </div>

          {/* SUCCESS */}
          {success && (
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
              <CheckCircle className="h-5 w-5 shrink-0" />
              {success}
            </div>
          )}

          {/* ERROR */}
          {error && (
            <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
              <AlertCircle className="h-5 w-5 shrink-0" />
              {error}
            </div>
          )}

          {/* SAVE */}
          <div className="flex justify-end border-t border-slate-100 pt-5">
            <button
              type="submit"
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Medical Record
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}

export default DoctorConsultation;