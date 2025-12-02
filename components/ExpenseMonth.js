import { useState, useRef, useEffect } from "react";
import { CalendarDays } from "lucide-react";
import { getZodiacForMonth } from "../utils/zodiacUtils";

const monthNames = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4",
  "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8",
  "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

/**
 * ExpenseMonth
 * Component chọn tháng / năm
 */
export default function ExpenseMonth({
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
}) {
  const [open, setOpen] = useState(false);
  const modalRef = useRef();

  // shared button style (tailwind-safe string)
  const baseBtn = `
    flex items-center gap-2
    px-5 py-2.5 rounded-xl shadow-md
    text-white text-sm font-medium
    hover:brightness-110 active:scale-95 transition
  `;

  // Button component để mọi nút giống nhau
  const Btn = ({ children, className = "", onClick, type = "button" }) => (
    <button
      type={type}
      onClick={onClick}
      className={`${baseBtn} ${className}`}
    >
      {children}
    </button>
  );

  // ESC → đóng popup
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* Button mở popup */}
      <div className="flex justify-end mt-2">
        <Btn className="bg-indigo-500" onClick={() => setOpen(true)}>
          <CalendarDays className="w-5 h-5" />
          <span className="select-none">Tháng/Năm</span>
        </Btn>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Modal */}
          <div
            ref={modalRef}
            className="
              relative z-10
              w-11/12 max-w-md p-6 rounded-2xl shadow-2xl
              bg-white dark:bg-gray-900
              border border-gray-200 dark:border-gray-700
              text-gray-800 dark:text-gray-200
              opacity-0 scale-95 animate-popIn transition-all
            "
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-full">
                  <CalendarDays className="w-5 h-5 text-blue-600 dark:text-blue-300" />
                </div>
                <h2 className="text-lg font-semibold">Chọn tháng / năm</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 text-xl transition"
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>

            {/* Chọn Năm */}
            <div className="text-center mb-5">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Năm</p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setSelectedYear((y) => y - 1)}
                  className="px-3 py-1.5 rounded-lg
                             bg-gray-100 dark:bg-gray-800
                             hover:bg-blue-100 dark:hover:bg-blue-900
                             active:scale-95 transition"
                  aria-label="Năm trước"
                >
                  ◀
                </button>

                <span className="text-xl font-bold w-24 text-center">
                  {selectedYear}
                </span>

                <button
                  onClick={() => setSelectedYear((y) => y + 1)}
                  className="px-3 py-1.5 rounded-lg
                             bg-gray-100 dark:bg-gray-800
                             hover:bg-blue-100 dark:hover:bg-blue-900
                             active:scale-95 transition"
                  aria-label="Năm sau"
                >
                  ▶
                </button>
              </div>
            </div>

            {/* Chọn Tháng */}
            <div className="text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Tháng</p>
              <div className="grid grid-cols-4 gap-3">
                {monthNames.map((m, i) => {
                  const active = selectedMonth === i;

                  return (
                    <button
                      key={i}
                      onClick={() => {
                        setSelectedMonth(i);
                        // Close modal for faster UX (optional)
                        setOpen(false);
                      }}
                      className={`flex flex-col items-center justify-center py-2 rounded-xl text-sm font-medium transition-all duration-300 transform
                        ${active
                          ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg scale-105"
                          : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-blue-100 dark:hover:bg-blue-900 hover:shadow-md hover:scale-105"
                        }`}
                    >
                      <span className="text-2xl mb-1 animate-bounce-slow">
                        {getZodiacForMonth(i, selectedYear)}
                      </span>
                      <span>{m.replace("Tháng ", "T")}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Hint */}
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-5 italic">
              Dữ liệu sẽ tự động cập nhật khi bạn thay đổi tháng hoặc năm.
            </p>

            {/* Footer */}
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 py-2 rounded-lg
                           bg-gray-200 dark:bg-gray-700
                           hover:bg-gray-300 dark:hover:bg-gray-600
                           active:scale-95 transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
