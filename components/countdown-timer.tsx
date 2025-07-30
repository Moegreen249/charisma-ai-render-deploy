"use client";

import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface CountdownTimerProps {
  targetDate: Date;
  title?: string;
  subtitle?: string;
  completedTitle?: string;
  completedSubtitle?: string;
  showDays?: boolean;
  showHours?: boolean;
  showMinutes?: boolean;
  showSeconds?: boolean;
  className?: string;
  onComplete?: () => void;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  targetDate,
  title = "Coming Soon",
  subtitle = "Something amazing is on the way",
  completedTitle = "We're Live!",
  completedSubtitle = "Welcome to the future",
  showDays = true,
  showHours = true,
  showMinutes = true,
  showSeconds = true,
  className,
  onComplete
}) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    total: 0
  });
  const [isComplete, setIsComplete] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const calculateTimeLeft = (): TimeLeft => {
      const now = new Date().getTime();
      const target = new Date(targetDate).getTime();
      const difference = target - now;

      if (difference <= 0) {
        return {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          total: 0
        };
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        minutes: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
        seconds: Math.floor((difference % (1000 * 60)) / 1000),
        total: difference
      };
    };

    const updateCountdown = () => {
      const newTimeLeft = calculateTimeLeft();
      setTimeLeft(newTimeLeft);

      if (newTimeLeft.total <= 0 && !isComplete) {
        setIsComplete(true);
        onComplete?.();
      }
    };

    // Initial calculation
    updateCountdown();

    // Set up interval
    const timer = setInterval(updateCountdown, 1000);

    return () => clearInterval(timer);
  }, [targetDate, isComplete, onComplete]);

  // Don't render anything until mounted to avoid hydration mismatch
  if (!mounted) {
    return (
      <div className={cn("text-center py-8", className)}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-8"></div>
          <div className="flex justify-center gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-gray-200 rounded-lg p-4 w-20 h-20"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const TimeUnit: React.FC<{
    value: number;
    label: string;
    show: boolean;
  }> = ({ value, label, show }) => {
    if (!show) return null;

    return (
      <div className="flex flex-col items-center">
        <div className="relative">
          {/* Background glow */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-blue-500/20 rounded-xl blur-xl transform scale-110"></div>

          {/* Main container */}
          <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-4 min-w-[80px] sm:min-w-[100px]">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white to-white/80 tabular-nums">
              {value.toString().padStart(2, '0')}
            </div>

            {/* Animated border */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-purple-500/0 via-purple-500/50 to-purple-500/0 opacity-0 transition-opacity duration-1000 animate-pulse"></div>
          </div>
        </div>

        <div className="mt-2 text-sm sm:text-base font-medium text-white/70 uppercase tracking-wider">
          {label}
        </div>
      </div>
    );
  };

  if (isComplete) {
    return (
      <div className={cn("text-center py-8", className)}>
        <div className="relative">
          {/* Celebration animation background */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full opacity-20 animate-ping"></div>
          </div>

          <div className="relative z-10">
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 mb-4 animate-pulse">
              {completedTitle}
            </h2>
            <p className="text-lg sm:text-xl text-white/80 max-w-2xl mx-auto">
              {completedSubtitle}
            </p>

            {/* Sparkle effects */}
            <div className="absolute top-0 left-1/4 w-2 h-2 bg-yellow-400 rounded-full animate-bounce delay-100"></div>
            <div className="absolute top-8 right-1/4 w-1 h-1 bg-pink-400 rounded-full animate-bounce delay-300"></div>
            <div className="absolute bottom-8 left-1/3 w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce delay-500"></div>
          </div>
        </div>
      </div>
    );
  }

  const visibleUnits = [
    { value: timeLeft.days, label: 'Days', show: showDays },
    { value: timeLeft.hours, label: 'Hours', show: showHours },
    { value: timeLeft.minutes, label: 'Minutes', show: showMinutes },
    { value: timeLeft.seconds, label: 'Seconds', show: showSeconds }
  ].filter(unit => unit.show);

  return (
    <div className={cn("text-center py-8", className)}>
      {/* Title and subtitle */}
      <div className="mb-8 sm:mb-12">
        <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400 mb-4">
          {title}
        </h2>
        {subtitle && (
          <p className="text-base sm:text-lg lg:text-xl text-white/70 max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        )}
      </div>

      {/* Countdown display */}
      <div className="flex flex-wrap justify-center gap-4 sm:gap-6 lg:gap-8">
        {visibleUnits.map((unit, index) => (
          <React.Fragment key={unit.label}>
            <TimeUnit
              value={unit.value}
              label={unit.label}
              show={unit.show}
            />
            {index < visibleUnits.length - 1 && (
              <div className="flex items-center">
                <div className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white/30 animate-pulse">
                  :
                </div>
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Progress indicator */}
      <div className="mt-8 sm:mt-12 max-w-lg mx-auto">
        <div className="relative h-2 bg-white/10 rounded-full overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full transform origin-left scale-x-0 animate-pulse"></div>
        </div>
        <div className="mt-2 text-xs sm:text-sm text-white/50">
          Every second brings us closer...
        </div>
      </div>
    </div>
  );
};

export default CountdownTimer;
