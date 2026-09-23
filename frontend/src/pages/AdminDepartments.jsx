import { useEffect, useMemo, useState } from "react";
import {
  Building2,
  Search,
  Plus,
  Pencil,
  Power,
  RefreshCw,
  X,
} from "lucide-react";
import api from "../services/api";

function AdminDepartments() {
  const [departments, setDepartments] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingDepartment, setEditingDepartment] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [saving, setSaving] = useState(false);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/departments");

      setDepartments(response.data.departments || []);
    } catch (err) {
      console.error("Fetch departments error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load departments. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const filteredDepartments = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return departments;

    return departments.filter((department) => {
      const name = department.name || "";
      const description = department.description || "";

      return (
        name.toLowerCase().includes(query) ||
        description.toLowerCase().includes(query)
      );
    });
  }, [departments, search]);

  const openAddModal = () => {
    setEditingDepartment(null);

    setFormData({
      name: "",
      description: "",
    });

    setError("");
    setModalOpen(true);
  };

  const openEditModal = (department) => {
    setEditingDepartment(department);

    setFormData({
      name: department.name || "",
      description: department.description || "",
    });

    setError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditingDepartment(null);
    setFormData({
      name: "",
      description: "",
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
      setError("Department name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (editingDepartment) {
        await api.put(
          `/departments/${editingDepartment._id}`,
          {
            name: formData.name.trim(),
            description: formData.description.trim(),
          }
        );
      } else {
        await api.post("/departments", {
          name: formData.name.trim(),
          description: formData.description.trim(),
        });
      }

      closeModal();
      await fetchDepartments();
    } catch (err) {
      console.error("Save department error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to save department. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (department) => {
    try {
      setError("");

      await api.put(`/departments/${department._id}`, {
        isActive: !department.isActive,
      });

      await fetchDepartments();
    } catch (err) {
      console.error("Update department status error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to update department status."
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
            <Building2 size={17} />
            Department Management
          </div>

          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Departments
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage hospital departments and their availability.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={fetchDepartments}
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
            Add Department
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 p-5 text-white shadow-sm">
          <p className="text-sm text-blue-100">
            Total Departments
          </p>

          <div className="mt-2 flex items-center justify-between">
            <h2 className="text-3xl font-bold">
              {departments.length}
            </h2>

            <Building2 size={26} />
          </div>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Active Departments
          </p>

          <h2 className="mt-2 text-3xl font-bold text-emerald-600">
            {
              departments.filter(
                (department) => department.isActive !== false
              ).length
            }
          </h2>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Inactive Departments
          </p>

          <h2 className="mt-2 text-3xl font-bold text-slate-700">
            {
              departments.filter(
                (department) => department.isActive === false
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
            placeholder="Search departments..."
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
              Loading departments...
            </p>
          </div>
        </div>
      ) : filteredDepartments.length === 0 ? (
        <div className="rounded-2xl bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Building2 size={26} />
          </div>

          <h3 className="mt-4 text-lg font-semibold text-slate-800">
            {search
              ? "No departments found"
              : "No departments available"}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            {search
              ? "Try a different search term."
              : "Add your first department to get started."}
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filteredDepartments.length}
            </span>{" "}
            {filteredDepartments.length === 1
              ? "department"
              : "departments"}
          </p>

          {/* Department cards */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {filteredDepartments.map((department) => (
              <div
                key={department._id}
                className="rounded-2xl bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Building2 size={23} />
                    </div>

                    <div>
                      <h3 className="font-semibold text-slate-900">
                        {department.name}
                      </h3>

                      <p className="text-xs text-slate-400">
                        Department
                      </p>
                    </div>
                  </div>

                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      department.isActive !== false
                        ? "bg-emerald-50 text-emerald-600"
                        : "bg-slate-100 text-slate-500"
                    }`}
                  >
                    {department.isActive !== false
                      ? "Active"
                      : "Inactive"}
                  </span>
                </div>

                <div className="mt-5 min-h-[70px]">
                  <p className="text-xs text-slate-400">
                    Description
                  </p>

                  <p className="mt-1 text-sm leading-6 text-slate-600">
                    {department.description ||
                      "No description provided."}
                  </p>
                </div>

                <div className="mt-5 flex gap-2">
                  <button
                    onClick={() =>
                      openEditModal(department)
                    }
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    <Pencil size={16} />
                    Edit
                  </button>

                  <button
                    onClick={() =>
                      handleToggleStatus(department)
                    }
                    className={`flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                      department.isActive !== false
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-emerald-50 text-emerald-600 hover:bg-emerald-100"
                    }`}
                  >
                    <Power size={16} />
                    {department.isActive !== false
                      ? "Deactivate"
                      : "Activate"}
                  </button>
                </div>
              </div>
            ))}
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
                  {editingDepartment
                    ? "Edit Department"
                    : "Add Department"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingDepartment
                    ? "Update department information."
                    : "Create a new hospital department."}
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

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Department Name
                </label>

                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Cardiology"
                  className="w-full rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-100"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Description
                </label>

                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Enter department description..."
                  rows={4}
                  className="w-full resize-none rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-800 outline-none transition focus:bg-white focus:ring-2 focus:ring-blue-100"
                />
              </div>

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
                    : editingDepartment
                    ? "Update Department"
                    : "Add Department"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDepartments;