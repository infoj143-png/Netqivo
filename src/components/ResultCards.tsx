"use client";

import React from "react";

interface ResultCardsProps {
  downloadMbps?: number;
  uploadMbps?: number;
  pingMs?: number;
  jitterMs?: number;
  clientIp?: string;
  ispName?: string;
  serverLocation?: string;
}

export const ResultCards: React.FC<ResultCardsProps> = ({
  downloadMbps,
  uploadMbps,
  pingMs,
  jitterMs,
  clientIp,
  ispName,
  serverLocation,
}) => {
  return (
    <div className="w-full space-y-6">
      {/* Primary Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Download Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col items-center justify-center hover:border-blue-300 transition-colors">
          <div className="flex items-center space-x-1.5 text-blue-600 mb-1">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 14l-7 7m0 0l-7-7m7 7V3"
              />
            </svg>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Download
            </span>
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-slate-900 font-mono">
            {downloadMbps !== undefined ? downloadMbps.toFixed(2) : "--"}
          </div>
          <span className="text-xs text-slate-500 font-medium mt-0.5">
            Mbps
          </span>
        </div>

        {/* Upload Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col items-center justify-center hover:border-teal-300 transition-colors">
          <div className="flex items-center space-x-1.5 text-teal-600 mb-1">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Upload
            </span>
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-slate-900 font-mono">
            {uploadMbps !== undefined ? uploadMbps.toFixed(2) : "--"}
          </div>
          <span className="text-xs text-slate-500 font-medium mt-0.5">
            Mbps
          </span>
        </div>

        {/* Ping Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col items-center justify-center hover:border-indigo-300 transition-colors">
          <div className="flex items-center space-x-1.5 text-indigo-600 mb-1">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Ping
            </span>
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-slate-900 font-mono">
            {pingMs !== undefined ? pingMs.toFixed(1) : "--"}
          </div>
          <span className="text-xs text-slate-500 font-medium mt-0.5">ms</span>
        </div>

        {/* Jitter Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col items-center justify-center hover:border-sky-300 transition-colors">
          <div className="flex items-center space-x-1.5 text-sky-600 mb-1">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Jitter
            </span>
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-slate-900 font-mono">
            {jitterMs !== undefined ? jitterMs.toFixed(1) : "--"}
          </div>
          <span className="text-xs text-slate-500 font-medium mt-0.5">ms</span>
        </div>
      </div>

      {/* Network & Info Meta Cards */}
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 text-blue-700 rounded-lg shrink-0">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"
              />
            </svg>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Public IP Address
            </div>
            <div className="font-semibold text-slate-800 font-mono">
              {clientIp || "Detecting..."}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-2 bg-teal-100 text-teal-700 rounded-lg shrink-0">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0h4m-4 0V11m0 0H9m1 0h1"
              />
            </svg>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Provider (ISP)
            </div>
            <div className="font-semibold text-slate-800">
              {ispName || "Detecting..."}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg shrink-0">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
              Server Location
            </div>
            <div className="font-semibold text-slate-800">
              {serverLocation || "Detecting..."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
