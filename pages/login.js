import { useState, useEffect } from "react";
import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";
import { useRouter } from "next/router";
import { Eye, EyeOff, LogIn, Mail, Lock } from "lucide-react";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Nếu đã đăng nhập → về trang chủ
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) router.replace("/");
    });
    return () => unsubscribe();
  }, [router]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );

      const ref = doc(db, "users", userCredential.user.uid);
      const snap = await getDoc(ref);

      if (!snap.exists() || !snap.data().approved) {
        alert("⏳ Tài khoản chưa được duyệt. Chờ admin xác nhận.");
        await signOut(auth);
        setLoading(false);
        return;
      }

      if (rememberMe) {
        localStorage.setItem("rememberEmail", email);
      } else {
        localStorage.removeItem("rememberEmail");
      }

      router.push("/");
    } catch (err) {
      console.error(err);
      setError("❌ Sai email hoặc mật khẩu!");
    } finally {
      setLoading(false);
    }
  };

  // Auto điền email đã nhớ
  useEffect(() => {
    const saved = localStorage.getItem("rememberEmail");
    if (saved) {
      setEmail(saved);
      setRememberMe(true);
    }
  }, []);

  return (
    <div className="
      min-h-screen flex items-center justify-center 
      bg-gradient-to-br from-blue-100 via-white to-blue-200
      dark:from-gray-900 dark:via-gray-900 dark:to-gray-900
    ">
      <div className="
        bg-white/90 dark:bg-gray-800/80 
        backdrop-blur-xl p-8 rounded-2xl shadow-xl 
        w-[95%] max-w-md border border-blue-100 dark:border-gray-700
      ">
        {/* Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="
            bg-blue-500 dark:bg-indigo-500 
            text-white p-3 rounded-full shadow-lg
          ">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-3">
            Đăng nhập tài khoản
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            Quản lý chi tiêu dễ dàng và an toàn
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="
            bg-red-50 dark:bg-red-900 
            border border-red-300 dark:border-red-700
            text-red-600 dark:text-red-200
            text-sm p-2 mb-3 rounded-lg
          ">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleLogin} className="flex flex-col gap-4">
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
                w-full pl-10 pr-3 py-2
                rounded-lg outline-none
                border border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-800
                text-gray-800 dark:text-gray-100
                placeholder-gray-400 dark:placeholder-gray-500
                focus:ring-2 focus:ring-blue-400 dark:focus:ring-indigo-500
              "
              required
            />
          </div>

          {/* Password */}
          <div className="relative">
            <Lock className="
              absolute left-3 top-3 text-gray-400 dark:text-gray-500
              w-5 h-5
            " />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="
                w-full pl-10 pr-10 py-2 
                rounded-lg outline-none
                border border-gray-300 dark:border-gray-600
                bg-white dark:bg-gray-800
                text-gray-800 dark:text-gray-100
                placeholder-gray-400 dark:placeholder-gray-500
                focus:ring-2 focus:ring-blue-400 dark:focus:ring-indigo-500
              "
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-2.5 text-gray-500 dark:text-gray-400 hover:text-gray-700"
            >
              {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>

          {/* Remember me */}
          <label className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="accent-blue-500 dark:accent-indigo-500"
            />
            Ghi nhớ tài khoản
          </label>

          {/* Login button */}
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
            {loading ? "Đang xử lý..." : "Đăng nhập"}
          </button>
        </form>

        {/* Signup link */}
        <p className="text-center mt-5 text-gray-600 dark:text-gray-400 text-sm">
          Chưa có tài khoản?{" "}
          <a
            href="/signup"
            className="text-blue-600 dark:text-indigo-400 hover:underline font-medium"
          >
            Đăng ký ngay
          </a>
        </p>
      </div>
    </div>
  );
}
