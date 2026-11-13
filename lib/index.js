/**
 * dsh-hs-code — HS 编码章节查询与归类提示
 */

export const name = "dsh-hs-code";
export const inject = ["tools"];

const NL = String.fromCharCode(10);
const SITE = "https://deepseekbase.com/zh/tools/";
const TEXT_OUTPUT = {
  schema: { type: "object", additionalProperties: false, properties: { text: { type: "string" } }, required: ["text"] },
  render: (_args, value) => [{ type: "text", text: (value && value.text) || "" }],
};

const CHAPTERS = {
  1:"活动物",2:"肉及食用杂碎",3:"鱼及甲壳类",4:"乳品蛋品蜂蜜",5:"其他动物产品",6:"活植物及花",7:"食用蔬菜",8:"食用水果坚果",9:"咖啡茶及香料",10:"谷物",11:"制粉产品",12:"含油子仁",13:"虫胶树胶",14:"植物编结材料",15:"动植物油脂",16:"肉鱼制品",17:"糖及糖食",18:"可可及制品",19:"谷物制品",20:"蔬果制品",21:"杂项食品",22:"饮料酒及醋",23:"食品工业残渣",24:"烟草",25:"盐硫土石",26:"矿砂矿渣",27:"矿物燃料",28:"无机化学品",29:"有机化学品",30:"药品",31:"肥料",32:"鞣料染料",33:"精油化妆品",34:"洗涤剂蜡",35:"蛋白类物质",36:"炸药烟火",37:"照相用品",38:"杂项化学品",39:"塑料及制品",40:"橡胶及制品",41:"生皮及皮革",42:"皮革制品箱包",43:"毛皮及制品",44:"木及木制品",45:"软木及制品",46:"编结品",47:"纸浆",48:"纸及纸板",49:"印刷品",50:"丝",51:"羊毛",52:"棉花",53:"其他植物纤维",54:"化纤长丝",55:"化纤短纤",56:"絮胎无纺布",57:"地毯",58:"特种机织物",59:"工业用纺织物",60:"针织物",61:"针织服装",62:"非针织服装",63:"其他纺织制品",64:"鞋靴",65:"帽类",66:"伞杖",67:"羽毛制品",68:"石料石膏水泥",69:"陶瓷",70:"玻璃",71:"珍珠贵金属",72:"钢铁",73:"钢铁制品",74:"铜及制品",75:"镍及制品",76:"铝及制品",78:"铅及制品",79:"锌及制品",80:"锡及制品",81:"其他贱金属",82:"贱金属工具",83:"杂项贱金属制品",84:"机械器具",85:"电机电气",86:"铁路车辆",87:"车辆及零件",88:"航空器",89:"船舶",90:"光学医疗仪器",91:"钟表",92:"乐器",93:"武器弹药",94:"家具寝具灯具",95:"玩具游戏",96:"杂项制品",97:"艺术品收藏品"
};

const HINTS = [
  ["钣金", "机箱机柜 73；机床零件 84；成型模具 84"],
  ["注塑", "塑料制品 39；注塑机 84"],
  ["cnc", "机床 84；刀具 82"],
  ["模具", "金属模具 84；塑料模具 84"],
  ["pcb", "电路板 85"],
  ["线束", "85"],
  ["电池", "8507"],
  ["led", "8539 / 9405"],
  ["轴承", "8482"],
  ["阀门", "8481"],
  ["泵", "8413"],
  ["紧固件", "7318"],
  ["弹簧", "7320"],
  ["纸箱", "4819"],
  ["包装袋", "3923"],
  ["纺织品", "50-63"],
  ["家具", "94"],
];

function n(v, d) { const x = Number(v); return Number.isFinite(x) ? x : d; }

const TOOLS = {
  hs_chapter_lookup: {
    description: "HS 编码章节查询：输入 2 位章号或 6/8/10 位编码，输出章节、品目、子目拆分",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: { code: { type: "string", description: "章号（如 73）或编码（如 73181500）" } },
      required: ["code"],
    },
    run(args) {
      const raw = String(args.code || "").replace(/\D/g, "");
      if (!raw) throw new Error("请输入数字章号或编码");
      let ch;
      if (raw.length <= 2) ch = n(raw, 0);
      else ch = n(raw.slice(0, 2), 0);
      const title = CHAPTERS[ch];
      if (!title) throw new Error("章号 " + ch + " 不在 1-97 范围（77 为保留章）");
      const lines = ["HS 编码查询", "=".repeat(52), "输入: " + String(args.code), "章: " + ch + " — " + title];
      if (raw.length >= 4) lines.push("品目: " + raw.slice(0, 4));
      if (raw.length >= 6) lines.push("子目: " + raw.slice(0, 6));
      if (raw.length >= 8) lines.push("中国 8 位: " + raw.slice(0, 8));
      if (raw.length >= 10) lines.push("10 位: " + raw.slice(0, 10));
      lines.push("");
      lines.push("章节标题为简写，归类与税率以海关税则及归类裁定为准。");
      lines.push("");
      lines.push("更多工具：" + SITE);
      return lines.join(NL);
    },
  },
  hs_keyword_hint: {
    description: "按产品关键词给出候选 HS 章/品目，帮助快速定位归类方向",
    parameters: {
      type: "object",
      additionalProperties: false,
      properties: { keyword: { type: "string", description: "产品关键词，如 钣金 / 注塑 / PCB" } },
      required: ["keyword"],
    },
    run(args) {
      const k = String(args.keyword || "").toLowerCase().trim();
      if (!k) throw new Error("请输入关键词");
      const hits = HINTS.filter((h) => k.indexOf(h[0]) >= 0 || h[0].indexOf(k) >= 0);
      const lines = ["HS 归类提示", "=".repeat(52), "关键词: " + String(args.keyword), ""];
      if (hits.length) {
        for (const h of hits) lines.push(h[0] + " → " + h[1]);
      } else {
        lines.push("未命中内置提示表。可按材质/用途判断：金属制品 72-83，机械 84，电气 85，塑料 39，纺织 50-63。");
      }
      lines.push("");
      lines.push("提示仅用于定位方向，最终归类需以产品材质、用途、加工深度和海关裁定为准。");
      lines.push("");
      lines.push("更多工具：" + SITE);
      return lines.join(NL);
    },
  },
};

export function apply(ctx, config) {
  void config;
  for (const name of Object.keys(TOOLS)) {
    const t = TOOLS[name];
    ctx.tools.register({
      name: name,
      description: t.description,
      parameters: t.parameters,
      output: TEXT_OUTPUT,
      async execute(args) { try { return { text: t.run(args || {}) }; } catch (e) { return { text: "处理失败: " + String((e && e.message) || e) }; } },
    });
  }
}
