# 用 Nginx 反向代理部署山居 (Next.js)

## 需要把代码放到服务器吗？

**要。** 有两种常见方式：

1. **方式 A：在服务器上构建**  
   把源码上传到服务器（git clone / 本地上传），在服务器上执行 `npm install` 和 `npm run build`，再用 Nginx 把请求转发到 Next 进程。

2. **方式 B：本地构建后只上传产物（推荐）**  
   本地执行 `npm run build` 后，只把 **构建产物** 上传到服务器，在服务器上只运行 Node，不装 npm、不跑 build。  
   本项目已开启 `output: "standalone"`，构建后会生成精简的独立目录，部署时只需上传该目录，占用小、启动快。

下面按 **方式 B（standalone）** 说明，并附 Nginx 配置。

---

## 一、本地构建（在你电脑上）

**一键打包（推荐，Mac 上直接得到上传用 zip）：**

```bash
cd /path/to/shanju
npm run pack
```

会依次执行：取消代理 → `npm run build` → 拷贝 `.next/static` 和 `public` 进 standalone → 打出 `shanju-standalone.zip`。完成后在项目根目录得到 **`shanju-standalone.zip`**，直接上传服务器即可。

---

**或分步执行：**

```bash
cd /path/to/shanju
npm install
npm run build
```

**若本机开了系统/终端代理（如 Clash 127.0.0.1:7897）**，构建时会通过代理拉取 Google 字体，可能很慢或卡住。请先取消代理再构建：

```bash
unset HTTP_PROXY HTTPS_PROXY http_proxy https_proxy
npm run build
```

或一条命令：`env -u HTTP_PROXY -u HTTPS_PROXY -u http_proxy -u https_proxy npm run build`

构建完成后会多出：

- `.next/standalone/` — 内含 `server.js`、`node_modules`、`.next`（**不含** static）
- `.next/static/` — 静态资源，需要**手动拷进 standalone**

**构建后在本机执行一次（把 static、public 拷进 standalone，便于打包）：**

```bash
# 在项目根目录执行
cp -r .next/static .next/standalone/.next/static
cp -r public .next/standalone/public
```

说明：`public` 目录（含 `images/vehicles/` 车辆图等）**不会**自动打进 standalone，必须手动拷贝，否则部署后车辆图片等静态资源会 404。

**打包为 zip 并上传：**

```bash
# 在项目根目录执行，生成 shanju-standalone.zip
cd .next/standalone && zip -r ../../shanju-standalone.zip . && cd ../..
```

用 scp、sftp 或其它方式把 **`shanju-standalone.zip`** 上传到服务器（例如放到 `/var/www/`）。

**在服务器上解压到部署目录：**

```bash
# 以 /var/www/shanju 为例
sudo mkdir -p /var/www/shanju
sudo unzip -o /var/www/shanju-standalone.zip -d /var/www/shanju
# 若 zip 是上传到其它位置，先 mv 到 /var/www/ 再 unzip，或把上面路径改成实际路径
```

**解压后目录结构示例：**

```text
/var/www/shanju/
├── server.js
├── node_modules/
├── public/       # 必须存在，否则车辆图等 /images/* 会 404
│   └── images/
│       └── vehicles/
└── .next/
    ├── static/   # 必须存在，否则页面样式/脚本会 404
    └── ...
```

---

## 三、在服务器上运行 Next（Node）

在服务器上安装 **Node.js**（无需 npm 用于日常运行）。

**Amazon Linux 2023**（用 dnf，不是 yum/apt）：

```bash
sudo dnf install -y nodejs
# 若上面没有 nodejs，可试指定版本：sudo dnf install -y nodejs20
# 安装后若 node 命令仍找不到，可能是命名空间：用 alternatives 选默认
sudo alternatives --config node   # 选一个 node-xx 作为默认
```

**Ubuntu / Debian**：`sudo apt update && sudo apt install -y nodejs`  
**CentOS / RHEL (yum)**：需先加 NodeSource 源再 `yum install nodejs`，或改用 dnf。

安装完成后，进入部署目录。**务必加 `HOSTNAME=0.0.0.0`**，否则可能只监听主机名，本机 curl 127.0.0.1:3000 会连不上：

```bash
cd /var/www/shanju
HOSTNAME=0.0.0.0 node server.js
```

后台运行示例：

```bash
cd /var/www/shanju
HOSTNAME=0.0.0.0 nohup node server.js > nohup.out 2>&1 &
# 验证
sleep 2 && curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3000
```

默认会监听 **3000 端口**。可用 **systemd** 或 **pm2** 保活，例如：

**systemd 示例**（`/etc/systemd/system/shanju.service`）：

```ini
[Unit]
Description=Shanju Next.js
After=network.target

[Service]
Type=simple
User=root
WorkingDirectory=/var/www/shanju
ExecStart=/usr/bin/node server.js
Restart=on-failure
Environment=NODE_ENV=production
Environment=PORT=3000
Environment=HOSTNAME=0.0.0.0

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl daemon-reload
sudo systemctl enable shanju
sudo systemctl start shanju
```

---

## 四、Nginx 反向代理

在 Nginx 里把域名（或 80 端口）反代到本机 3000。

**示例配置**（`/etc/nginx/sites-available/shanju`，或放在 `conf.d/` 下）：

```nginx
server {
    listen 80;
    server_name your-domain.com;   # 改成你的域名或服务器 IP

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用并重载 Nginx：

```bash
sudo ln -s /etc/nginx/sites-available/shanju /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

若用 **HTTPS**，可先装证书（如 certbot），再在 Nginx 里增加 `listen 443 ssl` 和 `ssl_certificate` / `ssl_certificate_key`，并在 `location /` 保持上述 `proxy_pass http://127.0.0.1:3000;` 即可。

---

## 五、简要流程回顾

| 步骤 | 位置     | 操作 |
|------|----------|------|
| 1    | 本机     | `npm install && npm run build` |
| 2    | 本机     | 上传 `.next/standalone`（及必要时 `.next/static`）到服务器 |
| 3    | 服务器   | 安装 Node，`node server.js` 或用 systemd/pm2 运行在 3000 端口 |
| 4    | 服务器   | 配置 Nginx 反代到 `http://127.0.0.1:3000` |

这样 **不需要在服务器上放完整源码、也不需要在服务器上执行 npm install / npm run build**，只要 Node + Nginx 即可。若你希望改为在服务器上拉代码并构建，也可以再按「方式 A」加一份构建脚本（在服务器上 git pull、npm install、npm run build，然后只运行 `.next/standalone` 里的 `node server.js`），Nginx 配置不变。

---

## 六、不想重新打包时，怎么在服务器上直接改？

**结论：** 文案、多语言、页面逻辑都已经被编译进 `.next` 里的 JS，**没有「改源文件再生效」的通道**，只能二选一：**在服务器上拉源码并构建**，或 **本机改完再打包上传**。下面是可以「直接在服务器动」的几种方式。

### 1. 推荐：在服务器上放源码，改完在服务器 build（不靠本机重新打包）

适合：经常在服务器上改文案、配置，不想每次本机打包再上传。

1. 在服务器上克隆或上传**完整项目源码**到例如 `/var/www/shanju-src`（不要和已部署的 `/var/www/shanju` 混用）。
2. 在服务器安装 Node（见上文）、进入源码目录并构建：
   ```bash
   cd /var/www/shanju-src
   npm install
   npm run build
   cp -r .next/static .next/standalone/.next/static
   cd .next/standalone && zip -r ../../shanju-standalone.zip . && cd ../..
   ```
3. 用构建产物覆盖当前部署目录（或解压到部署目录）：
   ```bash
   sudo unzip -o /var/www/shanju-src/shanju-standalone.zip -d /var/www/shanju
   sudo systemctl restart shanju   # 若用 systemd
   ```

之后要改文案或逻辑：在服务器上改 `/var/www/shanju-src` 里的源码（如 `src/locales/zh.ts`、`src/locales/en.ts`），再重复上面 2、3 步即可，**无需在本机重新打包或上传 zip**。

### 2. 只改一两句文案、且不想在服务器 build：改构建后的 JS（有风险）

部署目录里只有编译结果，文案在 `.next/static/chunks/*.js` 和 `.next/server/**/*.js` 里（文件名带 hash、内容已压缩）。可以「搜索并替换」某段字符串，但：

- 可能有多处、或被压缩成别的形式，替换不完整会乱码或报错；
- 下次你本机重新 build 并上传，这些改动会被覆盖。

示例（仅作参考，请先备份 `/var/www/shanju`）：

```bash
cd /var/www/shanju
# 先备份
sudo cp -r .next .next.bak
# 搜索要改的字符串在哪个文件（例如某句中文）
sudo grep -r "要改的原文" .next --include="*.js" -l
# 用 sed 替换（把文件名和字符串换成实际值，注意特殊字符）
# sudo sed -i 's/要改的原文/新文案/g' .next/static/chunks/xxxx.js
```

改完后重启 Node 进程（如 `sudo systemctl restart shanju`）。**不推荐**长期用这种方式，只适合临时、小改动且接受风险时。

### 3. 不用动「代码包」、只在服务器改的配置

这些**不需要重新打包**，直接在服务器改即可：

- **Nginx**：改 `/etc/nginx/conf.d/` 下站点配置后 `sudo nginx -t && sudo systemctl reload nginx`。
- **systemd**：改 `/etc/systemd/system/shanju.service` 后 `sudo systemctl daemon-reload && sudo systemctl restart shanju`。
- **环境变量**：若项目以后用 `process.env.XXX`（如 Formspree ID），可在 systemd 的 `Environment=XXX=值` 或服务器上的 `.env` 里配置，无需动打包好的 JS。
