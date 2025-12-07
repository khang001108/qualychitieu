// pages/_app.js
import "../styles/globals.css";
import "react-datepicker/dist/react-datepicker.css";
import * as Tooltip from "@radix-ui/react-tooltip";
import { useEffect, useState } from "react";
import { Sun, Moon, Download, MoreVertical, X, RefreshCcw } from "lucide-react";
import Head from "next/head";

export default function MyApp({ Component, pageProps }) {
  const [dark, setDark] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [installPrompt, setInstallPrompt] = useState(null);

  // Load theme
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Toggle Dark Mode
  const toggleDark = () => {
    setDark((prev) => {
      const next = !prev;
      document.documentElement.classList.toggle("dark", next);
      localStorage.setItem("theme", next ? "dark" : "light");
      return next;
    });
  };

  // PWA install
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const installApp = async () => {
    if (!installPrompt) return alert("Thiết bị không hỗ trợ!");
    installPrompt.prompt();
    const choice = await installPrompt.userChoice;
    if (choice.outcome === "accepted") setInstallPrompt(null);
  };

  return (
    <>
      <Head>
        <title>Quản Lý Chi Tiêu</title>
      </Head>

      <Tooltip.Provider>
        {/* CONTAINER CHUNG: NÚT + MENU */}
        <div className="fixed bottom-5 left-5 z-[9999] flex flex-col items-start gap-3">

          
          {/* MENU BONG BÓNG */}
          {showMenu && (
            <div
              className="
                flex flex-col gap-4 p-3
                rounded-2xl shadow-xl
                bg-white/25 dark:bg-gray-900/40
                backdrop-blur-2xl border border-white/20 dark:border-gray-700/20
                animate-scaleIn
              "
            >
              <MenuButton
                onClick={toggleDark}
                color="text-purple-600 dark:text-yellow-400"
              >
                {dark ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </MenuButton>

              <MenuButton
                onClick={installApp}
                color="text-green-600 dark:text-green-400"
              >
                <Download className="w-5 h-5" />
              </MenuButton>

              <MenuButton
                onClick={() => window.location.reload()}
                color="text-blue-600 dark:text-blue-400"
              >
                <RefreshCcw className="w-5 h-5" />
              </MenuButton>
            </div>
          )}

          {/* NÚT BẬT MENU */}
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="
              text-gray-600 dark:text-gray-300
              hover:text-indigo-400 dark:hover:text-indigo-300
              transition
            "
          >
            {showMenu ? (
              <X className="w-7 h-7" />
            ) : (
              <MoreVertical className="w-7 h-7" />
            )}
          </button>
        </div>

        <Component {...pageProps} />
      </Tooltip.Provider>
    </>
  );
}

// Component nút menu để code gọn hơn
function MenuButton({ onClick, children, color }) {
  return (
    <button
      onClick={onClick}
      className={`
        p-2 rounded-xl shadow-md
        bg-white/40 dark:bg-gray-700/40
        backdrop-blur-xl border border-white/10 dark:border-gray-600/10
        hover:bg-white/60 dark:hover:bg-gray-700/60
        transition
        ${color}
      `}
    >
      {children}
    </button>
  );
}
