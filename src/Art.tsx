import type { Product } from "./engine";
export function Art({ p }: { p: Product }) {
  if (p.image) return <img className="uploaded" src={p.image} alt={p.title} />;
  const t = p.characters.includes("Tony"),
    sp = p.characters.includes("Peter"),
    duo = t && sp;
  const colors = [
    "#e8dfd1",
    "#d6e4dc",
    "#e7d8ce",
    "#dae0e7",
    "#dfd9e5",
    "#e8e2c5",
  ];
  const bg = colors[p.seed % 6];
  const card = /卡|票|海报|封面|特典|色纸/.test(p.kind),
    plush = /娃|毛绒/.test(p.kind),
    stand = /立牌|砖/.test(p.kind);
  const id = `a${p.id}`;
  return (
    <svg
      viewBox="0 0 300 280"
      role="img"
      aria-label={`${p.characters} ${p.kind}原创模拟展示图`}
    >
      <defs>
        <filter id={id}>
          <feDropShadow dx="0" dy="7" stdDeviation="6" floodOpacity=".15" />
        </filter>
        <pattern
          id={`${id}p`}
          width="20"
          height="20"
          patternUnits="userSpaceOnUse"
        >
          <path d="M20 0H0V20" fill="none" stroke="#fff" strokeOpacity=".3" />
        </pattern>
      </defs>
      <rect width="300" height="280" fill={bg} />
      <rect width="300" height="280" fill={`url(#${id}p)`} />
      <ellipse cx="150" cy="239" rx="95" ry="12" fill="#554c3c" opacity=".08" />
      <g
        filter={`url(#${id})`}
        transform={`rotate(${p.seed % 2 ? 6 : -6} 150 140)`}
      >
        {card ? (
          <>
            <rect
              x="65"
              y="30"
              width="170"
              height="220"
              rx="3"
              fill="#fcf7e9"
            />
            <rect
              x="74"
              y="40"
              width="152"
              height="170"
              fill={t ? "#822e30" : sp ? "#324e6e" : "#5c7768"}
            />
          </>
        ) : stand ? (
          <>
            <ellipse
              cx="150"
              cy="234"
              rx="77"
              ry="14"
              fill="#f4ffff"
              stroke="#fff"
              strokeWidth="4"
            />
            <path
              d="M82 225V65Q150 2 218 65V225Z"
              fill="#ffffff80"
              stroke="#fff"
              strokeWidth="6"
            />
          </>
        ) : plush ? (
          <>
            <ellipse
              cx="150"
              cy="180"
              rx="60"
              ry="65"
              fill={t ? "#b36049" : sp ? "#ac4d48" : "#91a48b"}
            />
            <circle cx="100" cy="69" r="23" fill="#c6b69d" />
            <circle cx="200" cy="69" r="23" fill="#c6b69d" />
          </>
        ) : (
          <>
            <circle
              cx="150"
              cy="140"
              r="99"
              fill="#f8f3e4"
              stroke="#b6ac98"
              strokeWidth="5"
            />
            <circle
              cx="150"
              cy="140"
              r="91"
              fill={t ? "#913b36" : sp ? "#486782" : "#6f8773"}
            />
            <circle
              cx="150"
              cy="140"
              r="84"
              fill="none"
              stroke="#fff"
              strokeDasharray="2 5"
              opacity=".4"
            />
          </>
        )}
        {duo ? (
          <>
            <Hero t x={113} y={128} scale={0.7} />
            <Hero t={false} x={183} y={141} scale={0.7} />
          </>
        ) : (
          <Hero t={t} x={150} y={card ? 122 : 135} scale={plush ? 1.05 : 1} />
        )}
        {!t && !sp && (
          <text
            x="150"
            y="153"
            textAnchor="middle"
            fill="#fff"
            fontSize="21"
            fontWeight="bold"
          >
            {p.characters.slice(0, 2)}
          </text>
        )}
        <text
          x="150"
          y={card ? 230 : stand ? 211 : 219}
          textAnchor="middle"
          fill={card ? "#75634c" : "#fff"}
          fontSize="10"
          letterSpacing="2"
        >
          {duo
            ? "TOGETHER, WE RISE"
            : t
              ? "STARK INDUSTRIES"
              : sp
                ? "FRIENDLY NEIGHBOR"
                : "COLLECT A LITTLE JOY"}
        </text>
      </g>
      <rect x="16" y="15" width="66" height="21" fill="#fff9" rx="3" />
      <text x="49" y="29" textAnchor="middle" fontSize="9" fill="#6f6658">
        GUGU / 原创
      </text>
      <text
        x="281"
        y="264"
        textAnchor="end"
        fontSize="9"
        fill="#655d50"
        opacity=".6"
      >
        VIRTUAL COLLECTION
      </text>
    </svg>
  );
}
function Hero({
  t,
  x,
  y,
  scale,
}: {
  t: boolean;
  x: number;
  y: number;
  scale: number;
}) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path
        d="M-36 50Q-35 15 0 18Q35 15 36 50Z"
        fill={t ? "#caaa63" : "#a94747"}
      />
      <path
        d="M-35 -38Q0 -63 35 -38L31 13Q0 44 -31 13Z"
        fill={t ? "#d6b970" : "#c25d55"}
        stroke={t ? "#7d3930" : "#e7aa99"}
        strokeWidth="3"
      />
      {t ? (
        <>
          <path
            d="M-28 -21L-8 -15L-10 -8L-27 -10M28 -21L8 -15L10 -8L27 -10"
            fill="#d4ffff"
          />
          <path d="M-16 15H16L10 22H-10" fill="#75483b" />
          <circle
            cy="40"
            r="10"
            fill="#d8ffff"
            stroke="#a1c9c4"
            strokeWidth="3"
          />
        </>
      ) : (
        <>
          <path
            d="M0 -50V29M-32 -25L31 10M32 -25L-31 10M-35 -5L20 -38M35 -5L-20 -38"
            stroke="#713d3d"
            fill="none"
          />
          <path
            d="M-28 -23L-5 -12Q-11 9 -24 0ZM28 -23L5 -12Q11 9 24 0Z"
            fill="#f7f4e7"
            stroke="#393c47"
            strokeWidth="3"
          />
          <path
            d="M-7 35L7 47M7 35L-7 47M0 31V51"
            stroke="#303d51"
            strokeWidth="3"
          />
        </>
      )}
    </g>
  );
}
