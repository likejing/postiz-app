# Postiz 平台配置完整教程

本教程将指导您如何从各个社交媒体平台获取 API Key 等必要参数，以便完整配置 Postiz 系统。

---

## 目录

1. [基础配置](#1-基础配置)
2. [存储配置 - Cloudflare R2](#2-存储配置---cloudflare-r2)
3. [邮件服务 - Resend](#3-邮件服务---resend)
4. [AI 功能 - OpenAI](#4-ai-功能---openai)
5. [支付系统 - Stripe](#5-支付系统---stripe)
6. [社交媒体平台配置](#6-社交媒体平台配置)
   - [X (Twitter)](#61-x-twitter)
   - [LinkedIn](#62-linkedin)
   - [Facebook / Instagram / Threads](#63-facebook--instagram--threads)
   - [YouTube](#64-youtube)
   - [TikTok](#65-tiktok)
   - [Reddit](#66-reddit)
   - [Pinterest](#67-pinterest)
   - [Discord](#68-discord)
   - [Slack](#69-slack)
   - [Mastodon](#610-mastodon)
   - [Dribbble](#611-dribbble)
   - [GitHub](#612-github)
7. [短链接服务](#7-短链接服务)
8. [环境变量汇总](#8-环境变量汇总)

---

## 1. 基础配置

这些是系统运行的必需配置：

```env
# 数据库连接
DATABASE_URL="postgresql://用户名:密码@localhost:5432/数据库名"

# Redis 连接
REDIS_URL="redis://localhost:6379"

# JWT 密钥 (随机字符串，至少32位)
JWT_SECRET="your-super-secret-jwt-key-make-it-very-long-and-random"

# 前端 URL (用户访问的地址)
FRONTEND_URL="https://your-domain.com"
NEXT_PUBLIC_BACKEND_URL="https://your-domain.com/api"
BACKEND_INTERNAL_URL="http://localhost:3000"

# Temporal 工作流引擎
TEMPORAL_ADDRESS="temporal:7233"

# 必需设置
IS_GENERAL="true"
```

---

## 2. 存储配置 - Cloudflare R2

用于存储用户上传的图片、视频等媒体文件。

### 获取步骤：

1. 访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 注册/登录账号
3. 左侧菜单选择 **R2 Object Storage**
4. 点击 **Create bucket** 创建存储桶
5. 进入 **Settings** > **R2 API Tokens**
6. 创建 API Token，权限选择 **Object Read & Write**

### 环境变量：

```env
STORAGE_PROVIDER="cloudflare"  # 或 "local" 使用本地存储
CLOUDFLARE_ACCOUNT_ID="你的账户ID"          # 在 URL 中可以看到
CLOUDFLARE_ACCESS_KEY="你的Access Key"      # 创建 Token 时获得
CLOUDFLARE_SECRET_ACCESS_KEY="你的Secret"   # 创建 Token 时获得
CLOUDFLARE_BUCKETNAME="postiz"              # 你创建的桶名称
CLOUDFLARE_BUCKET_URL="https://xxx.r2.cloudflarestorage.com/"
CLOUDFLARE_REGION="auto"
```

### 本地存储替代方案：

```env
STORAGE_PROVIDER="local"
UPLOAD_DIRECTORY="/path/to/uploads"
NEXT_PUBLIC_UPLOAD_STATIC_DIRECTORY="/uploads"
```

---

## 3. 邮件服务 - Resend

用于发送用户激活邮件、通知等。

### 获取步骤：

1. 访问 [Resend.com](https://resend.com/)
2. 注册账号
3. 进入 **API Keys** 页面
4. 点击 **Create API Key**
5. 复制生成的 Key

### 环境变量：

```env
RESEND_API_KEY="re_xxxxxxxxxx"
EMAIL_FROM_ADDRESS="noreply@yourdomain.com"
EMAIL_FROM_NAME="Postiz"
```

> 💡 如果不配置邮件服务，用户注册后会自动激活，无需邮件验证。

---

## 4. AI 功能 - OpenAI

用于 AI 生成帖子、图片等功能。

### 获取步骤：

1. 访问 [OpenAI Platform](https://platform.openai.com/)
2. 登录/注册账号
3. 进入 **API Keys** 页面
4. 点击 **Create new secret key**
5. 复制保存 Key（只显示一次）

### 环境变量：

```env
OPENAI_API_KEY="sk-xxxxxxxxxxxxxxxxxxxxxxxx"
```

---

## 5. 支付系统 - Stripe

用于处理订阅付费。

### 获取步骤：

1. 访问 [Stripe Dashboard](https://dashboard.stripe.com/)
2. 注册/登录账号
3. 进入 **Developers** > **API keys**
4. 复制 **Publishable key** 和 **Secret key**
5. 进入 **Webhooks** 创建 Webhook 端点
   - 端点 URL: `https://your-domain.com/api/stripe/webhook`
   - 监听事件: `customer.subscription.*`, `invoice.payment_succeeded`

### 环境变量：

```env
STRIPE_PUBLISHABLE_KEY="pk_live_xxxxx"    # 或 pk_test_xxxxx
STRIPE_SECRET_KEY="sk_live_xxxxx"          # 或 sk_test_xxxxx
STRIPE_SIGNING_KEY="whsec_xxxxx"           # Webhook 签名密钥
STRIPE_SIGNING_KEY_CONNECT=""              # Connect 账户的签名密钥（可选）
FEE_AMOUNT=0.05                            # 平台手续费比例
```

---

## 6. 社交媒体平台配置

### 6.1 X (Twitter)

#### 获取步骤：

1. 访问 [Twitter Developer Portal](https://developer.twitter.com/en/portal/dashboard)
2. 创建项目和应用
3. 在 **User authentication settings** 中：
   - 启用 **OAuth 1.0a**
   - 设置 Callback URL: `https://your-domain.com/integrations/social/x`
   - 权限选择 **Read and write**
4. 进入 **Keys and tokens** 获取 API Key 和 Secret

#### 环境变量：

```env
X_API_KEY="你的API Key"
X_API_SECRET="你的API Secret"
```

#### 回调地址：
```
https://your-domain.com/integrations/social/x
```

---

### 6.2 LinkedIn

#### 获取步骤：

1. 访问 [LinkedIn Developers](https://www.linkedin.com/developers/)
2. 点击 **Create app**
3. 填写应用信息，需要关联公司页面
4. 在 **Auth** 标签页：
   - 添加 Redirect URL: `https://your-domain.com/integrations/social/linkedin`
5. 在 **Products** 标签页申请：
   - **Share on LinkedIn**
   - **Sign In with LinkedIn using OpenID Connect**
6. 复制 Client ID 和 Client Secret

#### 环境变量：

```env
LINKEDIN_CLIENT_ID="你的Client ID"
LINKEDIN_CLIENT_SECRET="你的Client Secret"
```

#### 回调地址：
```
https://your-domain.com/integrations/social/linkedin
```

---

### 6.3 Facebook / Instagram / Threads

> ⚠️ 这三个平台使用同一个 Meta 开发者应用

#### 获取步骤：

1. 访问 [Meta for Developers](https://developers.facebook.com/)
2. 创建应用，选择 **Business** 类型
3. 添加产品：
   - **Facebook Login for Business**
   - **Instagram Graph API**
   - **Threads API** (如需要)
4. 在 **Settings** > **Basic** 获取 App ID 和 App Secret
5. 配置 OAuth 回调 URL

#### 环境变量：

```env
# Facebook
FACEBOOK_APP_ID="你的App ID"
FACEBOOK_APP_SECRET="你的App Secret"

# Threads (使用相同的 App)
THREADS_APP_ID="你的App ID"
THREADS_APP_SECRET="你的App Secret"
```

#### 回调地址：
```
Facebook: https://your-domain.com/integrations/social/facebook
Instagram: https://your-domain.com/integrations/social/instagram
Threads: https://your-domain.com/integrations/social/threads
```

---

### 6.4 YouTube

#### 获取步骤：

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目
3. 启用 **YouTube Data API v3**
4. 进入 **Credentials** > **Create Credentials** > **OAuth client ID**
5. 应用类型选择 **Web application**
6. 添加授权重定向 URI
7. 下载或复制 Client ID 和 Secret

#### 环境变量：

```env
YOUTUBE_CLIENT_ID="你的Client ID.apps.googleusercontent.com"
YOUTUBE_CLIENT_SECRET="你的Client Secret"
```

#### 回调地址：
```
https://your-domain.com/integrations/social/youtube
```

---

### 6.5 TikTok

> ⚠️ TikTok 要求必须使用 HTTPS

#### 获取步骤：

1. 访问 [TikTok Developers](https://developers.tiktok.com/)
2. 创建应用
3. 添加产品：
   - **Login Kit** - 设置 Redirect URI
   - **Content Posting API** - 启用 Direct Post
4. 添加权限 Scopes：
   - `user.info.basic`
   - `video.create`
   - `video.publish`
   - `video.upload`
   - `user.info.profile`
5. 提交审核（测试可用沙盒模式）

#### 环境变量：

```env
TIKTOK_CLIENT_ID="你的Client Key"        # 16位字符
TIKTOK_CLIENT_SECRET="你的Client Secret"  # 32位字符
```

#### 回调地址：
```
https://your-domain.com/integrations/social/tiktok
```

---

### 6.6 Reddit

#### 获取步骤：

1. 访问 [Reddit Apps](https://www.reddit.com/prefs/apps)
2. 点击 **create another app...**
3. 选择 **web app**
4. 填写 redirect uri
5. 创建后复制 Client ID（应用名称下方）和 Secret

#### 环境变量：

```env
REDDIT_CLIENT_ID="你的Client ID"
REDDIT_CLIENT_SECRET="你的Client Secret"
```

#### 回调地址：
```
https://your-domain.com/integrations/social/reddit
```

---

### 6.7 Pinterest

#### 获取步骤：

1. 访问 [Pinterest Developers](https://developers.pinterest.com/)
2. 创建应用
3. 在 OAuth 设置中添加 Redirect URI
4. 获取 App ID 和 App Secret

#### 环境变量：

```env
PINTEREST_CLIENT_ID="你的App ID"
PINTEREST_CLIENT_SECRET="你的App Secret"
```

#### 回调地址：
```
https://your-domain.com/integrations/social/pinterest
```

---

### 6.8 Discord

#### 获取步骤：

1. 访问 [Discord Developer Portal](https://discord.com/developers/applications)
2. 点击 **New Application**
3. 在 **OAuth2** 页面：
   - 复制 Client ID 和 Client Secret
   - 添加 Redirect URL
4. 在 **Bot** 页面：
   - 创建 Bot
   - 复制 Bot Token

#### 环境变量：

```env
DISCORD_CLIENT_ID="你的Client ID"
DISCORD_CLIENT_SECRET="你的Client Secret"
DISCORD_BOT_TOKEN_ID="你的Bot Token"
```

#### 回调地址：
```
https://your-domain.com/integrations/social/discord
```

---

### 6.9 Slack

#### 获取步骤：

1. 访问 [Slack API](https://api.slack.com/apps)
2. 点击 **Create New App** > **From scratch**
3. 在 **OAuth & Permissions** 中：
   - 添加 Redirect URLs
   - 添加 Bot Token Scopes: `chat:write`, `channels:read`
4. 在 **Basic Information** 中获取：
   - Client ID
   - Client Secret
   - Signing Secret

#### 环境变量：

```env
SLACK_ID="你的Client ID"
SLACK_SECRET="你的Client Secret"
SLACK_SIGNING_SECRET="你的Signing Secret"
```

#### 回调地址：
```
https://your-domain.com/integrations/social/slack
```

---

### 6.10 Mastodon

#### 获取步骤：

1. 登录你的 Mastodon 实例（如 mastodon.social）
2. 进入 **Settings** > **Development** > **New Application**
3. 填写应用名称
4. 权限勾选：`read`, `write`, `follow`
5. 提交后获取 Client ID 和 Client Secret

#### 环境变量：

```env
MASTODON_URL="https://mastodon.social"  # 或你的实例地址
MASTODON_CLIENT_ID="你的Client ID"
MASTODON_CLIENT_SECRET="你的Client Secret"
```

#### 回调地址：
```
https://your-domain.com/integrations/social/mastodon
```

---

### 6.11 Dribbble

#### 获取步骤：

1. 访问 [Dribbble Developers](https://dribbble.com/account/applications)
2. 创建新应用
3. 设置 Callback URL
4. 获取 Client ID 和 Client Secret

#### 环境变量：

```env
DRIBBBLE_CLIENT_ID="你的Client ID"
DRIBBBLE_CLIENT_SECRET="你的Client Secret"
```

#### 回调地址：
```
https://your-domain.com/integrations/social/dribbble
```

---

### 6.12 GitHub

用于连接 GitHub 仓库进行分析。

#### 获取步骤：

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 点击 **New OAuth App**
3. 填写应用信息和回调 URL
4. 创建后获取 Client ID
5. 点击 **Generate a new client secret**

#### 环境变量：

```env
GITHUB_CLIENT_ID="你的Client ID"
GITHUB_CLIENT_SECRET="你的Client Secret"
```

#### 回调地址：
```
https://your-domain.com/integrations/social/github
```

---

## 7. 短链接服务

可选配置，用于自动缩短帖子中的链接。

### Dub.co

```env
DUB_TOKEN="你的API Token"
DUB_API_ENDPOINT="https://api.dub.co"
DUB_SHORT_LINK_DOMAIN="dub.sh"
```

### Short.io

```env
SHORT_IO_SECRET_KEY="你的API密钥"
```

### Kutt.it

```env
KUTT_API_KEY="你的API密钥"
KUTT_API_ENDPOINT="https://kutt.it/api/v2"
KUTT_SHORT_LINK_DOMAIN="kutt.it"
```

---

## 8. 环境变量汇总

### 完整的 .env 模板

```env
# ============================================
# 基础配置 (必需)
# ============================================
DATABASE_URL="postgresql://postiz-user:postiz-password@postiz-postgres:5432/postiz-db-local"
REDIS_URL="redis://postiz-redis:6379"
JWT_SECRET="your-super-long-random-jwt-secret-key-here"
FRONTEND_URL="https://your-domain.com"
NEXT_PUBLIC_BACKEND_URL="https://your-domain.com/api"
BACKEND_INTERNAL_URL="http://localhost:3000"
TEMPORAL_ADDRESS="temporal:7233"
IS_GENERAL="true"

# ============================================
# 存储配置
# ============================================
STORAGE_PROVIDER="local"  # 或 "cloudflare"
UPLOAD_DIRECTORY="/uploads"
# Cloudflare R2 (如果使用)
# CLOUDFLARE_ACCOUNT_ID=""
# CLOUDFLARE_ACCESS_KEY=""
# CLOUDFLARE_SECRET_ACCESS_KEY=""
# CLOUDFLARE_BUCKETNAME=""
# CLOUDFLARE_BUCKET_URL=""
# CLOUDFLARE_REGION="auto"

# ============================================
# 邮件服务 (可选)
# ============================================
# RESEND_API_KEY=""
# EMAIL_FROM_ADDRESS=""
# EMAIL_FROM_NAME=""

# ============================================
# AI 功能 (可选)
# ============================================
OPENAI_API_KEY=""

# ============================================
# 支付系统 (可选)
# ============================================
# STRIPE_PUBLISHABLE_KEY=""
# STRIPE_SECRET_KEY=""
# STRIPE_SIGNING_KEY=""
# FEE_AMOUNT=0.05

# ============================================
# 社交媒体平台
# ============================================

# X (Twitter)
X_API_KEY=""
X_API_SECRET=""

# LinkedIn
LINKEDIN_CLIENT_ID=""
LINKEDIN_CLIENT_SECRET=""

# Facebook / Instagram
FACEBOOK_APP_ID=""
FACEBOOK_APP_SECRET=""

# Threads
THREADS_APP_ID=""
THREADS_APP_SECRET=""

# YouTube
YOUTUBE_CLIENT_ID=""
YOUTUBE_CLIENT_SECRET=""

# TikTok
TIKTOK_CLIENT_ID=""
TIKTOK_CLIENT_SECRET=""

# Reddit
REDDIT_CLIENT_ID=""
REDDIT_CLIENT_SECRET=""

# Pinterest
PINTEREST_CLIENT_ID=""
PINTEREST_CLIENT_SECRET=""

# Discord
DISCORD_CLIENT_ID=""
DISCORD_CLIENT_SECRET=""
DISCORD_BOT_TOKEN_ID=""

# Slack
SLACK_ID=""
SLACK_SECRET=""
SLACK_SIGNING_SECRET=""

# Mastodon
MASTODON_URL="https://mastodon.social"
MASTODON_CLIENT_ID=""
MASTODON_CLIENT_SECRET=""

# Dribbble
DRIBBBLE_CLIENT_ID=""
DRIBBBLE_CLIENT_SECRET=""

# GitHub
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""

# ============================================
# 其他可选配置
# ============================================
NEXT_PUBLIC_POLOTNO=""  # Polotno 图片编辑器 API Key
API_LIMIT=30

# 短链接服务
# DUB_TOKEN=""
# SHORT_IO_SECRET_KEY=""
# KUTT_API_KEY=""
```

---

## 回调地址汇总表

| 平台 | 回调地址 |
|------|----------|
| X (Twitter) | `https://your-domain.com/integrations/social/x` |
| LinkedIn | `https://your-domain.com/integrations/social/linkedin` |
| LinkedIn Page | `https://your-domain.com/integrations/social/linkedin-page` |
| Facebook | `https://your-domain.com/integrations/social/facebook` |
| Instagram | `https://your-domain.com/integrations/social/instagram` |
| Threads | `https://your-domain.com/integrations/social/threads` |
| YouTube | `https://your-domain.com/integrations/social/youtube` |
| TikTok | `https://your-domain.com/integrations/social/tiktok` |
| Reddit | `https://your-domain.com/integrations/social/reddit` |
| Pinterest | `https://your-domain.com/integrations/social/pinterest` |
| Discord | `https://your-domain.com/integrations/social/discord` |
| Slack | `https://your-domain.com/integrations/social/slack` |
| Mastodon | `https://your-domain.com/integrations/social/mastodon` |
| Dribbble | `https://your-domain.com/integrations/social/dribbble` |
| GitHub | `https://your-domain.com/integrations/social/github` |

---

## 注意事项

1. **HTTPS 要求**：大多数平台要求回调地址使用 HTTPS
2. **域名验证**：部分平台（如 TikTok、Meta）需要验证域名所有权
3. **审核时间**：某些平台 API 需要审核，可能需要几天时间
4. **测试模式**：开发时可使用各平台的沙盒/测试模式
5. **保密性**：所有 Secret/Key 都应妥善保管，不要提交到代码仓库

---

## 官方文档链接

- [Postiz 配置参考](https://docs.postiz.com/configuration/reference)
- [Postiz 提供商概览](https://docs.postiz.com/providers/overview)
- [Twitter 开发者文档](https://developer.twitter.com/en/docs)
- [LinkedIn 开发者文档](https://docs.microsoft.com/en-us/linkedin/)
- [Meta 开发者文档](https://developers.facebook.com/docs/)
- [YouTube API 文档](https://developers.google.com/youtube/v3)
- [TikTok 开发者文档](https://developers.tiktok.com/doc)

---

*最后更新: 2026年1月*
