'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  baseVx: number; // natural drift velocity
  baseVy: number; // natural drift velocity
  phase: number; // for sine wave movement
  amplitude: number; // wave amplitude
  frequency: number; // wave frequency
  life: number; // particle age for organic behavior
  maxLife: number; // maximum age before reset
}

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: 0, y: 0, vx: 0, vy: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let vw = 0,
      vh = 0,
      dpr = 1;

    const CONNECT_DISTANCE = 150; // slightly reduced for cleaner connections
    const INFLUENCE_RADIUS = 180; // increased from 120 for more sensitive interaction
    const REPEL_STRENGTH = 1200; // increased from 800 for stronger repulsion
    const SWIRL_STRENGTH = 15; // increased from 8 for more dramatic swirl
    const MAX_SPEED = 2; // increased from 1.8 for faster movement
    const FRICTION = 0.985; // reduced from 0.988 for less dampening
    const NOISE = 0.03; // increased from 0.02 for more liveliness
    const BASE_SPEED = 0.4; // increased from 0.3 for faster base movement
    const WAVE_STRENGTH = 0.25; // increased from 0.15 for more wave movement

    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      vw = Math.max(1, Math.floor(rect.width));
      vh = Math.max(1, Math.floor(rect.height));
      canvas.width = Math.floor(vw * dpr);
      canvas.height = Math.floor(vh * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      makeParticles();
    };

    const makeParticles = () => {
      const area = vw * vh;
      const baseCount = Math.floor(area / 3000); // reduced from 8000 for much higher density
      const count = Math.max(50, Math.min(200, baseCount)); // increased range from 15-80 to 50-200

      const arr: Particle[] = new Array(count).fill(0).map(() => {
        const angle = Math.random() * Math.PI * 2;
        const speed = BASE_SPEED * (0.5 + Math.random() * 0.5);

        return {
          x: Math.random() * vw,
          y: Math.random() * vh,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          baseVx: Math.cos(angle) * speed,
          baseVy: Math.sin(angle) * speed,
          size: Math.random() * 1.5 + 1.5, // consistent size range
          phase: Math.random() * Math.PI * 2,
          amplitude: Math.random() * 0.5 + 0.3,
          frequency: Math.random() * 0.02 + 0.01,
          life: 0,
          maxLife: Math.random() * 1000 + 500,
        };
      });
      particlesRef.current = arr;
    };

    const onPointerMove = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const m = mouseRef.current;
      m.vx = x - m.x;
      m.vy = y - m.y;
      m.x = x;
      m.y = y;
      m.active = true;
    };

    const onPointerLeave = () => {
      mouseRef.current.active = false;
    };

    const onClick = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;
      const radius = INFLUENCE_RADIUS * 2; // increased from 1.5 for bigger explosion
      particlesRef.current.forEach((p) => {
        const dx = p.x - cx;
        const dy = p.y - cy;
        const dist = Math.hypot(dx, dy);
        if (dist < radius) {
          const f = 1 - dist / radius;
          const ux = dx / (dist || 1);
          const uy = dy / (dist || 1);
          p.vx += ux * f * 15; // increased from 8
          p.vy += uy * f * 15;
        }
      });
    };

    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pointerdown', onPointerMove, { passive: true });
    window.addEventListener('pointerleave', onPointerLeave);
    window.addEventListener('click', onClick);

    let last = performance.now();
    const animate = () => {
      const now = performance.now();
      const dt = Math.min(32, now - last) / 16.666;
      last = now;

      ctx.clearRect(0, 0, vw, vh);

      const m = mouseRef.current;

      // Enhanced cursor glow
      if (m.active && !prefersReduced) {
        const g = ctx.createRadialGradient(
          m.x,
          m.y,
          0,
          m.x,
          m.y,
          INFLUENCE_RADIUS
        );
        g.addColorStop(0, 'rgba(167, 139, 250, 0.25)');
        g.addColorStop(0.5, 'rgba(167, 139, 250, 0.1)');
        g.addColorStop(1, 'rgba(167, 139, 250, 0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(m.x, m.y, INFLUENCE_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }

      const arr = particlesRef.current;

      for (let i = 0; i < arr.length; i++) {
        const p1 = arr[i];
        for (let j = i + 1; j < arr.length; j++) {
          const p2 = arr[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < CONNECT_DISTANCE * CONNECT_DISTANCE) {
            const dist = Math.sqrt(d2);
            const alpha = (1 - dist / CONNECT_DISTANCE) * 0.6;
            // Dynamic color based on particle movement
            const speed1 = Math.hypot(p1.vx, p1.vy);
            const speed2 = Math.hypot(p2.vx, p2.vy);
            const avgSpeed = (speed1 + speed2) / 2;
            const intensity = Math.min(1, avgSpeed / MAX_SPEED);

            ctx.globalAlpha = alpha;
            ctx.strokeStyle = `rgba(${139 + intensity * 50}, ${
              92 + intensity * 40
            }, 246, 1)`;
            ctx.lineWidth = 0.8 + intensity * 0.4;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;

      for (let i = 0; i < arr.length; i++) {
        const p = arr[i];
        p.life += dt;

        const waveX =
          Math.sin(p.phase + p.life * p.frequency) *
          p.amplitude *
          WAVE_STRENGTH *
          10;
        const waveY =
          Math.cos(p.phase + p.life * p.frequency * 0.7) *
          p.amplitude *
          WAVE_STRENGTH *
          10;

        // Continuous base movement
        p.vx += (p.baseVx + waveX - p.vx) * 0.02 * dt;
        p.vy += (p.baseVy + waveY - p.vy) * 0.02 * dt;

        // Subtle randomness for liveliness
        p.vx += (Math.random() - 0.5) * NOISE * dt;
        p.vy += (Math.random() - 0.5) * NOISE * dt;

        // Mouse interaction with enhanced smoothness
        if (m.active && !prefersReduced) {
          const dx = p.x - m.x;
          const dy = p.y - m.y;
          const dist = Math.hypot(dx, dy);

          if (dist < INFLUENCE_RADIUS) {
            const falloff = 1 - dist / INFLUENCE_RADIUS;
            const ux = dx / (dist || 1);
            const uy = dy / (dist || 1);

            // Smooth repulsion
            const repel = (REPEL_STRENGTH * falloff * falloff) / 10000;
            p.vx += ux * repel * dt;
            p.vy += uy * repel * dt;

            const tx = -uy;
            const ty = ux;
            const mouseSpeed = Math.hypot(m.vx, m.vy);
            const swirl = SWIRL_STRENGTH * falloff * (mouseSpeed / 10); // reduced divisor for more sensitivity

            // Add spiral motion based on distance
            const spiralStrength = falloff * falloff * 0.1;
            const angle = Math.atan2(dy, dx) + p.life * 0.01;
            const spiralX = Math.cos(angle) * spiralStrength;
            const spiralY = Math.sin(angle) * spiralStrength;

            p.vx += (tx * swirl * 0.06 + spiralX) * dt; // increased from 0.04
            p.vy += (ty * swirl * 0.06 + spiralY) * dt;
          }
        }

        // Perfect speed limiting
        const sp = Math.hypot(p.vx, p.vy);
        if (sp > MAX_SPEED) {
          p.vx = (p.vx / sp) * MAX_SPEED;
          p.vy = (p.vy / sp) * MAX_SPEED;
        }

        p.x += p.vx * dt * 1.5; // increased from 1.2
        p.y += p.vy * dt * 1.5;
        p.vx *= FRICTION;
        p.vy *= FRICTION;

        const margin = 20;
        // Smooth wrapping without forcing direction changes
        if (p.x < -margin) {
          p.x = vw + margin;
          // Don't force baseVx direction - keep natural movement
        }
        if (p.x > vw + margin) {
          p.x = -margin;
          // Don't force baseVx direction - keep natural movement
        }
        if (p.y < -margin) {
          p.y = vh + margin;
          // Don't force baseVy direction - keep natural movement
        }
        if (p.y > vh + margin) {
          p.y = -margin;
          // Don't force baseVy direction - keep natural movement
        }

        // Particle lifecycle for continuous renewal
        if (p.life > p.maxLife) {
          p.life = 0;
          p.phase = Math.random() * Math.PI * 2;
          p.amplitude = Math.random() * 0.5 + 0.3;
          p.frequency = Math.random() * 0.02 + 0.01;
          p.maxLife = Math.random() * 1000 + 500;
        }

        // Enhanced particle rendering with dynamic glow
        const speed = Math.hypot(p.vx, p.vy);
        const intensity = Math.min(1, speed / MAX_SPEED);
        const glowSize = p.size + intensity * 2;

        // Subtle glow effect
        if (intensity > 0.3) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, glowSize, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(196, 181, 253, ${intensity * 0.3})`;
          ctx.fill();
        }

        // Main particle
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(196, 181, 253, ${0.8 + intensity * 0.2})`;
        ctx.fill();
      }

      rafRef.current = requestAnimationFrame(animate);
    };

    resize();
    animate();
    window.addEventListener('resize', resize);

    return () => {
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerdown', onPointerMove);
      window.removeEventListener('pointerleave', onPointerLeave);
      window.removeEventListener('click', onClick);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className='absolute inset-0 w-full h-full'
      style={{
        pointerEvents: 'none',
        background:
          'linear-gradient(135deg, #2a0a42 0%, #4a219a 50%, #2a0a42 100%)',
      }}
    />
  );
}
