import { useState } from 'react'
import { nodes } from '../data/campusGraph.js'

export default function TopBar({ mode, onModeChange, algo, onAlgoChange, onQROpen, onSelectNode, onAdminOpen }) {
  const [query,   setQuery]   = useState('')
  const [results, setResults] = useState([])

  const handleSearch = e => {
    const q = e.target.value; setQuery(q)
    if (!q.trim()) { setResults([]); return }
    setResults(nodes.filter(n => n.name.toLowerCase().includes(q.toLowerCase())).slice(0, 7))
  }

  const select = id => { setQuery(''); setResults([]); onSelectNode(id) }

  const modeBtn = (m, label, activeColor) => (
    <button key={m} onClick={() => onModeChange(m)}
      style={{ padding:'6px 11px',fontSize:11,borderRadius:8,cursor:'pointer',border:`1px solid ${mode===m?activeColor:'#2d3a52'}`,
        background: mode===m?activeColor+'22':'transparent',color: mode===m?activeColor:'#94a3b8',whiteSpace:'nowrap',transition:'all .15s' }}>
      {label}
    </button>
  )

  return (
    <div style={{ background:'#161b27',borderBottom:'1px solid #2d3a52',padding:'10px 16px',display:'flex',alignItems:'center',gap:10,flexShrink:0,flexWrap:'wrap',zIndex:500 }}>
      <div style={{ fontSize:15,fontWeight:700,color:'#3b82f6',whiteSpace:'nowrap' }}>
        Campus<span style={{color:'#06b6d4'}}>Nav</span>
        <span style={{fontSize:10,color:'#64748b',fontWeight:400,marginLeft:8}}>BIT Mesra Jaipur</span>
      </div>

      {/* Search */}
      <div style={{ position:'relative',flex:1,maxWidth:320 }}>
        <input value={query} onChange={handleSearch}
          placeholder="🔍 Search room, lab, office..."
          style={{ width:'100%',background:'#1e2535',border:'1px solid #2d3a52',borderRadius:8,padding:'7px 12px',fontSize:13,color:'#e2e8f0',outline:'none' }} />
        {results.length>0 && (
          <div style={{ position:'absolute',top:'calc(100% + 4px)',left:0,right:0,background:'#1e2535',border:'1px solid #2d3a52',borderRadius:8,zIndex:999,overflow:'hidden',boxShadow:'0 8px 24px rgba(0,0,0,.4)' }}>
            {results.map(n => (
              <div key={n.id} onClick={() => select(n.id)}
                style={{ padding:'8px 12px',fontSize:13,cursor:'pointer',color:'#e2e8f0',display:'flex',justifyContent:'space-between',borderBottom:'1px solid #2d3a52' }}
                onMouseEnter={e=>e.currentTarget.style.background='#252d3d'}
                onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
                <span>{n.name}</span>
                <span style={{fontSize:10,color:'#64748b'}}>{n.type}{n.floor!==0?` · ${n.floor===-1?'B':'F'+n.floor}`:''}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mode buttons */}
      <div style={{ display:'flex',gap:4 }}>
        {modeBtn('normal',      '🚶 Normal',     '#3b82f6')}
        {modeBtn('emergency',   '🚨 Emergency',  '#ef4444')}
        {modeBtn('accessibility','♿ Accessible', '#10b981')}
      </div>

      {/* Algorithm toggle */}
      <div style={{ display:'flex',background:'#1e2535',border:'1px solid #2d3a52',borderRadius:8,overflow:'hidden' }}>
        {[['dijkstra','Dijkstra'],['astar','A*'],['both','Compare']].map(([key,label])=>(
          <button key={key} onClick={() => onAlgoChange(key)}
            style={{ padding:'6px 11px',fontSize:11,cursor:'pointer',border:'none',background: algo===key?'#3b82f6':'transparent',color: algo===key?'#fff':'#94a3b8',transition:'all .15s' }}>
            {label}
          </button>
        ))}
      </div>

      <button onClick={onQROpen}
  style={{ padding:'6px 12px',fontSize:11,borderRadius:8,cursor:'pointer',border:'1px solid #2d3a52',background:'transparent',color:'#94a3b8',whiteSpace:'nowrap' }}>
  📷 Scan QR
</button>

<button onClick={onAdminOpen}
  style={{ padding:'6px 12px',fontSize:11,borderRadius:8,cursor:'pointer',border:'1px solid #8b5cf6',background:'rgba(139,92,246,.1)',color:'#a78bfa',whiteSpace:'nowrap' }}>
  ⚙️ Admin
</button>

    </div>
  )
}