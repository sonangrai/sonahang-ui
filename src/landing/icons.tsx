/**
 * Icons used only by the landing page. The library ships its own icons
 * inside the components that need them, so these stay out of `src/index.ts`.
 */

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export const BookIcon = () => (
  <svg viewBox="0 0 16 16" {...stroke} aria-hidden="true">
    <path d="M8 4.2C6.9 3.3 5.6 2.9 4 2.9H2v9.4h2c1.6 0 2.9.4 4 1.3 1.1-.9 2.4-1.3 4-1.3h2V2.9h-2c-1.6 0-2.9.4-4 1.3Z" />
    <path d="M8 4.2v9.4" />
  </svg>
);

export const PackageIcon = () => (
  <svg viewBox="0 0 16 16" {...stroke} aria-hidden="true">
    <path d="M8 1.8 14 5v6l-6 3.2L2 11V5l6-3.2Z" />
    <path d="M2 5l6 3.2L14 5M8 8.2v6" />
  </svg>
);

export const GithubIcon = () => (
  <svg viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
    <path d="M8 .2a8 8 0 0 0-2.5 15.6c.4.07.55-.17.55-.38v-1.3c-2.2.48-2.7-1.07-2.7-1.07-.36-.93-.89-1.18-.89-1.18-.73-.5.05-.49.05-.49.8.06 1.23.83 1.23.83.72 1.23 1.88.88 2.34.67.07-.52.28-.88.51-1.08-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.22 2.2.82a7.6 7.6 0 0 1 4 0c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48v2.2c0 .21.14.46.55.38A8 8 0 0 0 8 .2Z" />
  </svg>
);

export const ArrowRightIcon = () => (
  <svg viewBox="0 0 16 16" {...stroke} aria-hidden="true">
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);

export const SearchIcon = () => (
  <svg viewBox="0 0 16 16" {...stroke} aria-hidden="true">
    <circle cx="7.2" cy="7.2" r="4.4" />
    <path d="m10.5 10.5 2.7 2.7" />
  </svg>
);

export const SparkIcon = () => (
  <svg viewBox="0 0 16 16" {...stroke} aria-hidden="true">
    <path d="M8 1.6 9.6 6 14 7.6 9.6 9.2 8 13.6 6.4 9.2 2 7.6 6.4 6 8 1.6Z" />
  </svg>
);
