import { useEffect, useMemo, useState } from "react";
import {
  Receipt,
  Search,
  RefreshCw,
  User,
  Stethoscope,
  ClipboardList,
  CalendarDays,
  IndianRupee,
  CreditCard,
  CheckCircle2,
  Clock3,
  XCircle,
} from "lucide-react";
import api from "../services/api";

function AdminInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/invoices");

      setInvoices(response.data.invoices || []);
    } catch (err) {
      console.error("Fetch invoices error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load invoices. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const getPatientName = (invoice) => {
    return (
      invoice.patientId?.userId?.name ||
      invoice.patientId?.name ||
      invoice.patient?.userId?.name ||
      invoice.patient?.name ||
      "Unknown Patient"
    );
  };

  const getDoctorName = (invoice) => {
    return (
      invoice.appointmentId?.doctorId?.userId?.name ||
      invoice.appointmentId?.doctorId?.name ||
      invoice.doctorId?.userId?.name ||
      invoice.doctorId?.name ||
      "Unknown Doctor"
    );
  };

  const getServiceName = (invoice) => {
    return (
      invoice.serviceId?.name ||
      invoice.service?.name ||
      invoice.appointmentId?.serviceId?.name ||
      invoice.appointmentId?.service?.name ||
      "Not specified"
    );
  };

  const getAppointmentDate = (invoice) => {
    return (
      invoice.appointmentId?.appointmentDate ||
      invoice.appointment?.appointmentDate ||
      null
    );
  };

  const getAppointmentTime = (invoice) => {
    return (
      invoice.appointmentId?.appointmentTime ||
      invoice.appointment?.appointmentTime ||
      null
    );
  };

  const filteredInvoices = useMemo(() => {
    const query = search.toLowerCase().trim();

    return invoices.filter((invoice) => {
      const patient = getPatientName(invoice).toLowerCase();
      const doctor = getDoctorName(invoice).toLowerCase();
      const service = getServiceName(invoice).toLowerCase();
      const paymentMethod = (
        invoice.paymentMethod || ""
      ).toLowerCase();

      const matchesSearch =
        !query ||
        patient.includes(query) ||
        doctor.includes(query) ||
        service.includes(query) ||
        paymentMethod.includes(query);

      const matchesStatus =
        statusFilter === "all" ||
        invoice.paymentStatus === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [invoices, search, statusFilter]);

  const formatDate = (date) => {
    if (!date) return "Not specified";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (time) => {
    if (!time) return "Not specified";

    if (/^\d{1,2}:\d{2}$/.test(time)) {
      const [hours, minutes] = time.split(":");
      const date = new Date();

      date.setHours(Number(hours), Number(minutes), 0, 0);

      return date.toLocaleTimeString("en-IN", {
        hour: "numeric",
        minute: "2-digit",
      });
    }

    return time;
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "paid":
        return "bg-emerald-50 text-emerald-600";

      case "pending":
        return "bg-amber-50 text-amber-600";

      case "cancelled":
        return "bg-red-50 text-red-600";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "paid":
        return <CheckCircle2 size={16} />;

      case "pending":
        return <Clock3 size={16} />;

      case "cancelled":
        return <XCircle size={16} />;

      default:
        return <Receipt size={16} />;
    }
  };

  const totalAmount = invoices.reduce(
    (sum, invoice) => sum + Number(invoice.amount || 0),
    0
  );

  const paidInvoices = invoices.filter(
    (invoice) => invoice.paymentStatus === "paid"
  );

  const pendingInvoices = invoices.filter(
    (invoice) => invoice.paymentStatus === "pending"
  );

  const paidAmount = paidInvoices.reduce(
    (sum, invoice) => sum + Number(invoice.amount || 0),
    0
  );

  const pendingAmount = pendingInvoices.reduce(
    (sum, invoice) => sum + Number(invoice.amount || 0),
    0
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
            <Receipt size={17} />
            Invoice Management
          </div>

          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Invoices
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Monitor patient invoices and payment information.
          </p>
        </div>

        <button
          onClick={fetchInvoices}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 self-start rounded-xl bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60 sm:self-auto"
        >
          <RefreshCw
            size={17}
            className={loading ? "animate-spin" : ""}
          />
          Refresh
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 p-5 text-white shadow-sm">
          <p className="text-sm text-blue-100">
            Total Invoices
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {invoices.length}
          </h2>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Total Amount
            </p>

            <IndianRupee
              size={20}
              className="text-blue-600"
            />
          </div>

          <h2 className="mt-2 text-2xl font-bold text-slate-800">
            ₹{totalAmount.toLocaleString("en-IN")}
          </h2>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Paid
          </p>

          <h2 className="mt-2 text-2xl font-bold text-emerald-600">
            ₹{paidAmount.toLocaleString("en-IN")}
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            {paidInvoices.length} paid invoice
            {paidInvoices.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Pending
          </p>

          <h2 className="mt-2 text-2xl font-bold text-amber-600">
            ₹{pendingAmount.toLocaleString("en-IN")}
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            {pendingInvoices.length} pending invoice
            {pendingInvoices.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="rounded-2xl bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 lg:flex-row">
          <div className="relative flex-1">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patient, doctor, service or payment method..."
              className="w-full rounded-xl bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) =>
              setStatusFilter(e.target.value)
            }
            className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">All Payment Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="cancelled">Cancelled</option>
          </select>
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
              Loading invoices...
            </p>
          </div>
        </div>
      ) : filteredInvoices.length === 0 ? (
        <div className="rounded-2xl bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Receipt size={26} />
          </div>

          <h3 className="mt-4 text-lg font-semibold text-slate-800">
            No invoices found
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Try changing your search or payment status filter.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filteredInvoices.length}
            </span>{" "}
            invoice
            {filteredInvoices.length !== 1 ? "s" : ""}
          </p>

          {filteredInvoices.map((invoice) => {
            const patientName = getPatientName(invoice);
            const doctorName = getDoctorName(invoice);
            const serviceName = getServiceName(invoice);

            return (
              <div
                key={invoice._id}
                className="rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md"
              >
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                  {/* Invoice details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                          <Receipt size={22} />
                        </div>

                        <div>
                          <h3 className="font-semibold text-slate-900">
                            {serviceName}
                          </h3>

                          <p className="text-xs text-slate-400">
                            Invoice ID: {invoice._id}
                          </p>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusStyle(
                          invoice.paymentStatus
                        )}`}
                      >
                        {getStatusIcon(
                          invoice.paymentStatus
                        )}

                        {invoice.paymentStatus ||
                          "unknown"}
                      </span>
                    </div>

                    {/* Information */}
                    <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div className="rounded-xl bg-slate-50 p-3">
                        <div className="flex items-center gap-2">
                          <User
                            size={16}
                            className="text-slate-400"
                          />

                          <p className="text-xs text-slate-400">
                            Patient
                          </p>
                        </div>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {patientName}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <div className="flex items-center gap-2">
                          <Stethoscope
                            size={16}
                            className="text-slate-400"
                          />

                          <p className="text-xs text-slate-400">
                            Doctor
                          </p>
                        </div>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {doctorName}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <div className="flex items-center gap-2">
                          <CalendarDays
                            size={16}
                            className="text-slate-400"
                          />

                          <p className="text-xs text-slate-400">
                            Appointment
                          </p>
                        </div>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          {formatDate(
                            getAppointmentDate(invoice)
                          )}
                        </p>

                        <p className="text-xs text-slate-400">
                          {formatTime(
                            getAppointmentTime(invoice)
                          )}
                        </p>
                      </div>

                      <div className="rounded-xl bg-slate-50 p-3">
                        <div className="flex items-center gap-2">
                          <CreditCard
                            size={16}
                            className="text-slate-400"
                          />

                          <p className="text-xs text-slate-400">
                            Payment Method
                          </p>
                        </div>

                        <p className="mt-1 text-sm font-semibold capitalize text-slate-700">
                          {invoice.paymentMethod ||
                            "Not specified"}
                        </p>
                      </div>
                    </div>

                    {/* Bottom details */}
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2">
                        <IndianRupee
                          size={16}
                          className="text-emerald-600"
                        />

                        <span className="text-sm font-bold text-emerald-700">
                          {Number(
                            invoice.amount || 0
                          ).toLocaleString("en-IN")}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-600">
                        <Clock3 size={15} />

                        Created:{" "}
                        {formatDate(invoice.createdAt)}
                      </div>

                      {invoice.paidAt && (
                        <div className="flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                          <CheckCircle2 size={15} />

                          Paid:{" "}
                          {formatDate(invoice.paidAt)}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default AdminInvoices;