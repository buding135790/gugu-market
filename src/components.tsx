import { useState } from "react";
import { Heart } from "lucide-react";
import { Art } from "./Art";
import {
  money,
  rarities,
  kinds,
  versions,
  generate,
  blocked,
  type Product,
  type Wish,
  type Market,
} from "./engine";
export function ProductCard({
  p,
  liked,
  favorite,
  open,
}: {
  p: Product;
  liked: boolean;
  favorite: () => void;
  open: () => void;
}) {
  return (
    <article className={`product-card ${p.sold ? "sold" : ""}`}>
      <div className="product-image">
        <button
          className="art-button"
          aria-label={`查看 ${p.title}`}
          onClick={open}
        >
          <Art p={p} />
        </button>
        <span
          className={`image-tag ${p.auction ? "auction-tag" : p.price < p.reference * 0.65 ? "deal-tag" : ""}`}
        >
          {p.sold
            ? "已收走"
            : p.auction
              ? "◷ 竞拍中"
              : p.price < p.reference * 0.65
                ? "ϟ 疑似捡漏！"
                : p.rarity >= 3
                  ? `✧ ${rarities[p.rarity]}`
                  : p.condition}
        </span>
        <button
          className={`favorite ${liked ? "liked" : ""}`}
          aria-label={liked ? "取消关注" : "关注商品"}
          onClick={favorite}
        >
          <Heart size={16} fill={liked ? "currentColor" : "none"} />
        </button>
      </div>
      <button className="product-body" onClick={open}>
        <div className="product-meta">
          {p.work === "Marvel 漫威"
            ? "MARVEL"
            : p.work.includes("Persona")
              ? "PERSONA"
              : "ORIGINAL"}{" "}
          <span>{rarities[p.rarity]}</span>
        </div>
        <h3>{p.title}</h3>
        <div className="product-labels">
          <span>{p.kind}</span>
          <span>{p.condition}</span>
        </div>
        <div className="price-row">
          <strong>{money(p.price, p.market)}</strong>
          <small>参考 {money(p.reference, p.market)}</small>
        </div>
        <div className="seller-row">
          <span className="seller-avatar">{p.seller[0]}</span>
          <span>{p.seller}</span>
          <small>★ {p.rating.toFixed(1)}</small>
        </div>
      </button>
    </article>
  );
}
export function PageTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="page-title">
      <span className="eyebrow">YOUR LITTLE WORLD OF JOY</span>
      <h1>{title}</h1>
      <p>{sub}</p>
    </div>
  );
}
export function WishForm({
  p,
  onSave,
}: {
  p?: Product;
  onSave: (w: Wish) => void;
}) {
  const [character, setCharacter] = useState(p?.characters || "Peter Parker"),
    [name, setName] = useState(p?.kind || ""),
    [target, setTarget] = useState(p?.price || 100),
    [r, setR] = useState(p?.rarity || 0),
    [priority, setPriority] = useState("高"),
    [error, setError] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (blocked(character + " " + name))
          return setError("该角色不在本市场的收录范围内。");
        onSave({
          id: crypto.randomUUID(),
          character,
          name,
          target,
          rarity: r,
          priority,
        });
      }}
    >
      <span className="eyebrow">MAKE A LITTLE WISH</span>
      <h2>写下你的梦情 ♡</h2>
      <label>
        角色
        <input
          required
          maxLength={100}
          value={character}
          onChange={(e) => setCharacter(e.target.value)}
        />
      </label>
      <label>
        商品关键词
        <input
          maxLength={100}
          placeholder="如：吧唧、Homecoming，留空匹配所有"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </label>
      <label>
        目标价格（按浏览市场币种）
        <input
          required
          type="number"
          min="1"
          value={target}
          onChange={(e) => setTarget(+e.target.value)}
        />
      </label>
      <label>
        最低稀有度
        <select value={r} onChange={(e) => setR(+e.target.value)}>
          {rarities.map((v, i) => (
            <option key={v} value={i}>
              {v}
            </option>
          ))}
        </select>
      </label>
      <label>
        优先级
        <select value={priority} onChange={(e) => setPriority(e.target.value)}>
          {["高", "中", "低"].map((v) => (
            <option key={v}>{v}</option>
          ))}
        </select>
      </label>
      {error && <p>{error}</p>}
      <button className="primary full">
        存下心愿 <Heart size={16} />
      </button>
    </form>
  );
}
export function UploadForm({
  market,
  onSave,
}: {
  market: Market;
  onSave: (p: Product) => void;
}) {
  const [image, setImage] = useState(""),
    [error, setError] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const d = new FormData(e.currentTarget);
        const title = String(d.get("title"));
        const character = String(d.get("character"));
        if (blocked(title + " " + character))
          return setError("该角色不在本市场的收录范围内。");
        if (!image) return setError("请上传一张你有权使用的图片");
        const base = generate(999)[0];
        onSave({
          ...base,
          id: crypto.randomUUID(),
          title,
          characters: character,
          work: String(d.get("work")),
          version: String(d.get("version")),
          kind: String(d.get("kind")),
          price: Number(d.get("price")),
          reference: Number(d.get("price")) * 1.25,
          original: Number(d.get("price")) * 1.4,
          image,
          market,
          seller: "我的虚拟小铺",
          auction: false,
          direct: true,
          created: Date.now(),
          rarity: Number(d.get("rarity")),
        });
      }}
    >
      <span className="eyebrow">YOUR OWN LITTLE SHOP</span>
      <h2>发布一件虚拟谷</h2>
      <p>仅上传你有权使用的图片，不会生成真实商品或订单。</p>
      <label>
        商品图片
        <input
          required
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (!f) return;
            if (!["image/png", "image/jpeg", "image/webp"].includes(f.type))
              return setError("仅支持 PNG、JPEG、WebP");
            if (f.size > 5000000) return setError("原图请小于 5 MB");
            const reader = new FileReader();
            reader.onload = () => {
              const img = new Image();
              img.onload = () => {
                const c = document.createElement("canvas");
                const ratio = Math.min(1, 700 / img.width, 700 / img.height);
                c.width = img.width * ratio;
                c.height = img.height * ratio;
                c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
                setImage(c.toDataURL("image/jpeg", 0.8));
                setError("");
              };
              img.src = String(reader.result);
            };
            reader.readAsDataURL(f);
          }}
        />
      </label>
      {image && <img className="upload-preview" src={image} alt="上传预览" />}
      <label>
        商品标题
        <input required name="title" maxLength={100} />
      </label>
      <label>
        角色
        <input required name="character" maxLength={60} />
      </label>
      <label>
        所属作品
        <select name="work">
          {["Marvel 漫威", "Persona 女神异闻录", "原创角色"].map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <label>
        版本
        <select name="version">
          {versions.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </label>
      <div className="button-row">
        <label>
          类型
          <select name="kind">
            {kinds.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </label>
        <label>
          稀有度
          <select name="rarity">
            {rarities.map((t, i) => (
              <option value={i} key={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label>
        虚拟价格 · {market}
        <input
          required
          min="1"
          max="10000000"
          step="0.01"
          type="number"
          name="price"
          defaultValue="50"
        />
      </label>
      {error && <p>{error}</p>}
      <button className="primary full">发布到 {market}</button>
    </form>
  );
}
