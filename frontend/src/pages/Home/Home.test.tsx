import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { HttpError } from "../../api/api.helper";
import { systemService } from "../../api/services/system.service";
import HomePage from ".";
import { formatUptime } from "./home.helper";

vi.mock("../../api/services/system.service", () => ({
  systemService: { getInfo: vi.fn(), getHealth: vi.fn() },
}));

const info = {
  name: "fullStack-2 API",
  version: "v1",
  environment: "test",
  timestamp: "2026-11-03T10:00:00.000Z",
};

describe("HomePage", () => {
  beforeEach(() => vi.resetAllMocks());

  it("shows API details when the backend responds", async () => {
    vi.mocked(systemService.getInfo).mockResolvedValue(info);
    vi.mocked(systemService.getHealth).mockResolvedValue({ uptime: 65, db: "connected" });

    render(<HomePage />);

    expect(screen.getByTestId("api-status-badge")).toHaveTextContent("Checking");
    expect(await screen.findByText("fullStack-2 API")).toBeInTheDocument();
    expect(screen.getByTestId("api-status-badge")).toHaveTextContent("Connected");
    expect(screen.getByText("connected")).toBeInTheDocument();
    expect(screen.getByText("1m 5s")).toBeInTheDocument();
  });

  it("shows the error and recovers on retry", async () => {
    vi.mocked(systemService.getInfo)
      .mockRejectedValueOnce(new HttpError(0, "Unable to reach the server."))
      .mockResolvedValueOnce(info);
    vi.mocked(systemService.getHealth).mockResolvedValue({ uptime: 1, db: "disconnected" });

    render(<HomePage />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Unable to reach the server.");
    expect(screen.getByTestId("api-status-badge")).toHaveTextContent("Disconnected");

    fireEvent.click(screen.getByRole("button", { name: "Check again" }));

    expect(await screen.findByText("fullStack-2 API")).toBeInTheDocument();
    expect(screen.getByText("disconnected")).toBeInTheDocument();
    expect(screen.queryByRole("alert")).not.toBeInTheDocument();
  });
});

describe("formatUptime", () => {
  it.each([
    [5.9, "5s"],
    [65, "1m 5s"],
    [3600, "1h 0m 0s"],
    [3725, "1h 2m 5s"],
  ])("formats %s seconds as %s", (input, expected) => {
    expect(formatUptime(input)).toBe(expected);
  });
});
