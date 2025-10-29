// pages/_document.js
import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="vi">
      <Head />
      <body>
        <Main />
        {/* container để portal của react-datepicker */}
        <div id="root-portal" />
        <NextScript />
      </body>
    </Html>
  );
}
