import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

const SplashScreen = ({ onFinish, isAuthenticated }) => {
  // Step 1: Initial CL badge (0 - 800ms)
  // Step 2: Expand to "CareerLink" + Tagline (800ms - 1800ms)
  // Step 3: Fade out splash and show destination (1800ms+)
  const [animationStep, setAnimationStep] = useState(1);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    // Step 2: Expand logo & tagline
    const step2Timer = setTimeout(() => {
      setAnimationStep(2);
    }, 750);

    // Step 3: Fade out splash
    const fadeOutTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 1850);

    // Step 4: Finish splash and mount destination
    const finishTimer = setTimeout(() => {
      onFinish?.();
    }, 2300);

    return () => {
      clearTimeout(step2Timer);
      clearTimeout(fadeOutTimer);
      clearTimeout(finishTimer);
    };
  }, [onFinish]);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-black transition-opacity duration-500 select-none ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* 1. Deep Cinematic Background Glows */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(37,99,235,0.18)_0%,_rgba(15,23,42,0.6)_50%,_rgba(0,0,0,0.95)_100%)] pointer-events-none" />
      <div className="absolute w-[600px] h-[600px] rounded-full bg-pro-600/10 blur-[120px] pointer-events-none animate-pulse" />

      {/* 2. Central Animated Brand Mark */}
      <div className="relative z-10 flex flex-col items-center justify-center space-y-4 px-6 text-center">
        {/* Glowing Badge & Logo Sequence */}
        <div
          className={`flex items-center justify-center transition-all duration-700 ease-out transform ${
            animationStep >= 1
              ? 'scale-100 opacity-100 translate-y-0'
              : 'scale-90 opacity-0 translate-y-4'
          }`}
        >
          <div className="relative group">
            {/* Ambient Aura */}
            <div className="absolute -inset-2 bg-gradient-to-r from-pro-600 to-tealAccent-500 rounded-3xl blur-xl opacity-60 group-hover:opacity-100 transition duration-1000 animate-tilt" />

            {/* Badge Container */}
            <div className="relative flex items-center gap-3.5 px-6 py-4 rounded-2xl bg-slate-950/80 border border-white/20 shadow-2xl backdrop-blur-2xl">
              {/* CL Monogram */}
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-pro-600 via-indigo-600 to-tealAccent-500 flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-pro-600/40 shrink-0 tracking-tighter">
                CL
              </div>

              {/* Expanding "CareerLink" text */}
              <div
                className={`overflow-hidden transition-all duration-700 ease-out flex flex-col justify-center ${
                  animationStep >= 2 ? 'max-w-[260px] opacity-100 ml-1' : 'max-w-0 opacity-0 ml-0'
                }`}
              >
                <span className="text-2xl sm:text-3xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-pro-300 whitespace-nowrap">
                  Career<span className="text-pro-400">Link</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. Subtitle Tagline with Glow */}
        <div
          className={`transition-all duration-700 ease-out delay-200 transform ${
            animationStep >= 2
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-3'
          }`}
        >
          <p className="text-[11px] sm:text-xs font-extrabold uppercase tracking-[0.32em] text-slate-300/90 flex items-center justify-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-pro-400 animate-ping" />
            <span>CONNECT · GROW · GET HIRED</span>
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-tealAccent-400 animate-ping" />
          </p>
        </div>

        {/* 4. Elegant Minimal Loader */}
        <div
          className={`pt-6 transition-opacity duration-500 ${
            animationStep >= 2 ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <div className="w-36 h-1 rounded-full bg-white/10 overflow-hidden relative">
            <div className="absolute top-0 bottom-0 left-0 bg-gradient-to-r from-pro-500 to-tealAccent-400 rounded-full w-1/2 animate-[shimmer_1.5s_infinite_linear]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
