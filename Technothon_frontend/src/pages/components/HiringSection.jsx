import React, { useEffect, useState } from "react";
import {
  Code,
  Server,
  Palette,
  Users,
  Megaphone,
  Video,
  Sparkles,
  MoreHorizontal,
  Search,
  Filter,
  UserPlus,
  ArrowLeft,
  Briefcase,
  X,
  Download,
} from "lucide-react";
import { adminApi } from "./adminApi";

/* ICON MAP */
const iconMap = {
  Code,
  Server,
  Palette,
  Users,
  Megaphone,
  Video,
  Sparkles,
};

const RoleCard = ({ role, onClick }) => {
  const Icon = iconMap[role.icon] || Briefcase;

  const domainName = role.domain_name || role.role || role.name || "Unknown Domain";
  const applicationCount = role.application_count || role.applicants_count || role.count || 0;
  const domainId = role.domain_id || role.id;

  return (
    <div
      onClick={onClick}
      className="bg-[#1a1025] border border-white/5 p-4 md:p-5 rounded-2xl hover:border-purple-500/50 transition cursor-pointer"
    >
      <div className="flex justify-between mb-3 md:mb-4">
        <div className="p-2 md:p-2.5 bg-white/5 rounded-xl text-purple-400">
          <Icon size={20} className="md:w-6 md:h-6" />
        </div>
        <MoreHorizontal className="text-white/30" size={20} />
      </div>

      <h3 className="text-base md:text-lg font-semibold">{domainName}</h3>
      <p className="text-xs md:text-sm text-white/50">
        {applicationCount} applications
      </p>

      <div className="mt-3 md:mt-4">
        <div className="flex justify-between text-xs text-white/70 mb-1">
          <span>Applications</span>
          <span>{applicationCount}</span>
        </div>
        <div className="h-1.5 bg-white/5 rounded-full">
          <div
            className="h-full bg-purple-500 rounded-full"
            style={{
              width: `${Math.min(100, (applicationCount / 50) * 100)}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
};

const CandidateRow = ({ applicant }) => {
  const renderField = (key, value) => {
    if (key === 'id' || key === 'domain_id') return null;

    const formattedKey = key
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');

    return (
      <div key={key} className="mb-2">
        <span className="text-xs text-white/40">{formattedKey}: </span>
        <span className="text-xs md:text-sm text-white/80">{value || 'N/A'}</span>
      </div>
    );
  };

  return (
    <tr className="hover:bg-white/5 border-b border-white/5">
      <td className="p-3 md:p-4" colSpan="4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 md:gap-3">
          {Object.entries(applicant).map(([key, value]) => renderField(key, value))}
        </div>
      </td>
    </tr>
  );
};

const HiringSection = () => {
  const [roles, setRoles] = useState([]);
  const [selectedRole, setSelectedRole] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [newRole, setNewRole] = useState({
    role: "",
    icon: "Code",
    totalPositions: 1,
  });

  /* FETCH ROLES */
  useEffect(() => {
    setLoading(true);
    setError(null);
    adminApi.getHiringRoles()
      .then(data => {
        console.log("Received roles data:", data);
        const rolesArray = Array.isArray(data) ? data : (data.data || data.roles || []);
        setRoles(rolesArray);
      })
      .catch(err => {
        console.error("Failed to fetch roles:", err);
        setError("Failed to load domains. Please try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  /* FETCH APPLICANTS */
  useEffect(() => {
    if (!selectedRole) return;
    setLoading(true);
    setError(null);

    const domainId = selectedRole.domain_id || selectedRole.id;
    console.log("Fetching applicants for domain ID:", domainId);

    adminApi.getRoleApplicants(domainId)
      .then(data => {
        console.log("Received applicants data:", data);
        const applicantsArray = Array.isArray(data) ? data : (data.data || data.applications || []);
        setApplicants(applicantsArray);
      })
      .catch(err => {
        console.error("Failed to fetch applicants:", err);
        setError("Failed to load applications. Please try again.");
      })
      .finally(() => setLoading(false));
  }, [selectedRole]);

  const handleCreateRole = async (e) => {
    e.preventDefault();
    try {
      const created = await adminApi.createHiringRole({
        role: newRole.role,
        icon: newRole.icon,
        total_positions: newRole.totalPositions,
      });
      setRoles((prev) => [...prev, created]);
      setIsModalOpen(false);
      setNewRole({ role: "", icon: "Code", totalPositions: 1 });
    } catch (err) {
      console.error("Failed to create role:", err);
      alert("Failed to create role. Please try again.");
    }
  };

  /* DOWNLOAD APPLICATIONS */
  const handleDownloadApplications = async () => {
    if (!selectedRole) return;

    const domainId = selectedRole.domain_id || selectedRole.id;
    const domainName = selectedRole.domain_name || selectedRole.role || selectedRole.name || "domain";

    try {
      await adminApi.downloadApplications(domainId, domainName);
    } catch (err) {
      console.error("Failed to download applications:", err);
      alert("Failed to download applications. Please try again.");
    }
  };

  const filteredApplicants = applicants.filter((a) => {
    const searchLower = searchQuery.toLowerCase();
    return Object.values(a).some(value =>
      String(value).toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-4 md:space-y-6 h-full flex flex-col">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 md:gap-4">
        <div className="flex items-center gap-3">
          {selectedRole && (
            <button
              onClick={() => setSelectedRole(null)}
              className="p-2 hover:bg-white/5 rounded-lg transition"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <div>
            <h2 className="text-xl md:text-2xl font-bold">
              {selectedRole
                ? (selectedRole.domain_name || selectedRole.role || selectedRole.name || "Domain Details")
                : "Hiring Portal"}
            </h2>
            {selectedRole && (
              <span className="text-xs md:text-sm text-white/50">
                ({applicants.length} applications)
              </span>
            )}
          </div>
        </div>

        {!selectedRole && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center gap-2 bg-purple-600 px-4 py-2 rounded-lg hover:bg-purple-700 transition w-full sm:w-auto"
          >
            <UserPlus size={16} />
            <span className="text-sm md:text-base">Create Role</span>
          </button>
        )}

        {selectedRole && (
          <button
            onClick={handleDownloadApplications}
            className="flex items-center justify-center gap-2 bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700 transition w-full sm:w-auto"
          >
            <Download size={16} />
            <span className="text-sm md:text-base">Download Applications</span>
          </button>
        )}
      </div>

      {/* ERROR STATE */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 md:p-4 text-sm md:text-base text-red-400">
          {error}
        </div>
      )}

      {/* LOADING STATE */}
      {loading && (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
        </div>
      )}

      {/* ROLE GRID */}
      {!selectedRole && !loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
          {roles.map((r, index) => (
            <RoleCard
              key={r.domain_id || r.id || index}
              role={r}
              onClick={() => setSelectedRole(r)}
            />
          ))}
          {roles.length === 0 && !error && (
            <div className="col-span-full text-center py-12 text-white/40 text-sm md:text-base">
              No domains found
            </div>
          )}
        </div>
      )}

      {/* APPLICANTS TABLE */}
      {selectedRole && !loading && (
        <div className="bg-[#1a1025] border border-white/5 rounded-2xl overflow-hidden flex-1 flex flex-col">
          <div className="p-3 md:p-4 border-b border-white/5">
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search applications..."
              className="bg-[#0f0418] border border-white/10 rounded-lg px-3 md:px-4 py-2 text-xs md:text-sm w-full"
            />
          </div>

          <div className="overflow-auto flex-1">
            <table className="w-full">
              <thead className="bg-[#12061f] text-xs text-white/50 sticky top-0">
                <tr>
                  <th className="p-3 md:p-4 text-left" colSpan="4">Application Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredApplicants.map((applicant, index) => (
                  <CandidateRow key={applicant.id || index} applicant={applicant} />
                ))}
                {filteredApplicants.length === 0 && (
                  <tr>
                    <td colSpan="4" className="p-6 md:p-8 text-center text-white/40 text-sm md:text-base">
                      No applications found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE ROLE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#1e122b] w-full max-w-md rounded-xl">
            <div className="p-4 md:p-5 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-base md:text-lg font-semibold">Create Role</h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 hover:bg-white/5 rounded transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateRole} className="p-4 md:p-5 space-y-4">
              <input
                required
                placeholder="Role name"
                className="w-full bg-[#0f0418] border border-white/10 rounded-lg px-3 md:px-4 py-2 text-xs md:text-sm"
                value={newRole.role}
                onChange={(e) =>
                  setNewRole({ ...newRole, role: e.target.value })
                }
              />

              <select
                value={newRole.icon}
                onChange={(e) =>
                  setNewRole({ ...newRole, icon: e.target.value })
                }
                className="w-full bg-[#0f0418] border border-white/10 rounded-lg px-3 md:px-4 py-2 text-xs md:text-sm"
              >
                {Object.keys(iconMap).map((k) => (
                  <option key={k}>{k}</option>
                ))}
              </select>

              <input
                type="number"
                min="1"
                placeholder="Total positions"
                value={newRole.totalPositions}
                onChange={(e) =>
                  setNewRole({
                    ...newRole,
                    totalPositions: Number(e.target.value),
                  })
                }
                className="w-full bg-[#0f0418] border border-white/10 rounded-lg px-3 md:px-4 py-2 text-xs md:text-sm"
              />

              <button
                type="submit"
                className="w-full bg-purple-600 py-2.5 rounded-lg hover:bg-purple-700 transition text-sm md:text-base"
              >
                Create Role
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default HiringSection;