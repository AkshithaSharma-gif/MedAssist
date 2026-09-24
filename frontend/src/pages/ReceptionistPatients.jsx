import { useEffect, useState } from "react";
import {
  Users,
  Search,
  Mail,
  Phone,
  CalendarDays,
  UserCircle,
  Loader2,
  AlertCircle,
  UserPlus,
  X,
} from "lucide-react";
import api from "../services/api";

function ReceptionistPatients() {
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showAddPatient, setShowAddPatient] = useState(false);
  const [addingPatient, setAddingPatient] = useState(false);
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

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
      console.error("Failed to load patients:", err);

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleAddPatient = async (e) => {
    e.preventDefault();

    setFormError("");
    setSuccessMessage("");

    if (!formData.name || !formData.email || !formData.password) {
      setFormError("Name, email and password are required.");
      return;
    }

    try {
      setAddingPatient(true);

      const response = await api.post(
        "/auth/register-patient",
        formData
      );

      setSuccessMessage(
        response.data.message || "Patient registered successfully."
      );

      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
      });

      await fetchPatients();

      setTimeout(() => {
        setShowAddPatient(false);
        setSuccessMessage("");
      }, 1200);
    } catch (err) {
      console.error("Failed to add patient:", err);

      setFormError(
        err.response?.data?.message ||
          "Failed to register patient. Please try again."
      );
    } finally {
      setAddingPatient(false);
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const name = patient.userId?.name || "";
    const email = patient.userId?.email || "";
    const phone = patient.userId?.phone || "";

    const searchText = search.toLowerCase();

    return (
      name.toLowerCase().includes(searchText) ||
      email.toLowerCase().includes(searchText) ||
      phone.toLowerCase().includes(searchText)
    );
  });

  const formatDate = (date) => {
    if (!date) return "Not provided";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Patients
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            View and manage registered patients
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setShowAddPatient(true);
            setFormError("");
            setSuccessMessage("");
          }}
          className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
        >
          <UserPlus size={19} />
          Add Patient
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users size={22} />
            </div>

            <div>
              <p className="text-sm text-gray-500">Total Patients</p>
              <p className="text-2xl font-bold text-gray-900">
                {patients.length}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-50 text-green-600">
              <UserCircle size={22} />
            </div>

            <div>
              <p className="text-sm text-gray-500">Showing</p>
              <p className="text-2xl font-bold text-gray-900">
                {filteredPatients.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="rounded-2xl bg-white p-5 shadow-sm">
        <div className="relative">
          <Search
            size={20}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
          />

          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center rounded-2xl bg-white py-16 shadow-sm">
          <div className="flex items-center gap-3 text-gray-500">
            <Loader2 size={22} className="animate-spin" />
            <span>Loading patients...</span>
          </div>
        </div>
      )}

      {/* Error */}
      {!loading && error && (
        <div className="rounded-2xl bg-red-50 p-5 text-red-700">
          <div className="flex items-start gap-3">
            <AlertCircle size={20} className="mt-0.5 shrink-0" />

            <div>
              <p className="font-semibold">Unable to load patients</p>

              <p className="mt-1 text-sm">{error}</p>

              <button
                type="button"
                onClick={fetchPatients}
                className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty */}
      {!loading && !error && filteredPatients.length === 0 && (
        <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
            <Users size={26} />
          </div>

          <h3 className="mt-4 text-lg font-semibold text-gray-900">
            No patients found
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            {search
              ? "Try changing your search."
              : "There are no active patients yet."}
          </p>
        </div>
      )}

      {/* Patient Cards */}
      {!loading && !error && filteredPatients.length > 0 && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          {filteredPatients.map((patient) => (
            <div
              key={patient._id}
              className="rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-600">
                  <UserCircle size={27} />
                </div>

                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-lg font-semibold text-gray-900">
                    {patient.userId?.name || "Unknown Patient"}
                  </h2>

                  <p className="mt-1 text-sm text-gray-500">
                    Patient ID: {patient._id.slice(-8)}
                  </p>
                </div>

                <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                  Active
                </span>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Mail size={17} className="text-gray-400" />

                  <span className="truncate">
                    {patient.userId?.email || "Email not provided"}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <Phone size={17} className="text-gray-400" />

                  <span>
                    {patient.userId?.phone || "Phone not provided"}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <CalendarDays size={17} className="text-gray-400" />

                  <span>
                    DOB: {formatDate(patient.dateOfBirth)}
                  </span>
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 border-t border-gray-100 pt-4">
                <div>
                  <p className="text-xs text-gray-400">Gender</p>

                  <p className="mt-1 text-sm font-medium capitalize text-gray-700">
                    {patient.gender
                      ? patient.gender.replaceAll("_", " ")
                      : "Not provided"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-gray-400">Blood Group</p>

                  <p className="mt-1 text-sm font-medium text-gray-700">
                    {patient.bloodGroup || "Unknown"}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Patient Modal */}
      {showAddPatient && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-gray-100 px-6 py-5">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">
                  Add Patient
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Create a new patient account
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddPatient(false)}
                className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
              >
                <X size={20} />
              </button>
            </div>

            {/* Form */}
            <form
              onSubmit={handleAddPatient}
              className="space-y-5 px-6 py-6"
            >
              {formError && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
                  {formError}
                </div>
              )}

              {successMessage && (
                <div className="rounded-xl bg-green-50 px-4 py-3 text-sm text-green-700">
                  {successMessage}
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Full Name *
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter patient name"
                  disabled={addingPatient}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email *
                </label>

                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter patient email"
                  disabled={addingPatient}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Password *
                </label>

                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Create login password"
                  disabled={addingPatient}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Phone
                </label>

                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  disabled={addingPatient}
                  className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                />
              </div>

              {/* Actions */}
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={() => setShowAddPatient(false)}
                  disabled={addingPatient}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={addingPatient}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {addingPatient ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      Add Patient
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

export default ReceptionistPatients;