import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface StatsCounterProps {
  value: number;
  label: string;
  suffix?: string;
  delay?: number;
}

export const StatsCounter = ({ value, label, suffix = '', delay = 0 }: StatsCounterProps) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      const duration = 1500;
      const steps = 40;
      const stepDuration = duration / steps;
      let currentStep = 0;

      const interval = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const easedProgress = 1 - Math.pow(1 - progress, 3); // easeOutCubic
        setDisplayValue(Math.round(value * easedProgress));

        if (currentStep >= steps) {
          clearInterval(interval);
          setDisplayValue(value);
        }
      }, stepDuration);

      return () => clearInterval(interval);
    }, delay);

    return () => clearTimeout(timer);
  }, [value, delay]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay / 1000 }}
      className="text-center"
    >
      <div className="text-4xl md:text-5xl font-bold text-foreground tabular-nums">
        {displayValue.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </motion.div>
  );
};
