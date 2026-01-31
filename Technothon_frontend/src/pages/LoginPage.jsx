import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { FcGoogle } from "react-icons/fc";
import {
  FaGithub,
  FaLinkedin,
  FaEye,
  FaEyeSlash,
  FaArrowLeft,
} from "react-icons/fa";
import RobotScene from "./RobotScene";

const LoginPage = () => {
  const navigate = useNavigate();

  /* ---------------- LOGIN ---------------- */
  const [formData, setFormData] = useState({ email: "", password: "" });

  /* ---------------- FORGOT PASSWORD ---------------- */
  const [showForgot, setShowForgot] = useState(false);
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState("");
  const [verifiedUserId, setVerifiedUserId] = useState(null);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  /* ---------------- UI ---------------- */
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [selectedAnimation, setSelectedAnimation] = useState(4);

  /* ---------------- LOGIN ---------------- */
  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(
        "http://localhost:8000/api/User_login",
        formData,
        { withCredentials: true }
      );

      if (res.data.success) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        setSelectedAnimation(3);
        setTimeout(() => navigate("/user"), 800);
      } else {
        setSelectedAnimation(2);
        setError("Login failed");
      }
    } catch {
      setSelectedAnimation(2);
      setError("Invalid credentials");
    }
  };

  /* ---------------- STEP 1: VERIFY USER ---------------- */
  const verifyUser = async () => {
    setError("");
    setMessage("");

    if (!email || !userId) {
      setError("Email and Student ID required");
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:8000/auth/check-user-id",
        { user_id: userId, email }
      );

      setVerifiedUserId(res.data.user_id);
      setMessage("User verified. You can reset password.");
    } catch (err) {
      setError(err.response?.data?.detail || "Verification failed");
    }
  };

  /* ---------------- STEP 2: RESET PASSWORD ---------------- */
  const resetPassword = async () => {
    setError("");
    setMessage("");

    if (!newPassword || !confirmPassword) {
      setError("All fields required");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      await axios.put("http://localhost:8000/auth/forget-password", {
        user_id: verifiedUserId,
        new_password: newPassword,
        reenter_password: confirmPassword,
      });

      setMessage("Password reset successfully. Please login.");
      //setSelectedAnimation(3);

      setTimeout(() => {
        setShowForgot(false);
        setVerifiedUserId(null);
        setEmail("");
        setUserId("");
        setNewPassword("");
        setConfirmPassword("");
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.detail || "Reset failed");
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#130f2a] flex items-center justify-center lg:justify-end px-6 lg:px-20 relative overflow-hidden">

      {/* Background */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/images/bg2.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: "scaleX(-1)",
        }}
      />

      {/* Robot */}
      {/*<div className="absolute inset-0 pointer-events-none xl:block hidden">*/}
      {/*  <RobotScene selectedAnimation={selectedAnimation} />*/}
      {/*</div>*/}

      {/* CARD */}
      <div className="backdrop-blur-lg bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl shadow-lg w-full max-w-md z-10">

        <button onClick={() => navigate("/")} className="text-gray-300 mb-3">
          <FaArrowLeft />
        </button>

        <h2 className="text-3xl font-bold text-purple-300 mb-3">
          {showForgot ? "Reset Password" : "Sign In"}
        </h2>

        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
        {message && <p className="text-green-400 text-sm mb-2">{message}</p>}

        {/* ---------------- LOGIN FORM ---------------- */}
        {!showForgot && (
          <>
            <form onSubmit={handleLogin} className="space-y-4">
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 rounded-lg bg-[#2b1e4a] text-white border border-purple-700/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                required
              />

              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  className="w-full px-4 py-2 rounded-lg bg-[#2b1e4a] text-white border border-purple-700/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-[15px] text-gray-300 hover:text-purple-400 focus:outline-none"
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>

              <div className="flex justify-between text-sm">
                <button
                  type="button"
                  onClick={() => setShowForgot(true)}
                  className="text-purple-300"
                >
                  Forgot password?
                </button>
                <button className="px-4 py-2 rounded-lg text-white font-medium transition duration-200 bg-gradient-to-r from-purple-600 to-indigo-500 hover:opacity-90">
                  Login
                </button>
              </div>
            </form>

            {/* ✅ RESTORED REGISTER LINK */}
            <p className="text-sm text-gray-300 mt-3 py-4">
              Don’t have an account?{" "}
              <Link
                to="/signup"
                className="text-purple-300 hover:underline"
              >
                Create now
              </Link>
            </p>
          </>
        )}

        {/* ---------------- RESET FLOW ---------------- */}
        {showForgot && (
          <div className="space-y-3">
            {!verifiedUserId ? (
              <>
                <input
                  type="email"
                  placeholder="Registered Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-[#2b1e4a] text-white border border-purple-700/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="text"
                  placeholder="User ID (UID)"
                  value={userId}
                  onChange={(e) => setUserId(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-[#2b1e4a] text-white border border-purple-700/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={verifyUser}
                  className="w-full bg-purple-600 px-4 py-2 rounded-lg"
                >
                  Verify
                </button>
              </>
            ) : (
              <>
                <input
                  type="password"
                  placeholder="New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-[#2b1e4a] text-white border border-purple-700/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2 rounded-lg bg-[#2b1e4a] text-white border border-purple-700/40 focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <button
                  onClick={resetPassword}
                  className="w-full bg-purple-600 px-4 py-2 rounded-lg"
                >
                  Update Password
                </button>
              </>
            )}

            <button
              onClick={() => setShowForgot(false)}
              className="text-sm text-gray-300"
            >
              Back to login
            </button>
          </div>
        )}

        {/* SOCIAL */}
        <div className="flex gap-4 mb-4">
          <button className="p-2 bg-[#2b1e4a] rounded-lg hover:bg-white/10 transition duration-200">
            <FcGoogle size={20}/>
          </button>
          <button className="p-2 bg-[#2b1e4a] rounded-lg hover:bg-white/10 transition duration-200">
            <FaGithub size={20} color="#ffffff" />
          </button>
          <button className="p-2 bg-[#2b1e4a] rounded-lg hover:bg-white/10 transition duration-200">
            <FaLinkedin size={20} color="#0077b5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
