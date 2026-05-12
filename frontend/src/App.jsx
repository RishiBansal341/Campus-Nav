import { useState, useCallback } from 'react'
import TopBar              from './components/TopBar.jsx'
import Sidebar             from './components/Sidebar.jsx'
import MapView             from './components/MapView.jsx'
import { StatusBar, QRModal } from './components/StatusBar.jsx'
import { compareAlgorithms }  from './utils/routing.js'
import { nodes, edges }       from './data/campusGraph.js'
import AdminPanel from './components/AdminPanel.jsx'
import QRGenerator from './components/QRGenerator.jsx'
import Algovizpanel from './components/Algovizpanel.jsx'

export default function App() {
  const [mode,      setMode]      = useState('normal')
  const [algo,      setAlgo]      = useState('dijkstra')
  const [source,    setSource]    = useState(null)
  const [dest,      setDest]      = useState(null)
  const [route,     setRoute]     = useState(null)
  const [perfData,  setPerfData]  = useState(null)
  const [activeTab, setActiveTab] = useState('nodes')
  const [qrOpen,    setQrOpen]    = useState(false)
  const [toast,     setToast]     = useState('')
  const [gps,       setGps]       = useState({ lat: 26.85399, lng: 75.82837 })
  const [adminOpen, setAdminOpen] = useState(false)
  const [qrGenOpen, setQrGenOpen] = useState(false)

  const showToast = msg => { setToast(msg); setTimeout(() => setToast(''), 2800) }

  const computeRoute = useCallback((src, dst, m, a) => {
    if (!src || !dst || src === dst) return
    const result = compareAlgorithms(src, dst, m)
    setPerfData(result)
    // Choose which result to display on map
    const chosen   = a === 'astar' ? result.astar : result.dijkstra
    const explored = a === 'both'
      ? [...new Set([...result.dijkstra.explored, ...result.astar.explored])]
      : chosen.explored
    setRoute({ path: chosen.path, explored, cost: chosen.cost })
    setActiveTab('route')
    const srcName = nodes.find(n => n.id === src)?.name
    const dstName = nodes.find(n => n.id === dst)?.name
    showToast(`✅ Route: ${srcName} → ${dstName} · ${chosen.path.length} stops`)
  }, [])

  const handleSetSource = useCallback(id => {
    setSource(id); setDest(null); setRoute(null)
    showToast('📍 Source: ' + nodes.find(n => n.id === id)?.name)
  }, [])

  const handleSetDest = useCallback(id => {
    setDest(id)
    if (source) computeRoute(source, id, mode, algo)
    else showToast('⚠️ Please set source first')
  }, [source, mode, algo, computeRoute])

  const handleNodeClick = useCallback((id, isSource) => {
    if (isSource) handleSetSource(id)
    else handleSetDest(id)
  }, [handleSetSource, handleSetDest])

  const handleModeChange = m => {
    setMode(m)
    if (source && dest) computeRoute(source, dest, m, algo)
    showToast(`Mode: ${m.charAt(0).toUpperCase()+m.slice(1)}`)
  }

  const handleAlgoChange = a => {
    setAlgo(a)
    if (source && dest) computeRoute(source, dest, mode, a)
  }

  const handleQRScan = id => {
    setQrOpen(false)
    handleSetSource(id)
    showToast('📷 QR Scanned: ' + nodes.find(n => n.id === id)?.name)
  }

  const handleClear = () => {
    setSource(null); setDest(null); setRoute(null); setPerfData(null)
    showToast('🗑️ Route cleared')
  }

  const handleLocate = () => {
  if (!navigator.geolocation) {
    showToast('❌ GPS not supported on this device'); return
  }
  showToast('📡 Getting your location...')
  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude: lat, longitude: lng } = pos.coords
      setGps({ lat, lng })

      // Nearest node dhundo — Euclidean distance se
      let nearestId = null
      let minDist = Infinity

      nodes.forEach(node => {
        const dist = Math.sqrt(
          Math.pow(node.lat - lat, 2) +
          Math.pow(node.lng - lng, 2)
        )
        if (dist < minDist) {
          minDist = dist
          nearestId = node.id
        }
      })

      if (nearestId) {
        handleSetSource(nearestId)
        showToast('📍 Nearest location: ' + nodes.find(n => n.id === nearestId)?.name)
      }
    },
    (err) => {
      if (err.code === 1) showToast('❌ Location permission denied')
      else showToast('❌ GPS unavailable — try again')
    },
    { enableHighAccuracy: true, timeout: 8000 }
  )
}

  const handleSelectNode = id => {
    if (!source) handleSetSource(id)
    else if (!dest) handleSetDest(id)
    else { handleSetSource(id) }
  }

  return (
    <div style={{ height:'100vh',display:'flex',flexDirection:'column',background:'#0f1117',color:'#e2e8f0' }}>
      <TopBar
        mode={mode}          onModeChange={handleModeChange}
        algo={algo}          onAlgoChange={handleAlgoChange}
        onQROpen={() => setQrOpen(true)}
        onSelectNode={handleSelectNode}
        onAdminOpen={() => setAdminOpen(true)}
      />
      <div style={{ flex:1,display:'flex',overflow:'hidden' }}>
        <Sidebar
          activeTab={activeTab}  onTabChange={setActiveTab}
          source={source}        dest={dest}
          onSetSource={handleSetSource}
          onSetDest={handleSetDest}
          route={route}          perfData={perfData}
          mode={mode}
        />
        <MapView
          route={route}       source={source}   dest={dest}   mode={mode}
          onNodeClick={handleNodeClick}
          onLocate={handleLocate}
          onClear={handleClear}
          onBenchmark={() => { if (source && dest) { computeRoute(source, dest, mode, algo); setActiveTab('perf') } else showToast('Set source & destination first') }}
        />
      </div>
      <StatusBar
        gps={gps} mode={mode} algo={algo}
        nodeCount={nodes.length} edgeCount={edges.length}
        routeStatus={route ? `${route.path.length} stops · ${Math.round(route.cost)}m` : 'Ready'}
      />
      {qrOpen && <QRModal onScan={handleQRScan} onClose={() => setQrOpen(false)} />}
        {adminOpen && (
  <AdminPanel
    onClose={() => setAdminOpen(false)}
    onOpenQR={() => { setAdminOpen(false); setQrGenOpen(true) }}
    onGraphUpdate={(updatedNodes, updatedEdges) => {
      showToast('Graph updated!')
    }}
  />
)}
{qrGenOpen && <QRGenerator onClose={() => setQrGenOpen(false)} />}
      {toast && (
        <div style={{ position:'fixed',bottom:44,left:'50%',transform:'translateX(-50%)',background:'#1e2535',border:'1px solid #2d3a52',borderRadius:8,padding:'10px 20px',fontSize:13,color:'#e2e8f0',zIndex:3000,whiteSpace:'nowrap',boxShadow:'0 4px 24px rgba(0,0,0,.5)',animation:'fadein .2s ease' }}>
          {toast}
        </div>
      )}
    </div>
  )
}