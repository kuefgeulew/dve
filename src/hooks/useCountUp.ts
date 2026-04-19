import { useEffect, useState } from 'react';

export function useCountUp(targetValue: number, duration: number) {
  const [currentValue, setCurrentValue] = useState(0);

  useEffect(() => {
    let frameId = 0;
    const start = performance.now();

    const step = (now: number) => {
      const elapsed = now - start;
      const t = Math.min(1, elapsed / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setCurrentValue(targetValue * eased);
      if (t < 1) {
        frameId = requestAnimationFrame(step);
      }
    };

    frameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frameId);
  }, [targetValue, duration]);

  return currentValue;
}
