import React from "react";
import { SpeedTestApp } from "@/components/SpeedTestApp";

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-50 text-slate-900 pb-16 font-sans">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-500/20">
              S
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 leading-tight">
                Internet Speed Checker
              </h1>
              <p className="text-xs text-slate-500">
                Real-Time Broadband Diagnostic Tool
              </p>
            </div>
          </div>
          <div className="hidden sm:flex items-center space-x-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
              Network Ready
            </span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="mt-6">
        <SpeedTestApp />
      </div>

      {/* Footer */}
      <footer className="max-w-5xl mx-auto px-4 mt-16 pt-8 border-t border-slate-200 text-center text-xs text-slate-500">
        <p>
          © {new Date().getFullYear()} Internet Speed Checker. Independent
          network performance testing tool.
        </p>
        <p className="mt-1">
          Designed for accurate bandwidth, latency, and jitter measurements
          across desktop and mobile browsers.
        </p>
      </footer>
    </main>
  );
}
