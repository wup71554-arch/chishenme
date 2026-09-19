/* ============================================================
   今天吃什么 —— 大模型中转（Cloudflare Worker）
   ------------------------------------------------------------
   作用：浏览器不直接调用 DeepSeek，而是调用这个 Worker；
        Worker 从环境变量里取出 API Key 再加上去。
        这样 key 永远不会出现在网页源码里。

   部署方式见同目录的 README.md
   ============================================================ */

const DEEPSEEK_URL = "https://api.deepseek.com/chat/completions";
const MODEL = "deepseek-chat";
const MAX_TOKENS = 400;          // 限制输出长度，防止被刷爆
const TEMPERATURE = 1.1;         // 高一点，搭配更多样

/* 只允许这些来源调用。
   注意：Origin 是「协议+域名+端口」，不带路径。
   本地用 file:// 双击打开时浏览器发的 Origin 是字符串 "null"，
   所以下面留了 "null" 方便你本地调试。
   但它同时也意味着任何沙箱 iframe 都能过这一关，
   如果你只在线上用、不在本地调试，可以把它删掉。 */
const ALLOWED_ORIGINS = [
  "https://wup71554-arch.github.io",
  "null"
];

function cors(origin) {
  const ok = ALLOWED_ORIGINS.indexOf(origin) !== -1;
  return {
    "Access-Control-Allow-Origin": ok ? origin : ALLOWED_ORIGINS[0],
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

function json(obj, status, headers) {
  return new Response(JSON.stringify(obj), {
    status: status,
    headers: Object.assign({ "Content-Type": "application/json; charset=utf-8" }, headers)
  });
}

// 把所有用户输入都截断，防止有人塞超长内容来烧你的额度
function clamp(v, n) {
  return String(v == null ? "" : v).slice(0, n);
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const headers = cors(origin);

    // 浏览器跨域预检
    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: headers });
    }

    // GET 用来快速检查部署成功没有，浏览器直接打开这个地址就能看到
    if (request.method === "GET") {
      return json({
        ok: true,
        msg: "中转已部署。key 配置状态：" + (env.DEEPSEEK_KEY ? "已配置 ✅" : "还没配置 ❌")
      }, 200, headers);
    }

    if (request.method !== "POST") {
      return json({ error: "只支持 POST" }, 405, headers);
    }

    // 来源检查。挡得住随手 curl 和别的网站，
    // 但挡不住铁了心伪造请求头的人，所以别把 key 的额度上限设太高。
    if (ALLOWED_ORIGINS.indexOf(origin) === -1) {
      return json({ error: "来源不被允许" }, 403, headers);
    }

    if (!env.DEEPSEEK_KEY) {
      return json({ error: "服务端还没配置 DEEPSEEK_KEY，去 Worker 的 Settings 里加" }, 500, headers);
    }

    // ---- 解析并清洗请求 ----
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return json({ error: "请求不是合法的 JSON" }, 400, headers);
    }

    const meal   = clamp(body.meal, 20);
    const taste  = clamp(body.taste, 20);
    const veg    = body.veg === true;
    const avoid  = Array.isArray(body.avoid) ? body.avoid.slice(0, 20).map(function (x) { return clamp(x, 20); }) : [];
    const base   = Array.isArray(body.base)  ? body.base.slice(0, 10).map(function (x) { return clamp(x, 40); })  : [];
    const extra  = clamp(body.extra, 100);   // 用户自由输入的那句话

    // ---- 拼提示词 ----
    const mealName = { breakfast: "早餐", lunch: "午餐", dinner: "晚餐" }[meal] || "一餐";

    const system = [
      "你是一个懂中国家常菜的吃饭搭配助手。用户给出这一餐的条件，你给一份具体的搭配建议。",
      "要求：",
      "1. 直接说吃什么，不要寒暄，不要用 markdown 标题和列表符号",
      "2. 控制在 80 字以内，口语化一点",
      "3. 用户忌口的食材绝对不能出现",
      "4. 如果用户给了「已有搭配」，就在这个基础上调整或认可，不要完全换掉"
    ].join("\n");

    let user = "这一餐是：" + mealName + "\n";
    if (taste && taste !== "any") user += "想吃：" + taste + " 口味\n";
    if (veg) user += "吃素，不要任何肉类\n";
    if (avoid.length) user += "忌口（绝对不能出现）：" + avoid.join("、") + "\n";
    if (base.length) user += "随机出来的搭配：" + base.join(" + ") + "\n";
    if (extra) user += "补充要求：" + extra + "\n";
    user += "\n请给出最终搭配，并用一句话说为什么这样搭。";

    // ---- 调用 DeepSeek ----
    let res;
    try {
      res = await fetch(DEEPSEEK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + env.DEEPSEEK_KEY
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: system },
            { role: "user", content: user }
          ],
          max_tokens: MAX_TOKENS,
          temperature: TEMPERATURE
        })
      });
    } catch (e) {
      return json({ error: "连不上大模型服务" }, 502, headers);
    }

    if (!res.ok) {
      // 上游的原始报错只打进日志，不返回给前端（可能含敏感信息）
      const detail = await res.text();
      console.log("DeepSeek 报错 " + res.status + ": " + detail.slice(0, 300));
      return json({ error: "大模型调用失败（" + res.status + "）", hint: hintFor(res.status) }, 502, headers);
    }

    const data = await res.json();
    const text = data && data.choices && data.choices[0] && data.choices[0].message
      ? data.choices[0].message.content : "";

    if (!text) {
      return json({ error: "模型没返回内容" }, 502, headers);
    }

    return json({ text: text.trim() }, 200, headers);
  }
};

function hintFor(status) {
  if (status === 401) return "key 不对或已失效，去 DeepSeek 后台重新生成一个";
  if (status === 402) return "余额不足，去 DeepSeek 后台充值";
  if (status === 429) return "请求太频繁，等一下再试";
  if (status >= 500) return "DeepSeek 服务端的问题，稍后再试";
  return "";
}
