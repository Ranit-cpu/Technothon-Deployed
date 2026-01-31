import React, { useState, useEffect } from "react";

function TopGlow({ threshold }) {
  const [scrollOpacity, setScrollOpacity] = useState(0.2);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;

      if (threshold === 0) {
        setScrollOpacity(1);
      } else if (scrollTop > threshold) {
        setScrollOpacity(1);
      } else {
        setScrollOpacity(0.2);
      }
    };

    handleScroll();

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  return (
    <div
      className="fixed overflow-hidden top-0 left-1/2 transform -translate-x-1/2 w-[900px] h-[250px] bg-gradient-to-r from-purple-500 via-purple-600 to-pink-600 blur-[120px] rounded-full pointer-events-none transition-all duration-300"
      style={{ zIndex: 1, opacity: scrollOpacity }}
    ></div>
  );
}

export default TopGlow;
