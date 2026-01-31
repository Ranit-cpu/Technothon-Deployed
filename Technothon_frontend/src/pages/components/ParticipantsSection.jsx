import React, { useEffect, useState, useMemo } from "react";
import { adminApi } from "./adminApi";
import { Download, FileSpreadsheet } from "lucide-react";

/* ---------------- ROW COMPONENT ---------------- */

const ParticipantRow = ({ pid, name, role, teamName, foodPref, whatsapp }) => {
  return (
    <div
      className="grid grid-cols-6 items-center p-4 rounded-full transition-colors
      bg-white/5 hover:bg-white/10"
    >
      <div className="font-medium text-purple-400">{pid}</div>
      <div className="text-white">{name}</div>
      <div className="text-white/80">{role}</div>
      <div className="text-white/70">{teamName}</div>
      <div className={`${
        foodPref?.toLowerCase() === 'veg' ? 'text-green-400' :
        foodPref?.toLowerCase() === 'non-veg' ? 'text-red-400' :
        'text-white/70'
      }`}>
        {foodPref}
      </div>
      <div className="text-white/60">{whatsapp}</div>
    </div>
  );
};

/* ---------------- CARD COMPONENT FOR MOBILE ---------------- */

const ParticipantCard = ({ pid, name, role, teamName, foodPref, whatsapp }) => (
  <div className="bg-white/5 p-4 rounded-2xl space-y-2">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="font-bold text-lg text-white">{name}</h3>
        <p className="text-xs text-purple-400">{pid}</p>
      </div>
    </div>
    <div className="space-y-1">
      <p className="text-sm text-white/80">
        <span className="text-white/50">Role:</span> {role}
      </p>
      <p className="text-sm text-white/80">
        <span className="text-white/50">Team:</span> {teamName}
      </p>
      <p className="text-sm">
        <span className="text-white/50">Food Preference:</span>{" "}
        <span className={`${
          foodPref?.toLowerCase() === 'veg' ? 'text-green-400' :
          foodPref?.toLowerCase() === 'non-veg' ? 'text-red-400' :
          'text-white/80'
        }`}>
          {foodPref}
        </span>
      </p>
      <p className="text-sm text-white/60">
        <span className="text-white/50">WhatsApp:</span> {whatsapp}
      </p>
    </div>
  </div>
);

/* ---------------- MAIN SECTION ---------------- */

const ParticipantsSection = () => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadParticipants();
  }, []);

  const loadParticipants = () => {
    setLoading(true);
    adminApi
      .getParticipants()
      .then((data) => {
        const formatted = Array.isArray(data) ? data : [];
        setParticipants(formatted);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load participants data");
        setLoading(false);
      });
  };

  // Filter participants based on search query (case-insensitive)
  const filteredParticipants = participants.filter((participant) => {
    const query = searchQuery.toLowerCase();
    return (
      participant.name.toLowerCase().includes(query) ||
      participant.pid.toLowerCase().includes(query) ||
      participant.role.toLowerCase().includes(query) ||
      participant.team_name.toLowerCase().includes(query) ||
      participant.whatsapp_no.toLowerCase().includes(query)
    );
  });

  // ✅ Calculate food preference counts
  const foodStats = useMemo(() => {
    const veg = filteredParticipants.filter(p =>
      p.food_preference?.toLowerCase() === 'veg'
    ).length;
    const nonVeg = filteredParticipants.filter(p =>
      p.food_preference?.toLowerCase() === 'non-veg'
    ).length;
    return { veg, nonVeg };
  }, [filteredParticipants]);

  // Download as CSV
  const downloadCSV = () => {
    setDownloading(true);
    try {
      const headers = ["Participant ID", "Name", "Role", "Team Name", "Food Preference", "WhatsApp No."];
      const csvContent = [
        headers.join(","),
        ...filteredParticipants.map((p) =>
          [
            p.pid,
            `"${p.name}"`,
            `"${p.role}"`,
            `"${p.team_name}"`,
            `"${p.food_preference}"`,
            p.whatsapp_no,
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", `participants_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download failed:", err);
      setError("Failed to download CSV");
      setTimeout(() => setError(""), 3000);
    } finally {
      setDownloading(false);
    }
  };

  // Download as Excel (using CSV format with .xlsx extension for simplicity)
  const downloadExcel = () => {
    setDownloading(true);
    try {
      const headers = ["Participant ID", "Name", "Role", "Team Name", "Food Preference", "WhatsApp No."];
      const csvContent = [
        headers.join("\t"),
        ...filteredParticipants.map((p) =>
          [
            p.pid,
            p.name,
            p.role,
            p.team_name,
            p.food_preference,
            p.whatsapp_no,
          ].join("\t")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "application/vnd.ms-excel" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);

      link.setAttribute("href", url);
      link.setAttribute("download", `participants_${new Date().toISOString().split('T')[0]}.xls`);
      link.style.visibility = "hidden";

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("Download failed:", err);
      setError("Failed to download Excel");
      setTimeout(() => setError(""), 3000);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return <p className="text-white/60 p-6">Loading participants...</p>;
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-4 mb-6">
        {/* Top Row: Title and Download Buttons */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
          <div className="flex-shrink-0">
            <h2 className="text-2xl font-bold">Participants Overview</h2>
          </div>

          {/* ✅ Food Preference Stats - Large Display in Center */}
          <div className="flex items-center justify-center gap-8 flex-1">
            <div className="text-center">
              <div className="text-5xl font-bold text-green-400 mb-1">
                {foodStats.veg}
              </div>
              <div className="text-sm text-green-400/80 font-medium">
                🌱 Veg
              </div>
            </div>
            <div className="h-16 w-px bg-white/20"></div>
            <div className="text-center">
              <div className="text-5xl font-bold text-red-400 mb-1">
                {foodStats.nonVeg}
              </div>
              <div className="text-sm text-red-400/80 font-medium">
                🍖 Non-Veg
              </div>
            </div>
          </div>

          {/* Download Buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <button
              onClick={downloadCSV}
              disabled={downloading || filteredParticipants.length === 0}
              className={`px-4 py-2.5 bg-green-600 hover:bg-green-700 rounded-full
                       text-white font-medium transition-all flex items-center gap-2
                       ${downloading || filteredParticipants.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Download size={20} />
              <span>CSV</span>
            </button>

            <button
              onClick={downloadExcel}
              disabled={downloading || filteredParticipants.length === 0}
              className={`px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-full
                       text-white font-medium transition-all flex items-center gap-2
                       ${downloading || filteredParticipants.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <FileSpreadsheet size={20} />
              <span>Excel</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Search Bar */}
        <div className="relative w-full max-w-full sm:max-w-md">
          <input
            type="text"
            placeholder="Search by name, ID, role, team, or WhatsApp..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-full
                     text-white placeholder-white/40 focus:outline-none focus:border-purple-500/50
                     focus:bg-white/10 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80"
            >
              ✕
            </button>
          )}
        </div>

        {/* Results Count */}
        <p className="text-sm text-white/60">
          Showing {filteredParticipants.length} of {participants.length} participants
        </p>
      </div>

      {/* No Results Message */}
      {filteredParticipants.length === 0 && (
        <p className="text-white/60 text-center py-8">
          {searchQuery ? `No participants found matching "${searchQuery}"` : "No participants available"}
        </p>
      )}

      {/* DESKTOP VIEW */}
      {filteredParticipants.length > 0 && (
        <div className="hidden md:block overflow-x-auto pb-4">
          <div className="min-w-[900px]">
            {/* ✅ FIXED: Changed from grid-cols-5 to grid-cols-6 to match rows */}
            <div className="grid grid-cols-6 text-white/60 text-sm font-medium px-4 mb-4">
              <div>Participant ID</div>
              <div>Name</div>
              <div>Role</div>
              <div>Team Name</div>
              <div>Food Preference</div>
              <div>WhatsApp No.</div>
            </div>

            <div className="space-y-3">
              {filteredParticipants.map((participant, index) => (
                <ParticipantRow
                  key={participant.pid || index}
                  pid={participant.pid}
                  name={participant.name}
                  role={participant.role}
                  teamName={participant.team_name}
                  foodPref={participant.food_preference}
                  whatsapp={participant.whatsapp_no}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MOBILE VIEW */}
      {filteredParticipants.length > 0 && (
        <div className="md:hidden space-y-4">
          {filteredParticipants.map((participant, index) => (
            <ParticipantCard
              key={participant.pid || index}
              pid={participant.pid}
              name={participant.name}
              role={participant.role}
              teamName={participant.team_name}
              foodPref={participant.food_preference}
              whatsapp={participant.whatsapp_no}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ParticipantsSection;