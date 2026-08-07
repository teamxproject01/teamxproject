import { useEffect, useRef, useCallback } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  baseAlpha: number;
  alpha: number;
  hue: number; // slight hue variation
  pulse: number;
  pulseSpeed: number;
}

interface Line {
  from: number;
  to: number;
  alpha: number;
}

interface ParticleBackgroundProps {
  count?: number;
  className?: string;
  density?: 'low' | 'medium' | 'high';
  connectLines?: boolean;
}

export default function ParticleBackground({
  count = 70,
  className = '',
  density = 'medium',
  connectLines = false,
}: ParticleBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const scrollVelRef = useRef(0);
  const mouseRef = useRef({ x: -9999, y: -9999 });
  const animFrameRef = useRef(0);
  const lastScrollRef = useRef(0);
  const frameRef = useRef(0);

  const particleCount =
    density === 'low' ? Math.floor(count * 0.55)
    : density === 'high' ? Math.round(count * 1.4)
    : count;

  const initParticles = useCallback((w: number, h: number) => {
    particlesRef.current = Array.from({ length: particleCount }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: Math.random() * 2.8 + 1.2,
      baseAlpha: Math.random() * 0.5 + 0.18,
      alpha: 0,
      hue: 200 + Math.random() * 30, // 200–230 = blue-sky range
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: 0.012 + Math.random() * 0.018,
    }));
  }, [particleCount]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      initParticles(canvas.width, canvas.height);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const onScroll = () => {
      const now = window.scrollY;
      scrollVelRef.current = (now - lastScrollRef.current) * 0.1;
      lastScrollRef.current = now;
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    const onMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    window.addEventListener('mousemove', onMouse, { passive: true });

    const CONNECT_DIST = 120;
    const MOUSE_REPEL = 90;
    const FADE_FRAMES = 90;

    const draw = () => {
      frameRef.current++;
      const w = canvas.width;
      const h = canvas.height;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      scrollVelRef.current *= 0.85;
      ctx.clearRect(0, 0, w, h);

      const particles = particlesRef.current;

      // Connection lines pass
      if (connectLines) {
        for (let i = 0; i < particles.length; i++) {
          for (let j = i + 1; j < particles.length; j++) {
            const dx = particles[i].x - particles[j].x;
            const dy = particles[i].y - particles[j].y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist < CONNECT_DIST) {
              const lineAlpha = (1 - dist / CONNECT_DIST) * 0.12;
              ctx.save();
              ctx.globalAlpha = lineAlpha;
              ctx.strokeStyle = `hsl(210, 80%, 65%)`;
              ctx.lineWidth = 0.6;
              ctx.beginPath();
              ctx.moveTo(particles[i].x, particles[i].y);
              ctx.lineTo(particles[j].x, particles[j].y);
              ctx.stroke();
              ctx.restore();
            }
          }
        }
      }

      // Particles pass
      particles.forEach((p) => {
        // Fade in
        if (frameRef.current < FADE_FRAMES) {
          p.alpha = Math.min(p.baseAlpha, (frameRef.current / FADE_FRAMES) * p.baseAlpha);
        } else {
          p.pulse += p.pulseSpeed;
          p.alpha = p.baseAlpha * (0.75 + 0.25 * Math.sin(p.pulse));
        }

        // Scroll impulse
        p.vy += scrollVelRef.current * 0.018;
        p.vy *= 0.994;

        // Mouse repulsion
        const dxm = p.x - mx;
        const dym = p.y - my;
        const dm = Math.sqrt(dxm * dxm + dym * dym);
        if (dm < MOUSE_REPEL && dm > 0) {
          const force = (1 - dm / MOUSE_REPEL) * 0.4;
          p.vx += (dxm / dm) * force;
          p.vy += (dym / dm) * force;
        }

        // Velocity damping
        p.vx *= 0.998;
        p.vy *= 0.998;

        p.x += p.vx;
        p.y += p.vy;

        // Edge wrap
        if (p.x < -p.r * 3) p.x = w + p.r;
        if (p.x > w + p.r * 3) p.x = -p.r;
        if (p.y < -p.r * 3) p.y = h + p.r;
        if (p.y > h + p.r * 3) p.y = -p.r;

        // Draw glow
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        grad.addColorStop(0, `hsla(${p.hue}, 85%, 72%, ${p.alpha})`);
        grad.addColorStop(0.4, `hsla(${p.hue}, 80%, 65%, ${p.alpha * 0.45})`);
        grad.addColorStop(1, `hsla(${p.hue}, 70%, 60%, 0)`);

        ctx.save();
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();

        // Core dot
        ctx.globalAlpha = p.alpha;
        ctx.shadowBlur = 10;
        ctx.shadowColor = `hsla(${p.hue}, 90%, 75%, 0.8)`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `hsl(${p.hue}, 90%, 82%)`;
        ctx.fill();
        ctx.restore();
      });

      animFrameRef.current = requestAnimationFrame(draw);
    };

    animFrameRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('mousemove', onMouse);
      ro.disconnect();
    };
  }, [initParticles, connectLines]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ zIndex: 0 }}
    />
  );
}
