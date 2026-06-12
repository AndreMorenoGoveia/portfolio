/**
 * Paper-page background: gold ink particles drifting along a slowly evolving
 * flow field, bending away from the cursor. Pure 2D canvas — cheap enough to
 * run behind a wall of text without anyone noticing the cost.
 */

interface Mote {
  x: number
  y: number
  px: number
  py: number
  life: number
}

const PALETTES: Record<string, string> = {
  clay: '184, 110, 80',
  gold: '184, 146, 62',
  azure: '78, 106, 148',
  verdigris: '107, 143, 113',
}

export class InkField {
  private ctx: CanvasRenderingContext2D
  private motes: Mote[] = []
  private rafId = 0
  private mouse = { x: -9999, y: -9999 }
  private w = 0
  private h = 0
  private t = 0
  private rgb: string
  private running = true

  private onPointerMove = (e: PointerEvent) => {
    this.mouse.x = e.clientX
    this.mouse.y = e.clientY
  }

  private onResize = () => this.fit()

  private canvas: HTMLCanvasElement

  constructor(canvas: HTMLCanvasElement, accent: string = 'gold') {
    this.canvas = canvas
    this.ctx = canvas.getContext('2d', { alpha: true })!
    this.rgb = PALETTES[accent] ?? PALETTES.gold
    this.fit()

    const count = Math.min(160, Math.floor((this.w * this.h) / 14000))
    for (let i = 0; i < count; i++) this.motes.push(this.spawn())

    window.addEventListener('pointermove', this.onPointerMove)
    window.addEventListener('resize', this.onResize)
    this.loop()
  }

  private fit() {
    const dpr = Math.min(window.devicePixelRatio, 2)
    this.w = window.innerWidth
    this.h = window.innerHeight
    this.canvas.width = this.w * dpr
    this.canvas.height = this.h * dpr
    this.canvas.style.width = `${this.w}px`
    this.canvas.style.height = `${this.h}px`
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
  }

  private spawn(): Mote {
    const x = Math.random() * this.w
    const y = Math.random() * this.h
    return { x, y, px: x, py: y, life: 80 + Math.random() * 220 }
  }

  /** cheap layered-sine pseudo-noise; returns a flow angle */
  private field(x: number, y: number): number {
    const s = 0.0016
    return (
      Math.sin(x * s + this.t * 0.12) +
      Math.cos(y * s * 1.3 - this.t * 0.09) +
      Math.sin((x + y) * s * 0.6 + this.t * 0.05)
    ) * 1.05
  }

  private loop = () => {
    if (!this.running) return
    this.rafId = requestAnimationFrame(this.loop)
    this.t += 0.016

    const { ctx } = this
    // fade previous frame out instead of clearing — leaves silky trails
    ctx.globalCompositeOperation = 'destination-out'
    ctx.fillStyle = 'rgba(0,0,0,0.035)'
    ctx.fillRect(0, 0, this.w, this.h)
    ctx.globalCompositeOperation = 'source-over'

    ctx.lineWidth = 1
    for (const m of this.motes) {
      const angle = this.field(m.x, m.y)
      let vx = Math.cos(angle) * 0.9
      let vy = Math.sin(angle) * 0.9

      // the cursor is a gentle repulsor: ink parts around it like water
      const dx = m.x - this.mouse.x
      const dy = m.y - this.mouse.y
      const d2 = dx * dx + dy * dy
      if (d2 < 32000) {
        const d = Math.sqrt(d2) || 1
        const push = (1 - d / 180) * 2.4
        vx += (dx / d) * push
        vy += (dy / d) * push
      }

      m.px = m.x
      m.py = m.y
      m.x += vx
      m.y += vy
      m.life -= 1

      const fade = Math.min(1, m.life / 60)
      ctx.strokeStyle = `rgba(${this.rgb}, ${0.16 * fade})`
      ctx.beginPath()
      ctx.moveTo(m.px, m.py)
      ctx.lineTo(m.x, m.y)
      ctx.stroke()

      if (m.life <= 0 || m.x < -20 || m.x > this.w + 20 || m.y < -20 || m.y > this.h + 20) {
        Object.assign(m, this.spawn())
      }
    }
  }

  dispose() {
    this.running = false
    cancelAnimationFrame(this.rafId)
    window.removeEventListener('pointermove', this.onPointerMove)
    window.removeEventListener('resize', this.onResize)
  }
}
