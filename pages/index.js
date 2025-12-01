// pages/index.js
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";

import SalaryForm from "../components/SalaryForm"; 
import ExpenseForm from "../components/ExpenseForm";
import ExpenseList from "../components/ExpenseList";
import Summary from "../components/Summary"; // ❗ bạn cần sửa Summary (tôi làm ở dưới)
import ExpenseChart from "../components/ExpenseChart"; // ❗ cần sửa biểu đồ (tôi làm ở dưới)
import ExpenseMonth from "../components/ExpenseMonth";

import { auth, db } from "../lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

import AccountPopup from "../components/AccountPopup";

import {
  LogOut,
  Trash2,
  Eye,
  EyeOff,
  Settings2,
  ChartLine,
  ArrowUp,
} from "lucide-react";

import { ICONS } from "../utils/iconUtils";

export default function Home() {
  const [user, setUser] = useState(null);

  const [items, setItems] = useState([]);          // chi + lương theo tháng
  const [yearItems, setYearItems] = useState([]);  // chi + lương theo năm

  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const [showAccount, setShowAccount] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showRemaining, setShowRemaining] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [toast, setToast] = useState(null);

  const chartRef = useRef();

  // 🔥 Tổng thu – chi cả năm (tính từ yearItems)
  const totalSalaryYear = yearItems
    .filter((i) => i.type === "salary")
    .reduce((s, i) => s + Number(i.amount || 0), 0);

  const totalExpenseYear = yearItems
    .filter((i) => i.type !== "salary")
    .reduce((s, i) => s + Number(i.amount || 0), 0);

  const remainingYear = totalSalaryYear - totalExpenseYear;

  // 🔹 Lắng nghe trạng thái đăng nhập
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u || null));
    return () => unsub();
  }, []);

  // 🔹 Load dữ liệu theo tháng
  useEffect(() => {
    if (!user) return setItems([]);

    import("firebase/firestore").then(
      ({ collection, query, where, onSnapshot }) => {
        const q = query(
          collection(db, "expenses"),
          where("userId", "==", user.uid),
          where("month", "==", Number(selectedMonth)),
          where("year", "==", Number(selectedYear))
        );

        const unsub = onSnapshot(q, (snap) => {
          setItems(
            snap.docs.map((d) => ({
              id: d.id,
              ...d.data(),
            }))
          );
        });

        return unsub;
      }
    );
  }, [user, selectedMonth, selectedYear]);

  // 🔹 Load dữ liệu theo năm (cho chart & tổng hợp)
  useEffect(() => {
    if (!user) return setYearItems([]);

    import("firebase/firestore").then(
      ({ collection, query, where, onSnapshot }) => {
        const q = query(
          collection(db, "expenses"),
          where("userId", "==", user.uid),
          where("year", "==", Number(selectedYear))
        );

        const unsub = onSnapshot(q, (snap) => {
          setYearItems(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        });

        return unsub;
      }
    );
  }, [user, selectedYear]);

  // 🔹 Hiện nút scroll top
  useEffect(() => {
    const onScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // 🔹 Auto-hide toast
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  // 🚪 Logout
  const handleLogout = async () => {
    await signOut(auth);
    setItems([]);
    setYearItems([]);
    setUser(null);
  };

  // 🧹 Xóa toàn bộ dữ liệu tháng (chi + lương)
  const handleDeleteAll = async () => {
    try {
      const {
        collection,
        query,
        where,
        getDocs,
        deleteDoc,
      } = await import("firebase/firestore");

      const q = query(
        collection(db, "expenses"),
        where("userId", "==", user.uid),
        where("month", "==", Number(selectedMonth)),
        where("year", "==", Number(selectedYear))
      );

      const snap = await getDocs(q);

      await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));

      setToast({
        type: "success",
        msg: `Đã xóa toàn bộ dữ liệu tháng ${selectedMonth + 1}/${selectedYear}`,
      });

      setItems([]);
    } catch (err) {
      setToast({ type: "error", msg: "❌ Lỗi khi xóa dữ liệu!" });
    }
  };

  const handleCloseAccountPopup = (updated) => {
    setShowAccount(false);
    if (!updated) return;

    setUser((prev) => ({
      ...prev,
      displayName: updated.displayName ?? prev.displayName,
      avatar: updated.avatar ?? prev.avatar,
      avatarColor: updated.avatarColor ?? prev.avatarColor,
    }));
  };

  // =======================
  // 🖥️ Login UI
  // =======================
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-blue-50 to-white">
        <div className="bg-white p-10 rounded-3xl shadow-2xl text-center w-80 sm:w-96 border border-gray-100">
          <h2 className="text-3xl font-extrabold mb-4 text-gray-800">Một ngày mới⭐,</h2>
          <h2 className="text-3xl font-extrabold mb-5 text-gray-800">một cơ hội mới🌈!</h2>
          <a
            href="/login"
            className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg hover:scale-105 transition"
          >
            Bắt đầu nào
          </a>
          <div className="text-sm text-gray-400 mt-4">Sáng tạo bởi Khazg.</div>
        </div>
      </div>
    );
  }

  // =======================
  // 🏠 Giao diện chính
  // =======================
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-200 via-blue-50 to-white">
      <div className="w-full max-w-6xl mx-auto p-4 space-y-5">

        {/* 🔹 Header */}
        <div className="bg-white shadow-[0_6px_30px_rgba(99,102,241,0.25)] p-4 rounded-2xl sticky top-0 z-30 backdrop-blur-md border border-indigo-100">
          <div className="flex justify-between items-center">
            <h1 className="text-xl font-bold text-gray-800">💰 Quản Lý Thu – Chi</h1>
            <button
              onClick={() => setShowLogoutPopup(true)}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-full"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>

          <div className="mt-2 text-sm text-gray-500">
            {/* Avatar */}
            <div className="flex items-center gap-2">
              {(() => {
                const match = ICONS.find((i) => i.name === user.avatar);
                if (!match) return null;
                const Icon = match.icon;
                return (
                  <Icon
                    className="w-6 h-6"
                    style={{ color: user.avatarColor || "#4f46e5" }}
                  />
                );
              })()}
              <span className="font-medium text-gray-700">
                {user.displayName || "Người dùng ẩn danh"}
              </span>

              <button
                onClick={() => setShowAccount(true)}
                className="p-1 text-gray-600 hover:text-gray-800"
              >
                <Settings2 className="w-4 h-4" />
              </button>
            </div>

            {/* Dư năm */}
            <div className="flex items-center gap-2 mt-1">
              <span className="font-medium text-gray-700">
                💹 Tổng dư năm {selectedYear}:
              </span>
              <span
                className={`font-semibold ${
                  remainingYear < 0 ? "text-red-600" : "text-green-600"
                }`}
              >
                {showRemaining ? `${remainingYear.toLocaleString()}₫` : "••••••"}
              </span>

              <button
                onClick={() => setShowRemaining((p) => !p)}
                className="text-gray-500 hover:text-gray-700"
              >
                {showRemaining ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        {/* 🔸 Nút thao tác */}
        <div className="flex justify-between items-center">
          <button
            onClick={() =>
              chartRef.current?.scrollIntoView({ behavior: "smooth" })
            }
            className="flex items-center gap-1 bg-gray-600 text-white px-3 py-2 rounded-lg hover:bg-gray-700 text-sm"
          >
            <ChartLine className="w-4 h-4" /> Biểu đồ
          </button>

          <button
            onClick={() => setShowDeletePopup(true)}
            className="flex items-center gap-1 bg-red-500 text-white px-3 py-2 rounded-lg hover:bg-red-600 text-sm"
          >
            <Trash2 className="w-4 h-4" /> Xóa tháng
          </button>
        </div>

        {/* Popup các loại */}
        {showLogoutPopup && (
          <ConfirmLogout open={setShowLogoutPopup} handleLogout={handleLogout} />
        )}

        {showDeletePopup && (
          <ConfirmDeleteMonth
            open={setShowDeletePopup}
            handleDeleteAll={handleDeleteAll}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />
        )}

        {showAccount && (
          <AccountPopup user={user} onClose={handleCloseAccountPopup} />
        )}

        {/* Tổng hợp */}
        <Summary
          items={items}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />

        <div className="flex flex-col items-center gap-3">
          <div className="flex justify-between w-full">
            <ExpenseMonth
              selectedMonth={selectedMonth}
              setSelectedMonth={setSelectedMonth}
              selectedYear={selectedYear}
              setSelectedYear={setSelectedYear}
            />

            {/* Form nhập lương mới */}
            <SalaryForm
              user={user}
              setItems={setItems}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
            />
          </div>

          {/* Form chi tiêu */}
          <ExpenseForm
            user={user}
            setItems={setItems}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />

          {/* Danh sách */}
          <ExpenseList
            user={user}
            items={items}
            setItems={setItems}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
          />

          <div ref={chartRef} className="w-full">
            <ExpenseChart items={yearItems} selectedYear={selectedYear} />
          </div>
        </div>

        {/* ⬆️ Scroll top */}
        {showScrollTop && (
          <motion.button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-6 right-6 w-12 h-12 bg-indigo-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-indigo-600"
          >
            <ArrowUp className="w-5 h-5" />
          </motion.button>
        )}
      </div>

      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-6 right-6 px-4 py-2 rounded-xl shadow-lg flex items-center gap-2 text-white text-sm animate-fadeIn z-[100]
          ${toast.type === "error" ? "bg-red-500" : "bg-green-500"}`}
        >
          {toast.type === "error" ? "⚠️" : "✅"} <span>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}

/* ================================
   🔥 Popup xác nhận logout
================================ */
function ConfirmLogout({ open, handleLogout }) {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={() => open(false)}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-6 w-80 text-center animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-gray-800 mb-3">
          Bạn có chắc muốn đăng xuất?
        </h2>

        <div className="flex justify-center gap-3 mt-4">
          <button
            onClick={async () => {
              await handleLogout();
              open(false);
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Đăng xuất
          </button>

          <button
            onClick={() => open(false)}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}

/* ================================
   🔥 Popup xóa tháng
================================ */
function ConfirmDeleteMonth({
  open,
  handleDeleteAll,
  selectedMonth,
  selectedYear,
}) {
  return (
    <div
      className="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
      onClick={() => open(false)}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl p-6 w-80 text-center animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-red-600 mb-3">
          Xóa toàn bộ dữ liệu
        </h2>

        <p className="text-sm text-gray-600 mb-4">
          Xóa toàn bộ dữ liệu tháng{" "}
          <b>
            {selectedMonth + 1}/{selectedYear}
          </b>
          ?
        </p>

        <div className="flex justify-center gap-3">
          <button
            onClick={async () => {
              open(false);
              await handleDeleteAll();
            }}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg"
          >
            Xóa
          </button>

          <button
            onClick={() => open(false)}
            className="bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-lg"
          >
            Hủy
          </button>
        </div>
      </div>
    </div>
  );
}
