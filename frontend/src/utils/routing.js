import { nodes, edges } from '../data/campusGraph.js'

// ── Build graph with mode-based weight adjustment ──────────
// Normal:        raw weights
// Emergency:     stairs weight ×0.3 (use stairs fast to evacuate)
//                lift weight ×2 (lifts slow in emergency)
// Accessibility: stairs weight ×50 (avoid stairs)
//                lift weight ×0.2 (strongly prefer lift)
export function buildGraph(mode = 'normal') {
  const graph = {}
  nodes.forEach(n => { graph[n.id] = [] })

  edges.forEach(edge => {
    let w = edge.w
    const isStairs = edge.type === 'stairs'
    const isLift   = edge.type === 'lift'
    const srcNode  = nodes.find(n => n.id === edge.s)
    const dstNode  = nodes.find(n => n.id === edge.d)
    const srcStairs = srcNode?.type === 'stairs'
    const dstStairs = dstNode?.type === 'stairs'
    const srcLift   = srcNode?.type === 'lift'
    const dstLift   = dstNode?.type === 'lift'

    if (mode === 'emergency') {
      if (isStairs || srcStairs || dstStairs) w = w * 0.3  // stairs fast in emergency
      if (isLift   || srcLift   || dstLift)   w = w * 2.0  // avoid lift in emergency
    }
    if (mode === 'accessibility') {
      if (isStairs || srcStairs || dstStairs) w = w * 50   // strongly avoid stairs
      if (isLift   || srcLift   || dstLift)   w = w * 0.2  // strongly prefer lift
    }

    graph[edge.s].push({ to: edge.d, w, type: edge.type })
    graph[edge.d].push({ to: edge.s, w, type: edge.type })
  })
  return graph
}

// ── Euclidean heuristic (metres) ───────────────────────────
export function euclidean(aId, bId) {
  const a = nodes.find(n => n.id === aId)
  const b = nodes.find(n => n.id === bId)
  if (!a || !b) return 0
  const dx = (a.lat - b.lat) * 111000
  const dy = (a.lng - b.lng) * 111000 * Math.cos(a.lat * Math.PI / 180)
  return Math.sqrt(dx * dx + dy * dy)
}

function reconstructPath(prev, src, dst) {
  const path = []
  let cur = dst
  let safety = 0
  while (cur && cur !== src && safety < 200) {
    path.unshift(cur)
    cur = prev[cur]
    safety++
  }
  if (cur === src) path.unshift(src)
  return path
}

// ── Dijkstra ───────────────────────────────────────────────
// Explores ALL nodes uniformly — no heuristic
export function dijkstra(src, dst, graph) {
  const dist = {}, prev = {}, explored = []
  nodes.forEach(n => { dist[n.id] = Infinity })
  dist[src] = 0
  const pq = [[0, src]]

  while (pq.length) {
    pq.sort((a, b) => a[0] - b[0])
    const [d, u] = pq.shift()
    if (explored.includes(u)) continue
    explored.push(u)
    if (u === dst) break
    for (const { to, w } of (graph[u] || [])) {
      const nd = d + w
      if (nd < dist[to]) {
        dist[to] = nd
        prev[to] = u
        pq.push([nd, to])
      }
    }
  }
  return {
    path: reconstructPath(prev, src, dst),
    explored,
    cost: dist[dst] === Infinity ? 0 : dist[dst]
  }
}

// ── A* ─────────────────────────────────────────────────────
// Uses Euclidean heuristic — explores FEWER nodes than Dijkstra
// f(n) = g(n) + h(n)
export function astar(src, dst, graph) {
  const g = {}, prev = {}, explored = [], closed = new Set()
  nodes.forEach(n => { g[n.id] = Infinity })
  g[src] = 0
  const open = [[euclidean(src, dst), src]]

  while (open.length) {
    open.sort((a, b) => a[0] - b[0])
    const [, u] = open.shift()
    if (closed.has(u)) continue
    closed.add(u)
    explored.push(u)
    if (u === dst) break
    for (const { to, w } of (graph[u] || [])) {
      if (closed.has(to)) continue
      const ng = g[u] + w
      if (ng < g[to]) {
        g[to] = ng
        prev[to] = u
        open.push([ng + euclidean(to, dst), to])
      }
    }
  }
  return {
    path: reconstructPath(prev, src, dst),
    explored,
    cost: g[dst] === Infinity ? 0 : g[dst]
  }
}

// ── Run both algorithms and return comparison ──────────────
export function compareAlgorithms(src, dst, mode = 'normal') {
  const graph = buildGraph(mode)

  const t0d = performance.now()
  const dRes = dijkstra(src, dst, graph)
  const timeD = +(performance.now() - t0d).toFixed(3)

  const t0a = performance.now()
  const aRes = astar(src, dst, graph)
  const timeA = +(performance.now() - t0a).toFixed(3)

  return {
    dijkstra: { ...dRes, time: timeD, nodesExplored: dRes.explored.length },
    astar:    { ...aRes, time: timeA, nodesExplored: aRes.explored.length },
  }
}