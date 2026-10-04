/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ExternalLink, Download, Maximize2, Minimize2 } from 'lucide-react';

export default function App() {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#030308] text-slate-100 flex flex-col">
      {/* Discreet utility header for standalone game access */}
      <header className="absolute top-2 right-4 z-40 flex items-center gap-2 pointer-events-auto">
        <a
          href="/antigravity_game.html"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-cyan-400 bg-slate-900/80 hover:bg-slate-800/90 border border-cyan-500/30 rounded-md shadow-sm transition-all hover:border-cyan-400"
          title="Open standalone antigravity_game.html in a fresh tab"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Standalone File</span>
        </a>

        <a
          href="/antigravity_game.html"
          download="antigravity_game.html"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/60 rounded-md shadow-sm transition-all hover:text-white"
          title="Download single-file antigravity_game.html"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Download HTML</span>
        </a>

        <button
          onClick={toggleFullscreen}
          className="p-1.5 text-slate-400 hover:text-white bg-slate-900/80 hover:bg-slate-800/90 border border-slate-700/60 rounded-md transition-all"
          title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          aria-label="Toggle Fullscreen"
        >
          {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
        </button>
      </header>

      {/* Main Full-Viewport 3D WebGL Game Frame */}
      <iframe
        src="/antigravity_game.html"
        title="Antigravity Game"
        className="w-full h-full border-none flex-1"
        allow="autoplay"
      />
    </div>
  );
}
