let giscus_ready = false;
const container = document.getElementById("inject-comments");

const get_theme = (): string =>
  document.documentElement.getAttribute("data-theme") ||
  (globalThis.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light");

const post_theme = (theme: string): void => {
  const iframe = container?.querySelector<HTMLIFrameElement>(
    "iframe.giscus-frame",
  );
  if (!iframe || !giscus_ready) return;

  iframe.contentWindow?.postMessage(
    { giscus: { setConfig: { theme } } },
    "https://giscus.app",
  );
};

if (container) {
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
  container.appendChild(script);

  const frame_observer = new MutationObserver(() => {
    const iframe = container.querySelector<HTMLIFrameElement>(
      "iframe.giscus-frame",
    );
    if (!iframe || giscus_ready) return;
    iframe.addEventListener("load", () => {
      giscus_ready = true;
      post_theme(get_theme());
    }, { once: true });
  });
  frame_observer.observe(container, { childList: true, subtree: true });

  const theme_observer = new MutationObserver(() => post_theme(get_theme()));
  theme_observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
}
