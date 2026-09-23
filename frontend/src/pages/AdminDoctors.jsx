import { useEffect, useMemo, useState } from "react";
import {
  Stethoscope,
  Search,
  Mail,
  Phone,
  Building2,
  GraduationCap,
  Clock3,
  IndianRupee,
  RefreshCw,
  UserCircle,
  UserPlus,
  X,
  Loader2,
} from "lucide-react";
import api from "../services/api";

function AdminDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add Doctor modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [departmentsLoading, setDepartmentsLoading] = useState(false);
  const [addLoading, setAddLoading] = useState(false);
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    departmentId: "",
    specialization: "",
    qualification: "",
    experience: "",
    consultationFee: "",
  });

  const fetchDoctors = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/doctors");

      setDoctors(response.data.doctors || []);
    } catch (err) {
      console.error("Fetch doctors error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load doctors. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, []);

  const filteredDoctors = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return doctors;

    return doctors.filter((doctor) => {
      const name = doctor.userId?.name || "";
      const email = doctor.userId?.email || "";
      const phone = doctor.userId?.phone || "";
      const specialization = doctor.specialization || "";
      const qualification = doctor.qualification || "";
      const department = doctor.departmentId?.name || "";

      return (
        name.toLowerCase().includes(query) ||
        email.toLowerCase().includes(query) ||
        phone.toLowerCase().includes(query) ||
        specialization.toLowerCase().includes(query) ||
        qualification.toLowerCase().includes(query) ||
        department.toLowerCase().includes(query)
      );
    });
  }, [doctors, search]);

  const getAvailabilityText = (doctor) => {
    const availableDays = (doctor.availability || []).filter(
      (item) => item.isAvailable
    );

    if (availableDays.length === 0) {
      return "Not available";
    }

    return `${availableDays.length} day${
      availableDays.length > 1 ? "s" : ""
    } / week`;
  };

  const formatDays = (doctor) => {
    const days = (doctor.availability || [])
      .filter((item) => item.isAvailable)
      .map((item) => item.day?.slice(0, 3))
      .filter(Boolean);

    return days.length > 0 ? days.join(", ") : "No schedule";
  };

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      setDepartmentsLoading(true);

      const response = await api.get("/departments");

      setDepartments(
        response.data.departments ||
          response.data.data ||
          []
      );
    } catch (err) {
      console.error("Fetch departments error:", err);

      setAddError(
        err.response?.data?.message ||
          "Failed to load departments."
      );
    } finally {
      setDepartmentsLoading(false);
    }
  };

  // Handle form changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Open modal
  const openAddModal = async () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      departmentId: "",
      specialization: "",
      qualification: "",
      experience: "",
      consultationFee: "",
    });

    setAddError("");
    setAddSuccess("");
    setShowAddModal(true);

    await fetchDepartments();
  };

  // Close modal
  const closeAddModal = () => {
    if (addLoading) return;

    setShowAddModal(false);
    setAddError("");
    setAddSuccess("");
  };

  // Create doctor
  const handleAddDoctor = async (e) => {
    e.preventDefault();

    setAddError("");
    setAddSuccess("");

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password.trim() ||
      !formData.departmentId ||
      !formData.specialization.trim()
    ) {
      setAddError(
        "Name, email, password, department and specialization are required."
      );
      return;
    }

    try {
      setAddLoading(true);

      // Step 1: Create doctor user account
      const staffResponse = await api.post(
        "/auth/create-staff",
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
          phone: formData.phone.trim(),
          role: "doctor",
        }
      );

      const userId = staffResponse.data?.user?.id;

      if (!userId) {
        throw new Error(
          "Doctor account was created but user ID was not returned."
        );
      }

      // Step 2: Create doctor profile
      await api.post("/doctors", {
        userId,
        departmentId: formData.departmentId,
        specialization: formData.specialization.trim(),
        qualification: formData.qualification.trim(),
        experience: Number(formData.experience) || 0,
        consultationFee:
          Number(formData.consultationFee) || 0,
        availability: [],
      });

      setAddSuccess("Doctor created successfully.");

      setFormData({
        name: "",
        email: "",
        password: "",
        phone: "",
        departmentId: "",
        specialization: "",
        qualification: "",
        experience: "",
        consultationFee: "",
      });

      // Refresh doctor list
      await fetchDoctors();

      // Close modal shortly after success
      setTimeout(() => {
        setShowAddModal(false);
        setAddSuccess("");
      }, 800);
    } catch (err) {
      console.error("Add doctor error:", err);

      setAddError(
        err.response?.data?.message ||
          err.message ||
          "Failed to create doctor. Please try again."
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
            <Stethoscope size={17} />
            Doctor Management
          </div>

          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Doctors
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            View registered doctors and their professional information.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Add Doctor */}
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
          >
            <UserPlus size={17} />
            Add Doctor
          </button>

          {/* Refresh */}
          <button
            type="button"
            onClick={fetchDoctors}
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
                Total Doctors
              </p>

              <h2 className="mt-1 text-3xl font-bold">
                {doctors.length}
              </h2>
            </div>

            <div className="rounded-xl bg-white/15 p-3">
              <Stethoscope size={25} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-500">
                Active Doctors
              </p>

              <h2 className="mt-1 text-3xl font-bold text-slate-900">
                {
                  doctors.filter(
                    (doctor) => doctor.isActive !== false
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
            placeholder="Search by name, email, specialization or department..."
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
              Loading doctors...
            </p>
          </div>
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="rounded-2xl bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Stethoscope size={26} />
          </div>

          <h3 className="mt-4 text-lg font-semibold text-slate-800">
            {search ? "No doctors found" : "No doctors registered"}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {search
              ? "Try a different search term."
              : "Registered doctors will appear here."}
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {filteredDoctors.length}
              </span>{" "}
              {filteredDoctors.length === 1
                ? "doctor"
                : "doctors"}
            </p>
          </div>

          {/* Doctor cards */}
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            {filteredDoctors.map((doctor) => {
              const user = doctor.userId || {};
              const department = doctor.departmentId;

              return (
                <div
                  key={doctor._id}
                  className="rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <Stethoscope size={27} />
                      </div>

                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {user.name || "Unnamed Doctor"}
                        </h3>

                        <p className="text-xs text-slate-500">
                          Doctor ID:{" "}
                          {doctor._id?.slice(-8) || "N/A"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        doctor.isActive !== false
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-red-50 text-red-600"
                      }`}
                    >
                      {doctor.isActive !== false
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>

                  {/* Contact */}
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

                  {/* Professional information */}
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-blue-50 p-3">
                      <div className="flex items-center gap-2">
                        <Stethoscope
                          size={16}
                          className="text-blue-500"
                        />

                        <p className="text-xs text-blue-500">
                          Specialization
                        </p>
                      </div>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {doctor.specialization ||
                          "Not provided"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-cyan-50 p-3">
                      <div className="flex items-center gap-2">
                        <Building2
                          size={16}
                          className="text-cyan-500"
                        />

                        <p className="text-xs text-cyan-600">
                          Department
                        </p>
                      </div>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {department?.name || "Not provided"}
                      </p>
                    </div>
                  </div>

                  {/* Qualification & experience */}
                  <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="flex items-center gap-2">
                        <GraduationCap
                          size={16}
                          className="text-slate-400"
                        />

                        <p className="text-xs text-slate-400">
                          Qualification
                        </p>
                      </div>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {doctor.qualification ||
                          "Not provided"}
                      </p>
                    </div>

                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="flex items-center gap-2">
                        <Clock3
                          size={16}
                          className="text-slate-400"
                        />

                        <p className="text-xs text-slate-400">
                          Experience
                        </p>
                      </div>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {doctor.experience ?? 0}{" "}
                        {doctor.experience === 1
                          ? "year"
                          : "years"}
                      </p>
                    </div>
                  </div>

                  {/* Fee */}
                  <div className="mt-3 flex items-center justify-between rounded-xl bg-emerald-50 p-3">
                    <div className="flex items-center gap-2">
                      <IndianRupee
                        size={17}
                        className="text-emerald-600"
                      />

                      <p className="text-xs text-emerald-600">
                        Consultation Fee
                      </p>
                    </div>

                    <p className="text-sm font-bold text-emerald-700">
                      ₹{doctor.consultationFee ?? 0}
                    </p>
                  </div>

                  {/* Availability */}
                  <div className="mt-3 rounded-xl bg-slate-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Clock3
                          size={17}
                          className="text-slate-400"
                        />

                        <div>
                          <p className="text-xs text-slate-400">
                            Availability
                          </p>

                          <p className="mt-1 text-sm font-medium text-slate-700">
                            {getAvailabilityText(doctor)}
                          </p>
                        </div>
                      </div>

                      <p className="text-xs font-medium capitalize text-slate-500">
                        {formatDays(doctor)}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Add Doctor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-xl">
            {/* Modal Header */}
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Add Doctor
                </h2>

                <p className="mt-0.5 text-sm text-slate-500">
                  Create a new doctor account and profile.
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
              onSubmit={handleAddDoctor}
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

              {/* Basic Information */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-slate-800">
                  Basic Information
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                      placeholder="Enter doctor name"
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
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div>
                <h3 className="mb-3 text-sm font-semibold text-slate-800">
                  Professional Information
                </h3>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {/* Department */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Department
                    </label>

                    <select
                      name="departmentId"
                      value={formData.departmentId}
                      onChange={handleFormChange}
                      required
                      disabled={departmentsLoading}
                      className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      <option value="">
                        {departmentsLoading
                          ? "Loading departments..."
                          : "Select department"}
                      </option>

                      {departments.map((department) => (
                        <option
                          key={department._id}
                          value={department._id}
                        >
                          {department.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Specialization */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Specialization
                    </label>

                    <input
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleFormChange}
                      placeholder="e.g. Cardiology"
                      required
                      className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* Qualification */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Qualification
                    </label>

                    <input
                      type="text"
                      name="qualification"
                      value={formData.qualification}
                      onChange={handleFormChange}
                      placeholder="e.g. MBBS, MD"
                      className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* Experience */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Experience (Years)
                    </label>

                    <input
                      type="number"
                      name="experience"
                      value={formData.experience}
                      onChange={handleFormChange}
                      placeholder="e.g. 5"
                      min="0"
                      className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>

                  {/* Consultation Fee */}
                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Consultation Fee (₹)
                    </label>

                    <input
                      type="number"
                      name="consultationFee"
                      value={formData.consultationFee}
                      onChange={handleFormChange}
                      placeholder="e.g. 500"
                      min="0"
                      className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-100"
                    />
                  </div>
                </div>
              </div>

              {/* Availability Note */}
              <div className="rounded-xl bg-blue-50 px-4 py-3">
                <p className="text-sm text-blue-700">
                  Doctor availability can be configured later from
                  the doctor's Profile page.
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
                  disabled={addLoading || departmentsLoading}
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
                      Create Doctor
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

export default AdminDoctors;