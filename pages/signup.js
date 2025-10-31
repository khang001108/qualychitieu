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

  // ✅ Dễ dàng bật/tắt chế độ tự duyệt tài khoản
  //const AUTO_APPROVE = false; // true = auto duyệt | false = cần admin xác nhận
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

      // ✅ Tạo document người dùng trong Firestore
      await setDoc(doc(db, "users", userCredential.user.uid), {
        name,
        email,
        salary: {},
        approved: AUTO_APPROVE,
        createdAt: new Date().toISOString(),
      });

      await signOut(auth);

      // ✅ Hiển thị thông báo phù hợp
      if (AUTO_APPROVE) {
        alert(
          "🎉 Đăng ký thành công! Cám ơn bạn đã sử dụng dịch vụ của Khazg 🎊"
        );
      } else {
        alert(
          "✅ Đăng ký thành công! Vui lòng chờ quản trị viên xác nhận tài khoản của bạn."
        );
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200">
      <div className="bg-white/80 backdrop-blur-xl p-8 rounded-2xl shadow-xl w-[95%] max-w-md border border-blue-100">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-blue-500 text-white p-3 rounded-full shadow-lg">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mt-3">
            Đăng ký tài khoản
          </h2>
          <p className="text-gray-500 text-sm">
            Quản lý chi tiêu của bạn hiệu quả hơn!
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-2 mb-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSignup} className="flex flex-col gap-4">
          <div className="relative">
            <User className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Tên hiển thị"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-400 outline-none"
              required
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-400 outline-none"
              required
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-3 text-gray-400 w-5 h-5" />
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:border-blue-500 focus:ring-1 focus:ring-blue-400 outline-none"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`flex justify-center items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? (
              <>
                <Loader2 className="animate-spin w-5 h-5" /> Đang xử lý...
              </>
            ) : (
              "Đăng ký"
            )}
          </button>
        </form>

        <p className="text-center mt-5 text-gray-600 text-sm">
          Đã có tài khoản?{" "}
          <a
            href="/login"
            className="text-blue-600 hover:underline font-medium"
          >
            Đăng nhập
          </a>
        </p>
      </div>
    </div>
  );
}
