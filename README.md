# Modern Todo — README

A sleek, no-dependency Todo app built with pure HTML, CSS, and JavaScript. Fast, responsive, keyboard-friendly, and saved locally (no backend).  
Yeh README aapke modern Todo app ko set up, use, customize, aur extend karne ke liye complete guide hai. 🚀

## ✨ Features
- Add, edit, delete tasks
- Mark complete/incomplete
- Filters: All / Active / Completed
- Search with instant results
- Drag-and-drop reordering (works when no filter/search is active)
- Due date with overdue highlight
- Priority chip (Low / Normal / High)
- Light/Dark theme toggle + auto system theme detection
- LocalStorage persistence (no account needed)
- Keyboard shortcuts
- Responsive UI, accessible controls, zero dependencies

## 🖼️ Screenshots
Add your screenshots in an assets folder and link them here:
- Light mode: assets/screenshot-light.png
- Dark mode: assets/screenshot-dark.png

## 🚀 Quick Start
Option A — Single file (fastest):
1. Create a file named index.html
2. Paste the provided code (from the app you built) into it
3. Open in your browser

Option B — Run a tiny local server (recommended):
- Using Node.js: npx serve
- Using Python: python -m http.server 5173
- VS Code: Live Server extension

Then open http://localhost:5173 (or the URL your server prints).

Note: Data is saved in your browser’s localStorage. Incognito mode or clearing site data will reset tasks.

## ⌨️ Keyboard Shortcuts
| Action | Shortcut |
| --- | --- |
| Focus search | Ctrl/Cmd + K |
| Add task (from input) | Enter |
| Save edit | Enter |
| Cancel edit | Esc |
| Reorder | Drag the grip icon |

## 🧭 How to Use
- Add: Type a task, select optional due date/priority, press Enter or click Add
- Complete: Click the checkbox
- Edit: Click the task title, edit, Enter to save, Esc to cancel
- Filter: Use All / Active / Completed
- Search: Type in the search box (Ctrl/Cmd + K)
- Reorder: Drag the grip icon (only when not filtering or searching)
- Clear Completed: One click to bulk remove done tasks
- Theme: Use the moon/sun button (remembers your choice)

## 🗂️ Data & Persistence
- Storage key: todo-modern-v1
- Where: localStorage of your browser
- Task object shape:
  - id: string
  - title: string
  - completed: boolean
  - createdAt: number (timestamp)
  - dueDate: string | null (YYYY-MM-DD)
  - priority: "low" | "normal" | "high"
  - order: number (for sorting)

Tip: Don’t modify localStorage manually unless you know what you’re doing.

## 🎨 Customization
- Colors and theming use CSS variables (supports light and dark). Tweak these in :root or [data-theme="light"]:

```css
:root {
  --primary: #7c3aed;   /* accent color */
  --accent:  #22d3ee;   /* secondary accent */
  --radius:  14px;      /* corner radius */
}
```

- Default theme follows system preference. You can force a theme by setting data-theme on <html>:
```html
<html lang="en" data-theme="dark">
```

- Change copy: Edit button titles, placeholders, and labels inside index.html.

## 📁 Project Structure (if you want to split files)
If you prefer separate files:

- index.html
- styles.css (move everything from <style> ... </style>)
- app.js (move everything from <script> ... </script>)

Example index.html head references:
```html
<link rel="stylesheet" href="styles.css" />
<script defer src="app.js"></script>
```

Everything else remains the same. Make sure the inline SVG symbols are either kept in index.html or moved into a separate sprite that you include.

## 🧩 Accessibility
- Proper aria-labels for controls
- Focus-visible rings for keyboard users
- Live region (aria-live) for the list
- Color contrasts tuned for both themes

## 🌐 Browser Support
- Latest Chrome, Edge, Firefox, Safari
- Date inputs rely on native browser support; older browsers may show a plain text field

## 🧪 Known Behaviors
- Reordering is disabled while filtering or searching (to avoid confusing order within a subset)
- Overdue style appears only for incomplete tasks with a due date in the past
- localStorage is per-browser, per-device (no sync)

## 🛠️ Troubleshooting
- Drag-and-drop not working?
  - Ensure filter = All and search is empty
- Date picker missing?
  - Some browsers show a text input; you can type YYYY-MM-DD
- Tasks disappear?
  - Incognito/private windows or clearing site data will reset localStorage
- Reset app completely:
  - Clear localStorage key todo-modern-v1 from devtools

## 🗺️ Roadmap Ideas (nice-to-haves)
- Tags and tag-based filters
- Subtasks / checklists inside tasks
- Reminders/notifications
- Import/Export JSON
- PWA (installable, offline icon)
- Cloud sync / login (optional backend)
- Multi-select and bulk actions
- Sort by due date/priority

## 🤝 Contributing
- Fork the repo, create a feature branch, and submit a PR
- Keep it dependency-free unless there’s a strong reason
- Add accessibility and keyboard support for new features

## 📄 License
MIT — use it freely in personal or commercial projects.

—

Koi specific tweak chahiye? Tags, subtasks, PWA, ya code ko teen files me split karke structure dena ho — bol do, I’ll tailor it for you. 😊