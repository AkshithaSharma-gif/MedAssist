import { useEffect, useState } from "react";
import {
  ReceiptText,
  IndianRupee,
  CalendarDays,
  CreditCard,
  CheckCircle2,
  Clock3,
  AlertCircle,
  Loader2,
  FileText,
  Link2,
} from "lucide-react";
import api from "../services/api";

function MyInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const response = await api.get(
          "/invoices/my-invoices"
        );

        setInvoices(response.data.invoices || []);
      } catch (err) {
        console.error(err);

        setError(
          err.response?.data?.message ||
            "Failed to load invoices"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  const formatDateTime = (date) => {
    if (!date) return "Not paid";

    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatAmount = (amount) => {
    return Number(amount || 0).toLocaleString("en-IN");
  };

  const getStatusStyles = (status) => {
    const normalizedStatus =
      String(status || "").toLowerCase();

    if (
      normalizedStatus === "paid" ||
      normalizedStatus === "completed"
    ) {
      return {
        container:
          "border-emerald-200 bg-emerald-50 text-emerald-700",
        icon: <CheckCircle2 size={15} />,
        label: "Paid",
      };
    }

    if (
      normalizedStatus === "overdue" ||
      normalizedStatus === "failed"
    ) {
      return {
        container:
          "border-red-200 bg-red-50 text-red-600",
        icon: <AlertCircle size={15} />,
        label:
          normalizedStatus === "failed"
            ? "Payment Failed"
            : "Overdue",
      };
    }

    return {
      container:
        "border-amber-200 bg-amber-50 text-amber-700",
      icon: <Clock3 size={15} />,
      label:
        status
          ? String(status)
              .charAt(0)
              .toUpperCase() +
            String(status).slice(1)
          : "Pending",
    };
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <Loader2
                size={32}
                className="animate-spin text-blue-600"
              />

              <p className="text-sm font-medium">
                Loading your invoices...
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <AlertCircle size={22} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Unable to load invoices
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => window.location.reload()}
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

  const totalAmount = invoices.reduce(
    (total, invoice) =>
      total + Number(invoice.amount || 0),
    0
  );

  const paidInvoices = invoices.filter((invoice) =>
    ["paid", "completed"].includes(
      String(invoice.paymentStatus || "").toLowerCase()
    )
  );

  const pendingInvoices = invoices.filter(
    (invoice) =>
      !["paid", "completed"].includes(
        String(invoice.paymentStatus || "").toLowerCase()
      )
  );

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">

        {/* Page Header */}
        <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                <ReceiptText size={25} />
              </div>

              <h1 className="text-2xl font-bold sm:text-3xl">
                My Invoices
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-50 sm:text-base">
                View your healthcare invoices, payment
                status, and billing details securely.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
              <ReceiptText size={20} />

              <div>
                <p className="text-xs text-blue-100">
                  Total Invoices
                </p>

                <p className="text-xl font-bold">
                  {invoices.length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {invoices.length > 0 && (
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Total Amount
                  </p>

                  <p className="mt-2 text-2xl font-bold text-slate-800">
                    ₹{formatAmount(totalAmount)}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                  <IndianRupee size={21} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Paid
                  </p>

                  <p className="mt-2 text-2xl font-bold text-emerald-600">
                    {paidInvoices.length}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 size={21} />
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Pending
                  </p>

                  <p className="mt-2 text-2xl font-bold text-amber-600">
                    {pendingInvoices.length}
                  </p>
                </div>

                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                  <Clock3 size={21} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {invoices.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <ReceiptText size={30} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-800">
              No invoices found
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Your healthcare invoices will appear here once
              billing information is generated.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {invoices.map((invoice, index) => {
              const status = getStatusStyles(
                invoice.paymentStatus
              );

              return (
                <div
                  key={invoice._id}
                  className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md"
                >
                  {/* Invoice Header */}
                  <div className="flex flex-col gap-4 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                        <ReceiptText size={23} />
                      </div>

                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                          Invoice #{index + 1}
                        </p>

                        <h2 className="mt-0.5 text-lg font-bold text-slate-800">
                          {invoice.serviceId?.name ||
                            "Healthcare Service"}
                        </h2>
                      </div>
                    </div>

                    <div
                      className={`inline-flex w-fit items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold ${status.container}`}
                    >
                      {status.icon}
                      {status.label}
                    </div>
                  </div>

                  {/* Invoice Body */}
                  <div className="p-5 sm:p-6">

                    {/* Amount */}
                    <div className="mb-5 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 p-5">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-xs font-semibold uppercase tracking-wide text-blue-500">
                            Invoice Amount
                          </p>

                          <div className="mt-1 flex items-center gap-1">
                            <IndianRupee
                              size={22}
                              className="text-blue-600"
                            />

                            <span className="text-2xl font-bold text-slate-800">
                              {formatAmount(
                                invoice.amount
                              )}
                            </span>
                          </div>
                        </div>

                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white text-blue-600 shadow-sm">
                          <CreditCard size={22} />
                        </div>
                      </div>
                    </div>

                    {/* Details */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

                      {/* Service */}
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex items-center gap-2 text-slate-400">
                          <FileText size={17} />

                          <span className="text-xs font-semibold uppercase tracking-wide">
                            Service
                          </span>
                        </div>

                        <p className="mt-2 text-sm font-semibold text-slate-700">
                          {invoice.serviceId?.name ||
                            "N/A"}
                        </p>
                      </div>

                      {/* Payment Method */}
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex items-center gap-2 text-slate-400">
                          <CreditCard size={17} />

                          <span className="text-xs font-semibold uppercase tracking-wide">
                            Payment Method
                          </span>
                        </div>

                        <p className="mt-2 text-sm font-semibold capitalize text-slate-700">
                          {invoice.paymentMethod ||
                            "Not paid"}
                        </p>
                      </div>

                      {/* Created */}
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex items-center gap-2 text-slate-400">
                          <CalendarDays size={17} />

                          <span className="text-xs font-semibold uppercase tracking-wide">
                            Created
                          </span>
                        </div>

                        <p className="mt-2 text-sm font-semibold text-slate-700">
                          {formatDate(invoice.createdAt)}
                        </p>
                      </div>

                      {/* Appointment */}
                      <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Link2 size={17} />

                          <span className="text-xs font-semibold uppercase tracking-wide">
                            Appointment
                          </span>
                        </div>

                        <p className="mt-2 text-sm font-semibold text-slate-700">
                          {invoice.appointmentId
                            ? "Linked"
                            : "N/A"}
                        </p>
                      </div>
                    </div>

                    {/* Payment Information */}
                    <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
                      <div className="flex items-center gap-2">
                        <CheckCircle2
                          size={18}
                          className={
                            invoice.paidAt
                              ? "text-emerald-600"
                              : "text-slate-400"
                          }
                        />

                        <h3 className="text-sm font-semibold text-slate-700">
                          Payment Information
                        </h3>
                      </div>

                      <div className="mt-4 grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-xs font-medium text-slate-400">
                            Payment Status
                          </p>

                          <p className="mt-1 text-sm font-semibold capitalize text-slate-700">
                            {invoice.paymentStatus ||
                              "Pending"}
                          </p>
                        </div>

                        <div>
                          <p className="text-xs font-medium text-slate-400">
                            Paid At
                          </p>

                          <p className="mt-1 text-sm font-semibold text-slate-700">
                            {formatDateTime(
                              invoice.paidAt
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default MyInvoices;
