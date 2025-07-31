# Unified Layout System Guide

This guide explains how to use the new unified layout system to fix styling conflicts and create consistent UI across the CharismaAI platform.

## Components Overview

### 1. UnifiedLayout
Main layout wrapper that provides consistent structure for all pages.

```tsx
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';

export default function Page() {
  return (
    <UnifiedLayout variant="default" showFooter={true}>
      <h1>Your page content</h1>
    </UnifiedLayout>
  );
}
```

**Props:**
- `variant`: 'default' | 'admin' | 'auth' - Changes background and styling
- `showFooter`: boolean - Whether to show the footer
- `maxWidth`: Controls container max-width

### 2. UnifiedNavigation
Consistent navigation bar with responsive design and user authentication.

**Features:**
- Responsive mobile menu
- User authentication states
- Admin role detection
- Scroll-based backdrop blur
- Consistent styling across platform

### 3. UnifiedFooter
Professional footer with links, social media, and contact information.

**Features:**
- Responsive grid layout
- Social media links
- Contact information
- Legal links
- Brand consistency

### 4. AdminLayout
Specialized layout for admin panels with sidebar navigation.

```tsx
import { AdminLayout } from '@/components/layout/AdminLayout';

export default function AdminPage() {
  return (
    <AdminLayout>
      <h1>Admin Dashboard</h1>
    </AdminLayout>
  );
}
```

**Features:**
- Collapsible sidebar
- Breadcrumb navigation
- Search functionality
- User profile display
- Consistent admin theming

## Theme Configuration

The unified theme is defined in `lib/theme-config.ts`:

```tsx
import { themeConfig } from '@/lib/theme-config';

// Use theme values
className={cn('p-6', themeConfig.spacing.card)}
className={themeConfig.colors.glass.background}
className={themeConfig.typography.gradient}
```

## Migration Guide

### Step 1: Update Page Layouts

**Before:**
```tsx
export default function Page() {
  return (
    <div className="min-h-screen bg-gray-950">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {/* content */}
      </main>
      <Footer />
    </div>
  );
}
```

**After:**
```tsx
import { UnifiedLayout } from '@/components/layout/UnifiedLayout';

export default function Page() {
  return (
    <UnifiedLayout>
      {/* content */}
    </UnifiedLayout>
  );
}
```

### Step 2: Update Admin Pages

**Before:**
```tsx
// app/admin/layout.tsx - OLD
export default function AdminLayout({ children }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-blue-900">
      {/* complex sidebar code */}
      <main>{children}</main>
    </div>
  );
}
```

**After:**
```tsx
import { AdminLayout } from '@/components/layout/AdminLayout';

export default function AdminLayoutPage({ children }) {
  return <AdminLayout>{children}</AdminLayout>;
}
```

### Step 3: Update Individual Components

Replace hardcoded styles with theme configuration:

**Before:**
```tsx
<div className="bg-white/10 backdrop-blur-md border border-white/20 p-6">
```

**After:**
```tsx
<div className={cn(themeConfig.colors.glass.background, themeConfig.colors.glass.border, themeConfig.spacing.card)}>
```

## Layout Variants

### Default Variant
For main application pages:
```tsx
<UnifiedLayout variant="default">
  {/* Regular app content */}
</UnifiedLayout>
```

### Admin Variant
For admin pages (alternative to AdminLayout):
```tsx
<UnifiedLayout variant="admin" showFooter={false}>
  {/* Admin content */}
</UnifiedLayout>
```

### Auth Variant
For authentication pages:
```tsx
<UnifiedLayout variant="auth" showFooter={false}>
  {/* Login/signup forms */}
</UnifiedLayout>
```

## Responsive Behavior

The unified layout system provides:

- **Mobile-first design**
- **Consistent breakpoints**
- **Proper mobile menu handling**
- **Touch-friendly interactions**
- **Accessibility compliance**

## Styling Standards

### Glass Morphism Effects
```tsx
// Use theme helper
import { getGlassEffect } from '@/lib/theme-config';

<div className={getGlassEffect(10)}>
  {/* 10% opacity glass effect */}
</div>
```

### Gradient Text
```tsx
import { getGradientText } from '@/lib/theme-config';

<h1 className={getGradientText()}>
  Gradient Text
</h1>
```

### Consistent Spacing
```tsx
// Page container
<div className={themeConfig.spacing.page}>

// Card padding
<div className={themeConfig.spacing.card}>

// Section spacing
<section className={themeConfig.spacing.section}>
```

## Common Patterns

### Page Header
```tsx
<div className="mb-8">
  <h1 className={cn('text-3xl font-bold', themeConfig.typography.gradient)}>
    Page Title
  </h1>
  <p className="text-gray-400 mt-2">Page description</p>
</div>
```

### Card Component
```tsx
<div className={cn(
  themeConfig.colors.glass.background,
  themeConfig.colors.glass.border,
  themeConfig.spacing.card,
  'rounded-lg'
)}>
  {/* Card content */}
</div>
```

### Button with Theme
```tsx
<Button className={cn(
  'bg-gradient-to-r',
  themeConfig.colors.gradients.button,
  themeConfig.animation.hover
)}>
  Action Button
</Button>
```

## Troubleshooting

### Layout Issues
1. Check if you're using the correct variant
2. Ensure proper container max-width
3. Verify responsive breakpoints

### Styling Conflicts
1. Use theme configuration instead of hardcoded values
2. Check z-index conflicts using themeConfig.zIndex
3. Ensure consistent spacing with theme values

### Mobile Issues
1. Test mobile menu functionality
2. Check touch targets are >= 44px
3. Verify scroll behavior on mobile overlays

## Best Practices

1. **Always use UnifiedLayout** for page wrappers
2. **Reference theme configuration** instead of hardcoded values
3. **Test responsive behavior** on all screen sizes
4. **Maintain consistent spacing** using theme values
5. **Use semantic HTML** for accessibility
6. **Follow component patterns** established in the system

## Support

For issues with the unified layout system:
1. Check this documentation
2. Review the theme configuration
3. Test with different variants
4. Verify responsive behavior