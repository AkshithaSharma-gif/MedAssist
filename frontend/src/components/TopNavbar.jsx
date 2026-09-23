
import { Bell, Menu, UserCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

function TopNavbar({ role, setMobileOpen }) {
  const navigate = useNavigate();

  const notificationPath = `/${role}/notifications`;
  const profilePath = `/${role}/profile`;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between bg-white px-4 shadow-[0_3px_14px_rgba(15,23,42,0.06)] sm:px-6">
      <button
        onClick={() => setMobileOpen(true)}
        className="rounded-lg p-2 text-gray-600 transition hover:bg-gray-100 lg:hidden"
      >
        <Menu size={22} />
      </button>

      <div className="hidden lg:block">
        <h2 className="text-lg font-semibold capitalize text-gray-800">
          {role} Portal
        </h2>
      </div>

      <div className="ml-auto flex items-center gap-2">
        <button
          onClick={() => navigate(notificationPath)}
          className="relative rounded-lg p-2 text-gray-600 transition hover:bg-gray-100"
          title="Notifications"
        >
          <Bell size={21} />
        </button>

        <button
          onClick={() => navigate(profilePath)}
          className="flex items-center gap-2 rounded-lg px-2 py-2 text-gray-600 transition hover:bg-gray-100"
        >
          <UserCircle size={22} />

          <span className="hidden text-sm font-medium capitalize sm:block">
            {role}
          </span>
        </button>
      </div>
    </header>
  );
}

export default TopNavbar;

