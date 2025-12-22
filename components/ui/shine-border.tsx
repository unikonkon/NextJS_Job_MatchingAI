"use client";

import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface ShineBorderProps {
  className?: string;
  children?: React.ReactNode;
  shineColor?: string | string[];
  borderWidth?: number;
  duration?: number;
  style?: React.CSSProperties;
}

export function ShineBorder({
  className,
  children,
  shineColor = ["#A07CFE", "#FE8FB5", "#FFBE7B"],
  borderWidth = 1,
  duration = 14,
  style,
}: ShineBorderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shineColorArray = Array.isArray(shineColor) ? shineColor : [shineColor];
  const shineColorString = shineColorArray.join(", ");

  useEffect(() => {
    if (!containerRef.current) return;

    const styleId = "shine-border-keyframes";
    if (document.getElementById(styleId)) return;

    const style = document.createElement("style");
    style.id = styleId;
    style.textContent = `
      @keyframes shine-border {
        0% {
          background-position: -200% center;
        }
        100% {
          background-position: 200% center;
        }
      }
    `;
    document.head.appendChild(style);

    return () => {
      const existingStyle = document.getElementById(styleId);
      if (existingStyle) {
        existingStyle.remove();
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative inline-flex rounded-xl p-[2px]",
        className
      )}
      style={
        {
          "--border-width": `${borderWidth}px`,
          "--duration": `${duration}s`,
          ...style,
        } as React.CSSProperties
      }
    >
      <div
        className="absolute inset-0 rounded-xl"
        style={{
          background: `linear-gradient(135deg, transparent 30%, ${shineColorString}, transparent 70%)`,
          backgroundSize: "200% 200%",
          animation: `shine-border var(--duration) linear infinite`,
          borderRadius: "inherit",
          padding: `${borderWidth}px`,
          WebkitMask: `linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)`,
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
      <div className="relative z-10 w-full rounded-xl bg-zinc-50/80 dark:bg-zinc-900/80 backdrop-blur-sm">
        {children}
      </div>
    </div>
  );
}

