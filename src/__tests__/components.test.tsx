import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { SpeedGauge } from "@/components/SpeedGauge";
import { ResultCards } from "@/components/ResultCards";
import { TestHistory } from "@/components/TestHistory";
import { runSpeedTest } from "@/lib/speedtest-api";

// Mock process.env for test runs
const originalEnv = process.env;

describe("Component & Client Unit Tests", () => {
  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  describe("SpeedGauge Component", () => {
    it("renders digital speed readout and state status badge", () => {
      render(
        <SpeedGauge
          speed={45.2}
          maxSpeed={100}
          state="testing-download"
          progressPercent={50}
        />,
      );

      expect(screen.getByText("45.20")).toBeInTheDocument();
      expect(screen.getByText("Mbps")).toBeInTheDocument();
      expect(screen.getByText("Testing Download...")).toBeInTheDocument();
      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-valuenow",
        "50",
      );
    });

    it("renders idle status badge when state is idle", () => {
      render(
        <SpeedGauge
          speed={0}
          maxSpeed={100}
          state="idle"
          progressPercent={0}
        />,
      );

      expect(screen.getByText("0.00")).toBeInTheDocument();
      expect(screen.getByText("Ready to Test")).toBeInTheDocument();
    });
  });

  describe("ResultCards Component", () => {
    it("displays network metrics and placeholder defaults when values are omitted", () => {
      render(<ResultCards />);

      expect(screen.getAllByText("--").length).toBeGreaterThanOrEqual(4);
      expect(screen.getAllByText("Detecting...").length).toBe(3);
    });

    it("displays passed metrics accurately", () => {
      render(
        <ResultCards
          downloadMbps={95.4}
          uploadMbps={48.2}
          pingMs={12.3}
          jitterMs={1.5}
          clientIp="198.51.100.1"
          ispName="FiberNet Broadband"
          serverLocation="New York, USA"
        />,
      );

      expect(screen.getByText("95.40")).toBeInTheDocument();
      expect(screen.getByText("48.20")).toBeInTheDocument();
      expect(screen.getByText("12.3")).toBeInTheDocument();
      expect(screen.getByText("1.5")).toBeInTheDocument();
      expect(screen.getByText("198.51.100.1")).toBeInTheDocument();
      expect(screen.getByText("FiberNet Broadband")).toBeInTheDocument();
      expect(screen.getByText("New York, USA")).toBeInTheDocument();
    });
  });

  describe("TestHistory Component", () => {
    it("renders empty state when history is empty", () => {
      render(<TestHistory history={[]} onClearHistory={jest.fn()} />);

      expect(screen.getByText("No Recent Test History")).toBeInTheDocument();
    });

    it("renders history items and handles clear action click", () => {
      const mockClear = jest.fn();
      const mockHistory = [
        {
          downloadMbps: 88.5,
          uploadMbps: 42.1,
          pingMs: 14.0,
          jitterMs: 2.1,
          clientIp: "1.1.1.1",
          ispName: "Test Provider",
          serverLocation: "Test Node",
          timestamp: 1700000000000,
        },
      ];

      render(<TestHistory history={mockHistory} onClearHistory={mockClear} />);

      expect(screen.getByText("Recent Test History")).toBeInTheDocument();
      expect(screen.getByText("88.50")).toBeInTheDocument();
      expect(screen.getByText("Test Provider")).toBeInTheDocument();

      const clearBtn = screen.getByRole("button", {
        name: /clear all test history/i,
      });
      fireEvent.click(clearBtn);
      expect(mockClear).toHaveBeenCalledTimes(1);
    });
  });

  describe("Speedtest API Client (Mock Mode)", () => {
    it("executes mock speed test when NEXT_PUBLIC_ENABLE_MOCK_MODE=true", async () => {
      process.env.NEXT_PUBLIC_ENABLE_MOCK_MODE = "true";

      const progressEvents: string[] = [];
      const result = await runSpeedTest((prog) => {
        progressEvents.push(prog.state);
      });

      expect(progressEvents).toContain("preparing");
      expect(progressEvents).toContain("testing-ping");
      expect(progressEvents).toContain("testing-download");
      expect(progressEvents).toContain("testing-upload");
      expect(progressEvents).toContain("completed");

      expect(result.downloadMbps).toBeGreaterThan(0);
      expect(result.uploadMbps).toBeGreaterThan(0);
      expect(result.pingMs).toBeGreaterThan(0);
      expect(result.ispName).toContain("Mock");
    });
  });
});
