// src/components/HomeCards.jsx
import { Link } from "react-router-dom";
import { memo, useState } from "react";

const HomeCard = ({ item, variant = "default" }) => {
  const [showFull, setShowFull] = useState(false);

  switch (variant) {
    case "event":
      return (
        <Link to={item.link}>
          <div className="relative group rounded-2xl overflow-hidden h-80 text-white">
            <img
              src={item.image}
              alt={item.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/90 group-hover:via-black/80 group-hover:to-black/70 transition-all duration-500"></div>
            <div className="w-full h-full absolute left-0 top-60 md:top-[25rem] p-6 transition-all duration-500 ease-in-out md:group-hover:top-0 lg:group-hover:top-20">
              <h3 className="text-2xl font-bold pb-4">{item.title}</h3>
              <p className="opacity-0 text-white/70 tracking-wide text-[1rem] mt-2 md:opacity-100">
                {item.description}
              </p>
            </div>
          </div>
        </Link>
      );

    case "project":
      return (
        <div className="relative group rounded-2xl overflow-hidden h-80">
          <img
            src={item.image}
            alt={item.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
          <div className="absolute bottom-0 left-0 p-6">
            <h3 className="text-2xl font-bold">{item.title}</h3>
            <p className="text-white/70 tracking-wide text-[1rem] mt-1">
              {item.description}
            </p>
          </div>
        </div>
      );

    case "leader":
      return (
        <div className="flex flex-col items-center text-center transform transition duration-300 hover:scale-105 hover:shadow-lg hover:bg-white/5 p-4 rounded-xl">
          <div className="w-40 h-40 rounded-full overflow-hidden mb-4">
            <img
              src={item.image}
              alt={item.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
          <h3 className="text-lg font-semibold">{item.name}</h3>
          <p className="text-white/70 tracking-wide text-sm mt-1">
            {item.title}
          </p>
        </div>
      );

    case "testimonial": {
      const previewLimit = 280;
      const isLong = item.text.length > previewLimit;
      const preview = isLong
        ? item.text.slice(0, previewLimit) + "..."
        : item.text;

      return (
        <>
          <div
            className={`w-auto md:w-98 p-6 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-sm flex flex-col transition-all duration-500 ease-in-out non-selectable overflow-hidden`}
            style={{
              height: showFull ? "auto" : "20rem",
              maxHeight: showFull ? "1000px" : "20rem", // large enough value when expanded
            }}
          >
            {/* Testimonial text */}
            <p className="text-gray-300 text-base italic flex-grow non-selectable">
              "{showFull ? item.text : preview}"
              {isLong && (
                <span
                  onClick={() => setShowFull(!showFull)}
                  className="ml-2 text-blue-400 underline text-sm cursor-pointer select-none"
                >
                  {showFull ? "Show Less" : "Show More"}
                </span>
              )}
            </p>

            {/* Fixed footer */}
            <div className="flex items-center mt-4 shrink-0">
              <img
                src={item.image}
                alt={item.name}
                className="w-12 h-12 rounded-full object-cover mr-4"
                loading="lazy"
              />
              <div>
                <h4 className="font-bold text-white">{item.name}</h4>
                <p className="text-gray-400 text-sm">{item.title}</p>
              </div>
            </div>
          </div>
        </>
      );
    }

    case "gallery":
      return (
        <div className="rounded-2xl overflow-hidden aspect-w-1 aspect-h-1 transform transition duration-300 hover:scale-105 hover:shadow-lg">
          <img
            src={item.image}
            alt={`Gallery item ${item.id}`}
            loading="lazy"
            className="w-full h-full object-cover"
          />
        </div>
      );

    default:
      return null;
  }
};

export default memo(HomeCard);
