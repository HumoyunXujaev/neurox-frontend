'use client';

import AnimatedBackground from '../components/animated-background';
import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

// Particle type for floating particles
interface FloatingParticle {
  id: number;
  top: number;
  left: number;
  size: number;
  duration: number;
  delay: number;
}

export default function Home() {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [isClient, setIsClient] = useState(false);
  const [particles, setParticles] = useState<FloatingParticle[]>([]);

  const router = useRouter();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    // Ripple effect (перенести код из createRipple сюда)
    const button = buttonRef.current;
    if (!button) return;

    const ripple = document.createElement('span');
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    ripple.style.width = ripple.style.height = `${diameter}px`;
    ripple.style.left = `${
      e.clientX - button.getBoundingClientRect().left - radius
    }px`;
    ripple.style.top = `${
      e.clientY - button.getBoundingClientRect().top - radius
    }px`;
    ripple.classList.add('ripple');

    const rippleAnimation = ripple.animate(
      [
        { transform: 'scale(0)', opacity: 1 },
        { transform: 'scale(4)', opacity: 0 },
      ],
      { duration: 800, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }
    );

    rippleAnimation.onfinish = () => ripple.remove();
    button.appendChild(ripple);

    router.push('/agents');
  };

  // Initialize client state and generate particles on client only
  useEffect(() => {
    setIsClient(true);
    generateParticles();
  }, []);

  // Generate particles with random properties
  const generateParticles = () => {
    const newParticles: FloatingParticle[] = [];
    for (let i = 0; i < 20; i++) {
      newParticles.push({
        id: i,
        top: Math.random() * 100,
        left: Math.random() * 100,
        size: Math.random() * 8 + 2,
        duration: Math.random() * 10 + 10,
        delay: Math.random() * 5,
      });
    }
    setParticles(newParticles);
  };

  // // Ripple effect handler
  // useEffect(() => {
  //   const button = buttonRef.current;
  //   if (!button) return;

  //   const createRipple = (e: MouseEvent) => {
  //     const ripple = document.createElement('span');
  //     const diameter = Math.max(button.clientWidth, button.clientHeight);
  //     const radius = diameter / 2;

  //     ripple.style.width = ripple.style.height = `${diameter}px`;
  //     ripple.style.left = `${
  //       e.clientX - button.getBoundingClientRect().left - radius
  //     }px`;
  //     ripple.style.top = `${
  //       e.clientY - button.getBoundingClientRect().top - radius
  //     }px`;
  //     ripple.classList.add('ripple');

  //     const rippleAnimation = ripple.animate(
  //       [
  //         { transform: 'scale(0)', opacity: 1 },
  //         { transform: 'scale(4)', opacity: 0 },
  //       ],
  //       { duration: 800, easing: 'cubic-bezier(0.4, 0, 0.2, 1)' }
  //     );

  //     rippleAnimation.onfinish = () => ripple.remove();
  //     button.appendChild(ripple);
  //   };

  //   button.addEventListener('click', createRipple);
  //   return () => button.removeEventListener('click', createRipple);
  // }, []);

  return (
    <div className='relative min-h-screen w-full overflow-hidden flex items-center justify-center'>
      <AnimatedBackground />

      {/* Quantum Pulse Button */}
      <div className='relative z-10'>
        <button
          ref={buttonRef}
          onClick={handleClick}
          className='relative group w-40 h-40 md:w-48 md:h-48 flex items-center justify-center'
          aria-label='Start'
        >
          {/* Quantum Core */}
          <div className='absolute w-full h-full rounded-full bg-gradient-to-br from-purple-700 via-indigo-800 to-purple-900 shadow-2xl transform transition-all duration-700 group-hover:scale-105 group-hover:shadow-[0_0_50px_15px_rgba(139,92,246,0.5)]'>
            <div className='absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.2)_0%,transparent_70%)] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500'></div>
          </div>

          {/* Quantum Rings */}
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className='absolute border-2 border-transparent border-t-purple-500 rounded-full'
              style={{
                width: `${100 + i * 30}%`,
                height: `${100 + i * 30}%`,
                animation: `spin ${3 + i}s linear infinite, pulse ${
                  4 - i
                }s ease-in-out infinite alternate`,
                filter: `blur(${i === 0 ? 0 : i}px)`,
                opacity: 0.7 - i * 0.2,
              }}
            ></div>
          ))}

          {/* Glowing Center */}
          <div className='absolute w-28 h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 shadow-inner shadow-purple-300/30 flex items-center justify-center transform transition-all duration-500 group-hover:scale-95 group-hover:shadow-[0_0_30px_5px_rgba(192,132,252,0.7)]'>
            <span className='text-white font-bold text-xl md:text-2xl tracking-widest transform transition-all duration-300 group-hover:scale-110 group-hover:text-purple-200'>
              START
            </span>
          </div>

          {/* Particle Glow */}
          <div className='absolute -inset-4 rounded-full bg-purple-500/10 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700'></div>
        </button>
      </div>

      {/* Floating Particles (Client-side only) */}
      {isClient && (
        <div className='absolute inset-0 pointer-events-none'>
          {particles.map((particle) => (
            <div
              key={particle.id}
              className='absolute rounded-full bg-purple-500/30'
              style={{
                top: `${particle.top}%`,
                left: `${particle.left}%`,
                width: `${particle.size}px`,
                height: `${particle.size}px`,
                animation: `float ${particle.duration}s infinite ease-in-out both`,
                animationDelay: `${particle.delay}s`,
              }}
            ></div>
          ))}
        </div>
      )}

      <style jsx global>{`
        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes pulse {
          0% {
            opacity: 0.3;
          }
          100% {
            opacity: 0.7;
          }
        }

        @keyframes float {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
            opacity: 0.3;
          }
          25% {
            transform: translate(-10px, -15px) scale(1.1);
            opacity: 0.5;
          }
          50% {
            transform: translate(5px, -20px) scale(0.9);
            opacity: 0.7;
          }
          75% {
            transform: translate(15px, 10px) scale(1.2);
            opacity: 0.4;
          }
        }

        .ripple {
          position: absolute;
          border-radius: 50%;
          background: radial-gradient(
            circle,
            rgba(192, 132, 252, 0.8) 0%,
            transparent 70%
          );
          pointer-events: none;
          z-index: 10;
        }
      `}</style>
    </div>
  );
}
