import type { CSSProperties, ReactNode } from "react";
import { base } from "@/lib/styles";
import MeshBg from "./MeshBg";
import NetworkLines from "./NetworkLines";

// Gemeinsamer Bildschirm-Rahmen: dunkler Hintergrund + dekorative Layer.
// Entspricht 1:1 dem `<div style={base}><MeshBg/><NetworkLines/>…` der
// ursprünglichen App.
export default function Screen({
  children,
  style,
}: {
  children: ReactNode;
  style?: CSSProperties;
}) {
  return (
    <div style={style ? { ...base, ...style } : base}>
      <MeshBg />
      <NetworkLines />
      {children}
    </div>
  );
}
