# Chart Components Documentation

## Overview

CharismaAI now includes interactive data visualization components built with Recharts that are fully integrated with our dark theme design system.

## Components

### EmotionalArcChart

Displays emotional intensity over time using a line chart.

**Props:**
- `emotionalArc: EmotionalArcPoint[]` - Array of emotional data points

**Data Structure:**
```typescript
interface EmotionalArcPoint {
  timestamp: string;  // ISO timestamp
  intensity: number;  // 0-1 scale
  emotion?: string;   // Optional emotion label
  context?: string;   // Optional context description
}
```

**Features:**
- Responsive design
- Custom tooltips with dark theme styling
- Time formatting (HH:MM)
- Intensity scale (0-10)
- Primary color (#00FFC2) for data visualization

### TopicRelevanceChart

Displays topic relevance scores using a bar chart.

**Props:**
- `topics: Topic[]` - Array of topic data

**Data Structure:**
```typescript
interface Topic {
  name: string;        // Topic name
  relevance: number;   // 0-1 scale
  keywords?: string[]; // Optional keywords
  description?: string; // Optional description
}
```

**Features:**
- Responsive design
- Sorted by relevance (highest first)
- Custom tooltips with dark theme styling
- Percentage display on Y-axis
- Angled X-axis labels for better readability
- Primary color (#00FFC2) for data visualization

## Usage Examples

### Basic Usage

```tsx
import { EmotionalArcChart, TopicRelevanceChart } from '@/components/visualization';

// In your component
<EmotionalArcChart emotionalArc={analysisData.emotionalArc || []} />
<TopicRelevanceChart topics={analysisData.topics || []} />
```

### With Custom Styling

```tsx
<Card className="bg-card shadow-card-glow">
  <CardHeader>
    <CardTitle className="flex items-center gap-2 text-foreground">
      <Heart className="h-5 w-5 text-primary" />
      Emotional Arc
    </CardTitle>
  </CardHeader>
  <CardContent>
    <div className="h-64">
      <EmotionalArcChart emotionalArc={emotionalData} />
    </div>
  </CardContent>
</Card>
```

## Theme Integration

All charts automatically use the CharismaAI dark theme:

- **Background**: Transparent (inherits from parent)
- **Grid Lines**: `#374151` with 30% opacity
- **Axis Labels**: `#9CA3AF` (muted foreground)
- **Data Colors**: `#00FFC2` (primary color)
- **Tooltips**: Card background with border styling

## Error Handling

Both components gracefully handle:
- Empty or undefined data arrays
- Missing or malformed data points
- Invalid timestamps

When no data is available, they display a "No data available" message styled with the muted foreground color.

## Testing

To test the charts, you can create sample data and render the components directly:

```tsx
const sampleData = [
  { timestamp: "2024-01-01T10:00:00Z", intensity: 0.7, emotion: "Excited" },
  { timestamp: "2024-01-01T10:05:00Z", intensity: 0.9, emotion: "Passionate" }
];

<EmotionalArcChart emotionalArc={sampleData} />
```

## Dependencies

- **Recharts**: Charting library
- **React**: UI framework
- **Tailwind CSS**: Styling
- **Lucide React**: Icons (for headers)

## Performance Considerations

- Charts are client-side components (`"use client"`)
- Responsive containers automatically adjust to parent size
- Fixed heights (h-64) recommended for consistent layout
- Large datasets are automatically handled by Recharts 