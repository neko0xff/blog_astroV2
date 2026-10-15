---
target: the dashboard (src/pages/index.astro)
total_score: 32
max_score: 40
na_heuristics:
p0_count: 0
p1_count: 2
target_identity: "file:/home/user/文件/GitHub/blog_astroV2/src/pages/index.astro"
target_fingerprint: "sha256:49be703c4577d3acb9bd00c4f733fd6718156fd8bee34fb68b20fc0eaf0bbc0f"
target_path: /home/user/文件/GitHub/blog_astroV2/src/pages/index.astro
timestamp: 2026-10-13T21-46-13Z
slug: src-pages-index-astro
---

# Critique: src/pages/index.astro（首頁總覽 / "dashboard"）

> ⚠️ DEGRADED: single-context（subagent 工具存在但被 harness depth limit=1
> 阻擋，無法巢狀派生；A/B 兩項評估由同一上文依序完成，未彼此參照輸出）

Method: dual-agent (A: inline · B: inline) — 降級運行，理由如上。

## Design Health Score

| #         | Heuristic                       | Score     | Key Issue                                                             |
| --------- | ------------------------------- | --------- | --------------------------------------------------------------------- |
| 1         | Visibility of System Status     | 3         | 主題切換狀態不宣告：`aria-label` 靜態 "auto"、`aria-live` 無文字更新  |
| 2         | Match System / Real World       | 3         | 首頁無導言，新訪客第一眼缺定位；日期 12 小時制 AM/PM 對技術讀者略突兀 |
| 3         | User Control and Freedom        | 4         | skip link、回上頁、搜尋 clear，無陷阱狀態                             |
| 4         | Consistency and Standards       | 4         | token 驅動、單 accent；RSS 開新分頁略特殊                             |
| 5         | Error Prevention                | 3         | 首頁幾乎無輸入路徑，風險面小                                          |
| 6         | Recognition Rather Than Recall  | 3         | 導覽可見；主題切換僅圖示且 label 無意義                               |
| 7         | Flexibility and Efficiency      | 3         | 無鍵盤捷徑（無 "/" 聚焦搜尋）                                         |
| 8         | Aesthetic and Minimalist Design | 3         | mono+flat 紀律佳；3 欄卡片密度過高、社交圖示 hero/footer 重複         |
| 9         | Error Recovery                  | 3         | 404/500 頁存在；首頁本身無錯誤路徑                                    |
| 10        | Help and Documentation          | 3         | about/terms 存在，首頁無 contextual help 入口                         |
| **Total** |                                 | **32/40** | **Good（28–35）**                                                     |

## Design Specificity Verdict

**LLM assessment**：不是 category-interchangeable。"Terminal Notebook"
設計系統（monospace 全域、flat 無陰影、dashed underline、單一
accent、漸層字標）是鮮明的作者簽名，且與產品定位（工程師/系統管理者、部落格本身示範其提倡的效能）互相支撐——零
web font 下載、token 驅動無硬編碼 hex。但**頁面結構**是通用 Astro
部落格範本（avatar hero → 卡片格 →
footer），角色感集中在字標與頭像，內容層缺乏"這個站寫什麼"的錨點，專屬性靠視覺語言撐住，靠資訊架構撐不住。

**Deterministic scan**：CLI `impeccable detect --json src/pages/index.astro` →
`[]`，exit 0，乾淨。

**Visual overlays**：CDP 注入 detect.js 成功（overlay 可見，見
b-injected.png），console 回報 `[impeccable] 1 anti-pattern found`：

- rule `gradient-text`：`background-clip: text + gradient`，位置
  `span.name`（`src/styles/author.css:2-8`）。
- 研判：部分誤報——DESIGN.md
  明訂字標漸層是唯一品牌時刻，不應移除。但探測器的疑慮有真實成分：淺色主題漸層末端
  `#fef1b4` 對 `#fdfdfd` 對比約 1.1:1，即使字標為 36px/700（WCAG large text 需
  3:1）仍遠遠不达标，截圖中 "oxff"
  尾段確實泛白近不可見。正確修法是重新校準淺色漸層，不是刪除。

## Overall Impression

工整、有紀律的站。設計系統層級的執行（mono/flat/token）明顯高於一般個人部落格，a11y
骨架（skip link、focus ring、<time> +
sr-only）也可見用心。最大的機會是：首頁承擔「總覽」職責卻沒有導言與定位，新訪客落地後直接面對文章列表；以及字標漸層在淺色主題的對比失效——兩者都是小改动高回收。

## What's Working

1. **設計系統紀律**：全域 monospace、單一 accent、1px border
   分區、無陰影，顏色全部走 CSS custom property + Tailwind
   `@theme inline`，元件不硬編碼 hex。與 "the blog demonstrates what it teaches"
   的產品原則一致。
2. **無障礙骨架**：skip link 跳轉至內容、`:focus-visible` 2px dashed outline
   全站一致、圖示按鈕補 sr-only/title、`Datetime.astro` 用 `<time datetime>` +
   螢幕 reader 專用前綴（"發布於"/"更新於"），標題層級 h1→h2→h3 不跳級。
3. **雙主題皆成立**：淺/深各自有通過 AA 的 accent，主題由 inline script
   在繪製前設定（無閃白），預設尊重 `prefers-color-scheme`。

## Priority Issues

- **[P1] 首頁 hero 缺導言**：`SITE.desc`（"分享 Neko0xff
  的技術文章與系統管理經驗。"）只存在於 meta
  description，頁面上沒有任何一句介紹。從站外落地首頁的訪客只看見頭像、站名、RSS
  與 4 個社交圖示，緊接著就是文章列表。 **Why it
  matters**：第一印象缺定位與信任錨點；對「從搜尋引擎進來、判斷這站是否值得停留」的讀者是關鍵
  5 秒。 **Fix**：hero 在 RSS 連結上方加一行 `SITE.desc`（label size、foreground
  80%），或把 RSS/社交列與介紹文重組為「介紹 → 訂閱/社群」兩段。 **Suggested
  command**: `/impeccable clarify`

- **[P1] 字標漸層淺色主題對比失效**：`author.css:4`
  `#f2973b 25% → #fef1b4`，淺色背景 `#fdfdfd` 下末端對比約 1.1:1（需
  ≥3:1）。深色主題同一漸層約 13:1 無虞。 **Why it matters**：h1
  是頁面最重要的文字；尾段字元在淺色主題近乎不可讀，同時是 detector 唯一標記項。
  **Fix**：保留漸層與品牌形狀，將淺色漸層末端壓暗至全程 ≥3:1（以 `#fdfdfd`
  為實測基準，約 `#c2410c` 一帶），深色漸層不動。 **Suggested command**:
  `/impeccable colorize`

- **[P2] 3 欄卡片格密度與 3+1 破圖**：`postPerIndex: 4` 配
  `lg:grid-cols-3`，1280px 下每欄約 215px，monospace 中文每行僅約 10 字，標題折
  2–3 行、描述 3–5 行；第 4 張卡獨佔第二列，右側 2/3 空白（三張截圖皆可證）。
  **Why it matters**：掃描成本變高、欄高不齊、單張卡破壞網格節奏。 **Fix**：lg
  改 2 欄（4 張剛好 2×2），或保留 3 欄但卡片描述 `line-clamp-2`
  截齊；兩者可並用。 **Suggested command**: `/impeccable layout`

- **[P2] 主題切換按鈕無障礙狀態揭露不足**：`Header.astro:134-140`
  `aria-label="auto"` 為靜値、`aria-live="polite"`
  掛在無文字更新的按鈕上；`title="Toggles light & dark"` 在 zh-TW 站內是英文。
  **Why it matters**：螢幕 reader 使用者聽到 "auto"
  無法理解用途與當前狀態；混用英文 tooltip 破壞語言一致性。 **Fix**：依
  `data-theme` 動態切換 `aria-label`（"切換至深色模式"/"切換至淺色模式"），title
  中文化。 **Suggested command**: `/impeccable harden`

- **[P3] 缺效率加速器**：全站無鍵盤捷徑，回訪讀者想搜尋必須移動滑鼠至 header
  放大鏡、再跳轉 search 頁。 **Why it matters**：主要讀者（工程師）是 power user
  輪廓，鍵盤優先的期待沒被滿足。 **Fix**：加全站 "/" 快捷鍵聚焦搜尋輸入（或於
  header 內嵌搜尋框）。 **Suggested command**: `/impeccable delight`

## Persona Red Flags

**Alex (Power User)**：主要動作（讀最新一篇）1
點擊可達，順暢。但連續掃描場景失敗：無 "/" 搜尋捷徑、無快捷鍵；每次搜尋都要
header 找放大鏡→跳頁→輸入，三步全靠滑鼠。`Header.astro:121-131` 搜尋僅圖示 +
sr-only，桌面尚可，無加速器是核心紅旗。

**Sam (Accessibility-Dependent)**：鍵盤流程本身合格（skip link、focus ring、Tab
順序合理、`<time>` 有 sr-only 前綴）。紅旗集中在 `Header.astro:134-140`
主題切換：`aria-label="auto"` 靜態無意義、`aria-live`
無承載文字，狀態變更完全不宣告；社交圖示有 sr-only
✓。另注意手機版社交圖示觸控目標 40px（`Socials.astro:16` `p-2` + 24px 圖示）低於
44px 建議値。

**專案 Persona「趕時間的搜尋引擎工程師」（衍生自 PRODUCT.md 讀者描述）**：從
SERP
落地首頁時，第一眼沒有「這個站寫什麼、有沒有我要的解法類型」的任何文字錨點；必須點「關於」才能理解定位。§2
提到的 AM/PM 12 小時制日期（`Datetime.astro:32`）對習慣 log/24 小時制的 ops
讀者需要一次心理轉換。

## Cognitive Load & Emotional Journey

Cognitive load checklist：8 項中 2 項失敗——Single focus（hero 有 6
個互動元素先於內容）、Progressive
disclosure（描述全文不截斷，資訊一次攤開）。Minimal choices 邊緣過關（導覽 7
個頂層項目 >4，但屬常規 header
模式，手機端收進漢堡）。結論：低-中認知負荷，主要浪費在 hero
入口過載與卡片密度。

Emotional journey：進入 → 頭像 + 漸層字標（有角色、溫暖的 peak）→
直接切入文章列表（功能性、無过渡）→ 「全部文章 →」明確出口 + footer
收尾。無情緒低谷；但也無第二個記憶點，且「精選文章」區當前因無 featured
文章被隱藏（`index.astro:102` 正確守衛），首頁節奏因此偏單調。

## Minor Observations

- 淺色主題 `<hr>`（`--border: #ece9e9`）幾乎不可見，hero
  與內容的分界在淺色下接近消失（三張截圖可證）；深色 `#ab4b08`
  則清楚。可考慮淺色邊界加深一檔。
- RSS 訂閱連結 `target="_blank"`（`index.astro:82-83`）：在新分頁開 XML
  不如直接導覽；且首頁已有頁尾社群列。
- 日期格式 `YYYY/MM/D | AM hh:mm`（`Datetime.astro:31-32`）：非補零日期 + 12
  小時制；全站一致是優點，格式本身可再議。
- 導覽 7 個頂層項目（文章/標籤/友站連結/條款/關於 + 搜尋 + 主題）超過 ≤5
  指引；桌面可接受，歸檔入口為圖示 + sr-only 文字。
- Hero 頭像 160px `loading="eager" fetchpriority="high"`，LCP 處理正確。
- dev 模式截圖中的 Astro dev toolbar
  浮動列為開發期產物，非正式環境問題，已排除於設計判斷。

## Questions to Consider

- 如果 hero 多一行介紹能換取首跳信任，你願意讓字標不再是唯一的有機元素嗎？
- 4 張卡在 2×2 與 3+1 之間，你更在意網格對稱還是單屏資訊量？
- 字標漸層若為了對比損失一點「熒光感」，品牌與可讀性你各讓多少？
