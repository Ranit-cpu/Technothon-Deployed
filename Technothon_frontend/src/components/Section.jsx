// src/components/Section.jsx
import { forwardRef } from "react";

const Section = forwardRef(({ id, visible, children, className = "py-24" }, ref) => {
  return (
    <section
      id={id}
      ref={ref}
      className={`${className} transition-all duration-700 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
      }`}
    >
      {children}
    </section>
  );
});

export default Section;
