import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Autoplay } from "swiper/modules";
import HomeCard from "@/components/HomeCards";


export default function TestimonialCarousel({ testimonials = [] }) {
  if (!testimonials?.length) return null; // Guard

  return (
    <div className="relative w-full min-w-0">
      <Swiper
        grabCursor={true}
        modules={[Navigation, Pagination, Autoplay]}
        centeredSlides={true}
        spaceBetween={20}
        loop={true}
        watchOverflow={true} // gracefully handles too-few slides
        autoplay={{ delay: 4000, disableOnInteraction: true, pauseOnMouseEnter: true }}
        navigation={true} // built-in arrows
        pagination={{ clickable: true }}
        breakpoints={{
          640: { slidesPerView: 2 },  // sm
          1024: { slidesPerView: 3 }, // lg
        }}
        className="!pb-12"
      >
        {testimonials.map((t) => (
          <SwiperSlide key={t.id} className="h-auto">
            <div className="h-full non-selectable">
              <HomeCard item={t} variant="testimonial" />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}
