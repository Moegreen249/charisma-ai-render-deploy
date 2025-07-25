/**
 * Domain models for metrics and measurement-related types
 */

export interface Metric<T = unknown> {
  id: string;
  name: string;
  value: T;
  unit?: string;
  category: string;
  timestamp?: Date;
  confidence?: number;
  description?: string;
}

export interface ScoreMetric extends Metric<number> {
  minValue: number;
  maxValue: number;
  threshold?: number;
}

export interface CategoryMetric extends Metric<string[]> {
  categories: string[];
  distribution?: Record<string, number>;
}

export interface TimeSeriesMetric extends Metric<TimeSeriesPoint[]> {
  timeRange: {
    start: Date;
    end: Date;
  };
}

export interface TimeSeriesPoint {
  timestamp: Date;
  value: number;
}

export interface MetricCollection {
  id: string;
  name: string;
  metrics: Metric[];
  aggregatedScore?: number;
  timestamp: Date;
}

export interface MetricThreshold {
  metric: string;
  minValue?: number;
  maxValue?: number;
  warningValue?: number;
  criticalValue?: number;
}
