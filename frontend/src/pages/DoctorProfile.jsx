
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Phone,
  Stethoscope,
  GraduationCap,
  BriefcaseMedical,
  IndianRupee,
  Clock,
  Save,
  Loader2,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import api from "../services/api";

const days = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
];

function DoctorProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);

  const [formData, setFormData] = useState({
    specialization: "",
    qualification: "",
    experience: 0,
    consultationFee: 0,
    availability: days.map((day) => ({
      day: day.key,
      startTime: "",
      endTime: "",
      isAvailable: false,
    })),
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/doctors/profile");

      const doctor = response.data?.doctor || response.data;

      setProfile(doctor);

      const existingAvailability = doctor?.availability || [];

      const availability = days.map((day) => {
        const existingDay = existingAvailability.find(
          (item) => item.day === day.key
        );

        return {
          day: day.key,
          startTime: existingDay?.startTime || "",
          endTime: existingDay?.endTime || "",
          isAvailable: existingDay?.isAvailable ?? false,
        };
      });

      setFormData({
        specialization: doctor?.specialization || "",
        qualification: doctor?.qualification || "",
        experience: doctor?.experience ?? 0,
        consultationFee: doctor?.consultationFee ?? 0,
        availability,
      });
    } catch (err) {
      console.error("Fetch doctor profile error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load doctor profile."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAvailabilityChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedAvailability = [...prev.availability];

      updatedAvailability[index] = {
        ...updatedAvailability[index],
        [field]: value,
      };

      return {
        ...prev,
        availability: updatedAvailability,
      };
    });
  };

  const handleAvailabilityToggle = (index) => {
    setFormData((prev) => {
      const updatedAvailability = [...prev.availability];

      updatedAvailability[index] = {
        ...updatedAvailability[index],
        isAvailable: !updatedAvailability[index].isAvailable,
      };

      return {
        ...prev,
        availability: updatedAvailability,
      };
    });
  };


const handleSubmit = async (e) => {
  e.preventDefault();

  setSaving(true);
  setSuccess("");
  setError("");

  try {
    const validAvailability = formData.availability
      .filter(
        (item) =>
          item.isAvailable &&
          item.startTime &&
          item.endTime
      )
      .map((item) => ({
        day: item.day,
        startTime: item.startTime,
        endTime: item.endTime,
        isAvailable: true,
      }));

    await api.put("/doctors/profile", {
      specialization: formData.specialization,
      qualification: formData.qualification,
      experience: Number(formData.experience),
      consultationFee: Number(formData.consultationFee),
      availability: validAvailability,
    });

    setSuccess("Profile updated successfully.");

    await fetchProfile();
  } catch (err) {
    console.error("Update doctor profile error:", err);

    setError(
      err.response?.data?.message ||
        "Failed to update profile. Please try again."
    );
  } finally {
    setSaving(false);
  }
};

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-3 text-slate-500">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
            Loading profile...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="mb-6">
          <button
            onClick={() => navigate("/doctor")}
            className="mb-4 flex items-center gap-2 text-sm font-semibold text-blue-600 transition hover:text-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </button>

          <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">
            Doctor Profile
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your professional information and availability.
          </p>
        </div>

        {/* ERROR */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm font-medium text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            {error}
          </div>
        )}

        {/* SUCCESS */}
        {success && (
          <div className="mb-6 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
            <CheckCircle className="h-5 w-5 shrink-0" />
            {success}
          </div>
        )}

        {/* BASIC ACCOUNT INFORMATION */}
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

          <div className="mb-6 flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-100">
              <User className="h-8 w-8 text-blue-600" />
            </div>

            <div>
              <h2 className="text-xl font-bold text-slate-800">
                {profile?.userId?.name || "Doctor"}
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Doctor Account
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

            {/* NAME */}
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-400">
                <User className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Name
                </span>
              </div>

              <p className="font-semibold text-slate-700">
                {profile?.userId?.name || "N/A"}
              </p>
            </div>

            {/* EMAIL */}
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-400">
                <Mail className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Email
                </span>
              </div>

              <p className="break-all font-semibold text-slate-700">
                {profile?.userId?.email || "N/A"}
              </p>
            </div>

            {/* PHONE */}
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-slate-400">
                <Phone className="h-4 w-4" />
                <span className="text-xs font-semibold uppercase tracking-wide">
                  Phone
                </span>
              </div>

              <p className="font-semibold text-slate-700">
                {profile?.userId?.phone || "N/A"}
              </p>
            </div>

          </div>

          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
            Name, email and phone are linked to your account and cannot be
            edited from the doctor profile.
          </div>
        </div>

        {/* PROFESSIONAL INFORMATION */}
        <form onSubmit={handleSubmit}>

          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-cyan-100 p-3">
                <Stethoscope className="h-5 w-5 text-cyan-600" />
              </div>

              <div>
                <h2 className="font-bold text-slate-800">
                  Professional Information
                </h2>

                <p className="text-sm text-slate-500">
                  Keep your medical credentials and consultation details
                  updated.
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">

              {/* SPECIALIZATION */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <Stethoscope className="h-4 w-4 text-blue-500" />
                  Specialization
                </label>

                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleChange}
                  maxLength={100}
                  required
                  placeholder="e.g. Cardiology"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* QUALIFICATION */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <GraduationCap className="h-4 w-4 text-blue-500" />
                  Qualification
                </label>

                <input
                  type="text"
                  name="qualification"
                  value={formData.qualification}
                  onChange={handleChange}
                  maxLength={200}
                  placeholder="e.g. MBBS, MD"
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* EXPERIENCE */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <BriefcaseMedical className="h-4 w-4 text-blue-500" />
                  Experience
                </label>

                <div className="relative">
                  <input
                    type="number"
                    name="experience"
                    value={formData.experience}
                    onChange={handleChange}
                    min="0"
                    required
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-20 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />

                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                    years
                  </span>
                </div>
              </div>

              {/* CONSULTATION FEE */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-slate-700">
                  <IndianRupee className="h-4 w-4 text-blue-500" />
                  Consultation Fee
                </label>

                <div className="relative">
                  <IndianRupee className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="number"
                    name="consultationFee"
                    value={formData.consultationFee}
                    onChange={handleChange}
                    min="0"
                    required
                    className="w-full rounded-xl border border-slate-200 py-3 pl-10 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                  />
                </div>
              </div>

            </div>
          </div>

          {/* AVAILABILITY */}
          <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">

            <div className="mb-6 flex items-center gap-3">
              <div className="rounded-xl bg-indigo-100 p-3">
                <Clock className="h-5 w-5 text-indigo-600" />
              </div>

              <div>
                <h2 className="font-bold text-slate-800">
                  Availability
                </h2>

                <p className="text-sm text-slate-500">
                  Set the days and consultation hours when you are available.
                </p>
              </div>
            </div>

            <div className="space-y-3">

              {formData.availability.map((item, index) => {
                const day = days.find((d) => d.key === item.day);

                return (
                  <div
                    key={item.day}
                    className={`rounded-xl border p-4 transition ${
                      item.isAvailable
                        ? "border-blue-200 bg-blue-50/40"
                        : "border-slate-200 bg-slate-50"
                    }`}
                  >
                    <div className="grid items-center gap-4 md:grid-cols-[180px_1fr_1fr]">

                      {/* DAY + TOGGLE */}
                      <div className="flex items-center justify-between md:justify-start md:gap-4">
                        <span className="font-semibold text-slate-700">
                          {day?.label}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            handleAvailabilityToggle(index)
                          }
                          className={`relative h-6 w-11 rounded-full transition ${
                            item.isAvailable
                              ? "bg-blue-600"
                              : "bg-slate-300"
                          }`}
                        >
                          <span
                            className={`absolute top-1 h-4 w-4 rounded-full bg-white shadow-sm transition ${
                              item.isAvailable
                                ? "left-6"
                                : "left-1"
                            }`}
                          />
                        </button>
                      </div>

                      {/* START TIME */}
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500">
                          Start Time
                        </label>

                        <input
                          type="time"
                          value={item.startTime}
                          disabled={!item.isAvailable}
                          onChange={(e) =>
                            handleAvailabilityChange(
                              index,
                              "startTime",
                              e.target.value
                            )
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                        />
                      </div>

                      {/* END TIME */}
                      <div>
                        <label className="mb-1 block text-xs font-medium text-slate-500">
                          End Time
                        </label>

                        <input
                          type="time"
                          value={item.endTime}
                          disabled={!item.isAvailable}
                          onChange={(e) =>
                            handleAvailabilityChange(
                              index,
                              "endTime",
                              e.target.value
                            )
                          }
                          className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
                        />
                      </div>

                    </div>
                  </div>
                );
              })}

            </div>
          </div>

          {/* SAVE */}
          <div className="flex justify-end border-t border-slate-200 pt-5">

            <button
              type="submit"
              disabled={saving}
              className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {saving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save Profile
                </>
              )}
            </button>

          </div>

        </form>
      </div>
    </div>
  );
}

export default DoctorProfile;

