const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/campus_nav")
  .then(() => console.log("MongoDB Connected"));

const Node = mongoose.model("Node", new mongoose.Schema({}, { strict: false }));
const Edge = mongoose.model("Edge", new mongoose.Schema({}, { strict: false }));

// ---------- BUILD GRAPH ----------
const buildGraph = async () => {
  const nodes = await Node.find();
  const edges = await Edge.find();

  const graph = {};
  const coords = {};

  nodes.forEach(n => {
    graph[n.id] = [];
    coords[n.id] = { lat: n.lat, lng: n.lng };
  });

  edges.forEach(e => {
    graph[e.source].push({
      node: e.destination,
      weight: e.weight,
      type: e.type
    });
  });

  return { graph, coords };
};

// ---------- DIJKSTRA ----------
function dijkstra(graph, start, end) {
  const dist = {};
  const prev = {};
  const visited = new Set();

  Object.keys(graph).forEach(n => dist[n] = Infinity);
  dist[start] = 0;

  let explored = 0;

  while (true) {
    let u = null;
    let min = Infinity;

    for (let node in dist) {
      if (!visited.has(node) && dist[node] < min) {
        min = dist[node];
        u = node;
      }
    }

    if (!u) break;

    visited.add(u);
    explored++;

    graph[u].forEach(nei => {
      const alt = dist[u] + nei.weight;
      if (alt < dist[nei.node]) {
        dist[nei.node] = alt;
        prev[nei.node] = u;
      }
    });
  }

  const path = [];
  let cur = end;
  while (cur) {
    path.unshift(cur);
    cur = prev[cur];
  }

  return { path, cost: dist[end], explored };
}

// ---------- A* ----------
function heuristic(a, b) {
  return Math.sqrt(
    Math.pow(a.lat - b.lat, 2) +
    Math.pow(a.lng - b.lng, 2)
  );
}

function astar(graph, coords, start, end) {
  const open = new Set([start]);
  const g = {};
  const f = {};
  const prev = {};

  Object.keys(graph).forEach(n => {
    g[n] = Infinity;
    f[n] = Infinity;
  });

  g[start] = 0;
  f[start] = heuristic(coords[start], coords[end]);

  let explored = 0;

  while (open.size > 0) {
    let current = [...open].reduce((a, b) => f[a] < f[b] ? a : b);

    if (current === end) break;

    open.delete(current);
    explored++;

    graph[current].forEach(nei => {
      const temp = g[current] + nei.weight;

      if (temp < g[nei.node]) {
        prev[nei.node] = current;
        g[nei.node] = temp;
        f[nei.node] = temp + heuristic(coords[nei.node], coords[end]);
        open.add(nei.node);
      }
    });
  }

  const path = [];
  let cur = end;
  while (cur) {
    path.unshift(cur);
    cur = prev[cur];
  }

  return { path, cost: g[end], explored };
}

// ---------- ROUTE API ----------
app.post("/route", async (req, res) => {
  const { start, end, algorithm } = req.body;

  const { graph, coords } = await buildGraph();

  const t0 = Date.now();

  let result;
  if (algorithm === "DIJKSTRA") {
    result = dijkstra(graph, start, end);
  } else {
    result = astar(graph, coords, start, end);
  }

  const time = Date.now() - t0;

  res.json({ ...result, time });
});
// ---------- ADMIN ROUTES ----------
// Get all nodes
app.get("/admin/nodes", async (req, res) => {
  const nodes = await Node.find();
  res.json(nodes);
});

// Add node
app.post("/admin/nodes", async (req, res) => {
  const node = new Node(req.body);
  await node.save();
  res.json(node);
});

// Update node
app.put("/admin/nodes/:id", async (req, res) => {
  const node = await Node.findByIdAndUpdate(req.body._id, req.body, { new: true });
  res.json(node);
});

// Delete node
app.delete("/admin/nodes/:id", async (req, res) => {
  await Node.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

// Get all edges
app.get("/admin/edges", async (req, res) => {
  const edges = await Edge.find();
  res.json(edges);
});

// Add edge
app.post("/admin/edges", async (req, res) => {
  const edge = new Edge(req.body);
  await edge.save();
  res.json(edge);
});

// Update edge
app.put("/admin/edges/:id", async (req, res) => {
  const edge = await Edge.findByIdAndUpdate(req.body._id, req.body, { new: true });
  res.json(edge);
});

// Delete edge
app.delete("/admin/edges/:id", async (req, res) => {
  await Edge.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});


app.listen(5000, () => console.log("Server running on 5000"));