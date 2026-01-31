import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

const CurrentTeam = () => {
  const navigate = useNavigate();
  const [team, setTeam] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await axios.get("http://localhost:8000/dashboard", {
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          withCredentials: true,
        });
        setUser(res.data.user);
        setTeam(res.data.team);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError(
          err.response?.data?.detail || "Failed to load dashboard data."
        );
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handlePayNow = async () => {
    try {
      const res = await axios.post(
        `http://localhost:8000/admin/approve_team/${team.tid}`
      );
      alert("Payment approved! Reloading...");
      window.location.reload();
    } catch (err) {
      console.error(err);
      alert("Failed to approve payment.");
    }
  };

  const handleLogout = () => {
    axios.post("http://localhost:8000/logout", {}, { withCredentials: true });
    navigate("/login");
  };

  if (loading) return <div className="text-white p-8">Loading...</div>;
  if (error) return <div className="text-red-500 p-8">{error}</div>;

  return (
    <div
      className="min-h-screen text-white font-sans bg-cover bg-center"
      style={{ backgroundImage: "url('/images/bg2.png')" }}
    >
      {/* Navbar */}
      <nav className="flex items-center justify-between p-6 lg:px-8 fixed w-full top-0 z-50 bg-transparent">
        {/* Left - Logo */}
        <div className="flex lg:flex-1">
          <Link to="/" className="-m-1.5 p-1.5 flex items-center">
            <img
              src="/images/technothon.png"
              alt="Logo"
              className="h-8 w-auto"
            />
          </Link>
        </div>

        {/* Middle - Blurred Links Section */}
        <div className="hidden lg:flex gap-x-12 px-6 py-2 rounded-xl backdrop-blur-md bg-white/10 border border-white/10 shadow-sm">
          <Link
            to="/home"
            className="text-sm font-medium text-white hover:text-violet-400"
          >
            Home
          </Link>
          <Link
            to="/events"
            className="text-sm font-medium text-white hover:text-violet-400"
          >
            Events
          </Link>
          <Link
            to="/about"
            className="text-sm font-medium text-white hover:text-violet-400"
          >
            About
          </Link>
          <Link
            to="/contact"
            className="text-sm font-medium text-white hover:text-violet-400"
          >
            Contact
          </Link>
        </div>

        {/* Right - Logout Link */}
        <div className="hidden lg:flex lg:flex-1 lg:justify-end">
          <button
            onClick={handleLogout}
            className="text-sm font-medium text-white hover:text-violet-400"
          >
            Log out <span aria-hidden="true">→</span>
          </button>
        </div>
      </nav>

      {/* Page Content */}
      <main className="max-w-3xl mx-auto px-6 py-28"> {/* Add py-28 to avoid navbar overlap */}
        <h1 className="text-3xl mb-2 text-gray-100">
          Welcome, {user?.Name || "User"}!
        </h1>
        <p className="text-gray-300 mb-8">Your account details:</p>

        <div className="bg-white/10 p-6 rounded-xl shadow-lg mb-8">
          <div className="mb-4">
            <span className="font-bold text-indigo-300">ID:</span> {user?.uid}
          </div>
          <div className="mb-4">
            <span className="font-bold text-indigo-300">Email:</span>{" "}
            {user?.email}
          </div>
          <div className="mb-4">
            <span className="font-bold text-indigo-300">Batch:</span>{" "}
            {user?.Batch}
          </div>
          <div className="mb-4">
            <span className="font-bold text-indigo-300">
              Overall Percentage:
            </span>{" "}
            {user?.Overall_Percentage}%
          </div>
        </div>

        {team ? (
          <div className="bg-white/10 p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl text-indigo-300 mb-4">Your Team Details</h2>
            <div className="mb-4">
              <span className="font-bold text-indigo-300">Team Name:</span>{" "}
              {team.name}
            </div>
            <div className="mb-4">
              <span className="font-bold text-indigo-300">Team ID:</span>{" "}
              {team.tid}
            </div>
            <div className="mb-4">
              <span className="font-bold text-indigo-300">Idea Title:</span>{" "}
              {team.idea_title}
            </div>
            <div className="mb-4">
              <span className="font-bold text-indigo-300">
                Idea Description:
              </span>{" "}
              {team.idea_description}
            </div>
            <div className="mb-4">
              <span className="font-bold text-indigo-300">Created At:</span>{" "}
              {new Date(team.created_at).toLocaleString()}
            </div>

            <div className="border-t border-white/10 pt-6 mt-4">
              <h3 className="text-indigo-300 text-lg mb-2">Payment Status</h3>
              <div className="text-lg font-bold text-white mb-3">
                Registration Fee: ₹500
              </div>

              {team.registered === true ||
              team.registered === 1 ||
              team.registered === "1" ? (
                <div className="text-green-500 font-semibold">
                  ✅ Payment successful – Your team is registered!
                </div>
              ) : (
                <div className="text-red-500 font-semibold">
                  ❌ Payment pending – Please wait for the admin to approve.
                </div>
              )}

              <button
                onClick={handlePayNow}
                className={`mt-4 px-4 py-2 rounded text-white ${
                  team.registered === true ||
                  team.registered === 1 ||
                  team.registered === "1"
                    ? "bg-gray-500 cursor-not-allowed opacity-60"
                    : "bg-green-600 hover:bg-green-700"
                }`}
                disabled={
                  team.registered === true ||
                  team.registered === 1 ||
                  team.registered === "1"
                }
                title={
                  team.registered === true ||
                  team.registered === 1 ||
                  team.registered === "1"
                    ? "Already approved"
                    : "Click to request admin approval"
                }
              >
                💳 Pay Now
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-white/10 p-6 rounded-xl shadow-lg text-center">
            <h2 className="text-2xl text-indigo-300 mb-4">Team Registration</h2>
            <p className="text-gray-300 mb-4">
              You are not part of any team yet.
            </p>
            <p className="text-gray-300 mb-6">
              Create or join a team to participate in the Technothon!
            </p>
            <a
              href="/team-registration"
              className="inline-block px-5 py-2 bg-indigo-500 hover:bg-indigo-600 rounded-md font-bold text-white transition-transform duration-300 transform hover:-translate-y-1"
            >
              🚀 Create Your Team
            </a>
          </div>
        )}
      </main>
    </div>
  );
};

export default CurrentTeam;
