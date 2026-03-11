"use client";

import { useEffect } from "react";

export function LenisProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    let lenis: { destroy: () => void; raf: (time: number) => void } | null = null;

    const init = async () => {
      const Lenis = (await import("lenis")).default;
      lenis = new Lenis({
        duration: 1.2,
        easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: "vertical",
        smoothWheel: true,
      });

      function raf(time: number) {
        lenis?.raf(time);
        requestAnimationFrame(raf);
      }
      requestAnimationFrame(raf);
    };

    init();
    return () => {
      lenis?.destroy();
    };
  }, []);

  return <>{children}</>;
}
