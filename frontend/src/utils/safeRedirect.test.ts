import { describe, expect, it } from "vitest";
import { safeRedirect } from "./safeRedirect";

describe("safeRedirect", () => {
  it.each(["/dashboard", "/projects/42?tab=board", "/admin#users"])("allows %s", (path) => {
    expect(safeRedirect(path, "/fallback")).toBe(path);
  });

  it.each([
    null,
    "",
    "dashboard",
    "https://evil.com",
    "//evil.com",
    "/\\evil.com",
    "/\t/evil.com",
    "javascript:alert(1)",
  ])("rejects %s", (path) => {
    expect(safeRedirect(path, "/fallback")).toBe("/fallback");
  });
});
