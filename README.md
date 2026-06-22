# Japan Trip 2026 — PWA

Kumano Kodo → Kurobe Alpine Route → Hakuba → Osaka  
Apr 10–26 · 2 pax · Travel planning & on-trail companion

---

## Phase 1 — What's in this build

| Screen | What it does |
|--------|-------------|
| **Itinerary** | Day-by-day stops, collapsible cards, booking status badges, kebab action menu |
| **Map** | Leaflet map with all 32 stops, day filter, tap a marker for details |
| **Bookings** | Urgency-sorted booking tracker with stats |
| **SOS Card** | Offline emergency contacts, hotel addresses in Japanese, tap-to-copy |

**Components built:** toast notifications, bottom sheet, offline service worker, design token system.

Data is hardcoded from your Google Sheet. Phase 2 connects live sync.

---

## Deploy in 5 minutes (GitHub Pages)

### 1. Create a GitHub repo

Go to [github.com/new](https://github.com/new) and create a new **public** repo called `japan-trip-pwa`.

### 2. Push this folder

```bash
cd japan-trip-pwa
git init
git add .
git commit -m "Phase 1 — PWA scaffold"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/japan-trip-pwa.git
git push -u origin main
```

### 3. Enable GitHub Pages

- Go to repo **Settings → Pages**
- Source: **Deploy from a branch**
- Branch: `main` / `/ (root)`
- Save

Your PWA will be live at `https://YOUR_USERNAME.github.io/japan-trip-pwa/` in ~60 seconds.

### 4. Install on iPhone (Safari)

1. Open the URL in Safari
2. Tap the **Share** button → **Add to Home Screen**
3. Tap **Add**

The app icon (mountain + torii) appears on your home screen. It now works offline.

---

## File structure

```
japan-trip-pwa/
├── index.html          ← App shell + all styles
├── manifest.json       ← PWA install config
├── sw.js               ← Service worker (offline)
├── css/
│   └── tokens.css      ← Design system (colors, spacing, font)
├── js/
│   ├── data.js         ← All trip data (edit this to update stops)
│   ├── icons.js        ← SVG icon library (Hugeicons style)
│   ├── toast.js        ← Toast notification system
│   ├── bottom-sheet.js ← Action bottom sheet
│   ├── app.js          ← Router + header + lifecycle
│   └── screens/
│       ├── itinerary.js
│       ├── map.js
│       ├── bookings.js
│       └── sos.js
└── icons/
    ├── icon-192.png
    ├── icon-512.png
    └── icon-maskable.png
```

---

## Editing trip data (before Phase 2 sync)

Open `js/data.js`. Each stop looks like:

```javascript
{ id:'s05', dayId:'d1', order:2, name:'Takahara Lodge',
  activity:'Arrive ridge village; onsen at the lodge',
  transport:'On foot', transportType:'walk',
  accommodation:'Kiri-no-Sato Takahara Lodge', notes:'...',
  lat:33.7959, lng:135.5321,
  booking:{ status:'pending', ref:'', cost:18000, deadline:'2026-01-15' } },
```

Change `status` to `'booked'` once confirmed. Push to GitHub — the PWA updates within seconds.

---

## Phase 2 — Coming next

- Google Apps Script web app pasted into your Sheet
- Live two-way sync: edits in the PWA write back to the Sheet
- IndexedDB for offline queue — changes sync when you reconnect
- Conflict resolution UI when both the Sheet and PWA are edited offline

---

## Phase 3–5 — Planned

- **3** Inline note editing, date changes, booking ref storage
- **4** Budget tracker (¥), packing list from Sheet, weather widget
- **5** PDF export, pilgrim stamp tracker, companion sync
