export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="currentColor" />
      <path d="M9 11h14M9 16h9M9 21h5" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
      <path
        d="m19 21 2.5 2.5L26 19"
        stroke="#fff"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export const APP_NAME = "TaskFlow";
