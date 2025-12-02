// pages/_app.js
import "../styles/globals.css";
import "react-datepicker/dist/react-datepicker.css";
import * as Tooltip from "@radix-ui/react-tooltip";
import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";
import Head from "next/head";

export default function MyApp({ Component, pageProps }) {
  const [dark, setDark] = useState(false);

  // ⭐ Load từ localStorage
  useEffect(() => {
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      setDark(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  // ⭐ Toggle Dark Mode
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

        {/* Thay icon tuỳ ý — để icon nào trong /public */}
        {/* <link rel="icon" href="/growth-business-64.ico" /> */}
        <link rel="icon" href="/wallet-45-64.ico" />
        {/* <link rel="icon" href="/board-money-64.ico" /> */}

        {/* hoặc PNG nếu thích */}
        {/* <link rel="icon" type="image/png" href="/money.png" /> */}
      </Head>

      <Tooltip.Provider>
        {/* 🔥 Nút bật/tắt Dark Mode */}
        <button
          onClick={toggleDark}
          className="
            fixed bottom-5 left-5 z-[9999]
            p-2 rounded-xl
            transition-all
            hover:scale-110 active:scale-95
            bg-transparent shadow-none
          "
        >
          {dark ? (
            <Sun className="w-6 h-6 text-yellow-400" />
          ) : (
            <Moon className="w-6 h-6 text-blue-300" />
          )}
        </button>

        <Component {...pageProps} />
      </Tooltip.Provider>
    </>
  );
}
