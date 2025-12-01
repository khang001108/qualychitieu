import { useEffect, useState, useRef, useMemo } from "react";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { Trash2 } from "lucide-react";
import { db } from "../lib/firebase";
import { getZodiacForMonth } from "../utils/zodiacUtils";

/* ==========================
   Format number
========================== */
const formatNumberShort = (num) => {
  if (num >= 1_000_000) {
    const val = Math.floor(num / 100_000) / 10;
    return `${val}M ₫`;
  } else if (num >= 1_000) {
    const val = Math.floor(num / 100) / 10;
    return `${val}k ₫`;
  } else {
    return `${num}₫`;
  }
};

export default function ExpenseList({
  user,
  items,
  setItems,
  selectedMonth,
  selectedYear,
}) {
  const [selectedItem, setSelectedItem] = useState(null);
  const [sortType, setSortType] = useState("newest");
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [openPinned, setOpenPinned] = useState(false);

  /* ==========================
     Load Firestore
  ========================== */
  useEffect(() => {
    if (!user || selectedMonth == null || selectedYear == null)
      return setItems([]);

    const q = query(
      collection(db, "expenses"),
      where("userId", "==", user.uid),
      where("month", "==", Number(selectedMonth)),
      where("year", "==", Number(selectedYear)),
      orderBy("createdAt", "desc")
    );

    const unsub = onSnapshot(q, (snap) =>
      setItems(
        snap.docs.map((d) => {
          const x = d.data();
          return {
            id: d.id,
            type: x.type || "expense",
            name: x.name || "",
            note: x.note || "",
            pinned: x.pinned || false,
            amount: Number(String(x.amount).replace(/,/g, "")) || 0,
            date: x.date || "",
            month: x.month ?? null,
            year: x.year ?? null,
            createdAt: x.createdAt ? x.createdAt.toDate() : new Date(x.date),
          };
        })
      )
    );

    return unsub;
  }, [user, selectedMonth, selectedYear]);

  /* ==========================
     Sort Items
  ========================== */
  const sorted = useMemo(() => {
    const c = [...items];
    const compare = {
      high: (a, b) => b.amount - a.amount,
      low: (a, b) => a.amount - b.amount,
      newest: (a, b) => new Date(b.date) - new Date(a.date),
      oldest: (a, b) => new Date(a.date) - new Date(b.date),
    }[sortType];
    return c.sort(compare);
  }, [items, sortType]);

  const remove = async (id) => {
    await deleteDoc(doc(db, "expenses", id));
    setConfirmDelete(null);
  };

  /* ==========================
      UI
  ========================== */
  return (
    <>
      <div className="w-full bg-white p-6 md:p-10 rounded-2xl shadow-lg border border-gray-100">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between md:items-center mb-5 gap-3">
          <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            📋 Chi tiêu tháng {selectedMonth + 1}/{selectedYear}
            <span className="text-2xl animate-bounce-slow inline-block">
              {getZodiacForMonth(selectedMonth, selectedYear)}
            </span>
          </h2>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setOpenPinned(true)}
              className="flex items-center gap-1 bg-gradient-to-r from-red-500 to-red-600 text-white px-4 py-2 rounded-xl shadow"
            >
              📌 Đã ghim ({items.filter((i) => i.pinned).length})
            </button>

            <select
              value={sortType}
              onChange={(e) => setSortType(e.target.value)}
              className="border rounded-xl text-sm px-3 py-2"
            >
              <option value="newest">⤵ Cuối tháng</option>
              <option value="oldest">⤴ Đầu tháng</option>
              <option value="high">💸 Tiêu nhiều</option>
              <option value="low">💰 Tiêu ít</option>
            </select>
          </div>
        </div>

        {/* LIST */}
        <div className="max-h-80 overflow-y-auto pr-2 space-y-3">
          {sorted.map((item) => {
            const isSalary = item.type === "salary";

            return (
              <div
                key={item.id}
                onClick={() => setSelectedItem(item)}
                className="relative flex justify-between items-center p-4 bg-gradient-to-r from-white to-orange-50 border border-gray-100 rounded-2xl shadow-sm hover:shadow-md"
              >
                {/* Left Border */}
                <div
                  className={
                    "absolute left-0 top-0 h-full w-1 rounded-l-2xl " +
                    (isSalary ? "bg-green-500" : "bg-orange-500")
                  }
                />

                {/* ICON + TEXT */}
                <div className="flex items-center gap-3">
                  <div
                    className={
                      "w-10 h-10 flex items-center justify-center rounded-full shadow-inner " +
                      (isSalary
                        ? "bg-green-100 text-green-600"
                        : "bg-orange-100 text-orange-600")
                    }
                  >
                    {isSalary ? "💵" : "💸"}
                  </div>

                  <div>
                    <p className="font-semibold text-gray-800 text-base">
                      {isSalary ? item.note || "Lương tháng" : item.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      📅 {new Date(item.date).toLocaleDateString("vi-VN")}
                    </p>
                  </div>
                </div>

                {/* MONEY + DELETE */}
                <div className="flex flex-col items-end gap-1">
                  <p
                    className={
                      "text-lg font-bold " +
                      (isSalary ? "text-green-600" : "text-red-500")
                    }
                  >
                    {isSalary
                      ? `+${formatNumberShort(item.amount)}`
                      : `-${formatNumberShort(item.amount)}`}
                  </p>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setConfirmDelete(item.id);
                    }}
                    className="p-1 rounded-lg text-white bg-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats */}
        <div className="mt-5 text-center text-sm text-gray-600 font-medium">
          <p>🧾 Tổng giao dịch: {sorted.length}</p>

          <div className="flex justify-center gap-6 mt-2">
            <span className="text-orange-600">
              💸 Chi: {sorted.filter((i) => i.type !== "salary").length}
            </span>

            <span className="text-green-600">
              💵 Lương: {sorted.filter((i) => i.type === "salary").length}
            </span>
          </div>
        </div>
      </div>

      {/* ==========================
          POPUP DANH SÁCH GHIM
      ========================== */}
      {openPinned && (
        <Popup onClose={() => setOpenPinned(false)}>
          <h3 className="text-lg font-semibold mb-3 text-gray-800">
            📌 Danh sách khoản ghim
          </h3>

          <div className="max-h-64 overflow-y-auto space-y-3 pr-2">
            {items.filter((i) => i.pinned).length === 0 && (
              <p className="text-center text-sm text-gray-500">
                Chưa có khoản ghim.
              </p>
            )}

            {items
              .filter((i) => i.pinned)
              .map((i) => (
                <div
                  key={i.id}
                  onClick={() => {
                    setSelectedItem(i);
                    setOpenPinned(false);
                  }}
                  className="p-3 bg-yellow-50 border rounded-xl flex justify-between items-center cursor-pointer hover:bg-yellow-100"
                >
                  <div>
                    <p className="font-semibold">
                      {i.type === "salary" ? "💵 Lương" : "💸 Chi"} —{" "}
                      {i.amount.toLocaleString()}₫
                    </p>
                    <p className="text-xs text-gray-600">
                      {new Date(i.date).toLocaleDateString("vi-VN")}
                    </p>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateDoc(doc(db, "expenses", i.id), { pinned: false });
                    }}
                    className="px-3 py-1 bg-red-500 text-white rounded-lg text-sm"
                  >
                    Bỏ ghim
                  </button>
                </div>
              ))}
          </div>

          <div className="mt-4 text-right">
            <button
              onClick={() => setOpenPinned(false)}
              className="px-4 py-2 bg-yellow-500 text-white rounded-lg"
            >
              Đóng
            </button>
          </div>
        </Popup>
      )}

      {/* ==========================
          POPUP CHI TIẾT
      ========================== */}
      {selectedItem && (
        <ExpenseDetailPopup
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}

      {/* ==========================
          POPUP CONFIRM DELETE
      ========================== */}
      {confirmDelete && (
        <Popup onClose={() => setConfirmDelete(null)}>
          <h3 className="text-lg font-semibold text-gray-800 mb-2">
            Xoá khoản này?
          </h3>

          <p className="text-sm text-gray-500 mb-4">
            Thao tác này không thể hoàn tác.
          </p>

          <div className="flex justify-center gap-3">
            <button
              onClick={() => setConfirmDelete(null)}
              className="px-4 py-2 bg-gray-200 rounded-lg"
            >
              Hủy
            </button>

            <button
              onClick={() => remove(confirmDelete)}
              className="px-4 py-2 bg-red-500 text-white rounded-lg"
            >
              Xoá
            </button>
          </div>
        </Popup>
      )}
    </>
  );
}

/* ==========================
   POPUP CHUNG
========================== */
function Popup({ children, onClose }) {
  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-2xl shadow-2xl w-[420px] max-w-full mx-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

/* ==========================
   POPUP CHI TIẾT
========================== */
function ExpenseDetailPopup({ item, onClose }) {
  const ref = useRef();
  const [localItem, setLocalItem] = useState(item);
  const isSalary = localItem.type === "salary";

  const togglePin = async () => {
    const newPinned = !localItem.pinned;

    await updateDoc(doc(db, "expenses", localItem.id), {
      pinned: newPinned,
    });

    setLocalItem({
      ...localItem,
      pinned: newPinned,
    });
  };

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
      onMouseDown={(e) => !ref.current?.contains(e.target) && onClose()}
    >
      <div
        ref={ref}
        className={
          "relative bg-white p-6 w-11/12 max-w-md rounded-2xl shadow-xl " +
          (isSalary ? "border-green-500 bg-green-50" : "border-orange-500 bg-orange-50")
        }
      >
        {/* NÚT GHIM GÓC PHẢI */}
        <button
          onClick={togglePin}
          className={
            "absolute top-3 right-3 px-3 py-1 rounded-lg text-sm shadow " +
            (localItem.pinned
              ? "bg-yellow-400 text-white"
              : "bg-gray-300 text-gray-700")
          }
        >
          {localItem.pinned ? "📌 Đã ghim" : "📍 Ghim"}
        </button>

        {/* TITLE */}
        <h3 className="text-lg font-semibold mb-3 text-gray-800 pr-20">
          {isSalary ? "Chi tiết lương" : "Chi tiết khoản chi"}
        </h3>

        {/* DETAILS */}
        <div className="space-y-2 text-gray-700">
          {isSalary ? (
            <p><b>📄 Ghi chú:</b> {localItem.note || "Không có"}</p>
          ) : (
            <p><b>🏷 Tên:</b> {localItem.name}</p>
          )}

          <p><b>💰 Số tiền:</b> {localItem.amount.toLocaleString()}₫</p>

          <p className="flex items-center gap-2">
            <b>📅 Ngày:</b> {new Date(localItem.date).toLocaleDateString("vi-VN")}
          </p>

          <p>
            <b>🗓 Tháng/Năm:</b> {localItem.month + 1} / {localItem.year}
          </p>
        </div>

        {/* CLOSE BUTTON */}
        <div className="text-right mt-4">
          <button
            onClick={onClose}
            className={
              "px-4 py-2 rounded-lg text-white " +
              (isSalary ? "bg-green-600" : "bg-orange-500")
            }
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );

}
