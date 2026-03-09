#!/bin/bash
# Postiz 快速部署脚本 - 简化版

set -e

echo "🚀 Postiz 快速部署"
echo "=================="

# 1. 检查并安装 Docker
if ! command -v docker &> /dev/null; then
    echo "📦 安装 Docker..."
    curl -fsSL https://get.docker.com | bash
    systemctl start docker
    systemctl enable docker
else
    echo "✓ Docker 已安装"
fi

# 2. 检查并安装 Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "📦 安装 Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
else
    echo "✓ Docker Compose 已安装"
fi

# 3. 进入项目目录（假设已经克隆）
if [ ! -d "/opt/postiz" ]; then
    echo "❌ 项目目录不存在，请先克隆代码："
    echo "   cd /opt && git clone https://github.com/likejing/postiz-app.git postiz"
    exit 1
fi

cd /opt/postiz

# 4. 配置环境变量
if [ ! -f ".env" ]; then
    echo "⚙️  配置环境变量..."
    cp .env.example .env

    # 生成随机密钥
    JWT_SECRET=$(openssl rand -base64 32)
    DB_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)

    # 更新配置
    sed -i "s|JWT_SECRET=.*|JWT_SECRET=\"$JWT_SECRET\"|" .env
    sed -i "s|postiz-password|$DB_PASSWORD|g" .env
    sed -i "s|IS_GENERAL=.*|IS_GENERAL=\"true\"|" .env

    # 获取服务器 IP
    SERVER_IP=$(hostname -I | awk '{print $1}')
    sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=\"http://$SERVER_IP\"|" .env
    sed -i "s|NEXT_PUBLIC_BACKEND_URL=.*|NEXT_PUBLIC_BACKEND_URL=\"http://$SERVER_IP/api\"|" .env

    echo "✓ 环境变量已配置"
    echo "  访问地址: http://$SERVER_IP:4200"
else
    echo "✓ 环境变量已存在"
fi

# 5. 启动服务
echo "🚀 启动服务..."
docker-compose -f docker-compose.prod.yaml down 2>/dev/null || true
docker-compose -f docker-compose.prod.yaml up -d

# 6. 等待服务启动
echo "⏳ 等待服务启动（30秒）..."
sleep 30

# 7. 显示状态
echo ""
echo "======================================"
echo "✅ 部署完成！"
echo "======================================"
echo ""
docker-compose -f docker-compose.prod.yaml ps
echo ""
SERVER_IP=$(hostname -I | awk '{print $1}')
echo "📝 访问地址："
echo "   前端: http://$SERVER_IP:4200"
echo "   后端: http://$SERVER_IP:3000"
echo ""
echo "📋 查看日志: docker-compose -f docker-compose.prod.yaml logs -f"
echo "🔄 重启服务: docker-compose -f docker-compose.prod.yaml restart"
echo ""
