# Postiz 云服务器快速部署指南

本指南提供多种云服务器快速部署方案，适合中国用户。

---

## 🚀 方案一：一键 Docker 部署（推荐）

### 适用场景
- 有云服务器（阿里云、腾讯云、华为云等）
- 服务器已安装 Docker 和 Docker Compose
- 最快 5 分钟完成部署

### 部署步骤

#### 1. 连接到服务器
```bash
ssh root@your-server-ip
```

#### 2. 安装 Docker（如果未安装）
```bash
# CentOS/RHEL
curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun
systemctl start docker
systemctl enable docker

# Ubuntu/Debian
curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun
systemctl start docker
systemctl enable docker
```

#### 3. 安装 Docker Compose
```bash
curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

#### 4. 克隆项目
```bash
cd /opt
git clone https://github.com/likejing/postiz-app.git postiz
cd postiz
```

#### 5. 配置环境变量
```bash
cp .env.example .env
nano .env  # 或使用 vim
```

**最小配置**（必须修改）：
```env
# 数据库密码（改成强密码）
DATABASE_URL="postgresql://postiz:YOUR_STRONG_PASSWORD@postiz-postgres:5432/postiz-db"

# JWT 密钥（生成随机字符串）
JWT_SECRET="$(openssl rand -base64 32)"

# 前端地址（改成你的域名或 IP）
FRONTEND_URL="http://your-domain.com"
NEXT_PUBLIC_BACKEND_URL="http://your-domain.com/api"

# 必需设置
IS_GENERAL="true"
```

#### 6. 启动服务
```bash
docker compose -f docker-compose.prod.yaml up -d
```

#### 7. 查看日志
```bash
docker compose -f docker-compose.prod.yaml logs -f
```

#### 8. 访问应用
- 前端：http://your-server-ip:4200
- 后端 API：http://your-server-ip:3000

---

## 🌐 方案二：Nginx 反向代理 + SSL（生产环境推荐）

### 前置条件
- 已完成方案一的部署
- 有域名并已解析到服务器 IP
- 需要 HTTPS 访问

### 部署步骤

#### 1. 安装 Nginx
```bash
# CentOS/RHEL
yum install -y nginx

# Ubuntu/Debian
apt update && apt install -y nginx
```

#### 2. 配置 Nginx
```bash
nano /etc/nginx/conf.d/postiz.conf
```

**配置内容**：
```nginx
# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS 配置
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL 证书（稍后配置）
    ssl_certificate /etc/nginx/ssl/fullchain.pem;
    ssl_certificate_key /etc/nginx/ssl/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # 前端
    location / {
        proxy_pass http://localhost:4200;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 后端 API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 文件上传大小限制
    client_max_body_size 100M;
}
```

#### 3. 安装 SSL 证书（Let's Encrypt 免费）
```bash
# 安装 Certbot
snap install --classic certbot
# 或
yum install -y certbot python3-certbot-nginx  # CentOS
apt install -y certbot python3-certbot-nginx  # Ubuntu

# 获取证书
certbot --nginx -d your-domain.com

# 自动续期
certbot renew --dry-run
```

#### 4. 启动 Nginx
```bash
nginx -t  # 测试配置
systemctl start nginx
systemctl enable nginx
```

#### 5. 更新环境变量
```bash
cd /opt/postiz
nano .env
```

修改为 HTTPS：
```env
FRONTEND_URL="https://your-domain.com"
NEXT_PUBLIC_BACKEND_URL="https://your-domain.com/api"
```

#### 6. 重启服务
```bash
docker compose -f docker-compose.prod.yaml restart
```

---

## ☁️ 方案三：云平台一键部署

### 3.1 阿里云 ECS + 应用市场

1. 登录阿里云控制台
2. 进入 ECS 实例购买页面
3. 选择镜像市场 → 搜索 "Docker"
4. 选择预装 Docker 的镜像
5. 购买后按方案一部署

### 3.2 腾讯云轻量应用服务器

1. 登录腾讯云控制台
2. 选择轻量应用服务器
3. 选择 Docker 应用模板
4. 一键创建
5. 按方案一部署

### 3.3 华为云 CCE（容器引擎）

1. 登录华为云控制台
2. 进入云容器引擎 CCE
3. 创建集群
4. 使用 Kubernetes 部署（见方案四）

---

## 🎯 方案四：Kubernetes 部署（大规模推荐）

### 前置条件
- 有 Kubernetes 集群
- 已安装 kubectl

### 部署步骤

#### 1. 创建命名空间
```bash
kubectl create namespace postiz
```

#### 2. 创建配置文件
```bash
cat > postiz-deployment.yaml <<EOF
apiVersion: v1
kind: Namespace
metadata:
  name: postiz

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: postiz-config
  namespace: postiz
data:
  DATABASE_URL: "postgresql://postiz:password@postiz-postgres:5432/postiz-db"
  REDIS_URL: "redis://postiz-redis:6379"
  FRONTEND_URL: "https://your-domain.com"
  NEXT_PUBLIC_BACKEND_URL: "https://your-domain.com/api"
  IS_GENERAL: "true"

---
apiVersion: v1
kind: Secret
metadata:
  name: postiz-secrets
  namespace: postiz
type: Opaque
stringData:
  JWT_SECRET: "your-jwt-secret-here"

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postiz-postgres
  namespace: postiz
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postiz-postgres
  template:
    metadata:
      labels:
        app: postiz-postgres
    spec:
      containers:
      - name: postgres
        image: postgres:17-alpine
        env:
        - name: POSTGRES_PASSWORD
          value: "password"
        - name: POSTGRES_USER
          value: "postiz"
        - name: POSTGRES_DB
          value: "postiz-db"
        ports:
        - containerPort: 5432
        volumeMounts:
        - name: postgres-data
          mountPath: /var/lib/postgresql/data
      volumes:
      - name: postgres-data
        persistentVolumeClaim:
          claimName: postgres-pvc

---
apiVersion: v1
kind: Service
metadata:
  name: postiz-postgres
  namespace: postiz
spec:
  selector:
    app: postiz-postgres
  ports:
  - port: 5432
    targetPort: 5432

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postiz-redis
  namespace: postiz
spec:
  replicas: 1
  selector:
    matchLabels:
      app: postiz-redis
  template:
    metadata:
      labels:
        app: postiz-redis
    spec:
      containers:
      - name: redis
        image: redis:7-alpine
        ports:
        - containerPort: 6379

---
apiVersion: v1
kind: Service
metadata:
  name: postiz-redis
  namespace: postiz
spec:
  selector:
    app: postiz-redis
  ports:
  - port: 6379
    targetPort: 6379

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postiz-backend
  namespace: postiz
spec:
  replicas: 2
  selector:
    matchLabels:
      app: postiz-backend
  template:
    metadata:
      labels:
        app: postiz-backend
    spec:
      containers:
      - name: backend
        image: ghcr.io/gitroomhq/postiz-backend:latest
        envFrom:
        - configMapRef:
            name: postiz-config
        - secretRef:
            name: postiz-secrets
        ports:
        - containerPort: 3000

---
apiVersion: v1
kind: Service
metadata:
  name: postiz-backend
  namespace: postiz
spec:
  selector:
    app: postiz-backend
  ports:
  - port: 3000
    targetPort: 3000

---
apiVersion: apps/v1
kind: Deployment
metadata:
  name: postiz-frontend
  namespace: postiz
spec:
  replicas: 2
  selector:
    matchLabels:
      app: postiz-frontend
  template:
    metadata:
      labels:
        app: postiz-frontend
    spec:
      containers:
      - name: frontend
        image: ghcr.io/gitroomhq/postiz-frontend:latest
        envFrom:
        - configMapRef:
            name: postiz-config
        ports:
        - containerPort: 4200

---
apiVersion: v1
kind: Service
metadata:
  name: postiz-frontend
  namespace: postiz
spec:
  selector:
    app: postiz-frontend
  ports:
  - port: 4200
    targetPort: 4200

---
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: postiz-ingress
  namespace: postiz
  annotations:
    kubernetes.io/ingress.class: nginx
    cert-manager.io/cluster-issuer: letsencrypt-prod
spec:
  tls:
  - hosts:
    - your-domain.com
    secretName: postiz-tls
  rules:
  - host: your-domain.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: postiz-backend
            port:
              number: 3000
      - path: /
        pathType: Prefix
        backend:
          service:
            name: postiz-frontend
            port:
              number: 4200
EOF
```

#### 3. 部署
```bash
kubectl apply -f postiz-deployment.yaml
```

#### 4. 查看状态
```bash
kubectl get pods -n postiz
kubectl get svc -n postiz
kubectl get ingress -n postiz
```

---

## 🔥 方案五：Serverless 部署（按需付费）

### 5.1 阿里云函数计算 FC

1. 将应用容器化
2. 上传到阿里云容器镜像服务
3. 创建函数计算服务
4. 配置触发器和域名

### 5.2 腾讯云 Serverless

1. 使用 Serverless Framework
2. 配置 serverless.yml
3. 一键部署

---

## 📦 方案六：自动化部署脚本

创建一键部署脚本：

```bash
cat > deploy.sh <<'EOF'
#!/bin/bash

echo "🚀 Postiz 一键部署脚本"
echo "======================="

# 检查 Docker
if ! command -v docker &> /dev/null; then
    echo "📦 安装 Docker..."
    curl -fsSL https://get.docker.com | bash -s docker --mirror Aliyun
    systemctl start docker
    systemctl enable docker
fi

# 检查 Docker Compose
if ! command -v docker-compose &> /dev/null; then
    echo "📦 安装 Docker Compose..."
    curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
fi

# 克隆项目
echo "📥 克隆项目..."
cd /opt
if [ -d "postiz" ]; then
    cd postiz
    git pull
else
    git clone https://github.com/likejing/postiz-app.git postiz
    cd postiz
fi

# 配置环境变量
if [ ! -f ".env" ]; then
    echo "⚙️  配置环境变量..."
    cp .env.example .env

    # 生成随机密钥
    JWT_SECRET=$(openssl rand -base64 32)
    sed -i "s/JWT_SECRET=.*/JWT_SECRET=\"$JWT_SECRET\"/" .env

    echo "请输入你的域名或 IP 地址："
    read DOMAIN
    sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=\"http://$DOMAIN\"|" .env
    sed -i "s|NEXT_PUBLIC_BACKEND_URL=.*|NEXT_PUBLIC_BACKEND_URL=\"http://$DOMAIN/api\"|" .env
fi

# 启动服务
echo "🚀 启动服务..."
docker compose -f docker-compose.prod.yaml up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 10

# 显示状态
echo ""
echo "✅ 部署完成！"
echo "======================="
docker compose -f docker-compose.prod.yaml ps
echo ""
echo "📝 访问地址："
echo "   前端: http://$(hostname -I | awk '{print $1}'):4200"
echo "   后端: http://$(hostname -I | awk '{print $1}'):3000"
echo ""
echo "📋 查看日志: docker compose -f docker-compose.prod.yaml logs -f"
echo "🔄 重启服务: docker compose -f docker-compose.prod.yaml restart"
echo "🛑 停止服务: docker compose -f docker-compose.prod.yaml down"
EOF

chmod +x deploy.sh
```

**使用方法**：
```bash
curl -fsSL https://raw.githubusercontent.com/likejing/postiz-app/main/deploy.sh | bash
```

---

## 🛡️ 安全加固建议

### 1. 防火墙配置
```bash
# 开放必要端口
firewall-cmd --permanent --add-port=80/tcp
firewall-cmd --permanent --add-port=443/tcp
firewall-cmd --permanent --add-port=22/tcp
firewall-cmd --reload

# 或使用 ufw (Ubuntu)
ufw allow 80/tcp
ufw allow 443/tcp
ufw allow 22/tcp
ufw enable
```

### 2. 修改默认密码
```bash
# 修改数据库密码
# 修改 .env 中的 DATABASE_URL
# 重启服务
```

### 3. 启用 HTTPS
- 使用 Let's Encrypt 免费证书
- 配置 Nginx SSL
- 强制 HTTPS 重定向

### 4. 定期备份
```bash
# 备份数据库
docker exec postiz-postgres pg_dump -U postiz postiz-db > backup.sql

# 备份上传文件
tar -czf uploads-backup.tar.gz /path/to/uploads
```

---

## 📊 性能优化建议

### 1. 使用 CDN
- 阿里云 CDN
- 腾讯云 CDN
- 七牛云 CDN

### 2. 数据库优化
```bash
# 增加 PostgreSQL 连接池
# 在 .env 中添加
DATABASE_POOL_SIZE=20
```

### 3. Redis 缓存
```bash
# 配置 Redis 持久化
# 在 docker-compose.prod.yaml 中添加
command: redis-server --appendonly yes
```

### 4. 负载均衡
- 使用 Nginx 负载均衡
- 多实例部署
- 使用云服务商负载均衡器

---

## 🔍 故障排查

### 查看日志
```bash
# 所有服务日志
docker compose -f docker-compose.prod.yaml logs -f

# 特定服务日志
docker compose -f docker-compose.prod.yaml logs -f backend
docker compose -f docker-compose.prod.yaml logs -f frontend
```

### 重启服务
```bash
# 重启所有服务
docker compose -f docker-compose.prod.yaml restart

# 重启特定服务
docker compose -f docker-compose.prod.yaml restart backend
```

### 检查服务状态
```bash
docker compose -f docker-compose.prod.yaml ps
docker stats
```

---

## 💰 成本估算

### 阿里云 ECS（推荐配置）
- **2核4G**: ¥70-100/月
- **4核8G**: ¥150-200/月
- **带宽**: 5M ¥50/月

### 腾讯云轻量应用服务器
- **2核4G**: ¥60-80/月
- **4核8G**: ¥120-150/月

### 华为云 ECS
- **2核4G**: ¥65-90/月
- **4核8G**: ¥140-180/月

---

## 📞 技术支持

- GitHub Issues: https://github.com/likejing/postiz-app/issues
- 官方文档: https://docs.postiz.com
- 社区论坛: https://community.postiz.com

---

*最后更新: 2026年3月9日*
