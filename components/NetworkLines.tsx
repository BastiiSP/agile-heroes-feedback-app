// Dekoratives SVG-Liniennetz im Hintergrund. Rein dekorativ, stabil lassen.
export default function NetworkLines() {
  const lines: [number, number, number, number][] = [
    [0, 20, 40, 5], [15, 50, 55, 20], [30, 5, 70, 40], [50, 30, 90, 10],
    [10, 70, 60, 55], [35, 80, 80, 60], [5, 40, 45, 65], [60, 15, 95, 45],
    [20, 90, 65, 75], [45, 55, 85, 80],
  ];
  const dots: [number, number][] = [
    [10, 20], [30, 5], [50, 30], [70, 40], [90, 10],
    [15, 50], [60, 55], [80, 60], [45, 75], [25, 85],
  ];
  return (
    <svg
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        opacity: 0.06,
        zIndex: 0,
      }}
    >
      {lines.map(([x1, y1, x2, y2], i) => (
        <line key={i} x1={x1 + "%"} y1={y1 + "%"} x2={x2 + "%"} y2={y2 + "%"} stroke="white" strokeWidth="0.7" />
      ))}
      {dots.map(([cx, cy], i) => (
        <circle key={i} cx={cx + "%"} cy={cy + "%"} r="2.5" fill="white" />
      ))}
    </svg>
  );
}
