import React, { useEffect, useState } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

import { adminApi } from "./adminApi";

const UnitTeamsPerformanceChart = () => {
  const [data, setData] = useState([
    { name: "2024", iot: 35, ai: 25 },
    { name: "2025", iot: 42, ai: 30 },
  ]);
  const [loading, setLoading] = useState(false);

  const pieData = [
    { name: "IoT-Exposition", value: 24 },
    { name: "AI-Unleashed", value: 18 },
  ];

  const PIE_COLORS = ["#3b82f6", "#ec4899"];

  // Custom Tooltip Component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: "#1a1025",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "8px",
            padding: "8px 12px",
          }}
        >
          <p style={{ color: "#ffffff", fontSize: "12px", margin: 0 }}>
            {payload[0].name}: {payload[0].value}
          </p>
        </div>
      );
    }
    return null;
  };

  /* 🔌 FETCH FROM BACKEND */
  // useEffect(() => {
  //   setLoading(true);
  //   adminApi
  //     .getUnitTeamPerformance()
  //     .then((res) => {
  //       const formatted = res.map((d) => ({
  //         name: d.year,
  //         iot: d.iot,
  //         ai: d.ai,
  //       }));
  //       setData(formatted);
  //       setLoading(false);
  //     })
  //     .catch(() => {
  //       setLoading(false);
  //     });
  // }, []);

  /* ⏳ LOADING STATE */
  if (loading) {
    return (
      <div className="h-64 flex items-center justify-center text-white/40 text-sm">
        Loading performance data…
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-64 w-full">
      {/* 📈 AREA CHART */}
      <div className="h-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorIot" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorAi" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
              </linearGradient>
            </defs>

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
            />

            <Tooltip
              cursor={false}
              contentStyle={{
                backgroundColor: "#1a1025",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                color: "#fff",
                fontSize: "12px",
              }}
            />

            <Area
              type="monotone"
              dataKey="iot"
              stroke="#3b82f6"
              fill="url(#colorIot)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="ai"
              stroke="#ec4899"
              fill="url(#colorAi)"
              strokeWidth={2}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* 🥧 PIE CHART */}
      <div className="h-full flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={70}
              innerRadius={40}
              paddingAngle={4}
            >
              {pieData.map((_, index) => (
                <Cell key={index} fill={PIE_COLORS[index]} />
              ))}
            </Pie>

            <Tooltip content={<CustomTooltip />} />

            <Legend
              verticalAlign="bottom"
              iconType="circle"
              formatter={(value) => (
                <span className="text-white/70 text-xs">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default UnitTeamsPerformanceChart;