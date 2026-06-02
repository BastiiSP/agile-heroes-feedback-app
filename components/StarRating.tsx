"use client";

import { useState } from "react";
import { C } from "@/lib/constants";

export default function StarRating({
  value,
  onChange,
}: {
  value: number;
  onChange: (star: number) => void;
}) {
  const [hovered, setHovered] = useState(0);
  return (
    <div style={{ display: "flex", gap: "8px" }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: "40px",
            lineHeight: 1,
            padding: 0,
            color: star <= (hovered || value) ? C.pink : "rgba(255,255,255,0.15)",
            transition: "color 0.12s, transform 0.1s",
            transform: star <= (hovered || value) ? "scale(1.15)" : "scale(1)",
          }}
        >
          ★
        </button>
      ))}
    </div>
  );
}
