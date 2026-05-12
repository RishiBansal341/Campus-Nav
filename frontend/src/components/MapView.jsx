import { useEffect, useRef, useState } from 'react'
import { nodes } from '../data/campusGraph.js'

const CAMPUS = [26.85399, 75.82837]
const ZOOM   = 18

const NODE_COLOR = {
  outdoor: '#10b981',
  indoor:  '#3b82f6',
  lift:    '#8b5cf6',
  stairs:  '#f59e0b',
}

const MODE_COLOR = {
  normal:        '#3b82f6',
  emergency:     '#ef4444',
  accessibility: '#10b981',
}

const FLOOR_DASH = {
  '-1': '4,5',
  '0':  null,
  '1':  '12,6',
  '2':  null,
}

const FLOOR_LABEL = {
  '-1': 'Basement',
  '0':  'Ground Floor',
  '1':  'First Floor',
  '2':  'Second Floor',
}

function makeDot(color, size = 10) {
  return {
    html: `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${color};border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.5);"></div>`,
    iconSize: [size, size],
    className: '',
  }
}

// ── FIX: each segment OVERLAPS by 1 node with the next ──────
// This ensures the polyline is never broken at floor transitions.
// The transition node (stairs/lift) is included as the LAST point
// of the current segment AND the FIRST point of the next segment.
function splitByFloor(path) {
  const segments = []
  let cur = [], curFloor = null

  path.forEach((id, idx) => {
    const n = nodes.find(x => x.id === id)
    if (!n) return

    if (curFloor === null) {
      // First node — start new segment
      cur.push(id)
      curFloor = n.floor
    } else if (n.floor === curFloor) {
      // Same floor — keep going
      cur.push(id)
    } else {
      // Floor changed — close current segment INCLUDING this transition node
      // so the line reaches all the way to the transition point
      cur.push(id)
      segments.push({ floor: curFloor, path: [...cur] })
      // Start next segment FROM the same transition node (overlap by 1)
      cur = [id]
      curFloor = n.floor
    }
  })

  if (cur.length) segments.push({ floor: curFloor, path: cur })
  return segments
}

function findFloorChanges(segments) {
  const changes = []
  segments.forEach((seg, i) => {
    if (i < segments.length - 1) {
      // Transition node is the LAST node of this segment
      const transId   = seg.path[seg.path.length - 1]
      const transNode = nodes.find(n => n.id === transId)
      changes.push({
        fromFloor: seg.floor,
        toFloor:   segments[i + 1].floor,
        via:       transNode?.type === 'lift' ? 'Lift' : 'Stairs',
        nodeId:    transId,
        nodeName:  transNode?.name,
      })
    }
  })
  return changes
}

export default function MapView({ route, source, dest, mode, onNodeClick, onLocate, onClear, onBenchmark }) {
  const mapRef     = useRef(null)
  const leaflet    = useRef(null)
  const markers    = useRef({})
  const routeLayer = useRef(null)
  const expLayer   = useRef(null)
  const clickState = useRef('source')

  const [floorSegments, setFloorSegments] = useState([])
  const [floorChanges,  setFloorChanges]  = useState([])

  // ── Init map once ─────────────────────────────────────────
  useEffect(() => {
    if (leaflet.current) return
    const L = window.L; if (!L) return

    const map = L.map(mapRef.current, { zoomControl: false }).setView(CAMPUS, ZOOM)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 25, attribution: '© OpenStreetMap'
    }).addTo(map)
    L.control.zoom({ position: 'bottomright' }).addTo(map)
    leaflet.current = map

    nodes.forEach(node => {
      const color  = NODE_COLOR[node.type] || '#3b82f6'
      const marker = L.marker([node.lat, node.lng], { icon: L.divIcon(makeDot(color, 10)) })
        .addTo(map)
        .bindPopup(`
          <div style="font-family:Segoe UI;min-width:160px">
            <b style="color:#1e293b;font-size:13px">${node.name}</b><br/>
            <span style="color:#64748b;font-size:11px">${node.type} · ${FLOOR_LABEL[String(node.floor)] || 'Floor ' + node.floor}</span><br/>
            ${node.qr ? `<span style="color:#06b6d4;font-size:11px">${node.qr}</span>` : ''}
          </div>`)
        .on('click', () => {
          const isSrc = clickState.current === 'source'
          onNodeClick(node.id, isSrc)
          clickState.current = isSrc ? 'dest' : 'source'
        })
      markers.current[node.id] = { marker, node }
    })
  }, [onNodeClick])

  // ── Update source / dest marker size & color ──────────────
  useEffect(() => {
    const L = window.L; if (!L) return
    Object.entries(markers.current).forEach(([id, { marker, node }]) => {
      const isSrc = id === source
      const isDst = id === dest
      const color = isSrc ? '#ef4444' : isDst ? '#06b6d4' : NODE_COLOR[node.type] || '#3b82f6'
      const size  = isSrc || isDst ? 16 : 10
      marker.setIcon(L.divIcon(makeDot(color, size)))
    })
  }, [source, dest])

  // ── Compute floor segments when route changes ─────────────
  useEffect(() => {
    if (!route || route.path.length < 2) {
      setFloorSegments([]); setFloorChanges([]); return
    }
    const segs = splitByFloor(route.path)
    setFloorSegments(segs)
    setFloorChanges(findFloorChanges(segs))
  }, [route])

  // ── Draw full route with per-floor patterns ───────────────
  useEffect(() => {
    const L   = window.L
    const map = leaflet.current
    if (!L || !map) return

    if (routeLayer.current) { map.removeLayer(routeLayer.current); routeLayer.current = null }
    if (expLayer.current)   { map.removeLayer(expLayer.current);   expLayer.current   = null }
    if (!route || route.path.length < 2 || floorSegments.length === 0) return

    const lineColor = MODE_COLOR[mode] || '#3b82f6'
    routeLayer.current = L.layerGroup().addTo(map)
    expLayer.current   = L.layerGroup().addTo(map)

    // Explored nodes (purple dots)
    route.explored.forEach(id => {
      const n = nodes.find(x => x.id === id); if (!n) return
      L.circleMarker([n.lat, n.lng], {
        radius: 5, fillColor: '#8b5cf6', fillOpacity: 0.35,
        color: '#8b5cf6', weight: 1, opacity: 0.5,
      }).addTo(expLayer.current)
    })

    // ── Draw each floor segment ────────────────────────────
    floorSegments.forEach(seg => {
      const dashArr = FLOOR_DASH[String(seg.floor)]

      const latlngs = seg.path
        .map(id => { const n = nodes.find(x => x.id === id); return n ? [n.lat, n.lng] : null })
        .filter(Boolean)

      if (latlngs.length < 2) return   // need at least 2 points to draw a line

      L.polyline(latlngs, {
        color:     lineColor,
        weight:    5,
        opacity:   0.95,
        dashArray: dashArr || undefined,
      }).addTo(routeLayer.current)

      // Floor pill label at midpoint of this segment
      const mid = latlngs[Math.floor(latlngs.length / 2)]
      L.marker(mid, {
        icon: L.divIcon({
          html: `<div style="background:${lineColor};color:#fff;font-size:10px;font-weight:700;padding:3px 10px;border-radius:12px;border:2px solid #fff;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,.4);">
            ${FLOOR_LABEL[String(seg.floor)] || 'Floor ' + seg.floor}
          </div>`,
          className: '',
          iconAnchor: [50, 10],
        })
      }).addTo(expLayer.current)
    })

    // ── Floor transition markers (lift / stairs indicator) ──
    floorChanges.forEach(fc => {
      const n = nodes.find(x => x.id === fc.nodeId); if (!n) return
      const isLift = fc.via === 'Lift'
      L.marker([n.lat, n.lng], {
        icon: L.divIcon({
          html: `<div style="background:#1e2535;color:#fff;font-size:11px;font-weight:700;padding:5px 12px;border-radius:8px;border:2px solid ${isLift ? '#8b5cf6' : '#f59e0b'};white-space:nowrap;box-shadow:0 3px 10px rgba(0,0,0,.5);">
            ${isLift ? '🛗' : '🪜'} ${FLOOR_LABEL[String(fc.fromFloor)]} → ${FLOOR_LABEL[String(fc.toFloor)]}
          </div>`,
          className: '',
          iconAnchor: [0, 0],
        })
      }).addTo(expLayer.current)
    })

    // ── START marker ───────────────────────────────────────
    const startNode = nodes.find(x => x.id === route.path[0])
    if (startNode) {
      L.circleMarker([startNode.lat, startNode.lng], {
        radius: 9, fillColor: '#ef4444', fillOpacity: 1, color: '#fff', weight: 2,
      }).addTo(expLayer.current)
        .bindTooltip('🔴 START', { permanent: true, direction: 'top' })
    }

    // ── END marker ─────────────────────────────────────────
    const endNode = nodes.find(x => x.id === route.path[route.path.length - 1])
    if (endNode) {
      L.circleMarker([endNode.lat, endNode.lng], {
        radius: 9, fillColor: '#06b6d4', fillOpacity: 1, color: '#fff', weight: 2,
      }).addTo(expLayer.current)
        .bindTooltip('🔵 END', { permanent: true, direction: 'top' })
    }

    // Fit map to full route
    const allLL = route.path
      .map(id => { const n = nodes.find(x => x.id === id); return n ? [n.lat, n.lng] : null })
      .filter(Boolean)
    if (allLL.length >= 2) {
      map.fitBounds(L.latLngBounds(allLL), { padding: [60, 60] })
    }

  }, [route, mode, floorSegments, floorChanges])

  // ── Legend data ───────────────────────────────────────────
  const lineColor    = MODE_COLOR[mode] || '#3b82f6'
  const legendFloors = [
    { floor: '0',  label: 'Ground Floor', dashArray: null   },
    { floor: '1',  label: 'First Floor',  dashArray: '12,6' },
    { floor: '-1', label: 'Basement',     dashArray: '4,5'  },
    { floor: '2',  label: 'Second Floor', dashArray:  null },
  ].filter(f => floorSegments.some(s => String(s.floor) === f.floor))

  const btn = {
    background: '#1e2535', border: '1px solid #2d3a52', borderRadius: 8,
    padding: '9px 14px', fontSize: 12, color: '#e2e8f0', cursor: 'pointer',
    display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
  }

  return (
    <div style={{ flex: 1, position: 'relative' }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />

      {/* Top-right controls */}
      <div style={{ position: 'absolute', top: 12, right: 12, zIndex: 1000, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button style={btn} onClick={onLocate}>📍 My Location</button>
        <button style={btn} onClick={onClear}>✕ Clear Route</button>
        <button style={btn} onClick={onBenchmark}>⚡ Benchmark</button>
      </div>

      {/* Bottom-left legend */}
      <div style={{
        position: 'absolute', bottom: 30, left: 12, zIndex: 1000,
        background: 'rgba(22,27,39,.95)', border: '1px solid #2d3a52',
        borderRadius: 10, padding: '12px 14px', fontSize: 11,
        backdropFilter: 'blur(4px)', minWidth: 190,
      }}>
        {legendFloors.length > 0 && <>
          <div style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: 8, fontSize: 12 }}>
            🏢 Floor Legend
          </div>
          {legendFloors.map(({ floor, label, dashArray }) => (
            <div key={floor} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
              <svg width="36" height="8" style={{ flexShrink: 0 }}>
                <line x1="2" y1="4" x2="34" y2="4"
                  stroke={lineColor} strokeWidth="3"
                  strokeDasharray={dashArray || 'none'}
                  strokeLinecap="round"
                />
              </svg>
              <span style={{ color: '#e2e8f0' }}>{label}</span>
            </div>
          ))}
          <div style={{ borderTop: '1px solid #2d3a52', marginTop: 8, paddingTop: 8 }} />
        </>}

        <div style={{ fontWeight: 700, color: '#e2e8f0', marginBottom: 6, fontSize: 12 }}>
          📍 Node Types
        </div>
        {[
          { color: NODE_COLOR.outdoor, label: 'Outdoor' },
          { color: NODE_COLOR.indoor,  label: 'Indoor'  },
          { color: NODE_COLOR.lift,    label: 'Lift'    },
          { color: NODE_COLOR.stairs,  label: 'Stairs'  },
        ].map(({ color, label }) => (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: color, flexShrink: 0 }} />
            <span style={{ color: '#94a3b8' }}>{label}</span>
          </div>
        ))}
        <div style={{ borderTop: '1px solid #2d3a52', marginTop: 8, paddingTop: 8, display: 'flex', gap: 12, color: '#94a3b8' }}>
          <span>🔴 Start</span>
          <span>🔵 End</span>
          <span style={{ color: '#8b5cf6' }}>● Explored</span>
        </div>
      </div>
    </div>
  )
}