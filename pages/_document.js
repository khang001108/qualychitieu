// pages/_document.js
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="vi">
      <Head>

        {/* 📌 Manifest PWA */}
        <link rel="manifest" href="/manifest.json" />

        {/* 📌 App Icons */}
        <link rel="icon" href="/wallet-110-256.png" />
        <link rel="apple-touch-icon" href="/wallet-110-256.png" />

        {/* 📌 Màu thanh trạng thái (Android/iOS) */}
        <meta name="theme-color" content="#2563eb" />

        {/* Cho iPhone full màn hình */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />

      </Head>

      <body>
        <Main />

        {/* container để portal của react-datepicker */}
        <div id="root-portal" />

        <NextScript />
      </body>
    </Html>
  );
}
