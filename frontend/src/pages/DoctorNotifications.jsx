
import { useEffect, useState } from "react";
import {
  Bell,
  Check,
  CheckCheck,
  CalendarDays,
  FileText,
  AlertCircle,
  Clock,
  Info,
} from "lucide-react";
import api from "../services/api";

function DoctorNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await api.get("/notifications");

      setNotifications(response.data.notifications || []);
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

  const markAsRead = async (id) => {
    try {
      await api.put(`/notifications/${id}/read`);

      setNotifications((prev) =>
        prev.map((notification) =>
          notification._id === id
            ? {
                ...notification,
                isRead: true,
              }
            : notification
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all");

      setNotifications((prev) =>
        prev.map((notification) => ({
          ...notification,
          isRead: true,
        }))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getNotificationIcon = (notification) => {
    const type = notification.type?.toLowerCase() || "";

    if (type.includes("appointment")) {
      return <CalendarDays size={21} />;
    }

    if (type.includes("record") || type.includes("medical")) {
      return <FileText size={21} />;
    }

    if (type.includes("reminder")) {
      return <Clock size={21} />;
    }

    if (type.includes("alert")) {
      return <AlertCircle size={21} />;
    }

    return <Info size={21} />;
  };

  const getIconClasses = (notification) => {
    const type = notification.type?.toLowerCase() || "";

    if (type.includes("appointment")) {
      return "bg-blue-50 text-blue-600";
    }

    if (type.includes("record") || type.includes("medical")) {
      return "bg-green-50 text-green-600";
    }

    if (type.includes("reminder")) {
      return "bg-amber-50 text-amber-600";
    }

    if (type.includes("alert")) {
      return "bg-red-50 text-red-600";
    }

    return "bg-cyan-50 text-cyan-600";
  };

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-100 border-t-blue-600" />

          <p className="text-sm font-medium text-gray-500">
            Loading notifications...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-100 bg-red-50 p-6">
        <div className="flex items-start gap-3">
          <AlertCircle
            size={22}
            className="mt-0.5 text-red-600"
          />

          <div>
            <h2 className="font-semibold text-red-700">
              Unable to load notifications
            </h2>

            <p className="mt-1 text-sm text-red-600">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-white shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-white/20">
              <Bell size={25} />

              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold">
                  {unreadCount}
                </span>
              )}
            </div>

            <div>
              <h1 className="text-2xl font-bold">
                Notifications
              </h1>

              <p className="mt-1 text-sm text-blue-50">
                Stay updated with your appointments and
                activities.
              </p>
            </div>
          </div>

          <div className="rounded-xl bg-white/15 px-4 py-2 text-center">
            <p className="text-2xl font-bold">
              {unreadCount}
            </p>

            <p className="text-xs text-blue-50">
              Unread
            </p>
          </div>
        </div>
      </div>

      {/* Actions */}
      {notifications.length > 0 && (
        <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
          <div>
            <p className="text-sm font-semibold text-gray-900">
              Notification Center
            </p>

            <p className="mt-1 text-xs text-gray-500">
              {notifications.length} notification
              {notifications.length !== 1 ? "s" : ""} total
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <CheckCheck size={17} />
              Mark All as Read
            </button>
          )}
        </div>
      )}

      {/* Notifications */}
      {notifications.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 bg-white p-10 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-50 text-blue-600">
            <Bell size={27} />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-gray-900">
            No notifications
          </h2>

          <p className="mt-1 text-sm text-gray-500">
            You're all caught up. New notifications will appear
            here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <div
              key={notification._id}
              className={`rounded-2xl border bg-white p-5 shadow-sm transition hover:shadow-md ${
                notification.isRead
                  ? "border-gray-100"
                  : "border-blue-100 bg-blue-50/20"
              }`}
            >
              <div className="flex gap-4">
                {/* Icon */}
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${getIconClasses(
                    notification
                  )}`}
                >
                  {getNotificationIcon(notification)}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-semibold text-gray-900">
                          {notification.title ||
                            "Notification"}
                        </h3>

                        {!notification.isRead && (
                          <span className="rounded-full bg-blue-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-blue-700">
                            New
                          </span>
                        )}
                      </div>

                      <p className="mt-2 text-sm leading-6 text-gray-600">
                        {notification.message ||
                          "You have a new notification."}
                      </p>
                    </div>

                    {!notification.isRead && (
                      <button
                        onClick={() =>
                          markAsRead(notification._id)
                        }
                        className="flex shrink-0 items-center justify-center gap-2 rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-700 transition hover:bg-blue-100"
                      >
                        <Check size={15} />
                        Mark as Read
                      </button>
                    )}
                  </div>

                  {/* Date */}
                  <div className="mt-4 flex items-center gap-2 border-t border-gray-100 pt-3 text-xs text-gray-400">
                    <CalendarDays size={14} />

                    <span>
                      {formatDate(notification.createdAt)}
                    </span>

                    {notification.createdAt && (
                      <>
                        <span>•</span>

                        <span>
                          {formatTime(notification.createdAt)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DoctorNotifications;

