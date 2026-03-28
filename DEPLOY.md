# OPC-Lab 部署指南

本文档说明如何将 OPC-Lab 项目部署到生产服务器。

---

## 一、服务器环境要求

- **Node.js**: v18+ (推荐 v20+)
- **MySQL**: 5.7+ 或 8.0+
- **Nginx**: 用于反向代理和静态文件服务
- **PM2**: 进程管理（推荐）

---

## 二、数据库配置

### 1. 确认数据库连接
确保可以访问 MySQL 数据库：
- 主机：`8.163.33.195:3806`
- 数据库：`opc`
- 用户：`opclab_X14.`

### 2. 数据表初始化
数据库表会在首次启动时自动创建（`synchronize: true`）。

默认管理员账号：
- 邮箱：`admin@opc-lab.com`
- 密码：`Admin123!`

**建议部署后立即修改密码！**

---

## 三、后端部署

### 1. 克隆/更新代码
```bash
cd /www/wwwroot/www.opc-lab.com/opc-lab
git pull
```

### 2. 安装后端依赖
```bash
cd server
npm install --registry=https://registry.npmmirror.com
```

### 3. 配置环境变量

创建 `server/.env` 文件：
```bash
# 环境
NODE_ENV=production
PORT=3000

# 数据库
DB_HOST=8.163.33.195
DB_PORT=3806
DB_USERNAME=opclab_X14.
DB_PASSWORD=bBJHLwL8exXtz2kF
DB_DATABASE=opc

# Session 配置（生产环境请修改为随机字符串）
SESSION_SECRET=your-secret-key-change-in-production

# JWT 配置（生产环境请修改为随机字符串）
JWT_SECRET=your-jwt-secret-change-in-production

# 前端 URL
FRONTEND_URL=https://www.opc-lab.com
```

**生成随机密钥：**
```bash
# Linux/Mac
openssl rand -hex 32

# 或使用 Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. 编译 TypeScript
```bash
cd server
npx tsc
```

### 5. 启动服务

#### 方式 A：直接启动（测试用）
```bash
node dist/main.js
```

#### 方式 B：使用 PM2（生产环境推荐）

```bash
# 安装 PM2
npm install -g pm2

# 启动应用
cd /www/wwwroot/www.opc-lab.com/opc-lab/server
pm2 start dist/main.js --name opc-api

# 查看状态
pm2 status

# 查看日志
pm2 logs opc-api

# 重启
pm2 restart opc-api

# 停止
pm2 stop opc-api

# 设置开机自启
pm2 startup
pm2 save
```

---

## 四、前端部署

### 1. 安装依赖并打包
```bash
cd /www/wwwroot/www.opc-lab.com/opc-lab
npm install --registry=https://registry.npmmirror.com
npm run build
```

### 2. 配置 Nginx

创建 Nginx 配置文件（示例）：
```nginx
server {
    listen 80;
    server_name www.opc-lab.com opc-lab.com;

    # 前端静态文件
    root /www/wwwroot/www.opc-lab.com/opc-lab/dist;
    index index.html;

    # 前端路由重写（SPA 需要）
    location / {
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 代理
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # 静态资源缓存
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. 配置 HTTPS（推荐）

使用 Let's Encrypt 免费证书：
```bash
# 安装 certbot
apt install certbot python3-certbot-nginx

# 获取证书
certbot --nginx -d www.opc-lab.com -d opc-lab.com
```

---

## 五、防火墙/安全组配置

确保服务器防火墙/云服务商安全组开放以下端口：
- **80**: HTTP
- **443**: HTTPS
- **3000**: 后端 API（如果通过 Nginx 代理，可不开放）

---

## 六、常用命令

### 后端管理
```bash
# 查看日志
pm2 logs opc-api

# 重启服务
pm2 restart opc-api

# 查看状态
pm2 status

# 内存使用情况
pm2 monit
```

### 前端更新
```bash
cd /www/wwwroot/www.opc-lab.com/opc-lab
git pull
npm install --registry=https://registry.npmmirror.com
npm run build
# Nginx 会自动使用新的 dist 文件
```

### 后端更新
```bash
cd /www/wwwroot/www.opc-lab.com/opc-lab/server
git pull
npm install --registry=https://registry.npmmirror.com
npx tsc
pm2 restart opc-api
```

---

## 七、故障排查

### 后端无法启动
```bash
# 检查 PM2 日志
pm2 logs opc-api

# 检查端口占用
netstat -tlnp | grep 3000

# 检查数据库连接
mysql -h 8.163.33.195 -P 3806 -u opclab_X14. -p
```

### 前端页面空白
1. 检查浏览器控制台错误
2. 确认 Nginx 配置正确
3. 检查 `dist` 目录是否存在
4. 清除浏览器缓存

### API 请求失败
1. 检查后端是否运行：`pm2 status`
2. 检查 Nginx 代理配置
3. 检查防火墙设置
4. 查看后端日志：`pm2 logs opc-api`

---

## 八、安全检查清单

- [ ] 修改默认管理员密码
- [ ] 修改 `SESSION_SECRET` 和 `JWT_SECRET`
- [ ] 配置 HTTPS
- [ ] 限制数据库访问 IP
- [ ] 配置防火墙
- [ ] 设置 PM2 开机自启
- [ ] 配置日志轮转（PM2 默认已配置）
- [ ] 定期备份数据库

---

## 九、快速部署脚本

创建 `deploy.sh`：
```bash
#!/bin/bash

echo "=== 开始部署 OPC-Lab ==="

# 拉取最新代码
cd /www/wwwroot/www.opc-lab.com/opc-lab
git pull

# 后端
echo "部署后端..."
cd server
npm install --registry=https://registry.npmmirror.com
npx tsc
pm2 restart opc-api

# 前端
echo "部署前端..."
cd ..
npm install --registry=https://registry.npmmirror.com
npm run build

# Nginx
echo "检查 Nginx 配置..."
nginx -t
nginx -s reload

echo "=== 部署完成 ==="
pm2 status
```

使用方法：
```bash
chmod +x deploy.sh
./deploy.sh
```

---

## 十、技术支持

遇到问题请检查：
1. 服务器日志
2. PM2 日志
3. Nginx 日志 (`/var/log/nginx/`)
4. 数据库连接状态
