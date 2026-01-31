// Technothon_frontend/src/pages/AIUnleashed.jsx
import React, { useEffect, useState } from "react";
import TeamDetailsModal from "../components/TeamDetailsModal";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import axios from "axios";

const AIUnleashed = () => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear >= 2025 ? 2025 : 2024);

  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teams, setTeams] = useState([]);
  const [jury, setJury] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [winners, setWinners] = useState([]);
  const [eventStatus, setEventStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [eventId, setEventId] = useState(null);

  // 🔥 LOGIN CHECK USING SESSION VALIDATION
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // Function to check if user has valid session
  const checkUserSession = async () => {
    try {
      // Call the /me endpoint to verify session
      const response = await axios.get("http://localhost:8000/me", {
        withCredentials: true, // Important: sends cookies with request
      });

      if (response.data && response.data.id) {
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      // If /me returns 401 or any error, user is not logged in
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

  useEffect(() => {
    fetchEventData();
  }, [year]);

  const fetchEventData = async () => {
    setLoading(true);
    setError(null);

    try {
      const statusRes = await axios.get(
        `http://localhost:8000/event-status/AI-Unleashed/${year}`
      );
      setEventStatus(statusRes.data);

      // 🔥 FIX: Set the eventId from the response
      if (statusRes.data && statusRes.data.eid) {
        setEventId(statusRes.data.eid);
        console.log("Event ID set:", statusRes.data.eid);
      }
      try {
    const statusRes = await axios.get(
      `http://localhost:8000/event-status/AI-Unleashed/${year}`
    );

    setEventStatus(statusRes.data);

    // Try different possible field names
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

    // ... rest of your code
  } catch (err) {
    console.error("API Error:", err);
    // ... rest of error handling
  }

      const teamsRes = await axios.get(
        `http://localhost:8000/eventdata/AU/${year}`
      );
      setTeams(Array.isArray(teamsRes.data) ? teamsRes.data : []);

      if (year === 2025) {
        setJury([
          { name: "Dr. Abhishek Majumdar", from: "Techno India University" },
          { name: "Dr. Ratnadeep Das", from: "Techno India University" },
          { name: "Dr. Rupak Chakrabarty", from: "Techno India University" },
          { name: "Dr. Abhro Mukherjee", from: "Techno India University" },
        ]);

        setSponsors([
          { name: "Adi Mohini Mohan kanjilal", logo: "/images/Adi.png" },
          { name: "Kashmir Gift House", logo: "/images/Kashmir.png" },
          { name: "GoBoult", logo: "/images/sponsor3.png" },
          { name: "91.9 Friends FM", logo: "/images/sponsor1.jpg" },
          { name: "Haque Electronics", logo: "/images/sponsor2.jpg" },
          { name: "BoAt", logo: "/images/sponsor4.png" },
        ]);

        setWinners([
          { position: "Winner", name: "Team Comet", lead_name: "Ritu Raj" },
          { position: "1st Runner-up", name: "Team BrainyBytes", lead_name: "Subhradwip Siddhanta" },
          { position: "2nd Runner-up", name: "Team Rudraksha", lead_name: "Karmaveer Kumar" },
          { position: "Jury's Choice Award", name: "Team Score Sensei", lead_name: "Sayan Mahanto" },
          { position: "Best Innovative Idea", name: "Team 5 Star", lead_name: "Arijit Das" },
          { position: "Best Frontend Award", name: "Team Zenith", lead_name: "Sritama Basu" },
          { position: "Sponsor's Choice", name: "Team Vivekastra", lead_name: "D Arun Kumar" },
        ]);
      } else if (year === 2024) {
        setJury([
          { name: "Dr. Abhishek Majumdar", from: "Techno India University" },
          { name: "Dr. Jayanta Poray", from: "Techno India University" },
          { name: "Dr. Abhro Mukherjee", from: "Techno India University" },
        ]);

        setSponsors([
          { name: "GreenAI", logo: "/images/greenai_services_logo.jpg" },
        ]);

        setWinners([
          { position: "Winner", name: "Stardust Crusaders", lead_name: "Ankit Agarwal" },
          { position: "1st Runner-up", name: "Air", lead_name: "Anjisnu Roy" },
          { position: "2nd Runner-up", name: "SPI Coders", lead_name: "Sneha Debnath" },
          { position: "Best Innovative Idea", name: "Code Catalyst", lead_name: "Richa Kumari" },
          { position: "Best Presentation Award", name: "TechNova", lead_name: "Tuneer Paul" },
          { position: "Jury's Choice Award", name: "CodeHub", lead_name: "Krishna Sen" },
        ]);
      }
    } catch (err) {
//       console.error("Failed to load AI Unleashed data", err);
//       setError("Could not load AI Unleashed event data. Please try again later.");
      setJury([]);
      setSponsors([]);
      setWinners([]);
      setTeams([]);
      setEventStatus(null);
    } finally {
      setLoading(false);
    }
  };

  // Event Live Status
  const isEventLive = eventStatus?.is_live === 1 || eventStatus?.is_live === "1";

  // Final Button Condition: Event must be live AND user must be logged in
  const canRegister = isEventLive && isLoggedIn;

  // Handle Register Button Click
  const handleRegisterClick = () => {
    if (!isLoggedIn) {
      window.location.href = "/login";
    } else if (canRegister && eventId) {
      // 🔥 FIX: Use proper template literal syntax
      window.location.href = `/team-registration?eventId=${eventId}`;
    } else if (!eventId) {
      alert("Event ID not available. Please try again.");
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

      {/* HERO SECTION */}
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
            className="pl-5 pr-2 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/20
                       text-base font-semibold bg-gradient-to-r from-violet-400 via-pink-500 to-orange-400
                       bg-clip-text text-transparent cursor-pointer hover:bg-white/20 transition-all duration-300"
          >
            <option value={2024} className="bg-[#0f011a] text-white">2024</option>
            <option value={2025} className="bg-[#0f011a] text-white">2025</option>
          </select>
        </div>

        {/* TITLE + REGISTER BUTTON */}
        <div className="relative z-10 px-6">
          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-violet-400 via-pink-500 to-orange-400 bg-clip-text text-transparent">
            AI Unleashed {year}
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-gray-300">
            Unleashing the next wave of AI innovation.
          </p>

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

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-20 space-y-28">

        {loading && (
          <p className="text-center text-gray-400 text-lg">Loading event data...</p>
        )}
        {error && (
          <p className="text-center text-red-400 text-lg">{error}</p>
        )}

        {!loading && !error && (
          <>
            {/* ABOUT SECTION */}
            <section className="text-center max-w-3xl mx-auto">
              <h2 className="section-title">About the Event</h2>
              <p className="text-lg text-gray-300 leading-relaxed mt-6">
                AI Unleashed {year} brings together AI leaders and innovators from across the globe.
              </p>
            </section>

            {/* JURY */}
            <section>
              <h2 className="section-title">Jury Members</h2>
              {jury.length === 0 ? (
                <p className="text-center text-gray-400 mt-8">No jury members available.</p>
              ) : (
                <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-3 max-w-5xl mx-auto mt-12">
                  {jury.map((j, idx) => (
                    <div key={idx} className="card-glass p-6 text-center">
                      <h3 className="text-xl font-semibold">{j.name}</h3>
                      <h4 className="text-lg text-gray-300">{j.from}</h4>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* SPONSORS */}
{/*             <section> */}
{/*               <h2 className="section-title">Sponsors</h2> */}
{/*               {sponsors.length === 0 ? ( */}
{/*                 <p className="text-center text-gray-400 mt-8">No sponsors available.</p> */}
{/*               ) : ( */}
{/*                 <div className="flex justify-center flex-wrap gap-10 mt-12"> */}
{/*                   {sponsors.map((s, idx) => ( */}
{/*                     <div key={idx} className="card-glass p-4 rounded-xl flex items-center justify-center"> */}
{/*                       <img src={s.logo} alt={s.name} className="h-20 w-auto object-contain" /> */}
{/*                     </div> */}
{/*                   ))} */}
{/*                 </div> */}
{/*               )} */}
{/*             </section> */}

            {/* WINNERS */}
            <section>
              <h2 className="section-title">Winners</h2>
              {winners.length === 0 ? (
                <p className="text-center text-gray-400 mt-8">No winners announced yet.</p>
              ) : (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10 max-w-5xl mx-auto mt-12">
                  {winners.map((w, idx) => (
                    <div key={idx} className="card-glass p-6 text-center border border-violet-500/30 rounded-2xl">
                      <h3 className="text-xl font-semibold text-violet-400">{w.position}</h3>
                      <p className="mt-3 text-lg font-bold">{w.name}</p>
                      <p className="mt-2 text-gray-300">
                        Lead: <span className="text-pink-400">{w.lead_name}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* TEAMS */}
            <section>
              <h2 className="section-title">Teams</h2>
              {teams.length === 0 ? (
                <p className="text-center text-gray-400 mt-8">Team details will be displayed soon.</p>
              ) : (
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-10 max-w-6xl mx-auto mt-12">
                  {teams.map((team, idx) => (
                    <div
                      key={idx}
                      className="card-glass p-6 border border-violet-500/30 rounded-2xl hover:border-violet-500 hover:scale-105 transition cursor-pointer"
                      onClick={() => setSelectedTeam(team)}
                    >
                      <h3 className="text-xl font-semibold text-violet-400 text-center">
                        {team.Team_Name}
                      </h3>
                      <p className="mt-2 text-center text-gray-300">
                        <span className="text-gray-400">Leader:</span>{" "}
                        <span className="text-pink-400">{team.Leader_Name}</span>
                      </p>
                      <div className="mt-4 text-center">
                        <p className="text-sm text-gray-400 uppercase mb-1">Idea</p>
                        <p className="text-base text-pink-400 font-semibold">
                          {team.Idea_Title}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <TeamDetailsModal
                team={selectedTeam}
                onClose={() => setSelectedTeam(null)}
              />
            </section>
          </>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default AIUnleashed;