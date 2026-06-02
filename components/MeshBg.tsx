// Dekorativer Mesh-Hintergrund (zwei radiale Gradienten). Rein dekorativ.
export default function MeshBg() {
  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
        background:
          "radial-gradient(ellipse at 15% 20%, rgba(219,115,166,0.15) 0%, transparent 55%), radial-gradient(ellipse at 85% 75%, rgba(135,205,203,0.12) 0%, transparent 50%)",
      }}
    />
  );
}
