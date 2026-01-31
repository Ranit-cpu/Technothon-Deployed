/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import TopGlow from "@/components/design/TopGlow";
import BackgroundGradient from "@/components/design/BackgroundGradient";
import Footer from "../components/Footer";
import { FaCode, FaServer } from "react-icons/fa";

export default function TeamApply() {
  const [showFrontendForm, setShowFrontendForm] = useState(false);
  const [showBackendForm, setShowBackendForm] = useState(false);
  const [cardsVisible, setCardsVisible] = useState(false);
  const cardsRef = useRef(null);
  const [isFrontendLive, setIsFrontendLive] = useState(false);
  const [isBackendLive, setIsBackendLive] = useState(false);

  // -----------------------------
  // /me user auto-fill
  // -----------------------------
  const [formData, setFormData] = useState({
    fullName: "",
    batch: "",
    studentId: "",
    phone: "",
    email: "",
    resume: "",
    github: "",
    experience: "",
    skills: "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch("http://localhost:8000/me", {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) return;

        const user = await res.json();

        setFormData((prev) => ({
          ...prev,
          fullName: user.name || "",
          email: user.email || "",
          studentId: user.id || "",
        }));
      } catch (err) {
        console.error("Failed to load /me:", err);
      }
    }
    fetchUser();
  }, []);

  // -----------------------------
  // Live job status
  // -----------------------------
  useEffect(() => {
    async function fetchLiveStatus() {
      try {
        const frontendRes = await fetch("http://localhost:8000/jobs/filter?domain_id=DOM009");
        const backendRes = await fetch("http://localhost:8000/jobs/filter?domain_id=DOM001");

        const frontendJobs = await frontendRes.json();
        const backendJobs = await backendRes.json();

        setIsFrontendLive(frontendJobs.some(job => job.is_live));
        setIsBackendLive(backendJobs.some(job => job.is_live));

      } catch (err) {
        console.error("Error fetching job status:", err);
      }
    }
    fetchLiveStatus();

    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCardsVisible(true);
          obs.unobserve(entry.target);
        }
      },
      { threshold: 0.3 }
    );
    if (cardsRef.current) obs.observe(cardsRef.current);
    return () => cardsRef.current && obs.unobserve(cardsRef.current);
  }, []);

  // -----------------------------
  // Input handler
  // -----------------------------
  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // -----------------------------
  // Submit handler (shared frontend/backend)
  // -----------------------------
  const submitApplication = async (role) => {
    setLoading(true);
    setSuccess("");

    try {
      const res = await fetch("http://localhost:8000/applications/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid: formData.studentId,
          job_name: role,
          resume_link: formData.resume,
          github_link: formData.github,
          skills: formData.skills,
          experience: formData.experience,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(`${role} application submitted successfully!`);

        setTimeout(() => {
          setShowFrontendForm(false);
          setShowBackendForm(false);
          setFormData({
            fullName: "",
            batch: "",
            studentId: "",
            phone: "",
            email: "",
            resume: "",
            github: "",
            experience: "",
            skills: "",
          });
        }, 1200);
      } else {
        alert("Error: " + JSON.stringify(data));
      }
    } catch (err) {
      console.error(err);
      alert("Submission error.");
    }

    setLoading(false);
  };

  // -----------------------------
  // UI BELOW
  // -----------------------------

  return (
    <>
      <Navbar />
      <div className="relative w-full min-h-screen overflow-hidden text-white">
        <BackgroundGradient />
        <TopGlow threshold={0} />

        <div className="relative z-10 flex flex-col items-center px-6 md:px-20 py-10">

          {/* ============================= */}
          {/* HEADER */}
          {/* ============================= */}
          <div className="w-full flex flex-col items-center text-center my-12 text-5xl">
            <h1 className="font-bold bg-linear-to-r from-gray-200 via-gray-500 to-gray-300 bg-clip-text text-transparent leading-normal inline-block main-section-heading">
              Join Our Tech Team
            </h1>
            <p className="text-2xl text-gray-300 mb-4">
              Development <span className="text-teal-400 font-semibold">Team</span>
            </p>
            <p className="text-base md:text-lg text-gray-400 max-w-2xl">
              Pick a specialization and apply — forms open right on this page.
            </p>
          </div>

          {/* FAINT watermark */}
          <div className="absolute inset-0 flex justify-start items-start z-5 opacity-8 pointer-events-none">
            <img
              src="/mnt/data/7a76d08c-a4e2-4232-b6c2-6c64017519e1.png"
              alt="Technothon Watermark"
              className="w-[800px] md:w-[1200px] object-contain relative left-[-20%] top-[-25%] opacity-10"
            />
          </div>

          {/* ============================= */}
          {/* CARDS */}
          {/* ============================= */}
          <section ref={cardsRef} className="w-full mt-6 mb-12 relative z-10 min-h-[50vh]">
            <div className="text-center mb-10 text-3xl md:text-4xl">
              <h2 className="font-bold bg-linear-to-r from-gray-200 via-gray-500 to-gray-300 bg-clip-text text-transparent second-main-heading leading-normal">
                Development Areas
              </h2>
              <p className="mt-2 text-gray-400 text-sm md:text-base">
                Frontend or Backend — choose and apply. The form will appear here.
              </p>
            </div>

            <div
              className={`grid grid-cols-1 sm:grid-cols-2 gap-8 md:gap-10 max-w-4xl mx-auto opacity-0 ${
                cardsVisible ? "animate-popout" : ""
              }`}
            >
              {/* ---------------- Frontend Card ---------------- */}
              <div
                style={{ animationDelay: "0.06s" }}
                className="relative group rounded-3xl bg-white/5 border border-purple-400/20 backdrop-blur-xl px-8 py-10 hover:scale-[1.03]"
              >
                <div className="relative z-10">
                  <div className="mb-6 inline-flex justify-center rounded-2xl bg-purple-600/10 border border-purple-400/30 p-4">
                    <FaCode className="text-purple-300 text-2xl" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold mb-2">Frontend</h3>
                  <p className="text-sm md:text-base text-gray-300">
                    Craft interactive user experiences.
                  </p>
                </div>

                <button
                  disabled={!isFrontendLive}
                  onClick={() => {
                    if (!isFrontendLive) return;
                    setShowFrontendForm(true);
                    setShowBackendForm(false);
                    window.scrollTo({ top: cardsRef.current.offsetTop, behavior: "smooth" });
                  }}
                  className={`w-full py-2.5 mt-6 rounded-full font-semibold ${
                    isFrontendLive
                      ? "bg-gradient-to-r from-purple-600 to-pink-500 shadow-lg"
                      : "bg-gray-600 cursor-not-allowed opacity-50"
                  }`}
                >
                  {isFrontendLive ? "Apply Now" : "Not Live"}
                </button>
              </div>

              {/* ---------------- Backend Card ---------------- */}
              <div
                style={{ animationDelay: "0.14s" }}
                className="relative group rounded-3xl bg-white/5 border border-purple-400/20 backdrop-blur-xl px-8 py-10 hover:scale-[1.03]"
              >
                <div className="relative z-10">
                  <div className="mb-6 inline-flex justify-center rounded-2xl bg-purple-600/10 border border-purple-400/30 p-4">
                    <FaServer className="text-purple-300 text-2xl" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-semibold mb-2">Backend</h3>
                  <p className="text-sm md:text-base text-gray-300">
                    Build APIs, databases and infra.
                  </p>
                </div>

                <button
                  disabled={!isBackendLive}
                  onClick={() => {
                    if (!isBackendLive) return;
                    setShowBackendForm(true);
                    setShowFrontendForm(false);
                    window.scrollTo({ top: cardsRef.current.offsetTop, behavior: "smooth" });
                  }}
                  className={`w-full py-2.5 mt-6 rounded-full font-semibold ${
                    isBackendLive
                      ? "bg-gradient-to-r from-purple-600 to-pink-500 shadow-lg"
                      : "bg-gray-600 cursor-not-allowed opacity-50"
                  }`}
                >
                  {isBackendLive ? "Apply Now" : "Not Live"}
                </button>
              </div>
            </div>
          </section>

          {/* ============================= */}
          {/* FRONTEND FORM */}
          {/* ============================= */}
          {showFrontendForm && (
            <FormCard
              title="FRONTEND APPLICATION"
              formData={formData}
              setFormData={setFormData}
              loading={loading}
              success={success}
              handleChange={handleChange}
              onSubmit={() => submitApplication("Frontend")}
              onClose={() => setShowFrontendForm(false)}
            />
          )}

          {/* ============================= */}
          {/* BACKEND FORM */}
          {/* ============================= */}
          {showBackendForm && (
            <FormCard
              title="BACKEND APPLICATION"
              formData={formData}
              setFormData={setFormData}
              loading={loading}
              success={success}
              handleChange={handleChange}
              onSubmit={() => submitApplication("Backend")}
              onClose={() => setShowBackendForm(false)}
            />
          )}
        </div>

        <Footer />
      </div>

      <style jsx>{`
        .formInput {
          background: transparent;
          border: 1px solid rgba(180, 0, 255, 0.35);
          padding: 12px 16px;
          border-radius: 10px;
          outline: none;
          color: #e6d4ff;
          box-shadow: 0 0 12px rgba(150, 0, 255, 0.16);
        }
        .formInput:focus {
          border-color: #d28aff;
          box-shadow: 0 0 20px rgba(200, 0, 255, 0.32);
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.45s ease-out; }
      `}</style>
    </>
  );
}



function FormCard({ title, formData, handleChange, onSubmit, onClose, loading, success }) {
  return (
    <div className="mt-6 w-full max-w-3xl p-10 rounded-3xl bg-white/6 border border-purple-500/20 backdrop-blur-xl shadow-[0_0_60px_rgba(120,0,255,0.28)] animate-fadeIn z-20">

      <div className="flex justify-center -mt-16 mb-4">
        <div className="px-8 py-3 bg-[#120038] border border-purple-400/40 rounded-full shadow-[0_0_25px_rgba(150,0,255,0.7)] text-purple-300 font-bold tracking-wide">
          TECHNOTHON
        </div>
      </div>

      <h2 className="text-center text-3xl font-extrabold text-purple-100 mt-4">
        {title}
      </h2>
      <p className="text-center text-purple-300 mt-1 mb-8">
        Fill & submit your details
      </p>

      <form
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit();
        }}
      >
        <input name="fullName" value={formData.fullName} onChange={handleChange} className="formInput" placeholder="Full name" />

        <input name="batch" value={formData.batch} onChange={handleChange} className="formInput" placeholder="Academic batch" />

        {/* Student ID (Locked) */}
        <input name="studentId" value={formData.studentId} readOnly className="formInput bg-gray-800/40 text-gray-400 cursor-not-allowed" placeholder="User ID" />

        <input name="phone" value={formData.phone} onChange={handleChange} className="formInput" placeholder="Phone number" />

        <input name="email" value={formData.email} onChange={handleChange} className="formInput" placeholder="Email address" />

        <input name="resume" value={formData.resume} onChange={handleChange} className="formInput" placeholder="Resume Drive Link" />

        <input name="experience" value={formData.experience} onChange={handleChange} className="formInput" placeholder="Prior experience" />

        <input name="github" value={formData.github} onChange={handleChange} className="formInput" placeholder="GitHub / repo link" />

        <input name="skills" value={formData.skills} onChange={handleChange} className="formInput md:col-span-2" placeholder="Skills" />

        {success && (
          <p className="text-green-400 text-center md:col-span-2">{success}</p>
        )}

        <div className="md:col-span-2 flex gap-4 justify-center mt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-10 py-3 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-3 bg-transparent border border-purple-500/30 rounded-full text-purple-200"
          >
            Close
          </button>
        </div>
      </form>
    </div>
  );
}