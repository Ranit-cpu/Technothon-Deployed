import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FiMenu, FiX } from "react-icons/fi";
import { FaArrowUp, FaUserCircle } from "react-icons/fa";
import axios from "axios";

const Navbar = ({ show = true }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // State for user authentication
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  const [menuOpen, setMenuOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [isBall, setIsBall] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const userMenuRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const mobileNavRef = useRef(null);

  // Check user authentication on mount
  useEffect(() => {
    checkUserAuth();
  }, [location.pathname]);

  // Check if user is authenticated via session
  const checkUserAuth = async () => {
    try {
      const response = await axios.get("http://localhost:8000/me", {
        withCredentials: true,
      });

      if (response.data && response.data.id) {
        setUser(response.data);
      } else {
        setUser(null);
      }
    } catch (error) {
      // User not authenticated
      setUser(null);
    } finally {
      setIsCheckingAuth(false);
    }
  };

  useEffect(() => {
    setIsLoaded(true);

    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      setScrolled(currentScrollY > 50);
      if (currentScrollY > 300) {
        setShowNavbar(false);
        setIsBall(true);
      } else {
        setShowNavbar(true);
        setIsBall(false);
      }
    };

    const handleOutsideClick = (event) => {
      if (
        mobileNavRef.current &&
        !mobileNavRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setUserMenuOpen(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  // ✅ PROPER LOGOUT FUNCTION WITH BACKEND API CALL
  const handleLogout = async () => {
    try {
      // Call backend logout endpoint to clear session
      await axios.post(
        "http://localhost:8000/logout",
        {},
        { withCredentials: true }
      );

      // Clear user state
      setUser(null);

      // Clear any localStorage data (optional, if you store anything)
      localStorage.removeItem("user");

      // Close menus
      setMenuOpen(false);
      setUserMenuOpen(false);

      // Redirect to login
      navigate("/login");
    } catch (error) {
      console.error("Logout failed:", error);
      
      // Even if backend fails, clear frontend state
      setUser(null);
      localStorage.removeItem("user");
      navigate("/login");
    }
  };

  const handleMenuToggle = () => {
    setMenuOpen((prev) => !prev);
    if (userMenuOpen) setUserMenuOpen(false);
  };

  const handleUserMenuToggle = () => {
    setUserMenuOpen((prev) => !prev);
    if (menuOpen) setMenuOpen(false);
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    setIsBall(false);
  };

  // Navigation Links
  const navLinks = [
    { to: "/", label: "Home" },
    { to: "events", label: "Events", isSection: true },
    { to: "/about", label: "About Us" },
    { to: "/contact", label: "Contact Us" },
  ];

  const handleScrollToSection = (id) => {
    if (location.pathname !== "/") {
      navigate("/");
      setTimeout(() => {
        const section = document.getElementById(id);
        if (section) section.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const section = document.getElementById(id);
      if (section) section.scrollIntoView({ behavior: "smooth" });
    }
    setMenuOpen(false);
  };

  return (
    <>
      {/* Floating Scroll-to-Top Ball */}
      {isBall ? (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-50 p-3 rounded-full shadow-lg transition-all duration-500
            bg-gradient-to-r from-violet-600 to-pink-600 text-white
            hover:scale-110 focus:outline-none focus:ring-4 focus:ring-violet-400/50 animate-ballPulse"
          style={{ animation: "fadeIn 0.3s ease-out forwards" }}
        >
          <div className="absolute inset-0 rounded-full blur-xl bg-white/30 animate-pulse-light"></div>
          <FaArrowUp size={20} className="relative z-10" />
        </button>
      ) : (
        <nav
          className={`fixed w-full top-5 z-49 px-6 transition-all duration-500 ${
            show ? (showNavbar ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full") : "opacity-0 -translate-y-full"
          }`}
          style={{
            animation: isLoaded && showNavbar ? "dropInNavbar 0.6s ease-out" : "none",
          }}
        >
          {/* Desktop Navbar */}
          <div
            className={`hidden lg:flex items-center justify-between w-full max-w-5xl mx-auto px-6 py-2
              border border-white/40 shadow-2xl backdrop-blur-2xl rounded-[3rem] transition-all duration-300
              hover:scale-[1.01]
              ${scrolled ? "scale-95 bg-white/5" : "bg-gray-600/20"}
            `}
          >
            <Link to="/" className="flex items-center justify-center relative">
              <div className="absolute w-16 h-16 bg-violet-500/30 blur-2xl rounded-full"></div>
              <img
                src="/images/technothon_nameless.png"
                alt="Logo"
                className="h-[40px] w-auto relative z-10"
              />
            </Link>

            {/* Desktop Links */}
            <div className="flex gap-x-8 relative">
              {navLinks.map((link) =>
                link.isSection ? (
                  <button
                    key={link.to}
                    onClick={() => handleScrollToSection(link.to)}
                    className="relative text-sm font-medium text-white transition-all duration-300 hover:text-violet-600 cursor-pointer"
                  >
                    {link.label}
                  </button>
                ) : (
                  <Link
                    key={link.to}
                    to={link.to}
                    className={`relative text-sm font-medium text-white transition-all duration-300 hover:text-violet-300 ${
                      location.pathname === link.to ? "text-violet-300" : ""
                    }`}
                  >
                    {link.label}
                    {location.pathname === link.to && (
                      <span
                        className="absolute left-0 bottom-[-4px] w-full h-[3px] bg-gradient-to-r from-violet-400 to-pink-400 rounded-full"
                        style={{ animation: "indicatorSlide 0.4s ease-out forwards" }}
                      />
                    )}
                  </Link>
                )
              )}
            </div>

            {/* User / Sign in */}
            <div className="relative flex items-center">
              {isCheckingAuth ? (
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : user ? (
                <>
                  <button onClick={handleUserMenuToggle} className="flex items-center gap-2">
                    {userMenuOpen ? (
                      <FiX size={26} className="animate-hamburgerPop text-white" />
                    ) : (
                      <div className="flex items-center gap-2">
                        <FaUserCircle size={26} className="text-white" />
                        <span className="text-sm font-medium text-white hidden xl:block">
                          {user.name}
                        </span>
                      </div>
                    )}
                  </button>

                  {userMenuOpen && (
                    <div
                      ref={userMenuRef}
                      className="absolute top-16 right-0 w-56 rounded-xl backdrop-blur-3xl bg-gradient-to-r from-violet-600/80 via-purple-600/80 to-pink-600/80 border border-white/20 shadow-md p-4 space-y-3 animate-fadeInDropdown"
                    >
                      <div className="pb-2 border-b border-white/20">
                        <p className="text-white font-semibold">{user.name}</p>
                        <p className="text-white/70 text-xs">{user.email}</p>
                      </div>

                      <Link
                        to="/user"
                        className="block text-white hover:text-violet-300 transition"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Dashboard
                      </Link>

                      <button
                        onClick={handleLogout}
                        className="block text-left w-full text-white hover:text-red-400 transition"
                      >
                        Sign out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link
                  to="/login"
                  className="text-sm font-medium text-white hover:text-violet-300 transition-all"
                >
                  Sign in
                </Link>
              )}
            </div>
          </div>

          {/* MOBILE NAVBAR */}
          <div ref={mobileNavRef} className="lg:hidden">
            <div
              className={`flex items-center justify-between px-6 py-2 mx-auto w-full max-w-5xl
                border border-white/40 shadow-2xl backdrop-blur-3xl rounded-[3rem] transition-all duration-300
                ${scrolled ? "scale-95 bg-white/5" : "bg-gray-600/20"}`}
            >
              <Link to="/" className="flex items-center relative">
                <div className="absolute w-12 h-12 bg-violet-500/30 blur-2xl rounded-full"></div>
                <img
                  src="/images/technothon_nameless.png"
                  alt="Logo"
                  className="h-[35px] w-auto relative z-10"
                />
              </Link>

              <button
                onClick={handleMenuToggle}
                className="text-white focus:outline-none p-3"
              >
                {menuOpen ? (
                  <FiX size={26} className="animate-hamburgerPop" />
                ) : (
                  <FiMenu size={26} className="animate-hamburgerPop" />
                )}
              </button>
            </div>

            {/* Mobile Dropdown */}
            {menuOpen && (
              <div
                ref={mobileMenuRef}
                className="absolute top-[5.5rem] right-6 w-56 rounded-xl backdrop-blur-3xl bg-gradient-to-r from-violet-600/20 via-purple-600/20 to-pink-600/20 border border-white/20 shadow-md p-4 space-y-3 animate-fadeInDropdown"
                style={{ transformOrigin: "top right" }}
              >
                {navLinks.map((link) =>
                  link.isSection ? (
                    <button
                      key={link.to}
                      onClick={() => handleScrollToSection(link.to)}
                      className="block text-white hover:text-violet-300"
                    >
                      {link.label}
                    </button>
                  ) : (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`block text-white hover:text-violet-300 ${
                        location.pathname === link.to ? "text-violet-300" : ""
                      }`}
                      onClick={() => setMenuOpen(false)}
                    >
                      {link.label}
                    </Link>
                  )
                )}

                <hr className="border-white/20" />

                {isCheckingAuth ? (
                  <div className="flex justify-center py-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  </div>
                ) : user ? (
                  <>
                    <div className="pb-2 border-b border-white/20">
                      <p className="text-white font-semibold text-sm">{user.name}</p>
                      <p className="text-white/70 text-xs">{user.email}</p>
                    </div>

                    <Link
                      to="/user"
                      className="block text-white hover:text-violet-300 mt-3"
                      onClick={() => setMenuOpen(false)}
                    >
                      Dashboard →
                    </Link>

                    <button
                      onClick={handleLogout}
                      className="block text-left w-full text-white hover:text-red-400"
                    >
                      Sign out →
                    </button>
                  </>
                ) : (
                  <Link
                    to="/login"
                    className="block text-white hover:text-violet-300"
                    onClick={() => setMenuOpen(false)}
                  >
                    Sign in →
                  </Link>
                )}
              </div>
            )}
          </div>
        </nav>
      )}

      {/* Animations */}
      <style>
        {`
          @keyframes dropInNavbar {
            0% { opacity: 0; transform: translateY(-50px); }
            100% { opacity: 1; transform: translateY(0); }
          }
          @keyframes indicatorSlide {
            0% { width: 0; opacity: 0; }
            100% { width: 100%; opacity: 1; }
          }
          @keyframes hamburgerPop {
            0% { transform: scale(1); }
            50% { transform: scale(1.6); }
            100% { transform: scale(1); }
          }
          @keyframes pulse-light {
            0%, 100% { transform: scale(1); opacity: 0.8; }
            50% { transform: scale(1.3); opacity: 0.5; }
          }
          @keyframes fadeInDropdown {
            0% { opacity: 0; transform: scale(0.9); }
            100% { opacity: 1; transform: scale(1); }
          }
        `}
      </style>
    </>
  );
};

export default Navbar;