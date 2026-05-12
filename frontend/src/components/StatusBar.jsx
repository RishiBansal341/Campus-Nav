import { useState } from 'react'
import { nodes } from '../data/campusGraph.js'

// ── StatusBar ──────────────────────────────────────────────
export function StatusBar({ gps, mode, algo, nodeCount, edgeCount, routeStatus }) {
  return (
    <div style={{ background:'#161b27',borderTop:'1px solid #2d3a52',padding:'6px 16px',display:'flex',gap:20,alignItems:'center',fontSize:11,color:'#64748b',flexShrink:0 }}>
      <span><span style={{display:'inline-block',width:7,height:7,borderRadius:'50%',background:'#10b981',marginRight:5}}/>GPS Active</span>
      <span>Lat: {gps.lat.toFixed(5)}, Lng: {gps.lng.toFixed(5)}</span>
      <span>Nodes: {nodeCount}</span>
      <span>Edges: {edgeCount}</span>
      <span>Mode: <b style={{color:'#e2e8f0',textTransform:'capitalize'}}>{mode}</b></span>
      <span>Algo: <b style={{color:'#e2e8f0'}}>{algo==='astar'?'A*':algo==='both'?'Compare':'Dijkstra'}</b></span>
      <span style={{marginLeft:'auto',color:'#10b981'}}>{routeStatus}</span>
    </div>
  )
}

// ── QRModal ────────────────────────────────────────────────
const NODE_ICON = { indoor:'🚪', lift:'🛗', stairs:'🪜', outdoor:'🏛️' }
const FLOOR_LABEL = { '-1':'Basement', '0':'Ground', '1':'1st Floor', '2':'2nd Floor' }

export function QRModal({ onScan, onClose }) {
  const [hovered, setHovered] = useState(null)
  const qrNodes = nodes.filter(n => n.qr)

  return (
    <div onClick={e=>{ if(e.target===e.currentTarget) onClose() }}
      style={{ position:'fixed',inset:0,background:'rgba(0,0,0,.8)',zIndex:2000,display:'flex',alignItems:'center',justifyContent:'center' }}>
      <div style={{ background:'#161b27',border:'1px solid #2d3a52',borderRadius:12,padding:24,width:380,maxWidth:'92vw',maxHeight:'85vh',display:'flex',flexDirection:'column' }}>
        <div style={{fontSize:16,fontWeight:700,color:'#e2e8f0',marginBottom:4}}>📷 QR Indoor Scan</div>
        <div style={{fontSize:12,color:'#64748b',marginBottom:16}}>Tap a QR anchor to set your indoor position as source</div>

        <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr',gap:8,overflowY:'auto',flex:1,marginBottom:16 }}>
          {qrNodes.map(n => (
            <div key={n.id} onClick={() => onScan(n.id)}
              onMouseEnter={() => setHovered(n.id)}
              onMouseLeave={() => setHovered(null)}
              style={{ background: hovered===n.id?'#252d3d':'#1e2535',border:`1px solid ${hovered===n.id?'#06b6d4':'#2d3a52'}`,borderRadius:8,padding:10,cursor:'pointer',textAlign:'center',transition:'all .15s' }}>
              <div style={{fontSize:22,marginBottom:4}}>{NODE_ICON[n.type]||'🚪'}</div>
              <div style={{fontSize:11,fontWeight:600,color:'#e2e8f0',marginBottom:2}}>{n.name}</div>
              <div style={{fontSize:10,color:'#64748b'}}>{FLOOR_LABEL[String(n.floor)]||'Floor '+n.floor}</div>
              <div style={{fontSize:10,color:'#06b6d4',marginTop:2}}>{n.qr}</div>
            </div>
          ))}
        </div>

        <button onClick={onClose} style={{ width:'100%',padding:9,background:'transparent',border:'1px solid #2d3a52',borderRadius:8,color:'#94a3b8',cursor:'pointer',fontSize:13 }}>
          Cancel
        </button>
      </div>
    </div>
  )
}