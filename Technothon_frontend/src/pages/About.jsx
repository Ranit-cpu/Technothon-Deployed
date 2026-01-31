/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay } from "swiper/modules";
import Navbar from "../components/Navbar";
import TopGlow from "@/components/design/TopGlow";
import BackgroundGradient from "@/components/design/BackgroundGradient";
import Footer from "@/components/Footer";
import { FaLinkedin } from "react-icons/fa";

// Small screen image card component
const AboutImageCard = ({ img, alt, delay }) => {
  return (
    <div
      className={`opacity-0 animate-slide-in-bottom`}
      style={{ animationDelay: `${delay}s` }}
    >
      <img
        src={img}
        alt={alt}
        className="rounded-xl w-full h-64 object-cover shadow-lg hover:scale-105 transition-transform duration-300"
      />
    </div>
  );
};

const About = () => {
  const [isImgVisible, setIsImgVisible] = useState(false);
  const [isDescriptionVisible, setIsDescriptionVisible] = useState(false);
  const [isCardVisible, setIsCardVisible] = useState(false);

  const imgRef = useRef(null);
  const descriptionRef = useRef(null);
  const teamSectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsImgVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.4 }
    );
    if (imgRef.current) observer.observe(imgRef.current);
    return () => imgRef.current && observer.unobserve(imgRef.current);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsDescriptionVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.4 }
    );
    if (descriptionRef.current) observer.observe(descriptionRef.current);
    return () =>
      descriptionRef.current && observer.unobserve(descriptionRef.current);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsCardVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.6 }
    );
    if (teamSectionRef.current) observer.observe(teamSectionRef.current);
    return () =>
      teamSectionRef.current && observer.unobserve(teamSectionRef.current);
  }, []);

  const teamData = [
      {
      name: "Pranav Raj Wardhan",
      img: "/images/team/PranavRW.JPG",
      role: "UI & UX Frontend (Lead)",
      linkedin: "https://www.linkedin.com/in/pranav-raj-wardhan-6b0202193",
    },
      {
      name: "Avinandan Bhattacharjee",
      img: "/images/team/AvinandanB.JPG",
      role: "Backend Engineer (Lead)",
      linkedin: "https://www.linkedin.com/in/avinandan-bhattacharjee-9a91b1227/",
    },
      {
      name: "Soham Ghosh",
      img: "/images/team/SohamGhosh.jpeg",
      role: "FullStack Engineer",
      linkedin:"https://www.linkedin.com/in/soham-ghosh-97809a24b/",
    },

    { name: "Ranit Saha", img: "/images/team/RanitSaha.jpg", role: "FullStack Engineer (Lead)",linkedin: "https://www.linkedin.com/in/ranit-saha-b58984225" },
    { name: "Sneha Ghosh", img: "/images/team/SnehaGhosh.jpeg", role: "UI/UX Designer & Content Writer",linkedin: "https://www.linkedin.com/in/sneha-ghosh-2205b9351/" },
    {
      name: "Jishnu Paul",
      img: "/images/team/JishnuPaul.JPG",
      role: "Backend Engineer",
      linkedin: "https://www.linkedin.com/in/jishnu-paul-504825270/",
    },
    {
      name: "Anwesha Banerjee",
      img: "/images/team/AnweshaB.JPG",
      role: "UI/UX & Frontend Developer",
      linkedin: "https://www.linkedin.com/in/anwesha-banerje/",
    },
    {
      name: "Anwesha De",
      img: "/images/team/AnweshaDe.JPG",
      role: "UI/UX Designer",
      linkedin: "https://www.linkedin.com/in/anwesha-de-72a39a315/",
    },

    {
      name: "D Arun Kumar",
      img: "/images/team/DArun.JPG",
      role: "Backend Engineer",
      linkedin: "https://www.linkedin.com/in/kumardarun11/",
    },
    {
      name: "Dipanjana Pal",
      img: "/images/team/Dipanjana.JPG",
      role: "Frontend Developer",
      linkedin: "https://www.linkedin.com/in/dipanjana-pal-0ba98b25a/"
    },
    {
      name: "Manish Kumar Shaw",
      img: "/images/team/ManishKS.JPG",
      role: "Backend Engineer",
      linkedin: "https://www.linkedin.com/in/manish-shaw-272172251/",
    },
    {
      name: "Sumit Sharma",
      img: "/images/team/SumitSharma.JPG",
      role: "3D Developer",
      linkedin: "https://www.linkedin.com/in/sumit-sharma-818198343/",
    },
    {
      name: "Rupam Dutta",
      img: "/images/team/RupamD.jpeg",
      role: "Frontend Developer",
      linkedin: "https://linkedin.com/in/rupam-dutta-/",
    },
    {
      name: "Sayan Mahanto",
      img: "/images/team/SayanM.JPG",
      role: "Frontend Developer",
      linkedin: "https://www.linkedin.com/in/sayan-mahanto-624b82207/",
    },
    {
      name: "Swarnava Bose",
      img: "/images/team/SwarnavaBose.jpeg",
      role: "Frontend Developer",
      linkedin: "https://www.linkedin.com/in/swarnava-bose-62a7ab285",
    },

  ];

  const images = [
    "/images/about1.jpg",
    "/images/about2.jpg",
    "/images/about3.jpg",
    "/images/about4.jpg",
  ];

  return (
    <>
      <Navbar />
      <div className="relative w-full min-h-screen overflow-hidden text-white">
        <BackgroundGradient />
        <TopGlow threshold={0} />

        <div className="relative z-10 flex flex-col items-center px-6 md:px-20 py-10">
          {/* Heading */}
          <div className="w-full text-left my-12 text-5xl">
            <h1 className="font-bold bg-gradient-to-r from-gray-200 via-gray-500 to-gray-300 bg-clip-text text-transparent leading-normal inline-block main-section-heading">
              About Us
            </h1>
            <p className="text-2xl text-gray-300 mb-10">
              Come, <span className="text-teal-400 font-semibold">build</span>{" "}
              with us
            </p>
          </div>

          {/* Content Section */}
          <div className="flex flex-col md:flex-row items-start justify-between gap-12 w-full relative">
            {/* Background Logo */}
            <div className="absolute inset-0 flex justify-start items-start z-5 opacity-10 pointer-events-none">
              <img
                src="/images/technothon_nameless.png"
                alt="Technothon Logo"
                className="w-[800px] md:w-[1200px] object-contain relative left-[-20%] top-[-25%]"
              />
            </div>

            {/* Left - Images (desktop) / Cards (mobile) */}
            <div ref={imgRef} className="z-10 w-full md:w-auto mt-2">
              {/* Desktop layout */}
              <div className="hidden md:flex gap-5">
                {images.map((img, index) => (
                  <div
                    key={index}
                    className={`opacity-0 ${
                      isImgVisible
                        ? index % 2 === 0
                          ? "animate-slide-in-top"
                          : "animate-slide-in-bottom"
                        : ""
                    }`}
                    style={{ animationDelay: `${index * 0.2}s` }}
                  >
                    <img
                      src={img}
                      alt={`Event ${index + 1}`}
                      className={`rounded-2xl w-32 h-72 md:w-36 md:h-80 object-cover ${
                        index % 2 === 0 ? "mb-10" : "mt-10"
                      }`}
                    />
                  </div>
                ))}
              </div>

              {/* Mobile layout */}
              <div className="grid grid-cols-2 gap-4 md:hidden w-auto">
                {images.map((img, index) => (
                  <AboutImageCard
                    key={index}
                    img={img}
                    alt={`Event ${index + 1}`}
                    delay={index * 0.2}
                  />
                ))}
              </div>
            </div>

            {/* Right - Text */}
            <div
              ref={descriptionRef}
              className={`opacity-0 flex-1 z-10 max-w-xl ${
                isDescriptionVisible ? "animate-slide-in-right" : ""
              }`}
            >
              <p className="text-xs uppercase text-white/70 tracking-wider mb-2">
                Since 2023
              </p>
              <h2 className="text-4xl md:text-5xl font-semibold tracking-wider mb-4">
                TECHNOTHON
              </h2>
              <p className="text-lg md:text-lg leading-relaxed text-white/75">
                Technothon is a premier technical domain of Techno India
                University, celebrating the spirit of innovation, creativity and
                collaboration. It serves as a dynamic platform where students
                showcase groundbreaking projects in Artificial Intelligence, IoT
                and emerging technologies, transforming ideas into real world
                solutions. The event features a diverse range of activities
                including project expositions, workshops and competitions that
                inspire problem solving, teamwork and leadership. With active
                participation from students, faculty and industry experts.
                Technothon bridges academia with industry, nurturing young
                talent and shaping future innovators. It is a celebration of
                technology, imagination and creativity.
              </p>
            </div>
          </div>

          {/* Team Section */}
          <section className="w-full px-4 md:px-20 py-24 mt-20 text-white relative z-10 min-h-screen">
            <div className="text-center mb-16 text-4xl">
              <h1 className="font-bold bg-gradient-to-r from-gray-200 via-gray-500 to-gray-300 bg-clip-text text-transparent mb-20 second-main-heading">
                Meet the team
              </h1>
            </div>

            {/* Team Cards - Swiper */}
            <Swiper
              grabCursor={true}
              centeredSlides={true}
              spaceBetween={10}
              loop={true}
              autoplay={{
                delay: 2000,
                disableOnInteraction: false,
                pauseOnMouseEnter: true,
              }}
              navigation={true}
              modules={[Navigation, Autoplay]}
              breakpoints={{
                640: { slidesPerView: 1.5, spaceBetween: 20 },
                768: { slidesPerView: 2.5, spaceBetween: 30 },
                1024: { slidesPerView: 3, spaceBetween: 40 },
                1280: { slidesPerView: 3.5, spaceBetween: 50 },
                1536: { slidesPerView: 4.5, spaceBetween: 60 },
              }}
              ref={teamSectionRef}
              className={`opacity-0 mySwiper carousel-swiper-container mb-50 ${
                isCardVisible ? "animate-popout" : ""
              } transition-opacity duration-500`}
            >
              {teamData.map((member, index) => (
                <SwiperSlide key={index}>
                  <div
                    className="w-72 h-68 mx-auto p-6
                    bg-white/10
                    backdrop-blur-xl
                    rounded-2xl
                    border border-white/20
                    shadow-lg
                    flex flex-col items-center justify-center text-center
                    transition-transform duration-300 hover:scale-105"
                  >
                    <img
                      src={member.img}
                      alt={member.name}
                      className="w-30 h-30 rounded-full object-cover mb-4 border-2 border-white/20"
                    />
                    <h2 className="text-lg font-semibold text-white mb-1">
                      {member.name}
                    </h2>
                    <p className="text-gray-400 text-sm pb-2">{member.role}</p>
                    <a
                      href={member.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      aria-label="Linked In"
                      className="transition transform hover:scale-110 cursor-pointer"
                    >
                      <FaLinkedin size={20} />
                    </a>
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>

            {/* Background text */}
            <div className="absolute inset-0 flex justify-center items-center bottom-[-90vh] right-[-40vh] opacity-[0.05] font-semibold pointer-events-none select-none tracking-wider z-[-1] mb-10 text-[4rem] md:text-[10rem]">
              DEVELOPMENT
            </div>
          </section>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default About;
