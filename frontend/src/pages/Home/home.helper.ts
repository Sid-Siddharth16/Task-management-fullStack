// 3725 -> "1h 2m 5s"
export const formatUptime = (totalSeconds: number) => {
  const seconds = Math.floor(totalSeconds);
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return [h && `${h}h`, (h || m) && `${m}m`, `${s}s`].filter(Boolean).join(" ");
};
