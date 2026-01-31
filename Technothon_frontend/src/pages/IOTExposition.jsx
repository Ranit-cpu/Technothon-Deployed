// Technothon_frontend/src/pages/IOTExposition.jsx
import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import TeamModal from "../components/TeamModal";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const IOTExposition = () => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear >= 2026 ? 2026 : currentYear >= 2025 ? 2025 : 2024);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teams, setTeams] = useState([]);
  const [winners, setWinners] = useState([]);
  const [jury, setJury] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [eventStatus, setEventStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [eventId, setEventId] = useState(null);

  // 🔥 LOGIN CHECK USING SESSION VALIDATION
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Check if user has valid session
  const checkUserSession = async () => {
    try {
      const response = await axios.get("http://localhost:8000/me", {
        withCredentials: true,
      });

      if (response.data && response.data.id) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.log("Not logged in:", error.response?.status);
      setIsLoggedIn(false);
    } finally {
      setCheckingAuth(false);
    }
  };

  // Check authentication on component mount
  useEffect(() => {
    checkUserSession();
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch event live status
      const statusRes = await axios.get(
        `http://localhost:8000/event-status/IoT-Exposition/${year}`
      );
      setEventStatus(statusRes.data);
      const possibleEventId =
      statusRes.data?.eid ||
      statusRes.data?.event_id ||
      statusRes.data?.id ||
      statusRes.data?.eventId;

    if (possibleEventId) {
      setEventId(possibleEventId);
    } else {
      console.error("❌ Could not find event ID in response");
      console.error("Available fields:", Object.keys(statusRes.data || {}));
    }

      // Fetch teams data
      const teamsRes = await axios.get(`http://localhost:8000/eventdata/IE/${2025}`);
      const safeArray = (data, key) =>
        Array.isArray(data) ? data : Array.isArray(data?.[key]) ? data[key] : [];
      setTeams(safeArray(teamsRes.data, "teams"));

      if (year === 2025) {
        setJury([
          { name: "Dr. SK Habibur Rahaman", from: "Techno India University" },
          { name: "Dr. Asoke Kumar Paul", from: "Techno India University" },
          { name: "Dr. Harekrishna Chatterjee", from: "Techno India University" },
          { name: "Dr. Abhro Mukherjee", from: "Techno India University" },
        ]);
        setSponsors([
          { name: "Haque Electronics", logo: "/images/sponsor2.jpg" },
          { name: "GoBoult", logo: "/images/sponsor3.png" },
          { name: "91.9 Friends FM", logo: "/images/sponsor1.jpg" },
          { name: "BoAt", logo: "/images/sponsor4.png" },
        ]);
        setWinners([
          {
            position: "Winner",
            name: "FROSTBYTE",
            logo: "/images/teams/frostbyte.jpg",
            lead_name: "Karmveer Kumar",
          },
          {
            position: "1st Runner-up",
            name: "404 Brain Not Found",
            logo: "/images/teams/404_brain_not_found.jpg",
            lead_name: "Titli Mukherjee",
          },
          {
            position: "2nd Runner-up",
            name: "Panchaa Bhuta",
            logo: "/images/teams/panchaa_bhuta.jpg",
            lead_name: "Swarnabha Saha",
          },
          {
            position: "Best Innovative Idea",
            name: "Quantum Connect",
            logo: "/images/teams/quantum_connect.jpg",
            lead_name: "Manish Shaw",
          },
          {
            position: "Best Presentation Award",
            name: "ByteBots",
            logo: "/images/teams/bytebots.jpg",
            lead_name: "Sneha Ghosh",
          },
          {
            position: "Jury's Choice Award",
            name: "5 STAR",
            logo: "/images/teams/5_star.jpg",
            lead_name: "Arijit Das",
          },
        ]);
      } else if (year === 2024) {
        setJury([
          { name: "Parama Bhaumik", from: "Jadavpur University" },
          { name: "Munmun Bhattacharya", from: "Jadavpur University" },
          { name: "Tohida Rehman", from: "Jadavpur University" },
          { name: "Abhishek Majumdar", from: "Techno India University" },
          { name: "Jayanta Poray", from: "Techno India University" },
          { name: "Abhro Mukherjee", from: "Techno India University" },
        ]);
        setSponsors([
          { name: "GreenAI", logo: "/images/greenai_services_logo.jpg" },
        ]);
        setWinners([
          { position: "Winner", name: "Air", lead_name: "Anjisnu Roy" },
          {
            position: "1st Runner-up",
            name: "Bit-Brigade",
            lead_name: "Shubham Singh",
          },
          {
            position: "2nd Runner-up",
            name: "Innovators",
            lead_name: "Subham Garai",
          },
          {
            position: "Best Innovative Idea",
            name: "Tinkerers",
            lead_name: "Fauzia Khatun",
          },
          {
            position: "Best Presentation Award",
            name: "Crusaders",
            lead_name: "Ankit Agarwal",
          },
          {
            position: "Jury's Choice Award",
            name: "JASS",
            lead_name: "Jayeeta Dey",
          },
        ]);
      }else{
        setJury([]);
        setSponsors([]);
        setWinners([]);
        setTeams([]);
      }
    } catch (err) {
//       console.error("Failed to fetch IoT event data:", err);
//       setError("Could not load event data. Please try again later.");
      setTeams([]);
      setWinners([]);
      setJury([]);
      setSponsors([]);
      setEventStatus(null);
    } finally {
      setLoading(false);
    }
  }, [year]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Event Live Status
  const isEventLive = eventStatus?.is_live === 1 || eventStatus?.is_live === "1";

  // Final Button Condition: Event must be live AND user must be logged in
  const canRegister = isEventLive && isLoggedIn;

  // Handle Register Button Click
  const handleRegisterClick = () => {
    if (!isLoggedIn) {
      window.location.href = "/login";
    } else if (canRegister) {
      window.location.href = `/team-registration?eventId=${eventId}`;
    }
  };

  // Show loading spinner while checking auth
  if (checkingAuth) {
    return (
      <div className="bg-[#0f011a] text-white min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-violet-500 mx-auto"></div>
          <p className="mt-4 text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#0f011a] text-white min-h-screen">
      <Navbar show={true} />

      {/* Hero Section */}
      <section
        className="relative h-[70vh] flex items-center justify-center text-center overflow-hidden"
        style={{
          backgroundImage: `url('/images/bg2.png')`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/50 to-[#0f011a]" />

        {/* YEAR SELECTOR */}
        <div className="absolute top-24 right-6 z-20 flex flex-row items-center gap-3">
          <p className="text-white/80 text-lg font-medium">Event Year:</p>
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="px-5 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20
                        text-base font-semibold bg-gradient-to-r from-violet-400 via-pink-500 to-orange-400
                        bg-clip-text text-transparent cursor-pointer
                      hover:bg-white/20 transition-all duration-300
                        focus:outline-none focus:ring-2 focus:ring-violet-400"
          >
            <option value={2024} className="bg-[#0f011a] text-white">
              2024
            </option>
            <option value={2025} className="bg-[#0f011a] text-white">
              2025
            </option>
            <option value={2026} className="bg-[#0f011a] text-white">
              2026
            </option>
          </select>
        </div>

        {/* TITLE + REGISTER BUTTON */}
        <div className="relative z-10 px-6">
          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-violet-400 via-pink-500 to-orange-400 bg-clip-text text-transparent">
            IoT Exposition {year}
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-300 leading-relaxed">
            Explore the future of connected technology where embedded systems
            and edge computing drive innovation.
          </p>

          {/* 🔥 LIMITED SLOTS WARNING - Creates HIGH urgency */}
          {isEventLive && (
            <div className="mt-6 space-y-3">
              <div className="inline-block relative">
                <div className="absolute inset-0 bg-rose-600 blur-xl opacity-60 animate-pulse"></div>
                <p className="relative text-base md:text-lg font-black text-rose-100 bg-gradient-to-r from-rose-600 to-pink-600 px-8 py-3 rounded-full border-2 border-rose-400 animate-pulse shadow-2xl shadow-rose-500/70">
                  🚨 URGENT: ONLY 20 SLOTS AVAILABLE! 🚨
                </p>
              </div>
              <p className="text-xs md:text-sm font-bold text-rose-300 animate-bounce">
                ⏰ Registration closes when slots fill up - Register NOW!
              </p>
            </div>
          )}

          <div className="mt-8">
            <button
              onClick={handleRegisterClick}
              disabled={!canRegister}
              className={`inline-block px-8 py-3 rounded-full text-white font-semibold transition-all duration-300
                ${
                  canRegister
                    ? "bg-gradient-to-r from-violet-500 to-pink-500 hover:opacity-90 hover:scale-105 cursor-pointer"
                    : "bg-gray-600 cursor-not-allowed opacity-70"
                }`}
            >
              {!isLoggedIn ? "Login to Register" : !isEventLive ? "Registration Closed" : "Register Now"}
            </button>

            {/* Status Message */}
            {isLoggedIn && !isEventLive && (
              <p className="mt-4 text-sm text-gray-400">
                Registration is currently closed for this event.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-20 space-y-28">
        {loading && (
          <p className="text-center text-gray-400 text-lg">
            Loading event data...
          </p>
        )}
        {error && <p className="text-center text-red-400 text-lg">{error}</p>}

        {!loading && !error && (
          <>
            {/* About */}
            <section className="text-center max-w-3xl mx-auto">
              <h2 className="section-title">About the Event</h2>
              <p className="text-lg text-gray-300 leading-relaxed mt-6">
                IoT Exposition {year} is a premier event showcasing advanced
                embedded systems, edge computing and sensor networks. The event
                gathers experts to explore scalable, secure IoT solutions
                driving smart industries, healthcare and connected environments
                through real-time data and seamless cloud integration.
              </p>
            </section>

            {/* Jury */}
            <section>
              <h2 className="section-title">Jury Members</h2>
              {jury.length === 0 ? (
                <p className="text-center text-gray-400 mt-8">
                  No jury members available.
                </p>
              ) : (
                <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 max-w-5xl mx-auto mt-12">
                  {jury.map((j, idx) => (
                    <div key={idx} className="card-glass p-6 text-center">
                      <h2 className="text-xl font-semibold">
                        {typeof j === "string" ? j : j.name}
                      </h2>
                      <h4 className="text-lg text-gray-300">
                        {typeof j === "string" ? "" : j.from}
                      </h4>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Sponsors */}
{/*             <section> */}
{/*               <h2 className="section-title">Sponsors</h2> */}
{/*               {sponsors.length === 0 ? ( */}
{/*                 <p className="text-center text-gray-400 mt-8"> */}
{/*                   No sponsors available. */}
{/*                 </p> */}
{/*               ) : ( */}
{/*                 <div className="flex justify-center flex-wrap gap-10 mt-12"> */}
{/*                   {sponsors.map((s, idx) => ( */}
{/*                     <div */}
{/*                       key={s.name || idx} */}
{/*                       className="card-glass p-4 rounded-xl flex items-center justify-center" */}
{/*                     > */}
{/*                       <img */}
{/*                         src={s.logo} */}
{/*                         alt={s.name || "Sponsor"} */}
{/*                         className="h-20 w-auto object-contain" */}
{/*                       /> */}
{/*                     </div> */}
{/*                   ))} */}
{/*                 </div> */}
{/*               )} */}
{/*             </section> */}

            {/* Winners */}
            <section>
              <h2 className="section-title">Winners</h2>
              {winners.length === 0 ? (
                <p className="text-center text-gray-400 mt-8">
                  No winners announced yet.
                </p>
              ) : (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10 max-w-5xl mx-auto mt-12">
                  {winners.map((w, idx) => (
                    <div
                      key={idx}
                      className="card-glass p-6 text-center border border-violet-500/30 rounded-2xl hover:border-violet-500 transition-all duration-300"
                    >
                      <h3 className="text-xl font-semibold text-violet-400">
                        {w.position}
                      </h3>
                      <p className="mt-3 text-lg font-bold text-white">
                        {w.name}
                      </p>
                      <p className="mt-2 text-gray-300">
                        Lead:{" "}
                        <span className="font-medium text-pink-400">
                          {w.lead_name}
                        </span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Teams */}
            <section>
              <h2 className="section-title">Teams</h2>
              {teams.length === 0 ? (
                <p className="text-center text-gray-400 mt-8">
                  Team details will be displayed soon.
                </p>
              ) : (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10 max-w-6xl mx-auto mt-12">
                  {teams.map((team, idx) => (
                    <div
                      key={idx}
                      className="card-glass p-6 border border-violet-500/30 rounded-2xl
                                hover:border-violet-500 hover:scale-105 transition-all duration-300
                                cursor-pointer"
                      onClick={() => setSelectedTeam(team)}
                    >
                      <h3 className="text-xl font-semibold text-violet-400 text-center">
                        {team.Team_Name}
                      </h3>
                      <p className="mt-2 text-center text-gray-300">
                        <span className="text-gray-400">Leader:</span>{" "}
                        <span className="text-pink-400 font-medium">{team.Leader_Name}</span>
                      </p>
                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-400 uppercase mb-1">Idea</p>
                        <p className="text-base text-pink-400 font-semibold">{team.Idea_Title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <TeamModal team={selectedTeam} onClose={() => setSelectedTeam(null)} />
            </section>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default IOTExposition;