// ============================================================
// BIT Mesra Jaipur Campus — EXACT Coordinates
// Based on actual GPS coordinates provided:
//
// Building A (C1-C5):    26.854756, 75.828151
// Building B (Seminar):  26.854389, 75.828387
// Building C (Labs):     26.854263, 75.828184  ← right side
// Building D (Library):  26.854420, 75.828712
// Building E (Carpentry):26.853755, 75.828716
// Gym/Parking:           26.854146, 75.827879
// ============================================================

export const nodes = [

  // ══════════════════════════════════════════════════════════
  // OUTDOOR
  // ══════════════════════════════════════════════════════════
  {
    id: 'main_gate', name: 'Main Entry Gate',
    type: 'outdoor', lat: 26.854050, lng: 75.827750, floor: 0, accessible: true,
  },
  {
    id: 'rotating_gate', name: 'Rotating Gate',
    type: 'outdoor', lat: 26.853900, lng: 75.827820, floor: 0, accessible: true,
  },
  {
    id: 'parking', name: 'Student Parking',
    type: 'outdoor', lat: 26.854050, lng: 75.827879, floor: 0, accessible: true,
  },
  {
    id: 'gym', name: 'Gym & Sports Room',
    type: 'outdoor', lat: 26.854146, lng: 75.827879, floor: 0, accessible: true,
  },
  {
    id: 'ground', name: 'Main Ground / Stage',
    type: 'outdoor', lat: 26.854200, lng: 75.828050, floor: 0, accessible: true,
  },

  // ══════════════════════════════════════════════════════════
  // BUILDING A — C1-C5 wali building (top, 26.854756, 75.828151)
  // Ground: E-Library, Staff Room, Admission Cell, Director Office
  // First Floor: C1-C5, BIT Office
  // ══════════════════════════════════════════════════════════
  {
    id: 'bldA_gate', name: 'Block A — Entrance',
    type: 'outdoor', lat: 26.854700, lng: 75.828100, floor: 0, accessible: true,
  },
  // Ground Floor — spread along building width
  {
    id: 'bldA_elibrary', name: 'E-Library',
    type: 'indoor', lat: 26.854756, lng: 75.828100, floor: 0, accessible: true, qr: 'QR-A-001',
  },
  {
    id: 'bldA_staff1', name: 'Staff Room 1',
    type: 'indoor', lat: 26.854756, lng: 75.828130, floor: 0, accessible: true, qr: 'QR-A-002',
  },
  {
    id: 'bldA_admission', name: 'Admission Cell',
    type: 'indoor', lat: 26.854756, lng: 75.828160, floor: 0, accessible: true, qr: 'QR-A-003',
  },
  {
    id: 'bldA_director', name: 'Director Office',
    type: 'indoor', lat: 26.854756, lng: 75.828190, floor: 0, accessible: true, qr: 'QR-A-004',
  },
  {
    id: 'bldA_sitting', name: 'Sitting Area',
    type: 'indoor', lat: 26.854756, lng: 75.828220, floor: 0, accessible: true, qr: 'QR-A-005',
  },
  {
    id: 'bldA_stairs', name: 'Block A — Stairs',
    type: 'stairs', lat: 26.854720, lng: 75.828151, floor: 0, accessible: false, qr: 'QR-A-STR',
  },
  // First Floor
  {
    id: 'bldA_c1', name: 'Classroom C1',
    type: 'indoor', lat: 26.854790, lng: 75.828100, floor: 1, accessible: true, qr: 'QR-A-101',
  },
  {
    id: 'bldA_c2', name: 'Classroom C2',
    type: 'indoor', lat: 26.854790, lng: 75.828130, floor: 1, accessible: true, qr: 'QR-A-102',
  },
  {
    id: 'bldA_c3', name: 'Classroom C3',
    type: 'indoor', lat: 26.854790, lng: 75.828160, floor: 1, accessible: true, qr: 'QR-A-103',
  },
  {
    id: 'bldA_c4', name: 'Classroom C4',
    type: 'indoor', lat: 26.854790, lng: 75.828190, floor: 1, accessible: true, qr: 'QR-A-104',
  },
  {
    id: 'bldA_c5', name: 'Classroom C5',
    type: 'indoor', lat: 26.854790, lng: 75.828220, floor: 1, accessible: true, qr: 'QR-A-105',
  },
  {
    id: 'bldA_bitoffice', name: 'BIT Office',
    type: 'indoor', lat: 26.854790, lng: 75.828250, floor: 1, accessible: true, qr: 'QR-A-106',
  },

  // ══════════════════════════════════════════════════════════
  // BUILDING B — Seminar Hall wali (26.854389, 75.828387)
  // Ground: Seminar Hall, Notice Boards, Accounts, C11-C13, LIFT
  // First Floor: C6-C10
  // ══════════════════════════════════════════════════════════
  {
    id: 'bldB_gate', name: 'Block B — Entrance',
    type: 'outdoor', lat: 26.854389, lng: 75.828320, floor: 0, accessible: true,
  },
  // Ground Floor
  {
    id: 'bldB_seminar', name: 'Seminar Hall',
    type: 'indoor', lat: 26.854389, lng: 75.828340, floor: 0, accessible: true, qr: 'QR-B-001',
  },
  {
    id: 'bldB_notice', name: 'Notice Board Hall',
    type: 'indoor', lat: 26.854389, lng: 75.828365, floor: 0, accessible: true, qr: 'QR-B-002',
  },
  {
    id: 'bldB_accounts', name: 'Accounts Office',
    type: 'indoor', lat: 26.854389, lng: 75.828390, floor: 0, accessible: true, qr: 'QR-B-003',
  },
  {
    id: 'bldB_c11', name: 'Classroom C11',
    type: 'indoor', lat: 26.854389, lng: 75.828415, floor: 0, accessible: true, qr: 'QR-B-004',
  },
  {
    id: 'bldB_c12', name: 'Classroom C12',
    type: 'indoor', lat: 26.854389, lng: 75.828440, floor: 0, accessible: true, qr: 'QR-B-005',
  },
  {
    id: 'bldB_c13', name: 'Classroom C13',
    type: 'indoor', lat: 26.854389, lng: 75.828465, floor: 0, accessible: true, qr: 'QR-B-006',
  },
  {
    id: 'bldB_lift', name: 'Lift',
    type: 'lift', lat: 26.854420, lng: 75.828340, floor: 0, accessible: true, qr: 'QR-B-LFT',
  },
  {
    id: 'bldB_stairs', name: 'Block B — Stairs',
    type: 'stairs', lat: 26.854355, lng: 75.828340, floor: 0, accessible: false, qr: 'QR-B-STR',
  },
  // First Floor
  {
    id: 'bldB_c6', name: 'Classroom C6',
    type: 'indoor', lat: 26.854355, lng: 75.828365, floor: 1, accessible: true, qr: 'QR-B-101',
  },
  {
    id: 'bldB_c7', name: 'Classroom C7',
    type: 'indoor', lat: 26.854355, lng: 75.828390, floor: 1, accessible: true, qr: 'QR-B-102',
  },
  {
    id: 'bldB_c8', name: 'Classroom C8',
    type: 'indoor', lat: 26.854355, lng: 75.828415, floor: 1, accessible: true, qr: 'QR-B-103',
  },
  {
    id: 'bldB_c9', name: 'Classroom C9',
    type: 'indoor', lat: 26.854355, lng: 75.828440, floor: 1, accessible: true, qr: 'QR-B-104',
  },
  {
    id: 'bldB_c10', name: 'Classroom C10',
    type: 'indoor', lat: 26.854355, lng: 75.828465, floor: 1, accessible: true, qr: 'QR-B-105',
  },

  // ══════════════════════════════════════════════════════════
  // BUILDING C — Labs wali (26.854263, 75.828184) RIGHT SIDE
  // Ground: Chemistry, Physics, Staff Room 3, Placement, HOD
  // First Floor: Electronics Labs 1-3
  // Basement: Exam Office, CL1-CL3, Faculty Rooms
  // ══════════════════════════════════════════════════════════
  {
    id: 'bldC_gate', name: 'Lab Block — Entrance',
    type: 'outdoor', lat: 26.854263, lng: 75.828120, floor: 0, accessible: true,
  },
  // Ground Floor
  {
    id: 'bldC_chem', name: 'Chemistry Lab',
    type: 'indoor', lat: 26.854300, lng: 75.828184, floor: 0, accessible: true, qr: 'QR-C-001',
  },
  {
    id: 'bldC_physics', name: 'Physics Lab',
    type: 'indoor', lat: 26.854270, lng: 75.828184, floor: 0, accessible: true, qr: 'QR-C-002',
  },
  {
    id: 'bldC_staff3', name: 'Staff Room 3',
    type: 'indoor', lat: 26.854240, lng: 75.828184, floor: 0, accessible: true, qr: 'QR-C-003',
  },
  {
    id: 'bldC_placement', name: 'Placement Office',
    type: 'indoor', lat: 26.854210, lng: 75.828184, floor: 0, accessible: true, qr: 'QR-C-004',
  },
  {
    id: 'bldC_hod', name: 'HOD Cabin',
    type: 'indoor', lat: 26.854180, lng: 75.828184, floor: 0, accessible: true, qr: 'QR-C-005',
  },
  {
    id: 'bldC_stairs', name: 'Lab Block — Stairs',
    type: 'stairs', lat: 26.854263, lng: 75.828155, floor: 0, accessible: false, qr: 'QR-C-STR',
  },
  // First Floor
  {
    id: 'bldC_elab1', name: 'Electronics Lab 1',
    type: 'indoor', lat: 26.854300, lng: 75.828210, floor: 1, accessible: true, qr: 'QR-C-101',
  },
  {
    id: 'bldC_elab2', name: 'Electronics Lab 2',
    type: 'indoor', lat: 26.854263, lng: 75.828210, floor: 1, accessible: true, qr: 'QR-C-102',
  },
  {
    id: 'bldC_elab3', name: 'Electronics Lab 3',
    type: 'indoor', lat: 26.854220, lng: 75.828210, floor: 1, accessible: true, qr: 'QR-C-103',
  },
  // Basement
  {
    id: 'bldC_exam', name: 'Examination Office',
    type: 'indoor', lat: 26.854300, lng: 75.828158, floor: -1, accessible: true, qr: 'QR-C-B01',
  },
  {
    id: 'bldC_cl1', name: 'Computer Lab CL1',
    type: 'indoor', lat: 26.854270, lng: 75.828158, floor: -1, accessible: true, qr: 'QR-C-B02',
  },
  {
    id: 'bldC_cl2', name: 'Computer Lab CL2',
    type: 'indoor', lat: 26.854240, lng: 75.828158, floor: -1, accessible: true, qr: 'QR-C-B03',
  },
  {
    id: 'bldC_cl3', name: 'Computer Lab CL3',
    type: 'indoor', lat: 26.854210, lng: 75.828158, floor: -1, accessible: true, qr: 'QR-C-B04',
  },
  {
    id: 'bldC_faculty', name: 'Faculty Rooms',
    type: 'indoor', lat: 26.854180, lng: 75.828158, floor: -1, accessible: true, qr: 'QR-C-B05',
  },

  // ══════════════════════════════════════════════════════════
  // BUILDING D — Library wali (26.854420, 75.828712)
  // Ground: Library, Admission Block, Electrical Lab, R&D
  // First Floor: Staff Room 4, IQAC Cell
  // ══════════════════════════════════════════════════════════
  {
    id: 'bldD_gate', name: 'Block D — Entrance',
    type: 'outdoor', lat: 26.854420, lng: 75.828650, floor: 0, accessible: true,
  },
  // Ground Floor
  {
    id: 'bldD_library', name: 'Library',
    type: 'indoor', lat: 26.854450, lng: 75.828712, floor: 0, accessible: true, qr: 'QR-D-001',
  },
  {
    id: 'bldD_admblock', name: 'Admission Block',
    type: 'indoor', lat: 26.854420, lng: 75.828712, floor: 0, accessible: true, qr: 'QR-D-002',
  },
  {
    id: 'bldD_eleclab', name: 'Electrical Lab',
    type: 'indoor', lat: 26.854390, lng: 75.828712, floor: 0, accessible: true, qr: 'QR-D-003',
  },
  {
    id: 'bldD_rnd', name: 'R&D Office',
    type: 'indoor', lat: 26.854360, lng: 75.828712, floor: 0, accessible: true, qr: 'QR-D-004',
  },
  {
    id: 'bldD_stairs', name: 'Block D — Stairs',
    type: 'stairs', lat: 26.854420, lng: 75.828680, floor: 0, accessible: false, qr: 'QR-D-STR',
  },
  // First Floor
  {
    id: 'bldD_staff4', name: 'Staff Room 4',
    type: 'indoor', lat: 26.854450, lng: 75.828740, floor: 1, accessible: true, qr: 'QR-D-101',
  },
  {
    id: 'bldD_iqac', name: 'IQAC Cell',
    type: 'indoor', lat: 26.854420, lng: 75.828740, floor: 1, accessible: true, qr: 'QR-D-102',
  },

  // ══════════════════════════════════════════════════════════
  // BUILDING E — Carpentry/Workshop wali (26.853755, 75.828716)
  // Ground: Drawing Hall, Workshop, Carpentry, Canteen
  // ══════════════════════════════════════════════════════════
  {
    id: 'bldE_gate', name: 'Workshop Block — Entrance',
    type: 'outdoor', lat: 26.853755, lng: 75.828650, floor: 0, accessible: true,
  },
  {
    id: 'bldE_drawing', name: 'Drawing Hall / CAD',
    type: 'indoor', lat: 26.853800, lng: 75.828716, floor: 0, accessible: true, qr: 'QR-E-001',
  },
  {
    id: 'bldE_workshop', name: 'Workshop',
    type: 'indoor', lat: 26.853755, lng: 75.828716, floor: 0, accessible: true, qr: 'QR-E-002',
  },
  {
    id: 'bldE_carpentry', name: 'Carpentry Lab',
    type: 'indoor', lat: 26.853710, lng: 75.828716, floor: 0, accessible: true, qr: 'QR-E-003',
  },
  {
    id: 'canteen', name: 'Canteen',
    type: 'outdoor', lat: 26.853755, lng: 75.828780, floor: 0, accessible: true,
  },
]

// ══════════════════════════════════════════════════════════
// EDGES
// ══════════════════════════════════════════════════════════
export const edges = [

  // Outdoor campus paths
  { s: 'main_gate',     d: 'rotating_gate', w: 60,  type: 'outdoor' },
  { s: 'main_gate',     d: 'parking',       w: 40,  type: 'outdoor' },
  { s: 'parking',       d: 'gym',           w: 30,  type: 'outdoor' },
  { s: 'gym',           d: 'ground',        w: 60,  type: 'outdoor' },
  { s: 'ground',        d: 'bldC_gate',     w: 80,  type: 'outdoor' },
  { s: 'ground',        d: 'bldB_gate',     w: 100, type: 'outdoor' },
  { s: 'ground',        d: 'bldA_gate',     w: 150, type: 'outdoor' },
  { s: 'ground',        d: 'bldE_gate',     w: 120, type: 'outdoor' },
  { s: 'bldA_gate',     d: 'bldB_gate',     w: 80,  type: 'outdoor' },
  { s: 'bldB_gate',     d: 'bldC_gate',     w: 70,  type: 'outdoor' },
  { s: 'bldB_gate',     d: 'bldD_gate',     w: 100, type: 'outdoor' },
  { s: 'bldD_gate',     d: 'bldE_gate',     w: 90,  type: 'outdoor' },
  { s: 'bldE_gate',     d: 'canteen',       w: 50,  type: 'outdoor' },
  { s: 'rotating_gate', d: 'bldE_gate',     w: 100, type: 'outdoor' },

  // Block A — Ground Floor
  { s: 'bldA_gate',     d: 'bldA_elibrary',  w: 15, type: 'transition' },
  { s: 'bldA_gate',     d: 'bldA_stairs',    w: 12, type: 'transition' },
  { s: 'bldA_elibrary', d: 'bldA_staff1',    w: 20, type: 'indoor'     },
  { s: 'bldA_staff1',   d: 'bldA_admission', w: 20, type: 'indoor'     },
  { s: 'bldA_admission',d: 'bldA_director',  w: 20, type: 'indoor'     },
  { s: 'bldA_director', d: 'bldA_sitting',   w: 20, type: 'indoor'     },
  { s: 'bldA_sitting',  d: 'bldA_stairs',    w: 25, type: 'indoor'     },
  // Stairs to First Floor
  { s: 'bldA_stairs',   d: 'bldA_c1',        w: 40, type: 'stairs'     },
  { s: 'bldA_c1',       d: 'bldA_c2',        w: 20, type: 'indoor'     },
  { s: 'bldA_c2',       d: 'bldA_c3',        w: 20, type: 'indoor'     },
  { s: 'bldA_c3',       d: 'bldA_c4',        w: 20, type: 'indoor'     },
  { s: 'bldA_c4',       d: 'bldA_c5',        w: 20, type: 'indoor'     },
  { s: 'bldA_c5',       d: 'bldA_bitoffice', w: 20, type: 'indoor'     },

  // Block B — Ground Floor
  { s: 'bldB_gate',     d: 'bldB_seminar',   w: 15, type: 'transition' },
  { s: 'bldB_gate',     d: 'bldB_lift',      w: 10, type: 'transition' },
  { s: 'bldB_gate',     d: 'bldB_stairs',    w: 12, type: 'transition' },
  { s: 'bldB_seminar',  d: 'bldB_notice',    w: 20, type: 'indoor'     },
  { s: 'bldB_notice',   d: 'bldB_accounts',  w: 20, type: 'indoor'     },
  { s: 'bldB_accounts', d: 'bldB_c11',       w: 20, type: 'indoor'     },
  { s: 'bldB_c11',      d: 'bldB_c12',       w: 20, type: 'indoor'     },
  { s: 'bldB_c12',      d: 'bldB_c13',       w: 20, type: 'indoor'     },
  // LIFT — accessible, preferred in accessibility mode
  { s: 'bldB_lift',     d: 'bldB_c6',        w: 20, type: 'lift'       },
  // STAIRS — avoided in accessibility mode
  { s: 'bldB_stairs',   d: 'bldB_c6',        w: 40, type: 'stairs'     },
  { s: 'bldB_c6',       d: 'bldB_c7',        w: 20, type: 'indoor'     },
  { s: 'bldB_c7',       d: 'bldB_c8',        w: 20, type: 'indoor'     },
  { s: 'bldB_c8',       d: 'bldB_c9',        w: 20, type: 'indoor'     },
  { s: 'bldB_c9',       d: 'bldB_c10',       w: 20, type: 'indoor'     },

  // Block C — Ground Floor
  { s: 'bldC_gate',     d: 'bldC_chem',      w: 15, type: 'transition' },
  { s: 'bldC_gate',     d: 'bldC_stairs',    w: 12, type: 'transition' },
  { s: 'bldC_chem',     d: 'bldC_physics',   w: 20, type: 'indoor'     },
  { s: 'bldC_physics',  d: 'bldC_staff3',    w: 20, type: 'indoor'     },
  { s: 'bldC_staff3',   d: 'bldC_placement', w: 20, type: 'indoor'     },
  { s: 'bldC_placement',d: 'bldC_hod',       w: 20, type: 'indoor'     },
  { s: 'bldC_hod',      d: 'bldC_stairs',    w: 25, type: 'indoor'     },
  // Stairs UP to First Floor
  { s: 'bldC_stairs',   d: 'bldC_elab1',     w: 40, type: 'stairs'     },
  { s: 'bldC_elab1',    d: 'bldC_elab2',     w: 20, type: 'indoor'     },
  { s: 'bldC_elab2',    d: 'bldC_elab3',     w: 20, type: 'indoor'     },
  // Stairs DOWN to Basement
  { s: 'bldC_stairs',   d: 'bldC_exam',      w: 40, type: 'stairs'     },
  { s: 'bldC_exam',     d: 'bldC_cl1',       w: 20, type: 'indoor'     },
  { s: 'bldC_cl1',      d: 'bldC_cl2',       w: 20, type: 'indoor'     },
  { s: 'bldC_cl2',      d: 'bldC_cl3',       w: 20, type: 'indoor'     },
  { s: 'bldC_cl3',      d: 'bldC_faculty',   w: 20, type: 'indoor'     },

  // Block D — Ground Floor
  { s: 'bldD_gate',     d: 'bldD_library',   w: 15, type: 'transition' },
  { s: 'bldD_gate',     d: 'bldD_stairs',    w: 12, type: 'transition' },
  { s: 'bldD_library',  d: 'bldD_admblock',  w: 20, type: 'indoor'     },
  { s: 'bldD_admblock', d: 'bldD_eleclab',   w: 20, type: 'indoor'     },
  { s: 'bldD_eleclab',  d: 'bldD_rnd',       w: 20, type: 'indoor'     },
  { s: 'bldD_rnd',      d: 'bldD_stairs',    w: 25, type: 'indoor'     },
  { s: 'bldD_stairs',   d: 'bldD_staff4',    w: 40, type: 'stairs'     },
  { s: 'bldD_staff4',   d: 'bldD_iqac',      w: 20, type: 'indoor'     },

  // Block E — Workshop/Canteen
  { s: 'bldE_gate',     d: 'bldE_drawing',   w: 15, type: 'transition' },
  { s: 'bldE_drawing',  d: 'bldE_workshop',  w: 25, type: 'indoor'     },
  { s: 'bldE_workshop', d: 'bldE_carpentry', w: 25, type: 'indoor'     },
  { s: 'bldE_carpentry',d: 'canteen',        w: 30, type: 'indoor'     },
]