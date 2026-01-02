# Changelog

## Unreleased

### Added
- Theme system with light/dark mode support
  - Built-in themes: `default` (monospace, IDE-style) and `tufte` (serif, book-style)
  - Mode options: `dark` (default), `light`, or `auto` (follows OS preference)
  - Custom theme CSS paths via `lightPath` / `darkPath` config
  - Optional toggle hotkey (e.g., `mod+shift+l`) with localStorage persistence
  - OS theme change detection in auto mode
  - Theme toggle appears in the shortcuts bar when configured
- Paste to attach: Cmd+V pastes clipboard image or file path to current question
- Drag & drop anywhere on question card to attach images
- Path normalization for shell-escaped paths and macOS screenshot filenames
- Per-question image attachments for non-image questions
  - Subtle "+ attach" button at bottom-right of each question
  - Tab navigation within attach area, Esc to close
- Keyboard shortcuts bar showing all available shortcuts
- Session timeout with countdown badge and activity-based refresh
- Progress persistence via localStorage
- Image upload via drag-drop, file picker, or path/URL input

### Removed
- "A" keyboard shortcut for attach (conflicted with typing in text areas)

### Fixed
- Space/Enter in attach area no longer triggers option selection
- Duplicate response entries for image questions
- ArrowLeft/Right navigation in textarea and path inputs
- Focus management when closing attach panel
- Hover feedback and tick loop race conditions
- Paste attaching to wrong question when clicking options across questions

### Changed
- MAX_IMAGES increased from 2 to 12
- Timeout default is 600 seconds (10 minutes)
- Replaced TypeBox with plain TypeScript interfaces in schema.ts
- Consolidated code with reusable helpers (handleFileChange, setupDropzone, setupEdgeNavigation, getQuestionValue)

## Initial Release

### Features
- Single-select, multi-select, text, and image question types
- Recommended option indicator (`*`)
- Full keyboard navigation (arrows, Tab, Enter/Space)
- Question-centric navigation (left/right between questions, up/down between options)
- "Done" button for multi-select questions
- Submit with Cmd+Enter
- Session expiration overlay with Stay Here / Close Now options
- Dark IDE-inspired theme
