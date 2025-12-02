import { useState, useRef, useEffect } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  CalendarDays,
  CirclePlus,
  PencilLine,
  BanknoteArrowDown,
} from "lucide-react";
import DatePicker from "react-datepicker";
import { vi } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import Toast from "./Toast";

export default function ExpenseForm({
  user,
  setItems,
  selectedMonth,
  selectedYear,
}) {
  const [form, setForm] = useState({
    name: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [open, setOpen] = useState(false);
  const [openCalendar, setOpenCalendar] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "info" });
  const modalRef = useRef();
  const [submitting, setSubmitting] = useState(false);
  const MAX_AMOUNT = 999_999_999_999;
  const baseBtn = `
  flex items-center gap-2 
  px-5 py-2.5 rounded-xl shadow-md 
  text-white text-sm font-medium
  hover:brightness-110 active:scale-95 transition
`;

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
    if (submitting) return; // 🚫 tránh double submit
    setSubmitting(true);

    if (!user) {
      showToast("Vui lòng đăng nhập", "error");
      setSubmitting(false);
      return;
    }

    const { name, amount, date } = form;
    const amountNum = Number(amount);

    if (!name || !amount) {
      showToast("Nhập đầy đủ thông tin", "error");
      setSubmitting(false);
      return;
    }

    if (isNaN(amountNum) || amountNum <= 0) {
      showToast("Số tiền không hợp lệ", "error");
      setSubmitting(false);
      return;
    }

    if (amountNum > MAX_AMOUNT) {
      showToast(
        `Số tiền không được vượt quá ${MAX_AMOUNT.toLocaleString()}₫`,
        "error"
      );
      setSubmitting(false);
      return;
    }

    const d = new Date(date);
    if (
      d.getMonth() !== Number(selectedMonth) ||
      d.getFullYear() !== Number(selectedYear)
    ) {
      showToast("❕ Ngày không thuộc tháng đang chọn", "error");
      setSubmitting(false);
      return;
    }

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
      setForm({
        name: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
      });
      setOpen(false);
      showToast("Bạn đã thêm một khoản chi mới!", "success");
    } catch (err) {
      console.error("Lỗi thêm:", err);
      showToast("Thêm thất bại", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {toast.message && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-orange-500 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-fade-in-out z-[9999]">
          {toast.message}
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={() => setOpen(true)}
          className={`${baseBtn} bg-orange-500`}
        >
          <CirclePlus className="w-5 h-5" />
          Thêm khoản chi
        </button>
      </div>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onMouseDown={(e) =>
            modalRef.current &&
            !modalRef.current.contains(e.target) &&
            !submitting &&
            setOpen(false)
          }

        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          <div
            ref={modalRef}
            className="
  relative w-11/12 max-w-md p-6 rounded-xl shadow-2xl z-10
  bg-white dark:bg-gray-900
  text-gray-800 dark:text-gray-200
  border border-gray-200 dark:border-gray-700
  transition-colors duration-300
"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                Thêm khoản chi</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="relative">
                <PencilLine className="absolute right-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  className="w-full border p-2 rounded bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700 transition-colors duration-300"
                  placeholder="Tên khoản chi"
                  value={form.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
              </div>

              <div className="relative">
                <BanknoteArrowDown className="absolute right-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  className="
    w-full border p-2 rounded text-left
    bg-white dark:bg-gray-800
    text-gray-800 dark:text-gray-200
    border-gray-300 dark:border-gray-700
    placeholder-gray-400 dark:placeholder-gray-500
    transition-colors duration-300
  "

                  placeholder="Số tiền"
                  value={form.amount
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/,/g, "");
                    if (/^\d*$/.test(raw)) handleChange("amount", raw);
                  }}
                  inputMode="numeric"
                />
              </div>

              {/* 🔹 Nút mở popup chọn ngày */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-400 flex items-center gap-1">
                  <CalendarDays className="w-4 h-4 text-orange-500" />
                  Ngày chi:
                </span>
                <button
                  type="button"
                  onClick={() => setOpenCalendar(true)}
                  className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-orange-50 dark:hover:bg-orange-900 flex items-center gap-2 shadow-sm transition"
                >
                  {new Date(form.date).toLocaleDateString("vi-VN")}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    const todayMonth = today.getMonth();
                    const todayYear = today.getFullYear();

                    if (
                      todayMonth === Number(selectedMonth) &&
                      todayYear === Number(selectedYear)
                    ) {
                      handleChange("date", today.toISOString().split("T")[0]);
                      showToast("✅ Đã chọn ngày hôm nay!", "success");
                    } else {
                      showToast("❕ Không phải tháng hiện tại", "error");
                    }
                  }}
                  className="text-xs text-orange-600 hover:underline ml-1"
                >
                  Hôm nay
                </button>
              </div>

              <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                <span>
                  Tháng tiêu: {Number(selectedMonth) + 1} / {selectedYear}
                </span>
                <span className="italic">
                  Ngày tạo: {new Date(form.date).toLocaleDateString("vi-VN")}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className={
                    "flex-1 py-2 rounded text-white flex items-center justify-center gap-2 " +
                    (submitting
                      ? "bg-orange-300 cursor-not-allowed"
                      : "bg-orange-500 hover:brightness-110")
                  }
                >
                  {submitting ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Đang thêm...
                    </>
                  ) : (
                    "Thêm"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => !submitting && setOpen(false)}
                  className="flex-1 bg-gray-200 dark:bg-gray-700 py-2 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 📅 Popup chọn ngày giống ExpenseList */}
      {openCalendar && (
        <Popup onClose={() => setOpenCalendar(false)}>
          <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-gray-200">
            Chọn ngày chi
          </h3>
          <DatePicker
            selected={new Date(form.date)}
            onChange={(d) => {
              handleChange("date", d.toISOString().split("T")[0]);
              setOpenCalendar(false);
            }}
            inline
            locale={vi}
            dateFormat="dd/MM/yyyy"
            openToDate={new Date(selectedYear, selectedMonth, 1)}
            filterDate={(d) =>
              d.getMonth() === Number(selectedMonth) &&
              d.getFullYear() === Number(selectedYear)
            }
          />

          <div className="flex justify-end mt-3">
            <button
              onClick={() => setOpenCalendar(false)}
              className="bg-orange-500 text-white px-4 py-1.5 rounded-lg hover:brightness-110"
            >
              Đóng
            </button>
          </div>
        </Popup>
      )}

      {toast.message && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "info" })}
        />
      )}
    </>
  );
}

/* ==============================
   📦 Popup dùng chung
================================ */
function Popup({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="
    bg-white dark:bg-gray-900
    p-6 rounded-2xl shadow-2xl
    border border-gray-200 dark:border-gray-700
    text-gray-800 dark:text-gray-200
    transition-colors duration-300
  "
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );

}
