// Footer.jsx
import React, { useEffect, useRef, useState } from "react";
import { FaInstagram, FaLinkedin, FaYoutube } from "react-icons/fa";

export default function Footer() {
  const footerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting); // toggles true/false
      },
      { threshold: 0.3 }
    );

    if (footerRef.current) observer.observe(footerRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <div className="pb-6">
      <footer
        ref={footerRef}
        className={`relative z-40 w-full mt-20 px-6 transition-all duration-700 ${
          isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
        }`}
      >
        <div
          className="mx-auto max-w-8xl rounded-[3rem] border border-white/20
          bg-gray-900/50 backdrop-blur-2xl shadow-2xl px-10 py-6
          flex flex-col md:flex-row items-center justify-between gap-8
          transition-all duration-500 hover:scale-[1.005] hover:bg-gray-900/70"
        >
          {/* Left Section */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <div className="flex md:flex-row flex-col relative items-center justify-center gap-6">
              {/* First Logo with glow */}
              <div className="relative flex items-center justify-center">
                <div className="absolute w-16 h-16 bg-violet-500/65 blur-2xl rounded-full"></div>
                <img
                  src="/images/technothon.png"
                  alt="Technothon Logo"
                  className="h-[4.5rem] w-auto relative z-10"
                />
              </div>

              {/* Divider – only visible on md+ */}
              <div className="hidden md:block w-[1px] h-8 bg-white/40 rounded-full"></div>

              <img
                src="/images/tiu.png"
                alt="TIU Logo"
                className="h-[2.5rem] w-auto relative z-10"
              />
            </div>

            <h2 className="mt-4 pt-2 text-3xl tracking-wide font-semibold text-white">
              Technothon
            </h2>
            <p className="mt-1 text-white/70 tracking-wide text-[0.95rem] max-w-[20rem]">
              Empowering students to innovate and shape the future through
              technology and creativity.
            </p>
          </div>

          {/* Right Section - Socials + Extra Note */}
          <div className="flex flex-col items-center gap-4">
            <div className="flex md:flex-row flex-col relative items-center justify-center gap-6">
              {/* Vivarta logo */}
              <a
                  href="/careers"
                  className="
                    px-5 py-2 rounded-xl
                    text-lg font-semibold tracking-wide
                    text-white/90 backdrop-blur-md
                    bg-white/5 border border-white/10
                    shadow-[0_0_15px_rgba(139,92,246,0.25)]

                    transition-all duration-300 ease-out
                    hover:bg-violet-500/20
                    hover:text-white
                    hover:shadow-[0_0_20px_rgba(139,92,246,0.6)]
                    hover:border-violet-500/100
                  "
                >
                  Join Us
              </a>
            </div>
            <div className="flex gap-6">
              <a
                href="https://www.youtube.com/@Technothon-TIU"
                target="_blank"
                rel="noreferrer"
                aria-label="YouTube"
                className="transition transform hover:scale-110"
              >
                <FaYoutube size={28} />
              </a>
              <a
                href="https://www.instagram.com/technothon_/"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="transition transform hover:scale-110"
              >
                <FaInstagram size={28} />
              </a>
              <a
                href="https://www.linkedin.com/company/technothon/"
                target="_blank"
                rel="noreferrer"
                aria-label="LinkedIn"
                className="transition transform hover:scale-110"
              >
                <FaLinkedin size={28} />
              </a>
            </div>

            {/* Extra Note */}
            <p className="text-sm text-white/60 text-center max-w-sm">
              Created for the students of{" "}
              <span className="text-violet-400 font-medium">
                Techno India University
              </span>{" "}
              to gain real-world skills and prepare for successful placements.
            </p>
          </div>
        </div>

        {/* Centered All Rights Reserved */}
        <h5 className="pt-5 text-center text-white/70">
          © {new Date().getFullYear()} Technothon | All Rights Reserved
        </h5>
      </footer>
    </div>
  );
}
