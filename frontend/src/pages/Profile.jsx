import { useEffect, useState } from "react";
import {
  User,
  Mail,
  Phone,
  CalendarDays,
  Droplets,
  MapPin,
  ShieldAlert,
  HeartPulse,
  Pencil,
  Save,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  UserRound,
} from "lucide-react";
import api from "../services/api";

function Profile() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [editing, setEditing] = useState(false);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/patients/profile");

      const patient = response.data.patient;

      setProfile(patient);
      setFormData({
        dateOfBirth: patient.dateOfBirth
          ? patient.dateOfBirth.split("T")[0]
          : "",

        gender: patient.gender || "",

        bloodGroup: patient.bloodGroup || "unknown",

        address: {
          street: patient.address?.street || "",
          city: patient.address?.city || "",
          state: patient.address?.state || "",
          postalCode: patient.address?.postalCode || "",
        },

        emergencyContact: {
          name: patient.emergencyContact?.name || "",
          relationship:
            patient.emergencyContact?.relationship || "",
          phone: patient.emergencyContact?.phone || "",
        },

        medicalInformation: {
          allergies:
            patient.medicalInformation?.allergies?.join(", ") || "",

          chronicConditions:
            patient.medicalInformation?.chronicConditions?.join(
              ", "
            ) || "",

          notes:
            patient.medicalInformation?.notes || "",
        },
      });
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to load patient profile"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleNestedChange = (section, field, value) => {
    setFormData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setError("");
      setSuccess("");

      const payload = {
        dateOfBirth: formData.dateOfBirth || undefined,

        gender: formData.gender || undefined,

        bloodGroup: formData.bloodGroup || "unknown",

        address: {
          street: formData.address.street.trim(),
          city: formData.address.city.trim(),
          state: formData.address.state.trim(),
          postalCode: formData.address.postalCode.trim(),
        },

        emergencyContact: {
          name: formData.emergencyContact.name.trim(),
          relationship:
            formData.emergencyContact.relationship.trim(),
          phone: formData.emergencyContact.phone.trim(),
        },

        medicalInformation: {
          allergies: formData.medicalInformation.allergies
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean),

          chronicConditions:
            formData.medicalInformation.chronicConditions
              .split(",")
              .map((item) => item.trim())
              .filter(Boolean),

          notes: formData.medicalInformation.notes.trim(),
        },
      };

      const response = await api.put(
        "/patients/profile",
        payload
      );

      setProfile((prev) => ({
        ...prev,
        ...response.data.patient,
        userId: prev.userId,
      }));

      setEditing(false);
      setSuccess(
        response.data.message ||
          "Profile updated successfully"
      );

      await fetchProfile();

      setTimeout(() => {
        setSuccess("");
      }, 4000);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to update profile"
      );
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (!profile) return;

    setFormData({
      dateOfBirth: profile.dateOfBirth
        ? profile.dateOfBirth.split("T")[0]
        : "",

      gender: profile.gender || "",

      bloodGroup: profile.bloodGroup || "unknown",

      address: {
        street: profile.address?.street || "",
        city: profile.address?.city || "",
        state: profile.address?.state || "",
        postalCode: profile.address?.postalCode || "",
      },

      emergencyContact: {
        name: profile.emergencyContact?.name || "",
        relationship:
          profile.emergencyContact?.relationship || "",
        phone: profile.emergencyContact?.phone || "",
      },

      medicalInformation: {
        allergies:
          profile.medicalInformation?.allergies?.join(", ") || "",

        chronicConditions:
          profile.medicalInformation?.chronicConditions?.join(
            ", "
          ) || "",

        notes: profile.medicalInformation?.notes || "",
      },
    });

    setEditing(false);
    setError("");
    setSuccess("");
  };

  const formatDate = (date) => {
    if (!date) return "Not provided";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatGender = (gender) => {
    if (!gender) return "Not provided";

    const values = {
      male: "Male",
      female: "Female",
      other: "Other",
      prefer_not_to_say: "Prefer not to say",
    };

    return values[gender] || gender;
  };

  const formatBloodGroup = (bloodGroup) => {
    if (!bloodGroup || bloodGroup === "unknown") {
      return "Not provided";
    }

    return bloodGroup;
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100";

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto flex min-h-[500px] max-w-5xl items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col items-center gap-3 text-slate-500">
            <Loader2
              size={34}
              className="animate-spin text-blue-600"
            />

            <p className="text-sm font-medium">
              Loading your profile...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !profile) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <AlertCircle size={22} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Unable to load profile
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={fetchProfile}
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

  if (!profile || !formData) {
    return null;
  }

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">

        {/* Header */}
        <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                <UserRound size={32} />
              </div>

              <div>
                <p className="text-sm font-medium text-blue-100">
                  Patient Profile
                </p>

                <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                  {profile.userId?.name || "Patient"}
                </h1>

                <p className="mt-1 text-sm text-blue-50">
                  Manage your personal and healthcare
                  information
                </p>
              </div>
            </div>

            {!editing ? (
              <button
                type="button"
                onClick={() => {
                  setEditing(true);
                  setError("");
                  setSuccess("");
                }}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-600 shadow-sm transition hover:bg-blue-50"
              >
                <Pencil size={17} />
                Edit Profile
              </button>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <X size={17} />
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-blue-600 shadow-sm transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {saving ? (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <Save size={17} />
                  )}

                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Success Message */}
        {success && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
            <CheckCircle2 size={19} />
            {success}
          </div>
        )}

        {/* Error Message */}
        {error && profile && (
          <div className="mb-5 flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            <AlertCircle size={19} />
            {error}
          </div>
        )}

        {/* Basic Information */}
        <section className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <User size={19} />
              </div>

              <div>
                <h2 className="font-bold text-slate-800">
                  Basic Information
                </h2>

                <p className="text-xs text-slate-400">
                  Your account and personal details
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">

            {/* Name */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Full Name
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <User size={17} className="text-slate-400" />

                <span className="text-sm font-medium text-slate-700">
                  {profile.userId?.name || "Not provided"}
                </span>
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Email
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <Mail size={17} className="text-slate-400" />

                <span className="truncate text-sm font-medium text-slate-700">
                  {profile.userId?.email || "Not provided"}
                </span>
              </div>
            </div>

            {/* Phone */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Phone
              </label>

              <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                <Phone size={17} className="text-slate-400" />

                <span className="text-sm font-medium text-slate-700">
                  {profile.userId?.phone || "Not provided"}
                </span>
              </div>
            </div>

            {/* Date of Birth */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Date of Birth
              </label>

              {editing ? (
                <div className="relative">
                  <CalendarDays
                    size={17}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    type="date"
                    name="dateOfBirth"
                    value={formData.dateOfBirth}
                    onChange={handleChange}
                    className={`${inputClass} pl-11`}
                  />
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <CalendarDays
                    size={17}
                    className="text-slate-400"
                  />

                  <span className="text-sm font-medium text-slate-700">
                    {formatDate(profile.dateOfBirth)}
                  </span>
                </div>
              )}
            </div>

            {/* Gender */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Gender
              </label>

              {editing ? (
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="">
                    Select gender
                  </option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                  <option value="prefer_not_to_say">
                    Prefer not to say
                  </option>
                </select>
              ) : (
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                  {formatGender(profile.gender)}
                </div>
              )}
            </div>

            {/* Blood Group */}
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Blood Group
              </label>

              {editing ? (
                <select
                  name="bloodGroup"
                  value={formData.bloodGroup}
                  onChange={handleChange}
                  className={inputClass}
                >
                  <option value="unknown">
                    Select blood group
                  </option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              ) : (
                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <Droplets
                    size={17}
                    className="text-red-500"
                  />

                  <span className="text-sm font-medium text-slate-700">
                    {formatBloodGroup(
                      profile.bloodGroup
                    )}
                  </span>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Contact Information */}
        <section className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-50 text-cyan-600">
                <MapPin size={19} />
              </div>

              <div>
                <h2 className="font-bold text-slate-800">
                  Address
                </h2>

                <p className="text-xs text-slate-400">
                  Your residential address
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
            <div className="sm:col-span-2">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Street
              </label>

              {editing ? (
                <input
                  type="text"
                  value={formData.address.street}
                  onChange={(e) =>
                    handleNestedChange(
                      "address",
                      "street",
                      e.target.value
                    )
                  }
                  placeholder="Enter your street address"
                  className={inputClass}
                />
              ) : (
                <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  {profile.address?.street ||
                    "Not provided"}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                City
              </label>

              {editing ? (
                <input
                  type="text"
                  value={formData.address.city}
                  onChange={(e) =>
                    handleNestedChange(
                      "address",
                      "city",
                      e.target.value
                    )
                  }
                  placeholder="Enter city"
                  className={inputClass}
                />
              ) : (
                <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  {profile.address?.city ||
                    "Not provided"}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                State
              </label>

              {editing ? (
                <input
                  type="text"
                  value={formData.address.state}
                  onChange={(e) =>
                    handleNestedChange(
                      "address",
                      "state",
                      e.target.value
                    )
                  }
                  placeholder="Enter state"
                  className={inputClass}
                />
              ) : (
                <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  {profile.address?.state ||
                    "Not provided"}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Postal Code
              </label>

              {editing ? (
                <input
                  type="text"
                  value={formData.address.postalCode}
                  onChange={(e) =>
                    handleNestedChange(
                      "address",
                      "postalCode",
                      e.target.value
                    )
                  }
                  placeholder="Enter postal code"
                  className={inputClass}
                />
              ) : (
                <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  {profile.address?.postalCode ||
                    "Not provided"}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Emergency Contact */}
        <section className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <ShieldAlert size={19} />
              </div>

              <div>
                <h2 className="font-bold text-slate-800">
                  Emergency Contact
                </h2>

                <p className="text-xs text-slate-400">
                  Someone to contact in case of emergency
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 p-5 sm:grid-cols-2 sm:p-6">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Name
              </label>

              {editing ? (
                <input
                  type="text"
                  value={formData.emergencyContact.name}
                  onChange={(e) =>
                    handleNestedChange(
                      "emergencyContact",
                      "name",
                      e.target.value
                    )
                  }
                  placeholder="Emergency contact name"
                  className={inputClass}
                />
              ) : (
                <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  {profile.emergencyContact?.name ||
                    "Not provided"}
                </p>
              )}
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Relationship
              </label>

              {editing ? (
                <input
                  type="text"
                  value={
                    formData.emergencyContact.relationship
                  }
                  onChange={(e) =>
                    handleNestedChange(
                      "emergencyContact",
                      "relationship",
                      e.target.value
                    )
                  }
                  placeholder="e.g. Parent, Sibling"
                  className={inputClass}
                />
              ) : (
                <p className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  {profile.emergencyContact?.relationship ||
                    "Not provided"}
                </p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Phone
              </label>

              {editing ? (
                <input
                  type="tel"
                  value={formData.emergencyContact.phone}
                  onChange={(e) =>
                    handleNestedChange(
                      "emergencyContact",
                      "phone",
                      e.target.value
                    )
                  }
                  placeholder="Emergency contact phone"
                  className={inputClass}
                />
              ) : (
                <p className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
                  <Phone
                    size={16}
                    className="text-slate-400"
                  />

                  {profile.emergencyContact?.phone ||
                    "Not provided"}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Medical Information */}
        <section className="mb-5 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-50 text-rose-600">
                <HeartPulse size={19} />
              </div>

              <div>
                <h2 className="font-bold text-slate-800">
                  Medical Information
                </h2>

                <p className="text-xs text-slate-400">
                  Important information for your healthcare team
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5 p-5 sm:p-6">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Allergies
              </label>

              {editing ? (
                <>
                  <input
                    type="text"
                    value={
                      formData.medicalInformation.allergies
                    }
                    onChange={(e) =>
                      handleNestedChange(
                        "medicalInformation",
                        "allergies",
                        e.target.value
                      )
                    }
                    placeholder="Separate multiple allergies with commas"
                    className={inputClass}
                  />

                  <p className="mt-1.5 text-xs text-slate-400">
                    Example: Peanuts, Penicillin
                  </p>
                </>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.medicalInformation?.allergies
                    ?.length > 0 ? (
                    profile.medicalInformation.allergies.map(
                      (allergy, index) => (
                        <span
                          key={index}
                          className="rounded-full bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-600"
                        >
                          {allergy}
                        </span>
                      )
                    )
                  ) : (
                    <span className="text-sm text-slate-400">
                      No allergies provided
                    </span>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Chronic Conditions
              </label>

              {editing ? (
                <>
                  <input
                    type="text"
                    value={
                      formData.medicalInformation
                        .chronicConditions
                    }
                    onChange={(e) =>
                      handleNestedChange(
                        "medicalInformation",
                        "chronicConditions",
                        e.target.value
                      )
                    }
                    placeholder="Separate multiple conditions with commas"
                    className={inputClass}
                  />

                  <p className="mt-1.5 text-xs text-slate-400">
                    Example: Asthma, Diabetes
                  </p>
                </>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profile.medicalInformation
                    ?.chronicConditions?.length > 0 ? (
                    profile.medicalInformation.chronicConditions.map(
                      (condition, index) => (
                        <span
                          key={index}
                          className="rounded-full bg-violet-50 px-3 py-1.5 text-xs font-semibold text-violet-600"
                        >
                          {condition}
                        </span>
                      )
                    )
                  ) : (
                    <span className="text-sm text-slate-400">
                      No chronic conditions provided
                    </span>
                  )}
                </div>
              )}
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Medical Notes
              </label>

              {editing ? (
                <textarea
                  rows="4"
                  value={
                    formData.medicalInformation.notes
                  }
                  onChange={(e) =>
                    handleNestedChange(
                      "medicalInformation",
                      "notes",
                      e.target.value
                    )
                  }
                  placeholder="Add any other important medical information..."
                  maxLength={1000}
                  className={`${inputClass} resize-none`}
                />
              ) : (
                <p className="min-h-[80px] rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
                  {profile.medicalInformation?.notes ||
                    "No medical notes provided"}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Bottom Save Bar */}
        {editing && (
          <div className="sticky bottom-4 z-10 rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-lg backdrop-blur-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-slate-500">
                Review your information before saving your
                changes.
              </p>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex-1 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50 sm:flex-none"
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70 sm:flex-none"
                >
                  {saving ? (
                    <Loader2
                      size={16}
                      className="animate-spin"
                    />
                  ) : (
                    <Save size={16} />
                  )}

                  {saving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;

