# Plan: E-dit App Fixes and UI/UX Enhancements

This plan outlines the changes to implement clipboard paste support, style updates, global scrollbar hiding, and the new Presets modal.

## Proposed Changes

---

### Global Styling

#### [MODIFY] [globals.css](file:///d:/Documents/Antigravity%20Projects/E-dit-Desktop/src/styles/globals.css)
- Hide the scrollbar globally by setting `display: none` on `::-webkit-scrollbar` and setting `scrollbar-width: none` & `-ms-overflow-style: none` on `*`. This keeps mouse wheel scrolling functional while removing the visual scrollbar everywhere.

---

### Core Components

#### [MODIFY] [TextEditor.tsx](file:///d:/Documents/Antigravity%20Projects/E-dit-Desktop/src/components/Editor/TextEditor.tsx)
- Accept a `textareaRef?: React.RefObject<HTMLTextAreaElement>` prop and pass it to the `<textarea>` element to allow parent components to find cursor positions and selections.

#### [MODIFY] [SplitView.tsx](file:///d:/Documents/Antigravity%20Projects/E-dit-Desktop/src/components/Editor/SplitView.tsx)
- Accept `leftTextareaRef` and `rightTextareaRef` and pass them to the respective `TextEditor` instances.

#### [MODIFY] [Workspace.tsx](file:///d:/Documents/Antigravity%20Projects/E-dit-Desktop/src/components/Layout/Workspace.tsx)
- Maintain `leftTextareaRef` and `rightTextareaRef` using `useRef`.
- Pass these refs down to `SplitView` / `TextEditor`.
- Pass a custom `onPaste` handler to `EditorToolbar` that retrieves text from the clipboard via `navigator.clipboard.readText()` and inserts it at the cursor position (selectionStart/selectionEnd) of the active textarea, updating the state and maintaining the cursor position.

#### [MODIFY] [EditorToolbar.tsx](file:///d:/Documents/Antigravity%20Projects/E-dit-Desktop/src/components/Editor/EditorToolbar.tsx)
- Add `onPaste` callback to props.
- Trigger `onPaste` instead of logging to console.

---

### Commands & Presets

#### [MODIFY] [CommandButton.tsx](file:///d:/Documents/Antigravity%20Projects/E-dit-Desktop/src/components/Commands/CommandButton.tsx)
- Remove dangerous styling (red outlines, background, text color) and the `AlertCircle` icon. Make all buttons look identical using standard glassmorphism styling.

#### [MODIFY] [PresetsTab.tsx](file:///d:/Documents/Antigravity%20Projects/E-dit-Desktop/src/components/Presets/PresetsTab.tsx)
- Add editing functionality: reuse the creation form layout for editing an existing preset (pre-populating name and selected command chain).
- Render an "Edit" icon (edit/pencil) next to each preset in the list.
- Render a "Delete" icon (trash) next to each preset in the list for quick deletion without context menus or confirmation.

#### [NEW] [PresetsModal.tsx](file:///d:/Documents/Antigravity%20Projects/E-dit-Desktop/src/components/Presets/PresetsModal.tsx)
- A modal dialog that opens when clicking the Presets button in the header.
- Contains the `PresetsTab` view styled within a premium glass-morphic modal window.

#### [MODIFY] [Header.tsx](file:///d:/Documents/Antigravity%20Projects/E-dit-Desktop/src/components/Layout/Header.tsx)
- Import `Sliders` icon.
- Add a new `IconButton` for Presets (`Sliders`) in the header next to the Notes button.
- Pass `showPresetsModal` and `setShowPresetsModal` to control visibility.

#### [MODIFY] [App.tsx](file:///d:/Documents/Antigravity%20Projects/E-dit-Desktop/src/App.tsx)
- Add `showPresetsModal` state.
- Render the new `PresetsModal` when `showPresetsModal` is true.

---

## Verification Plan

### Manual Verification
- **Paste Button:** Type text, position cursor in the middle, copy some text, and click the paste button in the toolbar. The text should insert at the cursor position.
- **Scrollbars:** Open commands, presets, symbols, and sidebar, and scroll with the mouse wheel. Verify no scrollbars are visible but scrolling works.
- **Button Styling:** Verify all commands look uniform (no red buttons).
- **Presets Modal:** Click the Sliders button in the header. The Presets modal should open. Add, edit (change name/chain), and delete a preset.
