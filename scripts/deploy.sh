#!/bin/bash
# Postiz 快速部署脚本
# 在服务器上手动执行部署

set -e

# 默认部署目录
DEPLOY_DIR="${DEPLOY_DIR:-/www/wwwroot/postiz-app}"

cd "$DEPLOY_DIR"

echo "🔄 拉取最新代码..."
git pull origin main

echo "🛑 停止旧容器..."
docker compose -f docker-compose.prod.yaml down

echo "🔨 构建镜像..."
docker compose -f docker-compose.prod.yaml build

echo "🚀 启动服务..."
docker compose -f docker-compose.prod.yaml up -d

echo "⏳ 等待服务启动..."
sleep 30

echo "🧹 清理旧镜像..."
docker image prune -f

echo ""
echo "✅ 部署完成!"
echo ""
echo "📊 服务状态:"
docker compose -f docker-compose.prod.yaml ps

echo ""
echo "🔗 访问地址:"
echo "   前端: http://your-domain:4200"
echo "   后端: http://your-domain:3000"
