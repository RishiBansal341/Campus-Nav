import { useState, useEffect, useRef } from 'react'
import { nodes } from '../data/campusGraph.js'
import { Html5Qrcode } from 'html5-qrcode'

const typeIcon   = { indoor: '🚪', lift: '🛗', stairs: '🪜', outdoor: '🏛️' }
const FLOOR_LABEL = { '-1': 'Basement', '0': 'Ground', '1': '1st Floor', '2': '2nd Floor' }

export default function QRModal({ onScan, onClose }) {
  const [tab,      setTab]      = useState('simulate')
  const [hovered,  setHovered]  = useState(null)
  const [scanning, setScanning] = useState(false)
  const [error,    setError]    = useState('')
  const [search,   setSearch]   = useState('')
  const scannerRef = useRef(null)

  const indoorNodes = nodes.filter(n => n.qr)
  const filtered    = indoorNodes.filter(n =>
    n.name.toLowerCase().includes(search.toLowerCase()) ||
    n.qr.toLowerCase().includes(search.toLowerCase())
  )

  // Cleanup on unmount
  useEffect(() => {
    return () => { scannerRef.current?.stop().catch(() => {}) }
  }, [])

  const switchTab = async (t) => {
    if (scannerRef.current) {
      await scannerRef.current.stop().catch(() => {})
      scannerRef.current = null
      setScanning(false)
    }
    setError('')
    setTab(t)
  }

  const startCamera = async () => {
    setError('')
    try {
      const scanner = new Html5Qrcode('qr-reader-box')
      scannerRef.current = scanner
      setScanning(true)

      await scanner.start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 220, height: 220 } },
        (decoded) => {
          // Try JSON first, then plain text
          let found = null
          try {
            const payload = JSON.parse(decoded)
            const nodeId  = payload.nodeId || payload.id
            found = nodes.find(n => n.id === nodeId || n.qr === nodeId)
          } catch {
            const raw = decoded.trim()
            found = nodes.find(n => n.id === raw || n.qr === raw)
          }

          if (found) {
            scanner.stop().catch(() => {})
            scannerRef.current = null
            setScanning(false)
            onScan(found.id)
          } else {
            setError('QR scanned but location not recognized')
          }
        },
        () => {} // ignore per-frame errors
      )
    } catch (err) {
      setScanning(false)
      scannerRef.current = null
      if (err?.message?.includes('Permission')) {
        setError('Camera permission denied. Please allow camera access in browser settings.')
      } else {
        setError('Could not start camera. Make sure no other app is using it.')
      }
    }
  }

  const stopCamera = async () => {
    await scannerRef.current?.stop().catch(() => {})
    scannerRef.current = null
    setScanning(false)
    setError('')
  }

  return (
    <div
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.8)', zIndex: 2000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>

      <div style={{ background: '#161b27', border: '1px solid #2d3a52', borderRadius: 14, width: 420, maxWidth: '94vw', maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,.6)' }}>

        {/* Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #2d3a52', flexShrink: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: '#e2e8f0', marginBottom: 2 }}>📷 QR Indoor Scan</div>
          <div style={{ fontSize: 12, color: '#64748b' }}>Scan or select your indoor location</div>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #2d3a52', flexShrink: 0 }}>
          {[['simulate', '📋 Select Location'], ['camera', '📸 Camera Scan']].map(([id, label]) => (
            <div key={id} onClick={() => switchTab(id)}
              style={{ flex: 1, padding: '10px', textAlign: 'center', fontSize: 12, cursor: 'pointer',
                fontWeight: tab === id ? 600 : 400,
                color: tab === id ? '#3b82f6' : '#64748b',
                borderBottom: `2px solid ${tab === id ? '#3b82f6' : 'transparent'}`,
                transition: 'all .15s' }}>
              {label}
            </div>
          ))}
        </div>

        {/* ── SELECT LOCATION TAB ── */}
        {tab === 'simulate' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ padding: '10px 16px', borderBottom: '1px solid #2d3a52', flexShrink: 0 }}>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="🔍 Search room..."
                style={{ width: '100%', background: '#1e2535', border: '1px solid #2d3a52', borderRadius: 6, padding: '7px 10px', fontSize: 12, color: '#e2e8f0', outline: 'none' }} />
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: 12 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {filtered.map(n => (
                  <div key={n.id} onClick={() => onScan(n.id)}
                    onMouseEnter={() => setHovered(n.id)}
                    onMouseLeave={() => setHovered(null)}
                    style={{ background: hovered === n.id ? '#252d3d' : '#1e2535', border: `1px solid ${hovered === n.id ? '#06b6d4' : '#2d3a52'}`, borderRadius: 8, padding: 10, cursor: 'pointer', textAlign: 'center', transition: 'all .15s' }}>
                    <div style={{ fontSize: 22, marginBottom: 4 }}>{typeIcon[n.type] || '🚪'}</div>
                    <div style={{ fontSize: 11, fontWeight: 600, color: '#e2e8f0', marginBottom: 2 }}>{n.name}</div>
                    <div style={{ fontSize: 10, color: '#64748b' }}>{FLOOR_LABEL[String(n.floor)] || 'Floor ' + n.floor}</div>
                    <div style={{ fontSize: 10, color: '#06b6d4', marginTop: 2 }}>{n.qr}</div>
                  </div>
                ))}
              </div>
              {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: 24, color: '#64748b', fontSize: 13 }}>No locations found</div>
              )}
            </div>
          </div>
        )}

        {/* ── CAMERA SCAN TAB ── */}
        {tab === 'camera' && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 20, gap: 16 }}>

            {/* QR reader box — always in DOM when tab is camera */}
            <div
              id="qr-reader-box"
              style={{
                width: '100%', minHeight: scanning ? 280 : 0,
                borderRadius: 10, overflow: 'hidden',
                display: scanning ? 'block' : 'none',
                border: scanning ? '2px solid #3b82f6' : 'none'
              }}
            />

            {/* Not scanning — show start button */}
            {!scanning && (
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 56 }}>📷</div>
                <div style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.7 }}>
                  Point your camera at a CampusNav QR code<br/>
                  <span style={{ fontSize: 11, color: '#64748b' }}>QR codes are generated from Admin → QR Codes</span>
                </div>
                <button onClick={startCamera}
                  style={{ marginTop: 8, padding: '11px 28px', fontSize: 14, borderRadius: 8, cursor: 'pointer', border: '1px solid #3b82f6', background: 'rgba(59,130,246,.2)', color: '#3b82f6', fontWeight: 700, letterSpacing: 0.3 }}>
                  📸 Start Camera
                </button>
              </div>
            )}

            {/* Scanning indicator */}
            {scanning && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#10b981' }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                Scanning... point camera at QR code
              </div>
            )}

            {/* Error message */}
            {error && (
              <div style={{ background: 'rgba(239,68,68,.1)', border: '1px solid #ef4444', borderRadius: 8, padding: '10px 14px', fontSize: 12, color: '#ef4444', width: '100%', textAlign: 'center', lineHeight: 1.6 }}>
                ⚠️ {error}
                <br/>
                <button onClick={() => { setError(''); }}
                  style={{ marginTop: 8, padding: '5px 16px', fontSize: 11, borderRadius: 6, cursor: 'pointer', border: '1px solid #ef4444', background: 'transparent', color: '#ef4444' }}>
                  Try Again
                </button>
              </div>
            )}

            {/* Stop button */}
            {scanning && (
              <button onClick={stopCamera}
                style={{ padding: '8px 20px', fontSize: 12, borderRadius: 8, cursor: 'pointer', border: '1px solid #ef4444', background: 'rgba(239,68,68,.1)', color: '#ef4444', fontWeight: 600 }}>
                ⏹ Stop Camera
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid #2d3a52', flexShrink: 0 }}>
          <button onClick={onClose}
            style={{ width: '100%', padding: 9, background: 'transparent', border: '1px solid #2d3a52', borderRadius: 8, color: '#94a3b8', cursor: 'pointer', fontSize: 13 }}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}