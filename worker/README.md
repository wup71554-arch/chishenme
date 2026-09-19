# 大模型中转（Cloudflare Worker）

网页不直接调用 DeepSeek，而是调用这个 Worker，由它把 API Key 加进去。
这样 **key 永远不会出现在网页源码里**，别人 F12 也偷不走。

用的是 Cloudflare Workers 免费版，**不需要装任何东西**，全程在网页后台点。
免费额度每天 10 万次请求，这个小工具用不完。

## 部署步骤

### 1. 注册 Cloudflare

打开 https://dash.cloudflare.com/sign-up 注册，免费的，不用绑卡。

### 2. 创建 Worker

登录后看**左侧菜单** → **Workers & Pages** → 点 **Create** → 选 **Workers** →
起个名字比如 `chishenme-api` → **Deploy**

### 3. 粘贴代码

创建完点 **Edit code**（编辑代码）：

1. 把编辑框里原有的示例代码**全部删掉**
2. 把 `worker.js` 的全部内容粘进去
3. 右上角 **Deploy**（部署）

### 4. 配置 API Key ⚠️ 最关键的一步

回到这个 Worker 的页面 → **Settings** → 找到 **Variables and Secrets**（变量和密钥）
→ **Add**：

| 字段 | 填什么 |
|---|---|
| Type | 选 **Secret**（不要选 Text） |
| Name | `DEEPSEEK_KEY` ← **必须一字不差** |
| Value | 你的 DeepSeek API Key |

点 **Save**，然后**再 Deploy 一次**让它生效。

> 选 Secret 类型，Cloudflare 会把它加密存起来，之后在后台也看不到明文。
> 这就是为什么 key 不需要写进代码里。

### 5. 验证

Worker 页面顶上有个地址，长这样：

```
https://chishenme-api.你的用户名.workers.dev
```

**直接在浏览器里打开它。** 看到这个就说明成了：

```json
{ "ok": true, "msg": "中转已部署。key 配置状态：已配置 ✅" }
```

如果显示 `还没配置 ❌`，说明第 4 步的名字拼错了或者忘了重新 Deploy。

## 安全说明（实话实说）

这个 Worker 是公开的，地址写在网页源码里谁都能看到。目前的防护是：

- **来源检查**：只接受自己网站发来的请求，随手 curl 和别的网站会被 403 挡掉
- **输入截断**：所有字段都限制长度，防止有人塞超长内容烧额度
- **输出限制**：`max_tokens` 卡在 400
- **接口专用**：请求体是结构化的吃饭条件，Worker 自己拼提示词。
  别人没法拿它当通用大模型代理去问别的

但要清楚：**来源检查挡不住铁了心伪造请求头的人**。真正的兜底是
**去 DeepSeek 后台设置消费限额**，把可能的最大损失锁死。这一步建议一定做。

## 想改行为？

- 换模型：改 `MODEL`（比如 `deepseek-reasoner` 更聪明但更贵）
- 改输出长度：改 `MAX_TOKENS`
- 改提示词风格：改 `system` 那个数组
- 网站域名变了：改 `ALLOWED_ORIGINS`
