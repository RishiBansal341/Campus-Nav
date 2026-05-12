import { useState } from 'react'
import { nodes } from '../data/campusGraph.js'

const C = { bg2:'#161b27',bg3:'#1e2535',bg4:'#252d3d',border:'#2d3a52',text:'#e2e8f0',text2:'#94a3b8',text3:'#64748b',accent:'#3b82f6',green:'#10b981',red:'#ef4444',purple:'#8b5cf6',orange:'#f59e0b',cyan:'#06b6d4' }
const NODE_COLOR  = { outdoor:'#10b981', indoor:'#3b82f6', lift:'#8b5cf6', stairs:'#f59e0b' }
const NODE_ICON   = { outdoor:'🏛️', indoor:'🚪', lift:'🛗', stairs:'🪜' }
const FLOOR_LABEL = { '-1':'Basement', '0':'Ground Floor', '1':'First Floor', '2':'Second Floor' }
const FLOOR_COLOR = { '-1':'#f59e0b', '0':'#10b981', '1':'#3b82f6', '2':'#8b5cf6' }

// Split path into floor groups
function groupByFloor(path) {
  const groups = []
  let current = [], currentFloor = null
  path.forEach(id => {
    const n = nodes.find(x => x.id === id); if (!n) return
    if (currentFloor === null || n.floor === currentFloor) {
      current.push(id); currentFloor = n.floor
    } else {
      groups.push({ floor: currentFloor, steps: current })
      current = [id]; currentFloor = n.floor
    }
  })
  if (current.length) groups.push({ floor: currentFloor, steps: current })
  return groups
}

export default function Sidebar({ activeTab, onTabChange, source, dest, onSetSource, onSetDest, route, perfData, mode }) {
  const tabs    = [{ id:'nodes',label:'Locations' }, { id:'route',label:'Route' }, { id:'perf',label:'Analytics' }]
  const outdoor = nodes.filter(n => n.type === 'outdoor')
  const indoor  = nodes.filter(n => n.type !== 'outdoor')
  const floorGroups = route ? groupByFloor(route.path) : []

  return (
    <div style={{ width:280,background:C.bg2,borderRight:`1px solid ${C.border}`,display:'flex',flexDirection:'column',flexShrink:0,overflow:'hidden' }}>
      {/* Tabs */}
      <div style={{ display:'flex',borderBottom:`1px solid ${C.border}` }}>
        {tabs.map(t => (
          <div key={t.id} onClick={() => onTabChange(t.id)}
            style={{ flex:1,padding:'11px 4px',textAlign:'center',fontSize:12,cursor:'pointer',
              color:activeTab===t.id?C.accent:C.text3,
              borderBottom:`2px solid ${activeTab===t.id?C.accent:'transparent'}`,transition:'all .15s' }}>
            {t.label}
          </div>
        ))}
      </div>

      <div style={{ flex:1,overflowY:'auto',padding:12 }}>

        {/* ── LOCATIONS ── */}
        {activeTab==='nodes' && <>
          <div style={{ fontSize:11,color:C.text3,background:C.bg3,borderRadius:6,padding:'6px 10px',marginBottom:10,lineHeight:1.6 }}>
            1️⃣ Click = <b style={{color:C.red}}>Source</b> &nbsp;|&nbsp; 2️⃣ Click = <b style={{color:C.cyan}}>Destination</b>
          </div>
          <SectionTitle>Outdoor</SectionTitle>
          {outdoor.map(n => <NodeCard key={n.id} node={n} source={source} dest={dest} onSetSource={onSetSource} onSetDest={onSetDest}/>)}
          <SectionTitle>Indoor / QR Anchored</SectionTitle>
          {indoor.map(n => <NodeCard key={n.id} node={n} source={source} dest={dest} onSetSource={onSetSource} onSetDest={onSetDest}/>)}
        </>}

        {/* ── ROUTE ── */}
        {activeTab==='route' && (route ? <>
          {/* Summary */}
          <SectionTitle>Route Summary</SectionTitle>
          <div style={{ background:C.bg3,border:`1px solid ${C.border}`,borderRadius:8,padding:10,marginBottom:10 }}>
            {[
              ['From',     nodes.find(n=>n.id===source)?.name||'—'],
              ['To',       nodes.find(n=>n.id===dest)?.name||'—'],
              ['Distance', Math.round(route.cost)+'m'],
              ['Stops',    route.path.length],
              ['Floors',   floorGroups.length > 1 ? floorGroups.length+' floors' : 'Single floor'],
              ['Mode',     mode.charAt(0).toUpperCase()+mode.slice(1)],
            ].map(([l,v]) => (
              <div key={l} style={{ display:'flex',justifyContent:'space-between',fontSize:12,padding:'5px 0',borderBottom:`1px solid ${C.border}` }}>
                <span style={{color:C.text3}}>{l}</span>
                <span style={{color:C.text,fontWeight:500}}>{v}</span>
              </div>
            ))}
          </div>

          {/* Floor overview chips */}
          {floorGroups.length > 1 && (
            <>
              <SectionTitle>Floor Journey</SectionTitle>
              <div style={{ display:'flex',alignItems:'center',gap:4,flexWrap:'wrap',marginBottom:12 }}>
                {floorGroups.map((g,i) => (
                  <span key={i} style={{ display:'flex',alignItems:'center',gap:4 }}>
                    <span style={{ fontSize:11,padding:'3px 10px',borderRadius:20,background:(FLOOR_COLOR[String(g.floor)]||C.accent)+'22',color:FLOOR_COLOR[String(g.floor)]||C.accent,border:`1px solid ${FLOOR_COLOR[String(g.floor)]||C.accent}`,fontWeight:600 }}>
                      {FLOOR_LABEL[String(g.floor)]||'Floor '+g.floor}
                    </span>
                    {i < floorGroups.length-1 && (
                      <span style={{ fontSize:14,color:C.orange }}>
                        {nodes.find(n=>n.id===g.steps[g.steps.length-1])?.type==='lift'?'🛗':'🪜'}
                      </span>
                    )}
                  </span>
                ))}
              </div>
            </>
          )}

          {/* Floor-wise turn by turn */}
          <SectionTitle>Turn-by-Turn (Floor wise)</SectionTitle>
          {floorGroups.map((group, gi) => {
            const fColor = FLOOR_COLOR[String(group.floor)] || C.accent
            const fLabel = FLOOR_LABEL[String(group.floor)] || 'Floor '+group.floor
            return (
              <div key={gi} style={{ marginBottom:12 }}>
                {/* Floor header */}
                <div style={{ display:'flex',alignItems:'center',gap:8,padding:'6px 10px',background:fColor+'18',border:`1px solid ${fColor}44`,borderRadius:8,marginBottom:6 }}>
                  <div style={{ width:8,height:8,borderRadius:'50%',background:fColor,flexShrink:0 }}/>
                  <span style={{ fontSize:12,fontWeight:700,color:fColor }}>{fLabel}</span>
                  <span style={{ fontSize:10,color:C.text3,marginLeft:'auto' }}>{group.steps.length} stops</span>
                </div>

                {/* Steps on this floor */}
                {group.steps.map((id, si) => {
                  const n = nodes.find(x=>x.id===id); if (!n) return null
                  const isFirst = gi===0 && si===0
                  const isLast  = gi===floorGroups.length-1 && si===group.steps.length-1
                  const isFloorChange = si===group.steps.length-1 && gi<floorGroups.length-1
                  const nextGroup = floorGroups[gi+1]
                  const isLift   = n.type==='lift'
                  const isStairs = n.type==='stairs'

                  return (
                    <div key={id}>
                      <div style={{ display:'flex',gap:8,padding:'6px 0',borderBottom:`1px solid ${C.border}`,alignItems:'flex-start' }}>
                        <div style={{ width:20,height:20,borderRadius:'50%',
                          background:isFirst?C.red:isLast?C.cyan:isStairs?C.orange:isLift?C.purple:fColor,
                          display:'flex',alignItems:'center',justifyContent:'center',fontSize:9,color:'#fff',flexShrink:0,marginTop:1 }}>
                          {isFirst?'S':isLast?'E':si+1}
                        </div>
                        <div style={{ fontSize:12,color:C.text2,lineHeight:1.5,flex:1 }}>
                          <b style={{color:C.text}}>{n.name}</b><br/>
                          <span style={{color:NODE_COLOR[n.type]||C.text3}}>{NODE_ICON[n.type]} {n.type}</span>
                        </div>
                      </div>

                      {/* Floor change indicator */}
                      {isFloorChange && nextGroup && (
                        <div style={{ display:'flex',alignItems:'center',gap:8,padding:'8px 10px',margin:'4px 0',background: isLift?'rgba(139,92,246,.15)':'rgba(245,158,11,.15)',border:`1px solid ${isLift?C.purple:C.orange}`,borderRadius:8 }}>
                          <span style={{fontSize:18}}>{isLift?'🛗':'🪜'}</span>
                          <div>
                            <div style={{fontSize:12,fontWeight:600,color:isLift?C.purple:C.orange}}>
                              {isLift?'Take Lift':'Use Stairs'}
                            </div>
                            <div style={{fontSize:11,color:C.text3}}>
                              {fLabel} → {FLOOR_LABEL[String(nextGroup.floor)]||'Floor '+nextGroup.floor}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </> : <Empty>Select source & destination to compute route</Empty>)}

        {/* ── ANALYTICS ── */}
        {activeTab==='perf' && (perfData ? <>
          <SectionTitle>Algorithm Comparison</SectionTitle>
          <div style={{ background:C.bg3,border:`1px solid ${C.border}`,borderRadius:8,padding:10,marginBottom:10,fontSize:11,color:C.text3,lineHeight:1.6 }}>
            <b style={{color:C.text}}>Mode: {mode}</b><br/>
            {mode==='normal'        && 'Standard shortest path — raw weights'}
            {mode==='emergency'     && '🚨 Stairs ×0.3 (fast) · Lift ×2.0 (avoided)'}
            {mode==='accessibility' && '♿ Stairs ×50 (avoided) · Lift ×0.2 (preferred)'}
          </div>

          {[['dijkstra','Dijkstra',C.accent],['astar','A*',C.purple]].map(([key,label,color]) => {
            const d = perfData[key]
            const maxT = Math.max(perfData.dijkstra.time, perfData.astar.time, 0.001)
            const maxN = Math.max(perfData.dijkstra.nodesExplored, perfData.astar.nodesExplored, 1)
            const faster = d.time <= (key==='dijkstra'?perfData.astar.time:perfData.dijkstra.time)
            const fewer  = d.nodesExplored <= (key==='dijkstra'?perfData.astar.nodesExplored:perfData.dijkstra.nodesExplored)
            return (
              <div key={key} style={{ background:C.bg3,border:`1px solid ${C.border}`,borderRadius:8,padding:12,marginBottom:8 }}>
                <div style={{ display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8 }}>
                  <span style={{fontSize:13,fontWeight:700,color}}>{label}</span>
                  {faster&&fewer&&<span style={{fontSize:10,padding:'2px 8px',borderRadius:4,background:'rgba(16,185,129,.2)',color:C.green}}>⚡ Winner</span>}
                </div>
                <div style={{ display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6,marginBottom:10 }}>
                  {[['Time',d.time+'ms'],['Nodes',d.nodesExplored],['Cost',Math.round(d.cost)+'m']].map(([l,v])=>(
                    <div key={l} style={{background:C.bg4,borderRadius:6,padding:'6px 8px'}}>
                      <div style={{fontSize:9,color:C.text3}}>{l}</div>
                      <div style={{fontSize:13,fontWeight:600,color:C.text}}>{v}</div>
                    </div>
                  ))}
                </div>
                <BarRow label="Time (ms)"       val={d.time}          max={maxT} color={color}/>
                <BarRow label="Nodes explored"  val={d.nodesExplored} max={maxN} color={color}/>
              </div>
            )
          })}

          <div style={{background:C.bg3,border:`1px solid ${C.border}`,borderRadius:8,padding:10,fontSize:11,color:C.text3,lineHeight:1.7}}>
            <b style={{color:C.text}}>Formula</b><br/>
            Dijkstra: explores uniformly<br/>
            A*: f(n) = g(n) + h(n)<br/>
            h(n) = Euclidean distance<br/>
            A* explores <b style={{color:C.green}}>{Math.max(0,perfData.dijkstra.nodesExplored-perfData.astar.nodesExplored)} fewer</b> nodes
          </div>
        </> : <Empty>Run a route to see metrics</Empty>)}

      </div>
    </div>
  )
}

function NodeCard({ node, source, dest, onSetSource, onSetDest }) {
  const [hover, setHover] = useState(false)
  const isSrc = node.id===source, isDst = node.id===dest
  const NC = { outdoor:'#10b981',indoor:'#3b82f6',lift:'#8b5cf6',stairs:'#f59e0b' }
  const FC = { '-1':'#f59e0b','0':'#10b981','1':'#3b82f6','2':'#8b5cf6' }
  const FL = { '-1':'B','0':'G','1':'F1','2':'F2' }
  return (
    <div onClick={() => { if(!source)onSetSource(node.id); else if(!dest)onSetDest(node.id); else{onSetSource(node.id);onSetDest(null)} }}
      onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}
      style={{ background:isSrc?'rgba(239,68,68,.1)':isDst?'rgba(6,182,212,.1)':hover?'#252d3d':'#1e2535',
        border:`1px solid ${isSrc?'#ef4444':isDst?'#06b6d4':hover?'#3b82f6':'#2d3a52'}`,
        borderRadius:8,padding:'8px 10px',marginBottom:6,cursor:'pointer',transition:'all .15s' }}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div style={{fontSize:13,fontWeight:600,color:'#e2e8f0'}}>{NODE_ICON[node.type]||'📍'} {node.name}</div>
        <span style={{fontSize:10,padding:'2px 6px',borderRadius:4,background:(FC[String(node.floor)]||'#3b82f6')+'22',color:FC[String(node.floor)]||'#3b82f6',fontWeight:600,flexShrink:0}}>
          {FL[String(node.floor)]||'F'+node.floor}
        </span>
      </div>
      <div style={{fontSize:10,color:'#64748b',marginTop:2}}>{FLOOR_LABEL[String(node.floor)]}{node.qr?` · ${node.qr}`:''}</div>
      <div style={{display:'flex',gap:4,marginTop:4,flexWrap:'wrap'}}>
        <span style={{fontSize:10,padding:'1px 6px',borderRadius:4,background:NC[node.type]+'33',color:NC[node.type]}}>{node.type}</span>
        {isSrc&&<span style={{fontSize:10,padding:'1px 6px',borderRadius:4,background:'rgba(239,68,68,.25)',color:'#ef4444'}}>Source</span>}
        {isDst&&<span style={{fontSize:10,padding:'1px 6px',borderRadius:4,background:'rgba(6,182,212,.25)',color:'#06b6d4'}}>Dest</span>}
      </div>
    </div>
  )
}

function SectionTitle({children}){return <div style={{fontSize:10,color:'#64748b',textTransform:'uppercase',letterSpacing:1,marginBottom:8,marginTop:12}}>{children}</div>}
function BarRow({label,val,max,color}){
  const pct=max?Math.min(100,(val/max*100)).toFixed(1):0
  return(<div style={{marginBottom:6}}>
    <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'#64748b',marginBottom:2}}><span>{label}</span><span>{val}</span></div>
    <div style={{height:5,background:'#252d3d',borderRadius:3,overflow:'hidden'}}>
      <div style={{height:'100%',width:pct+'%',background:color,borderRadius:3,transition:'width .5s ease'}}/>
    </div>
  </div>)
}
function Empty({children}){return <div style={{fontSize:12,color:'#64748b',textAlign:'center',marginTop:32,lineHeight:1.7,padding:'0 8px'}}>{children}</div>}