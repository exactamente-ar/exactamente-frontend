import { useEffect, useRef, useState } from 'react';

interface Props {
  value: number;
  className?: string;
}

export default function RollingNumber({ value, className = '' }: Props) {
  const [animationState, setAnimationState] = useState<{
    prev: number;
    current: number;
    direction: 'up' | 'down';
  } | null>(null);

  const prevValueRef = useRef(value);
  const isInitialMount = useRef(true);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    const prev = prevValueRef.current;
    if (value !== prev) {
      prevValueRef.current = value;
      const direction = value > prev ? 'up' : 'down';
      setAnimationState({ prev, current: value, direction });

      const timer = setTimeout(() => {
        setAnimationState(null);
      }, 250);

      return () => clearTimeout(timer);
    }
  }, [value]);

  if (!animationState) {
    return (
      <span
        className={`inline-flex h-5 items-center justify-center tabular-nums overflow-hidden ${className}`}
      >
        <span>{value}</span>
      </span>
    );
  }

  const { prev, current, direction } = animationState;
  const prevAnimClass = direction === 'up' ? 'animate-roll-out-down' : 'animate-roll-out-up';
  const currAnimClass = direction === 'up' ? 'animate-roll-in-down' : 'animate-roll-in-up';

  return (
    <span
      className={`relative inline-flex h-5 items-center justify-center tabular-nums overflow-hidden ${className}`}
    >
      <span key={`prev-${prev}`} className={`absolute ${prevAnimClass}`}>
        {prev}
      </span>
      <span key={`curr-${current}`} className={currAnimClass}>
        {current}
      </span>
    </span>
  );
}
