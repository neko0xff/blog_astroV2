# 部署指南

本文件說明如何建置 `blog_astroV2` 應用程式並將其部署至 Kubernetes 叢集。

## 先決條件

- **Docker**: 用於建置容器映像檔。
- **Kubectl**: 已設定好與您的目標 Kubernetes 叢集通訊。
- **Container Registry**: 可存取的映像檔儲存庫（例如 GitHub Container Registry、Docker Hub），用於推送映像檔。

## 1. 建置並推送 Docker 映像檔

首先，您需要建置 Docker 映像檔並將其推送至 Kubernetes 叢集可存取的儲存庫。

```bash
# 設定您的儲存庫/使用者名稱 (範例: ghcr.io/neko0xff)
export IMAGE_NAME=ghcr.io/neko0xff/blog_astrov2
export IMAGE_TAG=latest

# 建置映像檔
docker build -t $IMAGE_NAME:$IMAGE_TAG -f Dockerfile.env .

# 推送映像檔
docker push $IMAGE_NAME:$IMAGE_TAG
```

> [!NOTE]
> 如果您使用不同的映像檔名稱，請記得在部署前更新 `k8s/deployment.yaml` 中的映像檔路徑。

## 2. 部署至 Kubernetes

Kubernetes 設定檔位於 `k8s/` 目錄中。

### 步驟 1: 建立命名空間 (Namespace)

建立應用程式運行的命名空間。

```bash
kubectl apply -f k8s/namespace.yaml
```

### 步驟 2: 部署應用程式

部署應用程式 Pods。

```bash
kubectl apply -f k8s/deployment.yaml
```

### 步驟 3: 揭露內部服務

建立內部服務以連接 Pods 網路。

```bash
kubectl apply -f k8s/service.yaml
```

### 步驟 4: 設定外部存取 (Ingress)

部署 Ingress 資源以路由外部流量。

```bash
kubectl apply -f k8s/ingress.yaml
```

> [!IMPORTANT]
> **網域設定**: `k8s/ingress.yaml` 中的屬性（特別是 `host: blog.example.com`）應更改為您的實際網域名稱。
> 您還需要在叢集中運行 Ingress Controller（如 NGINX）。

## 3. 驗證

檢查您的部署狀態：

```bash
# 檢查命名空間中的所有資源
kubectl get all -n blog-astro

# 如果 Pod 失敗，檢查日誌
kubectl logs -l app=blog-astro -n blog-astro
```

一旦 Pod 狀態為 `Running` 且 Ingress 獲得了 `ADDRESS` (IP)，您應該就可以透過設定的網域存取您的部落格了。

## 本地開發 (Minikube)

您可以使用 Minikube 在本地執行此專案，而無需將映像檔推送到遠端儲存庫。

### 快速開始（自動化）

使用自動化部署腳本：

```bash
# 賦予腳本執行權限（僅需首次執行）
chmod +x k8s/deploy-local.sh

# 執行部署腳本
./k8s/deploy-local.sh
```

此腳本會自動執行：

1. 切換到 Minikube 的 Docker 環境
2. 在本地建置 Docker 映像檔
3. 部署所有 Kubernetes 資源
4. 等待 Pod 就緒
5. 顯示部署狀態

### 手動部署

如果您偏好手動部署：

#### 1. 啟動 Minikube

```bash
minikube start
```

#### 2. 使用 Minikube 的 Docker Daemon

此指令允許您直接在 Minikube 內部建置映像檔。

```bash
eval $(minikube docker-env)
```

#### 3. 在本地建置映像檔

```bash
# 使用本地映像名稱建置（不需要儲存庫前綴）
docker build -t neko0xff/blog_astrov2:latest -f Dockerfile.env .
```

> [!IMPORTANT]
> **映像配置**：`k8s/deployment.yaml` 已配置為使用 `image: neko0xff/blog_astrov2:latest` 並設定 `imagePullPolicy: IfNotPresent`，這是為本地開發環境設計的。這可以防止 Kubernetes 嘗試從遠端儲存庫拉取映像。

#### 4. 啟用 Ingress Addon

```bash
minikube addons enable ingress
```

#### 5. 部署

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml
```

#### 6. 驗證部署

```bash
# 檢查所有資源
kubectl get all -n blog-astro

# 檢查 Pod 狀態
kubectl get pods -n blog-astro

# 如需查看日誌
kubectl logs -l app=blog-astro -n blog-astro
```

### 存取應用程式

您有兩種方式可以存取已部署的應用程式：

#### 方式 1：Port Forward（推薦用於快速測試）

```bash
kubectl port-forward -n blog-astro svc/blog-astro-service 8085:80
```

然後在瀏覽器訪問：**http://lockubectl get all -n blog-astroalhost:8085**

#### 方式 2：使用 Ingress 和 Minikube Tunnel

```bash
# 在另一個終端機中執行：
sudo minikube tunnel
```

將 Ingress IP 新增到您的 `/etc/hosts`：

```bash
# 取得 Ingress IP
kubectl get ingress -n blog-astro

# 新增到 /etc/hosts（替換為實際 IP）
192.168.49.2 blog.example.com
```

然後訪問：**http://blog.example.com**

### 疑難排解

- Q1: 如果 Pod 顯示 `ImagePullBackOff` 狀態：
  1. 確保您在 Minikube 的 Docker 環境中建置映像：`eval $(minikube docker-env)`
  2. 驗證映像是否存在：`docker images | grep blog_astrov2`
  3. 檢查 `deployment.yaml` 是否使用 `imagePullPolicy: IfNotPresent`

更多疑難排解技巧，請參閱 [TROUBLESHOOTING_zh-TW.md](TROUBLESHOOTING_zh-TW.md)。
