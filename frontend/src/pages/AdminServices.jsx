import { useEffect, useMemo, useState } from "react";
import {
  ClipboardList,
  Search,
  Plus,
  Pencil,
  Power,
  RefreshCw,
  X,
  Clock3,
  IndianRupee,
  Building2,
} from "lucide-react";
import api from "../services/api";

function AdminServices() {
  const [services, setServices] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    departmentId: "",
    duration: "",
    price: "",
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [servicesResponse, departmentsResponse] =
        await Promise.all([
          api.get("/services"),
          api.get("/departments"),
        ]);

      setServices(servicesResponse.data.services || []);
      setDepartments(
        departmentsResponse.data.departments || []
      );
    } catch (err) {
      console.error("Fetch services error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load services. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filteredServices = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return services;

    return services.filter((service) => {
      const name = service.name || "";
      const description = service.description || "";
      const department = service.departmentId?.name || "";

      return (
        name.toLowerCase().includes(query) ||
        description.toLowerCase().includes(query) ||
        department.toLowerCase().includes(query)
      );
    });
  }, [services, search]);

  const openAddModal = () => {
    setEditingService(null);

    setFormData({
      name: "",
      description: "",
      departmentId: "",
      duration: "",
      price: "",
    });

    setError("");
    setModalOpen(true);
  };

  const openEditModal = (service) => {
    setEditingService(service);

    setFormData({
      name: service.name || "",
      description: service.description || "",
      departmentId: service.departmentId?._id || service.departmentId || "",
      duration: service.duration ?? "",
      price: service.price ?? "",
    });

    setError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingService(null);

    setFormData({
      name: "",
      description: "",
      departmentId: "",
      duration: "",
      price: "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      setError("Service name is required.");
      return;
    }

    if (!formData.departmentId) {
      setError("Please select a department.");
      return;
    }

    if (
      formData.duration === "" ||
      Number(formData.duration) < 0
    ) {
      setError("Please enter a valid duration.");
      return;
    }

    if (
      formData.price === "" ||
      Number(formData.price) < 0
    ) {
      setError("Please enter a valid price.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        departmentId: formData.departmentId,
        duration: Number(formData.duration),
        price: Number(formData.price),
      };

      if (editingService) {
        await api.put(
          `/services/${editingService._id}`,
          payload
        );
      } else {
        await api.post("/services", payload);
      }

      closeModal();
      await fetchData();
    } catch (err) {
      console.error("Save service error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to save service. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (service) => {
    try {
      setError("");

      await api.put(`/services/${service._id}`, {
        isActive: !service.isActive,
      });

      await fetchData();
    } catch (err) {
      console.error("Update service status error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to update service status."
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
            <ClipboardList size={17} />
            Service Management
          </div>

          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Services
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage medical services, pricing and duration.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchData}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw
              size={17}
              className={loading ? "animate-spin" : ""}
            />
            Refresh
          </button>

          <button
            onClick={openAddModal}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700"
          >
            <Plus size={18} />
            Add Service
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 p-5 text-white shadow-sm">
          <p className="text-sm text-blue-100">
            Total Services
          </p>

          <div className="mt-2 flex items-center justify-between">
            <h2 className="text-3xl font-bold">
              {services.length}
            </h2>

            <ClipboardList size={26} />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Active Services
          </p>

          <h2 className="mt-2 text-3xl font-bold text-emerald-600">
            {
              services.filter(
                (service) => service.isActive !== false
              ).length
            }
          </h2>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Inactive Services
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-700">
            {
              services.filter(
                (service) => service.isActive === false
              ).length
            }
          </h2>
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
            placeholder="Search by service, description or department..."
            className="w-full rounded-xl bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>
      </div>

      {/* Error */}
      {error && !modalOpen && (
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
              Loading services...
            </p>
          </div>
        </div>
      ) : filteredServices.length === 0 ? (
        <div className="rounded-2xl bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <ClipboardList size={26} />
          </div>

          <h3 className="mt-4 text-lg font-semibold text-slate-800">
            {search
              ? "No services found"
              : "No services available"}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {search
              ? "Try a different search term."
              : "Add your first service to get started."}
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filteredServices.length}
            </span>{" "}
            {filteredServices.length === 1
              ? "service"
              : "services"}
          </p>

          {/* Service cards */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredServices.map((service) => {
              const department = service.departmentId;

              return (
                <div
                  key={service._id}
                  className="rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <ClipboardList size={23} />
                      </div>

                      <div>
                        <h3 className="font-semibold text-slate-900">
                          {service.name}
                        </h3>

                        <p className="text-xs text-slate-400">
                          Medical Service
                        </p>
                      </div>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        service.isActive !== false
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {service.isActive !== false
                        ? "Active"
                        : "Inactive"}
                    </span>
                  </div>

                  {/* Description */}
                  <div className="mt-5 min-h-[68px]">
                    <p className="text-xs text-slate-400">
                      Description
                    </p>

                    <p className="mt-1 text-sm leading-6 text-slate-600">
                      {service.description ||
                        "No description provided."}
                    </p>
                  </div>

                  {/* Department */}
                  <div className="mt-4 flex items-center gap-3 rounded-xl bg-cyan-50 p-3">
                    <Building2
                      size={18}
                      className="text-cyan-600"
                    />

                    <div>
                      <p className="text-xs text-cyan-600">
                        Department
                      </p>

                      <p className="text-sm font-semibold text-slate-700">
                        {department?.name ||
                          "Not assigned"}
                      </p>
                    </div>
                  </div>

                  {/* Duration + Price */}
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-50 p-3">
                      <div className="flex items-center gap-2">
                        <Clock3
                          size={16}
                          className="text-slate-400"
                        />

                        <p className="text-xs text-slate-400">
                          Duration
                        </p>
                      </div>

                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {service.duration ?? 0} mins
                      </p>
                    </div>

                    <div className="rounded-xl bg-emerald-50 p-3">
                      <div className="flex items-center gap-2">
                        <IndianRupee
                          size={16}
                          className="text-emerald-600"
                        />

                        <p className="text-xs text-emerald-600">
                          Price
                        </p>
                      </div>

                      <p className="mt-1 text-sm font-bold text-emerald-700">
                        ₹{service.price ?? 0}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-5 flex gap-2">
                    <button
                      onClick={() =>
                        openEditModal(service)
                      }
                      className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleToggleStatus(service)
                      }
                      className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                        service.isActive !== false
                          ? "bg-red-50 text-red-600 hover:bg-red-100"
                          : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                      }`}
                    >
                      <Power size={16} />
                      {service.isActive !== false
                        ? "Deactivate"
                        : "Activate"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-white shadow-xl">
            <div className="flex items-center justify-between px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  {editingService
                    ? "Edit Service"
                    : "Add Service"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingService
                    ? "Update service information."
                    : "Create a new medical service."}
                </p>
              </div>

              <button
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="space-y-5 px-6 pb-6"
            >
              {error && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              {/* Name */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Service Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. General Consultation"
                  className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              {/* Department */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Department
                </label>

                <select
                  name="departmentId"
                  value={formData.departmentId}
                  onChange={handleChange}
                  className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-100"
                  required
                >
                  <option value="">
                    Select department
                  </option>

                  {departments
                    .filter(
                      (department) =>
                        department.isActive !== false
                    )
                    .map((department) => (
                      <option
                        key={department._id}
                        value={department._id}
                      >
                        {department.name}
                      </option>
                    ))}
                </select>
              </div>

              {/* Duration + Price */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Duration (minutes)
                  </label>

                  <input
                    type="number"
                    name="duration"
                    min="0"
                    value={formData.duration}
                    onChange={handleChange}
                    placeholder="30"
                    className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Price (₹)
                  </label>

                  <input
                    type="number"
                    name="price"
                    min="0"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="500"
                    className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-100"
                    required
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter service description..."
                  rows={4}
                  className="w-full resize-none rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="rounded-xl bg-slate-100 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving && (
                    <RefreshCw
                      size={16}
                      className="animate-spin"
                    />
                  )}

                  {saving
                    ? "Saving..."
                    : editingService
                    ? "Update Service"
                    : "Add Service"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminServices;