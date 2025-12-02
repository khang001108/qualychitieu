// components/ExpenseChart.js
import {
  ComposedChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { useState, useMemo } from "react";
import { getZodiacForMonth } from "../utils/zodiacUtils";

const MONTHS = [
  "Tháng 1","Tháng 2","Tháng 3","Tháng 4","Tháng 5","Tháng 6",
  "Tháng 7","Tháng 8","Tháng 9","Tháng 10","Tháng 11","Tháng 12",
];

export default function ExpenseChart({ items = [], selectedYear }) {
  const [hoveredMonth, setHoveredMonth] = useState(0);

  // Chi tiêu
  const monthlyExpense = useMemo(() => {
    const res = {};
    items.forEach((item) => {
      if (Number(item.year) === Number(selectedYear) && item.type !== "salary") {
        const m = Number(item.month);
        res[m] = (res[m] || 0) + Number(item.amount || 0);
      }
    });
    return res;
  }, [items, selectedYear]);

  // Lương
  const monthlyIncome = useMemo(() => {
    const res = {};
    items.forEach((item) => {
      if (Number(item.year) === Number(selectedYear) && item.type === "salary") {
        const m = Number(item.month);
        res[m] = (res[m] || 0) + Number(item.amount || 0);
      }
    });
    return res;
  }, [items, selectedYear]);

  // Data Chart
  const data = useMemo(() => {
    return MONTHS.map((label, i) => {
      const income = monthlyIncome[i] || 0;
      const expense = monthlyExpense[i] || 0;
      const remain = income - expense;

      return {
        month: label,
        Chi: expense,
        Lương: income,
        CònLại: remain < 0 ? 0 : remain,
      };
    });
  }, [monthlyIncome, monthlyExpense]);

  const colorMap = {
    Chi: "#dc2626",
    Lương: "#16a34a",
    CònLại: "#ca8a04",
  };

  return (
    <div
      className="
        w-full p-6 md:p-10 rounded-2xl shadow-lg border
        bg-white dark:bg-gray-900
        border-gray-100 dark:border-gray-700
        transition-colors duration-300
      "
    >
      {/* Title */}
      <h2 className="
        text-2xl font-semibold text-gray-800 dark:text-gray-200 
        text-center mb-4 flex justify-center items-center gap-2
      ">
        📈 Biểu đồ tài chính năm {selectedYear}
        <span
          className={`
            text-2xl inline-block transition-transform duration-500
            animate-bounce-slow
          `}
        >
          {getZodiacForMonth(hoveredMonth, selectedYear)}
        </span>
      </h2>

      <div className="h-[400px]">
        <ResponsiveContainer>
          <ComposedChart
            data={data}
            margin={{ top: 30, right: 30, bottom: 20 }}
            onMouseMove={(state) => {
              if (state?.activeTooltipIndex != null) {
                setHoveredMonth(state.activeTooltipIndex);
              }
            }}
          >
            {/* GRID — dynamic theo theme */}
            <CartesianGrid
              strokeDasharray="3 3"
              stroke={typeof window !== "undefined" &&
                      document.documentElement.classList.contains("dark")
                        ? "#374151"   // gray-700
                        : "#e5e7eb"   // gray-200
              }
            />

            {/* X Axis */}
            <XAxis
              dataKey="month"
              tick={{
                fontSize: 12,
                fill:
                  typeof window !== "undefined" &&
                  document.documentElement.classList.contains("dark")
                    ? "#d1d5db" // gray-300
                    : "#4b5563", // gray-600
              }}
            />

            {/* Y Axis */}
            <YAxis
              tickFormatter={(v) =>
                v >= 1_000_000 ? `${(v / 1_000_000).toFixed(0)}M` : v
              }
              tick={{
                fontSize: 12,
                fill:
                  typeof window !== "undefined" &&
                  document.documentElement.classList.contains("dark")
                    ? "#d1d5db"
                    : "#4b5563",
              }}
            />

            {/* Tooltip — DARK MODE */}
            <Tooltip
              content={({ active, payload, label }) =>
                active && payload?.length ? (
                  <div
                    className="
                      p-3 rounded-xl shadow-lg border text-sm
                      bg-white dark:bg-gray-800
                      border-gray-200 dark:border-gray-700
                      text-gray-800 dark:text-gray-200
                      transition-colors duration-200
                    "
                  >
                    <p className="font-semibold mb-1">{label}</p>
                    {payload.map((e, i) => (
                      <p key={i} style={{ color: colorMap[e.name] }}>
                        <span className="font-medium">{e.name}: </span>
                        {Number(e.value).toLocaleString()}₫
                      </p>
                    ))}
                  </div>
                ) : null
              }
            />

            {/* Legend — màu chữ dynamic */}
            <Legend
              iconType="circle"
              wrapperStyle={{
                fontSize: 13,
                color:
                  typeof window !== "undefined" &&
                  document.documentElement.classList.contains("dark")
                    ? "#d1d5db"
                    : "#374151",
              }}
            />

            {/* Gradients */}
            <defs>
              {[["yellowGrad", "#facc15", "#fde047"],
               ["greenGrad", "#22c55e", "#16a34a"],
               ["redGrad", "#ef4444", "#b91c1c"]]
              .map(([id, c1, c2]) => (
                <linearGradient key={id} id={id} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={c1} stopOpacity="0.9" />
                  <stop offset="100%" stopColor={c2} stopOpacity="0.3" />
                </linearGradient>
              ))}
            </defs>

            {/* Chi */}
            <Bar
              dataKey="Chi"
              fill="url(#redGrad)"
              barSize={28}
              radius={[8, 8, 0, 0]}
            />

            {/* Còn lại */}
            <Area
              type="monotone"
              dataKey="CònLại"
              fill="url(#yellowGrad)"
              stroke="#eab308"
              strokeWidth={2}
              dot={false}
            />

            {/* Lương */}
            <Line
              type="monotone"
              dataKey="Lương"
              stroke="url(#greenGrad)"
              strokeWidth={3}
              dot={{ r: 4, fill: "#16a34a" }}
              activeDot={{ r: 6 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mt-3 text-center">
        💡 Di chuột hoặc chạm để xem chi tiết từng tháng.
      </p>
    </div>
  );
}
