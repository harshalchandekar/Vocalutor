"use client";

import React, { useEffect, useRef } from 'react';

export const InteractiveDotCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;
    let dpr = 1;

    // Grid configuration: 32px spacing reproduces the exact dense, tactile grid
    const GRID_SPACING = 32;
    const INFLUENCE_RADIUS = 130;
    const SPRING_STIFFNESS = 0.08;
    const DAMPING = 0.82;
    const MOUSE_FORCE = 18;

    interface Dot {
      x0: number;
      y0: number;
      x: number;
      y: number;
      vx: number;
      vy: number;
      baseRadius: number;
    }

    let dots: Dot[] = [];
    let isRunning = false;

    const mouse = {
      x: -9999,
      y: -9999,
      prevX: -9999,
      prevY: -9999,
      vx: 0,
      vy: 0,
    };

    function wakeUp() {
      if (!isRunning) {
        isRunning = true;
        animationFrameId = requestAnimationFrame(render);
      }
    }

    function initGrid() {
      if (!canvas) return;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx!.scale(dpr, dpr);

      dots = [];
      const cols = Math.ceil(width / GRID_SPACING) + 2;
      const rows = Math.ceil(height / GRID_SPACING) + 2;
      const offsetX = (width - (cols - 1) * GRID_SPACING) / 2;
      const offsetY = (height - (rows - 1) * GRID_SPACING) / 2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const x0 = offsetX + c * GRID_SPACING;
          const y0 = offsetY + r * GRID_SPACING;
          dots.push({
            x0,
            y0,
            x: x0,
            y: y0,
            vx: 0,
            vy: 0,
            baseRadius: 1.25,
          });
        }
      }

      wakeUp();
    }

    function render() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      const mouseX = mouse.x;
      const mouseY = mouse.y;
      const mouseVx = mouse.vx;
      const mouseVy = mouse.vy;

      let totalMotion = 0;
      const maxMotionThreshold = 0.05;

      // Ultra-high performance path batching: Only 3 GPU draw calls per frame
      const normalPath = new Path2D();
      const displacedPath = new Path2D();
      const activePath = new Path2D();

      const TWO_PI = Math.PI * 2;
      const radiusSq = INFLUENCE_RADIUS * INFLUENCE_RADIUS;

      for (let i = 0; i < dots.length; i++) {
        const dot = dots[i];
        const dx = dot.x - mouseX;
        const dy = dot.y - mouseY;
        const distSq = dx * dx + dy * dy;

        if (distSq < radiusSq && distSq > 0) {
          const dist = Math.sqrt(distSq);
          const force = (1 - dist / INFLUENCE_RADIUS) * MOUSE_FORCE;
          const angle = Math.atan2(dy, dx);
          dot.vx += Math.cos(angle) * force + mouseVx * 0.18;
          dot.vy += Math.sin(angle) * force + mouseVy * 0.18;
        }

        const springX = (dot.x0 - dot.x) * SPRING_STIFFNESS;
        const springY = (dot.y0 - dot.y) * SPRING_STIFFNESS;

        dot.vx = (dot.vx + springX) * DAMPING;
        dot.vy = (dot.vy + springY) * DAMPING;

        dot.x += dot.vx;
        dot.y += dot.vy;

        const distFromHome = Math.hypot(dot.x - dot.x0, dot.y - dot.y0);
        totalMotion += Math.abs(dot.vx) + Math.abs(dot.vy) + distFromHome;

        // Categorize into the 3 visual tiers
        if (distFromHome > 5.5) {
          const r = dot.baseRadius * 1.8;
          activePath.moveTo(dot.x + r, dot.y);
          activePath.arc(dot.x, dot.y, r, 0, TWO_PI);
        } else if (distFromHome > 1.4) {
          const r = dot.baseRadius * 1.4;
          displacedPath.moveTo(dot.x + r, dot.y);
          displacedPath.arc(dot.x, dot.y, r, 0, TWO_PI);
        } else {
          const r = dot.baseRadius;
          normalPath.moveTo(dot.x + r, dot.y);
          normalPath.arc(dot.x, dot.y, r, 0, TWO_PI);
        }
      }

      // Draw all normal dots in 1 call
      ctx.fillStyle = 'rgba(163, 163, 158, 0.35)';
      ctx.fill(normalPath);

      // Draw all slightly displaced dots in 1 call
      ctx.fillStyle = 'rgba(15, 15, 16, 0.45)';
      ctx.fill(displacedPath);

      // Draw all actively repelled orange dots in 1 call
      ctx.fillStyle = 'rgba(224, 62, 26, 0.75)';
      ctx.fill(activePath);

      // Dampen mouse velocities
      mouse.vx *= 0.8;
      mouse.vy *= 0.8;

      // Smart idle sleep: If motion has settled and mouse is still, pause the loop
      if (totalMotion < maxMotionThreshold && Math.abs(mouse.vx) < 0.05 && Math.abs(mouse.vy) < 0.05) {
        isRunning = false;
      } else {
        animationFrameId = requestAnimationFrame(render);
      }
    }

    initGrid();

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      if (mouse.prevX !== -9999) {
        mouse.vx = (mouse.x - mouse.prevX) * 0.35;
        mouse.vy = (mouse.y - mouse.prevY) * 0.35;
      }
      mouse.prevX = mouse.x;
      mouse.prevY = mouse.y;
      wakeUp();
    };

    const onMouseLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
      mouse.prevX = -9999;
      mouse.prevY = -9999;
      mouse.vx = 0;
      mouse.vy = 0;
      wakeUp();
    };

    let lastScrollY = window.scrollY;
    const onScroll = () => {
      const deltaY = window.scrollY - lastScrollY;
      lastScrollY = window.scrollY;
      const impulse = Math.max(-10, Math.min(10, deltaY * 0.15));
      for (let i = 0; i < dots.length; i += 3) {
        dots[i].vy -= impulse * 0.4;
      }
      wakeUp();
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseleave', onMouseLeave, { passive: true });
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', initGrid);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseleave', onMouseLeave);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', initGrid);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: 0.9 }}
    />
  );
};

export default InteractiveDotCanvas;
