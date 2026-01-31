/* Admin API */

const BASE_URL = "http://localhost:8000/api/admin";

const jsonFetch = async (url, options = {}) => {
  const res = await fetch(url, {
    credentials: "include", // 🔥 ALWAYS send session cookie
    ...options,
  });

  // Auto-handle unauthorized
  if (res.status === 401) {
    throw new Error("Unauthorized");
  }

  return res.json();
};


export const adminApi = {
  /* ---------------- AUTH / SESSION ---------------- */
  
  // ✅ REQUIRED FOR DASHBOARD GUARD
  checkSession: () =>
    jsonFetch(`${BASE_URL}/profile`),

  getProfile: () =>
    jsonFetch(`${BASE_URL}/profile`),

  logout: async () => {
    const res = await fetch(`${BASE_URL}/logout`, {
      method: "POST",
      credentials: "include",
    });

    if (!res.ok) throw new Error("Logout failed");
    return res.json();
  },

  /* ---------------- DASHBOARD ---------------- */
async getLiveEvents() {
    const res = await fetch(`http://localhost:8000/api/events`, {
      credentials: "include",
    });

    if (!res.ok) throw new Error("Failed to fetch events");
    return res.json();
  },
  getDashboardStats: () =>
    jsonFetch(`${BASE_URL}`),

  getChartsData: () =>
    jsonFetch(`${BASE_URL}/charts_data`),

  getApplicationsCount: () =>
    jsonFetch(`${BASE_URL}/applications/count`),
  
  getStudentsCount: () =>
    jsonFetch(`${BASE_URL}/users/count`),

  /* ---------------- EVENTS ---------------- */
  
  async getEvents() {
    const res = await fetch(`${BASE_URL}/getAllEvents`, {
      credentials: "include",
    });

    if (!res.ok) throw new Error("Failed to fetch events");
    return res.json();
  },

  async createEvent(data) {
    const res = await fetch(`${BASE_URL}/event/createEvent`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to create event");
    return res.json();
  },

  async deleteEvent(id) {
  const res = await fetch(`${BASE_URL}/events/${id}/delete`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to delete event");
  return res.json();
},

  async updateEventLiveStatus(eventId, isLive) {
    const res = await fetch(`${BASE_URL}/events/${eventId}/live-status`, {
      method: "PATCH",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ is_live: isLive }),
    });

    if (!res.ok) throw new Error("Failed to update event live status");
    return res.json();
  },

  /* ---------------- TEAMS ---------------- */

  getTeams: () =>
    jsonFetch(`${BASE_URL}/teams`),

  getPendingTeams: () =>
    jsonFetch(`${BASE_URL}/pending_teams`),

  approveTeam: (id) =>
    fetch(`${BASE_URL}/approve_team/${id}`, {
      method: "POST",
      credentials: "include",
    }),

  rejectTeam: (id) =>
    fetch(`${BASE_URL}/reject_team/${id}`, {
      method: "POST",
      credentials: "include",
    }),

  /* ---------------- PAYMENTS ---------------- */

  getPayments: () =>
    jsonFetch(`${BASE_URL}/payments`),

  /* ---------------- PARTICIPANTS ---------------- */

  getParticipants: () =>
    jsonFetch(`${BASE_URL}/participants/details`),

  getUsers: () =>
    jsonFetch(`${BASE_URL}/getAllUsers`),

  /* ---------------- TECHNOTHON CSV UPLOAD ---------------- */

  uploadTechnothonCsv: async (formData) => {
    const res = await fetch(`${BASE_URL}/technothon`, {
      method: "POST",
      credentials: "include",
      body: formData, // FormData automatically sets Content-Type with boundary
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Failed to upload CSV");
    }

    return res.json();
  },

  /* ---------------- GALLERY ---------------- */

  getGallery: () =>
    jsonFetch(`${BASE_URL}/gallery_data`),

  /* ---------------- HIRING ---------------- */

  getHiringRoles: () =>
    jsonFetch(`${BASE_URL}/applications_per_domain`),

  createHiringRole: (data) =>
    fetch(`${BASE_URL}/hiring/roles`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    }).then(res => res.json()),

  getRoleApplicants: (roleId) =>
    jsonFetch(`${BASE_URL}/applications_by_domain_id/${roleId}`),

  downloadApplications: async (domainId, domainName = "domain") => {
    try {
      const res = await fetch(`http://localhost:8000/api/applications/applied/${domainName}/download`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to download applications");

      // Get the blob from the response
      const blob = await res.blob();

      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);

      // Create a temporary anchor element and trigger download
      const a = document.createElement('a');
      a.href = url;
      a.download = `${domainName}_applications.csv`;
      document.body.appendChild(a);
      a.click();

      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Download failed:", err);
      throw err;
    }
  },

  /* ---------------- STATS ---------------- */

  getStudentParticipation: () =>
    jsonFetch(`${BASE_URL}/stats/student-participation`),

  getUnitTeamPerformance: () =>
    jsonFetch(`${BASE_URL}/stats/unit-team-performance`),
};