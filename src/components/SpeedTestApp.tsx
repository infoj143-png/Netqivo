"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import { SpeedGauge } from "./SpeedGauge";
import { ResultCards } from "./ResultCards";
import { TestHistory } from "./TestHistory";
import {
  runSpeedTest,
  TestState,
  SpeedTestResult,
  SpeedTestProgress,
  isMockModeEnabled,
} from "@/lib/speedtest-api";

const HISTORY_STORAGE_KEY = "speedtest_history_v1";

export const SpeedTestApp: React.FC = () => {
  const [testState, setTestState] = useState<TestState>("idle");
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [downloadMbps, setDownloadMbps] = useState<number | undefined>(
    undefined,
  );
  const [uploadMbps, setUploadMbps] = useState<number | undefined>(undefined);
  const [pingMs, setPingMs] = useState<number | undefined>(undefined);
  const [jitterMs, setJitterMs] = useState<number | undefined>(undefined);
  const [clientIp, setClientIp] = useState<string | undefined>(undefined);
  const [ispName, setIspName] = useState<string | undefined>(undefined);
  const [serverLocation, setServerLocation] = useState<string | undefined>(
    undefined,
  );

  const abortControllerRef = useRef<AbortController | null>(null);

  const [history, setHistory] = useState<SpeedTestResult[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {
      // Ignore
    }
    return [];
  });

  const [mockMode] = useState<boolean>(() => isMockModeEnabled());

  // Cleanup active test when page unmounts or user navigates away
  useEffect(() => {
    const handleUnload = () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };

    window.addEventListener("beforeunload", handleUnload);
    window.addEventListener("pagehide", handleUnload);

    return () => {
      window.removeEventListener("beforeunload", handleUnload);
      window.removeEventListener("pagehide", handleUnload);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const saveToHistory = useCallback((result: SpeedTestResult) => {
    setHistory((prev) => {
      const updated = [result, ...prev].slice(0, 20);
      try {
        localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
      } catch {
        // Ignore storage write errors
      }
      return updated;
    });
  }, []);

  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem(HISTORY_STORAGE_KEY);
    } catch {
      // Ignore
    }
  };

  const cancelTest = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setTestState("idle");
    setCurrentSpeed(0);
    setProgressPercent(0);
    setErrorMessage("Speed test cancelled.");
  };

  const startTest = async () => {
    // Prevent multiple tests from running concurrently
    if (abortControllerRef.current) {
      return;
    }

    const controller = new AbortController();
    abortControllerRef.current = controller;

    // Reset test metrics
    setTestState("preparing");
    setCurrentSpeed(0);
    setProgressPercent(0);
    setErrorMessage(null);
    setDownloadMbps(undefined);
    setUploadMbps(undefined);
    setPingMs(undefined);
    setJitterMs(undefined);

    const handleProgress = (progress: SpeedTestProgress) => {
      setTestState(progress.state);
      setCurrentSpeed(progress.currentSpeedMbps);
      setProgressPercent(progress.progressPercent);

      if (progress.pingMs !== undefined) setPingMs(progress.pingMs);
      if (progress.jitterMs !== undefined) setJitterMs(progress.jitterMs);
      if (progress.downloadMbps !== undefined)
        setDownloadMbps(progress.downloadMbps);
      if (progress.uploadMbps !== undefined) setUploadMbps(progress.uploadMbps);
      if (progress.clientIp !== undefined) setClientIp(progress.clientIp);
      if (progress.ispName !== undefined) setIspName(progress.ispName);
      if (progress.serverLocation !== undefined)
        setServerLocation(progress.serverLocation);
      if (progress.errorMessage !== undefined)
        setErrorMessage(progress.errorMessage);
    };

    try {
      const result = await runSpeedTest(handleProgress, {
        signal: controller.signal,
      });
      saveToHistory(result);
    } catch (err: unknown) {
      if (
        (err instanceof DOMException && err.name === "AbortError") ||
        (err instanceof Error && err.message.includes("cancelled"))
      ) {
        setTestState("idle");
        setCurrentSpeed(0);
        setProgressPercent(0);
        setErrorMessage("Speed test cancelled.");
      } else {
        const msg =
          err instanceof Error
            ? err.message
            : "Unable to complete speed test. Please check your network connection and try again.";
        setTestState("error");
        setErrorMessage(msg);
      }
    } finally {
      abortControllerRef.current = null;
    }
  };

  const isTesting =
    testState === "preparing" ||
    testState === "testing-ping" ||
    testState === "testing-download" ||
    testState === "testing-upload";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Mock mode banner indicator */}
      {mockMode && (
        <div className="bg-amber-50 border border-amber-200 text-amber-800 rounded-lg px-4 py-2 text-xs font-semibold flex items-center justify-between shadow-sm">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
            <span>
              Development Mock Mode is ACTIVE
              (NEXT_PUBLIC_ENABLE_MOCK_MODE=true)
            </span>
          </div>
          <span className="text-[10px] uppercase bg-amber-200 px-2 py-0.5 rounded font-bold">
            Simulated Results
          </span>
        </div>
      )}

      {/* Main Speed Gauge & Hero Section */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-10 shadow-sm flex flex-col items-center text-center">
        <SpeedGauge
          speed={currentSpeed}
          maxSpeed={100}
          state={testState}
          progressPercent={progressPercent}
        />

        {/* Start / Cancel / Retest Button */}
        <div className="mt-6">
          {isTesting ? (
            <button
              onClick={cancelTest}
              className="px-8 py-4 rounded-xl text-white font-extrabold text-lg bg-rose-600 hover:bg-rose-700 active:scale-95 shadow-lg shadow-rose-500/20 transition-all duration-200 flex items-center space-x-2 cursor-pointer"
              aria-label="Cancel Speed Test"
            >
              <svg
                className="w-5 h-5 mr-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              <span>Cancel Test</span>
            </button>
          ) : (
            <button
              onClick={startTest}
              className="px-8 py-4 rounded-xl text-white font-extrabold text-lg bg-blue-600 hover:bg-blue-700 active:scale-95 shadow-lg shadow-blue-500/20 transition-all duration-200 flex items-center space-x-2 cursor-pointer"
              aria-label={
                testState === "completed" || testState === "error"
                  ? "Retest Network"
                  : "Start Speed Test"
              }
            >
              <span>
                {testState === "completed" || testState === "error"
                  ? "Test Again"
                  : "Start Test"}
              </span>
            </button>
          )}
        </div>

        {/* Error / Cancellation Message Box */}
        {(testState === "error" || errorMessage) && errorMessage && (
          <div
            className={`mt-6 w-full max-w-lg rounded-xl p-4 text-sm flex items-start space-x-3 text-left border ${
              testState === "error"
                ? "bg-rose-50 border-rose-200 text-rose-800"
                : "bg-slate-50 border-slate-200 text-slate-700"
            }`}
          >
            <svg
              className={`w-5 h-5 shrink-0 mt-0.5 ${
                testState === "error" ? "text-rose-600" : "text-slate-500"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <div>
              <h4
                className={`font-bold ${
                  testState === "error" ? "text-rose-900" : "text-slate-800"
                }`}
              >
                {testState === "error" ? "Speed Test Error" : "Notice"}
              </h4>
              <p className="mt-1 text-xs">{errorMessage}</p>
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      <ResultCards
        downloadMbps={downloadMbps}
        uploadMbps={uploadMbps}
        pingMs={pingMs}
        jitterMs={jitterMs}
        clientIp={clientIp}
        ispName={ispName}
        serverLocation={serverLocation}
      />

      {/* Local Storage Test History Section */}
      <TestHistory history={history} onClearHistory={handleClearHistory} />
    </div>
  );
};
