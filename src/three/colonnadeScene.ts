import * as THREE from 'three'

/**
 * The home-page scene: a marble colonnade receding into warm fog with a
 * gilded sun at the far end. Scrolling dollies the camera down the hall;
 * the mouse parallaxes the view. Everything is procedural — no assets.
 */

const PAPER = 0xf4efe6
const MARBLE = 0xece6da
const STONE_FLOOR = 0xe3dac7
const GOLD = 0xc89b4a
const SUN = 0xe9b44c

const HALL_HALF_WIDTH = 7
const COLUMN_SPACING = 9
const COLUMN_PAIRS = 16
const HALL_END = -(COLUMN_PAIRS - 1) * COLUMN_SPACING - 8

const CAMERA_START_Z = 14
const CAMERA_END_Z = HALL_END - 4
const CAMERA_HEIGHT = 3.4

/** Fluted, tapered Doric-ish column. Built once, cloned for the colonnade. */
function buildColumnGeometry(): THREE.BufferGeometry {
  const flutes = 20
  const fluteDepth = 0.045
  const rBottom = 0.85
  const rTop = 0.66
  const height = 7

  const shaft = new THREE.CylinderGeometry(rTop, rBottom, height, 128, 1, false)
  const pos = shaft.attributes.position
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i)
    const radial = Math.hypot(v.x, v.z)
    if (radial < 0.01) continue // cap centres
    const theta = Math.atan2(v.z, v.x)
    // concave flutes: carve toward the axis at each flute trough
    const carve = fluteDepth * (1 - Math.pow(Math.abs(Math.cos((flutes * theta) / 2)), 0.55))
    const scale = (radial - carve) / radial
    pos.setX(i, v.x * scale)
    pos.setZ(i, v.z * scale)
  }
  shaft.computeVertexNormals()
  shaft.translate(0, height / 2, 0)
  return shaft
}

function buildColumn(material: THREE.Material): THREE.Group {
  const group = new THREE.Group()

  const shaft = new THREE.Mesh(buildColumnGeometry(), material)
  shaft.position.y = 0.25
  group.add(shaft)

  const plinth = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.5, 2.1), material)
  plinth.position.y = 0.25
  group.add(plinth)

  // echinus: the cushion-like flare under the abacus
  const echinus = new THREE.Mesh(new THREE.CylinderGeometry(1.0, 0.68, 0.42, 48), material)
  echinus.position.y = 7.45
  group.add(echinus)

  const abacus = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.34, 2.2), material)
  abacus.position.y = 7.85
  group.add(abacus)

  return group
}

/** Soft radial glow texture for the sun and the dust motes. */
function makeGlowTexture(inner: string, outer: string): THREE.CanvasTexture {
  const size = 256
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const ctx = canvas.getContext('2d')!
  const g = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  g.addColorStop(0, inner)
  g.addColorStop(0.4, outer)
  g.addColorStop(1, 'rgba(0,0,0,0)')
  ctx.fillStyle = g
  ctx.fillRect(0, 0, size, size)
  const tex = new THREE.CanvasTexture(canvas)
  tex.colorSpace = THREE.SRGBColorSpace
  return tex
}

export class ColonnadeScene {
  private renderer: THREE.WebGLRenderer
  private scene = new THREE.Scene()
  private camera: THREE.PerspectiveCamera
  private clock = new THREE.Clock()
  private rafId = 0
  private disposed = false

  /** scroll progress 0..1 across the whole home page */
  private targetProgress = 0
  private progress = 0

  /** normalized mouse, -1..1 */
  private mouse = new THREE.Vector2(0, 0)
  private smoothedMouse = new THREE.Vector2(0, 0)

  private rings: THREE.Mesh[] = []
  private particles!: THREE.Points
  private particleSeeds!: Float32Array
  private sunGroup!: THREE.Group

  private onPointerMove = (e: PointerEvent) => {
    this.mouse.x = (e.clientX / window.innerWidth) * 2 - 1
    this.mouse.y = (e.clientY / window.innerHeight) * 2 - 1
  }

  private onResize = () => {
    const { innerWidth: w, innerHeight: h } = window
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h)
  }

  constructor(canvas: HTMLCanvasElement, ringCount: number) {
    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(window.innerWidth, window.innerHeight)
    this.renderer.setClearColor(PAPER)

    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 400)
    this.camera.position.set(0, CAMERA_HEIGHT, CAMERA_START_Z)

    this.scene.fog = new THREE.Fog(PAPER, 16, 95)

    this.buildLights()
    this.buildGround()
    this.buildColonnade()
    this.buildSun()
    this.buildRings(ringCount)
    this.buildParticles()

    window.addEventListener('pointermove', this.onPointerMove)
    window.addEventListener('resize', this.onResize)

    this.renderer.setAnimationLoop(() => this.tick())
  }

  setProgress(p: number) {
    this.targetProgress = THREE.MathUtils.clamp(p, 0, 1)
  }

  private buildLights() {
    const hemi = new THREE.HemisphereLight(0xfff6e2, 0xd9c9a6, 1.1)
    this.scene.add(hemi)

    const sun = new THREE.DirectionalLight(0xffd9a0, 1.6)
    sun.position.set(4, 18, HALL_END - 30)
    this.scene.add(sun)

    const fill = new THREE.DirectionalLight(0xfff2dd, 0.5)
    fill.position.set(-6, 10, 20)
    this.scene.add(fill)
  }

  private buildGround() {
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(500, 500),
      new THREE.MeshStandardMaterial({ color: STONE_FLOOR, roughness: 1 }),
    )
    floor.rotation.x = -Math.PI / 2
    this.scene.add(floor)

    // stylobate: the stepped platform the columns stand on
    const stepMat = new THREE.MeshStandardMaterial({ color: MARBLE, roughness: 0.95 })
    for (const side of [-1, 1]) {
      const step = new THREE.Mesh(
        new THREE.BoxGeometry(4, 0.5, Math.abs(HALL_END) + 40),
        stepMat,
      )
      step.position.set(side * HALL_HALF_WIDTH, 0.25, HALL_END / 2 + 8)
      this.scene.add(step)
    }
  }

  private buildColonnade() {
    const marble = new THREE.MeshStandardMaterial({ color: MARBLE, roughness: 0.92 })
    const prototype = buildColumn(marble)

    for (let i = 0; i < COLUMN_PAIRS; i++) {
      const z = -8 - i * COLUMN_SPACING
      for (const side of [-1, 1]) {
        const col = prototype.clone()
        col.position.set(side * HALL_HALF_WIDTH, 0.5, z)
        // tiny irregularities so the hall doesn't feel stamped
        col.rotation.y = Math.random() * Math.PI
        const s = 1 + (Math.random() - 0.5) * 0.02
        col.scale.setScalar(s)
        this.scene.add(col)
      }
    }

    // architrave beams running along each row, completing the stoa
    for (const side of [-1, 1]) {
      const beam = new THREE.Mesh(
        new THREE.BoxGeometry(2.4, 1.1, Math.abs(HALL_END) + 30),
        marble,
      )
      beam.position.set(side * HALL_HALF_WIDTH, 8.6, HALL_END / 2 + 4)
      this.scene.add(beam)
    }
  }

  private buildSun() {
    this.sunGroup = new THREE.Group()

    const disc = new THREE.Mesh(
      new THREE.CircleGeometry(7, 64),
      new THREE.MeshBasicMaterial({ color: SUN, fog: false }),
    )
    this.sunGroup.add(disc)

    const glow = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: makeGlowTexture('rgba(244,214,138,0.95)', 'rgba(233,180,76,0.32)'),
        transparent: true,
        depthWrite: false,
        fog: false,
      }),
    )
    glow.scale.setScalar(46)
    this.sunGroup.add(glow)

    this.sunGroup.position.set(0, 7.5, HALL_END - 36)
    this.scene.add(this.sunGroup)
  }

  /** One gilded halo ring per project, hovering down the hall. */
  private buildRings(count: number) {
    // low metalness on purpose: with no envmap, high metalness reads as mud
    const goldMat = new THREE.MeshStandardMaterial({
      color: GOLD,
      metalness: 0.35,
      roughness: 0.4,
      emissive: 0xb8860b,
      emissiveIntensity: 0.55,
    })
    const span = CAMERA_START_Z - 18 - (CAMERA_END_Z + 10)
    for (let i = 0; i < count; i++) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(2.4, 0.055, 24, 120), goldMat)
      const t = count === 1 ? 0.5 : i / (count - 1)
      ring.position.set(0, 4.6, CAMERA_START_Z - 18 - t * span)
      ring.userData.phase = i * 1.7
      this.scene.add(ring)
      this.rings.push(ring)
    }
  }

  private buildParticles() {
    const count = 700
    const positions = new Float32Array(count * 3)
    this.particleSeeds = new Float32Array(count)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 16
      positions[i * 3 + 1] = Math.random() * 9 + 0.3
      positions[i * 3 + 2] = CAMERA_START_Z + 4 - Math.random() * (CAMERA_START_Z + 8 - HALL_END)
      this.particleSeeds[i] = Math.random() * Math.PI * 2
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
    const mat = new THREE.PointsMaterial({
      size: 0.16,
      map: makeGlowTexture('rgba(212,175,90,1)', 'rgba(212,175,90,0.35)'),
      color: 0xd4af5a,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      sizeAttenuation: true,
    })
    this.particles = new THREE.Points(geo, mat)
    this.scene.add(this.particles)
  }

  private tick() {
    if (this.disposed) return
    const t = this.clock.getElapsedTime()

    // smooth scroll + mouse
    this.progress += (this.targetProgress - this.progress) * 0.06
    this.smoothedMouse.lerp(this.mouse, 0.05)

    // camera travels the hall, breathing slightly
    const z = THREE.MathUtils.lerp(CAMERA_START_Z, CAMERA_END_Z, this.progress)
    this.camera.position.set(
      this.smoothedMouse.x * 1.5 + Math.sin(t * 0.4) * 0.18,
      CAMERA_HEIGHT - this.smoothedMouse.y * 0.7 + Math.sin(t * 0.7) * 0.08,
      z,
    )
    this.camera.lookAt(
      this.smoothedMouse.x * 4,
      CAMERA_HEIGHT + 1.1 - this.smoothedMouse.y * 1.6,
      z - 26,
    )

    // halo rings: slow precession, gentle bob
    for (const ring of this.rings) {
      const phase = ring.userData.phase as number
      ring.rotation.y = t * 0.25 + phase
      ring.rotation.x = Math.sin(t * 0.3 + phase) * 0.25
      ring.position.y = 4.6 + Math.sin(t * 0.6 + phase) * 0.25
    }

    // dust motes drift upward and sway
    const pos = this.particles.geometry.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < pos.count; i++) {
      const seed = this.particleSeeds[i]
      let y = pos.getY(i) + 0.0035
      if (y > 9.5) y = 0.3
      pos.setY(i, y)
      pos.setX(i, pos.getX(i) + Math.sin(t * 0.5 + seed) * 0.002)
    }
    pos.needsUpdate = true

    // sun pulse
    const glow = this.sunGroup.children[1] as THREE.Sprite
    glow.scale.setScalar(46 + Math.sin(t * 0.8) * 2.5)

    this.renderer.render(this.scene, this.camera)
  }

  dispose() {
    this.disposed = true
    this.renderer.setAnimationLoop(null)
    cancelAnimationFrame(this.rafId)
    window.removeEventListener('pointermove', this.onPointerMove)
    window.removeEventListener('resize', this.onResize)
    this.scene.traverse((obj) => {
      if (obj instanceof THREE.Mesh || obj instanceof THREE.Points) {
        obj.geometry.dispose()
        const mats = Array.isArray(obj.material) ? obj.material : [obj.material]
        mats.forEach((m) => m.dispose())
      }
    })
    this.renderer.dispose()
  }
}
