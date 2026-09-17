import {
  LayoutDashboard,
  CalendarDays,
  FileText,
  Receipt,
  Bell,
  Users,
  Stethoscope,
  Building2,
  ClipboardList,
  LogOut,
  UserCircle,
  X,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";

function Sidebar({ role, mobileOpen, setMobileOpen }) {
  const navigate = useNavigate();

  const patientLinks = [
    {
      name: "Dashboard",
      path: "/patient",
      icon: LayoutDashboard,
    },
    {
      name: "Appointments",
      path: "/patient/appointments",
      icon: CalendarDays,
    },
    {
      name: "My Appointments",
      path: "/patient/my-appointments",
      icon: CalendarDays,
    },
    {
      name: "Medical Records",
      path: "/patient/records",
      icon: FileText,
    },
    {
      name: "Invoices",
      path: "/patient/invoices",
      icon: Receipt,
    },
    {
      name: "Notifications",
      path: "/patient/notifications",
      icon: Bell,
    },
  ];

  const doctorLinks = [
    {
      name: "Dashboard",
      path: "/doctor",
      icon: LayoutDashboard,
    },
    {
      name: "Appointments",
      path: "/doctor/appointments",
      icon: CalendarDays,
    },
    {
      name: "Patients",
      path: "/doctor/patients",
      icon: Users,
    },
    {
      name: "Medical Records",
      path: "/doctor/records",
      icon: FileText,
    },
    {
      name: "Notifications",
      path: "/doctor/notifications",
      icon: Bell,
    },
  ];

  const adminLinks = [
    {
      name: "Dashboard",
      path: "/admin",
      icon: LayoutDashboard,
    },
    {
      name: "Departments",
      path: "/admin/departments",
      icon: Building2,
    },
    {
      name: "Doctors",
      path: "/admin/doctors",
      icon: Stethoscope,
    },
    {
      name: "Patients",
      path: "/admin/patients",
      icon: Users,
    },
    {
      name: "Services",
      path: "/admin/services",
      icon: ClipboardList,
    },
    {
      name: "Appointments",
      path: "/admin/appointments",
      icon: CalendarDays,
    },
    {
      name: "Invoices",
      path: "/admin/invoices",
      icon: Receipt,
    },
    {
      name: "Notifications",
      path: "/admin/notifications",
      icon: Bell,
    },
  ];

  const links =
    role === "patient"
      ? patientLinks
      : role === "doctor"
      ? doctorLinks
      : adminLinks;

  const handleLogout = () => {
    localStorage.removeItem("medassist_token");
    localStorage.removeItem("medassist_role");

    navigate("/login");
  };

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={`fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r bg-white transition-transform duration-300 lg:translate-x-0 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b px-5">
          <div
            className="flex cursor-pointer items-center gap-2"
            onClick={() => navigate(`/${role}`)}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-lg font-bold text-white">
              M
            </div>

            <div>
              <h1 className="text-lg font-bold text-gray-900">
                MedAssist
              </h1>
              <p className="text-xs capitalize text-gray-500">
                {role} Portal
              </p>
            </div>
          </div>

          <button
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-4">
          {links.map((link) => {
            const Icon = link.icon;

            return (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.path === `/${role}`}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-600 text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`
                }
              >
                <Icon size={19} />
                <span>{link.name}</span>
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t p-4">
          <button
            onClick={() => navigate(`/${role}/profile`)}
            className="mb-2 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            <UserCircle size={19} />
            Profile
          </button>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50"
          >
            <LogOut size={19} />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;