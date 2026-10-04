維運手冊
===

[回專案主頁](.././README.md) · [如何運行該專案](./running.md)

## 健康檢查與記錄日誌

- 健康檢查：`GET /healthz` 回 `200 ok`（`Cache-Control: no-store`）。
  - 給 compose `healthcheck` 與 K8s liveness/readiness 探測用
  - 刻意不記 access log
  ```zsh
  curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8085/healthz
  # 預期：200
  ```
- access log 預設人讀格式，可用 `LOG_FORMAT=json` 切成結構化 JSON 給收集器：
  ```zsh
  LOG_FORMAT=json deno task serve
  # {"timestamp":"2026-10-04 07:20:02","method":"GET","path":"/robots.txt",
  #  "status":200,"duration_ms":5,"bytes":"827","ip":"127.0.0.1",
  #  "user_agent":"curl/8.22.0","referer":"-"}
  ```
- 查看記錄檔：
  - docker: `docker compose logs --tail=100 -f`
  - K8s: `kubectl logs -n blog-astro -l app=blog-astro --tail=100 -f`
  - Deno Deploy（static 模式）：
    - **不會**執行 `server.ts`，因此我們的 access log / `/healthz` 不適用於 Deploy
    - 請到 console.deno.com 的 app → Observability 查看平台內建 request log

## 回滾

> 正式環境部署一律手動（`deno task deploy:release`），禁止寫進自動化流程

- Deno Deploy：
  1. 到 Deploy 控制台選上一個成功的部署按 Rollback
  2. 重跑一次上一個好的 commit 的建置再 `deno task deploy:test`
- Docker Compose：切回上一個可用的 commit，重建重啟
  ```zsh
  git log --oneline -5
  git checkout <上一個好的 sha>
  docker compose up -d --build
  ```
- Kubernetes：
  1. `kubectl rollout undo -n blog-astro deployment/blog-astro`，
  2. `kubectl rollout status -n blog-astro deployment/blog-astro` 確認

## SLO 與告警

### 服務水準目標 (SLO)

- **月可用率 (Availability)**：$\ge 99.5\%$
- **回應延遲 (Latency)**：$\text{p95} < 300\text{ ms}$

### 探針與監控告警 (Monitoring & Alerting)

- **健康檢查**：配置外部監控服務（例如 UptimeRobot），每 **5 分鐘** 發送請求至 `/healthz` 端點。
- **告警觸發**：連續探測失敗時，立即發出緊急告警通知。

### 5xx 服務異常處置流程 (Incident SOP)

當收到 5xx 錯誤率上升告警時，請依序執行以下步驟：

1. **查看即時日誌**：過濾關鍵字 `status: 5xx` 與 `[Website] serving request`，鎖定異常請求路徑與錯誤訊息。
2. **檢查近期變更**：確認是否剛進行版本部署？
   - **是** $\rightarrow$ 立即執行**版本回滾 (Rollback)** 優先止血。
   - **否** $\rightarrow$ 繼續執行步驟 3。
3. **排查第三方/上游服務**：確認是否為外部服務異常（例如 giscus 留言系統、API Gateway 或外部資料源）所致。
4. **深入程式除錯**：若排除變更與上游服務問題，方進行系統核心邏輯與程式碼層級（Code-level）的排查除錯。

## CDN 與 TLS 檢查清單

### 快取與 CDN (Cloudflare)

- **邊緣快取驗證**：
  - 專案已啟用 Cloudflare（Proxied）
  - 確認 Astro 編譯產出的靜態資源路由 `/_astro/*` 已送出 `Cache-Control: public, max-age=31536000, immutable`，確保能夠正常在 CDN 邊緣節點進行長效快取。

### HSTS 安全標頭配置

- **標頭一致性守門**：
  - HSTS 標頭統一設為 `max-age=31536000; includeSubDomains`
  - 已完成 `_headers` 與 `server/config.ts` 的組態對齊，並透過 `tests/headers_parity.test.ts` 測試確保後續變更不走樣
- **移除未生效的 preload**：
  - 於 2026-10-04 確認 hstspreload.org 狀態，`dev-blog.nekolab.deno.net` 當前為 `unknown`（未提交）。
  - 秉持實事求是原則，已暫時移除 `preload` 指令。

### 後續維護與正式上線規範

1. **HSTS Preload 提交流程**： 若未來評估要將網域納入 HSTS Preload 名單，需滿足以下步驟：
   - 確認全站及所有子網域皆已強制使用 HTTPS。
   - 前往 [hstspreload.org](https://hstspreload.org) 提交申請。
   - 審核通過後，再同步將 `preload` 補回 `_headers` 與 `server/config.ts`。

2. **Kubernetes 部署注意事項**：
   - 上線前請務必將 `k8s/ingress.yaml` 中的佔位符網域 `blog.example.com` 替換為實際生產網域。
   - 預先於集群中配置並確認 `blog-astro-tls` 憑證 Secret 運作正常。

## 備註：運行期不需要 Deno KV

> 本服務為 **純無狀態（Stateless）靜態服務**，正式運行期（Runtime）不需要 Deno KV

### 程式碼與設定說明

- 程式碼內部未呼叫 `Deno.openKv`，正式產物 `dist/server.ts` 不含任何狀態儲存邏輯
- `deno.json` 中的 `--unstable-kv` 僅為開發、建置與 Benchmark 階段所需的旗標，不影響正式環境

### 基礎設施與備份注意事項

- **K8s / 容器部署**：無需掛載 PVC 或設置 KV 相關環境變數，直接以無狀態 Pod 部署即可
- **災難復原 (DR)**：服務具備完全可重建性，僅需確保 Git 版本庫與 build artifacts 安全備份
