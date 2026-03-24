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
  controls.target.set(0, 2, 0)

  // Soft ambient base
  scene.add(new THREE.AmbientLight(0xffffff, 0.5))

  // Key light — top-right front
  const dl = new THREE.DirectionalLight(0xfffaf0, 1.2)
  dl.position.set(4, 8, 6)
  dl.castShadow = true
  dl.shadow.mapSize.set(2048, 2048)
  dl.shadow.camera.near = 0.5
  dl.shadow.camera.far = 40
  dl.shadow.bias = -0.001
  scene.add(dl)

  // Fill light — left front, softer, warm
  const fill = new THREE.DirectionalLight(0xe8f0ff, 0.5)
  fill.position.set(-4, 3, 5)
  scene.add(fill)

  // Rim light — behind cabinet, cool blue-white
  const rim = new THREE.DirectionalLight(0xadd8e6, 0.4)
  rim.position.set(0, 5, -6)
  scene.add(rim)

  // Camera-attached fill so front face is never pitch-dark when user rotates
  const camFill = new THREE.PointLight(0xffffff, 0.3, 30)
  camera.add(camFill)
  scene.add(camera)

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.4, 0.5, 12, 16),
    new THREE.MeshStandardMaterial({ color: 0xcccccc })
  )
  pole.position.y = 0; pole.receiveShadow = true; scene.add(pole)

  const cab = new THREE.Mesh(
    new THREE.BoxGeometry(2.5, 3.5, 1.2),
    new THREE.MeshStandardMaterial({ color: 0xa0a5a9, metalness: 0.2 })
  )
  cab.position.set(0, 2.5, 0.9); cab.castShadow = true; scene.add(cab)

  const mat = new THREE.MeshStandardMaterial({
    transparent: true, alphaTest: 0.1, side: THREE.DoubleSide, roughness: 0.9
  })
  setStickerMaterial(mat)

  const stp = new THREE.Mesh(new THREE.PlaneGeometry(2.0, 2.8), mat)
  stp.position.set(0, 0, 0.61); cab.add(stp)

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
