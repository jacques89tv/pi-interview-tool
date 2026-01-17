# Changelog

## 2026-01-17

### Added
- **Code blocks**: Display code snippets in questions and options
  - Question-level `codeBlock` field shown below question text, above options
  - Rich options: options can be `{ label, code? }` objects instead of plain strings
  - Syntax highlighting for diff (`lang: "diff"`) with green/red line coloring
  - Optional file path and line range display in header
  - Line highlighting via `highlights` array
  - Line numbers shown when `file` or `lines` specified
- **Light markdown in questions**: Question titles and context now render `**bold**`, `` `code` ``, and auto-break numbered lists
- **Default theme toggle hotkey**: `Cmd+Shift+L` (Mac) / `Ctrl+Shift+L` (Windows/Linux) now works out of the box
- **Fixed port setting**: Configure `port` in settings to use a consistent port across sessions
- Shared settings module (`settings.ts`) for consistent settings access across tool and server

### Removed
- **Voice mode**: Removed ElevenLabs voice interview integration entirely
  - Deleted `elevenlabs.ts`, `form/voice.js`, `form/settings.js`
  - Removed voice toggle button, voice indicator, settings modal, API key modal from HTML
  - Removed all voice-related CSS styles and CSS variables
  - Removed `v` keyboard shortcut for voice toggle
  - Simplified settings.ts (removed voice settings and updateVoiceSettings)
  - Removed transcript handling from server and responses

### Changed
- Migrated from `~/.pi/agent/tools/` to `~/.pi/agent/extensions/` folder structure (pi-mono v0.35.0)
- Updated to new extension API: `CustomToolFactory` -> `ExtensionAPI` with `pi.registerTool()`
- Options can now be strings OR objects with `{ label, code? }` structure

### Fixed
- Radio/checkbox alignment on multi-line option text (now aligns to top)
- `fileInput is not defined` error in keyboard handler
- `pi.cwd` changed to `ctx.cwd` in tool execute function
- **Paste handling**: Regular text no longer intercepted as image attachment; only paths ending with image extensions (`.png`, `.jpg`, `.jpeg`, `.gif`, `.webp`) are treated as attachments
- **Image limit enforcement**: `MAX_IMAGES` limit now consistently enforced for both question images and attachments (was only checking question images)

---

## 2026-01-02

### Added
- **Multi-agent queue detection**: When another interview is active, new interviews print URL instead of auto-opening browser, preventing focus stealing
- **Session heartbeat system**: Browser sends heartbeat every 5s; server tracks active sessions
- **Abandoned interview recovery**: Questions saved to `~/.pi/interview-recovery/` on timeout or stale detection
- **Server watchdog**: Detects lost heartbeats (60s grace) and saves recovery before closing
- **Tab close detection**: Best-effort cancel via `pagehide` + `sendBeacon` API
- **Reload protection**: Cmd+R / F5 detected to prevent false cancel on refresh
- **Queued interview toast**: Active interviews show a top-right toast with a dropdown to open queued sessions
- **Queued tool panel output**: Queued interview details render in the tool result panel with a single-line transcript summary
- **Sessions endpoint**: `GET /sessions` returns active/waiting sessions for in-form queue UI
- "Other..." text input option for single/multi select questions
  - Keyboard selection (Enter/Space) auto-focuses the text input
  - Value restoration from localStorage
- Session status bar at top of form
  - Shows cwd path with `~` home directory normalization (cross-platform)
  - Git branch detection via `git rev-parse`
  - Short session ID for identification
- Dynamic document title: `projectName (branch) | sessionId` for tab identification
- `--bg-active-tint` CSS variable for theme-aware active question styling
- Recovery file auto-cleanup (files older than 7 days)

### Changed
- Active question focus styling uses gradient background tint instead of border-only
- Path normalization moved server-side using `os.homedir()` for cross-platform support
- Session registration uses upsert pattern (handles re-registration after prune)
- Cancel endpoint accepts `reason` field: "timeout", "user", or "stale"
- Queue toast position moved to top-right with compact layout

### Fixed
- "Other" option keyboard selection now focuses text input instead of advancing to next question
- "Other" option accepts typing immediately when focused via keyboard
- Light mode active question gradient visibility (increased tint opacity)
- Question focus scroll uses nearest positioning to avoid jarring jumps
- Server-side timeout only starts when browser auto-opens (not for queued interviews)
- `formatTimeAgo` handles negative timestamps (clock skew)
- Race conditions prevented via `completed` flag on server
- Duplicate cancel requests prevented via `cancelSent` flag on client

---

## 2026-01-01

### Added
- **Voice interview mode**: Natural voice-based interviewing powered by ElevenLabs Conversational AI
  - Questions read aloud, answers captured via speech
  - Bidirectional sync: click/keyboard navigate to any question, AI adapts
  - Intelligent cycling through unanswered questions
  - Hybrid mode: type/click anytime during voice session
  - Visual indicators: voice-focus styling, status indicator with progress
  - Full transcript returned with responses
  - Activation via URL param (`?voice=true`), toggle button, or schema config
- Voice controller state machine with WebRTC connection management
- `window.__INTERVIEW_API__` bridge for cross-module communication
- `getAnsweredQuestionIds()` and `getAllUnanswered()` helper functions
- `focusQuestion()` now accepts `source` parameter ('user' | 'voice')
- Voice-specific CSS variables in all theme files
- ElevenLabs agent auto-creation from interview questions
- API key input UI with localStorage persistence

### Changed
- `InterviewServerOptions` extended with `voiceApiKey`
- `InterviewServerCallbacks.onSubmit` now accepts optional transcript
- `InterviewDetails` extended with `transcript` field
- `buildPayload()` includes transcript when voice mode used

---

## 2026-01-02

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
