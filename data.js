/* ============================================================
   食物库 —— 想加菜？照着格式往数组里加一行就行
   ------------------------------------------------------------
   name      菜名
   meals     适合哪几餐：breakfast 早 / lunch 午 / dinner 晚
   taste     口味标签，匹配用户选的"想吃哪种口味"
   contains  含有哪些忌口成分，用户勾了对应忌口就会被过滤掉
   meat      是否荤菜，吃素的人会自动跳过（不写就是素）
   ============================================================ */

const FOODS = {

  /* ---------- 主食 ---------- */
  staples: [
    // 午晚餐
    { name: "白米饭",     meals: ["lunch", "dinner"], taste: ["家常", "清淡"] },
    { name: "杂粮饭",     meals: ["lunch", "dinner"], taste: ["清淡"] },
    { name: "糙米饭",     meals: ["lunch", "dinner"], taste: ["清淡"] },
    { name: "蛋炒饭",     meals: ["lunch", "dinner"], taste: ["家常"], contains: ["鸡蛋"] },
    { name: "阳春面",     meals: ["lunch", "dinner"], taste: ["清淡"] },
    { name: "牛肉面",     meals: ["lunch", "dinner"], taste: ["家常"], contains: ["牛肉", "香菜"] },
    { name: "猪肉白菜饺子", meals: ["lunch", "dinner"], taste: ["家常"], contains: ["猪肉"] },
    { name: "意大利面",   meals: ["lunch", "dinner"], taste: ["酸甜"] },
    { name: "炒米粉",     meals: ["lunch", "dinner"], taste: ["家常"] },
    { name: "馒头",       meals: ["breakfast", "lunch", "dinner"], taste: ["清淡"] },
    { name: "花卷",       meals: ["breakfast", "lunch"], taste: ["清淡"] },
    { name: "烤红薯",     meals: ["breakfast", "lunch"], taste: ["清淡"] },
    { name: "水煮玉米",   meals: ["breakfast", "lunch"], taste: ["清淡"] },

    // 早餐
    { name: "全麦面包",   meals: ["breakfast"], taste: ["清淡"] },
    { name: "小米粥",     meals: ["breakfast"], taste: ["清淡"] },
    { name: "白粥",       meals: ["breakfast"], taste: ["清淡"] },
    { name: "燕麦粥",     meals: ["breakfast"], taste: ["清淡"] },
    { name: "豆浆油条",   meals: ["breakfast"], taste: ["家常"], contains: ["豆制品"] },
    { name: "小笼包",     meals: ["breakfast"], taste: ["家常"], contains: ["猪肉"] },
    { name: "煎饼果子",   meals: ["breakfast"], taste: ["家常"], contains: ["鸡蛋", "香菜"] },
    { name: "鸡蛋灌饼",   meals: ["breakfast"], taste: ["家常"], contains: ["鸡蛋"] },
    { name: "鲜肉馄饨",   meals: ["breakfast", "lunch"], taste: ["清淡"], contains: ["猪肉", "香菜"] },
    { name: "肠粉",       meals: ["breakfast"], taste: ["清淡"] }
  ],

  /* ---------- 主菜 / 蛋白质 ---------- */
  proteins: [
    // 清淡
    { name: "清蒸鲈鱼",   meals: ["lunch", "dinner"], taste: ["清淡"], contains: ["海鲜"], meat: true },
    { name: "白灼虾",     meals: ["lunch", "dinner"], taste: ["清淡"], contains: ["海鲜"], meat: true },
    { name: "清炒虾仁",   meals: ["lunch", "dinner"], taste: ["清淡"], contains: ["海鲜"], meat: true },
    { name: "白切鸡",     meals: ["lunch", "dinner"], taste: ["清淡"], meat: true },
    { name: "清炖鸡汤",   meals: ["lunch", "dinner"], taste: ["清淡"], meat: true },
    { name: "番茄炒蛋",   meals: ["lunch", "dinner"], taste: ["酸甜", "家常"], contains: ["鸡蛋"] },
    { name: "蒸水蛋",     meals: ["breakfast", "lunch", "dinner"], taste: ["清淡"], contains: ["鸡蛋"] },
    { name: "豆腐羹",     meals: ["lunch", "dinner"], taste: ["清淡"], contains: ["豆制品"] },
    { name: "香煎豆腐",   meals: ["lunch", "dinner"], taste: ["家常"], contains: ["豆制品"] },
    { name: "红烧豆腐",   meals: ["lunch", "dinner"], taste: ["家常"], contains: ["豆制品"] },
    { name: "卤豆腐干",   meals: ["breakfast", "lunch", "dinner"], taste: ["家常"], contains: ["豆制品"] },
    { name: "鹰嘴豆沙拉", meals: ["lunch", "dinner"], taste: ["清淡"], contains: ["豆制品"] },
    { name: "麻酱拌菠菜", meals: ["breakfast", "lunch"], taste: ["清淡", "家常"] },
    { name: "凉拌烤麸",   meals: ["breakfast", "lunch", "dinner"], taste: ["家常"] },

    // 家常
    { name: "红烧肉",     meals: ["lunch", "dinner"], taste: ["重口", "家常"], contains: ["猪肉"], meat: true },
    { name: "糖醋排骨",   meals: ["lunch", "dinner"], taste: ["酸甜"], contains: ["猪肉"], meat: true },
    { name: "可乐鸡翅",   meals: ["lunch", "dinner"], taste: ["酸甜"], meat: true },
    { name: "鱼香肉丝",   meals: ["lunch", "dinner"], taste: ["家常"], contains: ["猪肉"], meat: true },
    { name: "卤鸡腿",     meals: ["lunch", "dinner"], taste: ["家常"], meat: true },
    { name: "黑椒牛柳",   meals: ["lunch", "dinner"], taste: ["重口"], contains: ["牛肉"], meat: true },
    { name: "咖喱鸡",     meals: ["lunch", "dinner"], taste: ["重口"], meat: true },
    { name: "香烤鸡翅",   meals: ["lunch", "dinner"], taste: ["家常"], meat: true },

    // 辣 / 重口
    { name: "回锅肉",     meals: ["lunch", "dinner"], taste: ["辣", "重口"], contains: ["猪肉", "辣"], meat: true },
    { name: "孜然牛肉",   meals: ["lunch", "dinner"], taste: ["辣", "重口"], contains: ["牛肉", "辣"], meat: true },
    { name: "宫保鸡丁",   meals: ["lunch", "dinner"], taste: ["辣"], contains: ["辣", "花生"], meat: true },
    { name: "麻婆豆腐",   meals: ["lunch", "dinner"], taste: ["辣"], contains: ["辣", "豆制品", "猪肉"], meat: true },
    { name: "水煮肉片",   meals: ["lunch", "dinner"], taste: ["辣"], contains: ["辣", "猪肉"], meat: true },
    { name: "辣子鸡",     meals: ["lunch", "dinner"], taste: ["辣", "重口"], contains: ["辣"], meat: true },
    { name: "剁椒鱼头",   meals: ["lunch", "dinner"], taste: ["辣"], contains: ["辣", "海鲜"], meat: true },
    { name: "口水鸡",     meals: ["lunch", "dinner"], taste: ["辣"], contains: ["辣", "花生", "香菜"], meat: true },
    { name: "麻辣香锅",   meals: ["lunch", "dinner"], taste: ["辣", "重口"], contains: ["辣"], meat: true }
  ],

  /* ---------- 蔬菜 ---------- */
  veggies: [
    { name: "蒜蓉西兰花", meals: ["lunch", "dinner"], taste: ["清淡"] },
    { name: "清炒时蔬",   meals: ["lunch", "dinner"], taste: ["清淡"] },
    { name: "上汤娃娃菜", meals: ["lunch", "dinner"], taste: ["清淡"] },
    { name: "白灼菜心",   meals: ["lunch", "dinner"], taste: ["清淡"] },
    { name: "清炒油麦菜", meals: ["lunch", "dinner"], taste: ["清淡"] },
    { name: "蒜蓉菠菜",   meals: ["lunch", "dinner"], taste: ["清淡"] },
    { name: "凉拌黄瓜",   meals: ["breakfast", "lunch", "dinner"], taste: ["清淡"] },
    { name: "凉拌木耳",   meals: ["breakfast", "lunch", "dinner"], taste: ["清淡"] },
    { name: "清炒芦笋",   meals: ["lunch", "dinner"], taste: ["清淡"] },
    { name: "蚝油生菜",   meals: ["lunch", "dinner"], taste: ["家常"] },
    { name: "手撕包菜",   meals: ["lunch", "dinner"], taste: ["家常", "辣"] },
    { name: "香菇青菜",   meals: ["lunch", "dinner"], taste: ["家常"], contains: ["菌菇"] },
    { name: "地三鲜",     meals: ["lunch", "dinner"], taste: ["家常"] },
    { name: "醋溜土豆丝", meals: ["lunch", "dinner"], taste: ["酸甜"] },
    { name: "糖拌西红柿", meals: ["breakfast", "lunch", "dinner"], taste: ["酸甜"] },
    { name: "干煸四季豆", meals: ["lunch", "dinner"], taste: ["辣", "重口"], contains: ["辣"] },
    { name: "菠菜拌花生", meals: ["lunch", "dinner"], taste: ["家常"], contains: ["花生"] },
    { name: "拍黄瓜",     meals: ["breakfast", "lunch", "dinner"], taste: ["清淡", "家常"] },
    { name: "榨菜丝",     meals: ["breakfast"], taste: ["清淡", "家常"] },
    { name: "小葱拌豆腐", meals: ["breakfast"], taste: ["清淡"], contains: ["豆制品"] }
  ],

  /* ---------- 汤 ---------- */
  soups: [
    { name: "紫菜蛋花汤", meals: ["lunch", "dinner"], taste: ["清淡"], contains: ["鸡蛋", "海鲜"] },
    { name: "番茄蛋汤",   meals: ["lunch", "dinner"], taste: ["酸甜"], contains: ["鸡蛋"] },
    { name: "丝瓜蛋汤",   meals: ["lunch", "dinner"], taste: ["清淡"], contains: ["鸡蛋"] },
    { name: "冬瓜排骨汤", meals: ["lunch", "dinner"], taste: ["清淡"], contains: ["猪肉"] },
    { name: "玉米排骨汤", meals: ["lunch", "dinner"], taste: ["清淡"], contains: ["猪肉"] },
    { name: "白萝卜汤",   meals: ["lunch", "dinner"], taste: ["清淡"] },
    { name: "菌菇汤",     meals: ["lunch", "dinner"], taste: ["清淡"], contains: ["菌菇"] },
    { name: "味噌汤",     meals: ["lunch", "dinner"], taste: ["清淡"], contains: ["豆制品"] },
    { name: "酸辣汤",     meals: ["lunch", "dinner"], taste: ["辣", "重口"], contains: ["辣", "鸡蛋", "猪肉"] },
    { name: "萝卜牛腩汤", meals: ["lunch", "dinner"], taste: ["家常"], contains: ["牛肉"] },
    { name: "罗宋汤",     meals: ["lunch", "dinner"], taste: ["酸甜"], contains: ["牛肉"] }
  ]
};

/* ---------- 可选项 ---------- */

const MEALS = [
  { id: "breakfast", label: "早餐", icon: "🌅" },
  { id: "lunch",     label: "午餐", icon: "☀️" },
  { id: "dinner",    label: "晚餐", icon: "🌙" }
];

const TASTES = [
  { id: "any",  label: "随便" },
  { id: "清淡", label: "清淡" },
  { id: "家常", label: "家常" },
  { id: "辣",   label: "辣的" },
  { id: "重口", label: "重口" },
  { id: "酸甜", label: "酸甜" }
];

const AVOIDS = [
  "辣", "香菜", "花生", "海鲜", "牛肉", "羊肉", "猪肉", "鸡蛋", "豆制品", "菌菇"
];
