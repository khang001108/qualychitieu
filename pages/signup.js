import { useState } from "react";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
} from "firebase/auth";
import { auth, db } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/router";
import { UserPlus, Mail, Lock, Loader2, User } from "lucide-react";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const AUTO_APPROVE = true;

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!name.trim()) return setError("Vui lòng nhập tên hiển thị.");

    try {
      setError("");
      setLoading(true);

      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

      await updateProfile(userCredential.user, { displayName: name });

      await setDoc(doc(db, "users", userCredential.user.uid), {
        name,
        email,
        salary: {},
        approved: AUTO_APPROVE,
        createdAt: new Date().toISOString(),
      });

      await signOut(auth);

      if (AUTO_APPROVE) {
        alert("🎉 Đăng ký thành công! Cám ơn bạn đã sử dụng dịch vụ của Khazg 🎊");
      } else {
        alert("⏳ Vui lòng chờ quản trị viên xác nhận tài khoản.");
      }

      router.push("/login");
    } catch (err) {
      console.error(err);
      setError("Tạo tài khoản thất bại: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="
      min-h-screen flex items-center justify-center
      bg-gradient-to-br from-blue-100 via-white to-blue-200
      dark:from-gray-900 dark:via-gray-900 dark:to-gray-900
    ">
      <div className="
        bg-white/90 dark:bg-gray-800/80
        backdrop-blur-xl p-8 rounded-2xl shadow-xl
        w-[95%] max-w-md border
        border-blue-100 dark:border-gray-700
      ">

        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="
            bg-blue-500 dark:bg-indigo-500
            text-white p-3 rounded-full shadow-lg
          ">
            <UserPlus className="w-6 h-6" />
          </div>

          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-3">
            Đăng ký tài khoản
          </h2>

          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Quản lý chi tiêu hiệu quả hơn!
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="
            bg-red-50 dark:bg-red-900
            border border-red-200 dark:border-red-700
            text-red-600 dark:text-red-200
            text-sm p-2 mb-3 rounded-lg
          ">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="flex flex-col gap-4">

          {/* Tên hiển thị */}
          <div className="relative">
            <User className="
              absolute left-3 top-3 text-gray-400 dark:text-gray-500
              w-5 h-5
            " />
            <input
              type="text"
              placeholder="Tên hiển thị"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="
                w-full pl-10 pr-3 py-2 rounded-lg outline-none
                border border-gray-300 dark:border-gray-600
                bg-gray-50 dark:bg-gray-800
                text-gray-800 dark:text-gray-100
                placeholder-gray-400 dark:placeholder-gray-500
                focus:ring-2 focus:ring-blue-400 dark:focus:ring-indigo-500
              "
              required
            />
          </div>

          {/* Email */}
          <div className="relative">
            <Mail className="
              absolute left-3 top-3 text-gray-400 dark:text-gray-500
              w-5 h-5
            " />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="
                w-full pl-10 pr-3 py-2 rounded-lg outline-none
                border border-gray-300 dark:border-gray-600
                bg-gray-50 dark:bg-gray-800
                text-gray-800 dark:text-gray-100
                placeholder-gray-400 dark:placeholder-gray-500
                focus:ring-2 focus:ring-blue-400 dark:focus:ring-indigo-500
              "
              required
            />
          </div>

          {/* Mật khẩu */}
          <div className="relative">
            <Lock className="
              absolute left-3 top-3 text-gray-400 dark:text-gray-500
              w-5 h-5
            " />
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                w-full pl-10 pr-3 py-2 rounded-lg outline-none
                border border-gray-300 dark:border-gray-600
                bg-gray-50 dark:bg-gray-800
                text-gray-800 dark:text-gray-100
                placeholder-gray-400 dark:placeholder-gray-500
                focus:ring-2 focus:ring-blue-400 dark:focus:ring-indigo-500
              "
              required
            />
          </div>

          {/* Nút đăng ký */}
          <button
            type="submit"
            disabled={loading}
            className={`
              flex justify-center items-center gap-2
              bg-blue-600 dark:bg-indigo-600
              hover:bg-blue-700 dark:hover:bg-indigo-700
              text-white p-2 rounded-lg transition font-medium
              ${loading ? "opacity-70 cursor-not-allowed" : ""}
            `}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" />
                Đang xử lý...
              </>
            ) : (
              "Đăng ký"
            )}
          </button>
        </form>

        {/* Link login */}
        <p className="text-center mt-5 text-gray-600 dark:text-gray-400 text-sm">
          Đã có tài khoản?{" "}
          <a
            href="/login"
            className="text-blue-600 dark:text-indigo-400 hover:underline font-medium"
          >
            Đăng nhập
          </a>
        </p>
      </div>
    </div>
  );
}
