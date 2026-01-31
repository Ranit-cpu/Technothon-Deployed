import { useEffect, useRef, useState } from "react";
import Marquee from "react-fast-marquee";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import TopGlow from "@/components/design/TopGlow";
import BackgroundGradient from "@/components/design/BackgroundGradient";
import Loader from "@/components/Loader";
import HomeCard from "@/components/HomeCards";
import Section from "@/components/Section";
import HeroSection from "@/components/ui/HeroSection";
import TestimonialCarousel from "@/components/TestimonialCaraousel";
import axios from "axios";
import { ChevronLeft, ChevronRight } from "lucide-react";
//import cursorDrone from "./components/ui/cursorDrone";

import {
  leaders,
  events,
  projects,
  sponsors,
  testimonials,
} from "@/data/homeData";

// ✅ Custom hook for IntersectionObserver
const useSectionObserver = (refs, setVisibleSections) => {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleSections((prev) => ({
              ...prev,
              [entry.target.id]: true,
            }));
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.2 }
    );

    refs.forEach((ref) => ref.current && observer.observe(ref.current));
    return () => observer.disconnect();
  }, [refs, setVisibleSections]);
};

const Home = () => {
  const [showHero, setShowHero] = useState(false);
  const [showLoader, setShowLoader] = useState(true);
  const [visibleSections, setVisibleSections] = useState({});
  const [galleryItems, setGalleryItems] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const introRef = useRef(null);
  const eventsRef = useRef(null);
  const projectsRef = useRef(null);
  const galleryRef = useRef(null);
  const leaderRef = useRef(null);
  const testimonialsRef = useRef(null);

  // ✅ Loader session control
  useEffect(() => {
    const timer = setTimeout(() => setShowLoader(false), 2100);
    return () => clearTimeout(timer);
  }, []);

  // ✅ Hero delay
  useEffect(() => {
    if (!showLoader) {
      const timer = setTimeout(() => setShowHero(true), 100);
      return () => clearTimeout(timer);
    }
  }, [showLoader]);

  // ✅ Section visibility observer
  useSectionObserver(
    [introRef, eventsRef, projectsRef, galleryRef, leaderRef, testimonialsRef],
    setVisibleSections
  );

  // ✅ Fetch gallery images from backend
  useEffect(() => {
    axios
      .get("http://localhost:8000/gallery/")
      .then((res) => setGalleryItems(res.data.gallery))
      .catch((err) => console.error("Error fetching gallery:", err));
  }, []);

  // Gallery Navigation
  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % galleryItems.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? galleryItems.length - 1 : prev - 1
    );
  };

  // Keyboard navigation for gallery
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (galleryItems.length === 0) return;
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [galleryItems.length]);

  if (showLoader) return <Loader />;

  return (
    <div className="text-white">
      <Navbar show={!showLoader} />
      <div className="top-0 relative">
        <BackgroundGradient />
        <TopGlow threshold={0} />

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <HeroSection isReady={showHero} />

          {/* Sponsors */}
          <div className="py-8 border-y border-white/10" id="sponsors">
            <Marquee pauseOnHover speed={50}>
              {sponsors.map((s) => (
                <div
                  key={s.id}
                  className="mx-12 flex items-center justify-center"
                >
                  <img
                    src={s.image}
                    alt={s.name}
                    loading="lazy"
                    className="h-12 w-auto object-contain transition-all duration-300 hover:scale-110"
                  />
                </div>
              ))}
            </Marquee>
          </div>
{/*           <div className="w-full flex justify-center py-8"> */}
{/*               <button */}
{/*                 onClick={() => (window.location.href = "/careers")} */}
{/*                 className="px-8 py-3 text-lg font-semibold bg-gradient-to-r from-purple-600 via-pink-500 to-purple-700 */}
{/*                 rounded-full shadow-[0_0_20px_rgba(167,48,255,0.6)] hover:shadow-[0_0_35px_rgba(200,70,255,0.8)] */}
{/*                 transition-all duration-300 tracking-wide"> */}
{/*                 🚀 Join Us — We're Hiring! */}
{/*               </button> */}
{/*           </div> */}


          {/* Intro */}
          <Section id="intro" ref={introRef} visible={visibleSections.intro}>
            <p className="text-center tracking-wide max-w-3xl mx-auto text-lg leading-relaxed bg-gradient-to-r from-violet-400 via-pink-500 to-orange-400 bg-clip-text text-transparent text-shadow-2xl">
              Step into the future of innovation, where imagination transforms
              into AI and IoT powered projects and students bring technology to
              life through exciting events.
            </p>
          </Section>

          {/* Events */}
          <Section
            id="events"
            ref={eventsRef}
            visible={visibleSections.events}
            className="py-12"
          >
            <div className="text-center mb-12">
              <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-200 via-gray-500 to-gray-300 bg-clip-text text-transparent inline-block">
                Events
              </h2>
              <p className="mt-2 text-lg text-white/70 tracking-wider">
                A platform to explore groundbreaking student innovations in AI
                and IoT
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-15 p-5">
              {events.map((event) => (
                <HomeCard key={event.id} item={event} variant="event" />
              ))}
            </div>
          </Section>

          {/* Projects */}
          <Section
            id="projects"
            ref={projectsRef}
            visible={visibleSections.projects}
            className="py-12"
          >
            <div className="text-center mb-12">
              <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-200 via-gray-500 to-gray-300 bg-clip-text text-transparent inline-block">
                Featured Projects
              </h2>
              <p className="text-white/70 tracking-wider pt-2 text-lg">
                A dynamic platform showcasing student innovation shaping the
                future technology landscape.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {projects.map((project) => (
                <div
                  key={project.id}
                  className="relative rounded-2xl overflow-hidden group shadow-lg hover:shadow-xl transition-all duration-500"
                >
                  {/* Image */}
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-64 object-cover transform group-hover:scale-110 transition-transform duration-500"
                  />

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-center items-center text-center px-4">
                    <h3 className="text-2xl font-semibold text-white mb-2">
                      {project.title}
                    </h3>
                    <p className="text-gray-200 text-sm">
                      {project.description || "An innovative student project."}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* Gallery Carousel */}
          <Section
            id="gallery"
            ref={galleryRef}
            visible={visibleSections.gallery}
            className="py-12"
          >
            <div className="text-center mb-12">
              <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-200 via-gray-500 to-gray-300 bg-clip-text text-transparent inline-block">
                Gallery
              </h2>
              <p className="text-white/70 tracking-wider mt-2 text-lg">
                Experience the innovation and creativity through a vibrant
                showcase of student-driven projects.
              </p>
            </div>

            {galleryItems.length === 0 ? (
              <p className="text-center text-gray-400">Loading gallery...</p>
            ) : (
              <div className="relative max-w-5xl mx-auto">
                {/* Main Image Container */}
                <div className="relative w-full h-[500px] bg-gradient-to-br from-violet-900/20 via-purple-900/20 to-pink-900/20 rounded-2xl overflow-hidden border border-white/10 shadow-2xl">
                  <img
                    src={galleryItems[currentImageIndex]?.image || galleryItems[currentImageIndex]?.url}
                    alt={galleryItems[currentImageIndex]?.title || `Gallery image ${currentImageIndex + 1}`}
                    className="w-full h-full object-contain transition-all duration-500"
                    onError={(e) => {
                      e.target.src = "/images/placeholder.jpg";
                    }}
                  />

                  {/* Image Title Overlay */}
                  {galleryItems[currentImageIndex]?.title && (
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                      <h3 className="text-white text-xl font-semibold">
                        {galleryItems[currentImageIndex].title}
                      </h3>
                      {galleryItems[currentImageIndex].description && (
                        <p className="text-gray-300 text-sm mt-1">
                          {galleryItems[currentImageIndex].description}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Navigation Buttons */}
                  <button
                    onClick={prevImage}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    aria-label="Previous image"
                  >
                    <ChevronLeft size={24} />
                  </button>

                  <button
                    onClick={nextImage}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full backdrop-blur-sm transition-all duration-300 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-violet-500"
                    aria-label="Next image"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>

                {/* Thumbnail Navigation */}
                <div className="flex justify-center gap-3 mt-6 overflow-x-auto pb-2 px-4">
                  {galleryItems.map((item, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentImageIndex(index)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                        index === currentImageIndex
                          ? "border-violet-500 scale-110 shadow-lg shadow-violet-500/50"
                          : "border-white/20 hover:border-violet-400 opacity-60 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={item.image || item.url}
                        alt={`Thumbnail ${index + 1}`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = "/images/placeholder.jpg";
                        }}
                      />
                    </button>
                  ))}
                </div>

                {/* Image Counter */}
                <div className="text-center mt-4">
                  <span className="text-white/60 text-sm">
                    {currentImageIndex + 1} / {galleryItems.length}
                  </span>
                </div>

                {/* Keyboard Hint */}
                <div className="text-center mt-2">
                  <span className="text-white/40 text-xs">
                    Use ← → arrow keys to navigate
                  </span>
                </div>
              </div>
            )}
          </Section>

          {/* Leaders */}
{/*           <Section */}
{/*             id="leader" */}
{/*             ref={leaderRef} */}
{/*             visible={visibleSections.leader} */}
{/*             className="py-12" */}
{/*           > */}
{/*             <div className="text-center mb-12"> */}
{/*               <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-200 via-gray-500 to-gray-300 bg-clip-text text-transparent inline-block"> */}
{/*                 Our Inspiration */}
{/*               </h2> */}
{/*               <p className="text-white/70 tracking-wider mt-2 text-lg"> */}
{/*                 Meet the visionary leaders of Techno India University */}
{/*               </p> */}
{/*             </div> */}
{/*             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 px-4 sm:px-8"> */}
{/*               {leaders.map((leader) => ( */}
{/*                 <HomeCard key={leader.id} item={leader} variant="leader" /> */}
{/*               ))} */}
{/*             </div> */}
{/*           </Section> */}

          {/* Testimonials */}
          <Section
            id="testimonials"
            ref={testimonialsRef}
            visible={visibleSections.testimonials}
          >
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold bg-gradient-to-r from-gray-200 via-gray-500 to-gray-300 bg-clip-text text-transparent inline-block">
                Testimonials
              </h2>
              <p className="text-white/70 tracking-wider mt-2 text-lg">
                What our speakers and guests are saying about us
              </p>
            </div>
            <TestimonialCarousel testimonials={testimonials} />
          </Section>
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Home;