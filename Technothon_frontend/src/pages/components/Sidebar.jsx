import React, { useEffect, useState } from "react";
import {
  LayoutDashboard,
  Users,
  Calendar,
  Briefcase,
  LogOut,
  X,
  UserPlus,
  UserCheck,
  UsersRound
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { adminApi } from "./adminApi";

const NavItem = ({ icon, label, active, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-300 ${
      active
        ? "bg-purple-600/20 text-white border-l-4 border-purple-500"
        : "text-white/60 hover:bg-white/5 hover:text-white"
    }`}
  >
    {icon}
    <span className="font-medium">{label}</span>
  </div>
);

const Sidebar = ({
  activeSection,
  setActiveSection,
  isSidebarOpen,
  setIsSidebarOpen,
  admin: adminProp,
}) => {
  const navigate = useNavigate();
  const [admin, setAdmin] = useState(null);
  const [loggingOut, setLoggingOut] = useState(false);

  /* 🔌 FETCH ADMIN PROFILE */
  useEffect(() => {
    if (adminProp) {
      setAdmin(adminProp);
    } else {
      adminApi.getProfile()
        .then((response) => {
          // Handle the response structure from your API
          setAdmin(response?.admin || response);
        })
        .catch(() => {
          setAdmin({ name: "Admin", role: "Backend Lead" });
        });
    }
  }, [adminProp]);

  /* 🚪 LOGOUT HANDLER */
  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await adminApi.logout();
      navigate("/admin-login", { replace: true });
    } catch (error) {
      console.error("Logout failed:", error);
      // Force navigation even if API fails
      navigate("/admin-login", { replace: true });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-50 w-64 p-6 bg-[#1a1025]/90 backdrop-blur-xl
        border-r border-white/5 transition-transform duration-300 ease-in-out
        h-full md:relative ${
          isSidebarOpen
            ? "translate-x-0"
            : "-translate-x-full md:translate-x-0"
        }`}
    >
      {/* LOGO */}
      <div className="flex justify-between items-center mb-10">
        <Link
          to="/"
          className="text-2xl font-bold text-purple-400 hover:text-purple-300 transition-colors"
        >
          Technothon
        </Link>

        <button
          onClick={() => setIsSidebarOpen(false)}
          className="md:hidden p-1 hover:bg-white/10 rounded-lg"
        >
          <X size={20} />
        </button>
      </div>

      {/* NAVIGATION */}
      <nav className="space-y-4">
        <NavItem
          icon={<LayoutDashboard />}
          label="Dashboard"
          active={activeSection === "dashboard"}
          onClick={() => {
            setActiveSection("dashboard");
            setIsSidebarOpen(false);
          }}
        />

        <NavItem
          icon={<Users />}
          label="Attendance"
          active={activeSection === "attendance"}
          onClick={() => {
            setActiveSection("attendance");
            setIsSidebarOpen(false);
          }}
        />
        <NavItem
          icon={<UserCheck />}
          label="Participants"
          active={activeSection === "participants"}
          onClick={() => {
            setActiveSection("participants");
            setIsSidebarOpen(false);
          }}
        />
        <NavItem
          icon={<UsersRound />}
          label="Teams"
          active={activeSection === "teams"}
          onClick={() => {
            setActiveSection("teams");
            setIsSidebarOpen(false);
          }}
        />
        <NavItem
          icon={<Calendar />}
          label="Events"
          active={activeSection === "events"}
          onClick={() => {
            setActiveSection("events");
            setIsSidebarOpen(false);
          }}
        />

        <NavItem
          icon={<Briefcase />}
          label="Hiring"
          active={activeSection === "hiring"}
          onClick={() => {
            setActiveSection("hiring");
            setIsSidebarOpen(false);
          }}
        />
      </nav>

      {/* ADD NEW MEMBER CTA */}
      <div className="mt-8">
        <button
          onClick={() => {
            setActiveSection("add-member");
            setIsSidebarOpen(false);
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl
            bg-purple-600 text-white font-medium
            hover:bg-purple-700 transition
            shadow-lg shadow-purple-600/30"
        >
          <UserPlus size={20} />
          Add New Member
        </button>
      </div>

      {/* BOTTOM PROFILE & LOGOUT */}
      <div className="absolute bottom-6 left-6 right-6">
        {/* LOGOUT BUTTON */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl mb-6
            bg-red-500/10 text-red-400 font-medium
            hover:bg-red-500/20 hover:text-red-300
            border border-red-500/20 hover:border-red-500/40
            transition-all duration-300
            shadow-lg shadow-red-500/10
            ${loggingOut ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          <LogOut size={20} className={loggingOut ? 'animate-pulse' : ''} />
          <span>{loggingOut ? 'Logging out...' : 'Logout'}</span>
        </button>

        {/* ADMIN PROFILE */}
        <div className="flex items-center gap-3 px-2">
          {admin?.avatar ? (
            <img
              src={admin.avatar}
              alt="Admin"
              className="w-10 h-10 rounded-full object-cover ring-2 ring-purple-500/30"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center font-bold text-white shadow-lg">
              {admin?.name?.charAt(0)?.toUpperCase() || "A"}
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-white">
              {admin?.name || "Loading..."}
            </p>
            <p className="text-xs text-white/50">
              {admin?.role || "Backend Lead"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;