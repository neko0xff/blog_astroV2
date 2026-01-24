#!/bin/bash
set -e

echo "[Dev] 開始本地 Kubernetes 部署流程..."
echo "[Dev] 01 切換到 Minikube Docker 環境..."
eval $(minikube docker-env)
echo "[Dev] 02 建置 Docker 映像..."
docker build -f Dockerfile.env -t neko0xff/blog_astrov2:latest .
echo "[Dev] 03 驗證映像..."
docker images | grep blog_astrov2

echo "[Dev] 04 部署到 Kubernetes..."
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml

echo "[Dev] 05 等待 Pod 啟動..."
kubectl wait --for=condition=ready pod -l app=blog-astro -n blog-astro --timeout=300s

echo "[Dev] 06 部署狀態："
kubectl get pods -n blog-astro
kubectl get svc -n blog-astro
kubectl get ingress -n blog-astro

echo "[Dev] 07 部署完成！"
echo ""
echo "[Dev] 訪問應用："
echo "   - 使用 Minikube tunnel: minikube tunnel"
echo "   - 或使用 Port Forward: kubectl port-forward -n blog-astro svc/blog-astro-service 8085:80"
