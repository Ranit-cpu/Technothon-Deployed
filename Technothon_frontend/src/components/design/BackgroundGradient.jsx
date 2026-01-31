import React from "react";

function BackgroundGradient() {
  return (
    <div className="absolute inset-0 overflow-hidden">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0c0014] via-[#220033] to-[#000000]"></div>

      {/* Purple + Blue Glow */}
      <div className="absolute inset-0">
        <div className="w-[900px] h-[900px] bg-purple-700 opacity-30 blur-[220px] rounded-full absolute top-[-250px] left-[-250px]"></div>
        <div className="w-[700px] h-[700px] bg-blue-500 opacity-20 blur-[200px] rounded-full absolute bottom-[-250px] right-[-200px]"></div>
      </div>
    </ div>
  );
}

export default BackgroundGradient;
