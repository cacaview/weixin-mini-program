Flask Serverless 示例

说明
- 简单的 `/api/count` POST 接口，接收 JSON `{ "action": "inc"|"dec"|"get" }`。
- 响应 JSON：`{ "service": "<X-WX-SERVICE header>", "count": <number> }`。

本地运行

1. 创建虚拟环境并安装依赖：

```bash
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

2. 访问健康检查：

```bash
curl http://localhost:8080/health
```

Docker 构建与运行

```bash
# 构建
docker build -t my-flask-count:latest .
# 本地运行
docker run -p 8080:8080 my-flask-count:latest
```

推送与部署到微信 CloudRun（概要）

1. 构建并推到镜像仓库（按你使用的容器注册表）：

```bash
docker build -t <registry>/my-flask-count:latest .
docker push <registry>/my-flask-count:latest
```

2. 在微信云控制台创建 CloudRun 服务（当 Dockerfile 在仓库根时）：
- 代码仓库：`cacaview/weixin-mini-program`
- 分支：`main`
- 目标目录（Build Context）：`.` （仓库根）
- 端口：`8080`
- Dockerfile：有，名称 `Dockerfile`（位于仓库根）
- 健康检查路径：`/health`

如果你仍想把构建上下文设置为子目录，也可以，但此时需要将 Dockerfile 放在 `server/flask_service` 内（或使用控制台支持的相对 Dockerfile 路径）。目前仓库已将 `Dockerfile` 移到根目录以避免 CloudRun 构建器找不到路径的问题。

3. 小程序调用示例：

```js
wx.cloud.callContainer({
  config: { env: 'prod-0gwnj9wy899c55bd' },
  path: '/api/count',
  header: { 'X-WX-SERVICE': '<你的服务名>' },
  method: 'POST',
  data: { action: 'inc' }
})
```

备注：建议生产环境使用外部持久化（数据库或 Redis），不要在 serverless 中依赖本地文件作为单一存储。