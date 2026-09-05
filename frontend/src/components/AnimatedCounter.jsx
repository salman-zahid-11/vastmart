import { useEffect, useRef, useState } from 'react';
import { useInView, useMotionValue, useSpring } from 'framer-motion';

function AnimatedCounter({ value, prefix = '', suffix = '', duration = 1.2 }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.5 });
  const [displayValue, setDisplayValue] = useState(0);

  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, { duration: duration * 1000, bounce: 0 });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, value, motionValue]);

  useEffect(() => {
    const unsubscribe = springValue.on('change', (latest) => {
      setDisplayValue(Math.round(latest));
    });
    return unsubscribe;
  }, [springValue]);

  return (
    <span ref={ref}>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
}

export default AnimatedCounter;