let giscus_ready = false;
const container = document.getElementById("inject-comments");

const get_theme = (): string =>
  document.documentElement.getAttribute("data-theme") ||
  (globalThis.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light");

const post_theme = (theme: string): void => {
  const iframe = container?.querySelector<HTMLIFrameElement>(
    "iframe.giscus-frame"
  );
  if (!iframe || !giscus_ready) return;

  iframe.contentWindow?.postMessage(
    { giscus: { setConfig: { theme } } },
    "https://giscus.app"
  );
};

/**
 * 安全地初始化 giscus，捕獲並靜默處理已知警告（如 clipboard-write Feature Policy）
 */
function init_giscus_safely(): void {
  if (!container) return;

  // 捕獲並過濾 console.warn/error，抑制 giscus 的 clipboard-write 警告
  const original_warn = console.warn.bind(console);
  const original_error = console.error.bind(console);

  const suppress_clipboard_warning = (
    method: "warn" | "error",
    ...args: unknown[]
  ) => {
    const msg = args.join(" ");
    if (
      msg.includes("clipboard-write") &&
      msg.includes("Feature Policy") &&
      msg.includes("Skipping unsupported feature name")
    ) {
      // 靜默忽略此特定警告
      return;
    }
    // 其他警告/錯誤正常輸出
    if (method === "warn") {
      original_warn(...args);
    } else {
      original_error(...args);
    }
  };

  console.warn = suppress_clipboard_warning.bind(null, "warn");
  console.error = suppress_clipboard_warning.bind(null, "error");

  try {
    const script = document.createElement("script");
    script.src = "https://giscus.app/client.js";
    script.async = true;
    script.crossOrigin = "anonymous";
    script.setAttribute("data-repo", "neko0xff/blog_astroV2");
    script.setAttribute("data-repo-id", "R_kgDOMkI6YA");
    script.setAttribute("data-category", "Announcements");
    script.setAttribute("data-category-id", "DIC_kwDOMkI6YM4CjZSo");
    script.setAttribute("data-mapping", "title");
    script.setAttribute("data-strict", "0");
    script.setAttribute("data-reactions-enabled", "1");
    script.setAttribute("data-emit-metadata", "0");
    script.setAttribute("data-input-position", "top");
    script.setAttribute("data-lang", "zh-TW");
    script.setAttribute("data-loading", "lazy");
    script.setAttribute("data-theme", get_theme());

    // 添加錯誤處理：腳本載入失敗時不中斷頁面
    script.addEventListener("error", err => {
      console.error("[giscus] Failed to load client.js:", err);
      // 恢復原始 console
      console.warn = original_warn;
      console.error = original_error;
    });

    script.addEventListener("load", () => {
      // 腳本載入成功後恢復原始 console（保留過濾器一段時間以捕獲初始化警告）
      setTimeout(() => {
        console.warn = original_warn;
        console.error = original_error;
      }, 2000);
    });

    container.appendChild(script);

    const frame_observer = new MutationObserver(() => {
      const iframe = container.querySelector<HTMLIFrameElement>(
        "iframe.giscus-frame"
      );
      if (!iframe || giscus_ready) return;
      iframe.addEventListener(
        "load",
        () => {
          giscus_ready = true;
          post_theme(get_theme());
        },
        { once: true }
      );
    });
    frame_observer.observe(container, { childList: true, subtree: true });

    const theme_observer = new MutationObserver(() => post_theme(get_theme()));
    theme_observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });
  } catch (err) {
    console.error("[giscus] Initialization error:", err);
    // 確保恢復原始 console
    console.warn = original_warn;
    console.error = original_error;
  }
}

// 安全初始化 giscus
init_giscus_safely();
