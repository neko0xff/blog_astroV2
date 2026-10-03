/**
 * @file Mermaid 可視區延遲載入 (Viewport Lazy Loading) 腳本
 * @description
 * - 採用 IntersectionObserver 監聽所有 `<pre class="mermaid">` 元素。
 * - 當圖表接近 Viewport 時才觸發動態 import("mermaid")（約 662 KB）並執行渲染，
 * - 避免阻塞首屏渲染與浪費頻寬。
 *
 * @stability
 * - 序列化渲染：所有 `mermaid.render` 共用一條 Promise 鏈，同一時間只跑一個，
 *   避免並發呼叫 `initialize` 改寫全域設定造成的偶發報錯。
 * - 失敗重試：暫時性失敗會自動重試（指數退避），不再直接顯示永久紅框；
 *   最終失敗也會保留重試入口（捲動或切換主題時再試）。
 *
 * @supports
 * - Auto Theme: 動態回應 `<html data-theme>` 變更 (light/dark)
 * - Astro View Transitions: 於 `astro:after-swap` 時自動重置 Observer
 * - Fallback: 舊版瀏覽器自動降級為全數同步渲染
 */

import { close_void_elements } from "../utils/closeVoidElements.ts";

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

/**
 * 是否在 Console 輸出偵錯日誌
 *
 * 正式環境請保持 false：`[mermaid-lazy] no mermaid diagrams on this page`
 * 在無圖表的頁面每次載入都會出現，而 `rendered <id>` 則是每張圖一條，
 * 兩者都是除錯資訊，不是警告。真正的渲染失敗仍走 `log_error`
 *（console.error），不受此開關影響。
 */
const ENABLE_LOG = false;
/** 預設主題名稱 */
const DEFAULT_THEME = "forest" as const;
/** 是否依據 `<html data-theme>` 自動切換主題 */
const AUTO_THEME = true;
/** 單一圖表渲染失敗後的最大重試次數 */
const MAX_RETRIES = 3;
/** 重試基礎延遲（毫秒），採指數退避 */
const RETRY_BASE_DELAY_MS = 500;
/** 主題切換後重新渲染的防抖延遲（毫秒） */
const THEME_RERENDER_DEBOUNCE_MS = 200;

const log = ENABLE_LOG
  ? (...args: unknown[]) => console.log("[mermaid-lazy]", ...args)
  : () => {};

/** Mermaid 基礎配置 */
const base_config = {
  startOnLoad: false,
  securityLevel: "strict" as const,
  theme: DEFAULT_THEME,
};

/**
 * 渲染序列化鏈：確保同一時間只有一個 `mermaid.render` 執行。
 * Mermaid 的 `initialize` 會改寫全域設定，並發渲染是偶發報錯的主因。
 */
let render_chain: Promise<void> = Promise.resolve();
/** 進行中的單圖渲染（元素 -> Promise），避免同一圖表被重複並發渲染 */
const in_flight_renders = new Map<HTMLElement, Promise<void>>();
/** 目前 `mermaid.initialize` 使用的主題；主題未變時跳過，避免干擾進行中的渲染 */
let initialized_theme: MermaidTheme | null = null;
/** 主題切換防抖計時器。用 ReturnType 推導，避免 DOM lib（number）與 Node 型別（Timeout）不一致 */
let theme_rerender_timer: ReturnType<typeof globalThis.setTimeout> | null =
  null;
/** 作用中的 IntersectionObserver；重建前先斷開舊的，避免洩漏與重複觸發 */
let current_observer: IntersectionObserver | null = null;

// `close_void_elements` 住在純函式模組（`src/utils/closeVoidElements.ts`），
// 可被 `deno test` 直接驗證；此處僅引用，不再自備一份。

/**
 * @function 解析 Mermaid 產生的 SVG 字串為 SVG 根元素。
 *
 * @description
 * - 先把 void 元素正規化成自封閉形式，再用嚴格的 `image/svg+xml` 解析
 * - 若仍失敗（非 void 元素造成的不良構），才退回 `text/html` 寬鬆解析取出 `<svg>` 元素。
 *
 * @param svg - Mermaid 產生的 SVG 字串
 * @returns SVG 根元素；解析失敗回傳 null
 */
function parse_svg_root(svg: string): Element | null {
  const normalized = close_void_elements(svg);
  const xml_doc = new DOMParser().parseFromString(normalized, "image/svg+xml");
  const xml_root = xml_doc.documentElement;
  if (xml_root && xml_root.tagName.toLowerCase() === "svg") return xml_root;

  const html_doc = new DOMParser().parseFromString(svg, "text/html");
  return html_doc.body?.querySelector("svg") ?? null;
}

/**
 * @function 判斷 URL 屬性值是否為危險 scheme（javascript: / data: / vbscript:）
 *
 * @description
 * 以 WHATWG URL 解析取代字串前綴比對：瀏覽器導覽前會依規範正規化 URL
 * （剝除夾藏的 tab/LF/CR 與前後控制字元、scheme 強制小寫），
 * 因此 `java&#9;script:` 等控制字元夾藏寫法能繞過 `startsWith("javascript:")`
 * 卻仍會被瀏覽器當成 javascript: 執行；`new URL().protocol` 與瀏覽器行為一致。
 *
 * @param value - URL 屬性原始值（HTML 實體已由屬性取得時解碼）
 * @returns 若為危險 scheme 或無法解析，回傳 true
 */
function is_dangerous_url(value: string): boolean {
  try {
    const protocol = new URL(value, document.baseURI).protocol;
    return (
      protocol === "javascript:" ||
      protocol === "data:" ||
      protocol === "vbscript:"
    );
  } catch {
    // 無法解析成 URL → 保守處理，視為危險並移除
    return true;
  }
}

/**
 * 將 Mermaid 產生的 SVG 安全地加入圖表容器。
 * @param container - 圖表容器
 * @param svg - Mermaid 產生的 SVG 字串
 */
function append_safe_svg(container: HTMLElement, svg: string): void {
  const root = parse_svg_root(svg);
  if (!root || root.tagName.toLowerCase() !== "svg") {
    throw new Error("Mermaid output is not an SVG document");
  }

  const sanitize = (element: Element) => {
    // 防禦性移除：Mermaid(strict) 不應產生 script，但一旦出現直接移除
    if (element.tagName.toLowerCase() === "script") {
      element.remove();
      return;
    }
    for (const attribute of [...element.attributes]) {
      const name = attribute.name.toLowerCase();
      if (
        name.startsWith("on") ||
        ((name === "href" || name === "xlink:href") &&
          is_dangerous_url(attribute.value))
      ) {
        element.removeAttribute(attribute.name);
      }
    }
    // 以快照迭代：sanitize 內可能移除子節點（script）
    for (const child of [...element.children]) sanitize(child);
  };

  sanitize(root);
  container.replaceChildren(document.importNode(root, true));
}

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
 * 等待指定毫秒數（重試退避用）
 * @param ms - 等待毫秒數
 */
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 確保 Mermaid 已依指定主題初始化；主題未變時直接跳過，
 * 避免在其他渲染進行中重寫全域設定。
 * @param theme - 目標主題
 * @returns 初始化完成的 Mermaid API 實例
 */
async function ensure_initialized(
  theme: MermaidTheme
): Promise<(typeof import("mermaid"))["default"]> {
  const mermaid = await load_mermaid();
  if (initialized_theme !== theme) {
    mermaid.initialize({
      ...base_config,
      theme,
      gitGraph: {
        mainBranchName: "main",
        showCommitLabel: true,
        showBranches: true,
        rotateCommitLabel: true,
      },
    });
    initialized_theme = theme;
  }
  return mermaid;
}

/**
 * 在圖表容器內顯示渲染錯誤（最終失敗時）。
 * 注意：只標記 `data-error` 而不標記 `data-processed`，保留後續重試入口。
 * @param diagram - 包含 Mermaid 語法的 `<pre class="mermaid">` 元素
 * @param err - 渲染錯誤
 */
function show_render_error(diagram: HTMLElement, err: unknown): void {
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
  diagram.setAttribute("data-error", "true");
  // 重新掛回 Observer：使用者捲動回來時可再次觸發重試
  observe_element(diagram);
}

/**
 * 實際執行單一圖表渲染（含失敗自動重試）。
 * 呼叫前已由 `render_diagram` 保證：同一時間只有一個 render_inner 執行，
 * 且同一元素不會重入。
 *
 * @param diagram - 包含 Mermaid 語法的 `<pre class="mermaid">` 元素
 * @param [force=false] - 是否強制重新渲染（即使已有 data-processed）
 */
async function render_inner(
  diagram: HTMLElement,
  force = false
): Promise<void> {
  if (!diagram.isConnected) return;
  if (!force && diagram.hasAttribute("data-processed")) return;

  // 首次渲染時將原始語法快取至 data-diagram，確保後續重新渲染時內容不遺失
  // 防禦性處理：即使其他腳本（如 copy 按鈕）已注入按鈕到 pre 內，也不污染語法
  if (!diagram.getAttribute("data-diagram")) {
    const clone = diagram.cloneNode(true) as HTMLElement;
    clone.querySelectorAll("button").forEach(btn => btn.remove());
    diagram.setAttribute("data-diagram", clone.textContent || "");
  }
  const def = diagram.getAttribute("data-diagram") || "";
  if (!def.trim()) {
    diagram.setAttribute("data-processed", "true");
    return;
  }

  const mermaid = await ensure_initialized(get_current_theme());
  if (!diagram.isConnected) return;

  const id = "mermaid-" + Math.random().toString(36).substring(2, 11);

  try {
    const { svg, bindFunctions } = await mermaid.render(id, def);
    if (!diagram.isConnected) return;
    append_safe_svg(diagram, svg);
    if (bindFunctions) bindFunctions(diagram);
    diagram.setAttribute("data-processed", "true");
    diagram.removeAttribute("data-error");
    diagram.removeAttribute("data-retry");
    log("rendered", id);
  } catch (err) {
    if (!diagram.isConnected) return;
    const retries = Number(diagram.getAttribute("data-retry") || "0");
    if (retries < MAX_RETRIES) {
      diagram.setAttribute("data-retry", String(retries + 1));
      log(`render failed (${id}), retry ${retries + 1}/${MAX_RETRIES}`, err);
      // 釋放序列化鎖後再重排，避免退避等待期間卡住其他圖表；
      // 重置主題標記，讓下次執行時重新 initialize，排除全域狀態污染
      void (async () => {
        await sleep(RETRY_BASE_DELAY_MS * 2 ** retries);
        if (!diagram.isConnected) return;
        initialized_theme = null;
        await render_diagram(diagram, force);
      })();
      return;
    }
    log_error("render error", id, err);
    show_render_error(diagram, err);
  }
}

/**
 * 渲染單一 Mermaid 圖表（Viewport Lazy Loading 的最小執行單元）。
 * 任務會排入全域序列化鏈；同一元素已有進行中任務時直接回傳該任務。
 *
 * @param diagram - 包含 Mermaid 語法的 `<pre class="mermaid">` 元素
 * @param [force=false] - 是否強制重新渲染（即使已有 data-processed）
 * @returns 渲染完成的 Promise
 */
function render_diagram(diagram: HTMLElement, force = false): Promise<void> {
  if (!diagram) return Promise.resolve();
  if (!force && diagram.hasAttribute("data-processed")) {
    return Promise.resolve();
  }
  const ongoing = in_flight_renders.get(diagram);
  if (ongoing) return ongoing;

  const task = render_chain.then(() => render_inner(diagram, force));
  const tracked: Promise<void> = task.catch(() => {});
  render_chain = tracked;
  in_flight_renders.set(diagram, tracked);
  void tracked.finally(() => {
    if (in_flight_renders.get(diagram) === tracked) {
      in_flight_renders.delete(diagram);
    }
  });
  return tracked;
}

/**
 * IntersectionObserver 共用回呼：進入可視區才渲染，觸發後即取消觀察。
 */
function handle_intersections(
  entries: IntersectionObserverEntry[],
  obs: IntersectionObserver
): void {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      obs.unobserve(entry.target);
      void render_diagram(entry.target as HTMLElement);
    }
  });
}

/**
 * 將單一元素掛入作用中的 Observer（Observer 不存在時自動建立）。
 * @param diagram - 待觀察的 `<pre class="mermaid">` 元素
 */
function observe_element(diagram: HTMLElement): void {
  // 降級處理：不支援 IntersectionObserver 時立即渲染
  if (!("IntersectionObserver" in window)) {
    void render_diagram(diagram);
    return;
  }
  if (!current_observer) {
    current_observer = new IntersectionObserver(handle_intersections, {
      rootMargin: "200px",
    });
  }
  current_observer.observe(diagram);
}

/**
 * 監聽所有未渲染的 `<pre class="mermaid:not([data-processed])">` 元素。
 * - 當元素接近 Viewport（預設緩衝 200px）時才啟動渲染
 * - 不支援 IntersectionObserver 時則降級為立即渲染
 */
function observe_diagrams(): void {
  if (current_observer) {
    current_observer.disconnect();
    current_observer = null;
  }
  const diagrams = document.querySelectorAll<HTMLElement>(
    "pre.mermaid:not([data-processed]):not([data-error])"
  );

  if (!diagrams.length) return;

  // 降級處理：不支援 IntersectionObserver 時立即渲染全部圖表
  if (!("IntersectionObserver" in window)) {
    diagrams.forEach(d => void render_diagram(d));
    return;
  }

  current_observer = new IntersectionObserver(handle_intersections, {
    rootMargin: "200px",
  });

  diagrams.forEach(d => current_observer?.observe(d));
}

/**
 * 依當前主題重新渲染已處理的圖表，並重試之前失敗的圖表。
 * 主題未變且無失敗圖表時直接跳過，避免無意義閃爍。
 */
function rerender_for_theme(): void {
  const current_theme = get_current_theme();
  const failed = [
    ...document.querySelectorAll<HTMLElement>("pre.mermaid[data-error]"),
  ];
  if (current_theme === initialized_theme && failed.length === 0) return;

  document
    .querySelectorAll<HTMLElement>("pre.mermaid[data-processed]")
    .forEach(d => void render_diagram(d, true));
  failed.forEach(d => {
    d.removeAttribute("data-error");
    void render_diagram(d, true);
  });
}

/**
 * 主題變更入口（含防抖）：快速連續切換只執行最後一次重渲染。
 */
function schedule_theme_rerender(): void {
  // 僅重新渲染「已經載入 Mermaid 模組」的頁面，避免下載不必要的資源
  if (!mermaid_instance) return;
  if (theme_rerender_timer !== null) {
    globalThis.clearTimeout(theme_rerender_timer);
  }
  theme_rerender_timer = globalThis.setTimeout(() => {
    theme_rerender_timer = null;
    rerender_for_theme();
  }, THEME_RERENDER_DEBOUNCE_MS);
}

// 初次載入：若頁面含有圖表即開始觀察
if (has_mermaid_diagrams()) {
  observe_diagrams();
} else {
  log("no mermaid diagrams on this page");
}

// 主題動態切換：重新渲染已載入的圖表
// 注意：toggle-theme.js 只在 `<html>` 上設定 data-theme，因此只需觀察它
if (AUTO_THEME) {
  const mo = new MutationObserver(schedule_theme_rerender);
  mo.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
}

// Astro View Transitions：換頁後重新觀察新頁面的圖表
document.addEventListener("astro:after-swap", () => {
  if (has_mermaid_diagrams()) observe_diagrams();
});
