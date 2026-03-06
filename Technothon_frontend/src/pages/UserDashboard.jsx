import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";
import Navbar from "@/components/Navbar";

// ✅ Reusable glassmorphism card
const Card = ({ className = "", children }) => (
  <div
    className={`backdrop-blur-lg bg-purple-500/10 border border-white/10 rounded-2xl p-6 shadow-md ${className}`}
  >
    {children}
  </div>
);

// ✅ Hook for intersection animations
const useRevealOnScroll = (ref, threshold = 0.3) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref, threshold]);

  return visible;
};

const UserDashboard = () => {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [events, setEvents] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [pastTeams, setPastTeams] = useState([]);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState(null);

  // Refs
  const profileRef = useRef(null);
  const statsRef = useRef(null);
  const achievementsRef = useRef(null);
  const certificatesRef = useRef(null);
  const qrRef = useRef(null);

  // Animations
  const isProfileVisible = useRevealOnScroll(profileRef);
  const isStatsVisible = useRevealOnScroll(statsRef);
  const isAchievementsVisible = useRevealOnScroll(achievementsRef);
  const isCertificatesVisible = useRevealOnScroll(certificatesRef);

  useEffect(() => {
    const fetchCoupon = async () => {
      try {
        const couponRes = await axios.get("http://localhost:8000/coupon", {
          withCredentials: true,
        });
        setCoupon(couponRes.data);
        setCouponError(null); // reset error when coupon found
      } catch (err) {
        console.warn("No active coupon:", err?.response?.data?.detail);
        setCoupon(null);
        setCouponError(err?.response?.data?.detail || "No active coupon.");
      }
    };

    fetchCoupon();
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // ✅ Fetch user data
        const res = await axios.get("http://localhost:8000/me", {
          withCredentials: true,
        });

        const data = res.data;

        setUser({
          id: data.id,
          name: data.name,
          email: data.email,
          attendance: data.attendance
            ? {
                present: data.attendance.present ?? 0,
                total: data.attendance.total ?? 100,
              }
            : { present: 0, total: 0 },
        });

        setAchievements(data.achievements || []);
        setCertificates(data.certificates || []);

        try {
          const teamsRes = await axios.get("http://localhost:8000/pastdata", {
            withCredentials: true,
          });

          const formatted = JSON.stringify(
            teamsRes.data.participation || [],
            null,
            2,
          );

          console.log("📌 Past Teams JSON:", formatted);
          setPastTeams(JSON.parse(formatted));
        } catch (teamErr) {
          console.warn("No past teams found:", teamErr?.response?.data?.detail);
          setPastTeams([]);
        }

        // ✅ Handle currentTeam with status
        setCurrentTeam(data.currentTeam || null);

        // ✅ Fetch events separately
        try {
          const eventsRes = await axios.get("http://localhost:8000/events");
          setEvents(eventsRes.data || []);
        } catch (eventErr) {
          console.warn(
            "Failed to load events:",
            eventErr?.response?.data?.detail,
          );
          setEvents([]);
        }
      } catch (err) {
        console.error("Failed to load dashboard data:", err);
        navigate("/login");
      }
    };

    fetchDashboardData();
  }, [navigate]);

  const attendanceText = `${user?.attendance?.present || 0}%`;

  // ✅ Helper function to get team status message
  const getTeamStatusDisplay = () => {
    if (!currentTeam) {
      return {
        message: "You are not part of any current team.",
        color: "text-gray-400",
        badge: null,
      };
    }

    // If currentTeam is just a string (backward compatibility)
    if (typeof currentTeam === "string") {
      return {
        message: `You're part of ${currentTeam}`,
        color: "text-purple-300",
        badge: "✅ Approved",
      };
    }

    // If currentTeam is an object with name and status
    if (currentTeam.status == 0) {
      return {
        message: `Team: ${currentTeam.name}`,
        color: "text-red-400",
        badge: "⏳ Approval Pending",
      };
    } else {
      return {
        message: `You're part of ${currentTeam.name}`,
        color: "text-purple-300",
        badge: "✅ Approved",
      };
    }
  };
  const downloadQRCode = () => {
    if (!qrRef.current) return;

    const canvas = qrRef.current.querySelector("canvas");
    if (!canvas) return;

    const url = canvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = url;
    link.download = `food-coupon-${user?.id || "qr"}.png`;
    link.click();
  };

  const teamDisplay = getTeamStatusDisplay();

  return (
    <div className="relative min-h-screen w-full bg-[#130f2a] text-white overflow-hidden">
      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/images/bg2.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          filter: "blur(10px)",
        }}
      ></div>

      <Navbar />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-16 space-y-12">
        {/* Profile */}
        <div
          ref={profileRef}
          className={`backdrop-blur-lg bg-purple-500/10 border border-white/10 rounded-3xl p-6 flex justify-between items-center shadow-lg ${
            isProfileVisible ? "animate-slide-in-right" : "opacity-0"
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-pink-500 flex items-center justify-center text-lg font-bold">
              {user?.name?.[0]?.toUpperCase() || "U"}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-purple-300">
                {user?.name || "User Name"}
              </h1>
              <p className="text-gray-300 text-sm">
                {user?.email || "Email not available"}
              </p>
              <p className="text-gray-300 text-sm">User-ID:{user?.id}</p>
            </div>
          </div>
          <button
            className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full text-sm font-medium hover:opacity-90"
            onClick={() => navigate("/edit")}
          >
            Edit Profile
          </button>
        </div>

        {/* Attendance & Events */}
        <div
          ref={statsRef}
          className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${
            isStatsVisible ? "animate-slide-in-bottom" : "opacity-0"
          }`}
        >
          {/* Attendance */}
          <Card>
            <h4 className="uppercase text-xs text-purple-300 mb-2">
              Attendance
            </h4>
            <p className="text-3xl font-bold text-purple-400">
              {attendanceText}
            </p>
          </Card>

          {/* Events */}
          <Card>
            <h4 className="uppercase text-xs text-purple-300 mb-2">Events</h4>
            {events.length ? (
              <ul className="space-y-2 text-gray-300 text-sm">
                {events.map((e) => (
                  <li
                    key={e.id}
                    className="border-b border-white/10 pb-2 last:border-none"
                  >
                    <p className="font-medium text-purple-300">
                      {e.name}
                      <span className="ml-80">LIVE🟢</span>
                    </p>
                    {e.description && (
                      <p className="text-xs text-gray-400">{e.description}</p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-sm">No events available.</p>
            )}
          </Card>
        </div>

        {/* Achievements */}
        <div
          ref={achievementsRef}
          className={`backdrop-blur-lg bg-purple-500/10 border border-white/10 rounded-2xl p-6 shadow-md ${
            isAchievementsVisible ? "animate-slide-in-right" : "opacity-0"
          }`}
        >
          <h4 className="text-lg font-semibold text-purple-300 mb-4">
            Past Achievements 🏆
          </h4>
          {achievements.length ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {achievements.map((ach, i) => (
                <div
                  key={i}
                  className="bg-gradient-to-r from-purple-600 to-pink-500 p-3 rounded-xl text-white text-center"
                >
                  {ach.image && (
                    <img
                      src={ach.image}
                      alt={ach.title}
                      className="w-20 h-20 mx-auto rounded-md mb-2 object-cover"
                    />
                  )}
                  <p className="text-sm font-medium">{ach.title}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-sm">No achievements yet.</p>
          )}
        </div>

        {/* Certificates + Share */}
        <div
          ref={certificatesRef}
          className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${
            isCertificatesVisible ? "animate-slide-in-bottom" : "opacity-0"
          }`}
        >
          <Card>
            <h4 className="text-lg font-semibold text-purple-300 mb-4">
              Certificates 📜
            </h4>
            {certificates.length ? (
              <ul className="space-y-3 text-gray-300 text-sm">
                {certificates.map((cert, i) => (
                  <li key={i} className="flex items-center gap-3">
                    {cert.image && (
                      <img
                        src={cert.image}
                        alt={cert.name}
                        className="w-10 h-10 rounded-md object-cover"
                      />
                    )}
                    <span>
                      {cert.name} - {cert.issuer}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-sm">
                No certificates uploaded yet.
              </p>
            )}
          </Card>
          <Card className="flex flex-col justify-between">
            <div>
              <h4 className="text-lg font-semibold text-purple-300 mb-2">
                Share Your Profile
              </h4>
              <p className="text-gray-400 text-sm mb-4">
                Let others see your achievements!
              </p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Profile link copied!");
              }}
              className="px-5 py-2 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full text-sm font-medium hover:opacity-90"
            >
              Share Profile
            </button>
          </Card>
        </div>

        {/* Bottom Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 flex-1">
          <Card className="h-full flex flex-col items-center justify-center">
            <h4 className="text-lg font-semibold text-purple-300 mb-3">
              Food Coupon 🍔
            </h4>

            {coupon ? (
              <div ref={qrRef} className="flex flex-col items-center gap-4">
                <QRCodeCanvas
                  value={JSON.stringify(coupon)}
                  size={160}
                  bgColor="transparent"
                  fgColor="#ffffff"
                />

                <button
                  onClick={downloadQRCode}
                  className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full text-xs font-medium hover:opacity-90"
                >
                  Download QR Code
                </button>
              </div>
            ) : (
              <p className="text-gray-400 text-sm">
                {couponError || "No active coupon."}
              </p>
            )}
          </Card>

          {/* ✅ Past Teams */}
          <Card className="h-full flex flex-col">
            <h4 className="text-lg font-semibold text-purple-300 mb-3">
              Past Teams 👥
            </h4>
            {pastTeams.length ? (
              <ul className="space-y-3 text-gray-300 text-sm overflow-y-auto">
                {pastTeams.map((team, idx) => (
                  <li key={idx} className="border-b border-white/10 pb-2">
                    <p className="font-medium text-purple-300">
                      {team.team_name}
                    </p>
                    <p className="text-xs text-gray-400">{team.event}</p>
                    {team.members?.length > 0 && (
                      <p className="text-xs text-gray-400">
                        Members: {team.members.join(", ")}
                      </p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400 text-sm">No past teams found.</p>
            )}
          </Card>

          {/* ✅ Current Team with Status */}
          <Card className="h-full flex flex-col">
            <h4 className="text-lg font-semibold text-purple-300 mb-3">
              Current Team 🏅
            </h4>
            <div className="flex-1 flex flex-col justify-between">
              <div>
                <p className={`text-sm mb-2 ${teamDisplay.color}`}>
                  {teamDisplay.message}
                </p>
                {teamDisplay.badge && (
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                      teamDisplay.badge.includes("Pending")
                        ? "bg-yellow-500/20 text-red-300 border border-yellow-500/30"
                        : "bg-green-500/20 text-green-300 border border-green-500/30"
                    }`}
                  >
                    {teamDisplay.badge}
                  </span>
                )}
              </div>
              {currentTeam && currentTeam.status === 0 && (
                <p className="text-xs text-gray-400 mt-3">
                  Your team registration is being reviewed by the admin. You'll
                  be notified once it's approved.
                </p>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;