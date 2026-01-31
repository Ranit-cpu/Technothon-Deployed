import React, { useState, useEffect, useRef } from "react";
import Cursor from "./cursorDrone";

const HeroSection = ({ isReady }) => {
  const [isHeroVisible, setIsHeroVisible] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() =>
    window.matchMedia("(min-width: 768px)").matches
  );
  const heroRef = useRef(null);

  // ✅ Detect screen size (desktop vs mobile)
  useEffect(() => {
    const mediaQuery = window.matchMedia("(min-width: 768px)");

    const handleChange = (e) => setIsDesktop(e.matches);
    handleChange(mediaQuery); // set initial value
    mediaQuery.addEventListener("change", handleChange);

    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  // ✅ Intersection Observer for hero visibility
  useEffect(() => {
    if (!heroRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting !== isHeroVisible) {
          setIsHeroVisible(entry.isIntersecting);
        }
      },
      { threshold: 0.2 }
    );

    observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, [isHeroVisible]);

  return (
    <>
      {/* Cursor only for desktop */}
      {isDesktop && <Cursor isVisible={isHeroVisible} isReady={isReady} />}

      <section
        ref={heroRef}
        className={`overflow-hidden min-h-[70vh] flex flex-col items-center justify-center text-center transition-opacity duration-1000 ease-in ${
          isHeroVisible ? "opacity-100" : "opacity-0"
        }`}
      >
        <img
          src="/images/technothon.png"
          alt="Technothon Main Logo"
          className="w-72 mt-35 mb-17 h-auto sm:w-96 not-selectable"
        />
      </section>
    </>
  );
};

export default HeroSection;