import type { SVGProps } from "react";

export function RhythmFlowLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M15.5 6.783V17.217a2.5 2.5 0 0 1 -4.125 2.05L6.5 15.417" />
      <path d="M8.5 17.217V6.783a2.5 2.5 0 0 1 4.125 -2.05l4.875 3.85" />
      <path d="M12 12m-9 0a9 9 0 1 0 18 0a9 9 0 1 0 -18 0" />
    </svg>
  );
}
