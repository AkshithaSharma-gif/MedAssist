import { useEffect, useState, useCallback } from "react";
import {
    Receipt,
    Search,
    Loader2,
    AlertCircle,
    CheckCircle2,
    Clock3,
    XCircle,
    User2,
    CalendarDays,
    ClipboardList,
    CreditCard,
} from "lucide-react";
import api from "../services/api";

const STATUS_FILTERS = ["all", "pending", "paid", "cancelled"];

const paymentStatusBadge = {
    pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
    paid: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    cancelled: "bg-red-50 text-red-700 ring-1 ring-red-200",
};

const paymentStatusIcon = {
    pending: <Clock3 size={13} />,
    paid: <CheckCircle2 size={13} />,
    cancelled: <XCircle size={13} />,
};

function ReceptionistInvoices() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");

    const fetchInvoices = useCallback(async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/invoices");

            setInvoices(response.data.invoices || []);
        } catch (err) {
            console.error("Failed to fetch invoices:", err);
            setError(err.response?.data?.message || "Failed to load invoices");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInvoices();
    }, [fetchInvoices]);

    const formatDate = (date) => {
        if (!date) return "N/A";
        return new Date(date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

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

    const formatCurrency = (amount) => {
        if (amount === undefined || amount === null) return "N/A";
        return `₹${Number(amount).toLocaleString("en-IN")}`;
    };

    const formatPaymentMethod = (method) => {
        if (!method) return "—";
        return method.charAt(0).toUpperCase() + method.slice(1);
    };

    const filteredInvoices = invoices.filter((invoice) => {
        const patientName =
            invoice.patientId?.userId?.name ||
            invoice.patientId?.name ||
            "";
        const serviceName = invoice.serviceId?.name || "";

        const matchesSearch =
            patientName.toLowerCase().includes(search.toLowerCase()) ||
            serviceName.toLowerCase().includes(search.toLowerCase());

        const matchesStatus =
            statusFilter === "all" || invoice.paymentStatus === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const totalInvoices = invoices.length;
    const pendingCount = invoices.filter(
        (i) => i.paymentStatus === "pending"
    ).length;
    const paidCount = invoices.filter(
        (i) => i.paymentStatus === "paid"
    ).length;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
                <p className="mt-1 text-sm text-gray-500">
                    View all patient invoices and billing information
                </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                            <Receipt size={22} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Invoices</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {totalInvoices}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                            <Clock3 size={22} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Pending</p>
                            <p className="text-2xl font-bold text-gray-900">{pendingCount}</p>
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                            <CheckCircle2 size={22} />
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Paid</p>
                            <p className="text-2xl font-bold text-gray-900">{paidCount}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="rounded-2xl bg-white p-5 shadow-sm">
                <div className="flex flex-col gap-4 md:flex-row md:items-center">
                    {/* Search */}
                    <div className="relative flex-1">
                        <Search
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        />
                        <input
                            type="text"
                            placeholder="Search by patient name or service..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex flex-wrap gap-2">
                        {STATUS_FILTERS.map((status) => (
                            <button
                                key={status}
                                type="button"
                                onClick={() => setStatusFilter(status)}
                                className={`rounded-lg px-3 py-2 text-xs font-semibold capitalize transition ${statusFilter === status
                                        ? "bg-blue-600 text-white shadow-sm"
                                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                                    }`}
                            >
                                {status}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center rounded-2xl bg-white py-16 shadow-sm">
                    <div className="flex items-center gap-3 text-gray-500">
                        <Loader2 size={22} className="animate-spin" />
                        <span className="text-sm">Loading invoices...</span>
                    </div>
                </div>
            )}

            {/* Error */}
            {!loading && error && (
                <div className="rounded-2xl bg-red-50 p-5 text-red-700">
                    <div className="flex items-start gap-3">
                        <AlertCircle size={20} className="mt-0.5 shrink-0" />
                        <div>
                            <p className="font-semibold">Unable to load invoices</p>
                            <p className="mt-1 text-sm">{error}</p>
                            <button
                                type="button"
                                onClick={fetchInvoices}
                                className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Empty */}
            {!loading && !error && filteredInvoices.length === 0 && (
                <div className="rounded-2xl bg-white px-6 py-16 text-center shadow-sm">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                        <Receipt size={26} />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold text-gray-900">
                        No invoices found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                        {search || statusFilter !== "all"
                            ? "Try adjusting your search or filter."
                            : "No invoices have been generated yet."}
                    </p>
                </div>
            )}

            {/* Invoices List */}
            {!loading && !error && filteredInvoices.length > 0 && (
                <div className="space-y-4">
                    {filteredInvoices.map((invoice) => {
                        const patient = invoice.patientId;
                        const appointment = invoice.appointmentId;
                        const service = invoice.serviceId;

                        return (
                            <div
                                key={invoice._id}
                                className="rounded-2xl bg-white p-5 shadow-sm transition hover:shadow-md"
                            >
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex-1 space-y-3">
                                        {/* Status + Invoice ID */}
                                        <div className="flex flex-wrap items-center gap-2">
                                            <span
                                                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${paymentStatusBadge[invoice.paymentStatus] ||
                                                    "bg-gray-100 text-gray-600"
                                                    }`}
                                            >
                                                {paymentStatusIcon[invoice.paymentStatus]}
                                                {invoice.paymentStatus}
                                            </span>

                                            <span className="text-xs text-gray-400">
                                                Invoice #{invoice._id.slice(-8).toUpperCase()}
                                            </span>
                                        </div>

                                        {/* Details */}
                                        <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <User2 size={15} className="shrink-0 text-gray-400" />
                                                <span className="font-medium text-gray-800">
                                                    {patient?.userId?.name || "Unknown Patient"}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2 text-gray-600">
                                                <ClipboardList
                                                    size={15}
                                                    className="shrink-0 text-gray-400"
                                                />
                                                <span>{service?.name || "N/A"}</span>
                                            </div>

                                            {appointment && (
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <CalendarDays
                                                        size={15}
                                                        className="shrink-0 text-gray-400"
                                                    />
                                                    <span>
                                                        {formatDate(appointment.appointmentDate)}
                                                        {appointment.startTime &&
                                                            ` · ${formatTime(appointment.startTime)}`}
                                                    </span>
                                                </div>
                                            )}

                                            {invoice.paymentMethod && (
                                                <div className="flex items-center gap-2 text-gray-600">
                                                    <CreditCard
                                                        size={15}
                                                        className="shrink-0 text-gray-400"
                                                    />
                                                    <span>
                                                        {formatPaymentMethod(invoice.paymentMethod)}
                                                    </span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Paid date */}
                                        {invoice.paidAt && (
                                            <p className="text-xs text-gray-400">
                                                Paid on {formatDate(invoice.paidAt)}
                                            </p>
                                        )}
                                    </div>

                                    {/* Amount */}
                                    <div className="shrink-0 text-right">
                                        <p className="text-xs text-gray-400">Amount</p>
                                        <p className="text-xl font-bold text-gray-900">
                                            {formatCurrency(invoice.amount)}
                                        </p>
                                        {appointment?.status && (
                                            <span className="mt-1 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs capitalize text-gray-500">
                                                Appt: {appointment.status}
                                            </span>
                                        )}
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

export default ReceptionistInvoices;
