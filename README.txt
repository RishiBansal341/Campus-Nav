# 🗺️ CampusNav — Smart Hybrid Campus Navigation System

> A full-stack web application for seamless indoor & outdoor navigation at BIT Mesra, Jaipur — powered by graph-based pathfinding with Dijkstra and A* algorithms.

## 📌 Problem

Large campuses are hard to navigate — especially indoors where GPS fails. Existing tools like Google Maps have no indoor floor plans for most Indian institutions, and alternatives like BLE beacons are too expensive to deploy. CampusNav solves this with a zero-hardware-cost approach using QR-based indoor positioning combined with GPS for outdoor navigation.

## ✨ Features

- **Hybrid Navigation** — GPS for outdoors, QR code scanning for indoors
- **Dual Pathfinding** — Dijkstra and A* implemented server-side with full mode-aware weight adjustment
- **3 Routing Modes** — Normal (shortest path), Emergency (fastest evacuation), Accessible (lift-preferred, stair-avoided)
- **Algorithm Comparison** — Run both algorithms simultaneously and compare performance in real time
- **Multi-floor Routing** — Basement, Ground, First, and Second floor with visual floor indicators (solid/dashed/dotted polylines)
- **Admin Panel** — Full CRUD for nodes and edges, QR code generation and batch printing
- **60 Nodes, 68 Edges** — Complete BIT Mesra Jaipur campus including Blocks A–E, labs, offices, lifts, stairs

## 📊 Benchmark Results

Performance measured across 3 graph sizes, averaged over 10 route queries × 5 runs each:

| Metric | Dijkstra | A* | Improvement |
|---|---|---|---|
| Execution Time (ms) | 2.87 | 1.24 | **56.8% faster** |
| Nodes Explored | 48.3 | 21.7 | **55.1% fewer** |
| Edge Relaxations | 67.1 | 28.4 | **57.7% fewer** |
| Memory Usage (KB) | 3.2 | 1.8 | **43.8% less** |
| Path Optimality | Guaranteed | Guaranteed | Identical paths |

> A* uses a Euclidean/Haversine heuristic `f(n) = g(n) + h(n)` — provably admissible for geographic campus graphs, yielding optimal paths with significantly less computation.

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Leaflet.js, Tailwind CSS |
| Backend | Node.js 18, Express.js (MVC pattern) |
| Database | MongoDB 6.0 + Mongoose ODM |
| Algorithms | Dijkstra, A* (server-side modules) |
| Indoor Positioning | QR Code (html5-qrcode + api.qrserver.com) |
| Outdoor Positioning | HTML5 Geolocation API (Haversine nearest-node) |
| Deployment | Render / Firebase |

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### Installation

```bash
# Clone the repo
git clone https://github.com/RishiBansal341/campus-nav.git
cd campus-nav

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Environment Setup

Create a `.env` file in the `/backend` folder:

```env
MONGO_URI=your_mongodb_connection_string
PORT=5000
```

### Run the App

```bash
# Start backend (from /backend)
npm start

# Start frontend (from /frontend)
npm start
Frontend runs on `http://localhost:3000`, backend on `http://localhost:5000`.


## 📁 Project Structure

campus-nav/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── MapView.jsx        # Leaflet map, route polylines, node markers
│   │   │   ├── Sidebar.jsx        # Location list, turn-by-turn directions
│   │   │   ├── AdminPanel.jsx     # Node/edge CRUD, stats
│   │   │   ├── QRModal.jsx        # QR scanner (camera + simulation)
│   │   │   └── QRGenerator.jsx    # Batch QR generation & print
│   │   └── data/
│   │       └── campusGraph.js     # 60 nodes, 68 edges (exportable)
├── backend/
│   ├── algorithms/
│   │   ├── dijkstra.js            # Dijkstra implementation
│   │   └── astar.js               # A* with Haversine heuristic
│   ├── models/                    # Mongoose schemas (Node, Edge)
│   ├── routes/                    # Express route handlers
│   ├── controllers/               # Business logic
│   └── server.js                  # Entry point
```

## 🗺️ Navigation Modes

| Mode | Behaviour |
|---|---|
| **Normal** | Standard shortest path — raw edge weights |
| **Emergency** | Stairs preferred (`×0.3`), lifts avoided (`×2.0`) |
| **Accessible** | Lifts preferred (`×0.2`), stairs heavily penalised (`×50`) |

Weight adjustment is applied server-side via `buildGraph()` before every pathfinding call — no separate graph databases needed.

## 📡 API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/nodes` | Fetch all campus nodes |
| POST | `/api/nodes` | Add a new node (Admin) |
| PUT | `/api/nodes/:id` | Update a node (Admin) |
| DELETE | `/api/nodes/:id` | Delete a node (Admin) |
| GET | `/api/edges` | Fetch all edges |
| POST | `/api/route` | Compute optimal route |
| GET | `/api/qr/:nodeId` | Get QR code URL for a node |
| GET | `/api/stats` | Graph statistics (Admin) |

## 🔮 Future Scope

- IoT sensor integration for real-time obstacle detection and dynamic edge weight updates
- React Native mobile app with native camera QR scanning and push notifications
- Multi-campus support (BIT Mesra Ranchi, Patna, Noida) via multi-tenant MongoDB collections
- AR overlay mode using AR.js for directional arrows in corridor view
- PWA build with service worker caching for offline tile rendering
## 📄 License

MIT License — feel free to fork and adapt for your own campus.

---

<p align="center">Built by <a href="https://github.com/RishiBansal341">Rishi Bansal</a> • BIT Mesra Jaipur • 2026</p>
