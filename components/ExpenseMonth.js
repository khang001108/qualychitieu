import { useState, useRef, useEffect } from "react";
import { CalendarDays } from "lucide-react";
import { getZodiacForMonth } from "../utils/zodiacUtils";

const monthNames = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4",
  "Tháng 5", "Tháng 6", "Tháng 7", "Tháng 8",
  "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

export default function ExpenseMonth({
  selectedMonth,
  setSelectedMonth,
  selectedYear,
  setSelectedYear,
}) {
  const [open, setOpen] = useState(false);
  const modalRef = useRef();

  // 🔸 Đóng popup bằng phím Esc
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* 🔹 Nút mở popup */}
      <div className="flex justify-end mt-2">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-indigo-600 
                     text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-xl 
                     hover:brightness-110 active:scale-95 transition-all duration-300"
        >
          <CalendarDays className="w-5 h-5" />
          <span className="font-semibold text-sm tracking-wide">Tháng/Năm</span>
        </button>
      </div>

      {/* 🔹 Popup chọn tháng/năm */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Nền mờ */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />

          {/* Hộp chọn */}
          <div
            ref={modalRef}
            className="relative z-10 bg-white w-11/12 max-w-md p-6 rounded-2xl shadow-2xl 
                       opacity-0 scale-95 animate-popIn transition-all"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-blue-100 p-2 rounded-full">
                  <CalendarDays className="w-5 h-5 text-blue-600" />
                </div>
                <h2 className="text-lg font-semibold text-gray-800">
                  Chọn tháng / năm
                </h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-800 text-xl transition"
              >
                ✕
              </button>
            </div>

            {/* Năm */}
            <div className="text-center mb-5">
              <p className="text-sm text-gray-500 mb-2">Năm</p>
              <div className="flex items-center justify-center gap-4">
                <button
                  onClick={() => setSelectedYear((y) => y - 1)}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-blue-100 active:scale-95 transition"
                >
                  ◀
                </button>
                <span className="text-xl font-bold text-gray-800 w-24 text-center">
                  {selectedYear}
                </span>
                <button
                  onClick={() => setSelectedYear((y) => y + 1)}
                  className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-blue-100 active:scale-95 transition"
                >
                  ▶
                </button>
              </div>
            </div>

            {/* Tháng */}
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-2">Tháng</p>
              <div className="grid grid-cols-4 gap-3">
                {monthNames.map((m, i) => {
                  const active = selectedMonth === i;
                  return (
                    <button
                      key={i}
                      onClick={() => setSelectedMonth(i)}
                      className={`flex flex-col items-center justify-center py-2 rounded-xl text-sm font-medium transition-all duration-300 transform
                        ${
                          active
                            ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-lg scale-105"
                            : "bg-gray-100 hover:bg-blue-100 text-gray-700 hover:scale-105 hover:shadow-md"
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

            {/* Gợi ý */}
            <p className="text-xs text-gray-500 text-center mt-5 italic">
              Dữ liệu sẽ tự động cập nhật khi bạn thay đổi tháng hoặc năm.
            </p>

            {/* Footer */}
            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setOpen(false)}
                className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300 active:scale-95 transition"
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
