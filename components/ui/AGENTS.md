# UI Components Directory

<!-- Parent: ../AGENTS.md -->

## Purpose

Reusable atomic UI components (design system building blocks) for the Bible Soom application. These components follow atomic design principles and provide consistent styling, theming, and dark mode support across the entire application.

## Key Components

| Component | Purpose | Key Props |
|-----------|---------|-----------|
| `Button.tsx` | Primary/secondary action buttons | `variant`, `size`, `onClick`, `disabled` |
| `Modal.tsx` | Overlay dialog for focused interactions | `isOpen`, `onClose`, `title`, `children` |
| `Dropdown.tsx` | Select menu for options | `options`, `value`, `onChange` |
| `Input.tsx` | Text input field | `type`, `value`, `onChange`, `placeholder` |
| `Label.tsx` | Form label | `htmlFor`, `children` |
| `Card.tsx` | Content container with shadow/border | `title`, `children`, `className` |
| `Badge.tsx` | Status badge or tag | `color`, `text` |
| `Spinner.tsx` | Loading indicator | `size` |
| `Alert.tsx` | Notification banner | `type`, `message` |
| `Tabs.tsx` | Tab navigation component | `tabs`, `activeTab`, `onChange` |
| `ColorPicker.tsx` | Highlight color selector | `colors`, `selected`, `onChange` |
| `Skeleton.tsx` | Loading placeholder | `width`, `height` |
| `Drawer.tsx` | Side panel overlay | `isOpen`, `onClose`, `side` |
| `BackgroundDecoration.tsx` | Decorative SVG background | Theme-aware, used in page layouts |
| `SectionHeader.tsx` | Section title with divider | `title`, `subtitle` |

## Design System Principles

### 1. Tailwind CSS Integration
- All components use Tailwind utility classes
- Support `className` prop for customization and overrides
- Theme-aware color tokens from `tailwind.config.ts`:
  - `bg-theme-primary`, `text-theme-secondary`, etc.
  - Custom palettes: Blue, Beige, Neutral

### 2. Dark Mode Support
- Every component includes `dark:` variant styles
- Dark mode controlled by `ThemeProvider` (components/theme/)
- Example:
  ```tsx
  <div className="bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100">
  ```

### 3. TypeScript Props
- All components have TypeScript interfaces for props
- Proper type validation and autocomplete support
- Example:
  ```tsx
  interface ButtonProps {
    variant: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    onClick?: () => void;
    children: React.ReactNode;
  }
  ```

### 4. Accessibility
- Semantic HTML elements
- ARIA attributes where appropriate
- Keyboard navigation support
- Focus states for interactive elements

## Usage Patterns

### Basic Import
```tsx
import { Button, Modal, Input } from '@/components/ui';
```

### Component Composition
```tsx
<Modal isOpen={showModal} onClose={handleClose} title="Confirm Action">
  <p className="mb-4">Are you sure you want to delete this note?</p>
  <div className="flex gap-2">
    <Button variant="primary" onClick={handleConfirm}>Confirm</Button>
    <Button variant="outline" onClick={handleClose}>Cancel</Button>
  </div>
</Modal>
```

### Style Override
```tsx
// Component accepts className for Tailwind overrides
<Button
  variant="primary"
  className="w-full mt-4"  // Additional styles
>
  Submit
</Button>
```

### Dark Mode Styling
```tsx
// Component automatically handles dark mode via Tailwind dark: variants
<Card className="bg-white dark:bg-gray-800">
  <Input
    className="bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
  />
</Card>
```

## For AI Agents

### When Creating New UI Components

1. **Placement**: Add to this directory (`components/ui/`) for reusable atomic components
2. **File Naming**: Use `PascalCase.tsx` (e.g., `Button.tsx`, `ToggleSwitch.tsx`)
3. **Props Interface**: Always define TypeScript interface for props
   ```tsx
   interface MyComponentProps {
     title: string;
     onAction: () => void;
     className?: string;  // Always include for style overrides
   }

   export function MyComponent({ title, onAction, className = '' }: MyComponentProps) {
     return <div className={`base-styles ${className}`}>...</div>;
   }
   ```

4. **Dark Mode**: Include `dark:` variants for all color/background styles
   ```tsx
   <button className="bg-blue-500 dark:bg-blue-600 hover:bg-blue-600 dark:hover:bg-blue-700">
     Click Me
   </button>
   ```

5. **Export**: If there's an `index.ts` barrel file, add export there:
   ```tsx
   export { MyComponent } from './MyComponent';
   ```

### Styling Guidelines

- **Use Tailwind utilities** - Avoid inline styles or CSS modules
- **Responsive design** - Use `sm:`, `md:`, `lg:`, `xl:` breakpoints
- **Consistent spacing** - Use Tailwind spacing scale (`p-4`, `m-2`, `gap-3`)
- **Theme integration** - Use custom color tokens (`bg-theme-primary`) when appropriate
- **Transitions** - Add smooth transitions: `transition-colors duration-200`

### Common Patterns

**Loading State**:
```tsx
{loading ? <Spinner size="md" /> : <ContentComponent />}
```

**Error State**:
```tsx
{error && <Alert type="error" message={error.message} />}
```

**Conditional Rendering**:
```tsx
<Modal isOpen={showModal} onClose={handleClose} title="Settings">
  {user ? <UserSettings /> : <Alert type="warning" message="Please log in" />}
</Modal>
```

**Form Component**:
```tsx
<div className="space-y-4">
  <div>
    <Label htmlFor="email">Email</Label>
    <Input id="email" type="email" value={email} onChange={setEmail} />
  </div>
  <Button variant="primary" onClick={handleSubmit}>Submit</Button>
</div>
```

### Relationship with Feature Components

UI components are **building blocks** used by feature components:

- `components/passage/HighlightModal.tsx` uses: `Modal`, `ColorPicker`, `Button`
- `components/passage/PanelHeader.tsx` uses: `Dropdown`, `Button`
- `components/books/books-client.tsx` uses: `Card`, `Tabs`
- `components/mypage/mypage-client.tsx` uses: `Badge`, `Spinner`, `Alert`

**Rule**: Feature-specific logic goes in feature directories; reusable UI goes here.

## Dependencies

**Internal Dependencies**:
- None (this is the lowest layer of the component hierarchy)
- May import `lib/constants.ts` for color definitions (e.g., `HIGHLIGHT_COLORS`)

**External Dependencies**:
- `react` - Core React library
- `tailwindcss` - Utility-first CSS framework
- `lucide-react` - Icon library (used in several components like `Alert`, `Modal`)
- `clsx` or `cn` utility (if used for className merging)

## Theme System Integration

UI components integrate with the global theme system:

**Theme Colors** (from `tailwind.config.ts`):
- Blue theme: `bg-blue-50`, `text-blue-900`, etc.
- Beige theme: `bg-amber-50`, `text-amber-900`, etc.
- Neutral theme: `bg-gray-50`, `text-gray-900`, etc.

**Dark Mode Toggle**:
- Controlled by `ThemeProvider` (components/theme/theme-provider.tsx)
- Uses `dark` class on `<html>` element
- Components automatically adapt via `dark:` variants

**Example Component with Theme Support**:
```tsx
export function ThemedCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="
      bg-white dark:bg-gray-800
      border border-gray-200 dark:border-gray-700
      rounded-lg shadow-sm
      p-6
      transition-colors duration-200
    ">
      {children}
    </div>
  );
}
```

## Testing (Future Enhancement)

**Planned Testing Strategy**:
- **Unit Tests**: Jest + React Testing Library
  - Test component rendering with different props
  - Test user interactions (click, input, etc.)
  - Test dark mode variants
  - Test accessibility (ARIA attributes, keyboard navigation)

**Example Test Structure**:
```tsx
describe('Button', () => {
  it('renders with primary variant', () => {
    render(<Button variant="primary">Click Me</Button>);
    expect(screen.getByRole('button')).toHaveClass('bg-blue-500');
  });

  it('calls onClick when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click Me</Button>);
    fireEvent.click(screen.getByRole('button'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

## Performance Notes

- Components are lightweight (mostly styled wrappers)
- No heavy computations or side effects
- Use `React.memo()` if a component is re-rendering unnecessarily in parent context
- Icon components from `lucide-react` are tree-shakeable

---

**For questions about specific component implementations, refer to individual component files in this directory.**
