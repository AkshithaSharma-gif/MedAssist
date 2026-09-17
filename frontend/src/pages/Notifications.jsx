import { useEffect, useState } from "react";
import {
  Bell,
  CheckCircle2,
  Check,
  CalendarDays,
  FileText,
  CreditCard,
  Info,
  AlertCircle,
  Loader2,
  BellRing,
} from "lucide-react";
import api from "../services/api";

function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    try {
      setError("");

      const response = await api.get("/notifications");

      setNotifications(
        response.data.notifications || []
      );

      setUnreadCount(response.data.unreadCount || 0);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.message ||
          "Failed to load notifications"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);

      await fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");

      await fetchNotifications();
    } catch (err) {
      console.error(err);
    }
  };

  const formatDateTime = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const getNotificationIcon = (notification) => {
    const text = `${notification.title || ""} ${
      notification.message || ""
    }`.toLowerCase();

    if (
      text.includes("appointment") ||
      text.includes("booking") ||
      text.includes("scheduled")
    ) {
      return {
        icon: <CalendarDays size={20} />,
        container:
          "bg-blue-50 text-blue-600",
      };
    }

    if (
      text.includes("invoice") ||
      text.includes("payment") ||
      text.includes("bill")
    ) {
      return {
        icon: <CreditCard size={20} />,
        container:
          "bg-emerald-50 text-emerald-600",
      };
    }

    if (
      text.includes("medical") ||
      text.includes("record") ||
      text.includes("prescription")
    ) {
      return {
        icon: <FileText size={20} />,
        container:
          "bg-violet-50 text-violet-600",
      };
    }

    if (
      text.includes("alert") ||
      text.includes("cancel")
    ) {
      return {
        icon: <AlertCircle size={20} />,
        container:
          "bg-amber-50 text-amber-600",
      };
    }

    return {
      icon: <Info size={20} />,
      container:
        "bg-cyan-50 text-cyan-600",
    };
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-80px)] bg-slate-50 p-4 sm:p-6 lg:p-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex min-h-[400px] items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="flex flex-col items-center gap-3 text-slate-500">
              <Loader2
                size={32}
                className="animate-spin text-blue-600"
              />

              <p className="text-sm font-medium">
                Loading your notifications...
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
        <div className="mx-auto max-w-5xl">
          <div className="rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                <AlertCircle size={22} />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Unable to load notifications
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {error}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setLoading(true);
                    fetchNotifications();
                  }}
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

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-50 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-5xl">

        {/* Page Header */}
        <div className="mb-6 overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white shadow-lg sm:p-8">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur-sm">
                <BellRing size={25} />
              </div>

              <h1 className="text-2xl font-bold sm:text-3xl">
                Notifications
              </h1>

              <p className="mt-2 max-w-2xl text-sm leading-6 text-blue-50 sm:text-base">
                Stay updated with your appointments,
                healthcare records, billing, and important
                account activity.
              </p>
            </div>

            <div className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3 backdrop-blur-sm">
              <Bell size={20} />

              <div>
                <p className="text-xs text-blue-100">
                  Unread Notifications
                </p>

                <p className="text-xl font-bold">
                  {unreadCount}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Notification Controls */}
        {notifications.length > 0 && (
          <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between sm:p-5">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Bell size={19} />
              </div>

              <div>
                <p className="text-sm font-semibold text-slate-700">
                  Notification Center
                </p>

                <p className="text-xs text-slate-400">
                  {notifications.length}{" "}
                  {notifications.length === 1
                    ? "notification"
                    : "notifications"}{" "}
                  in total
                </p>
              </div>
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <Check size={17} />
                Mark All as Read
              </button>
            )}
          </div>
        )}

        {/* Empty State */}
        {notifications.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-14 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
              <Bell size={30} />
            </div>

            <h2 className="mt-5 text-xl font-bold text-slate-800">
              No notifications
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              You're all caught up. New updates about your
              appointments and healthcare activity will appear
              here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const notificationIcon =
                getNotificationIcon(notification);

              return (
                <div
                  key={notification._id}
                  className={`relative overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:shadow-md ${
                    notification.isRead
                      ? "border-slate-200"
                      : "border-blue-200 bg-blue-50/20"
                  }`}
                >
                  {/* Unread Indicator */}
                  {!notification.isRead && (
                    <div className="absolute left-0 top-0 h-full w-1 bg-blue-600" />
                  )}

                  <div className="p-5 sm:p-6">
                    <div className="flex items-start gap-4">

                      {/* Icon */}
                      <div
                        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${notificationIcon.container}`}
                      >
                        {notificationIcon.icon}
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <h2
                                className={`text-sm font-bold sm:text-base ${
                                  notification.isRead
                                    ? "text-slate-700"
                                    : "text-slate-800"
                                }`}
                              >
                                {notification.title ||
                                  "Notification"}
                              </h2>

                              {!notification.isRead && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                                  <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                                  New
                                </span>
                              )}
                            </div>
                          </div>

                          <span className="shrink-0 text-xs text-slate-400">
                            {formatDateTime(
                              notification.createdAt
                            )}
                          </span>
                        </div>

                        <p className="mt-2 text-sm leading-6 text-slate-600">
                          {notification.message}
                        </p>

                        {/* Mark Read */}
                        {!notification.isRead && (
                          <button
                            type="button"
                            onClick={() =>
                              markAsRead(
                                notification._id
                              )
                            }
                            className="mt-4 inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-xs font-semibold text-blue-600 transition hover:bg-blue-50"
                          >
                            <Check size={15} />
                            Mark as Read
                          </button>
                        )}

                        {/* Read State */}
                        {notification.isRead && (
                          <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                            <CheckCircle2 size={14} />
                            Read
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
    </div>
  );
}

export default Notifications;

