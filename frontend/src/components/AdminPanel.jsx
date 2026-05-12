import { useState, useEffect } from 'react'

const API = 'http://localhost:5000'

// ── Styles ────────────────────────────────────────────────
const C = {
  bg:     '#0f1117', bg2: '#161b27', bg3: '#1e2535', bg4: '#252d3d',
  border: '#2d3a52', text: '#e2e8f0', text2: '#94a3b8', text3: '#64748b',
  accent: '#3b82f6', green: '#10b981', red: '#ef4444', orange: '#f59e0b',
  purple: '#8b5cf6', cyan: '#06b6d4',
}

const NODE_TYPES  = ['outdoor', 'indoor', 'lift', 'stairs']
const FLOOR_OPTS  = [{ v: -1, l: 'Basement' }, { v: 0, l: 'Ground Floor' }, { v: 1, l: 'First Floor' }, { v: 2, l: 'Second Floor' }]
const EDGE_TYPES  = ['outdoor', 'indoor', 'transition', 'stairs', 'lift']
const TYPE_COLOR  = { outdoor: C.green, indoor: C.accent, lift: C.purple, stairs: C.orange }
const FLOOR_COLOR = { '-1': C.orange, '0': C.green, '1': C.accent, '2': C.purple }
const FLOOR_LABEL = { '-1': 'B', '0': 'G', '1': 'F1', '2': 'F2' }

const inp = (extra = {}) => ({
  background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 6,
  padding: '7px 10px', fontSize: 12, color: C.text, outline: 'none', width: '100%', ...extra
})
const btn = (bg, border) => ({
  padding: '7px 14px', fontSize: 12, borderRadius: 6, cursor: 'pointer',
  border: `1px solid ${border || bg}`, background: bg + '22', color: bg, fontWeight: 600,
  transition: 'all .15s',
})

export default function AdminPanel({ onClose, onGraphUpdate, onOpenQR }) {
  const [tab,         setTab]         = useState('nodes')
  const [nodes,       setNodes]       = useState([])
  const [edges,       setEdges]       = useState([])
  const [search,      setSearch]      = useState('')
  const [editingNode, setEditingNode] = useState(null)
  const [loading,     setLoading]     = useState(true)
  const [showAddNode, setShowAddNode] = useState(false)
  const [showAddEdge, setShowAddEdge] = useState(false)
  const [toast,       setToast]       = useState('')
  const [confirmDel,  setConfirmDel]  = useState(null)

  const [newNode, setNewNode] = useState({
    id: '', name: '', type: 'indoor', lat: '', lng: '', floor: 0, accessible: true, qr: ''
  })
  const [newEdge, setNewEdge] = useState({
    s: '', d: '', w: '', type: 'indoor'
  })

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 2500) }

  // ── Load from MongoDB on mount ───────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const [nRes, eRes] = await Promise.all([
          fetch(`${API}/admin/nodes`),
          fetch(`${API}/admin/edges`)
        ])
        const nData = await nRes.json()
        const eData = await eRes.json()
        setNodes(nData)
        setEdges(eData)
        onGraphUpdate && onGraphUpdate(nData, eData)
      } catch (err) {
        showToast('❌ Failed to load from server')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // ── Node CRUD ────────────────────────────────────────────
  const addNode = async () => {
    if (!newNode.id || !newNode.name || !newNode.lat || !newNode.lng) {
      showToast('⚠️ ID, Name, Lat, Lng required'); return
    }
    if (nodes.find(n => n.id === newNode.id)) {
      showToast('⚠️ Node ID already exists'); return
    }
    const node = {
      ...newNode,
      lat: parseFloat(newNode.lat),
      lng: parseFloat(newNode.lng),
      floor: parseInt(newNode.floor),
      qr: newNode.qr || (newNode.type !== 'outdoor' ? `QR-${newNode.id.toUpperCase()}` : ''),
    }
    try {
      const res = await fetch(`${API}/admin/nodes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(node)
      })
      const saved = await res.json()
      const updated = [...nodes, saved]
      setNodes(updated)
      onGraphUpdate && onGraphUpdate(updated, edges)
      setNewNode({ id: '', name: '', type: 'indoor', lat: '', lng: '', floor: 0, accessible: true, qr: '' })
      setShowAddNode(false)
      showToast(`✅ Node "${node.name}" added`)
    } catch {
      showToast('❌ Failed to add node')
    }
  }

  const updateNode = async (id, field, value) => {
    const node = nodes.find(n => n.id === id)
    const updated = { ...node, [field]: value }
    try {
      await fetch(`${API}/admin/nodes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      })
      const updatedNodes = nodes.map(n => n.id === id ? updated : n)
      setNodes(updatedNodes)
      onGraphUpdate && onGraphUpdate(updatedNodes, edges)
    } catch {
      showToast('❌ Failed to update node')
    }
  }

  const deleteNode = async (id) => {
    try {
      await fetch(`${API}/admin/nodes/${id}`, { method: 'DELETE' })
      const updatedNodes = nodes.filter(n => n.id !== id)
      const updatedEdges = edges.filter(e => e.s !== id && e.d !== id)

      // Also delete connected edges from DB
      edges.filter(e => e.s === id || e.d === id).forEach(e => {
        fetch(`${API}/admin/edges/${e._id}`, { method: 'DELETE' })
      })

      setNodes(updatedNodes)
      setEdges(updatedEdges)
      onGraphUpdate && onGraphUpdate(updatedNodes, updatedEdges)
      setConfirmDel(null)
      showToast(`🗑️ Node deleted (+ its edges removed)`)
    } catch {
      showToast('❌ Failed to delete node')
    }
  }

  // ── Edge CRUD ────────────────────────────────────────────
  const addEdge = async () => {
    if (!newEdge.s || !newEdge.d || !newEdge.w) {
      showToast('⚠️ Source, Destination, Weight required'); return
    }
    if (!nodes.find(n => n.id === newEdge.s)) { showToast('⚠️ Source node not found'); return }
    if (!nodes.find(n => n.id === newEdge.d)) { showToast('⚠️ Destination node not found'); return }

    const edge = { ...newEdge, w: parseFloat(newEdge.w) }
    try {
      const res = await fetch(`${API}/admin/edges`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(edge)
      })
      const saved = await res.json()
      const updated = [...edges, saved]
      setEdges(updated)
      onGraphUpdate && onGraphUpdate(nodes, updated)
      setNewEdge({ s: '', d: '', w: '', type: 'indoor' })
      setShowAddEdge(false)
      showToast(`✅ Edge added: ${edge.s} → ${edge.d}`)
    } catch {
      showToast('❌ Failed to add edge')
    }
  }

  const deleteEdge = async (edgeId, s, d) => {
    try {
      await fetch(`${API}/admin/edges/${edgeId}`, { method: 'DELETE' })
      const updated = edges.filter(e => e._id !== edgeId)
      setEdges(updated)
      onGraphUpdate && onGraphUpdate(nodes, updated)
      showToast(`🗑️ Edge deleted`)
    } catch {
      showToast('❌ Failed to delete edge')
    }
  }

  // ── Export ───────────────────────────────────────────────
  const exportGraph = () => {
    const content = `// Exported from Admin Panel\nexport const nodes = ${JSON.stringify(nodes, null, 2)}\n\nexport const edges = ${JSON.stringify(edges, null, 2)}\n`
    const blob = new Blob([content], { type: 'text/javascript' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href = url; a.download = 'campusGraph.js'; a.click()
    showToast('📥 campusGraph.js downloaded!')
  }

  const filteredNodes = nodes.filter(n =>
    n.name?.toLowerCase().includes(search.toLowerCase()) ||
    n.id?.toLowerCase().includes(search.toLowerCase()) ||
    n.type?.toLowerCase().includes(search.toLowerCase())
  )

  const filteredEdges = edges.filter(e =>
    e.s?.toLowerCase().includes(search.toLowerCase()) ||
    e.d?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', zIndex: 3000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, width: '92vw', maxWidth: 900, height: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,.7)' }}>

        {/* Header */}
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <span style={{ fontSize: 18 }}>⚙️</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>Admin Panel</div>
            <div style={{ fontSize: 11, color: C.text3 }}>
              {loading ? '⏳ Loading from MongoDB...' : `✅ Connected to MongoDB — ${nodes.length} nodes, ${edges.length} edges`}
            </div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <button onClick={onOpenQR} style={btn(C.purple)}>📷 QR Codes</button>
            <button onClick={exportGraph} style={btn(C.green)}>📥 Export Graph</button>
            <button onClick={onClose} style={btn(C.red)}>✕ Close</button>
          </div>
        </div>

        {/* Stats bar */}
        <div style={{ padding: '10px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 16, flexShrink: 0 }}>
          {[
            { label: 'Total Nodes', val: nodes.length,                                      color: C.accent },
            { label: 'Outdoor',     val: nodes.filter(n => n.type === 'outdoor').length,    color: C.green  },
            { label: 'Indoor',      val: nodes.filter(n => n.type === 'indoor').length,     color: C.accent },
            { label: 'Lifts',       val: nodes.filter(n => n.type === 'lift').length,       color: C.purple },
            { label: 'Stairs',      val: nodes.filter(n => n.type === 'stairs').length,     color: C.orange },
            { label: 'Total Edges', val: edges.length,                                      color: C.cyan   },
          ].map(({ label, val, color }) => (
            <div key={label} style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px 14px', textAlign: 'center' }}>
              <div style={{ fontSize: 18, fontWeight: 700, color }}>{val}</div>
              <div style={{ fontSize: 10, color: C.text3 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, flexShrink: 0 }}>
          {[['nodes', '📍 Nodes'], ['edges', '🔗 Edges']].map(([id, label]) => (
            <div key={id} onClick={() => { setTab(id); setSearch('') }}
              style={{ padding: '10px 24px', fontSize: 13, cursor: 'pointer', fontWeight: tab === id ? 600 : 400,
                color: tab === id ? C.accent : C.text3,
                borderBottom: `2px solid ${tab === id ? C.accent : 'transparent'}`, transition: 'all .15s' }}>
              {label}
            </div>
          ))}
        </div>

        {/* Toolbar */}
        <div style={{ padding: '10px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder={tab === 'nodes' ? '🔍 Search by name, id, type...' : '🔍 Search by source or destination...'}
            style={{ ...inp(), maxWidth: 300 }} />
          {tab === 'nodes' && (
            <button onClick={() => setShowAddNode(true)} style={{ ...btn(C.green), marginLeft: 'auto' }}>
              + Add Node
            </button>
          )}
          {tab === 'edges' && (
            <button onClick={() => setShowAddEdge(true)} style={{ ...btn(C.green), marginLeft: 'auto' }}>
              + Add Edge
            </button>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.text3, fontSize: 14 }}>
            ⏳ Loading data from MongoDB...
          </div>
        )}

        {/* Content */}
        {!loading && (
          <div style={{ flex: 1, overflowY: 'auto', padding: '0 20px 20px' }}>

            {/* ── NODES TAB ── */}
            {tab === 'nodes' && <>

              {showAddNode && (
                <div style={{ background: C.bg3, border: `1px solid ${C.green}`, borderRadius: 10, padding: 16, margin: '16px 0' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.green, marginBottom: 12 }}>+ Add New Node</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                    {[
                      { key: 'id',   label: 'Node ID *',   ph: 'e.g. bldA_newroom' },
                      { key: 'name', label: 'Name *',       ph: 'e.g. New Classroom' },
                      { key: 'lat',  label: 'Latitude *',   ph: '26.854...' },
                      { key: 'lng',  label: 'Longitude *',  ph: '75.828...' },
                      { key: 'qr',   label: 'QR Code',      ph: 'auto-generated if empty' },
                    ].map(({ key, label, ph }) => (
                      <div key={key}>
                        <div style={{ fontSize: 10, color: C.text3, marginBottom: 4 }}>{label}</div>
                        <input value={newNode[key]} onChange={e => setNewNode({ ...newNode, [key]: e.target.value })}
                          placeholder={ph} style={inp()} />
                      </div>
                    ))}
                    <div>
                      <div style={{ fontSize: 10, color: C.text3, marginBottom: 4 }}>Type *</div>
                      <select value={newNode.type} onChange={e => setNewNode({ ...newNode, type: e.target.value })} style={inp()}>
                        {NODE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: C.text3, marginBottom: 4 }}>Floor *</div>
                      <select value={newNode.floor} onChange={e => setNewNode({ ...newNode, floor: parseInt(e.target.value) })} style={inp()}>
                        {FLOOR_OPTS.map(f => <option key={f.v} value={f.v}>{f.l}</option>)}
                      </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16 }}>
                      <input type="checkbox" checked={newNode.accessible} onChange={e => setNewNode({ ...newNode, accessible: e.target.checked })} id="acc" />
                      <label htmlFor="acc" style={{ fontSize: 12, color: C.text2 }}>Wheelchair Accessible</label>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button onClick={addNode} style={btn(C.green)}>✅ Add Node</button>
                    <button onClick={() => setShowAddNode(false)} style={btn(C.red)}>Cancel</button>
                  </div>
                </div>
              )}

              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
                <thead>
                  <tr style={{ background: C.bg3 }}>
                    {['Name', 'ID', 'Type', 'Floor', 'Coordinates', 'QR', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '8px 10px', fontSize: 11, color: C.text3, textAlign: 'left', borderBottom: `1px solid ${C.border}`, fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredNodes.map((node, i) => (
                    <tr key={node.id} style={{ background: i % 2 === 0 ? C.bg2 : C.bg3, borderBottom: `1px solid ${C.border}` }}>
                      {editingNode === node.id ? (
                        <>
                          <td style={{ padding: '6px 8px' }}>
                            <input defaultValue={node.name} onChange={e => updateNode(node.id, 'name', e.target.value)} style={inp({ width: 140 })} />
                          </td>
                          <td style={{ padding: '6px 8px', fontSize: 11, color: C.text3 }}>{node.id}</td>
                          <td style={{ padding: '6px 8px' }}>
                            <select defaultValue={node.type} onChange={e => updateNode(node.id, 'type', e.target.value)} style={inp({ width: 90 })}>
                              {NODE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <select defaultValue={node.floor} onChange={e => updateNode(node.id, 'floor', parseInt(e.target.value))} style={inp({ width: 100 })}>
                              {FLOOR_OPTS.map(f => <option key={f.v} value={f.v}>{f.l}</option>)}
                            </select>
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <div style={{ display: 'flex', gap: 4 }}>
                              <input defaultValue={node.lat} onChange={e => updateNode(node.id, 'lat', parseFloat(e.target.value))} style={inp({ width: 90 })} placeholder="lat" />
                              <input defaultValue={node.lng} onChange={e => updateNode(node.id, 'lng', parseFloat(e.target.value))} style={inp({ width: 90 })} placeholder="lng" />
                            </div>
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <input defaultValue={node.qr} onChange={e => updateNode(node.id, 'qr', e.target.value)} style={inp({ width: 100 })} />
                          </td>
                          <td style={{ padding: '6px 8px' }}>
                            <button onClick={() => { setEditingNode(null); showToast('✅ Node saved to MongoDB') }} style={btn(C.green)}>Save</button>
                          </td>
                        </>
                      ) : (
                        <>
                          <td style={{ padding: '8px 10px', fontSize: 12, color: C.text, fontWeight: 500 }}>{node.name}</td>
                          <td style={{ padding: '8px 10px', fontSize: 10, color: C.text3, fontFamily: 'monospace' }}>{node.id}</td>
                          <td style={{ padding: '8px 10px' }}>
                            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: (TYPE_COLOR[node.type] || C.accent) + '22', color: TYPE_COLOR[node.type] || C.accent }}>
                              {node.type}
                            </span>
                          </td>
                          <td style={{ padding: '8px 10px' }}>
                            <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: (FLOOR_COLOR[String(node.floor)] || C.accent) + '22', color: FLOOR_COLOR[String(node.floor)] || C.accent }}>
                              {FLOOR_LABEL[String(node.floor)] || 'F' + node.floor}
                            </span>
                          </td>
                          <td style={{ padding: '8px 10px', fontSize: 10, color: C.text3, fontFamily: 'monospace' }}>
                            {node.lat?.toFixed(6)}, {node.lng?.toFixed(6)}
                          </td>
                          <td style={{ padding: '8px 10px', fontSize: 10, color: C.cyan }}>{node.qr || '—'}</td>
                          <td style={{ padding: '8px 10px' }}>
                            <div style={{ display: 'flex', gap: 6 }}>
                              <button onClick={() => setEditingNode(node.id)} style={btn(C.accent)}>✏️ Edit</button>
                              <button onClick={() => setConfirmDel({ type: 'node', id: node.id, name: node.name })} style={btn(C.red)}>🗑️</button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredNodes.length === 0 && <div style={{ textAlign: 'center', padding: 32, color: C.text3, fontSize: 13 }}>No nodes found</div>}
            </>}

            {/* ── EDGES TAB ── */}
            {tab === 'edges' && <>

              {showAddEdge && (
                <div style={{ background: C.bg3, border: `1px solid ${C.green}`, borderRadius: 10, padding: 16, margin: '16px 0' }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: C.green, marginBottom: 12 }}>+ Add New Edge</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 10, color: C.text3, marginBottom: 4 }}>Source Node ID *</div>
                      <input value={newEdge.s} onChange={e => setNewEdge({ ...newEdge, s: e.target.value })}
                        placeholder="e.g. bldA_gate" style={inp()} list="node-list" />
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: C.text3, marginBottom: 4 }}>Destination Node ID *</div>
                      <input value={newEdge.d} onChange={e => setNewEdge({ ...newEdge, d: e.target.value })}
                        placeholder="e.g. bldA_c1" style={inp()} list="node-list" />
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: C.text3, marginBottom: 4 }}>Weight (metres) *</div>
                      <input type="number" value={newEdge.w} onChange={e => setNewEdge({ ...newEdge, w: e.target.value })}
                        placeholder="e.g. 30" style={inp()} />
                    </div>
                    <div>
                      <div style={{ fontSize: 10, color: C.text3, marginBottom: 4 }}>Edge Type *</div>
                      <select value={newEdge.type} onChange={e => setNewEdge({ ...newEdge, type: e.target.value })} style={inp()}>
                        {EDGE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                  </div>
                  <datalist id="node-list">
                    {nodes.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                  </datalist>
                  <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
                    <button onClick={addEdge} style={btn(C.green)}>✅ Add Edge</button>
                    <button onClick={() => setShowAddEdge(false)} style={btn(C.red)}>Cancel</button>
                  </div>
                </div>
              )}

              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 12 }}>
                <thead>
                  <tr style={{ background: C.bg3 }}>
                    {['Source', 'Destination', 'Weight', 'Type', 'Actions'].map(h => (
                      <th key={h} style={{ padding: '8px 10px', fontSize: 11, color: C.text3, textAlign: 'left', borderBottom: `1px solid ${C.border}`, fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredEdges.map((edge, i) => {
                    const srcNode = nodes.find(n => n.id === edge.s)
                    const dstNode = nodes.find(n => n.id === edge.d)
                    const edgeTypeColor = { outdoor: C.green, indoor: C.accent, transition: C.cyan, stairs: C.orange, lift: C.purple }
                    return (
                      <tr key={edge._id || `${edge.s}-${edge.d}-${i}`} style={{ background: i % 2 === 0 ? C.bg2 : C.bg3, borderBottom: `1px solid ${C.border}` }}>
                        <td style={{ padding: '8px 10px' }}>
                          <div style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{srcNode?.name || edge.s}</div>
                          <div style={{ fontSize: 10, color: C.text3, fontFamily: 'monospace' }}>{edge.s}</div>
                        </td>
                        <td style={{ padding: '8px 10px' }}>
                          <div style={{ fontSize: 12, color: C.text, fontWeight: 500 }}>{dstNode?.name || edge.d}</div>
                          <div style={{ fontSize: 10, color: C.text3, fontFamily: 'monospace' }}>{edge.d}</div>
                        </td>
                        <td style={{ padding: '8px 10px', fontSize: 13, fontWeight: 700, color: C.text }}>{edge.w}m</td>
                        <td style={{ padding: '8px 10px' }}>
                          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: (edgeTypeColor[edge.type] || C.accent) + '22', color: edgeTypeColor[edge.type] || C.accent }}>
                            {edge.type}
                          </span>
                        </td>
                        <td style={{ padding: '8px 10px' }}>
                          <button onClick={() => setConfirmDel({ type: 'edge', id: edge._id, s: edge.s, d: edge.d })} style={btn(C.red)}>🗑️ Delete</button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
              {filteredEdges.length === 0 && <div style={{ textAlign: 'center', padding: 32, color: C.text3, fontSize: 13 }}>No edges found</div>}
            </>}
          </div>
        )}
      </div>

      {/* Confirm Delete Modal */}
      {confirmDel && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: C.bg2, border: `1px solid ${C.red}`, borderRadius: 12, padding: 24, width: 340 }}>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.red, marginBottom: 8 }}>⚠️ Confirm Delete</div>
            <div style={{ fontSize: 13, color: C.text2, marginBottom: 16 }}>
              {confirmDel.type === 'node'
                ? `Delete node "${confirmDel.name}"? All connected edges will also be removed.`
                : `Delete edge: ${confirmDel.s} → ${confirmDel.d}?`}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => {
                if (confirmDel.type === 'node') deleteNode(confirmDel.id)
                else deleteEdge(confirmDel.id, confirmDel.s, confirmDel.d)
              }} style={{ ...btn(C.red), flex: 1 }}>Yes, Delete</button>
              <button onClick={() => setConfirmDel(null)} style={{ ...btn(C.accent), flex: 1 }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div style={{ position: 'fixed', bottom: 30, left: '50%', transform: 'translateX(-50%)', background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 20px', fontSize: 13, color: C.text, zIndex: 5000, boxShadow: '0 4px 20px rgba(0,0,0,.5)' }}>
          {toast}
        </div>
      )}
    </div>
  )
}