import { useState, useRef, useEffect } from "react";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "../lib/firebase";
import {
  CalendarDays,
  CirclePlus,
  FileText,
  BanknoteArrowUp,
} from "lucide-react";
import DatePicker from "react-datepicker";
import { vi } from "date-fns/locale";
import "react-datepicker/dist/react-datepicker.css";
import Toast from "./Toast";

export default function SalaryForm({
  user,
  setItems,
  selectedMonth,
  selectedYear,
}) {
  const [form, setForm] = useState({
    note: "",
    amount: "",
    date: new Date().toISOString().split("T")[0],
  });

  const [open, setOpen] = useState(false);
  const [openCalendar, setOpenCalendar] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "info" });
  const modalRef = useRef();
  const [submitting, setSubmitting] = useState(false);

  const MAX_AMOUNT = 999_999_999_999;

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
    if (submitting) return;
    setSubmitting(true);

    if (!user) {
      showToast("Vui lòng đăng nhập", "error");
      setSubmitting(false);
      return;
    }

    const { note, amount, date } = form;
    const amountNum = Number(amount);

    if (!amount) {
      showToast("Vui lòng nhập số tiền", "error");
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

    const newSalary = {
      type: "salary",
      userId: user.uid,
      note: note.trim(),
      amount: amountNum,
      date: new Date(date).toISOString(),
      month: Number(selectedMonth),
      year: Number(selectedYear),
      createdAt: serverTimestamp(),
    };

    try {
      const ref = await addDoc(collection(db, "expenses"), newSalary);
      setItems((prev) => [{ id: ref.id, ...newSalary }, ...prev]);

      setForm({
        note: "",
        amount: "",
        date: new Date().toISOString().split("T")[0],
      });

      setOpen(false);
      showToast("💵 Đã thêm lương tháng này!", "success");
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
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast({ message: "", type: "info" })}
        />
      )}

      {/* Nút mở popup */}
      <div className="flex justify-end">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg hover:brightness-110 active:scale-95 transition-all duration-200"
        >
          <CirclePlus className="w-5 h-5" />
          Nhập lương
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
            className="relative bg-white w-11/12 max-w-md p-6 rounded-xl shadow-2xl z-10"
            onMouseDown={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Nhập lương tháng</h3>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-800"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* Ghi chú */}
              <div className="relative">
                <FileText className="absolute right-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  className="w-full border p-2 rounded"
                  placeholder="Ghi chú (tuỳ chọn)"
                  value={form.note}
                  onChange={(e) => handleChange("note", e.target.value)}
                />
              </div>

              {/* Số tiền */}
              <div className="relative">
                <BanknoteArrowUp className="absolute right-3 top-3 text-gray-400 w-5 h-5" />
                <input
                  className="w-full border p-2 rounded text-left"
                  placeholder="Số tiền lương"
                  value={form.amount.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/,/g, "");
                    if (/^\d*$/.test(raw)) handleChange("amount", raw);
                  }}
                  inputMode="numeric"
                />
              </div>

              {/* Chọn ngày */}
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-600 flex items-center gap-1">
                  <CalendarDays className="w-4 h-4 text-green-500" />
                  Ngày nhận:
                </span>

                <button
                  type="button"
                  onClick={() => setOpenCalendar(true)}
                  className="bg-white border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-700 hover:bg-green-50 flex items-center gap-2 shadow-sm transition"
                >
                  {new Date(form.date).toLocaleDateString("vi-VN")}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const today = new Date();
                    if (
                      today.getMonth() === Number(selectedMonth) &&
                      today.getFullYear() === Number(selectedYear)
                    ) {
                      handleChange("date", today.toISOString().split("T")[0]);
                      showToast("Đã chọn ngày hôm nay!", "success");
                    } else {
                      showToast("Không phải tháng hiện tại", "error");
                    }
                  }}
                  className="text-xs text-green-600 hover:underline ml-1"
                >
                  Hôm nay
                </button>
              </div>

              {/* Thông tin */}
              <div className="flex justify-between items-center text-sm text-gray-500">
                <span>
                  Tháng: {Number(selectedMonth) + 1} / {selectedYear}
                </span>
                <span className="italic">
                  Ngày nhận:{" "}
                  {new Date(form.date).toLocaleDateString("vi-VN")}
                </span>
              </div>

              {/* Nút */}
              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={submitting}
                  className={
                    "flex-1 py-2 rounded text-white flex items-center justify-center gap-2 " +
                    (submitting
                      ? "bg-green-400 cursor-not-allowed"
                      : "bg-green-600 hover:brightness-110")
                  }
                >
                  {submitting ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Đang lưu...
                    </>
                  ) : (
                    "Lưu"
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => !submitting && setOpen(false)}
                  className="flex-1 bg-gray-200 py-2 rounded hover:bg-gray-300"
                >
                  Hủy
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Calendar Popup */}
      {openCalendar && (
        <Popup onClose={() => setOpenCalendar(false)}>
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            Chọn ngày nhận lương
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
              className="bg-green-600 text-white px-4 py-1.5 rounded-lg hover:brightness-110"
            >
              Đóng
            </button>
          </div>
        </Popup>
      )}
    </>
  );
}

/* =======================
   Popup dùng chung
======================= */
function Popup({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-2xl shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}
