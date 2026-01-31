import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { adminApi } from "./adminApi";

const StudentParticipationChart = () => {
  const [rawData, setRawData] = useState([
    { name: "2024", AI_Unleashed: 160, IoT_Exposition: 199 },
    { name: "2025", AI_Unleashed: 154, IoT_Exposition: 170 },
  ]);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  /* 🔌 FETCH DATA FROM BACKEND */
  // useEffect(() => {
  //   setLoading(true);
  //   adminApi
  //     .getStudentParticipation()
  //     .then((res) => {
  //       const formatted = res.map((d) => ({
  //         name: d.year,
  //         aiUnleashed: d.aiUnleashed,
  //         iotExposition: d.iotExposition,
  //       }));
  //
  //       setRawData(formatted);
  //
  //       // Start with zero for animation
  //       setData(formatted.map((d) => ({ ...d, aiUnleashed: 0, iotExposition: 0 })));
  //       setLoading(false);
  //     })
  //     .catch(() => {
  //       setLoading(false);
  //     });
  // }, []);

  /* 🎬 STAGGERED BAR ANIMATION */
  useEffect(() => {
    if (!rawData.length) return;

    // Start with zero for animation
    setData(rawData.map((d) => ({ ...d, aiUnleashed: 0, iotExposition: 0 })));

    const timers = rawData.map((item, index) =>
      setTimeout(() => {
        setData((prev) => {
          const updated = [...prev];
          updated[index] = item;
          return updated;
        });
      }, index * 300)
    );

    return () => timers.forEach(clearTimeout);
  }, [rawData]);

  const maxValue = rawData.length > 0
    ? Math.max(...rawData.map((d) => Math.max(d.aiUnleashed, d.iotExposition)))
    : 0;

  /* ⏳ LOADING STATE */
  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-white/40 text-sm">
        Loading chart…
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <XAxis
            dataKey="name"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            dy={10}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#9ca3af", fontSize: 12 }}
            domain={[0, maxValue + 50]}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.05)" }}
            contentStyle={{
              backgroundColor: "#1a1025",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#fff",
              fontSize: "12px",
            }}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            formatter={(value) => {
              const labels = {
                AI_Unleashed: "AI-Unleashed",
                IoT_Exposition: "IoT-Exposition"
              };
              return <span className="text-white/70 text-xs">{labels[value]}</span>;
            }}
          />
          <Bar
            dataKey="AI_Unleashed"
            fill="#ec4899"
            radius={[8, 8, 0, 0]}
            barSize={25}
            animationDuration={300}
          />
          <Bar
            dataKey="IoT_Exposition"
            fill="#3b82f6"
            radius={[8, 8, 0, 0]}
            barSize={25}
            animationDuration={300}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default StudentParticipationChart;