#!/bin/bash

# Postiz 一键部署脚本
# 适用于 CentOS 7+, Ubuntu 18.04+, Debian 10+

set -e

echo "🚀 Postiz 一键部署脚本"
echo "======================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ 请使用 root 用户运行此脚本${NC}"
    echo "   使用命令: sudo bash deploy.sh"
    exit 1
fi

# 检测操作系统
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    VERSION=$VERSION_ID
else
    echo -e "${RED}❌ 无法检测操作系统${NC}"
    exit 1
fi

echo -e "${GREEN}✓${NC} 检测到操作系统: $OS $VERSION"

# 安装 Docker
install_docker() {
    if command -v docker &> /dev/null; then
        echo -e "${GREEN}✓${NC} Docker 已安装"
        return
    fi

    echo -e "${YELLOW}📦 安装 Docker...${NC}"

    if [ "$OS" = "centos" ] || [ "$OS" = "rhel" ]; then
        yum install -y yum-utils
        yum-config-manager --add-repo https://mirrors.aliyun.com/docker-ce/linux/centos/docker-ce.repo
        yum install -y docker-ce docker-ce-cli containerd.io
    elif [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        apt-get update
        apt-get install -y apt-transport-https ca-certificates curl gnupg lsb-release
        curl -fsSL https://mirrors.aliyun.com/docker-ce/linux/$OS/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg
        echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://mirrors.aliyun.com/docker-ce/linux/$OS $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null
        apt-get update
        apt-get install -y docker-ce docker-ce-cli containerd.io
    else
        echo -e "${RED}❌ 不支持的操作系统: $OS${NC}"
        exit 1
    fi

    systemctl start docker
    systemctl enable docker
    echo -e "${GREEN}✓${NC} Docker 安装完成"
}

# 安装 Docker Compose
install_docker_compose() {
    if command -v docker-compose &> /dev/null; then
        echo -e "${GREEN}✓${NC} Docker Compose 已安装"
        return
    fi

    echo -e "${YELLOW}📦 安装 Docker Compose...${NC}"
    curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}✓${NC} Docker Compose 安装完成"
}

# 安装 Git
install_git() {
    if command -v git &> /dev/null; then
        echo -e "${GREEN}✓${NC} Git 已安装"
        return
    fi

    echo -e "${YELLOW}📦 安装 Git...${NC}"
    if [ "$OS" = "centos" ] || [ "$OS" = "rhel" ]; then
        yum install -y git
    else
        apt-get install -y git
    fi
    echo -e "${GREEN}✓${NC} Git 安装完成"
}

# 克隆项目
clone_project() {
    echo -e "${YELLOW}📥 克隆项目...${NC}"

    cd /opt
    if [ -d "postiz" ]; then
        echo -e "${YELLOW}⚠️  项目目录已存在，更新代码...${NC}"
        cd postiz
        git pull
    else
        git clone https://github.com/likejing/postiz-app.git postiz
        cd postiz
    fi

    echo -e "${GREEN}✓${NC} 项目克隆完成"
}

# 配置环境变量
configure_env() {
    echo ""
    echo -e "${YELLOW}⚙️  配置环境变量${NC}"
    echo "===================="

    if [ -f ".env" ]; then
        echo -e "${YELLOW}⚠️  .env 文件已存在${NC}"
        read -p "是否覆盖现有配置? (y/N): " overwrite
        if [ "$overwrite" != "y" ] && [ "$overwrite" != "Y" ]; then
            echo -e "${GREEN}✓${NC} 保留现有配置"
            return
        fi
    fi

    cp .env.example .env

    # 生成随机 JWT 密钥
    JWT_SECRET=$(openssl rand -base64 32)
    sed -i "s|JWT_SECRET=.*|JWT_SECRET=\"$JWT_SECRET\"|" .env

    # 生成随机数据库密码
    DB_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)
    sed -i "s|postiz-password|$DB_PASSWORD|g" .env

    # 获取服务器 IP
    SERVER_IP=$(hostname -I | awk '{print $1}')

    echo ""
    echo "请输入你的域名（如果没有域名，直接回车使用 IP 地址）："
    read -p "域名: " DOMAIN

    if [ -z "$DOMAIN" ]; then
        DOMAIN=$SERVER_IP
        PROTOCOL="http"
    else
        PROTOCOL="https"
    fi

    sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=\"$PROTOCOL://$DOMAIN\"|" .env
    sed -i "s|NEXT_PUBLIC_BACKEND_URL=.*|NEXT_PUBLIC_BACKEND_URL=\"$PROTOCOL://$DOMAIN/api\"|" .env
    sed -i "s|IS_GENERAL=.*|IS_GENERAL=\"true\"|" .env

    echo -e "${GREEN}✓${NC} 环境变量配置完成"
    echo ""
    echo "配置信息："
    echo "  - 访问地址: $PROTOCOL://$DOMAIN"
    echo "  - 数据库密码: $DB_PASSWORD"
    echo "  - JWT 密钥: $JWT_SECRET"
    echo ""
}

# 配置防火墙
configure_firewall() {
    echo -e "${YELLOW}🛡️  配置防火墙...${NC}"

    if command -v firewall-cmd &> /dev/null; then
        firewall-cmd --permanent --add-port=80/tcp
        firewall-cmd --permanent --add-port=443/tcp
        firewall-cmd --permanent --add-port=3000/tcp
        firewall-cmd --permanent --add-port=4200/tcp
        firewall-cmd --reload
        echo -e "${GREEN}✓${NC} Firewalld 配置完成"
    elif command -v ufw &> /dev/null; then
        ufw allow 80/tcp
        ufw allow 443/tcp
        ufw allow 3000/tcp
        ufw allow 4200/tcp
        echo -e "${GREEN}✓${NC} UFW 配置完成"
    else
        echo -e "${YELLOW}⚠️  未检测到防火墙，请手动开放端口 80, 443, 3000, 4200${NC}"
    fi
}

# 启动服务
start_services() {
    echo ""
    echo -e "${YELLOW}🚀 启动服务...${NC}"

    docker-compose -f docker-compose.prod.yaml down 2>/dev/null || true
    docker-compose -f docker-compose.prod.yaml up -d

    echo -e "${GREEN}✓${NC} 服务启动完成"
}

# 等待服务就绪
wait_for_services() {
    echo ""
    echo -e "${YELLOW}⏳ 等待服务启动...${NC}"

    for i in {1..30}; do
        if docker-compose -f docker-compose.prod.yaml ps | grep -q "Up"; then
            echo -e "${GREEN}✓${NC} 服务已就绪"
            return
        fi
        echo -n "."
        sleep 2
    done

    echo ""
    echo -e "${YELLOW}⚠️  服务启动时间较长，请稍后检查${NC}"
}

# 显示部署信息
show_info() {
    echo ""
    echo "======================================"
    echo -e "${GREEN}✅ 部署完成！${NC}"
    echo "======================================"
    echo ""

    SERVER_IP=$(hostname -I | awk '{print $1}')

    echo "📝 访问信息："
    echo "   前端: http://$SERVER_IP:4200"
    echo "   后端 API: http://$SERVER_IP:3000"
    echo ""

    echo "📋 常用命令："
    echo "   查看日志: cd /opt/postiz && docker-compose -f docker-compose.prod.yaml logs -f"
    echo "   查看状态: cd /opt/postiz && docker-compose -f docker-compose.prod.yaml ps"
    echo "   重启服务: cd /opt/postiz && docker-compose -f docker-compose.prod.yaml restart"
    echo "   停止服务: cd /opt/postiz && docker-compose -f docker-compose.prod.yaml down"
    echo "   更新代码: cd /opt/postiz && git pull && docker-compose -f docker-compose.prod.yaml up -d --build"
    echo ""

    echo "🔐 安全建议："
    echo "   1. 修改数据库密码（已自动生成随机密码）"
    echo "   2. 配置 HTTPS 证书（使用 Let's Encrypt）"
    echo "   3. 定期备份数据库"
    echo "   4. 配置防火墙规则"
    echo ""

    echo "📖 更多信息："
    echo "   部署文档: /opt/postiz/DEPLOY.md"
    echo "   平台配置: /opt/postiz/PLATFORM_SETUP_GUIDE.md"
    echo "   云部署指南: /opt/postiz/CLOUD_DEPLOYMENT.md"
    echo ""
}

# 主函数
main() {
    install_docker
    install_docker_compose
    install_git
    clone_project
    configure_env
    configure_firewall
    start_services
    wait_for_services
    show_info
}

# 运行主函数
main
