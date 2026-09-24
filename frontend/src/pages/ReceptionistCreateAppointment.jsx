import { useEffect, useState } from "react";
import {
    CalendarDays,
    Clock,
    User,
    Stethoscope,
    Building2,
    FileText,
    ArrowLeft,
    CheckCircle2,
    Loader2,
    AlertCircle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function ReceptionistCreateAppointment() {
    const navigate = useNavigate();

    const [patients, setPatients] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [services, setServices] = useState([]);

    const [formData, setFormData] = useState({
        patientId: "",
        departmentId: "",
        doctorId: "",
        appointmentDate: "",
        startTime: "",
        serviceId: "",
        reason: "",
    });

    const [availableSlots, setAvailableSlots] = useState([]);
    const [availabilityLoading, setAvailabilityLoading] = useState(false);

    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    // ===============================
    // LOAD INITIAL DATA
    // ===============================
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoading(true);
                setError("");

                const [patientsRes, departmentsRes, doctorsRes, servicesRes] =
                    await Promise.all([
                        api.get("/patients"),
                        api.get("/departments"),
                        api.get("/doctors"),
                        api.get("/services"),
                    ]);

                setPatients(patientsRes.data.patients || patientsRes.data.data || []);
                setDepartments(
                    departmentsRes.data.departments || departmentsRes.data.data || []
                );
                setDoctors(doctorsRes.data.doctors || doctorsRes.data.data || []);
                setServices(servicesRes.data.services || servicesRes.data.data || []);
            } catch (err) {
                console.error("Failed to load data:", err);
                setError(
                    err.response?.data?.message || "Failed to load appointment information"
                );
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, []);

    // ===============================
    // FILTER DOCTORS BY DEPARTMENT
    // ===============================
    const filteredDoctors = doctors.filter((doctor) => {
        const deptId = doctor.departmentId?._id || doctor.departmentId;
        return deptId === formData.departmentId;
    });

    // ===============================
    // FILTER SERVICES BY DEPARTMENT
    // ===============================
    const filteredServices = services.filter((service) => {
        const deptId = service.departmentId?._id || service.departmentId;
        return deptId === formData.departmentId;
    });

    // ===============================
    // HANDLE DEPARTMENT CHANGE
    // ===============================
    const handleDepartmentChange = (e) => {
        const departmentId = e.target.value;
        setFormData((prev) => ({
            ...prev,
            departmentId,
            doctorId: "",
            serviceId: "",
            startTime: "",
        }));
        setAvailableSlots([]);
    };

    // ===============================
    // HANDLE DOCTOR CHANGE
    // ===============================
    const handleDoctorChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            doctorId: e.target.value,
            startTime: "",
        }));
        setAvailableSlots([]);
    };

    // ===============================
    // FETCH AVAILABLE TIMES
    // ===============================
    useEffect(() => {
        const fetchAvailability = async () => {
            if (!formData.doctorId || !formData.appointmentDate) {
                setAvailableSlots([]);
                return;
            }

            try {
                setAvailabilityLoading(true);
                setError("");
                setFormData((prev) => ({ ...prev, startTime: "" }));

                const response = await api.get("/appointments/availability", {
                    params: {
                        doctorId: formData.doctorId,
                        appointmentDate: formData.appointmentDate,
                    },
                });

                const bookedAppointments = response.data.appointments || [];

                const doctor = doctors.find(
                    (d) => (d._id || d.id) === formData.doctorId
                );

                if (!doctor) {
                    setAvailableSlots([]);
                    return;
                }

                const appointmentDate = new Date(
                    `${formData.appointmentDate}T00:00:00`
                );

                const weekday = appointmentDate
                    .toLocaleDateString("en-US", { weekday: "long" })
                    .toLowerCase();

                const availability = doctor.availability?.find(
                    (slot) => slot.day === weekday && slot.isAvailable === true
                );

                if (!availability) {
                    setAvailableSlots([]);
                    return;
                }

                const selectedService = services.find(
                    (s) => (s._id || s.id) === formData.serviceId
                );

                const duration = Number(selectedService?.duration) || 30;

                const timeToMinutes = (t) => {
                    const [h, m] = t.split(":").map(Number);
                    return h * 60 + m;
                };

                const minutesToTime = (mins) => {
                    const h = Math.floor(mins / 60);
                    const m = mins % 60;
                    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
                };

                const availStart = timeToMinutes(availability.startTime);
                const availEnd = timeToMinutes(availability.endTime);

                const slots = [];

                for (
                    let time = availStart;
                    time + duration <= availEnd;
                    time += duration
                ) {
                    const slotStart = minutesToTime(time);
                    const slotEnd = minutesToTime(time + duration);

                    const hasConflict = bookedAppointments.some((appt) => {
                        const existingStart = timeToMinutes(appt.startTime);
                        const existingEnd = timeToMinutes(appt.endTime);
                        return time < existingEnd && time + duration > existingStart;
                    });

                    if (!hasConflict) {
                        slots.push({ startTime: slotStart, endTime: slotEnd });
                    }
                }

                setAvailableSlots(slots);
            } catch (err) {
                console.error("Availability fetch error:", err);
                setError(
                    err.response?.data?.message || "Failed to fetch availability"
                );
            } finally {
                setAvailabilityLoading(false);
            }
        };

        fetchAvailability();
    }, [
        formData.doctorId,
        formData.appointmentDate,
        formData.serviceId,
        doctors,
        services,
    ]);

    // ===============================
    // FORMAT TIME
    // ===============================
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

    // ===============================
    // HANDLE INPUT
    // ===============================
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setError("");
        setSuccess("");
    };

    // ===============================
    // SUBMIT APPOINTMENT
    // ===============================
    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (
            !formData.patientId ||
            !formData.departmentId ||
            !formData.doctorId ||
            !formData.appointmentDate ||
            !formData.startTime ||
            !formData.serviceId
        ) {
            setError("Please fill in all required appointment fields");
            return;
        }

        try {
            setSubmitting(true);

            await api.post("/appointments", {
                patientId: formData.patientId,
                doctorId: formData.doctorId,
                departmentId: formData.departmentId,
                serviceId: formData.serviceId,
                appointmentDate: formData.appointmentDate,
                startTime: formData.startTime,
                reason: formData.reason,
            });

            setSuccess("Appointment created successfully.");

            setFormData({
                patientId: "",
                departmentId: "",
                doctorId: "",
                appointmentDate: "",
                startTime: "",
                serviceId: "",
                reason: "",
            });

            setAvailableSlots([]);

            setTimeout(() => {
                navigate("/receptionist/appointments");
            }, 1500);
        } catch (err) {
            console.error("Create appointment error:", err);
            setError(
                err.response?.data?.message || "Failed to create appointment"
            );
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex min-h-[400px] items-center justify-center">
                <div className="flex flex-col items-center gap-3 text-slate-500">
                    <Loader2 size={32} className="animate-spin text-blue-600" />
                    <p className="text-sm font-medium">Loading appointment data...</p>
                </div>
            </div>
        );
    }

    const selectedPatient = patients.find((p) => p._id === formData.patientId);
    const selectedDoctor = doctors.find((d) => d._id === formData.doctorId);
    const selectedDept = departments.find(
        (d) => d._id === formData.departmentId
    );
    const selectedService = services.find(
        (s) => s._id === formData.serviceId
    );

    const showSummary =
        formData.patientId &&
        formData.departmentId &&
        formData.doctorId &&
        formData.appointmentDate &&
        formData.startTime &&
        formData.serviceId;

    return (
        <div className="mx-auto max-w-5xl">
            {/* Header */}
            <div className="mb-6 flex items-center gap-4">
                <button
                    type="button"
                    onClick={() => navigate("/receptionist/appointments")}
                    className="flex items-center justify-center rounded-xl border border-gray-200 p-2.5 text-gray-600 transition hover:bg-gray-100"
                >
                    <ArrowLeft size={20} />
                </button>

                <div>
                    <h1 className="text-2xl font-bold text-gray-800">
                        Create Appointment
                    </h1>
                    <p className="mt-1 text-sm text-gray-500">
                        Schedule an appointment for an existing patient
                    </p>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    <AlertCircle size={18} className="mt-0.5 shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {/* Success */}
            {success && (
                <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    <CheckCircle2 size={18} />
                    {success}
                </div>
            )}

            <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-6 shadow-sm">
                {/* PATIENT */}
                <div className="mb-6">
                    <div className="mb-4 flex items-center gap-2">
                        <User size={20} className="text-blue-600" />
                        <h2 className="font-semibold text-gray-800">Patient</h2>
                    </div>

                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Select Patient *
                    </label>

                    <select
                        name="patientId"
                        value={formData.patientId}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                        required
                    >
                        <option value="">Select a patient</option>
                        {patients.map((patient) => {
                            const user = patient.userId;
                            return (
                                <option key={patient._id} value={patient._id}>
                                    {user?.name || "Unknown Patient"}
                                    {user?.phone ? ` - ${user.phone}` : ""}
                                </option>
                            );
                        })}
                    </select>
                </div>

                {/* DEPARTMENT + DOCTOR */}
                <div className="mb-6 grid gap-5 md:grid-cols-2">
                    <div>
                        <div className="mb-4 flex items-center gap-2">
                            <Building2 size={20} className="text-blue-600" />
                            <h2 className="font-semibold text-gray-800">Department</h2>
                        </div>

                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Select Department *
                        </label>

                        <select
                            name="departmentId"
                            value={formData.departmentId}
                            onChange={handleDepartmentChange}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                            required
                        >
                            <option value="">Select department</option>
                            {departments.map((dept) => (
                                <option key={dept._id} value={dept._id}>
                                    {dept.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <div className="mb-4 flex items-center gap-2">
                            <Stethoscope size={20} className="text-blue-600" />
                            <h2 className="font-semibold text-gray-800">Doctor</h2>
                        </div>

                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Select Doctor *
                        </label>

                        <select
                            name="doctorId"
                            value={formData.doctorId}
                            onChange={handleDoctorChange}
                            disabled={!formData.departmentId}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                            required
                        >
                            <option value="">
                                {formData.departmentId
                                    ? "Select doctor"
                                    : "Select department first"}
                            </option>
                            {filteredDoctors.map((doctor) => (
                                <option key={doctor._id} value={doctor._id}>
                                    {doctor.userId?.name || doctor.name || "Doctor"}
                                    {doctor.specialization ? ` - ${doctor.specialization}` : ""}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* DATE + SERVICE */}
                <div className="mb-6 grid gap-5 md:grid-cols-2">
                    <div>
                        <div className="mb-4 flex items-center gap-2">
                            <CalendarDays size={20} className="text-blue-600" />
                            <h2 className="font-semibold text-gray-800">Date</h2>
                        </div>

                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Appointment Date *
                        </label>

                        <input
                            type="date"
                            name="appointmentDate"
                            value={formData.appointmentDate}
                            onChange={handleChange}
                            min={new Date().toISOString().split("T")[0]}
                            disabled={!formData.doctorId}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                            required
                        />
                    </div>

                    <div>
                        <div className="mb-4 flex items-center gap-2">
                            <FileText size={20} className="text-blue-600" />
                            <h2 className="font-semibold text-gray-800">Service</h2>
                        </div>

                        <label className="mb-2 block text-sm font-medium text-gray-700">
                            Select Service *
                        </label>

                        <select
                            name="serviceId"
                            value={formData.serviceId}
                            onChange={handleChange}
                            disabled={!formData.departmentId}
                            className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-gray-100"
                            required
                        >
                            <option value="">
                                {formData.departmentId
                                    ? "Select service"
                                    : "Select department first"}
                            </option>
                            {filteredServices.map((service) => (
                                <option key={service._id} value={service._id}>
                                    {service.name}
                                    {service.duration ? ` - ${service.duration} min` : ""}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* TIME */}
                <div className="mb-6">
                    <div className="mb-4 flex items-center gap-2">
                        <Clock size={20} className="text-blue-600" />
                        <h2 className="font-semibold text-gray-800">Appointment Time</h2>
                    </div>

                    {!formData.doctorId || !formData.appointmentDate ? (
                        <p className="rounded-lg bg-gray-50 px-4 py-3 text-sm text-gray-500">
                            Select a doctor and appointment date to view available times.
                        </p>
                    ) : availabilityLoading ? (
                        <p className="flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-3 text-sm text-blue-700">
                            <Loader2 size={16} className="animate-spin" />
                            Checking available time slots...
                        </p>
                    ) : availableSlots.length === 0 ? (
                        <p className="rounded-lg bg-yellow-50 px-4 py-3 text-sm text-yellow-700">
                            No available time slots for the selected date
                            {formData.serviceId ? " and service" : ""}. The doctor may not
                            be available on this day.
                        </p>
                    ) : (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                            {availableSlots.map((slot) => (
                                <button
                                    key={slot.startTime}
                                    type="button"
                                    onClick={() =>
                                        setFormData((prev) => ({
                                            ...prev,
                                            startTime: slot.startTime,
                                        }))
                                    }
                                    className={`rounded-lg border px-3 py-3 text-sm font-medium transition ${formData.startTime === slot.startTime
                                            ? "border-blue-600 bg-blue-600 text-white"
                                            : "border-gray-200 bg-white text-gray-700 hover:border-blue-400 hover:bg-blue-50"
                                        }`}
                                >
                                    {formatTime(slot.startTime)}
                                    <span className="block text-xs opacity-70">
                                        {formatTime(slot.endTime)}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {/* REASON */}
                <div className="mb-6">
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                        Reason / Notes
                    </label>

                    <textarea
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        rows={4}
                        placeholder="Enter appointment reason or additional notes..."
                        className="w-full resize-none rounded-lg border border-gray-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                {/* SUMMARY */}
                {showSummary && (
                    <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-5">
                        <h3 className="mb-4 font-semibold text-gray-800">
                            Appointment Summary
                        </h3>

                        <div className="grid gap-3 text-sm sm:grid-cols-2">
                            <p>
                                <span className="font-medium">Patient:</span>{" "}
                                {selectedPatient?.userId?.name || "—"}
                            </p>

                            <p>
                                <span className="font-medium">Doctor:</span>{" "}
                                {selectedDoctor?.userId?.name || "—"}
                            </p>

                            <p>
                                <span className="font-medium">Department:</span>{" "}
                                {selectedDept?.name || "—"}
                            </p>

                            <p>
                                <span className="font-medium">Service:</span>{" "}
                                {selectedService?.name || "—"}
                                {selectedService?.duration
                                    ? ` (${selectedService.duration} min)`
                                    : ""}
                            </p>

                            <p>
                                <span className="font-medium">Date:</span>{" "}
                                {formData.appointmentDate}
                            </p>

                            <p>
                                <span className="font-medium">Time:</span>{" "}
                                {formatTime(formData.startTime)}
                                {selectedService?.duration && formData.startTime
                                    ? ` – ${formatTime(
                                        (() => {
                                            const [h, m] = formData.startTime.split(":").map(Number);
                                            const totalMins =
                                                h * 60 + m + Number(selectedService.duration);
                                            const endH = Math.floor(totalMins / 60);
                                            const endM = totalMins % 60;
                                            return `${String(endH).padStart(2, "0")}:${String(
                                                endM
                                            ).padStart(2, "0")}`;
                                        })()
                                    )}`
                                    : ""}
                            </p>
                        </div>
                    </div>
                )}

                {/* SUBMIT */}
                <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                    <button
                        type="button"
                        onClick={() => navigate("/receptionist/appointments")}
                        disabled={submitting}
                        className="rounded-xl border border-gray-200 px-6 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        Cancel
                    </button>

                    <button
                        type="submit"
                        disabled={submitting || !showSummary}
                        className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {submitting ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <CheckCircle2 size={18} />
                                Create Appointment
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default ReceptionistCreateAppointment;
