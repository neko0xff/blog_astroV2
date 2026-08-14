/**
 * @file Mermaid 可視區延遲載入 (Viewport Lazy Loading) 腳本
 * @description
 * 採用 IntersectionObserver 監聽所有 `<pre class="mermaid">` 元素。
 * 當圖表接近 Viewport 時才觸發動態 import("mermaid")（約 662 KB）並執行渲染，
 * 避免阻塞首屏渲染與浪費頻寬。
 *
 * @supports
 * - Auto Theme: 動態回應 `<html data-theme>` 變更 (light/dark)
 * - Astro View Transitions: 於 `astro:after-swap` 時自動重置 Observer
 * - Fallback: 舊版瀏覽器自動降級為全數同步渲染
 */

const log_error = (...args: unknown[]) =>
  console.error("[mermaid-lazy]", ...args);

/** 檢查頁面是否含有待處理的 Mermaid 圖表 */
const has_mermaid_diagrams = (): boolean =>
  document.querySelectorAll("pre.mermaid").length > 0;

/** Mermaid 實例單例（避免重複動態載入） */
let mermaid_instance: (typeof import("mermaid"))["default"] | null = null;
/** 進行中的載入 Promise，防止並發呼叫時重複 Import */
let mermaid_loading: Promise<(typeof import("mermaid"))["default"]> | null =
  null;

/** Mermaid 支援的主題名稱 */
type MermaidTheme =
  | "default"
  | "dark"
  | "forest"
  | "base"
  | "neutral"
  | "neo"
  | "neo-dark"
  | "redux"
  | "redux-dark"
  | "redux-color"
  | "redux-dark-color";

/** HTML data-theme 與 Mermaid 主題名稱的映射表 */
const theme_map: Record<string, MermaidTheme> = {
  light: "default",
  dark: "dark",
};

/** 是否在 Console 輸出偵錯日誌 */
const ENABLE_LOG = true;
/** 預設主題名稱 */
const DEFAULT_THEME = "forest" as const;
/** 是否依據 `<html data-theme>` 自動切換主題 */
const AUTO_THEME = true;

const log = ENABLE_LOG
  ? (...args: unknown[]) => console.log("[mermaid-lazy]", ...args)
  : () => {};

/** Mermaid 基礎配置 */
const base_config = {
  startOnLoad: false,
  theme: DEFAULT_THEME,
};

/**
 * 動態載入 Mermaid 核心模組並回傳單例
 * @returns {Promise<typeof import("mermaid")["default"]>} Mermaid API 實例
 */
async function load_mermaid(): Promise<(typeof import("mermaid"))["default"]> {
  if (mermaid_instance) return mermaid_instance;
  if (!mermaid_loading) {
    mermaid_loading = import("mermaid")
      .then(m => {
        mermaid_instance = m.default;
        return m.default;
      })
      .catch(err => {
        log_error("Failed to load mermaid:", err);
        mermaid_loading = null;
        throw err;
      });
  }
  return await mermaid_loading;
}

/** 取得當前環境對應的 Mermaid 主題 */
function get_current_theme(): MermaidTheme {
  if (!AUTO_THEME) return base_config.theme;
  const data_theme =
    document.documentElement.getAttribute("data-theme") ||
    document.body.getAttribute("data-theme");
  return theme_map[data_theme ?? ""] || base_config.theme;
}

/**
 * 渲染單一 Mermaid 圖表（Viewport Lazy Loading 的最小執行單元）
 *
 * @param {HTMLElement} diagram - 包含 Mermaid 語法的 `<pre class="mermaid">` 元素
 * @param {boolean} [force=false] - 是否強制重新渲染（即使已有 data-processed）
 */
async function render_diagram(
  diagram: HTMLElement,
  force = false
): Promise<void> {
  if (!diagram || (!force && diagram.hasAttribute("data-processed"))) return;

  // 首次渲染時將原始語法快取至 data-diagram，確保後續重新渲染時內容不遺失
  if (!diagram.getAttribute("data-diagram")) {
    diagram.setAttribute("data-diagram", diagram.textContent || "");
  }
  const def = diagram.getAttribute("data-diagram") || "";
  const mermaid = await load_mermaid();
  const current_theme = get_current_theme();

  mermaid.initialize({
    ...base_config,
    theme: current_theme,
    gitGraph: {
      mainBranchName: "main",
      showCommitLabel: true,
      showBranches: true,
      rotateCommitLabel: true,
    },
  });

  const id = "mermaid-" + Math.random().toString(36).substring(2, 11);

  try {
    const existing = document.getElementById(id);
    if (existing) existing.remove();

    const { svg, bindFunctions } = await mermaid.render(id, def);
    diagram.innerHTML = svg;
    if (bindFunctions) bindFunctions(diagram);
    diagram.setAttribute("data-processed", "true");
    log("rendered", id);
  } catch (err) {
    log_error("render error", id, err);
    diagram.textContent = "";

    const wrapper = document.createElement("div");
    wrapper.style.cssText =
      "color:red;padding:1rem;border:1px solid red;border-radius:.5rem";

    const strong = document.createElement("strong");
    strong.textContent = "Error rendering diagram:";

    const msg = document.createElement("span");
    msg.textContent = " " + ((err as Error)?.message || "Unknown error");

    wrapper.append(strong, msg);
    diagram.append(wrapper);
    diagram.setAttribute("data-processed", "true");
  }
}

/**
 * 監聽所有未渲染的 `<pre class="mermaid:not([data-processed])">` 元素。
 * - 當元素接近 Viewport（預設緩衝 200px）時才啟動渲染
 * - 不支援 IntersectionObserver 時則降級為立即渲染
 */
function observe_diagrams(): void {
  const diagrams = document.querySelectorAll<HTMLElement>(
    "pre.mermaid:not([data-processed])"
  );

  if (!diagrams.length) return;

  // 降級處理：不支援 IntersectionObserver 時立即渲染全部圖表
  if (!("IntersectionObserver" in window)) {
    diagrams.forEach(d => void render_diagram(d));
    return;
  }

  const io = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          void render_diagram(entry.target as HTMLElement);
          obs.unobserve(entry.target);
        }
      });
    },
    { rootMargin: "200px" }
  );

  diagrams.forEach(d => io.observe(d));
}

// 初次載入：若頁面含有圖表即開始觀察
switch (has_mermaid_diagrams()) {
  case true:
    observe_diagrams();
    break;
  default:
    log("no mermaid diagrams on this page");
}

// 主題動態切換：重新渲染已載入的圖表
if (AUTO_THEME) {
  const handle_theme_change = () => {
    // 僅重新渲染「已經處理過」且「已載入 Mermaid 模組」的圖表
    if (!mermaid_instance) return;
    document
      .querySelectorAll<HTMLElement>("pre.mermaid[data-processed]")
      .forEach(d => void render_diagram(d, true));
  };

  const mo = new MutationObserver(handle_theme_change);
  mo.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  mo.observe(document.body, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
}

// Astro View Transitions：換頁後重新觀察新頁面的圖表
document.addEventListener("astro:after-swap", () => {
  if (has_mermaid_diagrams()) observe_diagrams();
});
