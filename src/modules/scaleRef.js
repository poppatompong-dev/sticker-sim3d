import * as THREE from 'three'

export const GROUND_Y = -6
export const REAL_POLE_M = 7
export const THREE_POLE = 12
export const SCALE = THREE_POLE / REAL_POLE_M

export function m2y(meters) { return GROUND_Y + meters * SCALE }
export function y2m(y) { return (y - GROUND_Y) / SCALE }

let humanGroup = null
let rulerGroup = null
let groundRefMesh = null
let refRoot = null

function makeLabel(text, fontSize = 22) {
  const cv = document.createElement('canvas')
  cv.width = 140
  cv.height = 44
  const c = cv.getContext('2d')
  c.fillStyle = 'rgba(255,255,255,0.92)'
  c.beginPath()
  c.roundRect(0, 0, cv.width, cv.height, 8)
  c.fill()
  c.strokeStyle = '#6b7280'
  c.lineWidth = 1.5
  c.stroke()
  c.fillStyle = '#111827'
  c.font = `bold ${fontSize}px "Sarabun", Arial, sans-serif`
  c.textAlign = 'center'
  c.textBaseline = 'middle'
  c.fillText(text, cv.width / 2, cv.height / 2)

  const tex = new THREE.CanvasTexture(cv)
  const mat = new THREE.SpriteMaterial({ map: tex, depthTest: false, transparent: true })
  const sprite = new THREE.Sprite(mat)
  sprite.scale.set(0.9, 0.28, 1)
  return sprite
}

function buildHumanFigure() {
  const g = new THREE.Group()
  const skinMat = new THREE.MeshStandardMaterial({ color: 0xfde68a, roughness: 0.8 })
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x3b82f6, roughness: 0.7 })

  const humanHeightM = 1.7
  const humanH = humanHeightM * SCALE
  const headR = humanH * 0.13
  const bodyH = humanH * 0.52
  const legH = humanH * 0.28
  const armH = humanH * 0.36
  const bodyW = humanH * 0.22
  const limbW = humanH * 0.07

  const mesh = (geo, mat) => new THREE.Mesh(geo, mat)

  const headY = GROUND_Y + humanH - headR
  const shoulderY = GROUND_Y + legH + bodyH
  const bodyY = GROUND_Y + legH + bodyH / 2

  const head = mesh(new THREE.SphereGeometry(headR, 12, 12), skinMat)
  head.position.set(0, headY, 0)
  g.add(head)

  const body = mesh(new THREE.CapsuleGeometry(bodyW / 2, bodyH - bodyW, 6, 8), bodyMat)
  body.position.set(0, bodyY, 0)
  g.add(body)

    ;[-1, 1].forEach(side => {
      const leg = mesh(new THREE.CapsuleGeometry(limbW, legH - limbW * 2, 6, 6), bodyMat)
      leg.position.set(side * bodyW * 0.3, GROUND_Y + legH / 2, 0)
      g.add(leg)

      const arm = mesh(new THREE.CapsuleGeometry(limbW * 0.85, armH - limbW * 1.7, 6, 6), bodyMat)
      arm.rotation.z = side * 0.25
      arm.position.set(side * (bodyW * 0.5 + limbW), shoulderY - armH * 0.5, 0)
      g.add(arm)
    })

  return g
}

function buildRuler() {
  const g = new THREE.Group()
  const rulerX = 3.0
  const rulerZ = 0

  const lineMat = new THREE.LineBasicMaterial({ color: 0x374151, linewidth: 2 })
  const pts = [
    new THREE.Vector3(rulerX, GROUND_Y, rulerZ),
    new THREE.Vector3(rulerX, m2y(7.5), rulerZ),
  ]
  const lineGeo = new THREE.BufferGeometry().setFromPoints(pts)
  g.add(new THREE.Line(lineGeo, lineMat))

  const tickLabels = [
    { m: 0, label: '0 m' },
    { m: 1, label: '1 m' },
    { m: 1.7, label: '1.7 m (คน)' },
    { m: 3.5, label: '3.5 m' },
    { m: 5, label: '5 m' },
    { m: 7, label: '7 m (เสา)' },
  ]

  const tickMat = new THREE.LineBasicMaterial({ color: 0x374151 })

  tickLabels.forEach(({ m, label }) => {
    const y = m2y(m)

    const tickPts = [
      new THREE.Vector3(rulerX - 0.15, y, rulerZ),
      new THREE.Vector3(rulerX + 0.15, y, rulerZ),
    ]
    const tickGeo = new THREE.BufferGeometry().setFromPoints(tickPts)
    g.add(new THREE.Line(tickGeo, tickMat))

    const sprite = makeLabel(label)
    sprite.position.set(rulerX + 0.7, y, rulerZ)
    g.add(sprite)
  })

  return g
}

function buildGroundRef() {
  const geo = new THREE.RingGeometry(0.5, 8, 48)
  const mat = new THREE.MeshStandardMaterial({
    color: 0x9ca3af,
    transparent: true,
    opacity: 0.25,
    side: THREE.DoubleSide,
    roughness: 1,
    depthWrite: false,
  })
  const m = new THREE.Mesh(geo, mat)
  m.rotation.x = -Math.PI / 2
  m.position.y = GROUND_Y + 0.01
  return m
}

export function addReferenceObjects(scene) {
  refRoot = new THREE.Group()
  refRoot.name = 'scaleRefRoot'

  humanGroup = buildHumanFigure()
  humanGroup.name = 'humanRef'
  humanGroup.position.set(-2.5, 0, 0)
  refRoot.add(humanGroup)

  rulerGroup = buildRuler()
  rulerGroup.name = 'rulerRef'
  refRoot.add(rulerGroup)

  groundRefMesh = buildGroundRef()
  groundRefMesh.name = 'groundRef'
  refRoot.add(groundRefMesh)

  refRoot.visible = false
  scene.add(refRoot)
}

export function setRefsVisible(visible) {
  if (refRoot) refRoot.visible = visible
}

export function setHumanVisible(v) {
  if (humanGroup) humanGroup.visible = v
}

export function setGroundVisible(v) {
  if (groundRefMesh) groundRefMesh.visible = v
}
