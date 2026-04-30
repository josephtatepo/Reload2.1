interface WordmarkProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function Wordmark({ size = "md", className = "" }: WordmarkProps) {
  const sizeClass = size === "sm" ? "text-base" : size === "lg" ? "text-2xl" : "text-lg";
  return (
    <span
      className={`font-black tracking-[-0.04em] leading-none inline-flex items-baseline ${sizeClass} ${className}`}
      data-testid="text-wordmark"
    >
      <span className="text-white">RELO</span>
      <span style={{ color: "#22D3EE" }}>A</span>
      <span className="text-white">D</span>
      <span style={{ color: "#F4BE44" }} className="ml-0.5">.</span>
    </span>
  );
}
