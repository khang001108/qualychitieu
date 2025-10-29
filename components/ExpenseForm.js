import { useState, useRef, useEffect } from "react"; 
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import { CalendarDays, CirclePlus, PencilLine, BanknoteArrowDown } from "lucide-react";
import DatePicker from "react-datepicker";
import { vi } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import Toast from "./Toast";

export default function ExpenseForm({ user, setItems, selectedMonth, selectedYear }) {
  const [form, setForm] = useState({ name: "", amount: "", date: new Date().toISOString().split("T")[0] });
  const [open, setOpen] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "info" });
  const modalRef = useRef();
  const MAX_AMOUNT = 999_999_999_999;

  // 🔹 Đóng popup khi nhấn Esc
  useEffect(() => {
    const closeOnEsc = (e) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", closeOnEsc);
    return () => document.removeEventListener("keydown", closeOnEsc);
  }, []);

  const showToast = (message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "info" }), 3000);
  };

  const handleChange = (key, val) => setForm((f) => ({ ...f, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return alert("Vui lòng đăng nhập");
    const { name, amount, date } = form;
    const amountNum = Number(amount);

    if (!name || !amount) return showToast("Nhập đầy đủ thông tin", "error");
    if (isNaN(amountNum) || amountNum <= 0) return showToast("Số tiền không hợp lệ", "error");
    if (amountNum > MAX_AMOUNT)
      return showToast(`Số tiền không được vượt quá ${MAX_AMOUNT.toLocaleString()}₫`, "error");

    const newExpense = {
      userId: user.uid,
      name,
      amount: amountNum,
      date: new Date(date).toISOString(),
      month: Number(selectedMonth),
      year: Number(selectedYear),
      createdAt: serverTimestamp(),
    };

    try {
      const ref = await addDoc(collection(db, "expenses"), newExpense);
      setItems((prev) => [{ id: ref.id, ...newExpense }, ...prev]);
      setForm({ name: "", amount: "", date: new Date().toISOString().split("T")[0] });
      setOpen(false);
      showToast("Bạn đã thêm một khoản chi mới!", "success");
    } catch (err) {
      console.error("Lỗi thêm:", err);
      showToast("Thêm thất bại", "error");
    }
  };

  return (
    <>
      {/* 🔹 Toast nổi */}
      {toast.message && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-fade-in-out z-[9999]">
          {toast.message}
        </div>
      )}

      {/* 🔹 Nút mở popup */}
      <div className="flex justify-end">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:brightness-110 active:scale-95 transition-all duration-200"
        >
          <CirclePlus className="w-5 h-5" />
          Thêm khoản chi
        </button>
      </div>

      {/* 🔹 Popup */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onMouseDown={(e) => modalRef.current && !modalRef.current.contains(e.target) && setOpen(false)}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            ref={modalRef}
            className="relative bg-white w-11/12 max-w-md p-6 rounded-xl shadow-2xl z-10"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Thêm khoản chi</h3>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-800">
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <PencilLine className="absolute right-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  className="w-full border p-2 rounded"
                  placeholder="Tên khoản chi"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  autoFocus
                />
              </div>
              <div className="relative">
                <BanknoteArrowDown className="absolute right-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  className="w-full border p-2 rounded text-left"
                  placeholder="Số tiền"
                  value={form.amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/,/g, "");
                    if (/^\d*$/.test(raw)) handleChange("amount", raw);
                  }}
                  inputMode="numeric"
                />
              </div>

              {/* 🔹 Chọn ngày */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <CalendarDays className="w-4 h-4 text-orange-500" />
                  Ngày chi:
                </span>

                <DatePicker
                  selected={new Date(form.date)}
                  onChange={(d) => handleChange("date", d.toISOString().split("T")[0])}
                  locale={vi}
                  dateFormat="dd/MM/yyyy"
                  openToDate={new Date(selectedYear, selectedMonth, 1)}
                  minDate={new Date(selectedYear, selectedMonth, 1)}       // 🔹 ngày đầu tháng
                  maxDate={new Date(selectedYear, selectedMonth + 1, 0)}   // 🔹 ngày cuối tháng
                  renderCustomHeader={() => null} // 🔹 ẩn nút next/prev và header tháng
                  customInput={
                    <button
                      type="button"
                      className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 flex items-center gap-2 shadow-sm transition"
                    >
                      {new Date(form.date).toLocaleDateString("vi-VN")}
                    </button>
                  }
                />

                <button
                  type="button"
                  onClick={() => handleChange("date", new Date().toISOString().split("T")[0])}
                  className="text-xs text-orange-600 hover:underline ml-1"
                >
                  Hôm nay
                </button>
              </div>

              {/* Thông tin tháng / năm */}
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>Tháng Tiêu: {Number(selectedMonth) + 1} / {selectedYear}</span>
                <span className="italic">Ngày Tạo: {new Date(form.date).toLocaleDateString("vi-VN")}</span>
              </div>

              {/* Nút hành động */}
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-orange-500 text-white py-2 rounded hover:brightness-110">
                  Thêm
                </button>
                <button type="button" onClick={() => setOpen(false)} className="flex-1 bg-gray-200 py-2 rounded hover:bg-gray-300">
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast ẩn */}
      {toast.message && <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "info" })} />}
    </>
  );
}
