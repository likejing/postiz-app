# 🚀 服务器手动部署步骤

如果一键脚本没有完成部署，请按以下步骤手动操作。

## 步骤 1：确认代码已下载

```bash
cd /opt/postiz
ls -la
```

应该能看到项目文件。

## 步骤 2：安装 Docker（如果未安装）

```bash
# 检查 Docker 是否已安装
docker --version

# 如果没有，安装 Docker
curl -fsSL https://get.docker.com | bash
systemctl start docker
systemctl enable docker
```

## 步骤 3：安装 Docker Compose（如果未安装）

```bash
# 检查 Docker Compose 是否已安装
docker-compose --version

# 如果没有，安装 Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose
```

## 步骤 4：配置环境变量

```bash
cd /opt/postiz

# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
nano .env  # 或使用 vim .env
```

**必须修改的配置**：

```env
# 生成随机 JWT 密钥
JWT_SECRET="$(openssl rand -base64 32)"

# 数据库密码（改成强密码）
DATABASE_URL="postgresql://postiz:YOUR_STRONG_PASSWORD@postiz-postgres:5432/postiz-db"

# 前端地址（改成你的服务器 IP 或域名）
FRONTEND_URL="http://YOUR_SERVER_IP"
NEXT_PUBLIC_BACKEND_URL="http://YOUR_SERVER_IP/api"

# 必需设置
IS_GENERAL="true"
```

**快速配置命令**（自动生成密钥和配置）：

```bash
cd /opt/postiz

# 复制配置文件
cp .env.example .env

# 生成随机密钥
JWT_SECRET=$(openssl rand -base64 32)
DB_PASSWORD=$(openssl rand -base64 16 | tr -d "=+/" | cut -c1-16)

# 获取服务器 IP
SERVER_IP=$(hostname -I | awk '{print $1}')

# 自动更新配置
sed -i "s|JWT_SECRET=.*|JWT_SECRET=\"$JWT_SECRET\"|" .env
sed -i "s|postiz-password|$DB_PASSWORD|g" .env
sed -i "s|FRONTEND_URL=.*|FRONTEND_URL=\"http://$SERVER_IP\"|" .env
sed -i "s|NEXT_PUBLIC_BACKEND_URL=.*|NEXT_PUBLIC_BACKEND_URL=\"http://$SERVER_IP/api\"|" .env
sed -i "s|IS_GENERAL=.*|IS_GENERAL=\"true\"|" .env

echo "✓ 配置完成！"
echo "访问地址: http://$SERVER_IP:4200"
```

## 步骤 5：启动服务

```bash
cd /opt/postiz

# 启动所有服务
docker-compose -f docker-compose.prod.yaml up -d
```

## 步骤 6：查看服务状态

```bash
# 查看容器状态
docker-compose -f docker-compose.prod.yaml ps

# 查看日志
docker-compose -f docker-compose.prod.yaml logs -f
```

## 步骤 7：等待服务启动

服务启动需要 1-2 分钟，等待后访问：

- **前端**: http://YOUR_SERVER_IP:4200
- **后端**: http://YOUR_SERVER_IP:3000

## 🔍 故障排查

### 问题 1：端口被占用

```bash
# 检查端口占用
netstat -tlnp | grep -E '3000|4200|5432|6379'

# 停止占用端口的服务
kill -9 <PID>
```

### 问题 2：Docker 服务未启动

```bash
# 启动 Docker
systemctl start docker

# 设置开机自启
systemctl enable docker
```

### 问题 3：容器启动失败

```bash
# 查看详细日志
docker-compose -f docker-compose.prod.yaml logs

# 重新构建并启动
docker-compose -f docker-compose.prod.yaml up -d --build --force-recreate
```

### 问题 4：无法访问

```bash
# 检查防火墙
firewall-cmd --list-ports  # CentOS
ufw status                 # Ubuntu

# 开放端口
firewall-cmd --permanent --add-port=4200/tcp
firewall-cmd --permanent --add-port=3000/tcp
firewall-cmd --reload

# 或 Ubuntu
ufw allow 4200/tcp
ufw allow 3000/tcp
```

### 问题 5：数据库连接失败

```bash
# 检查数据库容器
docker ps | grep postgres

# 重启数据库
docker-compose -f docker-compose.prod.yaml restart postiz-postgres

# 查看数据库日志
docker logs postiz-postgres
```

## 📋 常用命令

```bash
# 查看所有容器状态
docker-compose -f docker-compose.prod.yaml ps

# 查看实时日志
docker-compose -f docker-compose.prod.yaml logs -f

# 查看特定服务日志
docker-compose -f docker-compose.prod.yaml logs -f backend
docker-compose -f docker-compose.prod.yaml logs -f frontend

# 重启所有服务
docker-compose -f docker-compose.prod.yaml restart

# 重启特定服务
docker-compose -f docker-compose.prod.yaml restart backend

# 停止所有服务
docker-compose -f docker-compose.prod.yaml down

# 停止并删除数据
docker-compose -f docker-compose.prod.yaml down -v

# 更新代码并重启
git pull
docker-compose -f docker-compose.prod.yaml up -d --build
```

## 🔐 安全建议

1. **修改默认密码**
   - 数据库密码已自动生成随机密码
   - 记得保存好密码

2. **配置防火墙**
   ```bash
   # 只开放必要端口
   firewall-cmd --permanent --add-port=80/tcp
   firewall-cmd --permanent --add-port=443/tcp
   firewall-cmd --permanent --add-port=22/tcp
   firewall-cmd --reload
   ```

3. **配置 HTTPS**（推荐）
   - 参考 `CLOUD_DEPLOYMENT.md` 中的 Nginx + SSL 配置

4. **定期备份**
   ```bash
   # 备份数据库
   docker exec postiz-postgres pg_dump -U postiz postiz-db > backup.sql
   ```

## 📞 需要帮助？

如果遇到问题，请提供：
1. 服务器操作系统版本
2. Docker 版本
3. 错误日志（`docker-compose logs`）
4. 容器状态（`docker-compose ps`）

---

*最后更新: 2026年3月9日*
