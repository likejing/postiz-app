# Postiz 部署指南

更新于：2026-01-31（用于触发自动部署测试）

## 项目架构

```
┌─────────────────────────────────────────────────────────────┐
│                        用户浏览器                            │
└─────────────────────────┬───────────────────────────────────┘
                          │ :80 / :443
┌─────────────────────────▼───────────────────────────────────┐
│                    Nginx (反向代理)                          │
│                HTTPS + 负载均衡 + 缓存                       │
└─────────────────────────┬───────────────────────────────────┘
                          │
        ┌─────────────────┴─────────────────┐
        │                                   │
┌───────▼───────┐                   ┌───────▼───────┐
│  前端 (Next.js)│                   │ 后端 (NestJS) │
│     :4200     │                   │     :3000     │
└───────────────┘                   └───────┬───────┘
                                            │
                    ┌───────────────────────┼───────────────────────┐
                    │                       │                       │
            ┌───────▼───────┐       ┌───────▼───────┐       ┌───────▼───────┐
            │  PostgreSQL   │       │     Redis     │       │   Temporal    │
            │    数据库     │       │     缓存      │       │   工作流引擎  │
            └───────────────┘       └───────────────┘       └───────────────┘
```

## 一、环境要求

### 服务器配置
- **操作系统**: Ubuntu 20.04+ / CentOS 7+ / Debian 10+
- **CPU**: 2核+ (推荐 4核)
- **内存**: 4GB+ (推荐 8GB，Temporal 需要较多内存)
- **硬盘**: 50GB+ SSD
- **带宽**: 5Mbps+

### 软件要求
- Docker 20.10+
- Docker Compose 2.0+
- Git

## 二、快速部署 (Docker Compose)

### 1. 克隆代码

```bash
# 克隆仓库
git clone git@github.com:likejing/postiz-app.git /www/wwwroot/postiz-app
cd /www/wwwroot/postiz-app

# 如果需要同步上游更新
git remote add upstream https://github.com/gitroomhq/postiz-app.git
```

### 2. 准备环境变量

复制并编辑生产环境配置:

```bash
# 创建 .env 文件 (如果不存在)
cp .env.example .env
```

编辑 `.env` 文件中的关键配置:

```bash
# ==================== 必填配置 ====================
# 数据库连接 (与 docker-compose.prod.yaml 保持一致)
DATABASE_URL="postgresql://postiz-user:postiz-password@postiz-postgres:5432/postiz-db"

# Redis 连接
REDIS_URL="redis://postiz-redis:6379"

# JWT 密钥 (请修改为随机字符串)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"

# ==================== 访问地址 ====================
# 需要修改为你的实际域名或IP
FRONTEND_URL="https://your-domain.com"
NEXT_PUBLIC_BACKEND_URL="https://your-domain.com/api"
BACKEND_INTERNAL_URL="http://postiz:3000"

# ==================== 存储配置 ====================
STORAGE_PROVIDER="local"
UPLOAD_DIRECTORY="/uploads/"

# 或使用 Cloudflare R2
# STORAGE_PROVIDER="cloudflare"
# CLOUDFLARE_ACCOUNT_ID="your-account-id"
# CLOUDFLARE_ACCESS_KEY="your-access-key"
# CLOUDFLARE_SECRET_ACCESS_KEY="your-secret-key"
# CLOUDFLARE_BUCKETNAME="postiz"
# CLOUDFLARE_BUCKET_URL="https://xxx.r2.cloudflarestorage.com/"

# ==================== 社交媒体 API ====================
# TikTok (https://developers.tiktok.com/apps)
TIKTOK_CLIENT_ID=""
TIKTOK_CLIENT_SECRET=""

# X/Twitter (https://developer.twitter.com/en/portal/dashboard)
X_API_KEY=""
X_API_SECRET=""

# LinkedIn (https://www.linkedin.com/developers/apps)
LINKEDIN_CLIENT_ID=""
LINKEDIN_CLIENT_SECRET=""

# Facebook/Instagram (https://developers.facebook.com/apps)
FACEBOOK_APP_ID=""
FACEBOOK_APP_SECRET=""

# YouTube (https://console.developers.google.com)
YOUTUBE_CLIENT_ID=""
YOUTUBE_CLIENT_SECRET=""

# 更多平台配置请参考 PLATFORM_SETUP_GUIDE.md
```

### 3. 修改 docker-compose.prod.yaml 中的域名

编辑 `docker-compose.prod.yaml`，将环境变量中的 URL 改为你的实际域名:

```yaml
environment:
  FRONTEND_URL: 'https://your-domain.com'
  NEXT_PUBLIC_BACKEND_URL: 'https://your-domain.com/api'
```

### 4. 启动服务

```bash
# 构建并启动所有服务
docker compose -f docker-compose.prod.yaml up -d

# 查看服务状态
docker compose -f docker-compose.prod.yaml ps

# 查看日志
docker compose -f docker-compose.prod.yaml logs -f postiz
```

### 5. 访问应用

- 前端: http://your-server:4200
- 后端 API: http://your-server:3000

## 三、Nginx 反向代理配置

为了启用 HTTPS 和更好的性能，建议配置 Nginx 反向代理:

### 安装 Nginx

```bash
# Ubuntu/Debian
apt update && apt install nginx -y

# CentOS
yum install nginx -y
```

### Nginx 配置文件

创建 `/etc/nginx/sites-available/postiz`:

```nginx
# HTTP -> HTTPS 重定向
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS 主配置
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL 证书 (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;

    # 客户端上传大小限制
    client_max_body_size 100M;

    # Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;

    # 后端 API 代理
    location /api {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket 支持
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        
        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 上传文件访问
    location /uploads {
        proxy_pass http://127.0.0.1:3000;
        proxy_set_header Host $host;
    }

    # 前端代理
    location / {
        proxy_pass http://127.0.0.1:4200;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket 支持 (Next.js HMR)
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### 启用配置

```bash
# 创建软链接
ln -s /etc/nginx/sites-available/postiz /etc/nginx/sites-enabled/

# 测试配置
nginx -t

# 重载 Nginx
systemctl reload nginx
```

### 获取 SSL 证书 (Let's Encrypt)

```bash
# 安装 Certbot
apt install certbot python3-certbot-nginx -y

# 获取证书
certbot --nginx -d your-domain.com

# 自动续期测试
certbot renew --dry-run
```

## 四、GitHub Actions 自动部署

### 1. 配置 GitHub Secrets

在你的 GitHub 仓库中，进入 Settings -> Secrets and variables -> Actions，添加以下 Secrets:

| Secret 名称 | 说明 | 示例 |
|------------|------|------|
| `ECS_HOST` | 服务器 IP 或域名 | `123.45.67.89` |
| `ECS_USERNAME` | SSH 用户名 | `root` |
| `ECS_PASSWORD` | SSH 密码 | `your-password` |
| `ECS_PORT` | SSH 端口 | `22` |

### 2. 工作流说明

`.github/workflows/deploy.yml` 文件已配置好，当你推送代码到 `main` 或 `master` 分支时，会自动触发部署:

1. 通过 SSH 连接到服务器
2. 拉取最新代码
3. 使用 Docker Compose 构建并重启服务
4. 执行健康检查

### 3. 手动触发部署

你也可以在 GitHub 仓库的 Actions 页面手动触发部署:
1. 进入 Actions 标签
2. 选择 "Deploy to Aliyun ECS" 工作流
3. 点击 "Run workflow"

## 五、手动部署脚本

如果需要手动部署，可以在服务器上执行:

```bash
# 给脚本执行权限
chmod +x /www/wwwroot/postiz-app/scripts/deploy.sh

# 执行部署
/www/wwwroot/postiz-app/scripts/deploy.sh
```

或者手动执行以下命令:

```bash
cd /www/wwwroot/postiz-app

# 拉取代码
git pull origin main

# 重启服务
docker compose -f docker-compose.prod.yaml down
docker compose -f docker-compose.prod.yaml up -d --build

# 清理旧镜像
docker image prune -f
```

## 六、常用运维命令

### Docker 服务管理

```bash
# 查看所有服务状态
docker compose -f docker-compose.prod.yaml ps

# 查看服务日志
docker compose -f docker-compose.prod.yaml logs -f postiz
docker compose -f docker-compose.prod.yaml logs -f postiz-postgres
docker compose -f docker-compose.prod.yaml logs -f temporal

# 重启单个服务
docker compose -f docker-compose.prod.yaml restart postiz

# 停止所有服务
docker compose -f docker-compose.prod.yaml down

# 完全重建 (清除数据)
docker compose -f docker-compose.prod.yaml down -v
docker compose -f docker-compose.prod.yaml up -d --build

# 进入容器
docker compose -f docker-compose.prod.yaml exec postiz sh
docker compose -f docker-compose.prod.yaml exec postiz-postgres psql -U postiz-user -d postiz-db
```

### 数据库备份

```bash
# 备份数据库
docker compose -f docker-compose.prod.yaml exec postiz-postgres pg_dump -U postiz-user postiz-db > backup_$(date +%Y%m%d_%H%M%S).sql

# 恢复数据库
docker compose -f docker-compose.prod.yaml exec -T postiz-postgres psql -U postiz-user postiz-db < backup_20260131.sql
```

### 清理空间

```bash
# 清理无用镜像
docker image prune -a -f

# 清理所有无用资源 (谨慎使用)
docker system prune -a -f
```

## 七、故障排查

### 常见问题

1. **数据库连接失败**
   ```bash
   # 检查 PostgreSQL 容器状态
   docker compose -f docker-compose.prod.yaml ps postiz-postgres
   
   # 查看日志
   docker compose -f docker-compose.prod.yaml logs postiz-postgres
   
   # 检查连接
   docker compose -f docker-compose.prod.yaml exec postiz-postgres pg_isready
   ```

2. **Temporal 服务不正常**
   ```bash
   # 检查 Temporal 相关容器
   docker compose -f docker-compose.prod.yaml ps | grep temporal
   
   # 查看日志
   docker compose -f docker-compose.prod.yaml logs temporal
   ```

3. **502 Bad Gateway**
   - 检查服务是否启动
   - 检查端口是否正确
   - 查看 Nginx 错误日志: `tail -f /var/log/nginx/error.log`

4. **社交媒体授权失败**
   - 检查回调 URL 配置是否与 `FRONTEND_URL` 一致
   - 确保使用 HTTPS (部分平台要求)
   - 查看 PLATFORM_SETUP_GUIDE.md 获取详细配置说明

### 日志位置

- Postiz 应用日志: `docker compose logs postiz`
- PostgreSQL 日志: `docker compose logs postiz-postgres`
- Redis 日志: `docker compose logs postiz-redis`
- Temporal 日志: `docker compose logs temporal`
- Nginx 日志: `/var/log/nginx/`

## 八、更新与同步上游

```bash
# 获取上游更新
git fetch upstream

# 合并上游更新到本地
git merge upstream/main

# 如有冲突，解决后提交
git push origin main
```

## 九、安全建议

1. **修改默认密码**: 修改 docker-compose.prod.yaml 中的数据库密码
2. **配置 HTTPS**: 使用 Let's Encrypt 免费证书
3. **限制端口访问**: 只开放 80、443 端口，其他端口使用防火墙限制
4. **定期备份**: 配置数据库自动备份
5. **更新依赖**: 定期同步上游更新修复安全漏洞
6. **保护 Secrets**: 不要将 API 密钥提交到代码仓库

## 十、性能优化

1. **启用 CDN**: 使用 Cloudflare 或阿里云 CDN 加速静态资源
2. **调整 PostgreSQL**: 根据内存大小调整 `shared_buffers`、`work_mem` 等参数
3. **Redis 持久化**: 配置 AOF 持久化确保缓存数据不丢失
4. **监控告警**: 配置 Prometheus + Grafana 监控服务状态
