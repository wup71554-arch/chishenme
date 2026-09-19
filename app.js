/* ============================================================
   今天吃什么 —— 主逻辑
   ============================================================ */

const STORAGE_KEY = "chishenme.v1";

const state = {
  meal: "lunch",    // 当前选的是哪一餐
  taste: "any",     // 口味偏好
  avoid: [],        // 忌口，数组
  veg: false,       // 是否吃素
  recent: [],       // 最近出现过的菜名，用来避免连着重样
  history: []       // 最近生成的搭配
};

const RECENT_LIMIT = 8;   // 记住最近 8 道菜，尽量不重复
const HISTORY_LIMIT = 6;  // 页面上显示最近几条搭配


/* ---------------- 本地保存 ---------------- */

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const saved = JSON.parse(raw);
    // 只取认识的字段，防止旧数据把状态搞乱
    if (saved.meal) state.meal = saved.meal;
    if (saved.taste) state.taste = saved.taste;
    if (Array.isArray(saved.avoid)) state.avoid = saved.avoid;
    if (typeof saved.veg === "boolean") state.veg = saved.veg;
    if (Array.isArray(saved.recent)) state.recent = saved.recent;
    if (Array.isArray(saved.history)) state.history = saved.history;
  } catch (e) {
    // 存的东西坏了就当没有，不影响使用
    console.warn("读取本地设置失败，用默认值", e);
  }
}

function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      meal: state.meal,
      taste: state.taste,
      avoid: state.avoid,
      veg: state.veg,
      recent: state.recent,
      history: state.history
    }));
  } catch (e) {
    console.warn("保存失败（可能是浏览器禁用了本地存储）", e);
  }
}


/* ---------------- 筛选逻辑 ---------------- */

// 这道菜适不适合当前这一餐、有没有踩忌口
function fits(food, meal, avoid) {
  if (food.meals && food.meals.indexOf(meal) === -1) return false;
  if (state.veg && food.meat) return false;
  if (food.contains) {
    for (let i = 0; i < avoid.length; i++) {
      if (food.contains.indexOf(avoid[i]) !== -1) return false;
    }
  }
  return true;
}

// 从某一类里挑出候选
function poolFor(key, meal, avoid, taste) {
  let pool = FOODS[key].filter(function (f) { return fits(f, meal, avoid); });

  // 口味只做"优先"，不做硬性过滤 —— 否则很容易把池子清空
  if (taste !== "any") {
    const hit = pool.filter(function (f) {
      return f.taste && f.taste.indexOf(taste) !== -1;
    });
    if (hit.length) pool = hit;
  }

  return pool;
}

// 随机挑一个，优先挑最近没出现过的
function pick(pool) {
  const fresh = pool.filter(function (f) {
    return state.recent.indexOf(f.name) === -1;
  });
  const src = fresh.length ? fresh : pool;
  return src[Math.floor(Math.random() * src.length)];
}


/* ---------------- 生成搭配 ---------------- */

function generate() {
  const parts = [
    { key: "staples",  icon: "🍚", label: "主食" },
    { key: "proteins", icon: "🍗", label: "主菜" },
    { key: "veggies",  icon: "🥬", label: "蔬菜" }
  ];
  // 早餐不配汤
  if (state.meal !== "breakfast") {
    parts.push({ key: "soups", icon: "🍲", label: "汤" });
  }

  const combo = [];
  const empty = [];

  parts.forEach(function (p) {
    const pool = poolFor(p.key, state.meal, state.avoid, state.taste);
    if (!pool.length) {
      empty.push(p.label);
      return;
    }
    combo.push({ icon: p.icon, label: p.label, name: pick(pool).name });
  });

  if (combo.length) recordHistory(combo);
  return { combo: combo, empty: empty };
}

// 记进历史，顺便更新"最近出现过"的列表
function recordHistory(combo) {
  const names = combo.map(function (c) { return c.name; });
  state.recent = names.concat(state.recent).slice(0, RECENT_LIMIT);

  const mealLabel = (MEALS.find(function (m) { return m.id === state.meal; }) || {}).label || "";
  state.history.unshift({
    dishes: names.join(" + "),
    meal: mealLabel
  });
  state.history = state.history.slice(0, HISTORY_LIMIT);

  save();
}


/* ---------------- 渲染 ---------------- */

function chip(label, active, onClick) {
  const el = document.createElement("button");
  el.type = "button";
  el.className = "chip" + (active ? " on" : "");
  el.textContent = label;
  el.addEventListener("click", onClick);
  return el;
}

function renderChips() {
  // 餐次
  const mealBox = document.getElementById("mealChips");
  mealBox.innerHTML = "";
  MEALS.forEach(function (m) {
    mealBox.appendChild(chip(
      m.icon + " " + m.label,
      state.meal === m.id,
      function () { state.meal = m.id; save(); renderChips(); }
    ));
  });

  // 口味
  const tasteBox = document.getElementById("tasteChips");
  tasteBox.innerHTML = "";
  TASTES.forEach(function (t) {
    tasteBox.appendChild(chip(
      t.label,
      state.taste === t.id,
      function () { state.taste = t.id; save(); renderChips(); }
    ));
  });

  // 忌口（可多选）
  const avoidBox = document.getElementById("avoidChips");
  avoidBox.innerHTML = "";
  AVOIDS.forEach(function (a) {
    const on = state.avoid.indexOf(a) !== -1;
    avoidBox.appendChild(chip(a, on, function () {
      if (on) {
        state.avoid = state.avoid.filter(function (x) { return x !== a; });
      } else {
        state.avoid.push(a);
      }
      save();
      renderChips();
    }));
  });
}

function renderResult(res) {
  const box = document.getElementById("result");
  const dishBox = document.getElementById("dishes");
  const hint = document.getElementById("hint");

  box.hidden = false;
  dishBox.innerHTML = "";

  res.combo.forEach(function (c) {
    const row = document.createElement("div");
    row.className = "dish";

    const icon = document.createElement("span");
    icon.className = "dish-icon";
    icon.textContent = c.icon;

    const body = document.createElement("div");
    body.className = "dish-body";

    const label = document.createElement("span");
    label.className = "dish-label";
    label.textContent = c.label;

    const name = document.createElement("span");
    name.className = "dish-name";
    name.textContent = c.name;

    body.appendChild(label);
    body.appendChild(name);
    row.appendChild(icon);
    row.appendChild(body);
    dishBox.appendChild(row);
  });

  // 有整类被忌口清空时，明确告诉用户，别让人以为是 bug
  if (res.empty.length) {
    hint.hidden = false;
    hint.textContent = "「" + res.empty.join("」「") + "」暂时挑不出符合你忌口的，"
      + "可以去 data.js 里补几道，或者放宽一下条件。";
  } else {
    hint.hidden = true;
    hint.textContent = "";
  }

  renderHistory();
}

function renderHistory() {
  const list = document.getElementById("historyList");
  const section = document.getElementById("history");
  list.innerHTML = "";

  if (!state.history.length) {
    section.hidden = true;
    return;
  }
  section.hidden = false;

  state.history.forEach(function (h) {
    const li = document.createElement("li");
    const meal = document.createElement("span");
    meal.className = "history-meal";
    meal.textContent = h.meal;
    const dishes = document.createElement("span");
    dishes.textContent = h.dishes;
    li.appendChild(meal);
    li.appendChild(dishes);
    list.appendChild(li);
  });
}


/* ---------------- 启动 ---------------- */

function init() {
  load();

  document.getElementById("vegToggle").checked = state.veg;
  document.getElementById("vegToggle").addEventListener("change", function (e) {
    state.veg = e.target.checked;
    save();
  });

  document.getElementById("rollBtn").addEventListener("click", function () {
    renderResult(generate());
  });

  document.getElementById("rerollBtn").addEventListener("click", function () {
    renderResult(generate());
  });

  document.getElementById("clearBtn").addEventListener("click", function () {
    if (!confirm("清空设置和最近记录？食物库不受影响。")) return;
    localStorage.removeItem(STORAGE_KEY);
    location.reload();
  });

  renderChips();
  renderHistory();

  // 如果之前生成过，进来直接显示上一次的搭配
  if (state.history.length) {
    const parts = [
      { icon: "🍚", label: "主食" }, { icon: "🍗", label: "主菜" },
      { icon: "🥬", label: "蔬菜" }, { icon: "🍲", label: "汤" }
    ];
    const names = state.history[0].dishes.split(" + ");
    renderResult({
      combo: names.map(function (n, i) {
        return { icon: parts[i].icon, label: parts[i].label, name: n };
      }),
      empty: []
    });
  }
}

document.addEventListener("DOMContentLoaded", init);
