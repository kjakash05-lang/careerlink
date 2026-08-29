import React from 'react';
import { Instagram, Twitter, Globe } from 'lucide-react';

const CinematicSocialFooter = () => {
  return (
    <footer className="w-full pb-8 pt-4 z-20 flex flex-col items-center justify-center gap-4">
      {/* 3 Circular Liquid-Glass Social Buttons */}
      <div className="flex items-center gap-3">
        <a
          href="https://instagram.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="CareerLink on Instagram"
          className="w-11 h-11 rounded-full liquid-glass flex items-center justify-center text-slate-300 hover:text-white hover:scale-110 hover:shadow-lg hover:shadow-pink-500/20 transition-all group"
        >
          <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </a>

        <a
          href="https://twitter.com"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="CareerLink on Twitter"
          className="w-11 h-11 rounded-full liquid-glass flex items-center justify-center text-slate-300 hover:text-white hover:scale-110 hover:shadow-lg hover:shadow-blue-500/20 transition-all group"
        >
          <Twitter className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </a>

        <a
          href="https://careerlink.io"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="CareerLink Global Network"
          className="w-11 h-11 rounded-full liquid-glass flex items-center justify-center text-slate-300 hover:text-white hover:scale-110 hover:shadow-lg hover:shadow-tealAccent-500/20 transition-all group"
        >
          <Globe className="w-4 h-4 group-hover:scale-110 transition-transform" />
        </a>
      </div>

      <p className="text-[11px] text-slate-400 font-medium tracking-wide text-center">
        CareerLink Platform © 2026 · <span className="text-slate-300">Connect. Grow. Get Hired.</span>
      </p>
    </footer>
  );
};

export default CinematicSocialFooter;
