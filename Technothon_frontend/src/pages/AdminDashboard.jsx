/* AdminDashboard.jsx */

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { adminApi } from "./components/adminApi";

import {
  Users,
  Calendar,
  Bell,
  FileText,
  GraduationCap,
  Menu,
} from "lucide-react";

import EventsSection from "./components/EventsSection";
import StudentParticipationChart from "./components/StudentParticipationChart";
import UnitTeamsPerformanceChart from "./components/UnitTeamsPerformanceChart";
import AttendanceSection from "./components/AttendanceSection";
import HiringSection from "./components/HiringSection";
import GlassCard from "./components/GlassCard";
import AddStudent from "./components/AddStudent";
import Sidebar from "./components/Sidebar";
import ParticipantsSection from "./components/ParticipantsSection";
import TeamsSection from "./components/Teamssection";

export default function Dashboard() {
  const navigate = useNavigate();

  /* ---------------- STATE ---------------- */
  const [activeSection, setActiveSection] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [teams, setTeams] = useState([]);
  const [loadingTeams, setLoadingTeams] = useState(true);

  const [checkingAuth, setCheckingAuth] = useState(true);
  const [admin, setAdmin] = useState(null);
  const [applicationsCount, setApplicationsCount] = useState(0);
  const [studentsCount, setStudentsCount] = useState(0);
  const [eventName, setEventName] = useState("");
  const [currentEvent, setCurrentEvent] = useState("");
  const [teamsCount, setTeamsCount] = useState(0);

  /* ---------------- AUTH + PROFILE ---------------- */
  useEffect(() => {
    const init = async () => {
      try {
        const profile = await adminApi.checkSession();
        setAdmin({
          ...profile,
          name: profile.name.split(" ")[0]
        });
        setCheckingAuth(false);
      } catch {
        navigate("/admin-login", { replace: true });
      }
    };

    init();
  }, [navigate]);

  /* --------- TEAMS COUNT --------------- */
  useEffect(() => {
    if (checkingAuth) return;

    const fetchTeamsCount = async () => {
      try {
        const data = await adminApi.getTeams();
        setTeamsCount(Array.isArray(data) ? data.length : 0);
      } catch {
        navigate("/admin-login", { replace: true });
      }
    };

    fetchTeamsCount();
  }, [checkingAuth, navigate]);

  /* --------- APPLICATIONS COUNT --------------- */
  useEffect(() => {
    if (checkingAuth) return;

    const fetchApplicationsCount = async () => {
      try {
        const data = await adminApi.getApplicationsCount();
        setApplicationsCount(data.total_applications || 0);
        setEventName(data.event_name || "");
      } catch {
        navigate("/admin-login", { replace: true });
      }
    };
    fetchApplicationsCount();
  }, [checkingAuth, navigate]);

  /* --------- STUDENT COUNT --------- */
  useEffect(() => {
    if (checkingAuth) return;

    const fetchStudentsCount = async () => {
      try {
        const data = await adminApi.getStudentsCount();
        setStudentsCount(data.total_users || 0);
      } catch {
        navigate("/admin-login", { replace: true });
      }
    };
    fetchStudentsCount();
  }, [checkingAuth, navigate]);

  /* ---------------- CURRENT EVENT ---------------- */
  useEffect(() => {
    if (checkingAuth) return;

    const fetchCurrentEvent = async () => {
      try {
        const data = await adminApi.getEvents();
        console.log("Events API Response:", data);

        let events = [];
        if (Array.isArray(data)) {
          events = data;
        } else if (data.events && Array.isArray(data.events)) {
          events = data.events;
        } else if (data.data && Array.isArray(data.data)) {
          events = data.data;
        }

        const liveEvent = events.find(event =>
          event.is_live === 1 || event.is_live === true
        );

        if (liveEvent) {
          setCurrentEvent(liveEvent.name || liveEvent.event_name);
        } else {
          setCurrentEvent("No Live Event");
        }
      } catch (err) {
        console.error("Failed to fetch current event:", err);
        setCurrentEvent("N/A");
      }
    };
    fetchCurrentEvent();
  }, [checkingAuth]);

  /* ---------------- TEAMS ---------------- */
  useEffect(() => {
    if (checkingAuth) return;

    adminApi
      .getPendingTeams()
      .then((data) => {
        const rawTeams = Array.isArray(data?.pending_teams)
          ? data.pending_teams
          : [];

        const normalized = rawTeams.map((team) => ({
          id: team.tid,
          name: team.team_name,
          lead: team.lead_name,
          pay: team.transaction_id,
          status: team.status || "Pending",
        }));

        setTeams(normalized);
      })
      .catch(() => {
        navigate("/admin-login", { replace: true });
      })
      .finally(() => {
        setLoadingTeams(false);
      });
  }, [checkingAuth, navigate]);

  const approveTeam = async (id) => {
    try {
      await adminApi.approveTeam(id);
      setTeams((prev) =>
        prev.map((team) =>
          team.id === id ? { ...team, status: "Approved" } : team
        )
      );
    } catch {
      navigate("/admin-login", { replace: true });
    }
  };

  /* ---------------- LOADING ---------------- */
  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Verifying admin session…
      </div>
    );
  }

  /* ---------------- UI ---------------- */
  return (
    <div className="h-screen w-full flex text-white bg-gradient-to-b from-[#3D1454] to-[#040207] relative overflow-hidden">
      {/* MOBILE OVERLAY */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <Sidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        admin={admin}
      />

      {/* MAIN */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* MOBILE HEADER WITH HAMBURGER */}
        <div className="md:hidden flex items-center justify-between p-4 bg-[#1a1025]/90 backdrop-blur-xl border-b border-white/5">
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 hover:bg-white/10 rounded-lg transition"
          >
            <Menu size={24} />
          </button>
          <h1 className="text-lg font-semibold">
            {activeSection === "dashboard" && "Dashboard"}
            {activeSection === "attendance" && "Attendance"}
            {activeSection === "participants" && "Participants"}
            {activeSection === "teams" && "Teams"}
            {activeSection === "events" && "Events"}
            {activeSection === "hiring" && "Hiring"}
            {activeSection === "add-member" && "Add Member"}
          </h1>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 p-4 md:p-6 space-y-6 overflow-y-auto">
          {/* ---------------- DASHBOARD ---------------- */}
          {activeSection === "dashboard" && (
            <>
              {/* ANNOUNCEMENT */}
              <div className="bg-gradient-to-r from-purple-900/40 to-indigo-900/40 p-4 md:p-5 rounded-2xl border border-purple-500/20">
                <h2 className="text-lg md:text-xl font-semibold">
                  Welcome back, {admin?.name?.split(" ")[0]} 👋
                </h2>
                <p className="text-xs md:text-sm opacity-80 mt-1">
                  Here's what's happening today.
                </p>
              </div>

              {/* STATS */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <Stat title="Current Event" value={currentEvent} icon={Calendar} />
                <Stat
                  title="Total Participation"
                  value={applicationsCount}
                  sub={eventName}
                  isPositive
                  icon={FileText}
                />
                <Stat
                  title="Registered Teams"
                  value={teamsCount}
                  sub="Successfully Registered"
                  icon={Users}
                />
                <Stat
                  title="Total Students"
                  value={studentsCount}
                  sub="Registered Users Since Release"
                  icon={GraduationCap}
                />
              </div>

              {/* CHARTS */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
                <GlassCard title="Past Student Participation">
                  <StudentParticipationChart />
                </GlassCard>

                <GlassCard title="Unit Teams Performance">
                  <UnitTeamsPerformanceChart />
                </GlassCard>
              </div>

              {/* TEAMS TABLE */}
              <GlassCard title="Pending Teams">
                {loadingTeams ? (
                  <p className="text-sm opacity-60">Loading teams…</p>
                ) : teams.length === 0 ? (
                  <p className="text-sm opacity-60">No pending teams</p>
                ) : (
                  <div className="overflow-x-auto -mx-4 md:mx-0">
                    <table className="w-full text-sm min-w-[600px]">
                      <thead className="opacity-60 uppercase text-xs sticky top-0 bg-[#1a1025]">
                        <tr>
                          <th className="text-left py-3 px-2">Team</th>
                          <th className="text-center py-3 px-2">Lead Name</th>
                          <th className="text-center py-3 px-2">Payment</th>
                          <th className="text-center py-3 px-2">Status / Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {teams.map((team) => (
                          <Row
                            key={team.id}
                            team={team}
                            onApprove={approveTeam}
                          />
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </GlassCard>
            </>
          )}

          {/* OTHER SECTIONS */}
          {activeSection === "attendance" && <AttendanceSection />}
          {activeSection === "participants" && <ParticipantsSection />}
          {activeSection === "teams" && <TeamsSection />}
          {activeSection === "events" && <EventsSection />}
          {activeSection === "hiring" && <HiringSection />}
          {activeSection === "add-member" && <AddStudent />}
        </div>
      </main>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

const Stat = ({ title, value, sub, isPositive, icon: Icon }) => (
  <div className="bg-[#1a1025] p-4 md:p-6 rounded-2xl border border-white/5 relative">
    <Icon className="opacity-20 absolute right-4 md:right-6 top-4 md:top-6" size={32} />
    <p className="text-xs md:text-sm opacity-60">{title}</p>
    <h3 className="text-2xl md:text-3xl font-bold">{value}</h3>
    {sub && (
      <p className={`text-xs mt-1 ${isPositive ? "text-green-400" : "opacity-50"}`}>
        {sub}
      </p>
    )}
  </div>
);

const Row = ({ team, onApprove }) => (
  <tr className="hover:bg-white/5">
    <td className="py-3 px-2">{team.name}</td>
    <td className="text-center py-3 px-2">{team.lead}</td>
    <td className="text-center py-3 px-2">{team.pay}</td>
    <td className="text-center py-3 px-2">
      <span className="mr-2">{team.status}</span>
      {team.status === "Pending" && (
        <button
          onClick={() => onApprove(team.id)}
          className="px-3 py-1 text-xs rounded bg-purple-600 hover:bg-purple-700"
        >
          Approve
        </button>
      )}
    </td>
  </tr>
);