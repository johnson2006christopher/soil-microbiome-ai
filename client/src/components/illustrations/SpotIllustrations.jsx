import React from 'react';

// Small decorative illustrations in the same palette as FarmCrossSection.
// They carry no information, so they are hidden from screen readers.

export function LeafScan({ className = '' }) {
  return (
    <svg viewBox="0 0 240 200" aria-hidden="true" className={className}>
      <rect x="18" y="14" width="204" height="172" rx="22" fill="#eef4ef" />
      {/* leaf */}
      <path d="M60 150 C 50 96 86 52 168 46 C 172 116 136 156 60 150Z" fill="#3e8e5a" />
      <path d="M60 150 C 92 122 124 92 166 50" stroke="#d6eadb" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M86 128 l-10 -22 M104 112 l-6 -26 M122 96 l-2 -24 M100 116 l24 4 M120 98 l22 2" stroke="#d6eadb" strokeWidth="2" strokeLinecap="round" />
      {/* disease spots */}
      <circle cx="132" cy="70" r="7" fill="#7a5a43" /><circle cx="132" cy="70" r="11" fill="none" stroke="#e3b23c" strokeWidth="2" />
      <circle cx="96" cy="100" r="5" fill="#7a5a43" />
      <circle cx="146" cy="96" r="4" fill="#7a5a43" />
      {/* scan frame */}
      <path d="M40 40 v-12 h20 M200 40 v-12 h-20 M40 160 v12 h20 M200 160 v12 h-20" stroke="#1f4d3a" strokeWidth="5" fill="none" strokeLinecap="round" />
      <rect x="40" y="96" width="160" height="4" rx="2" fill="#e3b23c" opacity="0.9" />
    </svg>
  );
}

export function SoilProbe({ className = '' }) {
  return (
    <svg viewBox="0 0 240 200" aria-hidden="true" className={className}>
      <rect x="18" y="14" width="204" height="172" rx="22" fill="#eef4ef" />
      {/* soil core */}
      <path d="M52 78 h136 v84 a 14 14 0 0 1 -14 14 h-108 a 14 14 0 0 1 -14 -14Z" fill="#4a3426" />
      <rect x="52" y="78" width="136" height="34" fill="#7a5a43" />
      <rect x="52" y="74" width="136" height="8" rx="4" fill="#5c8a3e" />
      <circle cx="78" cy="128" r="3" fill="#e3b23c" /><circle cx="150" cy="142" r="2.5" fill="#8fd1a0" />
      <circle cx="120" cy="156" r="3" fill="#e3b23c" /><circle cx="94" cy="160" r="2" fill="#cfe6dc" />
      <path d="M74 96 c 10 -8 22 4 32 -2 s 18 6 28 0" stroke="#f0d98a" strokeWidth="1.5" fill="none" opacity="0.7" />
      {/* sprout */}
      <path d="M150 74 c 0 -14 2 -24 8 -32" stroke="#3a7a4c" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M156 50 c 8 -10 22 -12 30 -6 c -8 8 -20 10 -30 6Z" fill="#4fa36a" />
      <path d="M154 58 c -8 -10 -20 -12 -28 -6 c 8 8 18 10 28 6Z" fill="#3e8e5a" />
      {/* probe */}
      <rect x="84" y="30" width="34" height="26" rx="6" fill="#1f4d3a" stroke="#e3b23c" strokeWidth="2.5" />
      <circle cx="94" cy="43" r="3" fill="#8fd1a0" />
      <path d="M96 56 v86 M106 56 v86" stroke="#cfd8d3" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

export function Sprout({ className = '' }) {
  return (
    <svg viewBox="0 0 160 120" aria-hidden="true" className={className}>
      <ellipse cx="80" cy="96" rx="62" ry="14" fill="#7a5a43" />
      <ellipse cx="80" cy="92" rx="54" ry="9" fill="#8dbf7a" />
      <path d="M80 92 c 0 -18 2 -32 6 -44" stroke="#3a7a4c" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M84 56 c 10 -16 30 -20 42 -12 c -10 12 -28 16 -42 12Z" fill="#4fa36a" />
      <path d="M82 66 c -10 -14 -28 -18 -40 -10 c 10 12 26 14 40 10Z" fill="#3e8e5a" />
      <circle cx="122" cy="30" r="10" fill="#e3b23c" opacity="0.85" />
    </svg>
  );
}
