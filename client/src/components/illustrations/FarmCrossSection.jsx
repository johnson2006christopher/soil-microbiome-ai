import React from 'react';

// Hero illustration: a farm below Kilimanjaro, cut away at the ground line to show
// soil layers, roots, mycorrhizal threads and microbes, with a sensor probe in the soil.
// Callout labels are passed in (translated) and hidden on small screens, where the
// page shows them as a list instead.

const GROUND = 330;

// Fixed pseudo-random scatter so the drawing is identical on every render
function scatter(count, seed, xMin, xMax, yMin, yMax) {
  let s = seed;
  const rand = () => ((s = (s * 9301 + 49297) % 233280) / 233280);
  return Array.from({ length: count }, () => ({
    x: xMin + rand() * (xMax - xMin),
    y: yMin + rand() * (yMax - yMin),
    r: rand(),
  }));
}

function TomatoPlant({ x }) {
  return (
    <g transform={`translate(${x} ${GROUND})`}>
      <path d="M0 0 C -2 -30 2 -55 0 -82" stroke="#2f6b3f" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M0 -30 C -18 -36 -30 -32 -38 -24 C -26 -22 -14 -24 0 -30Z" fill="#3e8e5a" />
      <path d="M0 -48 C 18 -56 32 -52 40 -42 C 26 -40 14 -42 0 -48Z" fill="#4fa36a" />
      <path d="M0 -66 C -16 -76 -28 -72 -34 -64 C -22 -60 -10 -62 0 -66Z" fill="#3e8e5a" />
      <path d="M0 -80 C 10 -92 22 -92 28 -84 C 18 -80 8 -80 0 -80Z" fill="#559f6b" />
      <circle cx="-14" cy="-40" r="7" fill="#d9472b" />
      <circle cx="16" cy="-58" r="6" fill="#e5603f" />
      <circle cx="-8" cy="-70" r="5" fill="#d9472b" />
      {/* roots */}
      <path d="M0 0 C -4 30 -18 50 -26 86 M0 0 C 6 34 2 60 8 104 M0 0 C 10 24 24 44 30 70"
        stroke="#e8d5b0" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.85" />
    </g>
  );
}

function MaizePlant({ x, h = 150 }) {
  return (
    <g transform={`translate(${x} ${GROUND})`}>
      <path d={`M0 0 L0 ${-h}`} stroke="#3a7a4c" strokeWidth="5" strokeLinecap="round" />
      <path d={`M0 ${-h * 0.25} C -30 ${-h * 0.32} -52 ${-h * 0.28} -66 ${-h * 0.16}`} stroke="#4fa36a" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d={`M0 ${-h * 0.42} C 30 ${-h * 0.5} 54 ${-h * 0.46} 68 ${-h * 0.34}`} stroke="#3e8e5a" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d={`M0 ${-h * 0.6} C -26 ${-h * 0.7} -46 ${-h * 0.68} -58 ${-h * 0.58}`} stroke="#4fa36a" strokeWidth="6" fill="none" strokeLinecap="round" />
      <path d={`M0 ${-h * 0.76} C 22 ${-h * 0.86} 40 ${-h * 0.86} 50 ${-h * 0.78}`} stroke="#3e8e5a" strokeWidth="6" fill="none" strokeLinecap="round" />
      {/* cob and tassel */}
      <ellipse cx="7" cy={-h * 0.5} rx="6" ry="16" fill="#e3b23c" transform={`rotate(18 7 ${-h * 0.5})`} />
      <path d={`M0 ${-h} l-8 -18 M0 ${-h} l0 -22 M0 ${-h} l8 -18`} stroke="#e3b23c" strokeWidth="3" strokeLinecap="round" />
      {/* fibrous roots */}
      <path d="M0 0 C -14 20 -30 32 -40 60 M0 0 C -4 30 -8 56 -6 96 M0 0 C 6 26 18 48 22 90 M0 0 C 16 16 32 26 44 50"
        stroke="#e8d5b0" strokeWidth="2" fill="none" strokeLinecap="round" opacity="0.85" />
    </g>
  );
}

function Callout({ x, y, lx, ly, label = '' }) {
  if (!label) return null;
  // Approximate pill width from the label length (SVG text cannot be measured before render)
  const w = label.length * 8.9 + 30;
  return (
    <g className="hidden md:block">
      <path d={`M${x} ${y} L${lx + 14} ${ly + 18}`} stroke="#ffffff" strokeWidth="2" strokeDasharray="4 4" opacity="0.9" />
      <circle cx={x} cy={y} r="7" fill="#e3b23c" stroke="#fff" strokeWidth="3" />
      <rect x={lx} y={ly} width={w} height="36" rx="18" fill="#1f4d3a" />
      <text x={lx + 14} y={ly + 24} fontSize="18" fontFamily="Familjen Grotesk, system-ui, sans-serif"
        fontWeight="600" fill="#ffffff">
        {label}
      </text>
    </g>
  );
}

export default function FarmCrossSection({ labels = {}, title, className = '' }) {
  const microbes = scatter(70, 7, 40, 1160, GROUND + 40, 680);
  const pebbles = scatter(26, 23, 30, 1170, GROUND + 120, 690);
  const hyphae = scatter(9, 41, 380, 1080, GROUND + 60, 560);

  return (
    <svg viewBox="0 0 1200 700" role="img" aria-label={title} className={className} preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="fcs-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cfe6dc" />
          <stop offset="1" stopColor="#f3f1dc" />
        </linearGradient>
        <linearGradient id="fcs-top" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7a5a43" />
          <stop offset="1" stopColor="#5e4332" />
        </linearGradient>
        <linearGradient id="fcs-sub" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#4a3426" />
          <stop offset="1" stopColor="#2f2018" />
        </linearGradient>
      </defs>

      {/* Sky, sun, Kilimanjaro */}
      <rect width="1200" height={GROUND + 4} fill="url(#fcs-sky)" />
      <circle cx="1030" cy="96" r="46" fill="#e3b23c" opacity="0.9" />
      <path d="M120 300 L330 150 C 360 132 420 128 470 132 L520 136 C 560 140 590 150 620 170 L860 300Z" fill="#9db8b0" />
      <path d="M330 150 C 360 132 420 128 470 132 L520 136 C 560 140 590 150 620 170 L596 176 L566 162 L540 172 L506 156 L476 170 L446 154 L410 168 L380 156 L352 168Z" fill="#ffffff" />
      <path d="M620 300 L760 222 C 800 204 840 206 880 224 L1040 300Z" fill="#b5ccc4" />

      {/* Field surface */}
      <path d={`M0 ${GROUND - 26} C 200 ${GROUND - 40} 420 ${GROUND - 18} 600 ${GROUND - 28} C 800 ${GROUND - 38} 1000 ${GROUND - 20} 1200 ${GROUND - 30} L1200 ${GROUND + 4} L0 ${GROUND + 4}Z`} fill="#8dbf7a" />

      {/* Soil layers */}
      <rect y={GROUND} width="1200" height="150" fill="url(#fcs-top)" />
      <rect y={GROUND + 150} width="1200" height="220" fill="url(#fcs-sub)" />
      <path d={`M0 ${GROUND + 150} C 240 ${GROUND + 138} 520 ${GROUND + 164} 760 ${GROUND + 148} C 960 ${GROUND + 136} 1100 ${GROUND + 158} 1200 ${GROUND + 146}`}
        stroke="#3a281d" strokeWidth="3" fill="none" opacity="0.6" />
      <rect y={GROUND} width="1200" height="6" fill="#5c8a3e" />

      {pebbles.map((p, i) => (
        <ellipse key={`pb${i}`} cx={p.x} cy={p.y} rx={6 + p.r * 10} ry={4 + p.r * 6} fill="#6b5545" opacity="0.7" />
      ))}

      {/* Mycorrhizal threads */}
      {hyphae.map((h, i) => (
        <path key={`hy${i}`}
          d={`M${h.x} ${h.y} c 20 -14 40 6 62 -6 c 18 -10 30 8 50 2 M${h.x + 40} ${h.y - 4} c 6 18 -6 30 4 46 M${h.x + 80} ${h.y - 2} c 10 -16 26 -18 34 -34`}
          stroke="#f0d98a" strokeWidth="1.6" fill="none" opacity="0.55" strokeLinecap="round" />
      ))}

      {/* Microbes */}
      {microbes.map((m, i) => (
        m.r > 0.55
          ? <ellipse key={`mb${i}`} cx={m.x} cy={m.y} rx="6" ry="3" fill="#8fd1a0" opacity="0.75" transform={`rotate(${m.r * 180} ${m.x} ${m.y})`} />
          : <circle key={`mb${i}`} cx={m.x} cy={m.y} r={2 + m.r * 3} fill={m.r > 0.3 ? '#e3b23c' : '#cfe6dc'} opacity="0.7" />
      ))}

      {/* Earthworm */}
      <path d="M150 560 c 20 -16 40 16 60 0 s 40 16 60 0" stroke="#c98b74" strokeWidth="9" fill="none" strokeLinecap="round" />

      {/* Plants: tomatoes left, maize right */}
      {[90, 190, 290, 390].map((x) => <TomatoPlant key={`t${x}`} x={x} />)}
      {[760, 850, 940, 1030, 1120].map((x, i) => <MaizePlant key={`m${x}`} x={x} h={140 + (i % 2) * 18} />)}

      {/* Sensor stake with probe into the soil */}
      <g transform={`translate(560 ${GROUND})`}>
        <rect x="-5" y="-96" width="10" height="96" rx="3" fill="#cfd8d3" />
        <rect x="-26" y="-132" width="52" height="40" rx="8" fill="#1f4d3a" stroke="#e3b23c" strokeWidth="3" />
        <circle cx="-10" cy="-112" r="4" fill="#8fd1a0" />
        <rect x="0" y="-116" width="16" height="8" rx="2" fill="#3e8e5a" />
        <path d="M0 -132 L0 -158 M-10 -150 a 14 14 0 0 1 20 0 M-18 -158 a 26 26 0 0 1 36 0" stroke="#1f4d3a" strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M-4 0 L-4 120 M4 0 L4 120" stroke="#cfd8d3" strokeWidth="4" strokeLinecap="round" />
        <circle cx="0" cy="120" r="6" fill="#e3b23c" />
      </g>

      {/* Callouts (desktop) */}
      <Callout x={290} y={GROUND - 56} lx={60} ly={140} label={labels.leaf} />
      <Callout x={560} y={GROUND - 112} lx={612} ly={96} label={labels.sensor} />
      <Callout x={720} y={GROUND + 200} lx={760} ly={GROUND + 262} label={labels.life} />
    </svg>
  );
}
