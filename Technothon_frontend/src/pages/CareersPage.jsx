import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import TopGlow from "@/components/design/TopGlow";
import BackgroundGradient from "@/components/design/BackgroundGradient";

export default function CareersPage() {
    const navigate = useNavigate();
    const [isCardsVisible, setIsCardsVisible] = useState(false);
    const cardsRef = useRef(null);

    const [isLoggedIn, setIsLoggedIn] = useState(null); // null = checking, false = not logged in

    // 🔐 Check Login Status
    useEffect(() => {
        const checkLogin = async () => {
            try {
                await axios.get("http://localhost:8000/me", {
                    withCredentials: true,
                });
                setIsLoggedIn(true);
            } catch (err) {
                setIsLoggedIn(false);
                setTimeout(() => navigate("/"), 3000); // Auto redirect after 3 sec
            }
        };

        checkLogin();
    }, [navigate]);

    // 🎞️ Card animation observer
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([e]) => {
                if (e.isIntersecting) {
                    setIsCardsVisible(true);
                    observer.unobserve(e.target);
                }
            },
            { threshold: 0.3 }
        );

        if (cardsRef.current) observer.observe(cardsRef.current);
        return () => cardsRef.current && observer.unobserve(cardsRef.current);
    }, []);

    // ⏳ While checking login state
    if (isLoggedIn === null) {
        return (
            <div className="flex justify-center items-center h-screen text-white text-xl">
                Checking login...
            </div>
        );
    }

    // ❌ Not logged in → show beautiful message
    if (isLoggedIn === false) {
        return (
            <div className="relative min-h-screen w-full bg-[#120026] text-white overflow-hidden flex items-center justify-center px-6">
                <BackgroundGradient />
                <TopGlow threshold={0} />

                <div
                    className="backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-10
          shadow-[0_0_50px_rgba(255,255,255,0.15)] max-w-lg text-center animate-fade-in"
                >
                    <h2 className="text-3xl font-bold text-purple-300 mb-3">
                        You're not logged in!
                    </h2>
                    <p className="text-gray-300 text-sm mb-6">
                        Please log in to access the Careers page.
                        <br />
                        Redirecting you to the home page...
                    </p>
                    <button
                        onClick={() => navigate("/")}
                        className="px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-500 rounded-full text-sm font-medium hover:opacity-90"
                    >
                        Go Back Home
                    </button>
                </div>
            </div>
        );
    }

    // ✅ Logged in → show Careers Page
    return (
        <>
            <Navbar />

            <div className="relative min-h-screen w-full text-white overflow-hidden bg-gradient-to-b from-[#120026] via-[#0a0018] to-[#05000d]">
                <BackgroundGradient />
                <TopGlow threshold={0} />

                {/* Watermark */}
                <div className="absolute inset-0 flex justify-start items-start opacity-[0.08] pointer-events-none">
                    <img
                        src="/images/technothon_nameless.png"
                        className="w-[900px] md:w-[1300px] object-contain relative left-[-15%] top-[-22%]"
                        alt="Technothon Logo"
                    />
                </div>

                {/* Page Content */}
                <div className="relative z-10 flex flex-col items-center px-6 md:px-20 py-30">
                    <h1 className="text-5xl font-extrabold bg-clip-text text-transparent bg-linear-to-r from-gray-200 via-gray-400 to-gray-200 text-center tracking-wide drop-shadow-lg">
                        TECHNOTHON
                    </h1>

                    <h2 className="text-3xl md:text-4xl font-semibold mb-3 text-center mt-2">
                        Join Our Teams
                    </h2>

                    <p className="text-gray-300 max-w-xl text-center mb-16 leading-relaxed">
                        Select a team and start your journey with Technothon.
                    </p>

                    {/* Cards Section */}
                    <section ref={cardsRef} className="w-full max-w-5xl mx-auto mb-24 ">
                        <div
                            className={`grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-12 ${
                                isCardsVisible ? "animate-popout" : ""
                            }`}
                        >
                            {/* Development Team */}
                            <div
                                style={{ animationDelay: "0.05s" }}
                                className="group relative bg-white/5 backdrop-blur-2xl border border-teal-400/30
                rounded-3xl shadow-[0_0_35px_rgba(34,211,238,0.25)] px-10 py-12 text-center
                hover:shadow-[0_0_50px_rgba(34,211,238,0.55)] hover:scale-[1.03]
                transition-all duration-300"
                            >
                                <div className="absolute inset-px rounded-3xl bg-linear-to-br from-white/10 via-white/5 to-transparent opacity-0 group-hover:opacity-100"></div>

                                <div className="relative z-10 flex flex-col items-center">
                                    <span className="text-teal-300 text-6xl mb-6">{`</>`}</span>

                                    <h3 className="text-2xl font-semibold mb-2 tracking-wide">
                                        Development Team
                                    </h3>

                                    <p className="text-gray-300 text-sm mb-6">
                                        Frontend · Backend · Database · UI/UX
                                    </p>

                                    <button
                                        onClick={() => navigate("/apply/development")}
                                        className="w-full py-2.5 rounded-full text-sm font-semibold tracking-wide bg-gradient-to-r from-purple-600 to-pink-500 hover:shadow-lg hover:shadow-purple-500/30 transition"
                                    >
                                        Apply Now
                                    </button>
                                </div>
                            </div>

                            {/* Core Team */}
                            <div
                                style={{ animationDelay: "0.12s" }}
                                className="group relative bg-white/5 backdrop-blur-2xl border border-teal-400/30
                rounded-3xl shadow-[0_0_35px_rgba(34,211,238,0.25)] px-10 py-12 text-center
                hover:shadow-[0_0_50px_rgba(34,211,238,0.55)] hover:scale-[1.03]
                transition-all duration-300"
                            >
                                <div className="absolute inset-px rounded-3xl bg-linear-to-br from-white/10 via-white/5 to-transparent opacity-0 group-hover:opacity-100"></div>

                                <div className="relative z-10 flex flex-col items-center">
                                    <span className="text-teal-300 text-6xl mb-6">👥</span>

                                    <h3 className="text-2xl font-semibold mb-2 tracking-wide">
                                        Core Team
                                    </h3>

                                    <p className="text-gray-300 text-sm mb-6">
                                        Management · Videography · Anchoring · Designing
                                    </p>

                                    <button
                                        onClick={() => navigate("/apply/core")}
                                        className="w-full py-2.5 rounded-full text-sm font-semibold tracking-wide bg-gradient-to-r from-purple-600 to-pink-500 hover:shadow-lg hover:shadow-purple-500/30 transition"
                                    >
                                        Apply Now
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Background faded text */}
                        <div className="absolute left-1/2 -translate-x-1/2 top-[110%] opacity-[0.07] text-[4rem] md:text-[9rem] tracking-widest font-bold select-none">
                            Join Us
                        </div>
                    </section>
                </div>

                <Footer />
            </div>
        </>
    );
}
