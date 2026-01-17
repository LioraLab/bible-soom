<!-- Parent: ../AGENTS.md -->
# App - Components Showcase

## Purpose

UI component library showcase page for developers to preview and test components.

## Key Files

- **page.tsx** - Component showcase page
- **components-client.tsx** - Client component for interactive demos

## For AI Agents

### Page Overview

Development/documentation page that displays all available UI components from `components/ui/` with interactive examples.

### Showcase Sections

**Layout Components**:
- Container
- Grid
- Stack
- Divider

**Form Components**:
- Button (variants: primary, secondary, outline, ghost)
- Input (text, email, password, number)
- Textarea
- Select/Dropdown
- Checkbox
- Radio
- Switch/Toggle

**Feedback Components**:
- Alert (success, error, warning, info)
- Toast/Notification
- Loading Spinner
- Progress Bar
- Skeleton

**Overlay Components**:
- Modal/Dialog
- Dropdown Menu
- Tooltip
- Popover

**Data Display**:
- Card
- Table
- Badge
- Avatar
- Tag

**Navigation**:
- Tabs
- Breadcrumbs
- Pagination

### Component Demo Format

Each component section shows:
1. **Component name** and description
2. **Visual preview** with interactive controls
3. **Code example** (copy-paste ready)
4. **Props table** (name, type, default, description)
5. **Variants** (different styles/sizes)

Example:
```tsx
// Button Component
<div>
  <h3>Button</h3>
  <p>Primary action button with multiple variants</p>

  {/* Preview */}
  <div className="demo-row">
    <Button variant="primary">Primary</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="outline">Outline</Button>
  </div>

  {/* Code */}
  <CodeBlock language="tsx">
    {`<Button variant="primary">Click me</Button>`}
  </CodeBlock>

  {/* Props */}
  <PropsTable props={buttonProps} />
</div>
```

### Theme Switcher

Include theme toggle to show components in:
- Light mode
- Dark mode
- Different color themes (Blue, Beige, Neutral)

### Interactive Playground

Allow developers to:
- Adjust component props in real-time
- See code updates automatically
- Copy generated code to clipboard
- Test responsive behavior

### Search/Filter

- Search components by name
- Filter by category (Form, Feedback, Overlay, etc.)
- Filter by status (Stable, Beta, Deprecated)

### Component Status

Label each component:
- ✅ **Stable** - Production-ready
- 🚧 **Beta** - In development
- ⚠️ **Deprecated** - Use alternative

## Dependencies

- **Internal**:
  - `components/ui/` - All UI components
  - `components/theme/theme-provider` - Theme context

- **External**:
  - React
  - Syntax highlighting library (e.g., prism-react-renderer)

## Development Mode Only

This page should only be accessible in development:
```typescript
export default function ComponentsPage() {
  if (process.env.NODE_ENV === 'production') {
    redirect('/');
  }

  return <ComponentShowcase />;
}
```

Or protect with feature flag.

## Common Modifications

- **Add Storybook**: Migrate to Storybook for better component docs
- **Add Figma Integration**: Link to Figma design files
- **Add Accessibility Checks**: Show ARIA attributes and keyboard navigation
- **Add Usage Stats**: Track which components are used where
- **Add Version History**: Show component changelog

## Related Files

- `components/ui/` - All UI components being showcased
- `tailwind.config.ts` - Theme configuration
- `components/theme/theme-provider.tsx` - Theme context

## Note for Production

Consider removing this route in production builds or protecting it behind authentication for internal team use only.
