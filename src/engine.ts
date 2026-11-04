export type Market = "闲鱼" | "Mercari" | "eBay";
export const markets: Market[] = ["闲鱼", "Mercari", "eBay"];
export const rarities = ["普通", "少见", "稀有", "超稀有", "梦情谷"];
export const kinds = [
  "吧唧",
  "镭射吧唧",
  "方吧唧",
  "亚克力立牌",
  "双人亚克力立牌",
  "亚克力砖",
  "色纸",
  "镭射票",
  "拍立得",
  "小卡",
  "透卡",
  "棉花娃娃",
  "毛绒挂件",
  "角色徽章",
  "漫画特典",
  "限定海报",
  "限定漫画封面",
  "漫展会场限定周边",
  "周年纪念周边",
  "同人制品",
];
export const versions = [
  "MCU 电影宇宙",
  "Marvel Comics 漫画宇宙",
  "Ultimate Universe",
  "经典漫画版本",
  "动画版本",
  "游戏版本",
  "原创同人版本",
];
export const personas = [
  "雨宫莲 / Joker",
  "周防达哉",
  "结城理",
  "鸣上悠",
  "花村阳介",
  "白钟直斗",
  "喜多川祐介",
  "坂本龙司",
  "高卷杏",
  "新岛真",
  "佐仓双叶",
  "摩尔加纳",
];
const others = [
  "Steve Rogers",
  "Bucky Barnes",
  "Loki",
  "Thor",
  "Natasha Romanoff",
  "Clint Barton",
  "Bruce Banner",
  "Stephen Strange",
  "Wanda Maximoff",
  "Vision",
  "Sam Wilson",
  "Scott Lang",
  "Wade Wilson",
  "Matt Murdock",
  "Gwen Stacy",
  "Miles Morales",
  "Miguel O’Hara",
  "Eddie Brock",
  "Harry Osborn",
  "May Parker",
  "Happy Hogan",
  "Pepper Potts",
];
const series = [
  "经典装甲档案",
  "Homecoming 校园日记",
  "Civil War 交汇时刻",
  "Infinity War 星海回响",
  "Endgame 终局纪念",
  "Far From Home 旅行手记",
  "No Way Home 多元宇宙",
  "Avengers 并肩作战",
  "复古美漫封面",
  "城市夜巡",
  "漫展限定画集",
  "周年珍藏",
];
export interface Product {
  id: string;
  title: string;
  work: string;
  characters: string;
  version: string;
  kind: string;
  price: number;
  reference: number;
  original: number;
  rarity: number;
  condition: string;
  description: string;
  seller: string;
  rating: number;
  location: string;
  created: number;
  shipping: number;
  negotiable: boolean;
  direct: boolean;
  auction: boolean;
  market: Market;
  seed: number;
  image?: string;
  personality: number;
  sold?: boolean;
}
export interface Order {
  id: string;
  product: Product;
  paid: number;
  shipping: number;
  at: number;
  step: number;
  opened: boolean;
  method: string;
  timeline: number[];
}
export interface Wish {
  id: string;
  character: string;
  name: string;
  target: number;
  rarity: number;
  priority: string;
}
export interface Chat {
  text: string;
  by: "me" | "seller";
}
export interface Auction {
  price: number;
  bid: number;
  end: number;
  count: number;
  status: "active" | "won" | "lost";
  next: number;
}
export interface State {
  schema: 1;
  products: Product[];
  wallet: Record<Market, number>;
  orders: Order[];
  favorites: string[];
  wishes: Wish[];
  chats: Record<string, Chat[]>;
  deals: Record<string, number>;
  freeShipping: string[];
  auctions: Record<string, Auction>;
  rich: boolean;
  dark: boolean;
  daily: string;
  events: string[];
  background: string;
  refreshes: number;
}
export function generate(batch = 0): Product[] {
  return Array.from({ length: 270 }, (_, i) => {
    const n = i + batch * 271;
    const market = markets[i % 3];
    const marvel = i < 216;
    const duo = i < 60;
    const characters = marvel
      ? duo
        ? "Tony Stark & Peter Parker"
        : i < 180
          ? i % 2
            ? "Tony Stark"
            : "Peter Parker"
          : others[(i - 180) % others.length]
      : i < 252
        ? personas[(i - 216) % 12]
        : ["布丁猫", "森林小熊", "薄荷兔"][(i - 252) % 3];
    const kind = kinds[(i * 7 + batch) % kinds.length];
    const rarity =
      i % 29 === 0
        ? 4
        : i % 11 === 0
          ? 3
          : i % 5 === 0
            ? 2
            : i % 3 === 0
              ? 1
              : 0;
    const reference = Math.round(
      (35 + ((i * 37) % 180) + rarity * 130) *
        (market === "Mercari" ? 20 : market === "eBay" ? 0.18 : 1),
    );
    const price = Math.max(
      1,
      Math.round(reference * (i % 9 === 0 ? 0.42 : 0.75 + (i % 6) * 0.08)),
    );
    const auction = market !== "闲鱼" && i % 7 === 0;
    const label = marvel
      ? series[(Math.floor(i / 20) + batch) % series.length]
      : i < 252
        ? "心之怪盗 · 放课后收藏"
        : "午后杂货铺";
    return {
      id: `g-${batch}-${i}`,
      title:
        market === "Mercari"
          ? `${characters} ${kind} ${label} 中古品`
          : market === "eBay"
            ? `${characters} · ${label} ${kind} collectible`
            : `${characters}｜${label} ${kind}`,
      work: marvel
        ? "Marvel 漫威"
        : i < 252
          ? "Persona 女神异闻录"
          : "原创角色",
      characters,
      version: marvel
        ? versions[(Math.floor(i / 12) + batch) % 7]
        : i < 252
          ? "Persona 系列"
          : "原创同人版本",
      kind,
      price,
      reference,
      original: Math.round(reference * 1.2),
      rarity,
      condition: ["全新未拆", "近全新", "轻微使用痕迹"][i % 3],
      description: `${label}系列的${kind}，细节与包装均为虚拟展示。${duo ? "两位独立的天才，带着各自的勇气并肩前行。" : "把热爱的片刻，收进自己的小小收藏室。"}本商品及卖家均为模拟数据，不产生实物或真实交易。`,
      seller: [
        "薄荷汽水收藏屋",
        "今天也在蹲谷",
        "布丁的中古小铺",
        "纽约夜巡仓库",
        "星星寄存处",
        "猫猫急出中",
      ][i % 6],
      rating: 4.7 + (i % 4) * 0.1,
      location:
        market === "Mercari"
          ? ["东京", "大阪", "京都"][i % 3]
          : market === "eBay"
            ? "New York, US"
            : ["上海", "杭州", "广州"][i % 3],
      created: Date.now() - (270 - i) * 120000,
      shipping: market === "Mercari" ? 210 : market === "eBay" ? 5 : 6,
      negotiable: i % 6 !== 2,
      direct: !auction,
      auction,
      market,
      seed: n,
      personality: i % 6,
    };
  });
}
export function initial(): State {
  return {
    schema: 1,
    products: generate(),
    wallet: { 闲鱼: 5000, Mercari: 100000, eBay: 1000 },
    orders: [],
    favorites: [],
    wishes: [],
    chats: {},
    deals: {},
    freeShipping: [],
    auctions: {},
    rich: false,
    dark: false,
    daily: "",
    events: ["欢迎来到谷谷市场，今天也要收获梦情谷 ♡"],
    background: "展示架",
    refreshes: 0,
  };
}
export const money = (n: number, m: Market) =>
  `${m === "闲鱼" ? "¥" : m === "Mercari" ? "JP¥" : "$"}${n.toLocaleString("zh-CN", { maximumFractionDigits: 2 })}`;
export const steps = (m: Market) =>
  m === "闲鱼"
    ? ["待发货", "已发货", "运输中", "派送中", "已签收"]
    : [
        "待发货",
        "已发货",
        m === "Mercari" ? "日本仓库" : "海外仓库",
        "国际转运",
        "清关",
        "国内派送",
        "已签收",
      ];
export function blocked(q: string) {
  return /明智|吾郎|akechi|goro|gorō|アケチ|ゴロウ|あけち|ごろう/i.test(q);
}
export function matches(p: Product, q: string) {
  if (blocked(q)) return false;
  let s = q.toLowerCase().trim();
  if (/^(アイアンマン|トニー|トニー・スターク)$/.test(s)) s = "tony";
  if (/^(スパイダーマン|ピーター|ピーター・パーカー)$/.test(s)) s = "peter";
  if (/^(tony stark|iron man|钢铁侠|妮妮|tony)$/.test(s)) s = "tony";
  if (/^(peter parker|spider-man|蜘蛛侠|小蜘蛛|peter)$/.test(s)) s = "peter";
  if (/^(铁虫|ironspider|starker)$/.test(s)) return p.characters.includes("&");
  return `${p.title} ${p.work} ${p.characters} ${p.version} ${p.kind}`
    .toLowerCase()
    .includes(s);
}
export function buy(
  s: State,
  p: Product,
  price: number,
  method = "直接购买",
): State {
  const current = s.products.find((x) => x.id === p.id);
  if (
    !current ||
    current.sold ||
    p.sold ||
    s.orders.some((o) => o.product.id === p.id)
  )
    throw Error("这件谷子已经被收走啦");
  if (!Number.isFinite(price) || price < 0) throw Error("成交金额无效");
  p = current;
  const shipping = s.freeShipping.includes(p.id) ? 0 : p.shipping;
  const total = price + shipping;
  if (!s.rich && s.wallet[p.market] < total)
    throw Error("虚拟余额不足，请到个人中心补充");
  return {
    ...s,
    products: s.products.map((x) => (x.id === p.id ? { ...x, sold: true } : x)),
    wallet: {
      ...s.wallet,
      [p.market]: s.rich
        ? s.wallet[p.market]
        : Math.round((s.wallet[p.market] - total) * 100) / 100,
    },
    orders: [
      {
        id: crypto.randomUUID(),
        product: p,
        paid: price,
        shipping,
        at: Date.now(),
        step: 0,
        opened: false,
        method,
        timeline: [Date.now()],
      },
      ...s.orders,
    ],
  };
}
export function settle(
  s: State,
  now = Date.now(),
  random = Math.random,
): State {
  let next = s;
  for (const [id, a] of Object.entries(s.auctions)) {
    if (a.status !== "active") continue;
    const p = next.products.find((x) => x.id === id);
    if (!p) continue;
    let b = { ...a };
    if (now >= a.end) {
      if (a.bid >= a.price && random() > 0.28) {
        try {
          next = buy(next, p, a.bid, "竞拍获得");
          b.status = "won";
          next = {
            ...next,
            events: ["恭喜！你成功拍下了梦情谷！", ...next.events].slice(0, 30),
          };
        } catch {
          b.status = "lost";
          next = {
            ...next,
            events: [
              "竞拍结算失败：虚拟余额不足或商品已售出",
              ...next.events,
            ].slice(0, 30),
          };
        }
      } else {
        b.status = "lost";
        next = {
          ...next,
          products: next.products.map((x) =>
            x.id === id ? { ...x, sold: true } : x,
          ),
          events: ["啊啊啊！梦情谷被别人拍走了！", ...next.events].slice(0, 30),
        };
      }
    } else if (now >= a.next) {
      if (random() < 0.65) {
        b.price =
          Math.round(
            (Math.max(a.price, a.bid) + Math.max(1, p.price * 0.06)) * 100,
          ) / 100;
        b.count++;
      }
      b.next = now + 8000;
    }
    next = { ...next, auctions: { ...next.auctions, [id]: b } };
  }
  return next;
}
export function parseSave(raw: string): State {
  const s = JSON.parse(raw);
  const fail = () => {
    throw Error("不是有效或受支持的谷谷市场存档");
  };
  const finite = (x: unknown) =>
    typeof x === "number" && Number.isFinite(x) && x >= 0;
  const strings = (x: unknown): x is string[] =>
    Array.isArray(x) && x.every((y) => typeof y === "string");
  const record = (x: unknown) =>
    !!x && typeof x === "object" && !Array.isArray(x);
  const product = (p: Product) =>
    record(p) &&
    typeof p.id === "string" &&
    typeof p.title === "string" &&
    typeof p.characters === "string" &&
    typeof p.work === "string" &&
    typeof p.version === "string" &&
    typeof p.kind === "string" &&
    typeof p.description === "string" &&
    typeof p.seller === "string" &&
    typeof p.location === "string" &&
    typeof p.condition === "string" &&
    markets.includes(p.market) &&
    [
      p.price,
      p.reference,
      p.original,
      p.shipping,
      p.created,
      p.seed,
      p.rating,
      p.personality,
    ].every(finite) &&
    Number.isInteger(p.rarity) &&
    p.rarity >= 0 &&
    p.rarity <= 4 &&
    [p.direct, p.auction, p.negotiable].every((x) => typeof x === "boolean") &&
    (!p.image || /^data:image\/(jpeg|png|webp);base64,/.test(p.image)) &&
    !blocked(p.title + " " + p.characters + " " + p.work + " " + p.description);
  if (
    !record(s) ||
    s.schema !== 1 ||
    !Array.isArray(s.products) ||
    s.products.length > 10000 ||
    !s.products.every(product) ||
    new Set(s.products.map((p: Product) => p.id)).size !== s.products.length
  )
    fail();
  if (
    !record(s.wallet) ||
    markets.some((m) => !finite(s.wallet[m])) ||
    !strings(s.favorites) ||
    !strings(s.freeShipping) ||
    !strings(s.events) ||
    !Array.isArray(s.orders) ||
    !Array.isArray(s.wishes)
  )
    fail();
  if (
    s.orders.some(
      (o: Order) =>
        !record(o) ||
        typeof o.id !== "string" ||
        !product(o.product) ||
        ![o.paid, o.shipping, o.at].every(finite) ||
        !Number.isInteger(o.step) ||
        o.step < 0 ||
        o.step >= steps(o.product.market).length ||
        typeof o.opened !== "boolean" ||
        typeof o.method !== "string" ||
        !Array.isArray(o.timeline) ||
        !o.timeline.every(finite),
    )
  )
    fail();
  if (
    new Set(s.orders.map((o: Order) => o.product.id)).size !== s.orders.length
  )
    fail();
  if (
    s.wishes.some(
      (w: Wish) =>
        !record(w) ||
        typeof w.id !== "string" ||
        typeof w.character !== "string" ||
        typeof w.name !== "string" ||
        !finite(w.target) ||
        !Number.isInteger(w.rarity) ||
        w.rarity < 0 ||
        w.rarity > 4 ||
        !["高", "中", "低"].includes(w.priority) ||
        blocked(w.character + " " + w.name),
    )
  )
    fail();
  if (
    !record(s.chats) ||
    Object.values(s.chats).some(
      (cs: any) =>
        !Array.isArray(cs) ||
        cs.some(
          (c: Chat) =>
            !record(c) ||
            !["me", "seller"].includes(c.by) ||
            typeof c.text !== "string",
        ),
    ) ||
    !record(s.deals) ||
    !Object.values(s.deals).every(finite)
  )
    fail();
  if (
    !record(s.auctions) ||
    Object.values(s.auctions).some(
      (a: any) =>
        !record(a) ||
        ![a.price, a.bid, a.end, a.count, a.next].every(finite) ||
        !["active", "won", "lost"].includes(a.status),
    )
  )
    fail();
  if (
    typeof s.rich !== "boolean" ||
    typeof s.dark !== "boolean" ||
    typeof s.daily !== "string" ||
    !["展示架", "痛包展示墙", "吧唧墙"].includes(s.background) ||
    !finite(s.refreshes)
  )
    fail();
  return s as State;
}
