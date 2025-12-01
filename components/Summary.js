import { useState } from "react";
import {
  Wallet,
  ArrowDownCircle,
  PiggyBank,
  Eye,
  EyeOff,
} from "lucide-react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { getZodiacForMonth } from "../utils/zodiacUtils";

// 🔹 Rút gọn số tiền hiển thị
const formatNumberShort = (num) => {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B₫`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M₫`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k₫`;
  return `${num.toLocaleString()}₫`;
};

export default function Summary({ items = [], selectedMonth, selectedYear }) {
  const [showValues, setShowValues] = useState(false);

  // ============================================
  // 🔥 LƯƠNG & CHI tiêu từ expenses
  // ============================================
  const monthSalary = items
    .filter((i) => i.type === "salary")
    .reduce((s, i) => s + Number(i.amount || 0), 0);

  const totalExpense = items
    .filter((i) => i.type !== "salary")
    .reduce((s, i) => s + Number(i.amount || 0), 0);

  const remaining = monthSalary - totalExpense;

  // ============================================
  // ⭐ Component item chung
  // ============================================
  const SummaryItem = ({ label, value, color, icon: Icon }) => {
    const [open, setOpen] = useState(false);
    return (
      <Tooltip.Root open={open} onOpenChange={setOpen}>
        <Tooltip.Trigger asChild>
          <div
            className={`bg-white rounded-xl p-4 shadow-sm border border-gray-100 
              flex flex-col items-center justify-center cursor-pointer w-full 
              transition-transform active:scale-95`}
            onClick={() => setOpen((o) => !o)}
          >
            {Icon && <Icon className={`w-6 h-6 mb-1 ${color}`} />}
            <p className="text-sm text-gray-500 font-medium">{label}</p>

            <p className={`text-lg font-semibold truncate max-w-full ${color}`}>
              {showValues ? formatNumberShort(value) : "••••••"}
            </p>
          </div>
        </Tooltip.Trigger>

        {showValues && (
          <Tooltip.Content
            side="top"
            align="center"
            className="rounded-md bg-gray-900 text-white text-xs px-2 py-1 shadow-lg z-50"
          >
            {value.toLocaleString()}₫
            <Tooltip.Arrow className="fill-gray-900" />
          </Tooltip.Content>
        )}
      </Tooltip.Root>
    );
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-5 rounded-2xl shadow-md border border-blue-100">
      {/* 🔹 Header */}
      <div className="flex items-center justify-center mb-4 relative">
        <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <span className="text-2xl animate-bounce-slow inline-block">
            {getZodiacForMonth(selectedMonth, selectedYear)}
          </span>
          Tổng hợp tháng {selectedMonth + 1}/{selectedYear}
        </h2>

        <button
          onClick={() => setShowValues((v) => !v)}
          className="absolute right-0 text-gray-500 hover:text-gray-700 transition"
        >
          {showValues ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      {/* 🔸 Lương + Tổng chi */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <SummaryItem
          label="Lương"
          value={monthSalary}
          color="text-green-600"
          icon={Wallet}
        />

        <SummaryItem
          label="Tổng chi"
          value={totalExpense}
          color="text-red-500"
          icon={ArrowDownCircle}
        />
      </div>

      {/* 🔹 Còn lại */}
      <SummaryItem
        label="Còn lại"
        value={remaining}
        color={remaining < 0 ? "text-red-500" : "text-blue-600"}
        icon={PiggyBank}
      />
    </div>
  );
}
