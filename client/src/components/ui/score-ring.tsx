import React, { useEffect, useState } from 'react';

interface ScoreRingProps {
  score: number;
  size: 'sm' | 'md' | 'lg';
  color?: string;
  label?: string;
  showPercentage?: boolean;
}

const sizeMap = {
  sm: 60,
  md: 100,
  lg: 140,
} as const;

const strokeWidthMap = {
  sm: 6,
  md: 8,
  lg: 10,
} as const;

const fontSizeMap = {
  sm: 'text-sm',
  md: 'text-xl',
  lg: 'text-3xl',
} as const;

const labelFontSizeMap = {
  sm: 'text-[8px]',
  md: 'text-xs',
  lg: 'text-sm',
} as const;

function getScoreColor(score: number): string {
  if (score > 80) return '#22C55E';
  if (score >= 60) return '#F59E0B';
  return '#EF4444';
}

export function ScoreRing({
  score,
  size,
  color,
  label,
  showPercentage = true,
}: ScoreRingProps) {
  const [animatedOffset, setAnimatedOffset] = useState<number | null>(null);

  const dimension = sizeMap[size];
  const strokeWidth = strokeWidthMap[size];
  const radius = (dimension - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedScore = Math.min(100, Math.max(0, score));
  const targetOffset = circumference - (normalizedScore / 100) * circumference;

  const ringColor = color || getScoreColor(normalizedScore);

  useEffect(() => {
    // Start with full offset (empty ring)
    setAnimatedOffset(circumference);

    // Animate to target offset after a brief delay
    const timer = setTimeout(() => {
      setAnimatedOffset(targetOffset);
    }, 50);

    return () => clearTimeout(timer);
  }, [circumference, targetOffset]);

  return (
    <div
      className="relative inline-flex items-center justify-center"
      style={{ width: dimension, height: dimension }}
    >
      <svg
        width={dimension}
        height={dimension}
        className="transform -rotate-90"
      >
        {/* Background ring */}
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-gray-200 dark:text-gray-700"
        />
        {/* Progress ring */}
        <circle
          cx={dimension / 2}
          cy={dimension / 2}
          r={radius}
          fill="none"
          stroke={ringColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={animatedOffset ?? circumference}
          style={{
            transition: 'stroke-dashoffset 0.8s ease-out',
          }}
        />
      </svg>
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        {showPercentage && (
          <span
            className={`font-mono-data font-semibold ${fontSizeMap[size]}`}
            style={{ color: ringColor }}
          >
            {Math.round(normalizedScore)}
          </span>
        )}
        {label && (
          <span
            className={`text-gray-500 dark:text-gray-400 ${labelFontSizeMap[size]} mt-0.5`}
          >
            {label}
          </span>
        )}
      </div>
    </div>
  );
}

export default ScoreRing;
