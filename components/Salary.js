import { useEffect, useState, useRef } from "react";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Loader2, CheckCircle, AlertCircle, Wallet } from "lucide-react";
import { getZodiacForMonth } from "../utils/zodiacUtils";
import { PencilLine, BanknoteArrowUp, BanknoteArrowDown } from "lucide-react";

const monthNames = [
  "Tháng 1", "Tháng 2", "Tháng 3", "Tháng 4", "Tháng 5", "Tháng 6",
  "Tháng 7", "Tháng 8", "Tháng 9", "Tháng 10", "Tháng 11", "Tháng 12",
];

export default function Salary({ user, salary, setSalary, selectedMonth, selectedYear }) {
  const [loading, setLoading] = useState(true);
  const [inputValue, setInputValue] = useState("");
  const [status, setStatus] = useState(null);
  const [open, setOpen] = useState(false);
  const modalRef = useRef();

  // 🔹 Lấy dữ liệu từ Firestore
  useEffect(() => {
    if (!user) return;
    const fetchSalary = async () => {
      try {
        const ref = doc(db, "users", user.uid);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data().salary || {};
          setSalary(data);
        } else {
          setSalary({});
        }
      } catch (err) {
        console.error("Lỗi tải lương:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchSalary();
  }, [user]);

  // 🔹 Lưu dữ liệu
  const handleSave = async () => {
    if (!user) return alert("Bạn cần đăng nhập");
    if (inputValue.trim() === "") return alert("Vui lòng nhập số tiền lương hợp lệ");

    const val = Number(inputValue.replace(/,/g, ""));
    if (isNaN(val) || val <= 0) return alert("Vui lòng nhập số lớn hơn 0");

    const newSalary = {
      ...salary,
      [String(selectedYear)]: {
        ...(salary[String(selectedYear)] || {}),
        [String(selectedMonth)]: val,
      },
    };

    setStatus("loading");

    try {
      await setDoc(doc(db, "users", user.uid), { salary: newSalary }, { merge: true });
      setSalary(newSalary);
      setStatus("success");

      // 🔒 Không cho lưu lại khi đã lưu thành công
      setTimeout(() => {
        setOpen(false);
        setInputValue("");
        setStatus(null);
      }, 1200);
    } catch (err) {
      console.error("Lỗi cập nhật:", err);
      setStatus("error");
      setTimeout(() => setStatus(null), 2500);
    }
  };

  // 🔹 Đóng modal bằng Esc
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  if (!user) return null;

  if (loading)
    return (
      <div className="bg-white p-4 rounded-xl shadow flex items-center justify-center text-gray-500">
        <Loader2 className="animate-spin w-5 h-5 mr-2" />
        Đang tải dữ liệu...
      </div>
    );

  return (
    <>
      <div className="flex justify-end mt-2">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:brightness-110 active:scale-95 transition-all duration-200"
        >
          <Wallet className="w-5 h-5" />
          <span className="font-semibold text-sm tracking-wide">
            Nhập lương
          </span>
        </button>
      </div>

      {/* 🔹 Popup nhập lương */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onMouseDown={(e) => {
            if (modalRef.current && !modalRef.current.contains(e.target))
              setOpen(false);
          }}
        >
          {/* Nền mờ */}
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />

          {/* Hộp popup */}
          <div
            ref={modalRef}
            className="relative bg-white w-11/12 max-w-sm p-6 rounded-xl shadow-2xl z-10"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                <Wallet className="text-green-600 w-5 h-5" />
                <span className="text-2xl animate-bounce-slow inline-block">
                  {getZodiacForMonth(selectedMonth, selectedYear)}
                </span>
                {monthNames[selectedMonth]} {selectedYear}
              </h2>

              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-800 text-lg"
              >
                ✕
              </button>
            </div>

            <p className="text-gray-500 text-sm mb-2">Nhập lương tháng này:</p>

            <div className="flex gap-2 mb-4">
              <div className="relative flex-1">
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">₫</span>
                <div className="relative">
                  <BanknoteArrowUp className="absolute right-3 top-3 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    value={inputValue.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/,/g, "");
                      if (!/^\d*$/.test(raw)) return;
                      setInputValue(raw);
                    }}
                    placeholder="Nhập số tiền"
                    className="w-full pl-3 pr-6 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 outline-none transition text-gray-800"
                    inputMode="numeric"
                  />
                </div>
              </div>
            </div>

            {/* Trạng thái */}
            {status === "success" && (
              <div className="text-green-600 flex items-center justify-center text-sm mb-2">
                <CheckCircle className="w-4 h-4 mr-1" /> Đã lưu thành công
              </div>
            )}
            {status === "error" && (
              <div className="text-red-600 flex items-center justify-center text-sm mb-2">
                <AlertCircle className="w-4 h-4 mr-1" /> Lưu thất bại
              </div>
            )}

            {/* Nút */}
            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={status === "loading" || status === "success"}
                className={`flex-1 py-2 rounded-lg text-white font-medium transition ${status === "loading" || status === "success"
                  ? "bg-green-300 cursor-not-allowed"
                  : "bg-green-500 hover:bg-green-600"
                  }`}
              >
                {status === "loading" ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin w-4 h-4 mr-1" /> Đang lưu...
                  </span>
                ) : (
                  "Lưu"
                )}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="flex-1 bg-gray-200 py-2 rounded-lg hover:bg-gray-300 text-gray-700"
              >
                Hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
