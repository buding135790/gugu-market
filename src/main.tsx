import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  Search,
  Heart,
  ArrowUpRight,
  ArrowRight,
  RefreshCw,
  SlidersHorizontal,
  ChevronDown,
  Package,
  Sun,
  Moon,
  X,
  Wallet,
  Plus,
  Check,
  Upload,
  Download,
  Cat,
  Gavel,
  Star,
  MessageCircle,
  ShoppingBag,
  Sparkles,
  Trash2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Art } from "./Art";
import { ProductCard, PageTitle, WishForm, UploadForm } from "./components";
import {
  initial,
  generate,
  money,
  markets,
  rarities,
  kinds,
  matches,
  blocked,
  buy,
  settle,
  steps,
  parseSave,
  type Product,
  type State,
  type Market,
} from "./engine";
import "./style.css";
const KEY = "gugu-market-v1";
function App() {
  const [s, setS] = useState<State>(() => {
    try {
      return parseSave(localStorage.getItem(KEY) || "");
    } catch {
      return initial();
    }
  });
  const state = useRef(s);
  const [market, setMarket] = useState<Market>("闲鱼"),
    [page, setPage] = useState("首页"),
    [query, setQuery] = useState(""),
    [kind, setKind] = useState("全部类型"),
    [condition, setCondition] = useState("全部成色"),
    [rarity, setRarity] = useState(-1),
    [sort, setSort] = useState("为你推荐"),
    [limit, setLimit] = useState(36),
    [selected, setSelected] = useState<string | null>(null),
    [toast, setToast] = useState(""),
    [chat, setChat] = useState(""),
    [offer, setOffer] = useState(""),
    [modal, setModal] = useState(""),
    [room, setRoom] = useState("全部"),
    [group, setGroup] = useState("获得时间"),
    [unbox, setUnbox] = useState<Product | null>(null),
    [wishAlert, setWishAlert] = useState<Product | null>(null),
    [tick, setTick] = useState(Date.now());
  function update(fn: (v: State) => State) {
    const next = fn(state.current);
    state.current = next;
    setS(next);
  }
  useEffect(() => {
    state.current = s;
    try {
      localStorage.setItem(KEY, JSON.stringify(s));
    } catch {
      setToast("存储空间不足，请导出备份并减少上传图片");
    }
    document.documentElement.dataset.theme = s.dark ? "dark" : "light";
  }, [s]);
  useEffect(() => {
    const id = setInterval(() => {
      setTick(Date.now());
      update((v) => settle(v));
    }, 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (!toast) return;
    const id = setTimeout(() => setToast(""), 4500);
    return () => clearTimeout(id);
  }, [toast]);
  useEffect(() => {
    setLimit(36);
  }, [market, page, query, kind, condition, rarity, sort]);
  useEffect(() => {
    if (!selected && !modal && !unbox) return;
    const previous = document.activeElement as HTMLElement | null;
    const id = setTimeout(() => {
      const dialogs = document.querySelectorAll<HTMLElement>("[role=dialog]");
      dialogs[dialogs.length - 1]
        ?.querySelector<HTMLElement>("button,input,select")
        ?.focus();
    }, 50);
    function keyboard(e: KeyboardEvent) {
      if (e.key === "Escape") {
        if (unbox) setUnbox(null);
        else if (modal) setModal("");
        else setSelected(null);
      }
      if (e.key === "Tab") {
        const dialogs = document.querySelectorAll<HTMLElement>("[role=dialog]");
        const d = dialogs[dialogs.length - 1];
        const f = d?.querySelectorAll<HTMLElement>(
          'button:not(:disabled),input,select,[tabindex="0"]',
        );
        if (!f?.length) return;
        const first = f[0],
          last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
    document.addEventListener("keydown", keyboard);
    return () => {
      clearTimeout(id);
      document.removeEventListener("keydown", keyboard);
      previous?.focus();
    };
  }, [selected, modal, unbox]);
  const p = s.products.find((x) => x.id === selected);
  const nav = [
    "首页",
    "最新上架",
    "漫威专区",
    "铁虫专区",
    "捡漏专区",
    "竞拍专区",
    "心愿单",
    "我的收藏",
    "个人中心",
  ];
  function go(name: string) {
    setPage(name);
    setQuery("");
    setRoom("全部");
    setSelected(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function favorite(id: string) {
    update((v) => ({
      ...v,
      favorites: v.favorites.includes(id)
        ? v.favorites.filter((x) => x !== id)
        : [...v.favorites, id],
    }));
  }
  function purchase(product: Product, price?: number) {
    try {
      update((v) =>
        buy(v, product, price ?? v.deals[product.id] ?? product.price),
      );
      setToast("收谷成功！到个人中心查看模拟物流");
      setSelected(null);
    } catch (e) {
      setToast((e as Error).message);
    }
  }
  function refresh() {
    update((v) => {
      const b = v.refreshes + 1;
      const newItems = generate(b)
        .filter((x) => x.market === market)
        .slice(
          Math.floor(Math.random() * 65),
          Math.floor(Math.random() * 4) + 78,
        )
        .slice(0, 12)
        .map((x, i) => ({
          ...x,
          created: Date.now() + i,
          rarity: Math.random() < 0.92 ? Math.min(x.rarity, 2) : x.rarity,
        }));
      const candidates = newItems.filter((x) =>
        v.wishes.some(
          (w) =>
            matches(x, w.character) &&
            matches(x, w.name) &&
            x.rarity >= w.rarity,
        ),
      );
      if (candidates.length) setWishAlert(candidates[0]);
      let products = [...newItems, ...v.products];
      const unsold = products.filter(
        (x) => !x.sold && !v.auctions[x.id] && x.market === market,
      );
      const target = unsold[Math.floor(Math.random() * unsold.length)];
      let event = `${newItems.length} 件新谷已上架，去看看今天的相遇吧`;
      if (target && Math.random() < 0.4) {
        products = products.map((x) =>
          x.id === target.id ? { ...x, price: Math.round(x.price * 0.78) } : x,
        );
        event = `${target.characters} 的${target.kind}降价了${v.favorites.includes(target.id) ? "，你关注的谷有新优惠！" : "！"}`;
      } else if (target && Math.random() < 0.2) {
        products = products.map((x) =>
          x.id === target.id ? { ...x, sold: true } : x,
        );
        event = "一件热门谷刚被虚拟买家抢先收走，下一件梦情在路上";
      }
      setToast(event);
      return {
        ...v,
        products,
        refreshes: b,
        events: [event, ...v.events].slice(0, 30),
      };
    });
  }
  function send(text: string) {
    if (!p || !text.trim()) return;
    if (blocked(text)) return setToast("该角色不在本市场的收录范围内。");
    const product = p;
    update((v) => {
      const msgs = [
        ...(v.chats[p.id] || []),
        { by: "me" as const, text: text.slice(0, 300) },
      ];
      let answer = "还在的！可以直接拍～";
      let deals = v.deals;
      let free = v.freeShipping;
      if (p.personality === 5) answer = "（卖家暂未回复，稍后再来看看吧）";
      else if (/成色/.test(text))
        answer = `${p.condition}，细节如模拟展示图所示，包装妥善。`;
      else if (/拆售/.test(text)) answer = "这套暂不拆售，希望它们一起被珍藏。";
      else if (/包邮/.test(text)) {
        if ([0, 3].includes(p.personality)) {
          free = [...new Set([...free, p.id])];
          answer = "可以的，这单给你包邮！";
        } else answer = "暂时不包邮，运费按页面显示哦。";
      } else if (/降|刀|便宜|议价|出价/.test(text)) {
        const amount = Number(text.match(/\d+(\.\d+)?/)?.[0]);
        const floor = p.price * [0.72, 0.9, 1, 0.8, 0.95, 1][p.personality];
        if (!p.negotiable) answer = "不好意思，这个已经是最低价啦。";
        else if (
          Number.isFinite(amount) &&
          amount >= floor &&
          amount < p.price
        ) {
          deals = { ...deals, [p.id]: amount };
          answer = `成交！给你保留模拟优惠价 ${money(amount, p.market)}，点击购买即可。`;
        } else
          answer = `小刀可以，大刀不行TT，最低 ${money(Math.ceil(floor), p.market)}。`;
      } else if (/购买|确认/.test(text))
        answer = "好的，点击下方购买按钮就能生成虚拟订单！";
      return {
        ...v,
        chats: {
          ...v.chats,
          [product.id]: [...msgs, { by: "seller" as const, text: answer }],
        },
        deals,
        freeShipping: free,
      };
    });
    setChat("");
  }
  function bid() {
    if (!p) return;
    const a = s.auctions[p.id];
    if (a && a.status !== "active") return setToast("这场竞拍已经结束");
    const min =
      Math.round(((a?.price ?? p.price) + Math.max(1, p.price * 0.06)) * 100) /
      100;
    const n = Number(offer) || min;
    if (!Number.isFinite(n) || n < min)
      return setToast(`本次至少出价 ${money(min, p.market)}`);
    if (!s.rich && s.wallet[p.market] < n + p.shipping)
      return setToast("虚拟余额不足，请先补充");
    update((v) => ({
      ...v,
      auctions: {
        ...v.auctions,
        [p.id]: {
          price: n,
          bid: n,
          end: a?.end ?? Date.now() + 45000,
          count: (a?.count ?? 2) + 1,
          status: "active",
          next: Date.now() + 8000,
        },
      },
    }));
    setOffer("");
    setToast("出价成功！45 秒内模拟买家可能加价，结束时自动结算");
  }
  const products = s.products.filter(
    (x) =>
      x.market === market &&
      matches(x, query) &&
      (kind === "全部类型" || x.kind === kind) &&
      (condition === "全部成色" || x.condition === condition) &&
      (rarity < 0 || x.rarity === rarity) &&
      (page !== "漫威专区" || x.work === "Marvel 漫威") &&
      (page !== "铁虫专区" ||
        x.characters.includes("Tony") ||
        x.characters.includes("Peter")) &&
      (page !== "捡漏专区" || x.price < x.reference * 0.65) &&
      (page !== "竞拍专区" || x.auction),
  );
  products.sort((a, b) =>
    sort === "价格从低到高"
      ? a.price - b.price
      : sort === "价格从高到低"
        ? b.price - a.price
        : sort === "稀有度优先"
          ? b.rarity - a.rarity
          : sort === "最新上架" || page === "最新上架"
            ? b.created - a.created
            : 0,
  );
  const collected = s.orders.filter((o) => o.opened);
  let collection = collected.filter(
    (o) =>
      room === "全部" ||
      (room === "Tony 单人"
        ? o.product.characters === "Tony Stark"
        : room === "Peter 单人"
          ? o.product.characters === "Peter Parker"
          : o.product.characters.includes("&")),
  );
  collection = collection.filter(
    (o) =>
      matches(o.product, query) &&
      (kind === "全部类型" || o.product.kind === kind) &&
      (rarity < 0 || o.product.rarity === rarity),
  );
  collection.sort((a, b) =>
    group === "角色"
      ? a.product.characters.localeCompare(b.product.characters)
      : group === "作品"
        ? a.product.work.localeCompare(b.product.work)
        : group === "类型"
          ? a.product.kind.localeCompare(b.product.kind)
          : group === "稀有度"
            ? b.product.rarity - a.product.rarity
            : b.at - a.at,
  );

  return (
    <>
      <div className="announcement">
        一间只收藏快乐的虚拟中古小店{" "}
        <span>✦ 所有交易均为模拟 · 无真实支付</span>
      </div>
      <header>
        <div className="header-main wrap">
          <button className="brand" onClick={() => go("首页")}>
            <span className="brand-icon">
              <Cat size={32} />
            </span>
            <span>
              GUGU MARKET<small>今天也要收获梦情谷 ♡</small>
            </span>
          </button>
          <div className="market-switch">
            {markets.map((m) => (
              <button
                key={m}
                className={market === m ? "active" : ""}
                onClick={() => setMarket(m)}
              >
                {m === "闲鱼"
                  ? "闲鱼 · 国内"
                  : m === "Mercari"
                    ? "Mercari · 日本"
                    : "eBay · 全球"}
              </button>
            ))}
          </div>
          <div className="header-actions">
            <button
              aria-label="切换明暗主题"
              onClick={() => update((v) => ({ ...v, dark: !v.dark }))}
            >
              {s.dark ? <Sun size={19} /> : <Moon size={19} />}
            </button>
            <button className="wallet-chip" onClick={() => go("个人中心")}>
              <Wallet size={17} />
              {s.rich ? "∞" : money(s.wallet[market], market)}
            </button>
            <button className="avatar" onClick={() => go("个人中心")}>
              谷
            </button>
          </div>
        </div>
        <nav className="wrap">
          {nav.map((n) => (
            <button
              onClick={() => go(n)}
              className={page === n ? "active" : ""}
              key={n}
            >
              {n}
              {n === "铁虫专区" && <span className="tiny">HOT</span>}
            </button>
          ))}
        </nav>
      </header>
      <main className="wrap">
        <div className="breadcrumb">
          谷谷市场 <span>/</span> {page}{" "}
          <span className="right">EST. 2026 · COLLECT YOUR LITTLE JOYS</span>
        </div>
        {[
          "首页",
          "最新上架",
          "漫威专区",
          "铁虫专区",
          "捡漏专区",
          "竞拍专区",
        ].includes(page) && (
          <>
            <section className="hero">
              <div className="hero-copy">
                <div className="eyebrow">THE LITTLE THINGS WE LOVE</div>
                <h1>
                  让热爱，
                  <br />
                  有一个<span>小小的家。</span>
                </h1>
                <p>
                  从一枚吧唧，到一整个梦情收藏柜。
                  <br />
                  在这里，喜欢不用考虑预算。
                </p>
                <button
                  className="primary"
                  onClick={() => {
                    setPage("铁虫专区");
                    document
                      .getElementById("market")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  去收获今天的梦情 <ArrowUpRight size={17} />
                </button>
                <div className="hero-note">
                  ✧ 虚拟金币已到账，今天也要开心收谷
                </div>
              </div>
              <div className="hero-art">
                <div className="paper-note">
                  DEAR COLLECTOR,
                  <br />
                  <strong>
                    Every little love
                    <br />
                    deserves a home.
                  </strong>
                  <span>♡ GUGU MARKET</span>
                </div>
                <div className="hero-item one">
                  <Art
                    p={
                      s.products.find(
                        (x) =>
                          x.characters === "Tony Stark" && x.kind === "吧唧",
                      ) || s.products[61]
                    }
                  />
                  <span>我的钢铁之心 ♥</span>
                </div>
                <div className="hero-item two">
                  <Art
                    p={
                      s.products.find(
                        (x) =>
                          x.characters === "Peter Parker" &&
                          x.kind === "亚克力立牌",
                      ) || s.products[62]
                    }
                  />
                  <span>YOUR FRIENDLY NEIGHBOR</span>
                </div>
                <div className="hero-stamp">
                  100%
                  <br />
                  <small>虚拟 / 快乐无价</small>
                </div>
                <span className="sparkle">✧</span>
              </div>
            </section>
            <div className="quick-categories">
              {[
                ["✦", "漫威收藏宇宙", "Marvel Universe", "漫威专区"],
                ["♡", "铁虫的并肩时刻", "Iron Man × Spider-Man", "铁虫专区"],
                ["ϟ", "今天也有小惊喜", "Lucky finds", "捡漏专区"],
                ["♧", "梦情争夺进行中", "Auctions & rarities", "竞拍专区"],
              ].map(([icon, title, sub, target]) => (
                <button key={title} onClick={() => go(target)}>
                  <span className="category-icon">{icon}</span>
                  <span>
                    <strong>{title}</strong>
                    <small>{sub}</small>
                  </span>
                  <ArrowUpRight size={18} />
                </button>
              ))}
            </div>
            <section id="market">
              <div className="section-title">
                <div>
                  <span className="eyebrow">FIND YOUR NEXT FAVORITE</span>
                  <h2>
                    {page === "首页" ? "逛逛今日谷市" : page}{" "}
                    <span className="count">{products.length} 件宝藏</span>
                  </h2>
                </div>
                <button className="outline" onClick={refresh}>
                  <RefreshCw size={15} /> 刷新蹲谷{" "}
                  <span className="desktop">· 看看新上架</span>
                </button>
              </div>
              <div className="search-row">
                <label className="search">
                  <Search size={20} />
                  <input
                    placeholder="搜一搜角色、作品或你的梦情谷…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                  {query && (
                    <button aria-label="清除搜索" onClick={() => setQuery("")}>
                      <X size={16} />
                    </button>
                  )}
                </label>
                <button className="primary" onClick={() => setLimit(36)}>
                  搜索
                </button>
                <button className="outline" onClick={() => setModal("upload")}>
                  <Plus size={18} /> 发布虚拟谷
                </button>
              </div>
              <div className="hot-search">
                <span>大家都在搜</span>
                {[
                  "Tony Stark",
                  "Peter Parker",
                  "铁虫",
                  "经典装甲",
                  "Homecoming",
                  "Joker",
                ].map((q) => (
                  <button key={q} onClick={() => setQuery(q)}>
                    {q}
                  </button>
                ))}
              </div>
              <div className="filters">
                <div>
                  <SlidersHorizontal size={16} />
                  <select
                    aria-label="商品类型"
                    value={kind}
                    onChange={(e) => setKind(e.target.value)}
                  >
                    {["全部类型", ...kinds].map((k) => (
                      <option key={k}>{k}</option>
                    ))}
                  </select>
                  <select
                    aria-label="成色"
                    value={condition}
                    onChange={(e) => setCondition(e.target.value)}
                  >
                    {["全部成色", "全新未拆", "近全新", "轻微使用痕迹"].map(
                      (k) => (
                        <option key={k}>{k}</option>
                      ),
                    )}
                  </select>
                  <select
                    aria-label="稀有度"
                    value={rarity}
                    onChange={(e) => setRarity(+e.target.value)}
                  >
                    <option value={-1}>全部稀有度</option>
                    {rarities.map((r, i) => (
                      <option key={r} value={i}>
                        {r}
                      </option>
                    ))}
                  </select>
                </div>
                <select
                  aria-label="排序"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  {[
                    "为你推荐",
                    "最新上架",
                    "价格从低到高",
                    "价格从高到低",
                    "稀有度优先",
                  ].map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </select>
              </div>
              {page === "铁虫专区" && (
                <div className="room-tabs">
                  {[
                    "Tony Stark",
                    "Peter Parker",
                    "铁虫",
                    "Civil War",
                    "Avengers",
                    "漫画",
                    "双人亚克力立牌",
                    "色纸",
                    "吧唧",
                    "拍立得",
                    "海报",
                    "同人制品",
                  ].map((t) => (
                    <button key={t} onClick={() => setQuery(t)}>
                      {t === "铁虫" ? "Tony & Peter 双人谷" : t}
                    </button>
                  ))}
                </div>
              )}
              {blocked(query) ? (
                <div className="empty">该角色不在本市场的收录范围内。</div>
              ) : (
                <div className="product-grid">
                  {products.slice(0, limit).map((x) => (
                    <ProductCard
                      key={x.id}
                      p={x}
                      liked={s.favorites.includes(x.id)}
                      favorite={() => favorite(x.id)}
                      open={() => {
                        setSelected(x.id);
                        setOffer("");
                      }}
                    />
                  ))}
                </div>
              )}
              {!blocked(query) && !products.length && (
                <div className="empty">
                  <Cat /> 没找到这件梦情，换个关键词试试吧。
                </div>
              )}
              {limit < products.length && (
                <button
                  className="load-more outline"
                  onClick={() => setLimit((v) => v + 36)}
                >
                  再逛一会儿 <ChevronDown size={16} />
                </button>
              )}
            </section>
          </>
        )}
        {page === "我的收藏" && (
          <>
            <PageTitle
              title="我的小小收藏室"
              sub="每一份热爱，都值得好好安放。"
            />
            <div className="room-banner">
              <Cat size={50} />
              <div>
                <h2>Tony & Peter 收藏室</h2>
                <p>独立的光芒，并肩的羁绊。这里收藏每一次心动。</p>
              </div>
              <select
                aria-label="展示背景"
                value={s.background}
                onChange={(e) =>
                  update((v) => ({ ...v, background: e.target.value }))
                }
              >
                {["展示架", "痛包展示墙", "吧唧墙"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className="room-tabs">
              {["全部", "Tony 单人", "Peter 单人", "铁虫双人"].map((t) => (
                <button
                  className={room === t ? "active" : ""}
                  key={t}
                  onClick={() => setRoom(t)}
                >
                  {t}
                </button>
              ))}
            </div>
            <div className="filters">
              <input
                aria-label="搜索收藏"
                placeholder="搜索收藏角色 / 作品"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <select
                aria-label="收藏类型"
                value={kind}
                onChange={(e) => setKind(e.target.value)}
              >
                {["全部类型", ...kinds].map((k) => (
                  <option key={k}>{k}</option>
                ))}
              </select>
              <select
                aria-label="收藏稀有度"
                value={rarity}
                onChange={(e) => setRarity(+e.target.value)}
              >
                <option value={-1}>全部稀有度</option>
                {rarities.map((r, i) => (
                  <option value={i} key={r}>
                    {r}
                  </option>
                ))}
              </select>
              <select
                aria-label="收藏分类"
                value={group}
                onChange={(e) => setGroup(e.target.value)}
              >
                {["获得时间", "角色", "作品", "类型", "稀有度"].map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
            </div>
            <div className={`product-grid collection bg-${s.background}`}>
              {collection.map((o) => (
                <div key={o.id}>
                  <ProductCard
                    p={o.product}
                    liked={s.favorites.includes(o.product.id)}
                    favorite={() => favorite(o.product.id)}
                    open={() => setSelected(o.product.id)}
                  />
                  <div className="collection-caption">
                    {new Date(o.at).toLocaleDateString()} · {o.method}
                    <br />
                    成交 {money(o.paid, o.product.market)} ·{" "}
                    {rarities[o.product.rarity]}
                  </div>
                </div>
              ))}
            </div>
            {!collection.length && (
              <div className="empty">
                <Package size={36} />
                <h3>收藏架在等你的第一件谷</h3>
                <p>购买后前往个人中心，加速物流并拆箱即可入柜。</p>
                <button className="primary" onClick={() => go("首页")}>
                  去谷市逛逛 <ArrowRight size={16} />
                </button>
              </div>
            )}
            <PageTitle title="我关注的谷" sub="先存下心动，再慢慢相遇。" />
            <div className="product-grid">
              {s.products
                .filter((x) => s.favorites.includes(x.id))
                .map((x) => (
                  <ProductCard
                    key={x.id}
                    p={x}
                    liked
                    favorite={() => favorite(x.id)}
                    open={() => setSelected(x.id)}
                  />
                ))}
            </div>
          </>
        )}
        {page === "心愿单" && (
          <>
            <PageTitle
              title="梦情谷心愿单"
              sub="把想念写下来，下次上架时告诉你。"
            />
            <button className="primary" onClick={() => setModal("wish")}>
              <Plus size={16} /> 添加梦情
            </button>
            <div className="wish-grid">
              {s.wishes.map((w) => (
                <article className="wish-card" key={w.id}>
                  <Heart size={26} />
                  <span className="tag">{w.priority}优先级</span>
                  <h3>{w.name || "所有周边"}</h3>
                  <p>
                    {w.character} · {rarities[w.rarity]}及以上
                  </p>
                  <p>
                    目标价 ≤ {money(w.target, market)}{" "}
                    <small>（按当前市场币种匹配）</small>
                  </p>
                  <button
                    className="outline"
                    onClick={() => {
                      setPage("首页");
                      setQuery(w.character);
                      setSort("价格从低到高");
                    }}
                  >
                    去寻找 <ArrowRight size={15} />
                  </button>
                  <button
                    className="icon-button"
                    aria-label="删除心愿"
                    onClick={() =>
                      update((v) => ({
                        ...v,
                        wishes: v.wishes.filter((x) => x.id !== w.id),
                      }))
                    }
                  >
                    <Trash2 size={17} />
                  </button>
                </article>
              ))}
            </div>
            {!s.wishes.length && (
              <div className="empty">
                还没有写下心愿，给下一次相遇留个位置吧。
              </div>
            )}
          </>
        )}
        {page === "个人中心" && (
          <>
            <PageTitle
              title="你好，梦情收藏家 ♡"
              sub="快乐无价，热爱永远不需要预算。"
            />
            <div className="profile-grid">
              <section className="panel">
                <h3>
                  <Wallet size={20} /> 我的虚拟钱包
                </h3>
                <div className="wallets">
                  {markets.map((m) => (
                    <div key={m}>
                      <small>
                        {m} /{" "}
                        {m === "闲鱼" ? "CNY" : m === "Mercari" ? "JPY" : "USD"}
                      </small>
                      <strong>{s.rich ? "∞" : money(s.wallet[m], m)}</strong>
                      <button
                        className="text-button"
                        onClick={() => {
                          update((v) => ({
                            ...v,
                            wallet: {
                              ...v.wallet,
                              [m]:
                                v.wallet[m] +
                                (m === "Mercari"
                                  ? 100000
                                  : m === "闲鱼"
                                    ? 5000
                                    : 1000),
                            },
                          }));
                          setToast("虚拟金币已补充，不涉及真实充值");
                        }}
                      >
                        免费补充 <Plus size={14} />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="button-row">
                  <button
                    className="outline"
                    disabled={
                      s.daily === new Date().toLocaleDateString("sv-SE")
                    }
                    onClick={() =>
                      update((v) => ({
                        ...v,
                        daily: new Date().toLocaleDateString("sv-SE"),
                        wallet: {
                          闲鱼: v.wallet.闲鱼 + 500,
                          Mercari: v.wallet.Mercari + 10000,
                          eBay: v.wallet.eBay + 100,
                        },
                      }))
                    }
                  >
                    {s.daily === new Date().toLocaleDateString("sv-SE")
                      ? "今日已领取"
                      : "领取每日金币"}
                  </button>
                  <button
                    className={s.rich ? "primary" : "outline"}
                    onClick={() => update((v) => ({ ...v, rich: !v.rich }))}
                  >
                    ♛ 富婆模式 {s.rich ? "已开启" : "未开启"}
                  </button>
                </div>
                <small>全部为游戏货币，没有真实支付或充值入口。</small>
              </section>
              <section className="panel">
                <h3>
                  <Sparkles size={20} /> 收谷手账
                </h3>
                <div className="stats">
                  <div>
                    <strong>
                      {
                        s.orders.filter(
                          (o) =>
                            new Date(o.at).toDateString() ===
                            new Date().toDateString(),
                        ).length
                      }
                    </strong>
                    <small>今日收谷</small>
                  </div>
                  <div>
                    <strong>{s.orders.length}</strong>
                    <small>累计收谷</small>
                  </div>
                  <div>
                    <strong>{collected.length}</strong>
                    <small>已开箱收藏</small>
                  </div>
                  <div>
                    <strong>{s.favorites.length}</strong>
                    <small>关注的谷</small>
                  </div>
                </div>
                {markets.map((m) => (
                  <p className="stat-line" key={m}>
                    {m}消费{" "}
                    <b>
                      {money(
                        s.orders
                          .filter((o) => o.product.market === m)
                          .reduce((n, o) => n + o.paid + o.shipping, 0),
                        m,
                      )}
                    </b>
                    <br />
                    <small>
                      收藏估值{" "}
                      {money(
                        collected
                          .filter((o) => o.product.market === m)
                          .reduce((n, o) => n + o.product.reference, 0),
                        m,
                      )}{" "}
                      · 累计节省{" "}
                      {money(
                        s.orders
                          .filter((o) => o.product.market === m)
                          .reduce(
                            (n, o) =>
                              n + Math.max(0, o.product.reference - o.paid),
                            0,
                          ),
                        m,
                      )}
                    </small>
                  </p>
                ))}
                <p>
                  最喜欢的角色：
                  {Object.entries(
                    collected.reduce<Record<string, number>>(
                      (a, o) => ({
                        ...a,
                        [o.product.characters]:
                          (a[o.product.characters] || 0) + 1,
                      }),
                      {},
                    ),
                  ).sort((a, b) => b[1] - a[1])[0]?.[0] || "等待第一件收藏"}
                </p>
                {(() => {
                  const norm = (n: number, m: Market) =>
                    n * (m === "Mercari" ? 0.05 : m === "eBay" ? 7 : 1);
                  const most = [...collected].sort(
                    (a, b) =>
                      norm(b.paid, b.product.market) -
                      norm(a.paid, a.product.market),
                  )[0];
                  const deal = [...s.orders].sort(
                    (a, b) =>
                      a.paid / a.product.reference -
                      b.paid / b.product.reference,
                  )[0];
                  return (
                    <small>
                      最昂贵的收藏：
                      {most
                        ? `${most.product.characters} ${most.product.kind} ${money(most.paid, most.product.market)}`
                        : "暂无"}
                      <br />
                      最佳捡漏：
                      {deal
                        ? `${deal.product.kind}，参考价的 ${Math.round((deal.paid / deal.product.reference) * 100)}%`
                        : "暂无"}
                      <br />
                      跨市场比较仅使用模拟汇率 JPY×0.05、USD×7。
                    </small>
                  );
                })()}
              </section>
            </div>
            <PageTitle
              title="我的模拟包裹"
              sub="从下单到拆箱，每一步都是小小的期待。"
            />
            {!s.orders.length && (
              <div className="empty">还没有包裹，去收一件喜欢的谷吧。</div>
            )}
            <div className="orders">
              {s.orders.map((o) => (
                <article className="order" key={o.id}>
                  <div className="order-image">
                    <Art p={o.product} />
                  </div>
                  <div className="order-main">
                    <small>
                      {o.id.slice(0, 8)} · {new Date(o.at).toLocaleString()} ·{" "}
                      {o.method}
                    </small>
                    <h3>{o.product.title}</h3>
                    <p>
                      {money(o.paid + o.shipping, o.product.market)}{" "}
                      <small>
                        含模拟运费 {money(o.shipping, o.product.market)}
                      </small>
                    </p>
                    <div className="timeline">
                      {steps(o.product.market).map((t, i) => (
                        <span key={t} className={i <= o.step ? "done" : ""}>
                          <i />
                          {t}
                          {o.timeline[i] && (
                            <small>
                              {new Date(o.timeline[i]).toLocaleTimeString()}
                            </small>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="order-actions">
                    {o.step < steps(o.product.market).length - 1 ? (
                      <button
                        className="primary"
                        onClick={() =>
                          update((v) => ({
                            ...v,
                            orders: v.orders.map((x) =>
                              x.id === o.id
                                ? {
                                    ...x,
                                    step: x.step + 1,
                                    timeline: [...x.timeline, Date.now()],
                                  }
                                : x,
                            ),
                          }))
                        }
                      >
                        加速物流 <ArrowRight size={15} />
                      </button>
                    ) : !o.opened ? (
                      <button
                        className="primary"
                        onClick={() => {
                          update((v) => ({
                            ...v,
                            orders: v.orders.map((x) =>
                              x.id === o.id ? { ...x, opened: true } : x,
                            ),
                          }));
                          setUnbox(o.product);
                        }}
                      >
                        拆开我的谷！ <Package size={16} />
                      </button>
                    ) : (
                      <button
                        className="outline"
                        onClick={() => go("我的收藏")}
                      >
                        <Check size={15} /> 已入收藏柜
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
            <PageTitle title="收藏成就" sub="属于你的每一个小小里程碑。" />
            <div className="achievement-grid">
              {[
                [
                  "钢铁之心",
                  20,
                  collected.filter((o) => o.product.characters.includes("Tony"))
                    .length,
                ],
                [
                  "友好邻居",
                  20,
                  collected.filter((o) =>
                    o.product.characters.includes("Peter"),
                  ).length,
                ],
                [
                  "双倍天才",
                  30,
                  collected.filter((o) => o.product.characters.includes("&"))
                    .length,
                ],
                [
                  "梦情谷猎人",
                  5,
                  collected.filter((o) => o.product.rarity === 4).length,
                ],
                [
                  "中古市场传说",
                  50,
                  collected.filter((o) => o.paid < o.product.reference * 0.65)
                    .length,
                ],
              ].map(([name, target, n]) => (
                <div
                  className={`achievement ${Number(n) >= Number(target) ? "unlocked" : ""}`}
                  key={name}
                >
                  <Star size={24} />
                  <strong>{name}</strong>
                  <small>
                    {n} / {target}{" "}
                    {Number(n) >= Number(target) ? "· 已达成" : "· 收集中"}
                  </small>
                  <progress value={Number(n)} max={Number(target)} />
                </div>
              ))}
            </div>
            <div className="profile-grid">
              <section className="panel">
                <h3>市场动态 & 竞拍记录</h3>
                {s.events.slice(0, 7).map((e, i) => (
                  <p className="event" key={i}>
                    ✧ {e}
                  </p>
                ))}
                {Object.entries(s.auctions).map(([id, a]) => (
                  <p className="event" key={id}>
                    {s.products.find((x) => x.id === id)?.characters} ·{" "}
                    {a.status === "active"
                      ? "竞拍中"
                      : a.status === "won"
                        ? "胜出"
                        : "未中标"}{" "}
                    · 我的出价 {a.bid}
                  </p>
                ))}
              </section>
              <section className="panel">
                <h3>存档小管家</h3>
                <p>数据保存在当前浏览器，请定期备份。导入将替换当前存档。</p>
                <div className="button-row">
                  <button
                    className="outline"
                    onClick={() => {
                      const url = URL.createObjectURL(
                        new Blob([JSON.stringify(s)], {
                          type: "application/json",
                        }),
                      );
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `gugu-save-${Date.now()}.json`;
                      a.click();
                      setTimeout(() => URL.revokeObjectURL(url), 1000);
                    }}
                  >
                    <Download size={16} /> 导出存档
                  </button>
                  <label className="outline file-button">
                    <Upload size={16} /> 导入存档
                    <input
                      type="file"
                      accept="application/json"
                      onChange={async (e) => {
                        const f = e.target.files?.[0];
                        if (!f) return;
                        try {
                          if (f.size > 15000000) throw Error("存档文件过大");
                          const next = parseSave(await f.text());
                          if (confirm("导入将覆盖当前存档，确定继续吗？")) {
                            update(() => next);
                            setToast("存档已恢复");
                          }
                        } catch (err) {
                          setToast((err as Error).message);
                        }
                        e.target.value = "";
                      }}
                    />
                  </label>
                </div>
              </section>
            </div>
          </>
        )}
        <footer>
          <div className="footer-brand">
            <Cat size={24} /> GUGU MARKET <span>谷谷市场</span>
          </div>
          <p>今天也要把梦情谷带回家！</p>
          <small>
            完全虚拟的收藏模拟游戏 · 无真实支付 · 无真实卖家 · 无实物订单
            <br />
            商品图片为原创模拟插画，与官方商品无关联。所有数据仅保存在你的浏览器。
          </small>
          <div className="footer-bottom">
            MADE FOR THE THINGS YOU LOVE{" "}
            <span>♡ COLLECT JOY, NOT PRESSURE.</span>
          </div>
        </footer>
      </main>
      <AnimatePresence>
        {p && (
          <motion.div
            className="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-label="商品详情"
              className="detail-modal"
              initial={{ y: 30 }}
              animate={{ y: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="close"
                aria-label="关闭详情"
                onClick={() => setSelected(null)}
              >
                <X />
              </button>
              <div className="detail-art">
                <Art p={p} />
                <div className="detail-tags">
                  <span className="tag">{p.work}</span>
                  <span className="tag">{rarities[p.rarity]}</span>
                  <span className="tag">{p.condition}</span>
                </div>
                <p className="simulation">
                  ✧ 虚拟模拟物品，无实物、不产生真实订单。
                </p>
                <p>{p.description}</p>
                <dl>
                  <dt>角色</dt>
                  <dd>{p.characters}</dd>
                  <dt>版本 / 系列</dt>
                  <dd>{p.version}</dd>
                  <dt>卖家</dt>
                  <dd>
                    {p.seller} · ★ {p.rating.toFixed(1)} · {p.location}
                  </dd>
                  <dt>发布时间</dt>
                  <dd>{new Date(p.created).toLocaleString()}</dd>
                  <dt>原价 / 参考价</dt>
                  <dd>
                    {money(p.original, p.market)} /{" "}
                    {money(p.reference, p.market)}
                  </dd>
                  <dt>议价 / 直接购买</dt>
                  <dd>
                    {p.negotiable ? "支持议价" : "不议价"} /{" "}
                    {p.direct ? "可以直接拍" : "仅参与竞拍"}
                  </dd>
                </dl>
              </div>
              <div className="detail-info">
                <span className="eyebrow">A LITTLE JOY, JUST FOR YOU</span>
                <h2>{p.title}</h2>
                <div className="detail-price">
                  {money(s.deals[p.id] ?? p.price, p.market)}{" "}
                  <small>
                    +{" "}
                    {money(
                      s.freeShipping.includes(p.id) ? 0 : p.shipping,
                      p.market,
                    )}{" "}
                    模拟运费
                  </small>
                </div>
                {s.deals[p.id] && <p className="deal-note">已享专属议价优惠</p>}
                <div className="button-row">
                  <button className="outline" onClick={() => favorite(p.id)}>
                    <Heart
                      size={16}
                      fill={
                        s.favorites.includes(p.id) ? "currentColor" : "none"
                      }
                    />
                    {s.favorites.includes(p.id) ? "已关注" : "关注谷子"}
                  </button>
                  <button
                    className="outline"
                    onClick={() => {
                      setModal("wish");
                    }}
                  >
                    加入心愿单
                  </button>
                </div>
                {s.orders.find((o) => o.product.id === p.id) && (
                  <div className="owned-note">
                    收于{" "}
                    {new Date(
                      s.orders.find((o) => o.product.id === p.id)!.at,
                    ).toLocaleDateString()}{" "}
                    · 成交{" "}
                    {money(
                      s.orders.find((o) => o.product.id === p.id)!.paid,
                      p.market,
                    )}{" "}
                    · {s.orders.find((o) => o.product.id === p.id)!.method}
                  </div>
                )}
                {p.auction ? (
                  <div className="auction-box">
                    <h3>
                      <Gavel size={18} /> 模拟竞拍
                    </h3>
                    <p>
                      当前出价{" "}
                      <strong>
                        {money(s.auctions[p.id]?.price ?? p.price, p.market)}
                      </strong>
                    </p>
                    <small>
                      起拍 {money(p.price, p.market)} · 加价幅度{" "}
                      {money(Math.max(1, p.price * 0.06), p.market)} ·{" "}
                      {s.auctions[p.id]?.count ?? 2} 人参与
                    </small>
                    <p>
                      {s.auctions[p.id]
                        ? s.auctions[p.id].status === "active"
                          ? `剩余 ${Math.max(0, Math.ceil((s.auctions[p.id].end - tick) / 1000))} 秒 · ${s.auctions[p.id].bid >= s.auctions[p.id].price ? "你暂时领先" : "模拟买家已加价"}`
                          : s.auctions[p.id].status === "won"
                            ? "恭喜！你成功拍下了梦情谷！"
                            : "啊啊啊！梦情谷被别人拍走了！"
                        : "首次出价开启 45 秒模拟竞拍"}
                    </p>
                    <input
                      type="number"
                      aria-label="竞拍出价"
                      placeholder="输入出价，留空按最低加价"
                      value={offer}
                      onChange={(e) => setOffer(e.target.value)}
                    />
                    <button
                      className="primary full"
                      disabled={
                        p.sold ||
                        (!!s.auctions[p.id] &&
                          s.auctions[p.id].status !== "active")
                      }
                      onClick={bid}
                    >
                      参与虚拟竞拍
                    </button>
                    <small>
                      结束时自动结算，仅胜出扣款；请保持页面打开或返回时结算。
                    </small>
                  </div>
                ) : (
                  <button
                    className="primary full buy-button"
                    disabled={p.sold}
                    onClick={() => purchase(p)}
                  >
                    <ShoppingBag size={18} />
                    {p.sold ? "已被收走" : "确认购买 · 仅使用虚拟金币"}
                  </button>
                )}
                <div className="chat-box">
                  <h3>
                    <MessageCircle size={17} /> 和 {p.seller} 聊一聊{" "}
                    <small>模拟卖家</small>
                  </h3>
                  <div className="chat-log">
                    {(
                      s.chats[p.id] || [
                        {
                          by: "seller",
                          text: "你好，欢迎来看谷！有问题可以问我～",
                        },
                      ]
                    ).map((c, i) => (
                      <div className={`bubble ${c.by}`} key={i}>
                        {c.text}
                      </div>
                    ))}
                  </div>
                  <div className="chat-presets">
                    {[
                      "还在吗？",
                      "询问成色",
                      "可以包邮吗？",
                      "可以拆售吗？",
                      "确认购买",
                    ].map((t) => (
                      <button key={t} onClick={() => send(t)}>
                        {t}
                      </button>
                    ))}
                  </div>
                  <div className="chat-input">
                    <input
                      aria-label="模拟聊天消息"
                      placeholder="输入消息，议价请写：降价 80"
                      value={chat}
                      onChange={(e) => setChat(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") send(chat);
                      }}
                    />
                    <button className="primary" onClick={() => send(chat)}>
                      发送
                    </button>
                  </div>
                </div>
              </div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
      {modal && (
        <div className="modal-backdrop higher" onClick={() => setModal("")}>
          <section
            role="dialog"
            aria-modal="true"
            aria-label={modal === "wish" ? "添加心愿" : "发布虚拟商品"}
            className="form-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              aria-label="关闭窗口"
              className="close"
              onClick={() => setModal("")}
            >
              <X />
            </button>
            {modal === "wish" ? (
              <WishForm
                p={p}
                onSave={(w) => {
                  update((v) => ({ ...v, wishes: [w, ...v.wishes] }));
                  setModal("");
                  setToast("梦情已记下，市场刷新时会检查匹配的商品");
                }}
              />
            ) : (
              <UploadForm
                market={market}
                onSave={(product) => {
                  update((v) => ({ ...v, products: [product, ...v.products] }));
                  setModal("");
                  setToast("虚拟商品已上架！");
                  setPage("最新上架");
                }}
              />
            )}
          </section>
        </div>
      )}
      <AnimatePresence>
        {unbox && (
          <motion.div
            className="modal-backdrop unboxing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-label="开箱成功"
              className="unbox-card"
              initial={{ scale: 0.5, rotate: -8 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring" }}
            >
              <div className={`celebration rarity-${unbox.rarity}`}>
                {unbox.rarity >= 4
                  ? "✦ ✧ ✦ ✧ ✦"
                  : unbox.rarity >= 2
                    ? "★ ✧ ★ ✧ ★"
                    : "✧ ♡ ✧"}
              </div>
              <span className="eyebrow">A LITTLE HAPPINESS, UNBOXED</span>
              <h2>{unbox.rarity === 4 ? "梦情成真！" : "是属于你的快乐！"}</h2>
              <Art p={unbox} />
              <h3>
                {unbox.characters} · {unbox.kind}
              </h3>
              <p>{rarities[unbox.rarity]} · 已放入收藏柜</p>
              <button
                className="primary"
                onClick={() => {
                  setUnbox(null);
                  go("我的收藏");
                }}
              >
                去我的收藏室 <ArrowRight size={17} />
              </button>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
      {wishAlert && (
        <div className="wish-alert">
          <button
            className="close"
            aria-label="关闭提醒"
            onClick={() => setWishAlert(null)}
          >
            <X size={16} />
          </button>
          <Sparkles />
          <h3>你的梦情谷上架啦！！</h3>
          <p>{wishAlert.title}</p>
          <strong>{money(wishAlert.price, wishAlert.market)}</strong>
          <small>
            参考价 {money(wishAlert.reference, wishAlert.market)} ·{" "}
            {wishAlert.seller}
          </small>
          {s.wishes.some(
            (w) =>
              matches(wishAlert, w.character) &&
              matches(wishAlert, w.name) &&
              wishAlert.price <= w.target,
          ) && <p className="deal-note">⚡ 低于目标价格，捡漏好时机！</p>}
          <button
            className="primary"
            onClick={() => {
              setSelected(wishAlert.id);
              setWishAlert(null);
            }}
          >
            立即查看
          </button>
        </div>
      )}
      <AnimatePresence>
        {toast && (
          <motion.div
            role="status"
            className="toast"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <Check size={17} />
            {toast}
          </motion.div>
        )}
      </AnimatePresence>
      <button
        className="floating-refresh"
        aria-label="刷新市场"
        onClick={refresh}
      >
        <RefreshCw size={20} />
        <small>蹲一蹲</small>
      </button>
    </>
  );
}
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
