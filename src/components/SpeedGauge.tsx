"use client";

import React from "react";
import { TestState } from "@/lib/speedtest-api";

interface SpeedGaugeProps {
  speed: number; // in Mbps
  maxSpeed?: number; // default 100 or 500
  state: TestState;
  progressPercent: number;
}

const STATE_LABELS: Record<TestState, string> = {
  idle: "Ready to Test",
  preparing: "Preparing...",
  "testing-ping": "Testing Ping & Jitter...",
  "testing-download": "Testing Download...",
  "testing-upload": "Testing Upload...",
  completed: "Test Completed",
  error: "Test Failed",
};

const STATE_BADGE_COLORS: Record<TestState, string> = {
  idle: "bg-blue-100 text-blue-800 border-blue-200",
  preparing: "bg-amber-100 text-amber-800 border-amber-200 animate-pulse",
  "testing-ping":
    "bg-indigo-100 text-indigo-800 border-indigo-200 animate-pulse",
  "testing-download": "bg-sky-100 text-sky-800 border-sky-200 animate-pulse",
  "testing-upload": "bg-teal-100 text-teal-800 border-teal-200 animate-pulse",
  completed: "bg-emerald-100 text-emerald-800 border-emerald-200",
  error: "bg-rose-100 text-rose-800 border-rose-200",
};

export const SpeedGauge: React.FC<SpeedGaugeProps> = ({
  speed,
  maxSpeed = 100,
  state,
  progressPercent,
}) => {
  // SVG gauge settings (240 degree arc gauge)
  const size = 280;
  const strokeWidth = 16;
  const center = size / 2;
  const radius = center - strokeWidth - 10;
  const startAngle = 150; // degrees
  const endAngle = 390; // degrees
  const totalAngle = endAngle - startAngle;

  // Calculate speed fraction capped at 1
  const speedRatio = Math.min(Math.max(speed / maxSpeed, 0), 1);
  const currentAngle = startAngle + speedRatio * totalAngle;

  // Convert polar coordinates to SVG Cartesian
  const polarToCartesian = (
    cx: number,
    cy: number,
    r: number,
    angleInDegrees: number,
  ) => {
    const angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0;
    return {
      x: cx + r * Math.cos(angleInRadians),
      y: cy + r * Math.sin(angleInRadians),
    };
  };

  const createArc = (start: number, end: number) => {
    const startPoint = polarToCartesian(center, center, radius, end);
    const endPoint = polarToCartesian(center, center, radius, start);
    const largeArcFlag = end - start <= 180 ? "0" : "1";
    return [
      "M",
      startPoint.x,
      startPoint.y,
      "A",
      radius,
      radius,
      0,
      largeArcFlag,
      0,
      endPoint.x,
      endPoint.y,
    ].join(" ");
  };

  const bgArcPath = createArc(startAngle, endAngle);
  const activeArcPath =
    currentAngle > startAngle ? createArc(startAngle, currentAngle) : "";

  // Needle end point
  const needleLen = radius - 15;
  const needlePoint = polarToCartesian(center, center, needleLen, currentAngle);

  return (
    <div className="flex flex-col items-center justify-center relative my-4">
      <div className="relative w-[280px] h-[280px]">
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          aria-label="Speed Gauge"
          className="drop-shadow-sm overflow-visible"
        >
          <defs>
            <linearGradient
              id="gaugeGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop offset="0%" stopColor="#2563eb" />
              <stop offset="50%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#0d9488" />
            </linearGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Arc */}
          <path
            d={bgArcPath}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
          />

          {/* Active Arc Progress */}
          {activeArcPath && (
            <path
              d={activeArcPath}
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              className="transition-all duration-300 ease-out"
              filter="url(#glow)"
            />
          )}

          {/* Gauge Ticks */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const angle = startAngle + ratio * totalAngle;
            const outerP = polarToCartesian(center, center, radius + 12, angle);
            const innerP = polarToCartesian(center, center, radius + 4, angle);
            return (
              <line
                key={ratio}
                x1={innerP.x}
                y1={innerP.y}
                x2={outerP.x}
                y2={outerP.y}
                stroke="#94a3b8"
                strokeWidth="2"
              />
            );
          })}

          {/* Needle */}
          <line
            x1={center}
            y1={center}
            x2={needlePoint.x}
            y2={needlePoint.y}
            stroke="#1e3a8a"
            strokeWidth="4"
            strokeLinecap="round"
            className="transition-all duration-300 ease-out"
          />
          <circle cx={center} cy={center} r="8" fill="#1e3a8a" />
          <circle cx={center} cy={center} r="4" fill="#ffffff" />
        </svg>

        {/* Center Digital Speed Display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pt-8 pointer-events-none">
          <span className="text-5xl font-extrabold tracking-tight text-slate-900 font-mono">
            {speed.toFixed(2)}
          </span>
          <span className="text-sm font-semibold uppercase tracking-wider text-blue-600 mt-1">
            Mbps
          </span>
        </div>
      </div>

      {/* Test Progress Bar */}
      {state !== "idle" && state !== "completed" && state !== "error" && (
        <div className="w-64 bg-slate-200 rounded-full h-2.5 mt-2 overflow-hidden shadow-inner">
          <div
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-300 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            role="progressbar"
            aria-valuenow={progressPercent}
            aria-valuemin={0}
            aria-valuemax={100}
          />
        </div>
      )}

      {/* State Status Badge */}
      <div className="mt-4">
        <span
          className={`px-4 py-1.5 rounded-full text-xs font-bold border ${STATE_BADGE_COLORS[state]}`}
          role="status"
          aria-live="polite"
        >
          {STATE_LABELS[state]}
        </span>
      </div>
    </div>
  );
};
