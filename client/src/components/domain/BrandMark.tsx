export interface BrandMarkProps {
  size?: number;
}

export function BrandMark({ size = 26 }: BrandMarkProps) {
  return (
    <span className="inline-flex items-center gap-2">
      <span
        className="inline-flex items-center justify-center rounded-md"
        style={{ width: size, height: size, background: 'var(--accent)' }}
      >
        <svg
          width={size * 0.62}
          height={size * 0.62}
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <path
            d="M5 5h11l3 3v11H5z"
            stroke="white"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path
            d="M5 5l3 3H5"
            stroke="white"
            strokeWidth="1.8"
            strokeLinejoin="round"
          />
          <path d="M9 13h6M9 16h4" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
        </svg>
      </span>
      <span className="font-semibold text-[15px] tracking-tight">StudAI</span>
    </span>
  );
}
