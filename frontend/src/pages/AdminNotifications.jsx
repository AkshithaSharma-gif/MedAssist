import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Search,
  RefreshCw,
  CheckCircle2,
  Circle,
  CalendarDays,
  FileText,
  Receipt,
  Info,
} from "lucide-react";
import api from "../services/api";

function AdminNotifications() {
  const [notifications, setNotifications] = useState([]);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);
  const [markingAll, setMarkingAll] = useState(false);
  const [error, setError] = useState("");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/notifications");

      setNotifications(response.data.notifications || []);
    } catch (err) {
      console.error("Fetch notifications error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to load notifications. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filteredNotifications = useMemo(() => {
    const query = search.toLowerCase().trim();

    return notifications.filter((notification) => {
      const title = notification.title || "";
      const message = notification.message || "";
      const type = notification.type || "";

      const matchesSearch =
        !query ||
        title.toLowerCase().includes(query) ||
        message.toLowerCase().includes(query) ||
        type.toLowerCase().includes(query);

      const matchesFilter =
        filter === "all" ||
        (filter === "unread" && !notification.isRead) ||
        (filter === "read" && notification.isRead);

      return matchesSearch && matchesFilter;
    });
  }, [notifications, search, filter]);

  const unreadCount = notifications.filter(
    (notification) => !notification.isRead
  ).length;

  const readCount = notifications.filter(
    (notification) => notification.isRead
  ).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case "appointment":
        return <CalendarDays size={21} />;

      case "medical_record":
        return <FileText size={21} />;

      case "invoice":
        return <Receipt size={21} />;

      default:
        return <Info size={21} />;
    }
  };

  const getNotificationStyle = (type) => {
    switch (type) {
      case "appointment":
        return "bg-blue-50 text-blue-600";

      case "medical_record":
        return "bg-purple-50 text-purple-600";

      case "invoice":
        return "bg-emerald-50 text-emerald-600";

      default:
        return "bg-slate-100 text-slate-600";
    }
  };

  const formatDate = (date) => {
    if (!date) return "Unknown date";

    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  const handleMarkRead = async (notification) => {
    if (notification.isRead) return;

    try {
      setUpdatingId(notification._id);
      setError("");

      await api.put(
        `/notifications/${notification._id}/read`
      );

      setNotifications((prev) =>
        prev.map((item) =>
          item._id === notification._id
            ? { ...item, isRead: true }
            : item
        )
      );
    } catch (err) {
      console.error("Mark notification read error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to mark notification as read."
      );
    } finally {
      setUpdatingId(null);
    }
  };

  const handleMarkAllRead = async () => {
    if (unreadCount === 0) return;

    try {
      setMarkingAll(true);
      setError("");

      await api.put("/notifications/read-all");

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          isRead: true,
        }))
      );
    } catch (err) {
      console.error("Mark all notifications read error:", err);

      setError(
        err.response?.data?.message ||
          "Failed to mark all notifications as read."
      );
    } finally {
      setMarkingAll(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-600">
            <Bell size={17} />
            Notification Center
          </div>

          <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Notifications
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Stay updated with important system activity.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={fetchNotifications}
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
            onClick={handleMarkAllRead}
            disabled={markingAll || unreadCount === 0}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {markingAll ? (
              <RefreshCw
                size={17}
                className="animate-spin"
              />
            ) : (
              <CheckCircle2 size={17} />
            )}
            Mark All Read
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 p-5 text-white shadow-sm">
          <p className="text-sm text-blue-100">
            Total Notifications
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            {notifications.length}
          </h2>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Unread
          </p>

          <h2 className="mt-2 text-3xl font-bold text-blue-600">
            {unreadCount}
          </h2>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">
            Read
          </p>

          <h2 className="mt-2 text-3xl font-bold text-emerald-600">
            {readCount}
          </h2>
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
              placeholder="Search notifications..."
              className="w-full rounded-xl bg-slate-50 py-3 pl-11 pr-4 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-700 outline-none focus:bg-white focus:ring-2 focus:ring-blue-100"
          >
            <option value="all">All Notifications</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex min-h-[300px] items-center justify-center rounded-2xl bg-white shadow-sm">
          <div className="text-center">
            <RefreshCw
              size={30}
              className="mx-auto animate-spin text-blue-600"
            />

            <p className="mt-3 text-sm text-slate-500">
              Loading notifications...
            </p>
          </div>
        </div>
      ) : filteredNotifications.length === 0 ? (
        <div className="rounded-2xl bg-white px-6 py-14 text-center shadow-sm">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
            <Bell size={26} />
          </div>

          <h3 className="mt-4 text-lg font-semibold text-slate-800">
            No notifications found
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Try changing your search or filter.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-700">
              {filteredNotifications.length}
            </span>{" "}
            notification
            {filteredNotifications.length !== 1
              ? "s"
              : ""}
          </p>

          {filteredNotifications.map((notification) => {
            const isUpdating =
              updatingId === notification._id;

            return (
              <div
                key={notification._id}
                className={`rounded-2xl p-5 shadow-sm transition hover:shadow-md ${
                  notification.isRead
                    ? "bg-white"
                    : "bg-blue-50/50 ring-1 ring-blue-100"
                }`}
              >
                <div className="flex gap-4">
                  {/* Icon */}
                  <div
                    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${getNotificationStyle(
                      notification.type
                    )}`}
                  >
                    {getNotificationIcon(
                      notification.type
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3
                            className={`font-semibold ${
                              notification.isRead
                                ? "text-slate-800"
                                : "text-slate-900"
                            }`}
                          >
                            {notification.title ||
                              "Notification"}
                          </h3>

                          {!notification.isRead && (
                            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-600">
                              New
                            </span>
                          )}
                        </div>

                        <p className="mt-1 text-xs capitalize text-slate-400">
                          {notification.type ||
                            "general"}
                        </p>
                      </div>

                      <div className="shrink-0 text-left text-xs text-slate-400 sm:text-right">
                        <p>
                          {formatDate(
                            notification.createdAt
                          )}
                        </p>

                        <p>
                          {formatTime(
                            notification.createdAt
                          )}
                        </p>
                      </div>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-slate-600">
                      {notification.message ||
                        "No message available."}
                    </p>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        {notification.isRead ? (
                          <>
                            <CheckCircle2 size={15} />
                            Read
                          </>
                        ) : (
                          <>
                            <Circle size={15} />
                            Unread
                          </>
                        )}
                      </div>

                      {!notification.isRead && (
                        <button
                          onClick={() =>
                            handleMarkRead(
                              notification
                            )
                          }
                          disabled={isUpdating}
                          className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isUpdating && (
                            <RefreshCw
                              size={14}
                              className="animate-spin"
                            />
                          )}
                          Mark as Read
                        </button>
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

export default AdminNotifications;