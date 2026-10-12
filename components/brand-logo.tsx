import type { SVGProps } from "react";

/** Approved compact MTR roadster: 12° lean and plain round wheels. */
export function Logo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="40" height="40" viewBox="0 0 88 88" fill="none"
      stroke="currentColor" strokeWidth="4.8" strokeLinecap="round" strokeLinejoin="round"
      aria-hidden="true" data-brand-mark="mtr-roadster" {...props}>
      <path d="M7 37h10M3 47h12M3 57h9" />
      <g transform="translate(11.3 0) skewX(-12)">
        <path d="M20 45l8-12h27l9 11 5 2a7 7 0 0 1 0 14H22a7.5 7.5 0 0 1-2-15z" />
        <g strokeWidth="3.6">
          <path d="M28 47v-8h5v8-8h5v8M42 39h8m-4 0v8M55 47v-8h5" />
        </g>
        <path d="M28 54h9m6 0h16" />
      </g>
      <circle cx="31" cy="65" r="5" />
      <circle cx="63" cy="65" r="5" />
    </svg>
  );
}
