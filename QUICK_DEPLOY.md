# 🚀 Postiz 云服务器一键部署

## 最快部署方式（5分钟）

### 方法一：使用一键脚本

在你的云服务器上运行：

```bash
curl -fsSL https://raw.githubusercontent.com/likejing/postiz-app/main/deploy.sh | sudo bash
```

或者：

```bash
wget -qO- https://raw.githubusercontent.com/likejing/postiz-app/main/deploy.sh | sudo bash
```

**就这么简单！** 脚本会自动：
- ✅ 安装 Docker 和 Docker Compose
- ✅ 克隆项目代码
- ✅ 配置环境变量
- ✅ 启动所有服务
- ✅ 配置防火墙

### 方法二：手动部署

#### 1. 连接服务器
```bash
ssh root@your-server-ip
```

#### 2. 下载脚本
```bash
cd /tmp
wget https://raw.githubusercontent.com/likejing/postiz-app/main/deploy.sh
chmod +x deploy.sh
```

#### 3. 运行脚本
```bash
sudo ./deploy.sh
```

#### 4. 按提示输入
- 域名（可选，没有域名直接回车使用 IP）

---

## 支持的系统

- ✅ CentOS 7+
- ✅ Ubuntu 18.04+
- ✅ Debian 10+
- ✅ RHEL 7+
- ✅ 阿里云 ECS
- ✅ 腾讯云 CVM
- ✅ 华为云 ECS
- ✅ AWS EC2
- ✅ Azure VM

---

## 服务器配置要求

### 最低配置
- CPU: 2核
- 内存: 4GB
- 硬盘: 20GB
- 带宽: 3Mbps

### 推荐配置
- CPU: 4核
- 内存: 8GB
- 硬盘: 50GB
- 带宽: 5Mbps

---

## 部署后访问

部署完成后，访问：

- **前端**: http://your-server-ip:4200
- **后端 API**: http://your-server-ip:3000

---

## 配置 HTTPS（推荐）

### 1. 安装 Nginx
```bash
# CentOS
yum install -y nginx

# Ubuntu/Debian
apt install -y nginx
```

### 2. 安装 SSL 证书
```bash
# 安装 Certbot
snap install --classic certbot

# 获取证书
certbot --nginx -d your-domain.com
```

### 3. 配置 Nginx
```bash
cat > /etc/nginx/conf.d/postiz.conf <<EOF
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://\$server_name\$request_uri;
}

server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;

    location / {
        proxy_pass http://localhost:4200;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }

    location /api {
        proxy_pass http://localhost:3000;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
    }
}
EOF

nginx -t && systemctl restart nginx
```

---

## 常用命令

### 查看服务状态
```bash
cd /opt/postiz
docker-compose -f docker-compose.prod.yaml ps
```

### 查看日志
```bash
cd /opt/postiz
docker-compose -f docker-compose.prod.yaml logs -f
```

### 重启服务
```bash
cd /opt/postiz
docker-compose -f docker-compose.prod.yaml restart
```

### 停止服务
```bash
cd /opt/postiz
docker-compose -f docker-compose.prod.yaml down
```

### 更新代码
```bash
cd /opt/postiz
git pull
docker-compose -f docker-compose.prod.yaml up -d --build
```

### 备份数据库
```bash
docker exec postiz-postgres pg_dump -U postiz postiz-db > backup-$(date +%Y%m%d).sql
```

---

## 故障排查

### 服务无法启动
```bash
# 查看详细日志
docker-compose -f docker-compose.prod.yaml logs

# 检查端口占用
netstat -tlnp | grep -E '3000|4200|5432|6379'

# 重新构建
docker-compose -f docker-compose.prod.yaml up -d --build --force-recreate
```

### 无法访问
```bash
# 检查防火墙
firewall-cmd --list-ports  # CentOS
ufw status                 # Ubuntu

# 检查 Docker 网络
docker network ls
docker network inspect postiz_default
```

### 数据库连接失败
```bash
# 检查数据库状态
docker exec postiz-postgres pg_isready

# 重启数据库
docker-compose -f docker-compose.prod.yaml restart postiz-postgres
```

---

## 性能优化

### 1. 启用 Redis 持久化
编辑 `docker-compose.prod.yaml`：
```yaml
postiz-redis:
  command: redis-server --appendonly yes
```

### 2. 增加数据库连接池
编辑 `.env`：
```env
DATABASE_POOL_SIZE=20
```

### 3. 配置 CDN
- 使用阿里云 CDN
- 使用腾讯云 CDN
- 使用七牛云 CDN

---

## 安全加固

### 1. 修改默认端口
编辑 `docker-compose.prod.yaml`，修改端口映射

### 2. 限制访问 IP
```bash
# 使用 iptables
iptables -A INPUT -p tcp --dport 3000 -s your-ip -j ACCEPT
iptables -A INPUT -p tcp --dport 3000 -j DROP
```

### 3. 启用防火墙
```bash
# CentOS
systemctl enable firewalld
systemctl start firewalld

# Ubuntu
ufw enable
```

### 4. 定期更新
```bash
# 更新系统
yum update -y  # CentOS
apt update && apt upgrade -y  # Ubuntu

# 更新 Docker 镜像
docker-compose -f docker-compose.prod.yaml pull
docker-compose -f docker-compose.prod.yaml up -d
```

---

## 监控和日志

### 1. 安装监控工具
```bash
# 安装 Portainer（Docker 可视化管理）
docker run -d -p 9000:9000 --name portainer \
  --restart=always \
  -v /var/run/docker.sock:/var/run/docker.sock \
  -v portainer_data:/data \
  portainer/portainer-ce
```

访问: http://your-server-ip:9000

### 2. 日志管理
```bash
# 限制日志大小
# 编辑 /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}

# 重启 Docker
systemctl restart docker
```

---

## 扩展阅读

- [完整部署文档](./DEPLOY.md)
- [平台配置指南](./PLATFORM_SETUP_GUIDE.md)
- [云部署详细指南](./CLOUD_DEPLOYMENT.md)
- [UI 优化文档](./UI_OPTIMIZATION_CN.md)

---

## 技术支持

- GitHub Issues: https://github.com/likejing/postiz-app/issues
- 官方文档: https://docs.postiz.com
- 社区论坛: https://community.postiz.com

---

## 常见问题

### Q: 部署需要多长时间？
A: 使用一键脚本，通常 5-10 分钟即可完成。

### Q: 需要什么技术背景？
A: 只需要基本的 Linux 命令行操作即可。

### Q: 支持哪些云服务商？
A: 支持所有主流云服务商（阿里云、腾讯云、华为云、AWS、Azure 等）。

### Q: 如何升级到最新版本？
A: 运行 `cd /opt/postiz && git pull && docker-compose -f docker-compose.prod.yaml up -d --build`

### Q: 数据会丢失吗？
A: 不会，数据存储在 Docker Volume 中，重启不会丢失。建议定期备份。

---

*最后更新: 2026年3月9日*
