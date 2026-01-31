import React, { useEffect, useState, useMemo } from "react";
import { adminApi } from "./adminApi";

/* ---------------- ROW COMPONENT ---------------- */

const AttendanceRow = ({ id, name, cls, whatsapp, user_id, percentage }) => {
  const isLow = percentage < 40;

  return (
    <div
      className={`grid grid-cols-6 items-center p-4 rounded-full transition-colors min-w-[900px]
      ${
        isLow
          ? "bg-red-500/15 hover:bg-red-500/25 border border-red-500/30"
          : "bg-white/5 hover:bg-white/10"
      }`}
    >
      <div className={`font-medium ${isLow ? "text-red-400" : "text-purple-400"}`}>{id}</div>
      <div className={`${isLow ? "text-red-300" : "text-white"}`}>{name}</div>
      <div className={`text-white/60 ${isLow ? "text-red-300/70" : ""}`}>{cls}</div>
      <div className={`text-white/60 ${isLow ? "text-red-300/70" : ""}`}>{whatsapp}</div>
      <div className={`text-white/60 ${isLow ? "text-red-300/70" : ""}`}>{user_id}</div>
      <div
        className={`text-right font-bold pr-8 ${
          isLow ? "text-red-400" : "text-green-400"
        }`}
      >
        {percentage}%
      </div>
    </div>
  );
};

/* ---------------- CARD COMPONENT ---------------- */

const AttendanceCard = ({ id, name, cls, whatsapp, user_id, percentage }) => {
  const isLow = percentage < 40;

  return (
    <div className={`p-4 rounded-2xl space-y-2 ${
      isLow
        ? "bg-red-500/15 border border-red-500/30"
        : "bg-white/5"
    }`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className={`font-bold text-lg ${isLow ? "text-red-300" : "text-white"}`}>{name}</h3>
          <p className="text-xs text-purple-400">{id}</p>
        </div>
        <div className={`font-bold text-xl ${
          isLow ? "text-red-400" : "text-green-400"
        }`}>
          {percentage}%
        </div>
      </div>
      <div className="space-y-1">
        <p className={`text-sm ${isLow ? "text-red-300/80" : "text-white/80"}`}>
          <span className="text-white/50">Class:</span> {cls}
        </p>
        <p className={`text-sm ${isLow ? "text-red-300/70" : "text-white/70"}`}>
          <span className="text-white/50">WhatsApp:</span> {whatsapp}
        </p>
        <p className={`text-sm ${isLow ? "text-red-300/70" : "text-white/70"}`}>
          <span className="text-white/50">User ID:</span> {user_id}
        </p>
      </div>
    </div>
  );
};

/* ---------------- MAIN SECTION ---------------- */

const AttendanceSection = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState("none"); // 'none', 'asc', 'desc'
  const [yearFilter, setYearFilter] = useState("all"); // 'all', '25', '26', '27', etc.
  const [uploading, setUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState("");
  const fileInputRef = React.useRef(null);

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = () => {
    setLoading(true);
    adminApi
      .getUsers()
      .then((data) => {
        const formatted = data.users.map((s) => ({
          id: s.id,
          name: s.name,
          cls: s.class,
          whatsapp: s.whatsapp_no,
          user_id: s.user_id,
          percentage: s.attendance_percentage ?? 0,
        }));

        setStudents(formatted);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to load attendance data");
        setLoading(false);
      });
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.endsWith('.csv')) {
      setError("Please upload a CSV file");
      setTimeout(() => setError(""), 3000);
      return;
    }

    setUploading(true);
    setError("");
    setUploadSuccess("");

    try {
      const formData = new FormData();
      formData.append('file', file);

      // Use adminApi to upload CSV
      await adminApi.uploadTechnothonCsv(formData);

      setUploadSuccess("CSV uploaded successfully!");

      // Reload students after successful upload
      setTimeout(() => {
        loadStudents();
        setUploadSuccess("");
      }, 2000);

    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to upload CSV file");
      setTimeout(() => setError(""), 5000);
    } finally {
      setUploading(false);
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Extract available years from student user_ids
  const availableYears = useMemo(() => {
    const yearSet = new Set();
    students.forEach(student => {
      // Extract year from user_id (e.g., "T25" -> "25", "T26" -> "26")
      const match = student.user_id.match(/^T(\d{2})/);
      if (match) {
        yearSet.add(match[1]);
      }
    });
    // Sort years in descending order (newest first)
    return Array.from(yearSet).sort((a, b) => b.localeCompare(a));
  }, [students]);

  // Get count for each year
  const getYearCount = (year) => {
    return students.filter(s => s.user_id.startsWith(`T${year}`)).length;
  };

  // Filter by year
  const yearFilteredStudents = students.filter((student) => {
    if (yearFilter === "all") return true;
    return student.user_id.startsWith(`T${yearFilter}`);
  });

  // Filter students based on search query (case-insensitive)
  const filteredStudents = yearFilteredStudents.filter((student) => {
    const query = searchQuery.toLowerCase();
    return (
      student.name.toLowerCase().includes(query) ||
      student.id.toLowerCase().includes(query) ||
      student.cls.toLowerCase().includes(query) ||
      student.whatsapp.toLowerCase().includes(query) ||
      student.user_id.toLowerCase().includes(query)
    );
  });

  // Sort filtered students based on attendance percentage
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    if (sortOrder === "asc") {
      return a.percentage - b.percentage;
    } else if (sortOrder === "desc") {
      return b.percentage - a.percentage;
    }
    return 0; // no sorting
  });

  const toggleSort = () => {
    if (sortOrder === "none") {
      setSortOrder("desc");
    } else if (sortOrder === "desc") {
      setSortOrder("asc");
    } else {
      setSortOrder("none");
    }
  };

  // Get year label for display
  const getYearLabel = (year) => {
    return `20${year}`;
  };

  if (loading) {
    return <p className="text-white/60 p-6">Loading attendance...</p>;
  }

  return (
    <div className="p-4 md:p-6">
      <div className="flex flex-col gap-4 mb-6">
        {/* Top Row: Title and Upload Button */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h2 className="text-2xl font-bold">Attendance Overview</h2>

          {/* Upload CSV Button */}
          <div className="flex items-center gap-3">
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
              disabled={uploading}
            />
            <label
              htmlFor="csv-upload"
              className={`px-4 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-full
                       text-white font-medium cursor-pointer transition-all flex items-center gap-2
                       ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {uploading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  <span>Uploading...</span>
                </>
              ) : (
                <>
                  <span>📤</span>
                  <span>Upload CSV</span>
                </>
              )}
            </label>
          </div>
        </div>

        {/* Success/Error Messages */}
        {uploadSuccess && (
          <div className="bg-green-500/20 border border-green-500/50 text-green-300 px-4 py-3 rounded-lg">
            {uploadSuccess}
          </div>
        )}
        {error && (
          <div className="bg-red-500/20 border border-red-500/50 text-red-300 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Year Filter Dropdown and Quick Tabs */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
          {/* Year Dropdown */}
          <div className="relative">
            <select
              value={yearFilter}
              onChange={(e) => setYearFilter(e.target.value)}
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-full
                       text-white font-medium cursor-pointer transition-all
                       focus:outline-none focus:border-purple-500/50 focus:bg-white/10
                       appearance-none pr-10"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='rgba(255,255,255,0.6)'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'right 0.75rem center',
                backgroundSize: '1.25rem'
              }}
            >
              <option value="all" className="bg-gray-900">
                All Years ({students.length})
              </option>
              {availableYears.map(year => (
                <option key={year} value={year} className="bg-gray-900">
                  Batch {getYearLabel(year)} - T{year} ({getYearCount(year)})
                </option>
              ))}
            </select>
          </div>

          {/* Quick Filter Buttons (optional, for frequently used years) */}
          <div className="flex gap-2 flex-wrap">
            <button
              onClick={() => setYearFilter("all")}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                yearFilter === "all"
                  ? "bg-purple-600 text-white"
                  : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
              }`}
            >
              All
            </button>
            {availableYears.slice(0, 3).map(year => (
              <button
                key={year}
                onClick={() => setYearFilter(year)}
                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                  yearFilter === year
                    ? "bg-blue-600 text-white"
                    : "bg-white/5 text-white/60 hover:bg-white/10 hover:text-white"
                }`}
              >
                T{year}
              </button>
            ))}
          </div>
        </div>

        {/* Bottom Row: Sort and Search */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Sort Button */}
          <button
            onClick={toggleSort}
            className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-full
                     text-white hover:bg-white/10 transition-all flex items-center justify-center gap-2
                     focus:outline-none focus:border-purple-500/50"
          >
            <span>Sort by Attendance</span>
            {sortOrder === "none" && <span className="text-white/40">—</span>}
            {sortOrder === "asc" && <span className="text-green-400">↑</span>}
            {sortOrder === "desc" && <span className="text-red-400">↓</span>}
          </button>

          {/* Search Bar */}
          <div className="relative flex-1 max-w-full sm:max-w-md">
            <input
              type="text"
              placeholder="Search by name, ID, class, user ID, or WhatsApp..."
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
        </div>

        {/* Results Count */}
        <p className="text-sm text-white/60">
          Showing {sortedStudents.length} of {yearFilteredStudents.length} students
          {yearFilter !== "all" && ` in T${yearFilter} batch (${getYearLabel(yearFilter)})`}
          {sortOrder !== "none" && ` (sorted ${sortOrder === "asc" ? "low to high" : "high to low"})`}
        </p>
      </div>

      {/* No Results Message */}
      {sortedStudents.length === 0 && (
        <p className="text-white/60 text-center py-8">
          {searchQuery ? `No students found matching "${searchQuery}"` : "No students available"}
        </p>
      )}

      {/* DESKTOP VIEW */}
      {sortedStudents.length > 0 && (
        <div className="hidden md:block overflow-x-auto pb-4">
          <div className="min-w-[700px]">
            <div className="grid grid-cols-6 text-white/60 text-sm font-medium px-8 mb-4">
              <div>Student ID</div>
              <div>Name</div>
              <div>Class</div>
              <div>WhatsApp No.</div>
              <div>User ID</div>
              <div className="text-right">Attendance %</div>
            </div>

            <div className="space-y-3">
              {sortedStudents.map((student) => (
                <AttendanceRow key={student.id} {...student} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MOBILE VIEW */}
      {sortedStudents.length > 0 && (
        <div className="md:hidden space-y-4">
          {sortedStudents.map((student) => (
            <AttendanceCard key={student.id} {...student} />
          ))}
        </div>
      )}
    </div>
  );
};

export default AttendanceSection;