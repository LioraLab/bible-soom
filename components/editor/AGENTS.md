<!-- Parent: ../AGENTS.md -->
# Components - Editor

## Purpose

Inline editor components for managing verse notes and highlights.

## Key Files

Editor components used within the Bible reading interface for creating and editing user annotations.

## For AI Agents

### Component Types

**Note Editor**:
- Inline markdown editor for verse notes
- Appears when user clicks note icon or existing note
- Auto-saves on blur or explicit save action
- Supports markdown formatting

**Highlight Manager**:
- Color picker for verse highlights
- Triggered by text selection or existing highlight click
- Uses colors from `HIGHLIGHT_COLORS` constant
- Visual feedback with color swatches

### Integration with PassageClient

These editors are embedded within `components/passage/passage-client.tsx`:
- Positioned near the verse being edited
- Receive verse data (verse_id, existing content)
- Emit save/delete events to parent
- Parent handles API calls to `/api/v1/notes` or `/api/v1/highlights`

### Common Patterns

```typescript
// Note Editor Usage
<NoteEditor
  verseId="Gen_1_1"
  initialContent="Existing note..."
  onSave={(verseId, content) => handleNoteSave(verseId, content)}
  onDelete={(verseId) => handleNoteDelete(verseId)}
  onCancel={() => setEditing(false)}
/>

// Highlight Color Picker
<HighlightPicker
  verseId="Gen_1_1"
  currentColor="yellow"
  onColorSelect={(verseId, color) => handleHighlight(verseId, color)}
  onRemove={(verseId) => handleRemoveHighlight(verseId)}
/>
```

### State Management

Editors are **controlled components**:
- Parent (PassageClient) manages verse data state
- Editors receive props and emit events
- Parent handles API persistence
- Optimistic UI updates before API confirmation

### Styling Considerations

- Dark mode support via Tailwind `dark:` variants
- Mobile-responsive (touch-friendly targets)
- Positioned relative to verse (context menu style)
- Z-index management to appear above content

## Dependencies

- **Internal**:
  - `app/api/v1/notes` - Note persistence endpoint
  - `app/api/v1/highlights` - Highlight persistence endpoint
  - `components/ui/` - Base UI components (buttons, inputs, modals)
  - `lib/constants.ts` - HIGHLIGHT_COLORS constant

- **External**:
  - React hooks (useState, useEffect, useRef)
  - Possibly markdown library (e.g., react-markdown)

## Common Modifications

- **Rich Text Editor**: Upgrade from plain markdown to WYSIWYG
- **Note Templates**: Add quick-insert templates (prayer, reflection, question)
- **Keyboard Shortcuts**: Implement shortcuts (Cmd+Enter to save, Esc to cancel)
- **Collaboration**: Add sharing or commenting features
- **Auto-save**: Implement debounced auto-save instead of explicit save button

## Related Files

- `components/passage/passage-client.tsx` - Parent container that uses these editors
- `components/passage/VerseDisplay.tsx` - Where edit triggers originate
- `lib/constants.ts` - Highlight colors and editor config
