import React, { useEffect, useState } from "react";
import { adminApi } from "./adminApi";
import { Download, FileSpreadsheet } from "lucide-react";

/* ---------------- ROW COMPONENT ---------------- */

const TeamRow = ({ teamId, teamName, leadName, whatsappNo }) => {
  return (
    <div
      className="grid grid-cols-4 items-center p-4 rounded-full transition-colors min-w-[800px]
      bg-white/5 hover:bg-white/10"
    >
      <div className="font-medium text-purple-400">{teamId}</div>
      <div className="text-white">{teamName}</div>
      <div className="text-white/80">{leadName}</div>
      <div className="text-white/60">{whatsappNo}</div>
    </div>
  );
};

/* ---------------- CARD COMPONENT FOR MOBILE ---------------- */

const TeamCard = ({ teamId, teamName, leadName, whatsappNo }) => (
  <div className="bg-white/5 p-4 rounded-2xl space-y-2">
    <div className="flex justify-between items-start">
      <div>
        <h3 className="font-bold text-lg text-white">{teamName}</h3>
        <p className="text-xs text-purple-400">{teamId}</p>
      </div>
    </div>
    <div className="space-y-1">
      <p className="text-sm text-white/80">
        <span className="text-white/50">Lead:</span> {leadName}
      </p>
      <p className="text-sm text-white/60">
        <span className="text-white/50">WhatsApp:</span> {whatsappNo}
      </p>
    </div>
  </div>
);

/* ---------------- MAIN SECTION ---------------- */

const TeamsSection = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = () => {
    setLoading(true);
    adminApi
      .getTeams()
      .then((data) => {
        const formatted = Array.isArray(data) ? data : [];
        setTeams(formatted);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load teams data");
        setLoading(false);
      });
  };

  // Filter teams based on search query (case-insensitive)
  const filteredTeams = teams.filter((team) => {
    const query = searchQuery.toLowerCase();
    return (
      team.team_id.toLowerCase().includes(query) ||
      team.team_name.toLowerCase().includes(query) ||
      team.lead_name.toLowerCase().includes(query) ||
      team.whatsapp_no.toLowerCase().includes(query)
    );
  });

  // Download as CSV
  const downloadCSV = () => {
    setDownloading(true);
    try {
      const headers = ["Team ID", "Team Name", "Lead Name", "WhatsApp No."];
      const csvContent = [
        headers.join(","),
        ...filteredTeams.map((t) =>
          [
            t.team_id,
            `"${t.team_name}"`,
            `"${t.lead_name}"`,
            t.whatsapp_no,
          ].join(",")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      link.setAttribute("href", url);
      link.setAttribute("download", `teams_${new Date().toISOString().split('T')[0]}.csv`);
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
      const headers = ["Team ID", "Team Name", "Lead Name", "WhatsApp No."];
      const csvContent = [
        headers.join("\t"),
        ...filteredTeams.map((t) =>
          [
            t.team_id,
            t.team_name,
            t.lead_name,
            t.whatsapp_no,
          ].join("\t")
        ),
      ].join("\n");

      const blob = new Blob([csvContent], { type: "application/vnd.ms-excel" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      
      link.setAttribute("href", url);
      link.setAttribute("download", `teams_${new Date().toISOString().split('T')[0]}.xls`);
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
    return <p className="text-white/60 p-6">Loading teams...</p>;
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-4 mb-6">
        {/* Top Row: Title and Download Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl font-bold">Teams Overview</h2>

          {/* Download Buttons */}
          <div className="flex items-center gap-3">
            <button
              onClick={downloadCSV}
              disabled={downloading || filteredTeams.length === 0}
              className={`px-4 py-2.5 bg-green-600 hover:bg-green-700 rounded-full 
                       text-white font-medium transition-all flex items-center gap-2
                       ${downloading || filteredTeams.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <Download size={20} />
              <span>CSV</span>
            </button>

            <button
              onClick={downloadExcel}
              disabled={downloading || filteredTeams.length === 0}
              className={`px-4 py-2.5 bg-blue-600 hover:bg-blue-700 rounded-full 
                       text-white font-medium transition-all flex items-center gap-2
                       ${downloading || filteredTeams.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
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
            placeholder="Search by team ID, name, lead, or WhatsApp..."
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
          Showing {filteredTeams.length} of {teams.length} teams
        </p>
      </div>

      {/* No Results Message */}
      {filteredTeams.length === 0 && (
        <p className="text-white/60 text-center py-8">
          {searchQuery ? `No teams found matching "${searchQuery}"` : "No teams available"}
        </p>
      )}

      {/* DESKTOP VIEW */}
      {filteredTeams.length > 0 && (
        <div className="hidden md:block overflow-x-auto pb-4">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-4 text-white/60 text-sm font-medium px-8 mb-4">
              <div>Team ID</div>
              <div>Team Name</div>
              <div>Lead Name</div>
              <div>WhatsApp No.</div>
            </div>

            <div className="space-y-3">
              {filteredTeams.map((team, index) => (
                <TeamRow
                  key={team.team_id || index}
                  teamId={team.team_id}
                  teamName={team.team_name}
                  leadName={team.lead_name}
                  whatsappNo={team.whatsapp_no}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MOBILE VIEW */}
      {filteredTeams.length > 0 && (
        <div className="md:hidden space-y-4">
          {filteredTeams.map((team, index) => (
            <TeamCard
              key={team.team_id || index}
              teamId={team.team_id}
              teamName={team.team_name}
              leadName={team.lead_name}
              whatsappNo={team.whatsapp_no}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamsSection;