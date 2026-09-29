import React, { useEffect, useRef, useState } from 'react';

interface AnimatedHeadingProps {
  children: React.ReactNode;
  className?: string;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'div';
  delay?: number; // ms
  shimmer?: boolean;
}

export const AnimatedHeading: React.FC<AnimatedHeadingProps> = ({
  children,
  className = '',
  as: Component = 'h2',
  delay = 0,
  shimmer = false,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <Component
      ref={elementRef as any}
      style={{
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className={`transition-all duration-700 ${
        isVisible
          ? 'opacity-100 translate-y-0 filter-none'
          : 'opacity-0 translate-y-6 blur-[1.5px]'
      } ${shimmer ? 'animate-title-shimmer' : ''} ${className}`}
    >
      {children}
    </Component>
  );
};

interface AnimatedTextProps {
  children: React.ReactNode;
  className?: string;
  as?: 'p' | 'span' | 'div';
  delay?: number; // ms
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  children,
  className = '',
  as: Component = 'p',
  delay = 100,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <Component
      ref={elementRef as any}
      style={{
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className={`transition-all duration-700 ${
        isVisible
          ? 'opacity-100 translate-y-0 filter-none'
          : 'opacity-0 translate-y-4 blur-[1px]'
      } ${className}`}
    >
      {children}
    </Component>
  );
};

interface AnimatedBadgeProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}

export const AnimatedBadge: React.FC<AnimatedBadgeProps> = ({
  children,
  className = '',
  delay = 50,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={elementRef}
      style={{
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
      }}
      className={`inline-flex items-center transition-all duration-500 ${
        isVisible
          ? 'opacity-100 scale-100 translate-y-0'
          : 'opacity-0 scale-95 translate-y-3'
      } ${className}`}
    >
      {children}
    </div>
  );
};

interface AnimatedCounterProps {
  target: number;
  suffix?: string;
  className?: string;
  duration?: number; // ms
}

export const AnimatedCounter: React.FC<AnimatedCounterProps> = ({
  target,
  suffix = '+',
  className = '',
  duration = 1800,
}) => {
  const [count, setCount] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasStarted(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!hasStarted) return;

    let startTime: number | null = null;
    let animationFrame: number;

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const step = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      setCount(Math.floor(easedProgress * target));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(step);
      } else {
        setCount(target);
      }
    };

    animationFrame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrame);
  }, [hasStarted, target, duration]);

  return (
    <span ref={elementRef} className={`tabular-nums ${className}`}>
      {count}
      {suffix}
    </span>
  );
};
