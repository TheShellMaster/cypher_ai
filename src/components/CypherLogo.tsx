import React from 'react';

interface CypherLogoProps {
  size?: number;
  className?: string;
  useImage?: boolean;
}

export const CypherLogo: React.FC<CypherLogoProps> = ({
  size = 24,
  className = '',
  useImage = true,
}) => {
  if (useImage) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden shadow-2xs select-none bg-zinc-950 ring-1 ring-zinc-800/40 ${className}`}
      >
        <img
          src="/cypher_brand_mark.jpg"
          alt="Cypher AI Logo"
          className="w-full h-full object-cover rounded-full"
          loading="eager"
        />
      </div>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 select-none ${className}`}
      aria-label="Logo Cypher AI"
    >
      <path
        d="M20 5C11.7157 5 5 11.7157 5 20C5 28.2843 11.7157 35 20 35C26.5 35 32 30.8 34 25C34.5 23.5 33.3 22 31.7 22C30.5 22 29.5 22.8 28.9 23.9C27.2 27.2 23.8 29.5 20 29.5C14.7533 29.5 10.5 25.2467 10.5 20C10.5 14.7533 14.7533 10.5 20 10.5C23.6 10.5 26.8 12.5 28.4 15.5C29.1 16.7 30.6 17.2 31.8 16.5C32.9 15.8 33.3 14.3 32.5 13.1C30 8.3 25.3 5 20 5Z"
        fill="currentColor"
        className="text-zinc-900 dark:text-zinc-100"
      />
      <circle cx="20" cy="20" r="3.5" fill="currentColor" className="text-zinc-900 dark:text-zinc-100" />
    </svg>
  );
};
