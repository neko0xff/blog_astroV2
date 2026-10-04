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

- 目標：月可用率 99.5%、p95 回應時間 < 300ms。
- 建議掛一個免費 uptime 監控（如 UptimeRobot）每 5 分鐘打 `/healthz`，連續失敗即告警。
- 5xx 上升時的SOP：
  1. 看日誌找 `status: 5xx` 與 `[Website] serving request`
  2. 是否剛部署（是就回滾）
  3. 是否單一上游（如 giscus）問題
  4. 都不是才進程式除錯

## CDN 與 TLS 檢查清單

- CDN（如 Cloudflare）橘雲後，確認 `/_astro/*` 走邊緣快取（`Cache-Control: public, max-age=31536000, immutable` 已由本站送出）。
- HSTS 送 `max-age=31536000; includeSubDomains`（`_headers` 與 `server/config.ts` 已對齊，由 `tests/headers_parity.test.ts` 守門）。
- `preload` token 已拿掉：2026-10-04 查過 hstspreload.org，`dev-blog.nekolab.deno.net` 狀態為 unknown（未提交），不廣告沒做到的事。
- 真的要進 preload 名單時，先確認全站只走 HTTPS，到 hstspreload.org 提交，通過後再把 `preload` 加回兩處。
- `k8s/ingress.yaml` 的 `blog.example.com` 是佔位符，上線前換成真實網域並備好 `blog-astro-tls` 憑證 Secret。

## 備註：運行期不需要 Deno KV

- `deno.json` 的 `--unstable-kv` 只出現在建置/開發/bench 旗標
- 程式碼內無 `Deno.openKv`
- 正式伺服器（`dist/server.ts`）是無狀態靜態服務
- 容器與 K8s 都不需要掛 KV
- 備份只需保住 git 與建置產物（可重建）
