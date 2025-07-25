import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Generic helper functions
export function mapValues<T, U>(obj: Record<string, T>, fn: (value: T, key: string) => U): Record<string, U> {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key, fn(value, key)])
  );
}

export function pickBy<T>(obj: Record<string, T>, predicate: (value: T, key: string) => boolean): Record<string, T> {
  return Object.fromEntries(
    Object.entries(obj).filter(([key, value]) => predicate(value, key))
  );
}

export function omit<T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
}

export function pick<T extends Record<string, unknown>, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach(key => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

export function groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    groups[key] = groups[key] || [];
    groups[key].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

export function isNonNullable<T>(value: T | null | undefined): value is T {
  return value != null;
}

export function isDefined<T>(value: T | undefined): value is T {
  return value !== undefined;
}

export function assertNever(value: never): never {
  throw new Error(`Unexpected value: ${value}`);
}

export function debounce<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let timeoutId: ReturnType<typeof setTimeout>;
  return ((...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  }) as T;
}

export function throttle<T extends (...args: unknown[]) => void>(fn: T, delay: number): T {
  let lastCall = 0;
  return ((...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      fn(...args);
    }
  }) as T;
}
