import type { SVGProps } from "react";

type IconProps = Omit<SVGProps<SVGSVGElement>, "width" | "height"> & {
  className?: string;
  size?: number | string;
};

/**
 * Buzz mark — three arms radiating 120° apart from a centered hub
 * (broadcast / peace-symbol style). Top arm carries a small filled disc.
 */
export function BuzzIcon({ className, strokeWidth = 1.75, size = 24, ...rest }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
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
      <path d="M12 12 L12 7.75" />
      <path d="M12 12 L15.7 14.13" />
      <path d="M12 12 L8.3 14.13" />
      <circle cx="12" cy="6.6" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

/**
 * Drops mark — three stacked horizontal bars inside a ring (vinyl-stack style).
 */
export function DropsIcon({ className, strokeWidth = 1.75, size = 24, ...rest }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
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
