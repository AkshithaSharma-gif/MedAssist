import { useState, useEffect } from "react";
import {
    UserRound,
    Mail,
    Phone,
    ShieldCheck,
    Loader2,
    AlertCircle,
} from "lucide-react";

function ReceptionistProfile() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        try {
            // Read user info from JWT token stored in localStorage
            const token = localStorage.getItem("medassist_token");

            if (!token) {
                setError("No authentication token found. Please log in again.");
                setLoading(false);
                return;
            }

            // Decode JWT payload (base64url decode)
            const parts = token.split(".");
            if (parts.length !== 3) {
                setError("Invalid token format.");
                setLoading(false);
                return;
            }

            const payloadBase64 = parts[1]
                .replace(/-/g, "+")
                .replace(/_/g, "/");

            const padding =
                payloadBase64.length % 4 === 0
                    ? ""
                    : "=".repeat(4 - (payloadBase64.length % 4));

            const payloadJson = atob(payloadBase64 + padding);
            const payload = JSON.parse(payloadJson);

            setUser({
                name: payload.name || "Receptionist",
                email: payload.email || "",
                phone: payload.phone || "",
                role: payload.role || "receptionist",
            });
        } catch (err) {
            console.error("Error reading token:", err);
            setError("Unable to load profile information from session.");
        } finally {
            setLoading(false);
        }
    }, []);

    if (loading) {
        return (
            <div className="min-h-[calc(100vh-80px)] bg-slate-50 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto flex min-h-[400px] max-w-3xl items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex flex-col items-center gap-3 text-slate-500">
                        <Loader2 size={32} className="animate-spin text-blue-600" />
                        <p className="text-sm font-medium">Loading profile...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-[calc(100vh-80px)] bg-slate-50 p-4 sm:p-6 lg:p-8">
                <div className="mx-auto max-w-3xl">
                    <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
                        <div className="flex items-start gap-4">
                            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                                <AlertCircle size={22} />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-slate-800">
                                    Unable to load profile
                                </h2>
                                <p className="mt-1 text-sm text-slate-500">{error}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-80px)] bg-slate-50 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-3xl space-y-5">
                {/* Header Banner */}
                <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white shadow-lg sm:p-8">
                    <div className="flex items-center gap-4">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 backdrop-blur-sm">
                            <UserRound size={32} />
                        </div>

                        <div>
                            <p className="text-sm font-medium text-blue-100">
                                Receptionist Profile
                            </p>

                            <h1 className="mt-1 text-2xl font-bold sm:text-3xl">
                                {user?.name || "Receptionist"}
                            </h1>

                            <p className="mt-1 text-sm text-blue-50">
                                Front desk & appointment management
                            </p>
                        </div>
                    </div>
                </div>

                {/* Account Information */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                                <UserRound size={19} />
                            </div>
                            <div>
                                <h2 className="font-bold text-slate-800">Account Information</h2>
                                <p className="text-xs text-slate-400">
                                    Your login and contact details
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
                                <UserRound size={17} className="text-slate-400" />
                                <span className="text-sm font-medium text-slate-700">
                                    {user?.name || "Not provided"}
                                </span>
                            </div>
                        </div>

                        {/* Role */}
                        <div>
                            <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                Role
                            </label>
                            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                <ShieldCheck size={17} className="text-slate-400" />
                                <span className="text-sm font-medium capitalize text-slate-700">
                                    {user?.role || "receptionist"}
                                </span>
                            </div>
                        </div>

                        {/* Email */}
                        {user?.email && (
                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Email
                                </label>
                                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                    <Mail size={17} className="text-slate-400" />
                                    <span className="truncate text-sm font-medium text-slate-700">
                                        {user.email}
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Phone */}
                        {user?.phone && (
                            <div>
                                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                                    Phone
                                </label>
                                <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                                    <Phone size={17} className="text-slate-400" />
                                    <span className="text-sm font-medium text-slate-700">
                                        {user.phone}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </section>

                {/* Role Permissions Info */}
                <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="border-b border-slate-100 px-5 py-5 sm:px-6">
                        <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                                <ShieldCheck size={19} />
                            </div>
                            <div>
                                <h2 className="font-bold text-slate-800">Permissions</h2>
                                <p className="text-xs text-slate-400">
                                    Your access level in MedAssist
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="p-5 sm:p-6">
                        <ul className="space-y-2 text-sm text-slate-600">
                            {[
                                "View and register patients",
                                "Schedule and manage appointments",
                                "Confirm and cancel appointments",
                                "View invoices and billing information",
                                "Receive system notifications",
                            ].map((permission) => (
                                <li key={permission} className="flex items-center gap-2">
                                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                                        <svg
                                            width="10"
                                            height="10"
                                            viewBox="0 0 10 10"
                                            fill="none"
                                        >
                                            <path
                                                d="M2 5l2 2 4-4"
                                                stroke="currentColor"
                                                strokeWidth="1.5"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </span>
                                    {permission}
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>
            </div>
        </div>
    );
}

export default ReceptionistProfile;
