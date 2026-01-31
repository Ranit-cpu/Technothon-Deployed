import React, { useRef, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import RobotScene from "./RobotScene";

const RegisterPage = () => {
  const registerModalRef = useRef();
  const navigate = useNavigate();

  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [contactNo, setContactNo] = useState("");
  const [whatsappNo, setWhatsappNo] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [studentIdValid, setStudentIdValid] = useState(false);
  const [studentIdMessage, setStudentIdMessage] = useState("");
  const [studentIdValidating, setStudentIdValidating] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedAnimation, setSelectedAnimation] = useState(4); // idle

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Validate student ID
  useEffect(() => {
    const validateStudentId = async () => {
      const id = studentId.trim();
      if (id.length < 1) {
        setStudentIdMessage("");
        setStudentIdValid(false);
        return;
      }

      setStudentIdValidating(true);
      try {
        const response = await axios.post(
          "http://localhost:8000/validate_student_id",
          { college_id: id }
        );
        if (response.status === 200 && response.data.status === "valid") {
          setStudentIdMessage("Student ID is valid!");
          setStudentIdValid(true);
        }
      } catch (error) {
        const errorMsg =
          error.response?.data?.detail ||
          "Student ID hasn't matched or already registered";
        setStudentIdMessage(errorMsg);
        setStudentIdValid(false);
      } finally {
        setStudentIdValidating(false);
      }
    };

    const debounceTimer = setTimeout(validateStudentId, 500);
    return () => clearTimeout(debounceTimer);
  }, [studentId]);

  // Handle typing → animation 1
  const handleTyping = (setter) => (e) => {
    setter(e.target.value);
    setSelectedAnimation(1);
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    if (!studentIdValid) {
      setErrorMessage("Please enter a valid Student ID!");
      setSelectedAnimation(2);
      return;
    }
    if (!name.trim()) {
      setErrorMessage("Full Name is required!");
      setSelectedAnimation(2);
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match.");
      setSelectedAnimation(2);
      return;
    }
    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long!");
      setSelectedAnimation(2);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post("http://localhost:8000/User_register", {
        college_id: studentId.trim(),
        name: name.trim(),
        email: email.trim(),
        password: password,
        phone_no: contactNo,
        whatsapp_no: whatsappNo,
      });

      if (response.status >= 200 && response.status < 300) {
        setSelectedAnimation(3); // success animation
        setTimeout(() => {
          navigate(response.data.redirect || "/login");
        }, 1000); // small delay to play animation
      }
    } catch (error) {
      console.error("Registration error:", error);
      const errorMsg = error.response?.data?.detail || "Registration failed";
      setErrorMessage("Error: " + errorMsg);
      setSelectedAnimation(2); // failure animation
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full bg-[#130f2a] flex items-center justify-center lg:justify-end px-6 lg:px-20 relative overflow-hidden"
      style={{ fontFamily: "Poppins, sans-serif" }}
    >
      {/* Background */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/images/bg2.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: "scaleX(-1)",
        }}
      ></div>

      {/* Robot */}
       <div className="absolute inset-0 z-0 pointer-events-none xl:block hidden mr-50">
         <RobotScene selectedAnimation={selectedAnimation} />
       </div>

      {/* Registration Card */}
      <div
        ref={registerModalRef}
        className="backdrop-blur-lg bg-white/5 border border-white/10 text-white px-6 py-5 md:p-8 rounded-3xl shadow-2xl w-full max-w-lg lg:ml-20 z-10 relative animate-slide-in-right"
      >
        <button
          onClick={() => navigate("/")}
          className="absolute top-4 left-4 text-gray-300 hover:text-purple-400 transition-colors z-10 p-2 rounded-full hover:bg-white/10"
          aria-label="Go back to home"
        >
          <FaArrowLeft size={20} />
        </button>

        <h2 className="text-2xl md:text-3xl font-bold mb-2 text-purple-300 pt-8">
          Create an Account
        </h2>
        <p className="text-sm mb-3 text-gray-300">
          Already have an account?{" "}
          <Link to="/login" className="text-purple-200 hover:underline">
            Log in
          </Link>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              placeholder="Student ID"
              value={studentId}
              onChange={handleTyping(setStudentId)}
              className="w-full px-4 py-2 rounded-lg bg-[#2b1e4a] border border-purple-700/40 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
              required
            />
            {studentIdValidating && (
              <p className="text-blue-400 text-xs mt-1">Validating...</p>
            )}
            {studentIdMessage && (
              <p
                className={`text-xs mt-1 font-medium ${
                  studentIdValid ? "text-green-400" : "text-red-400"
                }`}
              >
                {studentIdMessage}
              </p>
            )}
          </div>

          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={handleTyping(setName)}
            className="w-full px-4 py-2 rounded-lg bg-[#2b1e4a] border border-purple-700/40 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
            disabled={!studentIdValid}
            required
          />

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={handleTyping(setEmail)}
            className="w-full px-4 py-2 rounded-lg bg-[#2b1e4a] border border-purple-700/40 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
            disabled={!studentIdValid}
            required
          />

          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="tel"
              placeholder="Contact No"
              value={contactNo}
              onChange={handleTyping(setContactNo)}
              className="flex-1 px-4 py-2 rounded-lg bg-[#2b1e4a] border border-purple-700/40 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
              disabled={!studentIdValid}
              maxLength={10}
              required
            />
            <input
              type="tel"
              placeholder="WhatsApp No"
              value={whatsappNo}
              onChange={handleTyping(setWhatsappNo)}
              className="flex-1 px-4 py-2 rounded-lg bg-[#2b1e4a] border border-purple-700/40 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
              disabled={!studentIdValid}
              maxLength={10}
              required
            />
          </div>

          <p className="text-xs text-gray-400 mt-0 mb-2">
            (If same as contact, fill same number in both)
          </p>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={handleTyping(setPassword)}
              className="w-full px-4 py-2 rounded-lg bg-[#2b1e4a] border border-purple-700/40 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
              disabled={!studentIdValid}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-[12px] text-gray-300 hover:text-purple-400 focus:outline-none"
              tabIndex={-1}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={handleTyping(setConfirmPassword)}
              className="w-full px-4 py-2 rounded-lg bg-[#2b1e4a] border border-purple-700/40 text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
              disabled={!studentIdValid}
              required
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-[12px] text-gray-300 hover:text-purple-400 focus:outline-none"
              tabIndex={-1}
            >
              {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <div className="flex items-start gap-2 pt-1">
            <input type="checkbox" className="mt-1" />
            <span className="text-xs">
              I agree to the{" "}
              <a href="#" className="text-purple-200 underline">
                Terms &amp; Conditions
              </a>
            </span>
          </div>

          {errorMessage && (
            <p className="text-sm text-red-400 font-medium mb-1">{errorMessage}</p>
          )}

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-purple-600 to-indigo-500 hover:opacity-90 text-white py-2 rounded-lg transition"
            disabled={!studentIdValid || loading}
          >
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
