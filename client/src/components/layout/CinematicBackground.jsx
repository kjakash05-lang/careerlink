import React, { useRef, useEffect, useState } from 'react';

const VIDEO_URL = 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_115001_bcdaa3b4-03de-47e7-ad63-ae3e392c32d4.mp4';

const CinematicBackground = ({ children }) => {
  const videoRef = useRef(null);
  const animFrameRef = useRef(null);
  const fadingOutRef = useRef(false);
  const [opacity, setOpacity] = useState(0);
  const currentOpacityRef = useRef(0);

  // Helper to animate opacity using requestAnimationFrame
  const animateOpacity = (targetOpacity, durationMs, onComplete) => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }

    const startOpacity = currentOpacityRef.current;
    const startTime = performance.now();

    const step = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      // Ease in-out interpolation
      const ease = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
      const newOpacity = startOpacity + (targetOpacity - startOpacity) * ease;

      currentOpacityRef.current = newOpacity;
      setOpacity(newOpacity);

      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(step);
      } else {
        currentOpacityRef.current = targetOpacity;
        setOpacity(targetOpacity);
        if (onComplete) onComplete();
      }
    };

    animFrameRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // 1. Initial 500ms Fade-in on load / play
    const handlePlaying = () => {
      if (!fadingOutRef.current) {
        animateOpacity(1, 500);
      }
    };

    // 2. 500ms Fade-out approx 0.55s before video ends
    const handleTimeUpdate = () => {
      if (!video.duration || isNaN(video.duration)) return;
      const timeLeft = video.duration - video.currentTime;

      if (timeLeft <= 0.55 && !fadingOutRef.current) {
        fadingOutRef.current = true;
        animateOpacity(0, 500);
      }
    };

    // 3. Seamless Loop Transition when video ends
    const handleEnded = () => {
      // Step 1: ensure opacity is 0
      currentOpacityRef.current = 0;
      setOpacity(0);

      // Step 2: wait ~100ms, rewind, play, and fade in over 500ms
      setTimeout(() => {
        if (!video) return;
        video.currentTime = 0;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              fadingOutRef.current = false;
              animateOpacity(1, 500);
            })
            .catch(() => {
              fadingOutRef.current = false;
            });
        }
      }, 100);
    };

    // Fallback: Gracefully retry autoplay on first user interaction if blocked
    const handleInteraction = () => {
      if (video.paused) {
        video.play().catch(() => {});
      }
    };

    video.addEventListener('playing', handlePlaying);
    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('ended', handleEnded);
    window.addEventListener('click', handleInteraction, { once: true });
    window.addEventListener('touchstart', handleInteraction, { once: true });

    // Initial play attempt
    const initialPlayPromise = video.play();
    if (initialPlayPromise !== undefined) {
      initialPlayPromise.catch(() => {
        // Autoplay policy prevented playback, interaction listener will trigger it
      });
    }

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
      video.removeEventListener('playing', handlePlaying);
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('ended', handleEnded);
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('touchstart', handleInteraction);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-black overflow-hidden flex flex-col justify-between">
      {/* 1. Full-Screen Animated Video Background shifted down by 17% */}
      <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none z-0">
        <video
          ref={videoRef}
          src={VIDEO_URL}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover translate-y-[17%] transition-none"
          style={{ opacity }}
        />
      </div>

      {/* 2. Layered Dark Cinematic Gradients & Vignette Overlay */}
      <div className="absolute inset-0 pointer-events-none z-1 bg-gradient-to-b from-black/70 via-black/40 to-black/85" />
      <div className="absolute inset-0 pointer-events-none z-1 bg-[radial-gradient(circle_at_center,_rgba(29,78,216,0.18)_0%,_rgba(15,23,42,0.1)_50%,_transparent_100%)]" />
      <div className="absolute inset-0 pointer-events-none z-1 shadow-[inset_0_0_140px_rgba(0,0,0,0.85)]" />

      {/* 3. Foreground Content Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        {children}
      </div>
    </div>
  );
};

export default CinematicBackground;
