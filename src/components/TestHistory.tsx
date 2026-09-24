"use client";

import React from "react";
import { SpeedTestResult } from "@/lib/speedtest-api";

interface TestHistoryProps {
  history: SpeedTestResult[];
  onClearHistory: () => void;
}

export const TestHistory: React.FC<TestHistoryProps> = ({
  history,
  onClearHistory,
}) => {
  const formatDate = (timestamp: number) => {
    try {
      const date = new Date(timestamp);
      return (
        date.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }) +
        ", " +
        date.toLocaleDateString([], {
          month: "short",
          day: "numeric",
          year: "numeric",
        })
      );
    } catch {
      return "Recent";
    }
  };

  if (history.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 shadow-sm">
        <svg
          className="w-12 h-12 mx-auto text-slate-300 mb-3"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3 className="text-base font-semibold text-slate-700 mb-1">
          No Recent Test History
        </h3>
        <p className="text-sm">
          Run your first internet speed test to start recording metrics.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <svg
            className="w-5 h-5 text-blue-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-lg font-bold text-slate-900">
            Recent Test History
          </h2>
          <span className="text-xs bg-slate-100 text-slate-600 font-medium px-2 py-0.5 rounded-full">
            {history.length} {history.length === 1 ? "test" : "tests"}
          </span>
        </div>
        <button
          onClick={onClearHistory}
          className="text-xs font-semibold text-rose-600 hover:text-rose-800 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-transparent hover:border-rose-200 transition-colors"
          aria-label="Clear all test history"
        >
          Clear History
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 text-xs font-semibold uppercase tracking-wider bg-slate-50">
              <th className="py-3 px-3 rounded-l-lg">Date & Time</th>
              <th className="py-3 px-3">Download</th>
              <th className="py-3 px-3">Upload</th>
              <th className="py-3 px-3">Ping</th>
              <th className="py-3 px-3">Jitter</th>
              <th className="py-3 px-3 rounded-r-lg">ISP</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {history.map((item, index) => (
              <tr key={index} className="hover:bg-blue-50/50 transition-colors">
                <td className="py-3 px-3 text-slate-600 font-medium whitespace-nowrap">
                  {formatDate(item.timestamp)}
                </td>
                <td className="py-3 px-3 font-semibold text-blue-600 font-mono">
                  {item.downloadMbps.toFixed(2)}{" "}
                  <span className="text-xs font-normal text-slate-500">
                    Mbps
                  </span>
                </td>
                <td className="py-3 px-3 font-semibold text-teal-600 font-mono">
                  {item.uploadMbps.toFixed(2)}{" "}
                  <span className="text-xs font-normal text-slate-500">
                    Mbps
                  </span>
                </td>
                <td className="py-3 px-3 text-slate-700 font-mono">
                  {item.pingMs.toFixed(1)}{" "}
                  <span className="text-xs font-normal text-slate-500">ms</span>
                </td>
                <td className="py-3 px-3 text-slate-700 font-mono">
                  {item.jitterMs.toFixed(1)}{" "}
                  <span className="text-xs font-normal text-slate-500">ms</span>
                </td>
                <td
                  className="py-3 px-3 text-slate-600 truncate max-w-[150px]"
                  title={item.ispName}
                >
                  {item.ispName}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
