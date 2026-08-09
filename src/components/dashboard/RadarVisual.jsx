const rings = [16, 32, 48, 64];
const blips = [
  { top: "20%", left: "64%" },
  { top: "68%", left: "26%" },
  { top: "38%", left: "18%" },
];

export default function RadarVisual() {
  return (
    <div className="relative mx-auto h-[140px] w-[140px] shrink-0">
      {rings.map((r) => (
        <div
          key={r}
          className="absolute rounded-full border border-cyan-400/20"
          style={{
            width: r * 2,
            height: r * 2,
            top: `calc(50% - ${r}px)`,
            left: `calc(50% - ${r}px)`,
          }}
        />
      ))}

      <div
        className="absolute left-1/2 top-1/2 h-[64px] w-[2px] origin-top rotate-45"
        style={{
          background: "linear-gradient(to top, rgba(34,211,238,0.9), rgba(34,211,238,0))",
        }}
      />

      {/* center dot */}
      <div className="absolute left-1/2 top-1/2 h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-300 shadow-[0_0_10px_2px_rgba(34,211,238,0.7)]" />

      {blips.map((b, i) => (
        <div
          key={i}
          className="absolute h-1.5 w-1.5 rounded-full bg-cyan-300/70"
          style={{ top: b.top, left: b.left }}
        />
      ))}
    </div>
  );
}