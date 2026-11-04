import { test } from "node:test";
import assert from "node:assert/strict";
import {
  initial,
  generate,
  buy,
  settle,
  matches,
  blocked,
  parseSave,
  steps,
} from "./engine";
test("初始数据满足配比且三个市场独立", () => {
  const p = generate();
  assert.equal(p.length, 270);
  const marvel = p.filter((x) => x.work === "Marvel 漫威");
  assert.equal(marvel.length, 216);
  assert.equal(
    marvel.filter((x) => /Tony|Peter/.test(x.characters)).length,
    180,
  );
  assert.equal(p.filter((x) => x.characters.includes("&")).length, 60);
  assert.equal(p.filter((x) => x.work.includes("Persona")).length, 36);
  assert.equal(new Set(p.map((x) => x.id)).size, 270);
  for (const m of ["闲鱼", "Mercari", "eBay"])
    assert.equal(p.filter((x) => x.market === m).length, 90);
  assert(p.every((x) => !blocked(x.title)));
});
test("关键词别名及屏蔽", () => {
  const p = generate();
  for (const q of ["妮妮", "Iron Man", "Tony Stark"])
    assert(
      p
        .filter((x) => matches(x, q))
        .every((x) => x.characters.includes("Tony")),
    );
  for (const q of ["小蜘蛛", "Peter Parker", "Spider-Man"])
    assert(
      p
        .filter((x) => matches(x, q))
        .every((x) => x.characters.includes("Peter")),
    );
  assert(
    p
      .filter((x) => matches(x, "Starker"))
      .every((x) => x.characters.includes("&")),
  );
  for (const q of ["明智吾郎", "Goro Akechi", "明智 吾郎", "あけち"]) {
    assert(blocked(q));
    assert.equal(p.filter((x) => matches(x, q)).length, 0);
  }
});
test("议价价款与运费扣款，唯一物品不能重复购买", () => {
  let s = initial();
  const p = s.products.find((x) => x.market === "闲鱼" && !x.auction)!;
  const before = s.wallet.闲鱼;
  s = buy(s, p, 20);
  assert.equal(s.wallet.闲鱼, before - 20 - p.shipping);
  assert.equal(s.orders.length, 1);
  assert(s.products.find((x) => x.id === p.id)?.sold);
  assert.throws(() => buy(s, p, 20));
  const raced = initial();
  raced.products = raced.products.map((x) =>
    x.id === p.id ? { ...x, sold: true } : x,
  );
  assert.throws(() => buy(raced, p, 20));
  assert.throws(() => buy(initial(), p, -1));
  assert.throws(() =>
    buy({ ...initial(), wallet: { 闲鱼: 0, Mercari: 0, eBay: 0 } }, p, p.price),
  );
});
test("包邮、富婆模式和存档往返", () => {
  let s = initial();
  const p = s.products[1];
  s = { ...s, rich: true, freeShipping: [p.id] };
  const before = s.wallet[p.market];
  s = buy(s, p, 10000000);
  assert.equal(s.wallet[p.market], before);
  assert.equal(s.orders[0].shipping, 0);
  assert.deepEqual(parseSave(JSON.stringify(s)), s);
  assert.throws(() => parseSave("{}"));
});
test("竞拍胜出仅扣一次，失败不扣款，竞争者正常加价", () => {
  let s = initial();
  const p = s.products.find((x) => x.auction)!;
  const a = {
    price: p.price,
    bid: p.price,
    end: 100,
    count: 2,
    status: "active" as const,
    next: 50,
  };
  s = { ...s, auctions: { [p.id]: a } };
  const won = settle(s, 101, () => 0.9);
  assert.equal(won.orders.length, 1);
  assert.equal(won.auctions[p.id].status, "won");
  assert.equal(settle(won, 200, () => 0.9).orders.length, 1);
  const lost = settle(s, 101, () => 0.1);
  assert.equal(lost.orders.length, 0);
  assert.deepEqual(lost.wallet, s.wallet);
  const compete = settle(s, 60, () => 0.1);
  assert(compete.auctions[p.id].price > p.price);
  const outbid = settle(compete, 101, () => 0.9);
  assert.equal(outbid.orders.length, 0);
  assert.equal(outbid.auctions[p.id].status, "lost");
});
test("海外物流包含转运清关", () => {
  assert(steps("Mercari").includes("日本仓库"));
  assert(steps("eBay").includes("国际转运"));
  assert.equal(steps("闲鱼").at(-1), "已签收");
});
test("拒绝无效的嵌套存档与重复物品订单", () => {
  const s = initial();
  assert.throws(() => parseSave(JSON.stringify({ ...s, orders: [{}] })));
  assert.throws(() =>
    parseSave(JSON.stringify({ ...s, auctions: { bad: {} } })),
  );
  assert.throws(() =>
    parseSave(
      JSON.stringify({ ...s, wallet: { 闲鱼: -1, Mercari: 0, eBay: 0 } }),
    ),
  );
  assert.throws(() =>
    parseSave(
      JSON.stringify({
        ...s,
        products: [
          { ...s.products[0], image: "https://example.com/untrusted.png" },
        ],
      }),
    ),
  );
});
test("到期余额不足不生成订单、不出现负余额", () => {
  const s = initial();
  const p = s.products.find((x) => x.auction)!;
  const next = settle(
    {
      ...s,
      wallet: { 闲鱼: 0, Mercari: 0, eBay: 0 },
      auctions: {
        [p.id]: {
          price: p.price,
          bid: p.price,
          end: 1,
          count: 1,
          status: "active",
          next: 1,
        },
      },
    },
    2,
    () => 0.9,
  );
  assert.equal(next.orders.length, 0);
  assert.equal(next.auctions[p.id].status, "lost");
  assert.equal(next.wallet[p.market], 0);
});
