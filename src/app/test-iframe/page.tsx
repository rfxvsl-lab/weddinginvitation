"use client";

import React, { useEffect, useRef, useState } from "react";

export default function TestIframePage() {
  const [effectRan, setEffectRan] = useState(false);

  useEffect(() => {
    document.title = "EFFECT RAN OK";
    setEffectRan(true);
  }, []);

  return (
    <div style={{ padding: 24, fontFamily: "monospace" }}>
      <h2>JS diagnostic</h2>
      <p>Effect ran (state): {effectRan ? "YES" : "NO"}</p>
      <p>Tab title should become EFFECT RAN OK if effects work.</p>
      <button
        onClick={(e) => {
          e.currentTarget.textContent = "CLICKED - events work";
        }}
        style={{ padding: "12px 24px", fontSize: 16, marginTop: 12 }}
      >
        CLICK ME to test events
      </button>
    </div>
  );
}
