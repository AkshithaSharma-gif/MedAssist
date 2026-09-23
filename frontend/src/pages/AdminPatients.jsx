import { useEffect, useMemo, useState } from "react";
import {
  Users,
  Search,
  Mail,
  Phone,
  CalendarDays,
  MapPin,
  UserCircle,
  RefreshCw,
  UserPlus,
  X,
  Loader2,
} from "lucide-react";
import api from "../services/api";

function AdminPatients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add Patient modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
  });

  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/patients");

      setPatients(response.data.patients || []);
    } catch (err) {
      console.error("Fetch patients error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load patients. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPatients();
  }, []);

  const filteredPatients = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) {
      return patients;
    }

    return patients.filter((patient) => {
      const name = patient.userId?.name || "";
      const email = patient.userId?.email || "";
      const phone = patient.userId?.phone || "";

      return (
        name.toLowerCase().includes(query) ||
        email.toLowerCase().includes(query) ||
        phone.toLowerCase().includes(query)
      );
    });
  }, [patients, search]);

  const formatDate = (date) => {
    if (!date) return "Not provided";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getAddress = (patient) => {
    const address = patient.address;

    if (!address) {
      return "Address not provided";
    }

    const parts = [
      address.street,
      address.city,
      address.state,
      address.postalCode,
    ].filter(Boolean);

    return parts.length > 0
      ? parts.join(", ")
      : "Address not provided";
  };

  // Handle Add Patient form changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Open Add Patient modal
  const openAddModal = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
    });

    setAddError("");
    setAddSuccess("");
    setShowAddModal(true);
  };

  // Close Add Patient modal
  const closeAddModal = () => {
    if (addLoading) return;

    setShowAddModal(false);
    setAddError("");
    setAddSuccess("");
  };

  // Create Patient
  const handleAddPatient = async (e) => {
    e.preventDefault();

    setAddError("");
    setAddSuccess("");

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password.trim()
    ) {
      setAddError("Name, email and password are required.");
      return;
    }

    try {
      setAddLoading(true);

      const response = await api.post("/auth/register-patient", {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        phone: formData.phone.trim(),
      });

      setAddSuccess(
        response.data?.message || "Patient created successfully."
      );

      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
      });

      // Refresh patient list
      await fetchPatients();

      // Close modal after successful creation
      setTimeout(() => {
        setShowAddModal(false);
        setAddSuccess("");
      }, 800);
    } catch (err) {
      console.error("Add patient error:", err);

      setAddError(
        err.response?.data?.message ||
          "Failed to create patient. Please try again."
      );
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
            <Users size={17} />
            Patient Management
          </div>

          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Patients
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View and manage registered patient profiles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Add Patient */}
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
          >
            <UserPlus size={17} />
            Add Patient
          </button>

          {/* Refresh */}
          <button
            type="button"
            onClick={fetchPatients}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 p-5 text-white shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-100">
                Total Patients
              </p>

              <h2 className="mt-1 text-3xl font-bold">
                {patients.length}
              </h2>
            </div>

            <div className="rounded-xl bg-white/15 p-3">
              <Users size={25} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Active Patients
              </p>

              <h2 className="mt-1 text-3xl font-bold text-slate-900">
                {
                  patients.filter(
                    (patient) => patient.isActive !== false
                  ).length
                }
              </h2>
            </div>

            <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
              <UserCircle size={25} />
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="relative">
          <Search
            size={19}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by patient name, email or phone..."
            className="w-full rounded-xl bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
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
              Loading patients...
            </p>
          </div>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="rounded-2xl bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Users size={26} />
          </div>

          <h3 className="mt-4 text-lg font-semibold text-slate-800">
            {search ? "No patients found" : "No patients registered"}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {search
              ? "Try a different name, email or phone number."
              : "Patient profiles will appear here once registered."}
          </p>
        </div>
      ) : (
        <>
          {/* Result count */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {filteredPatients.length}
              </span>{" "}
              {filteredPatients.length === 1
                ? "patient"
                : "patients"}
            </p>
          </div>

          {/* Patient cards */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {filteredPatients.map((patient) => {
              const user = patient.userId || {};

              return (
                <div
                  key={patient._id}
                  className="rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* Patient header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <UserCircle size={28} />
                      </div>

                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {user.name || "Unnamed Patient"}
                        </h3>

                        <p className="text-xs text-slate-500">
                          Patient ID:{" "}
                          {patient._id?.slice(-8) || "N/A"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        patient.isActive !== false
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {patient.isActive !== false
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>

                  {/* Contact information */}
                  <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                      <Mail
                        size={17}
                        className="shrink-0 text-blue-500"
                      />

                      <div className="min-w-0">
                        <p className="text-xs text-slate-400">
                          Email
                        </p>

                        <p className="truncate text-sm font-medium text-slate-700">
                          {user.email || "Not provided"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-3">
                      <Phone
                        size={17}
                        className="shrink-0 text-cyan-500"
                      />

                      <div>
                        <p className="text-xs text-slate-400">
                          Phone
                        </p>

                        <p className="text-sm font-medium text-slate-700">
                          {user.phone || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Medical/basic information */}
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-400">
                        Date of Birth
                      </p>

                      <div className="mt-1 flex items-center gap-2">
                        <CalendarDays
                          size={15}
                          className="text-slate-400"
                        />

                        <p className="text-sm font-medium text-slate-700">
                          {formatDate(patient.dateOfBirth)}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <p className="text-xs text-slate-400">
                        Gender
                      </p>

                      <p className="mt-1 text-sm font-medium capitalize text-slate-700">
                        {patient.gender
                          ? patient.gender.replaceAll("_", " ")
                          : "Not provided"}
                      </p>
                    </div>
                  </div>

                  {/* Blood group */}
                  <div className="mt-3 rounded-xl bg-red-50 p-3">
                    <p className="text-xs text-red-400">
                      Blood Group
                    </p>

                    <p className="mt-1 text-sm font-semibold text-red-600">
                      {patient.bloodGroup &&
                      patient.bloodGroup !== "unknown"
                        ? patient.bloodGroup
                        : "Not provided"}
                    </p>
                  </div>

                  {/* Address */}
                  <div className="mt-3 flex items-start gap-3 rounded-xl bg-slate-50 p-3">
                    <MapPin
                      size={17}
                      className="mt-0.5 shrink-0 text-slate-400"
                    />

                    <div>
                      <p className="text-xs text-slate-400">
                        Address
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        {getAddress(patient)}
                      </p>
                    </div>
                  </div>

                  {/* Emergency contact */}
                  {patient.emergencyContact?.name && (
                    <div className="mt-3 rounded-xl bg-amber-50 p-3">
                      <p className="text-xs text-amber-600">
                        Emergency Contact
                      </p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {patient.emergencyContact.name}
                        {patient.emergencyContact.relationship
                          ? ` • ${patient.emergencyContact.relationship}`
                          : ""}
                      </p>

                      {patient.emergencyContact.phone && (
                        <p className="mt-1 text-xs text-slate-500">
                          {patient.emergencyContact.phone}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Created date */}
                  <div className="mt-4 border-t border-slate-100 pt-3">
                    <p className="text-xs text-slate-400">
                      Registered on{" "}
                      <span className="font-medium text-slate-500">
                        {formatDate(patient.createdAt)}
                      </span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Add Patient Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Add Patient
                </h2>
                <p className="mt-0.5 text-sm text-slate-500">
                  Create a new patient account.
                </p>
              </div>

              <button
                type="button"
                onClick={closeAddModal}
                disabled={addLoading}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleAddPatient}
              className="space-y-5 p-6"
            >
              {/* Error */}
              {addError && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  {addError}
                </div>
              )}

              {/* Success */}
              {addSuccess && (
                <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-600">
                  {addSuccess}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Full Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleFormChange}
                  placeholder="Enter patient name"
                  required
                  className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Email */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Email
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleFormChange}
                  placeholder="Enter email address"
                  required
                  className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Phone */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Phone
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleFormChange}
                  placeholder="Enter phone number"
                  className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Password */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Temporary Password
                </label>

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleFormChange}
                  placeholder="Enter temporary password"
                  required
                  minLength={6}
                  className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-100"
                />

                <p className="mt-1.5 text-xs text-slate-400">
                  The patient can use this password to log in.
                </p>
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeAddModal}
                  disabled={addLoading}
                  className="rounded-xl bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={addLoading}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {addLoading ? (
                    <>
                      <Loader2
                        size={17}
                        className="animate-spin"
                      />
                      Creating...
                    </>
                  ) : (
                    <>
                      <UserPlus size={17} />
                      Create Patient
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

export default AdminPatients;