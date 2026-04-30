import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { className?: string };

/**
 * Buzz mark — three arms radiating 120° apart from a centered hub
 * (broadcast / peace-symbol style). Top arm carries a small filled disc.
 */
export function BuzzIcon({ className, strokeWidth = 1.75, ...rest }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      {/* Outer ring */}
      <circle cx="12" cy="12" r="10" />
      {/* Three arms from center, 120° apart */}
      {/* Top arm: from (12,12) up to (12, 4.5) */}
      <path d="M12 12 L12 4.5" />
      {/* Bottom-right arm: 120° clockwise from top */}
      <path d="M12 12 L18.5 15.75" />
      {/* Bottom-left arm: 240° clockwise from top */}
      <path d="M12 12 L5.5 15.75" />
      {/* Centered hub */}
      <circle cx="12" cy="12" r="0.9" fill="currentColor" stroke="none" />
      {/* Top disc on the antenna */}
      <circle cx="12" cy="3.75" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * Drops mark — three stacked horizontal bars inside a ring (vinyl-stack style).
 */
export function DropsIcon({ className, strokeWidth = 1.75, ...rest }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      {...rest}
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="6.75" y1="9" x2="17.25" y2="9" />
      <line x1="6.75" y1="12" x2="17.25" y2="12" />
      <line x1="6.75" y1="15" x2="17.25" y2="15" />
    </svg>
  );
}
