import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { setStickerMaterial } from './texture.js'

let scene, camera, renderer, controls

export function getRenderer() { return renderer }
export function getScene() { return scene }

export function initScene(container) {
  scene = new THREE.Scene()
  scene.fog = new THREE.FogExp2(0xE0F6FF, 0.015)

  camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100)
  camera.position.set(4, 2, 8)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.1
  container.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.dampingFactor = 0.08
  controls.target.set(0, 3, 0)

  // ── Lighting ──────────────────────────────────────────────
  scene.add(new THREE.AmbientLight(0xffffff, 0.45))

  const dl = new THREE.DirectionalLight(0xfffaf0, 1.2)
  dl.position.set(4, 10, 6)
  dl.castShadow = true
  dl.shadow.mapSize.set(2048, 2048)
  dl.shadow.camera.near = 0.5
  dl.shadow.camera.far = 50
  dl.shadow.camera.left = -8; dl.shadow.camera.right = 8
  dl.shadow.camera.top = 16; dl.shadow.camera.bottom = -4
  dl.shadow.bias = -0.001
  scene.add(dl)

  const fill = new THREE.DirectionalLight(0xe8f0ff, 0.45)
  fill.position.set(-5, 4, 5)
  scene.add(fill)

  const rim = new THREE.DirectionalLight(0xadd8e6, 0.3)
  rim.position.set(0, 6, -6)
  scene.add(rim)

  const camFill = new THREE.PointLight(0xffffff, 0.25, 30)
  camera.add(camFill)
  scene.add(camera)

  // ── Materials ────────────────────────────────────────────
  const matMetal = new THREE.MeshStandardMaterial({ color: 0x8a9299, metalness: 0.45, roughness: 0.55 })
  const matDark  = new THREE.MeshStandardMaterial({ color: 0x4a5158, metalness: 0.5,  roughness: 0.5  })
  const matChrome = new THREE.MeshStandardMaterial({ color: 0xcccccc, metalness: 0.85, roughness: 0.2  })
  const matGround = new THREE.MeshStandardMaterial({ color: 0x9aaa88, roughness: 0.9 })

  function mesh(geo, mat, cast = false, recv = false) {
    const m = new THREE.Mesh(geo, mat)
    if (cast) m.castShadow = true
    if (recv) m.receiveShadow = true
    return m
  }

  // ── Ground ───────────────────────────────────────────────
  const ground = mesh(new THREE.CircleGeometry(10, 48), matGround, false, true)
  ground.rotation.x = -Math.PI / 2
  ground.position.y = -6
  scene.add(ground)

  // ── Pole ─────────────────────────────────────────────────
  const pole = mesh(new THREE.CylinderGeometry(0.18, 0.22, 12, 20), matMetal, true, true)
  pole.position.set(0, 0, 0)
  scene.add(pole)

  // Pole top cap
  const poleTop = mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.08, 20), matDark, false, false)
  poleTop.position.set(0, 6.04, 0)
  scene.add(poleTop)

  // ── Horn Speakers (2 units, 150° apart) ──────────────────
  // Speaker mount ring (collar on top of pole)
  const speakerRing = mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.32, 20), matDark, true, false)
  speakerRing.position.set(0, 5.6, 0)
  scene.add(speakerRing)

  // Helper: build one complete horn speaker group and add to scene
  function buildHornSpeaker(angleRad) {
    const spkGroup = new THREE.Group()
    spkGroup.position.set(0, 5.6, 0)

    // Mounting arm: short horizontal rod from pole to speaker body
    const arm = mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.72, 10), matMetal, true, false)
    arm.rotation.z = Math.PI / 2   // lay horizontal
    arm.position.set(0.36, 0.12, 0)
    spkGroup.add(arm)

    // Speaker body (back cylinder — heavier end)
    const body = mesh(new THREE.CylinderGeometry(0.18, 0.22, 0.52, 16), matMetal, true, false)
    body.rotation.z = Math.PI / 2  // point outward on X axis
    body.position.set(0.78, 0.12, 0)
    spkGroup.add(body)

    // Horn (truncated cone flaring forward, wider end outward)
    const horn = mesh(new THREE.CylinderGeometry(0.42, 0.20, 0.52, 20, 1, true), matMetal, true, false)
    horn.rotation.z = -Math.PI / 2  // wider end faces outward
    horn.position.set(1.18, 0.12, 0)
    spkGroup.add(horn)

    // Horn mouth ring (thin disc to finish the flare edge)
    const mouth = mesh(new THREE.TorusGeometry(0.42, 0.025, 8, 24), matDark, false, false)
    mouth.rotation.y = Math.PI / 2
    mouth.position.set(1.44, 0.12, 0)
    spkGroup.add(mouth)

    // Horn back cap (small disc closing the narrow end)
    const backCap = mesh(new THREE.CircleGeometry(0.20, 16), matDark, false, false)
    backCap.rotation.y = Math.PI / 2
    backCap.position.set(0.52, 0.12, 0)
    spkGroup.add(backCap)

    // Rotate whole speaker group around Y to the desired angle
    spkGroup.rotation.y = angleRad

    scene.add(spkGroup)
  }

  // Place 2 speakers 150° apart: one mostly forward-right, one forward-left
  const baseAngle = -Math.PI * 0.1   // slight offset so neither points straight back
  buildHornSpeaker(baseAngle)
  buildHornSpeaker(baseAngle + THREE.MathUtils.degToRad(150))

  // ── Pole-to-cabinet bracket (horizontal arm) ─────────────
  const bracket = mesh(new THREE.BoxGeometry(0.36, 0.28, 1.1), matDark, true, false)
  bracket.position.set(0, 4.4, 0.55)
  scene.add(bracket)

  // ── Cabinet group (parented so sticker inherits transforms) ─
  const cabGroup = new THREE.Group()
  cabGroup.position.set(0, 4.4, 1.1)
  scene.add(cabGroup)

  // Cabinet body
  const cabW = 2.6, cabH = 3.6, cabD = 1.1
  const cabBody = mesh(new THREE.BoxGeometry(cabW, cabH, cabD), matMetal, true, true)
  cabBody.position.set(0, 0, 0)
  cabGroup.add(cabBody)

  // Door frame (thin raised border on front face)
  const frameW = cabW - 0.1, frameH = cabH - 0.1
  const frameMat = matDark.clone()
  ;[
    [frameW, 0.07, 0.06,  0,           cabH / 2 - 0.035,  cabD / 2 + 0.001], // top bar
    [frameW, 0.07, 0.06,  0,          -cabH / 2 + 0.035,  cabD / 2 + 0.001], // bottom bar
    [0.07, frameH, 0.06, -cabW / 2 + 0.035, 0,            cabD / 2 + 0.001], // left bar
    [0.07, frameH, 0.06,  cabW / 2 - 0.035, 0,            cabD / 2 + 0.001], // right bar
  ].forEach(([w, h, d, x, y, z]) => {
    const f = mesh(new THREE.BoxGeometry(w, h, d), frameMat, false, false)
    f.position.set(x, y, z)
    cabGroup.add(f)
  })

  // ── Sticker plane ────────────────────────────────────────
  const stickerMat = new THREE.MeshStandardMaterial({
    transparent: true, alphaTest: 0.08, side: THREE.FrontSide, roughness: 0.85
  })
  setStickerMaterial(stickerMat)
  const sticker = mesh(new THREE.PlaneGeometry(2.2, 3.1), stickerMat, false, false)
  sticker.position.set(0, 0, cabD / 2 + 0.008)
  cabGroup.add(sticker)

  // ── Hinges (left side, 3 hinges) ─────────────────────────
  const hingePositions = [-1.1, 0, 1.1]
  hingePositions.forEach(yOff => {
    const hinge = mesh(new THREE.BoxGeometry(0.12, 0.26, 0.1), matChrome, true, false)
    hinge.position.set(-cabW / 2 - 0.05, yOff, cabD / 2 + 0.02)
    cabGroup.add(hinge)
  })

  // ── Door handle (right side, vertical bar) ───────────────
  // Handle backing plate
  const handleBase = mesh(new THREE.BoxGeometry(0.18, 0.72, 0.06), matDark, false, false)
  handleBase.position.set(cabW / 2 - 0.22, 0, cabD / 2 + 0.03)
  cabGroup.add(handleBase)

  // Handle bar (chrome rod)
  const handleBar = mesh(new THREE.CylinderGeometry(0.045, 0.045, 0.6, 12), matChrome, true, false)
  handleBar.position.set(cabW / 2 - 0.22, 0, cabD / 2 + 0.1)
  cabGroup.add(handleBar)

  // Handle end caps
  ;[-0.28, 0.28].forEach(yOff => {
    const cap = mesh(new THREE.SphereGeometry(0.055, 10, 10), matChrome, false, false)
    cap.position.set(cabW / 2 - 0.22, yOff, cabD / 2 + 0.1)
    cabGroup.add(cap)
  })

  // Lock cylinder (below handle, center)
  const lock = mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.08, 12), matChrome, false, false)
  lock.rotation.x = Math.PI / 2
  lock.position.set(cabW / 2 - 0.22, -0.5, cabD / 2 + 0.065)
  cabGroup.add(lock)

  // ── Roof (overhang, slightly wider & deeper than cabinet) ─
  const roofW = cabW + 0.3, roofD = cabD + 0.35
  const roofThick = 0.1

  // Main roof slab
  const roof = mesh(new THREE.BoxGeometry(roofW, roofThick, roofD), matDark, true, true)
  roof.position.set(0, cabH / 2 + roofThick / 2, (roofD - cabD) / 2)
  cabGroup.add(roof)

  // Roof front drip edge (thin lip at the front edge)
  const drip = mesh(new THREE.BoxGeometry(roofW, 0.18, 0.04), matDark, false, false)
  drip.position.set(0, cabH / 2 - 0.04, (roofD - cabD) / 2 + roofD / 2 - 0.02)
  cabGroup.add(drip)

  // Roof side lips
  ;[-1, 1].forEach(side => {
    const lip = mesh(new THREE.BoxGeometry(0.04, 0.18, roofD), matDark, false, false)
    lip.position.set(side * (roofW / 2 - 0.02), cabH / 2 - 0.04, (roofD - cabD) / 2)
    cabGroup.add(lip)
  })

  animate()

  window.addEventListener('resize', () => {
    if (!camera || !renderer) return
    camera.aspect = container.clientWidth / container.clientHeight
    camera.updateProjectionMatrix()
    renderer.setSize(container.clientWidth, container.clientHeight)
  })
}

function animate() {
  requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}
