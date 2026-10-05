# 新蜂资产管理平台 — Web 前端

本仓库是**新蜂资产管理平台**的 Web 管理界面，基于 Vue 3、TypeScript、Ant Design Vue 和 Vue Vben Admin 构建。通过核心服务完成登录、租户和权限管理，并对接资产配置、运维任务、统一 I/O 等业务服务。

- 系统管理：用户、角色、菜单、部门、租户与审计页面。
- 资产管理：CMDB 模型、配置项、关系与权限管理页面。
- 运维与连接：运维中心、任务和统一 I/O 页面。
- 扩展页面：文件、IP 地址管理、监控与工作流；使用相应页面前需部署对应后端，页面存在不代表后端已经随本仓库提供。

平台入口：[newbee 工作区](https://github.com/coder-lulu/newbee) · 核心后端：[newbee-core](https://github.com/coder-lulu/newbee-core) · [问题反馈](https://github.com/coder-lulu/newbee-ui/issues)

## 获取代码

完整工作区适合前后端联调：

```bash
git clone --recurse-submodules https://github.com/coder-lulu/newbee.git
cd newbee/ui
```

只开发前端时，也可以独立获取：

```bash
git clone https://github.com/coder-lulu/newbee-ui.git
cd newbee-ui
```

以下命令均在前端仓库根目录执行。需要克隆整个仓库，`apps/web-antd` 依赖本仓库中的 `packages` 和 `internal`，不能单独复制应用目录安装。

## 本地开发

### 环境与依赖

`package.json` 要求 Node.js **>=20.10.0**、pnpm **>=9.12.0**，`packageManager` 固定为 **pnpm 10.10.0**。按此版本安装：

```bash
npm install -g pnpm@10.10.0
pnpm install --frozen-lockfile
```

### 应用配置

共享环境模板位于 `apps/.env`、`apps/.env.development` 和 `apps/.env.production`。当前应用从 `apps/web-antd` 运行，配置加载器读取当前目录，**不会自动读取父目录的这些模板**。首次开发请将公共模板和开发模板合并到应用自己的本地文件。

Linux/macOS/Git Bash：

```bash
cat apps/.env apps/.env.development > apps/web-antd/.env.development.local
```

PowerShell：

```powershell
Get-Content apps/.env, apps/.env.development | Set-Content -Encoding utf8 apps/web-antd/.env.development.local
```

然后编辑 `apps/web-antd/.env.development.local`，将平台名称和连接参数设置为：

```dotenv
VITE_APP_TITLE=新蜂资产管理平台
VITE_PORT=5666
VITE_BASE=/
VITE_GLOB_API_URL=/
VITE_GLOB_ENABLE_ENCRYPT=false
```

保留模板中业务需要的其他字段，并将客户端标识 `VITE_GLOB_APP_CLIENT_ID` 配置为后端接受的值。本地配置文件已被 Git 忽略；浏览器可读取的前端配置不适合保存服务端私钥、数据库密码或其他服务端凭据。

首次部署保持 `VITE_GLOB_ENABLE_ENCRYPT=false`，生产通信使用 HTTPS。当前客户端配置尚未向请求解密逻辑传递 `encryptionKey`，只填写环境变量并打开该开关不足以完成加密对接；启用前需要补齐配置链路并与后端联调。核心配置保持不强制响应加密时，默认关闭方案可用。

### 启动与接口代理

先按[核心后端说明](https://github.com/coder-lulu/newbee-core#readme)启动所需服务，再执行：

```bash
pnpm dev:antd
```

使用上述配置时访问 `http://localhost:5666`，实际端口以启动输出为准。开发代理配置在 [`apps/web-antd/vite.config.mts`](apps/web-antd/vite.config.mts)：

| 浏览器请求前缀 | 代理目标 | 用途 |
| --- | --- | --- |
| `/sys-api` | `http://127.0.0.1:9101` | 核心 API、登录与系统管理 |
| `/cmdb-api` | `http://127.0.0.1:9207` | CMDB API |
| `/io-api` | `http://127.0.0.1:9501` | 统一 I/O API |
| `/ops-api`、`/ops-center-api` | `http://127.0.0.1:9601` | 运维中心 API |
| `/fms-api` | `http://127.0.0.1:9102` | 文件服务 |
| `/ipam-api` | `http://127.0.0.1:9302` | IP 地址管理 |
| `/mms-api` | `http://127.0.0.1:9104` | 消息服务 |

每条代理均移除表中前缀并支持 WebSocket。例如浏览器的 `/sys-api/user/login` 被转发为核心服务的 `/user/login`。后端位于其他机器时修改对应 `target`；生产部署需在 Web 服务器配置同样的路由。`VITE_GLOB_API_URL=/` 表示同源请求，不应再额外添加 `/api` 前缀。账号由实际后端初始化流程提供。

## 生产部署

### 1. 配置并构建

创建应用的生产配置文件，以下为 Bash 命令；PowerShell 可使用上一节同样的 `Get-Content | Set-Content` 方法替换开发模板文件名：

```bash
cat apps/.env apps/.env.production > apps/web-antd/.env.production.local
```

编辑该文件，设置 `VITE_APP_TITLE=新蜂资产管理平台`，同源部署保留 `VITE_BASE=/`、`VITE_GLOB_API_URL=/`。模板默认 `VITE_ROUTER_HISTORY=hash`、请求加密关闭；业务配置与目标后端保持一致。然后构建：

```bash
pnpm build:antd
```

产物目录为 **`apps/web-antd/dist/`**。部署时复制该目录的完整内容，包括 `index.html`、静态资源和 `_app.config.js`。可用下列命令本地预览静态构建，但预览不能代替生产接口网关：

```bash
pnpm --filter @vben/web-antd preview
```

### 2. 配置 Nginx

下面示例用于 Linux 上前端与 API 部署在同一主机的场景。先安装 Nginx，再从前端仓库根目录复制产物：

```bash
sudo mkdir -p /var/www/newbee
sudo cp -R apps/web-antd/dist/. /var/www/newbee/
```

将下列配置保存为 Nginx `http` 块加载的文件，例如 `/etc/nginx/conf.d/newbee.conf`；将域名和服务地址替换为实际值，并确保没有其他同域名站点配置冲突。

```nginx
map $http_upgrade $newbee_connection_upgrade {
    default upgrade;
    ''      close;
}

server {
    listen 80;
    server_name newbee.example.com;
    root /var/www/newbee;
    index index.html;

    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection $newbee_connection_upgrade;
    proxy_read_timeout 3600s;
    proxy_buffering off;

    # proxy_pass 的末尾 / 用于去掉 location 匹配的服务前缀。
    location /sys-api/        { proxy_pass http://127.0.0.1:9101/; }
    location /cmdb-api/       { proxy_pass http://127.0.0.1:9207/; }
    location /io-api/         { proxy_pass http://127.0.0.1:9501/; }
    location /ops-api/        { proxy_pass http://127.0.0.1:9601/; }
    location /ops-center-api/ { proxy_pass http://127.0.0.1:9601/; }
    location /fms-api/        { proxy_pass http://127.0.0.1:9102/; }
    location /ipam-api/       { proxy_pass http://127.0.0.1:9302/; }
    location /mms-api/        { proxy_pass http://127.0.0.1:9104/; }

    location = /_app.config.js {
        add_header Cache-Control "no-store";
        try_files $uri =404;
    }
    location = /index.html {
        add_header Cache-Control "no-cache";
    }
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

仅启用需要的业务服务；未部署的后端不会因为添加代理而自动启动。后端位于容器或其他机器时，用 Nginx 能访问的服务地址替换 `127.0.0.1`。上例提供 HTTP 联调入口，对外上线时应配置域名证书和 HTTPS。

```bash
sudo nginx -t
sudo systemctl reload nginx
```

打开站点后，在浏览器网络面板检查 `/sys-api/` 请求是否正常到达核心服务，再验证已部署业务模块。当前 [`scripts/deploy/Dockerfile`](scripts/deploy/Dockerfile) 仍复制 `playground/dist`，不对应本应用产物；因此这里采用上述静态资源部署步骤。

### 3. 构建配置与运行时配置

- `VITE_APP_TITLE`、`VITE_BASE`、`VITE_ROUTER_HISTORY` 等参与构建，修改后重新构建并部署。
- 构建插件将 `VITE_GLOB_*` 导出到 `dist/_app.config.js`，生产环境通过 `window._VBEN_ADMIN_PRO_APP_CONF_` 读取。其中 API 基址等可在部署产物中调整；保留文件原有赋值结构和字段类型，并使浏览器重新加载配置。
- 只修改服务器上的 `.env` 或 Nginx 进程环境变量，不会自动改变已经构建的页面。更新前端产物时，也需保留或重新应用该部署环境的运行时配置。
- 默认 hash 路由与上例兼容；改为 HTML5 history 路由时，仍需保留 `try_files` 的 SPA 回退。API 请求必须先匹配对应代理，不能落到 `index.html`。

## 开发检查与文档

```bash
pnpm --filter @vben/web-antd typecheck
pnpm lint
pnpm test:unit
```

以上为项目提供的检查入口；部署前应以目标环境实际检查和构建结果为准。

- [`apps/web-antd/src`](apps/web-antd/src)：页面、路由、状态与 API 调用。
- [`packages`](packages)：共享组件和业务基础包。
- [`internal`](internal)：Vite、TypeScript 与代码规范配置。
- [CMDB 前端对接文档](docs/CMDB_前端对接文档.md)
- [运维 API 对接文档](docs/OPS_API_接口对接文档.md)
- [CI 权限对接文档](docs/CI权限前端对接文档.md)
- [Agent WebSocket SSH 对接文档](docs/Agent_WebSocket_SSH_API文档.md)

## 上游与许可证

本前端基于 [Vue Vben Admin](https://github.com/vbenjs/vue-vben-admin)，遵循上游 **MIT** 许可证，并保留 Vben 的版权声明，详见 [LICENSE](LICENSE)。依赖组件继续遵循其各自许可证。
