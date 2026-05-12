import { useState } from 'react'
import { nodes } from '../data/campusGraph.js'

// QR code generate using Google Charts API (free, no install needed)
function getQRUrl(text, size = 200) {
  return `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&bgcolor=ffffff&color=000000&margin=10`
}

const FLOOR_LABEL = { '-1': 'Basement', '0': 'Ground Floor', '1': 'First Floor', '2': 'Second Floor' }
const C = {
  bg2: '#161b27', bg3: '#1e2535', bg4: '#252d3d', border: '#2d3a52',
  text: '#e2e8f0', text2: '#94a3b8', text3: '#64748b',
  accent: '#3b82f6', green: '#10b981', purple: '#8b5cf6', cyan: '#06b6d4',
}

export default function QRGenerator({ onClose }) {
  const indoorNodes = nodes.filter(n => n.qr)
  const [selected, setSelected] = useState(null)
  const [search,   setSearch]   = useState('')
  const [size,     setSize]     = useState(200)
  const [printAll, setPrintAll] = useState(false)

  const filtered = indoorNodes.filter(n =>
    n.name.toLowerCase().includes(search.toLowerCase()) ||
    n.qr.toLowerCase().includes(search.toLowerCase())
  )

  // QR payload — JSON with node info
  const getPayload = node => JSON.stringify({
    type:    'campus_nav',
    nodeId:  node.id,
    name:    node.name,
    floor:   node.floor,
    qr:      node.qr,
    campus:  'BIT Mesra Jaipur'
  })

  const downloadQR = async (node) => {
    const url = getQRUrl(getPayload(node), 300)
    const res  = await fetch(url)
    const blob = await res.blob()
    const a    = document.createElement('a')
    a.href     = URL.createObjectURL(blob)
    a.download = `${node.qr}-${node.name.replace(/\s+/g, '_')}.png`
    a.click()
  }

  const printQR = (node) => {
    const payload = getPayload(node)
    const qrUrl   = getQRUrl(payload, 250)
    const win     = window.open('', '_blank')
    win.document.write(`
      <html><head><title>QR - ${node.name}</title>
      <style>
        body { font-family: Arial, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #fff; }
        .card { border: 2px solid #000; border-radius: 12px; padding: 20px; text-align: center; max-width: 300px; }
        .title { font-size: 16px; font-weight: bold; margin: 12px 0 4px; }
        .floor { font-size: 13px; color: #555; margin-bottom: 4px; }
        .qr-code { font-size: 12px; color: #888; font-family: monospace; }
        img { border-radius: 8px; }
        @media print { body { margin: 0; } }
      </style></head>
      <body>
        <div class="card">
          <img src="${qrUrl}" width="220" height="220" />
          <div class="title">${node.name}</div>
          <div class="floor">${FLOOR_LABEL[String(node.floor)] || 'Floor ' + node.floor}</div>
          <div class="qr-code">${node.qr}</div>
          <div style="font-size:11px;color:#aaa;margin-top:8px">BIT Mesra Jaipur • CampusNav</div>
        </div>
        <script>window.onload = () => { window.print(); window.close(); }<\/script>
      </body></html>
    `)
    win.document.close()
  }

  const printAllQR = () => {
    const cards = filtered.map(node => {
      const qrUrl = getQRUrl(getPayload(node), 180)
      return `
        <div class="card">
          <img src="${qrUrl}" width="160" height="160" />
          <div class="title">${node.name}</div>
          <div class="floor">${FLOOR_LABEL[String(node.floor)] || 'Floor ' + node.floor}</div>
          <div class="qr-code">${node.qr}</div>
        </div>`
    }).join('')

    const win = window.open('', '_blank')
    win.document.write(`
      <html><head><title>All QR Codes - BIT Jaipur</title>
      <style>
        body { font-family: Arial; margin: 20px; }
        h2 { text-align: center; margin-bottom: 20px; }
        .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; }
        .card { border: 1.5px solid #ccc; border-radius: 10px; padding: 12px; text-align: center; page-break-inside: avoid; }
        .title { font-size: 12px; font-weight: bold; margin: 8px 0 2px; }
        .floor { font-size: 11px; color: #666; }
        .qr-code { font-size: 10px; color: #999; font-family: monospace; }
        @media print { .grid { grid-template-columns: repeat(4, 1fr); } }
      </style></head>
      <body>
        <h2>📍 BIT Mesra Jaipur — Indoor QR Codes</h2>
        <div class="grid">${cards}</div>
        <script>window.onload = () => { window.print(); }<\/script>
      </body></html>
    `)
    win.document.close()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.85)', zIndex: 4000, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(4px)' }}>
      <div style={{ background: C.bg2, border: `1px solid ${C.border}`, borderRadius: 14, width: '90vw', maxWidth: 960, height: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,.7)' }}>

        {/* Header */}
        <div style={{ padding: '14px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
          <span style={{ fontSize: 20 }}>📷</span>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700, color: C.text }}>QR Code Generator</div>
            <div style={{ fontSize: 11, color: C.text3 }}>{indoorNodes.length} indoor locations · Print or download QR codes</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <button onClick={printAllQR}
              style={{ padding: '7px 14px', fontSize: 12, borderRadius: 6, cursor: 'pointer', border: `1px solid ${C.green}`, background: C.green + '22', color: C.green, fontWeight: 600 }}>
              🖨️ Print All ({filtered.length})
            </button>
            <button onClick={onClose}
              style={{ padding: '7px 14px', fontSize: 12, borderRadius: 6, cursor: 'pointer', border: '1px solid #ef4444', background: '#ef444422', color: '#ef4444', fontWeight: 600 }}>
              ✕ Close
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div style={{ padding: '10px 20px', borderBottom: `1px solid ${C.border}`, display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="🔍 Search location..."
            style={{ background: C.bg3, border: `1px solid ${C.border}`, borderRadius: 6, padding: '7px 12px', fontSize: 12, color: C.text, outline: 'none', width: 240 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: C.text2 }}>
            <span>QR Size:</span>
            {[150, 200, 300].map(s => (
              <button key={s} onClick={() => setSize(s)}
                style={{ padding: '4px 10px', fontSize: 11, borderRadius: 6, cursor: 'pointer', border: `1px solid ${size === s ? C.accent : C.border}`, background: size === s ? C.accent + '22' : 'transparent', color: size === s ? C.accent : C.text3 }}>
                {s}px
              </button>
            ))}
          </div>
          <div style={{ marginLeft: 'auto', fontSize: 12, color: C.text3 }}>
            {filtered.length} locations
          </div>
        </div>

        {/* QR Grid */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
            {filtered.map(node => {
              const payload = getPayload(node)
              const qrUrl   = getQRUrl(payload, size)
              const isSelected = selected === node.id
              return (
                <div key={node.id}
                  onClick={() => setSelected(isSelected ? null : node.id)}
                  style={{ background: isSelected ? C.bg4 : C.bg3, border: `2px solid ${isSelected ? C.accent : C.border}`, borderRadius: 12, padding: 14, cursor: 'pointer', transition: 'all .15s', textAlign: 'center' }}>

                  {/* QR Image */}
                  <div style={{ background: '#fff', borderRadius: 8, padding: 8, display: 'inline-block', marginBottom: 10 }}>
                    <img src={qrUrl} width={size * 0.7} height={size * 0.7} alt={node.qr}
                      style={{ display: 'block', borderRadius: 4 }} />
                  </div>

                  {/* Info */}
                  <div style={{ fontSize: 12, fontWeight: 700, color: C.text, marginBottom: 4 }}>{node.name}</div>
                  <div style={{ fontSize: 11, color: C.text3, marginBottom: 6 }}>
                    {FLOOR_LABEL[String(node.floor)] || 'Floor ' + node.floor}
                  </div>
                  <div style={{ fontSize: 10, color: C.cyan, fontFamily: 'monospace', marginBottom: 10 }}>{node.qr}</div>

                  {/* Actions */}
                  <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
                    <button onClick={e => { e.stopPropagation(); downloadQR(node) }}
                      style={{ padding: '5px 10px', fontSize: 11, borderRadius: 6, cursor: 'pointer', border: `1px solid ${C.accent}`, background: C.accent + '22', color: C.accent }}>
                      ⬇️ Download
                    </button>
                    <button onClick={e => { e.stopPropagation(); printQR(node) }}
                      style={{ padding: '5px 10px', fontSize: 11, borderRadius: 6, cursor: 'pointer', border: `1px solid ${C.green}`, background: C.green + '22', color: C.green }}>
                      🖨️ Print
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}