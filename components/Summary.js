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

const formatNumberShort = (num) => {
  if (num >= 1_000_000_000) return `${(num / 1_000_000_000).toFixed(1)}B₫`;
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M₫`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}k₫`;
  return `${num.toLocaleString()}₫`;
};

export default function Summary({ items = [], selectedMonth, selectedYear }) {
  const [showValues, setShowValues] = useState(false);

  const monthSalary = items
    .filter((i) => i.type === "salary")
    .reduce((s, i) => s + Number(i.amount || 0), 0);

  const totalExpense = items
    .filter((i) => i.type !== "salary")
    .reduce((s, i) => s + Number(i.amount || 0), 0);

  const remaining = monthSalary - totalExpense;

  const SummaryItem = ({ label, value, color, icon: Icon }) => {
    const [open, setOpen] = useState(false);

    return (
      <Tooltip.Root open={open} onOpenChange={setOpen}>
        <Tooltip.Trigger asChild>
          <div
            className="
              w-full p-4 rounded-xl shadow-sm border cursor-pointer 
              bg-white dark:bg-gray-900
              border-gray-200 dark:border-gray-700
              text-gray-800 dark:text-gray-200
              flex flex-col items-center justify-center
              transition active:scale-95
            "
            onClick={() => setOpen((o) => !o)}
          >
            {Icon && <Icon className={`w-6 h-6 mb-1 ${color}`} />}
            <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
            <p className={`text-lg font-semibold truncate max-w-full ${color}`}>
              {showValues ? formatNumberShort(value) : "••••••"}
            </p>
          </div>
        </Tooltip.Trigger>

        {showValues && (
          <Tooltip.Content
            side="top"
            align="center"
            className="
              rounded-md px-2 py-1 text-xs shadow-lg z-50
              bg-gray-900 text-white dark:bg-black dark:text-gray-100
            "
          >
            {value.toLocaleString()}₫
            <Tooltip.Arrow className="fill-gray-900 dark:fill-black" />
          </Tooltip.Content>
        )}
      </Tooltip.Root>
    );
  };

  return (
    <div
      className="
        p-5 rounded-2xl shadow-md border
        bg-gradient-to-br from-blue-50 to-indigo-50
        dark:bg-gradient-to-br dark:from-gray-800 dark:to-gray-900
        border-blue-100 dark:border-gray-700
        transition-colors
      "
    >
      {/* Header */}
      <div className="flex items-center justify-center mb-4 relative">
        <h2 className="text-lg font-semibold flex items-center gap-2">
          <span className="text-2xl animate-bounce-slow inline-block">
            {getZodiacForMonth(selectedMonth, selectedYear)}
          </span>
          <span className="text-gray-800 dark:text-gray-200">
            Tổng hợp tháng {selectedMonth + 1}/{selectedYear}
          </span>
        </h2>

        <button
          onClick={() => setShowValues((v) => !v)}
          className="
            absolute right-0 
            text-gray-500 dark:text-gray-300 
            hover:text-gray-700 dark:hover:text-white 
            transition
          "
        >
          {showValues ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>

      {/* Lương + Chi */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <SummaryItem
          label="Lương"
          value={monthSalary}
          color="text-green-500"
          icon={Wallet}
        />

        <SummaryItem
          label="Tổng chi"
          value={totalExpense}
          color="text-red-500"
          icon={ArrowDownCircle}
        />
      </div>

      {/* Còn lại */}
      <SummaryItem
        label="Còn lại"
        value={remaining}
        color={remaining < 0 ? "text-red-500" : "text-blue-500"}
        icon={PiggyBank}
      />
    </div>
  );
}
