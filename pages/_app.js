// pages/_app.js
import "../styles/globals.css";
import "react-datepicker/dist/react-datepicker.css";
import * as Tooltip from "@radix-ui/react-tooltip";
import { useEffect, useState } from "react";
import Head from "next/head";
import { Sun, Moon, Download } from "lucide-react";

export default function MyApp({ Component, pageProps }) {
  const [dark, setDark] = useState(false);
  const [fabOpen, setFabOpen] = useState(false);

  // === PWA Install ===
  const [installPrompt, setInstallPrompt] = useState(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setCanInstall(true);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const installApp = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    setCanInstall(false);
  };

  // Load theme
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // Toggle theme
  const toggleDark = () => {
    setDark((d) => {
      const newVal = !d;
      if (newVal) {
        document.documentElement.classList.add("dark");
        localStorage.setItem("theme", "dark");
      } else {
        document.documentElement.classList.remove("dark");
        localStorage.setItem("theme", "light");
      }
      return newVal;
    });
  };

  return (
    <>
      {/* === FAVICON + TITLE === */}
      <Head>
        <title>Quản Lý Chi Tiêu</title>
        <link rel="icon" href="/wallet-110-64.ico" />
      </Head>

      <Tooltip.Provider>
        <Component {...pageProps} />

        {/* === FLOATING MENU === */}
        <div className="fixed bottom-6 left-6 z-[9999] flex flex-col items-start">

          {/* Bong bóng xổ ra */}
          {fabOpen && (
            <div className="flex flex-col gap-3 mb-3 animate-popIn">

              {/* Nút Dark/Light */}
              <button
                onClick={toggleDark}
                className="
                  w-12 h-12 rounded-full
                  flex items-center justify-center
                  bg-indigo-500 text-white shadow-lg
                  hover:bg-indigo-600 active:scale-95
                  transition
                "
              >
                {dark ? (
                  <Sun className="w-6 h-6 text-yellow-300" />
                ) : (
                  <Moon className="w-6 h-6 text-blue-300" />
                )}
              </button>

              {/* Nút tải app (chỉ hiện khi install được) */}
              {canInstall && (
                <button
                  onClick={installApp}
                  className="
                    w-12 h-12 rounded-full
                    flex items-center justify-center
                    bg-green-500 text-white shadow-lg
                    hover:bg-green-600 active:scale-95
                    transition animate-bounce-slow
                  "
                >
                  <Download className="w-6 h-6" />
                </button>
              )}
            </div>
          )}

          {/* Nút chính — mở menu */}
          <button
            onClick={() => setFabOpen((v) => !v)}
            className="
              w-14 h-14 rounded-full
              bg-blue-600 hover:bg-blue-700
              text-white text-xl shadow-2xl
              flex items-center justify-center
              active:scale-95 transition
            "
          >
            {fabOpen ? "✖" : "⚙️"}
          </button>
        </div>
      </Tooltip.Provider>
    </>
  );
}
