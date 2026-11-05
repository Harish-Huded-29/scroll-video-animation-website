"use client";

import React, { useEffect, useRef } from "react";

export function BgCanvas() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let dpr = 1;
    let animId = 0;

    const mouse = { x: -9999, y: -9999, tx: -9999, ty: -9999, active: false };

    function resize() {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
    }

    window.addEventListener("resize", resize);
    resize();

    const handleMouseMove = (e: MouseEvent) => {
      mouse.tx = e.clientX;
      mouse.ty = e.clientY;
      mouse.active = true;

      // 3D Interactive Logo Tilt
      const logoBox = document.getElementById("logoBox");
      if (logoBox) {
        const lRect = logoBox.getBoundingClientRect();
        const lx = (e.clientX - (lRect.left + lRect.width / 2)) / 22;
        const ly = (e.clientY - (lRect.top + lRect.height / 2)) / 22;
        const rotY = Math.max(-18, Math.min(18, lx * 1.8));
        const rotX = Math.max(-18, Math.min(18, -ly * 1.8));
        logoBox.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.05)`;
      }
    };

    const handleMouseLeave = () => {
      mouse.active = false;
      const logoBox = document.getElementById("logoBox");
      if (logoBox) logoBox.style.transform = "";
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);

    const COLS = 34;
    const ROWS = 20;
    let time = 0;

    function render() {
      time += 0.016;
      if (mouse.active) {
        mouse.x += (mouse.tx - mouse.x) * 0.08;
        mouse.y += (mouse.ty - mouse.y) * 0.08;
      }

      if (!ctx) return;
      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, w, h);

      const stepX = w / (COLS - 1);
      const stepY = h / (ROWS - 1);
      const pts: { x: number; y: number; z: number }[][] = [];

      for (let r = 0; r < ROWS; r++) {
        pts[r] = [];
        for (let c = 0; c < COLS; c++) {
          const bx = c * stepX;
          const by = r * stepY;

          // 3D perspective undulating sine wave
          const wave = Math.sin(c * 0.28 + time) * Math.cos(r * 0.32 + time * 0.85);
          let z = wave * 26;

          if (mouse.active) {
            const dx = bx - mouse.x;
            const dy = by - mouse.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < 240) {
              const push = (1 - dist / 240) * 38;
              z += Math.sin(dist * 0.06 - time * 2) * push;
            }
          }

          const fov = 420;
          const scale = fov / (fov + z);
          const px = w / 2 + (bx - w / 2) * scale;
          const py = h / 2 + (by - h / 2) * scale;

          pts[r][c] = { x: px, y: py, z: scale };
        }
      }

      // Draw connecting 3D grid lines with luminous gradient
      ctx.lineWidth = 1;
      for (let r = 0; r < ROWS; r++) {
        for (let c = 0; c < COLS; c++) {
          const p = pts[r][c];

          if (c < COLS - 1) {
            const next = pts[r][c + 1];
            const alpha = Math.max(0.03, Math.min(0.28, (p.z - 0.85) * 0.7));
            ctx.strokeStyle = `rgba(129, 140, 248, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(next.x, next.y);
            ctx.stroke();
          }

          if (r < ROWS - 1) {
            const down = pts[r + 1][c];
            const alpha = Math.max(0.02, Math.min(0.22, (p.z - 0.85) * 0.5));
            ctx.strokeStyle = `rgba(168, 85, 247, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(down.x, down.y);
            ctx.stroke();
          }

          if ((r + c) % 2 === 0) {
            const rad = Math.max(1, p.z * 1.6);
            const pAlpha = Math.max(0.08, Math.min(0.75, (p.z - 0.85) * 1.2));
            ctx.fillStyle = `rgba(224, 231, 255, ${pAlpha})`;
            ctx.beginPath();
            ctx.arc(p.x, p.y, rad, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    }

    animId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return <canvas ref={canvasRef} id="bgCanvas" className="bg-canvas" />;
}

