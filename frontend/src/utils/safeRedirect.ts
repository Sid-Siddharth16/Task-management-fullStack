// Only allow same-app paths as post-login redirect targets (prevents open redirects
// like ?redirect=https://evil.com or ?redirect=//evil.com).
export function safeRedirect(target: string | null | undefined, fallback: string): string {
  if (!target || typeof target !== "string") return fallback;
  if (!target.startsWith("/") || target.startsWith("//") || target.startsWith("/\\")) {
    return fallback;
  }
  // reject control characters, which some browsers strip ("/\t/evil.com" -> "//evil.com")
  // eslint-disable-next-line no-control-regex
  if (/[\u0000-\u001f\u007f]/.test(target)) return fallback;

  try {
    const url = new URL(target, window.location.origin);
    if (url.origin !== window.location.origin) return fallback;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return fallback;
  }
}
