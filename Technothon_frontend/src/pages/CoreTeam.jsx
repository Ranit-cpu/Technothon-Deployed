/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import Navbar from "../components/Navbar";
import TopGlow from "@/components/design/TopGlow";
import BackgroundGradient from "@/components/design/BackgroundGradient";
import Footer from "@/components/Footer";
import {
    FaChartLine,
    FaUsers,
    FaVideo,
    FaPenNib,
    FaShapes,
    FaMicrophoneAlt,
} from "react-icons/fa";

const roles = [
    { title: "Management", tagline: "Lead the future." },
    { title: "Marketing", tagline: "Amplify our voice." },
    { title: "Videography / Photography", tagline: "Capture the moments." },
    { title: "Designing", tagline: "Set the stage." },
    { title: "Decoration", tagline: "Transform the space." },
    { title: "Anchoring", tagline: "Be the voice." },
];

const iconMap = {
    Management: FaUsers,
    Marketing: FaChartLine,
    "Videography / Photography": FaVideo,
    Designing: FaPenNib,
    Decoration: FaShapes,
    Anchoring: FaMicrophoneAlt,
};

const domainMap = {
    Management: "DOM003",
    Marketing: "DOM002",
    "Videography / Photography": "DOM004",
    Designing: "DOM005",
    Decoration: "DOM006",
    Anchoring: "DOM007",
};

const CoreTeamPage = () => {
    const [isCardsVisible, setIsCardsVisible] = useState(false);
    const [activeRole, setActiveRole] = useState(null);
    const [liveStatus, setLiveStatus] = useState({});
    const cardsRef = useRef(null);

    // FORM DATA (with /me auto-fill)
    const [formData, setFormData] = useState({
        fullName: "",
        batch: "",
        studentId: "",
        phone: "",
        email: "",
        resume: "",
        github: "",
        experience: "",
        reason: "",
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState("");

    // -------------------------
    // FETCH USER INFO FROM /me
    // -------------------------
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
                    studentId: user.id || "", // UID
                }));
            } catch (err) {
                console.error("Error loading user info:", err);
            }
        }
        fetchUser();
    }, []);

    // -------------------------
    // FETCH LIVE STATUS FOR ROLES
    // -------------------------
    useEffect(() => {
        async function fetchStatuses() {
            try {
                const results = {};
                for (const role of roles) {
                    const domainId = domainMap[role.title];
                    const res = await fetch(
                        `http://localhost:8000/jobs/filter?domain_id=${domainId}`
                    );
                    const jobs = await res.json();
                    results[role.title] = jobs.some((j) => j.is_live === true);
                }
                setLiveStatus(results);
            } catch (error) {
                console.error("Error fetching roles live status", error);
            }
        }
        fetchStatuses();

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsCardsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.4 }
        );

        if (cardsRef.current) observer.observe(cardsRef.current);
        return () => cardsRef.current && observer.unobserve(cardsRef.current);
    }, []);

    // FORM INPUT HANDLER
    const handleInput = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // SUBMIT APPLICATION
    const submitApplication = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSuccess("");

        try {
            const res = await fetch("http://localhost:8000/applications/apply", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    uid: formData.studentId,
                    job_name: activeRole,
                    resume_link: formData.resume,
                    github_link: formData.github,
                    skills: "",
                    experience: formData.experience,
                    reason: formData.reason,
                }),
            });

            const data = await res.json();

            if (res.ok) {
                setSuccess("Application submitted successfully!");
                setTimeout(() => {
                    setActiveRole(null);
                    setFormData({
                        fullName: "",
                        batch: "",
                        studentId: "",
                        phone: "",
                        email: "",
                        resume: "",
                        github: "",
                        skills:"",
                        experience: "",
                        reason: "",
                    });
                }, 1200);
            } else {
                alert("Something went wrong: " + JSON.stringify(data));
            }
        } catch (err) {
            console.error(err);
            alert("Error submitting application.");
        }

        setLoading(false);
    };

    return (
        <>
            <Navbar />

            <div className="relative w-full min-h-screen overflow-hidden text-white">
                <BackgroundGradient />
                <TopGlow threshold={0} />

                <div className="relative z-10 flex flex-col items-center px-6 md:px-20 py-10">
                    <div className="w-full flex flex-col items-center text-center my-12 text-5xl">
                        <h1 className="font-bold bg-linear-to-r from-gray-200 via-gray-500 to-gray-300 bg-clip-text text-transparent leading-normal">
                            Join Us
                        </h1>
                        <p className="text-2xl text-gray-300 mb-4">
                            Core <span className="text-teal-400 font-semibold">Team</span>
                        </p>
                    </div>

                    <section ref={cardsRef} className="w-full mt-6 mb-24">
                        <div className="text-center mb-10">
                            <h2 className="text-3xl md:text-4xl font-bold bg-linear-to-r from-gray-200 via-gray-500 to-gray-300 bg-clip-text text-transparent">
                                Choose your role
                            </h2>
                        </div>

                        <div
                            className={`grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-8 md:gap-10 max-w-6xl mx-auto opacity-0 ${
                                isCardsVisible ? "animate-popout" : ""
                            }`}
                        >
                            {roles.map((role, index) => {
                                const Icon = iconMap[role.title];
                                return (
                                    <div
                                        key={role.title}
                                        style={{ animationDelay: `${index * 0.08}s` }}
                                        className="relative group rounded-3xl bg-purple-500/5 border border-cyan-400/30 shadow-[0_0_30px_rgba(34,211,238,0.25)] backdrop-blur-xl px-4 py-10 flex flex-col transition-transform duration-300 hover:scale-[1.03]"
                                    >
                                        <div className="relative z-10">
                                            <div className="mb-6 inline-flex items-center justify-center rounded-2xl bg-cyan-500/10 border border-cyan-400/40 p-4">
                                                <Icon className="text-cyan-300 text-2xl" />
                                            </div>

                                            <h3 className="text-xl md:text-2xl font-semibold tracking-wide mb-2">
                                                {role.title}
                                            </h3>

                                            <p className="text-sm md:text-base text-gray-300">
                                                {role.tagline}
                                            </p>
                                        </div>

                                        <button
                                            disabled={!liveStatus[role.title]}
                                            onClick={() => {
                                                if (!liveStatus[role.title]) return;
                                                setActiveRole(role.title);
                                            }}
                                            className={`w-full py-2.5 mt-6 rounded-full text-sm font-semibold
                                                    ${
                                                        liveStatus[role.title]
                                                            ? "bg-gradient-to-r from-purple-600 to-pink-500 shadow-lg"
                                                            : "bg-gray-600 cursor-not-allowed opacity-50"
                                                    }`}
                                        >
                                            {liveStatus[role.title] ? "Apply Now" : "Not Live"}
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </section>
                </div>

                <Footer />
            </div>

            {/* -------- APPLICATION MODAL -------- */}
            {activeRole && (
                <div className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-md flex justify-center items-center animate-fadeIn px-4">
                    <div className="w-full max-w-3xl p-10 rounded-3xl bg-[#140022]/70 border border-purple-500/30 backdrop-blur-2xl shadow-[0_0_60px_rgba(120,0,255,0.45)]">

                        <h2 className="text-center text-3xl font-extrabold text-purple-100">
                            {activeRole.toUpperCase()} APPLICATION
                        </h2>
                        <p className="text-center text-purple-300 mt-1 mb-8">
                            Fill & submit your details
                        </p>

                        <form onSubmit={submitApplication} className="grid grid-cols-1 md:grid-cols-2 gap-6">

                            <input name="fullName" value={formData.fullName} onChange={handleInput} className="formInput" placeholder="Full name" />

                            <input name="batch" value={formData.batch} onChange={handleInput} className="formInput" placeholder="Academic batch" />

                            {/* Student ID auto-filled from /me and locked */}
                            <input
                                name="studentId"
                                value={formData.studentId}
                                readOnly
                                className="formInput bg-gray-800/40 text-gray-400 cursor-not-allowed"
                                placeholder="User ID"
                            />

                            <input name="phone" value={formData.phone} onChange={handleInput} className="formInput" placeholder="Phone number" />

                            <input name="email" value={formData.email} onChange={handleInput} className="formInput" placeholder="Email" />

{/*                             <input name="resume" value={formData.resume} onChange={handleInput} className="formInput" placeholder="Portfolio / Resume link" /> */}

{/*                             <input name="github" value={formData.github} onChange={handleInput} className="formInput" placeholder="GitHub / Code link" /> */}

                            <input name="experience" value={formData.experience} onChange={handleInput} className="formInput" placeholder="Prior experience / Skills" />

                            <input name="reason" value={formData.reason} onChange={handleInput} className="formInput md:col-span-2" placeholder="Why do you want to join Technothon?" />

                            {success && (
                                <p className="text-green-400 text-center md:col-span-2">{success}</p>
                            )}

                            <div className="md:col-span-2 flex gap-4 justify-center mt-4">
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-10 py-3 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full text-white font-semibold shadow-[0_0_25px_rgba(150,0,255,0.6)]"
                                >
                                    {loading ? "Submitting..." : "Submit"}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => setActiveRole(null)}
                                    className="px-6 py-3 bg-transparent border border-purple-500/30 rounded-full text-purple-200 font-medium"
                                >
                                    Close
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
};

export default CoreTeamPage;