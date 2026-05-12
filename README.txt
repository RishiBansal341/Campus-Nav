# Smart Campus Navigation System
## Setup Instructions (Windows)

---

## Step 1 — Extract zip
Extract the zip file anywhere, e.g. Desktop

---

## Step 2 — Open in VS Code
Right click the folder → "Open with VS Code"

---

## Step 3 — Start Backend
Open a NEW terminal in VS Code (Terminal menu → New Terminal)
Make sure it says CMD not PowerShell. If PowerShell, click the + dropdown and choose "Command Prompt"

```
cd backend
npm install
node server.js
```

You should see:
  🚀 Campus Nav API running at http://localhost:5000

KEEP THIS TERMINAL OPEN

---

## Step 4 — Start Frontend
Open ANOTHER new terminal (click + button)

```
cd frontend
npm install
npm run dev
```

You should see:
  Local: http://localhost:5173

---

## Step 5 — Open Browser
Go to: http://localhost:5173

The map will load with the campus!

---

## How to Use
1. Click any GREEN dot on map = sets as Source
2. Click another dot = sets as Destination  
3. Route draws automatically
4. OR use the sidebar left panel to click locations
5. Use mode buttons: Normal / Emergency / Accessible
6. Use algo buttons: Dijkstra / A* / Compare
7. Click "📷 Scan QR" to simulate indoor QR scanning
8. Click "⚡ Benchmark" to see performance comparison

---

## Troubleshooting

Problem: npm not found
Solution: Install Node.js from https://nodejs.org (LTS version)

Problem: Port already in use
Solution: Close other terminals and try again

Problem: Map not loading
Solution: Check internet connection (map tiles need internet)

Problem: White screen
Solution: Open browser console (F12) and share the error
