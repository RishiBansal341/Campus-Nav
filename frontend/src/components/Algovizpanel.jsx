import { useState, useEffect, useRef, useCallback } from 'react'
import { nodes, edges } from '../data/campusGraph.js'
import { buildGraph, dijkstra, astar } from '../utils/routing.js'

// ── Constants ─────────────────────────────────────────────
const C = {
  bg: '#0f1117', bg2: '#161b27', bg3: '#1e2535', bg4: '#252d3d',
  border: '#2d3a52', text: '#e2e8f0', text2: '#94a3b8', text3: '#64748b',
  accent: '#3b82f6', green: '#10b981', red: '#ef4444', orange: '#f59e0b',
  purple: '#8b5cf6', cyan: '#06b6d4', yellow: '#fbbf24',
}

const NODE_COLOR = { outdoor: '#10b981', indoor: '#3b82f6', lift: '#8b5cf6', stairs: '#f59e0b' }
const FLOOR_LABEL = { '-1': 'B', '0': 'G', '1': 'F1', '2': 'F2' }

// ── Benchmark sizes ───────────────────────────────────────
const BENCH_SIZES = [
  { label: '10 nodes',  count: 10  },
  { label: '20 nodes',  count: 20  },
  { label: 'Full graph', count: nodes.length },
]

// Run benchmark for given node count
function runBenchmark(count, mode = 'normal') {
  const subset  = nodes.slice(0, count)
  const subIds  = new Set(subset.map(n => n.id))
  const subEdges = edges.filter(e => subIds.has(e.s) && subIds.has(e.d))

  // Build mini graph
  const graph = {}
  subset.forEach(n => { graph[n.id] = [] })
  subEdges.forEach(e => {
    graph[e.s]?.push({ to: e.d, w: e.w })
    graph[e.d]?.push({ to: e.s, w: e.w })
  })

  const src = subset[0]?.id
  const dst = subset[subset.length - 1]?.id
  if (!src || !dst || src === dst) return null

  const results = []
  for (let i = 0; i < 5; i++) {
    const t0d = performance.now()
    const dRes = dijkstra(src, dst, graph)
    const td   = +(performance.now() - t0d).toFixed(3)

    const t0a = performance.now()
    const aRes = astar(src, dst, graph)
    const ta   = +(performance.now() - t0a).toFixed(3)

    results.push({
      dijkstraTime: td, dijkstraNodes: dRes.explored.length, dijkstraCost: dRes.cost,
      astarTime:    ta, astarNodes:    aRes.explored.length, astarCost:    aRes.cost,
    })
  }

  // Average over 5 runs
  const avg = (key) => +(results.reduce((s, r) => s + r[key], 0) / results.length).toFixed(3)
  return {
    nodeCount: count,
    dijkstra: { time: avg('dijkstraTime'), nodesExplored: avg('dijkstraNodes'), cost: avg('dijkstraCost') },
    astar:    { time: avg('astarTime'),    nodesExplored: avg('astarNodes'),    cost: avg('astarCost')    },
  }
}

// ── Bar chart component ───────────────────────────────────
function BarChart({ data, metric, label, unit, colorA, colorB }) {
  const maxVal = Math.max(...data.flatMap(d => [d.dijkstra[metric], d.astar[metric]]), 0.001)
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ fontSize: 11, color: C.text3, marginBottom: 8, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
      {data.map((d, i) => (
        <div key={i} style={{ marginBottom: 10 }}>
          <div style={{ fontSize: 11, color: C.text2, marginBottom: 4 }}>{d.label}</div>
          {/* Dijkstra bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
            <div style={{ width: 60, fontSize: 10, color: colorA, textAlign: 'right' }}>Dijkstra</div>
            <div style={{ flex: 1, height: 18, background: C.bg4, borderRadius: 4, overflow: 'hidden', position: 'relative' }}>
              <div style={{ height: '100%', width: `${(d.dijkstra[metric] / maxVal * 100).toFixed(1)}%`, background: colorA, borderRadius: 4, transition: 'width 1s ease', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 6 }}>
                <span style={{ fontSize: 9, color: '#fff', fontWeight: 700 }}>{d.dijkstra[metric]}{unit}</span>
              </div>
            </div>
          </div>
          {/* A* bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 60, fontSize: 10, color: colorB, textAlign: 'right' }}>A*</div>
            <div style={{ flex: 1, height: 18, background: C.bg4, borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${(d.astar[metric] / maxVal * 100).toFixed(1)}%`, background: colorB, borderRadius: 4, transition: 'width 1s ease', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 6 }}>
                <span style={{ fontSize: 9, color: '#fff', fontWeight: 700 }}>{d.astar[metric]}{unit}</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Algorithm Visualizer ──────────────────────────────────
function AlgoVisualizer({ source, dest, mode }) {
  const canvasRef  = useRef(null)
  const animRef    = useRef(null)
  const [algo,     setAlgo]     = useState('dijkstra')
  const [speed,    setSpeed]    = useState(300)
  const [running,  setRunning]  = useState(false)
  const [step,     setStep]     = useState(0)
  const [steps,    setSteps]    = useState([])
  const [done,     setDone]     = useState(false)
  const [stats,    setStats]    = useState(null)

  // Get all steps for animation
  const computeSteps = useCallback((algoType) => {
    if (!source || !dest) return []
    const graph = buildGraph(mode)
    const allSteps = []

    if (algoType === 'dijkstra') {
      const dist = {}, prev = {}, visited = new Set()
      nodes.forEach(n => { dist[n.id] = Infinity })
      dist[source] = 0
      const pq = [[0, source]]

      while (pq.length) {
        pq.sort((a, b) => a[0] - b[0])
        const [d, u] = pq.shift()
        if (visited.has(u)) continue
        visited.add(u)
        allSteps.push({ type: 'visit', node: u, dist: d, frontier: [...pq.map(x => x[1])] })
        if (u === dest) break
        for (const { to, w } of (graph[u] || [])) {
          const nd = d + w
          if (nd < dist[to]) {
            dist[to] = nd; prev[to] = u
            pq.push([nd, to])
            allSteps.push({ type: 'relax', from: u, to, cost: nd })
          }
        }
      }
      // Reconstruct path
      const path = []; let cur = dest
      while (cur && cur !== source) { path.unshift(cur); cur = prev[cur] }
      if (cur === source) path.unshift(source)
      allSteps.push({ type: 'path', path, cost: dist[dest] })

    } else {
      // A*
      const g = {}, prev = {}, closed = new Set()
      nodes.forEach(n => { g[n.id] = Infinity })
      g[source] = 0
      const euclidean = (a, b) => {
        const na = nodes.find(n => n.id === a), nb = nodes.find(n => n.id === b)
        if (!na || !nb) return 0
        const dx = (na.lat - nb.lat) * 111000, dy = (na.lng - nb.lng) * 111000
        return Math.sqrt(dx*dx + dy*dy)
      }
      const open = [[euclidean(source, dest), source]]

      while (open.length) {
        open.sort((a, b) => a[0] - b[0])
        const [f, u] = open.shift()
        if (closed.has(u)) continue
        closed.add(u)
        allSteps.push({ type: 'visit', node: u, f, h: euclidean(u, dest), frontier: open.map(x => x[1]) })
        if (u === dest) break
        for (const { to, w } of (graph[u] || [])) {
          if (closed.has(to)) continue
          const ng = g[u] + w
          if (ng < g[to]) {
            g[to] = ng; prev[to] = u
            open.push([ng + euclidean(to, dest), to])
            allSteps.push({ type: 'relax', from: u, to, g: ng, h: euclidean(to, dest) })
          }
        }
      }
      const path = []; let cur = dest
      while (cur && cur !== source) { path.unshift(cur); cur = prev[cur] }
      if (cur === source) path.unshift(source)
      allSteps.push({ type: 'path', path, cost: g[dest] })
    }
    return allSteps
  }, [source, dest, mode])

  // Draw canvas
  const draw = useCallback((currentStep, allSteps) => {
    const canvas = canvasRef.current; if (!canvas) return
    const ctx = canvas.getContext('2d')
    const W = canvas.width, H = canvas.height
    ctx.clearRect(0, 0, W, H)

    // Background
    ctx.fillStyle = '#0f1117'
    ctx.fillRect(0, 0, W, H)

    // Filter nodes that have edges (connected nodes only)
    const connectedIds = new Set()
    edges.forEach(e => { connectedIds.add(e.s); connectedIds.add(e.d) })
    const visNodes = nodes.filter(n => connectedIds.has(n.id))

    if (visNodes.length === 0) return

    // Compute layout
    const lats = visNodes.map(n => n.lat), lngs = visNodes.map(n => n.lng)
    const minLat = Math.min(...lats), maxLat = Math.max(...lats)
    const minLng = Math.min(...lngs), maxLng = Math.max(...lngs)
    const pad = 50

    const toXY = (node) => ({
      x: pad + (node.lng - minLng) / (maxLng - minLng + 0.00001) * (W - 2*pad),
      y: H - pad - (node.lat - minLat) / (maxLat - minLat + 0.00001) * (H - 2*pad),
    })

    // Get visited & frontier up to current step
    const visited  = new Set()
    const frontier = new Set()
    const relaxed  = new Set()
    let pathNodes  = []

    for (let i = 0; i <= currentStep && i < allSteps.length; i++) {
      const s = allSteps[i]
      if (s.type === 'visit')  { visited.add(s.node); s.frontier?.forEach(f => frontier.add(f)) }
      if (s.type === 'relax')  { relaxed.add(s.to) }
      if (s.type === 'path')   { pathNodes = s.path }
    }

    // Draw edges
    edges.forEach(e => {
      const a = visNodes.find(n => n.id === e.s), b = visNodes.find(n => n.id === e.d)
      if (!a || !b) return
      const pa = toXY(a), pb = toXY(b)
      ctx.strokeStyle = '#1e2535'
      ctx.lineWidth = 1
      ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke()
    })

    // Draw path edges
    if (pathNodes.length > 1) {
      for (let i = 0; i < pathNodes.length - 1; i++) {
        const a = visNodes.find(n => n.id === pathNodes[i])
        const b = visNodes.find(n => n.id === pathNodes[i+1])
        if (!a || !b) continue
        const pa = toXY(a), pb = toXY(b)
        ctx.strokeStyle = '#3b82f6'
        ctx.lineWidth   = 3
        ctx.shadowColor = '#3b82f6'
        ctx.shadowBlur  = 8
        ctx.beginPath(); ctx.moveTo(pa.x, pa.y); ctx.lineTo(pb.x, pb.y); ctx.stroke()
        ctx.shadowBlur = 0
      }
    }

    // Draw nodes
    visNodes.forEach(node => {
      const { x, y } = toXY(node)
      const isVisited  = visited.has(node.id)
      const isFrontier = frontier.has(node.id) && !visited.has(node.id)
      const isPath     = pathNodes.includes(node.id)
      const isSource   = node.id === source
      const isDest     = node.id === dest

      let color = '#2d3a52', r = 5
      if (isVisited)  { color = '#8b5cf6'; r = 6 }
      if (isFrontier) { color = C.orange;  r = 5 }
      if (isPath)     { color = '#3b82f6'; r = 7 }
      if (isSource)   { color = '#ef4444'; r = 9 }
      if (isDest)     { color = '#06b6d4'; r = 9 }

      // Glow for important nodes
      if (isPath || isSource || isDest) {
        ctx.shadowColor = color; ctx.shadowBlur = 12
      }

      ctx.fillStyle = color
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI*2); ctx.fill()
      ctx.shadowBlur = 0

      // Label for source/dest
      if (isSource || isDest) {
        ctx.fillStyle = '#fff'
        ctx.font = 'bold 9px sans-serif'
        ctx.textAlign = 'center'
        ctx.fillText(isSource ? 'S' : 'E', x, y + 3)
      }
    })

    // Step info
    const curStep = allSteps[currentStep]
    if (curStep) {
      ctx.fillStyle = 'rgba(22,27,39,0.85)'
      ctx.roundRect(10, 10, 200, 55, 8)
      ctx.fill()
      ctx.fillStyle = C.text
      ctx.font = 'bold 11px sans-serif'
      ctx.textAlign = 'left'
      ctx.fillText(`Step ${currentStep + 1}/${allSteps.length}`, 20, 30)
      ctx.fillStyle = C.text3
      ctx.font = '10px sans-serif'
      if (curStep.type === 'visit')  ctx.fillText(`Visiting: ${nodes.find(n=>n.id===curStep.node)?.name || curStep.node}`, 20, 46)
      if (curStep.type === 'relax')  ctx.fillText(`Relaxing edge → ${nodes.find(n=>n.id===curStep.to)?.name || curStep.to}`, 20, 46)
      if (curStep.type === 'path')   ctx.fillText(`✅ Path found! Cost: ${Math.round(curStep.cost)}m`, 20, 46)
    }
  }, [source, dest])

  // Start animation
  const startAnimation = useCallback(() => {
    const allSteps = computeSteps(algo)
    if (!allSteps.length) return
    setSteps(allSteps); setStep(0); setDone(false); setRunning(true)
    const t0 = performance.now()
    const res = algo === 'dijkstra'
      ? dijkstra(source, dest, buildGraph(mode))
      : astar(source, dest, buildGraph(mode))
    setStats({ time: +(performance.now() - t0).toFixed(3), nodes: res.explored.length, cost: res.cost, path: res.path.length })
  }, [algo, source, dest, mode, computeSteps])

  // Animate step by step
  useEffect(() => {
    if (!running || steps.length === 0) return
    draw(step, steps)
    if (step >= steps.length - 1) { setRunning(false); setDone(true); return }
    animRef.current = setTimeout(() => setStep(s => s + 1), speed)
    return () => clearTimeout(animRef.current)
  }, [running, step, steps, speed, draw])

  const pause  = () => { setRunning(false); clearTimeout(animRef.current) }
  const resume = () => setRunning(true)
  const reset  = () => { pause(); setStep(0); setDone(false); setSteps([]); setStats(null); const canvas = canvasRef.current; if(canvas){const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height)} }

  useEffect(() => { if (steps.length) draw(step, steps) }, [step, steps, draw])

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 12 }}>
        {/* Algo select */}
        <div style={{ display: 'flex', background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 8, overflow: 'hidden' }}>
          {[['dijkstra','Dijkstra'],['astar','A*']].map(([k,l]) => (
            <button key={k} onClick={() => { setAlgo(k); reset() }}
              style={{ padding: '6px 14px', fontSize: 12, border: 'none', cursor: 'pointer', background: algo===k?C.accent:'transparent', color: algo===k?'#fff':C.text3, fontWeight: algo===k?700:400 }}>
              {l}
            </button>
          ))}
        </div>

        {/* Speed */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, color: C.text3 }}>
          <span>Speed:</span>
          {[[600,'Slow'],[300,'Normal'],[100,'Fast'],[30,'Turbo']].map(([s,l]) => (
            <button key={s} onClick={() => setSpeed(s)}
              style={{ padding: '4px 8px', fontSize: 10, borderRadius: 5, cursor: 'pointer', border: `1px solid ${speed===s?C.accent:C.border}`, background: speed===s?C.accent+'22':'transparent', color: speed===s?C.accent:C.text3 }}>
              {l}
            </button>
          ))}
        </div>

        <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
          {!running && !done && steps.length === 0 && (
            <button onClick={startAnimation} disabled={!source || !dest}
              style={{ padding: '7px 16px', fontSize: 12, borderRadius: 8, cursor: source&&dest?'pointer':'not-allowed', border: `1px solid ${C.green}`, background: C.green+'22', color: source&&dest?C.green:C.text3, fontWeight: 600 }}>
              ▶ Start
            </button>
          )}
          {running && (
            <button onClick={pause}
              style={{ padding: '7px 16px', fontSize: 12, borderRadius: 8, cursor: 'pointer', border: `1px solid ${C.orange}`, background: C.orange+'22', color: C.orange, fontWeight: 600 }}>
              ⏸ Pause
            </button>
          )}
          {!running && steps.length > 0 && !done && (
            <button onClick={resume}
              style={{ padding: '7px 16px', fontSize: 12, borderRadius: 8, cursor: 'pointer', border: `1px solid ${C.green}`, background: C.green+'22', color: C.green, fontWeight: 600 }}>
              ▶ Resume
            </button>
          )}
          {steps.length > 0 && (
            <button onClick={reset}
              style={{ padding: '7px 16px', fontSize: 12, borderRadius: 8, cursor: 'pointer', border: `1px solid ${C.red}`, background: C.red+'22', color: C.red, fontWeight: 600 }}>
              ↺ Reset
            </button>
          )}
        </div>
      </div>

      {!source || !dest ? (
        <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 10, padding: 24, textAlign: 'center', color: C.text3, fontSize: 13 }}>
          ⚠️ Please set Source and Destination first from the map
        </div>
      ) : (
        <>
          {/* Canvas */}
          <div style={{ background: C.bg, borderRadius: 10, overflow: 'hidden', border: `1px solid ${C.border}`, position: 'relative' }}>
            <canvas ref={canvasRef} width={620} height={320} style={{ width: '100%', display: 'block' }} />

            {/* Legend */}
            <div style={{ position: 'absolute', bottom: 8, right: 8, background: 'rgba(15,17,23,.9)', borderRadius: 8, padding: '6px 10px', fontSize: 10, display: 'flex', gap: 10 }}>
              {[['#ef4444','Source'],['#06b6d4','Dest'],['#8b5cf6','Visited'],['#f59e0b','Frontier'],['#3b82f6','Path']].map(([c,l])=>(
                <span key={l} style={{ display:'flex',alignItems:'center',gap:4 }}>
                  <span style={{ width:8,height:8,borderRadius:'50%',background:c,display:'inline-block' }}/>
                  <span style={{ color: C.text2 }}>{l}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Progress bar */}
          {steps.length > 0 && (
            <div style={{ marginTop: 8 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: C.text3, marginBottom: 3 }}>
                <span>Progress</span>
                <span>{step + 1} / {steps.length} steps</span>
              </div>
              <div style={{ height: 4, background: C.bg4, borderRadius: 2, overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${((step+1)/steps.length*100).toFixed(1)}%`, background: algo==='dijkstra'?C.accent:C.purple, transition: 'width .2s ease', borderRadius: 2 }} />
              </div>
            </div>
          )}

          {/* Stats after done */}
          {done && stats && (
            <div style={{ marginTop: 10, background: C.bg3, border: `1px solid ${C.green}`, borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: C.green, marginBottom: 8 }}>✅ {algo === 'dijkstra' ? 'Dijkstra' : 'A*'} Complete!</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
                {[['Time', stats.time+'ms', C.accent],['Nodes Explored', stats.nodes, C.purple],['Path Length', stats.path+' stops', C.cyan],['Cost', Math.round(stats.cost)+'m', C.orange]].map(([l,v,c])=>(
                  <div key={l} style={{ background: C.bg4, borderRadius: 8, padding: '8px 10px', textAlign: 'center' }}>
                    <div style={{ fontSize: 16, fontWeight: 700, color: c }}>{v}</div>
                    <div style={{ fontSize: 9, color: C.text3, marginTop: 2 }}>{l}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}

// ── Benchmark Panel ───────────────────────────────────────
function BenchmarkPanel() {
  const [results,  setResults]  = useState([])
  const [running,  setRunning]  = useState(false)
  const [mode,     setMode]     = useState('normal')
  const [done,     setDone]     = useState(false)

  const runAll = async () => {
    setRunning(true); setDone(false); setResults([])
    const out = []
    for (const { label, count } of BENCH_SIZES) {
      await new Promise(r => setTimeout(r, 50)) // let UI update
      const res = runBenchmark(count, mode)
      if (res) out.push({ label, ...res })
      setResults([...out])
    }
    setRunning(false); setDone(true)
  }

  const chartData = results.map(r => ({
    label: r.label,
    dijkstra: { time: r.dijkstra.time, nodesExplored: r.dijkstra.nodesExplored, cost: Math.round(r.dijkstra.cost) },
    astar:    { time: r.astar.time,    nodesExplored: r.astar.nodesExplored,    cost: Math.round(r.astar.cost)    },
  }))

  return (
    <div>
      {/* Controls */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap' }}>
        <div style={{ fontSize: 12, color: C.text2 }}>Mode:</div>
        {['normal','emergency','accessibility'].map(m => (
          <button key={m} onClick={() => setMode(m)}
            style={{ padding: '5px 12px', fontSize: 11, borderRadius: 6, cursor: 'pointer', border: `1px solid ${mode===m?C.accent:C.border}`, background: mode===m?C.accent+'22':'transparent', color: mode===m?C.accent:C.text3, textTransform: 'capitalize' }}>
            {m}
          </button>
        ))}
        <button onClick={runAll} disabled={running}
          style={{ marginLeft: 'auto', padding: '7px 20px', fontSize: 12, borderRadius: 8, cursor: running?'wait':'pointer', border: `1px solid ${C.green}`, background: C.green+'22', color: running?C.text3:C.green, fontWeight: 600 }}>
          {running ? '⏳ Running...' : '⚡ Run Benchmark'}
        </button>
      </div>

      {/* Info */}
      <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 14px', marginBottom: 16, fontSize: 11, color: C.text3, lineHeight: 1.7 }}>
        <b style={{ color: C.text }}>How it works:</b> Each size runs Dijkstra and A* <b style={{ color: C.accent }}>5 times</b> and averages the results.
        A* uses <b style={{ color: C.purple }}>f(n) = g(n) + h(n)</b> with Euclidean distance as heuristic.
      </div>

      {results.length > 0 && <>
        {/* Results Table */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 11, color: C.text3, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Results Table</div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: C.bg3 }}>
                {['Graph Size','Dijkstra Time','A* Time','Faster','Dijkstra Nodes','A* Nodes','Fewer Nodes'].map(h => (
                  <th key={h} style={{ padding: '8px 10px', fontSize: 10, color: C.text3, textAlign: 'center', borderBottom: `1px solid ${C.border}`, fontWeight: 600 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.map((r, i) => {
                const fasterAlgo  = r.dijkstra.time <= r.astar.time ? 'Dijkstra' : 'A*'
                const fewerAlgo   = r.dijkstra.nodesExplored <= r.astar.nodesExplored ? 'Dijkstra' : 'A*'
                const timeDiff    = Math.abs(r.dijkstra.time - r.astar.time).toFixed(3)
                const nodesDiff   = Math.abs(r.dijkstra.nodesExplored - r.astar.nodesExplored)
                return (
                  <tr key={i} style={{ background: i%2===0?C.bg2:C.bg3, borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: '8px 10px', fontSize: 12, color: C.text, fontWeight: 600, textAlign: 'center' }}>{r.label}</td>
                    <td style={{ padding: '8px 10px', fontSize: 12, color: C.accent, textAlign: 'center', fontFamily: 'monospace' }}>{r.dijkstra.time}ms</td>
                    <td style={{ padding: '8px 10px', fontSize: 12, color: C.purple, textAlign: 'center', fontFamily: 'monospace' }}>{r.astar.time}ms</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: C.green+'22', color: C.green }}>{fasterAlgo} (-{timeDiff}ms)</span>
                    </td>
                    <td style={{ padding: '8px 10px', fontSize: 12, color: C.accent, textAlign: 'center' }}>{r.dijkstra.nodesExplored}</td>
                    <td style={{ padding: '8px 10px', fontSize: 12, color: C.purple, textAlign: 'center' }}>{r.astar.nodesExplored}</td>
                    <td style={{ padding: '8px 10px', textAlign: 'center' }}>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: C.green+'22', color: C.green }}>{fewerAlgo} (-{nodesDiff})</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Charts */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14 }}>
            <BarChart data={chartData} metric="time" label="Execution Time (ms)" unit="ms" colorA={C.accent} colorB={C.purple} />
          </div>
          <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 10, padding: 14 }}>
            <BarChart data={chartData} metric="nodesExplored" label="Nodes Explored" unit="" colorA={C.accent} colorB={C.purple} />
          </div>
        </div>

        {/* Conclusion */}
        {done && (
          <div style={{ marginTop: 16, background: C.bg3, border: `1px solid ${C.green}`, borderRadius: 10, padding: 14 }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: C.green, marginBottom: 8 }}>📊 Research Conclusion</div>
            <div style={{ fontSize: 12, color: C.text2, lineHeight: 1.8 }}>
              {(() => {
                const last = results[results.length - 1]
                if (!last) return ''
                const nodesSaved = last.dijkstra.nodesExplored - last.astar.nodesExplored
                const pct = ((nodesSaved / last.dijkstra.nodesExplored) * 100).toFixed(1)
                const faster = last.dijkstra.time > last.astar.time ? 'A*' : 'Dijkstra'
                return `On a ${last.nodeCount}-node campus graph, A* explores ${nodesSaved} fewer nodes (${pct}% reduction) compared to Dijkstra. ${faster} is faster in execution time. A*'s Euclidean heuristic h(n) effectively guides search toward the destination, reducing unnecessary exploration — confirming the research hypothesis.`
              })()}
            </div>
          </div>
        )}
      </>}

      {results.length === 0 && !running && (
        <div style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 10, padding: 32, textAlign: 'center', color: C.text3, fontSize: 13 }}>
          Click <b style={{ color: C.green }}>Run Benchmark</b> to compare Dijkstra vs A* across different graph sizes
        </div>
      )}
    </div>
  )
}

// ── Main Export ───────────────────────────────────────────
export default function AlgoVizPanel({ onClose, source, dest, mode }) {
  const [tab, setTab] = useState('viz')

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, width: '94vw', maxWidth: 720, maxHeight: '92vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,.7)' }}>

        {/* Header */}
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <span style={{ fontSize: 20 }}>🔬</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Algorithm Lab</div>
            <div style={{ fontSize: 11, color: C.text3 }}>Visualize & benchmark Dijkstra vs A*</div>
          </div>
          <button onClick={onClose} style={{ marginLeft: 'auto', padding: '7px 14px', fontSize: 12, borderRadius: 6, cursor: 'pointer', border: '1px solid #ef4444', background: '#ef444422', color: '#ef4444', fontWeight: 600 }}>
            ✕ Close
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          {[['viz','🎬 Visualization'],['bench','📊 Benchmark']].map(([id,label]) => (
            <div key={id} onClick={() => setTab(id)}
              style={{ flex: 1, padding: '10px', textAlign: 'center', fontSize: 13, cursor: 'pointer', fontWeight: tab===id?600:400,
                color: tab===id?C.accent:C.text3,
                borderBottom: `2px solid ${tab===id?C.accent:'transparent'}`,
                transition: 'all .15s' }}>
              {label}
            </div>
          ))}
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {tab === 'viz'   && <AlgoVisualizer source={source} dest={dest} mode={mode} />}
          {tab === 'bench' && <BenchmarkPanel />}
        </div>
      </div>
    </div>
  )
}