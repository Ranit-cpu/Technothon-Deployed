import React, { useRef, useState, useEffect } from "react";
import {
  FaEnvelope,
  FaLinkedin,
  FaInstagram,
  FaYoutube,
  FaLocationArrow,
} from "react-icons/fa";
import Navbar from "../components/Navbar";
import BackgroundGradient from "@/components/design/BackgroundGradient";
import TopGlow from "@/components/design/TopGlow";
import Footer from "@/components/Footer";

const Contact = () => {
  const [isFormVisible, setIsFormVisible] = useState(false);
  const [isMapVisible, setIsMapVisible] = useState(false);

  const formRef = useRef(null);
  const mapRef = useRef(null);

  // Animation triggers
  useEffect(() => {
    const observerForm = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsFormVisible(true);
          observerForm.unobserve(entry.target);
        }
      },
      { threshold: 0.4 }
    );

    const observerMap = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsMapVisible(true);
          observerMap.unobserve(entry.target);
        }
      },
      { threshold: 0.4 }
    );

    if (formRef.current) observerForm.observe(formRef.current);
    if (mapRef.current) observerMap.observe(mapRef.current);

    return () => {
      if (formRef.current) observerForm.unobserve(formRef.current);
      if (mapRef.current) observerMap.unobserve(mapRef.current);
    };
  }, []);

  return (
    <>
      <Navbar />

      <section className="relative min-h-screen overflow-hidden text-white">
        <BackgroundGradient />
        <TopGlow threshold={0} />

        <div className="relative z-10 flex flex-col items-center px-6 md:px-20 py-10 mt-2">
          {/* Heading */}
          <div className="w-full text-left my-12">
            <h1 className="font-bold text-5xl bg-gradient-to-r from-gray-200 via-gray-500 to-gray-300 bg-clip-text text-transparent leading-normal inline-block">
              Contact Us
            </h1>
            <p className="text-xl text-gray-300 mt-2">
              Let’s <span className="text-teal-400 font-semibold">connect</span>{" "}
              and create together
            </p>
          </div>

          <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-12">
            {/* Left - Contact Form */}
            <div
              ref={formRef}
              className={`opacity-0 ${
                isFormVisible ? "animate-slide-in-left" : ""
              }`}
            >
              <form className="bg-[#1f1b2e] p-8 rounded-2xl border border-gray-600 w-full shadow-lg">
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm uppercase text-gray-400 mb-1">
                      Name
                    </label>
                    <input
                      type="text"
                      className="w-full p-2 bg-transparent border-b border-gray-500 focus:outline-none focus:border-teal-400 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm uppercase text-gray-400 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      className="w-full p-2 bg-transparent border-b border-gray-500 focus:outline-none focus:border-teal-400 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-sm uppercase text-gray-400 mb-1">
                      Message
                    </label>
                    <textarea
                      rows="4"
                      className="w-full p-2 bg-transparent border-b border-gray-500 focus:outline-none focus:border-teal-400 transition"
                    ></textarea>
                  </div>
                </div>

                <div className="mt-8 text-center">
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-teal-500 to-teal-300 text-black font-semibold px-10 py-3 rounded-xl shadow-lg hover:opacity-90 transition"
                  >
                    Send Message
                  </button>
                </div>
              </form>

              {/* Contact Info */}
              <div className="mt-8 space-y-4 text-gray-300">
                <div className="flex items-center space-x-3">
                  <FaEnvelope className="text-teal-400" />
                  <span>team@technothontiu.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <FaLocationArrow className="text-teal-400" />
                  <span>
                    EM-4, EM-4/1, EM Block, Sector V, Bidhannagar, Kolkata, West
                    Bengal 700091
                  </span>
                </div>
                <div className="flex space-x-4 text-2xl mt-4">
                  <a
                    href="https://www.linkedin.com/company/technothon/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Link"
                    className="transition transform hover:scale-110"
                  >
                    <FaLinkedin className="cursor-pointer hover:text-[#0077b5] transition" />
                  </a>
                  <a
                    href="https://www.instagram.com/technothon_/"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Link"
                    className="transition transform hover:scale-110"
                  >
                    <FaInstagram className="cursor-pointer hover:text-[#e4405f] transition" />
                  </a>
                  <a
                    href="https://www.youtube.com/@Technothon-TIU"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Link"
                    className="transition transform hover:scale-110"
                  >
                    <FaYoutube className="cursor-pointer hover:text-[#ff0000] transition" />
                  </a>
                  <a
                    href="mailto:team@technothontiu.com"
                    target="_blank"
                    rel="noreferrer"
                    aria-label="Email"
                    className="transition transform hover:scale-110"
                  >
                    <FaEnvelope className="cursor-pointer hover:text-[#d35625] transition" />
                  </a>
                </div>
              </div>
            </div>

            {/* Right - Map */}
            <div
              ref={mapRef}
              className={`opacity-0 ${
                isMapVisible ? "animate-slide-in-right" : ""
              }`}
            >
              <div className="rounded-2xl overflow-hidden shadow-lg border border-gray-700 h-full">
                <iframe
                  title="Techno India University Map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3683.8076930215953!2d88.43164237484504!3d22.58602963213233!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a0276b1a5f7166d%3A0x112d6315a1c1eb2f!2sTechno%20India%20University!5e0!3m2!1sen!2sin!4v1620213124000!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  className="min-h-[500px] w-full"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </section>
    </>
  );
};

export default Contact;
