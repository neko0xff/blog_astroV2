/* eslint-disable no-console */


const CONSOLE_STYLES = {
  title:
    "color: red; font-family: sans-serif; font-size: 50px; font-weight: bold; -webkit-text-stroke: 1px black;",
  body: "font-size: 18px; line-height: 1.5; font-family: sans-serif; color: #333;",
  warning:
    "background: red; color: white; padding: 10px 10px; border-radius: 3px; font-weight: bold; font-size: 18px; "
};

/**
 * 顯示警告訊息
 * - 可自訂標題與訊息
 * @param config 自定義內容
 */

function showWarning(config) {
  config = config ?? {};
  const title = config.title || "立即停下！";
  const message1 = config.message1 || "[警告] 此功能僅供開發者除錯使用，一般使用者請勿使用。";
  const message2 = config.message2 || "[警告] 請勿在此貼上來源不明的程式碼和非官方指示。";
  const warning_msg = config.warning_msg || "[警告] 這可能導致您的資料部分，直接被盜取。";

  if (typeof process !== 'undefined' && process.env.NODE_ENV === "production") {
    console.clear();
  }

  console.log("%c" + title, CONSOLE_STYLES.title);
  console.log("%c" + message1, CONSOLE_STYLES.body);
  console.log("%c" + message2, CONSOLE_STYLES.body);
  console.log("%c " + warning_msg + " ", CONSOLE_STYLES.warning);
}


// 顯示安全警告於 Console。
globalThis.useConsoleWarning = function () {
  return { showWarning };
};

// Automatically show the warning
showWarning();
