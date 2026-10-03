/**
 * @file giscus 留言版組件功能
 *
 * @description
 * - 該模組主要負責呈現 Blog 的文章下，供使用者使用留言部分
 * - 僅限己Login Github 使用者留言
 */

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
 * 初始化 giscus 留言框
 *
 * @description
 * - 這裡刻意「不」再覆寫 console.warn / console.error。
 * - 舊版為了消掉 clipboard-write 的 Feature Policy 警告而做的全域 console 補丁，等於把開發者唯一看不到警告的管道一起關掉了。
 * - 現在 public/_headers 改成 `clipboard-write=(self)`，警告的來源（政策封鎖）已不存在，補丁也一併移除。
 */
function init_giscus(): void {
  if (!container) return;

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
    script.addEventListener("error", err => {
      console.error("[giscus] Failed to load client.js:", err);
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
  }
}

init_giscus();
