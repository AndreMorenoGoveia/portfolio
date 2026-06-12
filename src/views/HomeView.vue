<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ColonnadeScene } from '../three/colonnadeScene'
import { projects } from '../data/projects'
import { site } from '../data/site'
import ProjectPlate from '../components/ProjectPlate.vue'

gsap.registerPlugin(ScrollTrigger)

const canvasEl = ref<HTMLCanvasElement | null>(null)
const pageEl = ref<HTMLElement | null>(null)

let scene: ColonnadeScene | null = null
let ctx: gsap.Context | null = null

function onScroll() {
  const max = document.documentElement.scrollHeight - window.innerHeight
  scene?.setProgress(max > 0 ? window.scrollY / max : 0)
}

onMounted(() => {
  if (canvasEl.value) {
    try {
      scene = new ColonnadeScene(canvasEl.value, projects.length)
    } catch {
      // No WebGL — the paper background carries the page on its own.
      canvasEl.value.style.display = 'none'
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true })
  onScroll()

  ctx = gsap.context(() => {
    // hero rises out of the fog on load
    gsap.from('.hero > *', {
      opacity: 0,
      y: 46,
      duration: 1.4,
      stagger: 0.14,
      ease: 'power3.out',
      delay: 0.2,
    })

    // everything below reveals as it enters the viewport
    gsap.utils.toArray<HTMLElement>('.reveal').forEach((el) => {
      gsap.from(el, {
        opacity: 0,
        y: 70,
        duration: 1.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: el, start: 'top 84%' },
      })
    })
  }, pageEl.value ?? undefined)
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
  ctx?.revert()
  scene?.dispose()
  scene = null
})
</script>

<template>
  <div ref="pageEl" class="home">
    <canvas ref="canvasEl" class="stage" aria-hidden="true"></canvas>

    <!-- ——— Hero ——————————————————————————————— -->
    <header class="hero">
      <p class="annotation hero-kicker">Portfolio · MMXXVI</p>
      <h1 class="hero-name">
        {{ site.name.split(' ')[0] }}
        <em class="gold-text">{{ site.name.split(' ').slice(1).join(' ') }}</em>
      </h1>
      <div class="meander hero-meander" aria-hidden="true"></div>
      <p class="hero-role smallcaps">{{ site.title }}</p>
      <p class="hero-tagline">{{ site.tagline }}</p>
      <a class="scroll-hint" href="#works" aria-label="Scroll to works">
        <span class="annotation">Descend</span>
        <span class="scroll-line" aria-hidden="true"></span>
      </a>
    </header>

    <!-- ——— Works ——————————————————————————————— -->
    <main id="works" class="works">
      <div class="works-heading reveal">
        <p class="fleuron" aria-hidden="true">❧</p>
        <h2 class="section-title">Selected Works</h2>
        <p class="annotation">four studies · {{ projects[projects.length - 1].year }}–{{ projects[0].year }}</p>
      </div>

      <ProjectPlate
        v-for="(project, i) in projects"
        :key="project.slug"
        class="reveal"
        :project="project"
        :flip="i % 2 === 1"
      />
    </main>

    <!-- ——— Colophon ————————————————————————————— -->
    <footer class="colophon reveal">
      <div class="meander" aria-hidden="true"></div>
      <h2 class="section-title colophon-title">Colophon</h2>
      <p class="colophon-text">
        Set in Cormorant &amp; EB Garamond upon digital vellum.<br />
        Marble cut in WebGL; gold leaf applied by hand.
      </p>
      <nav class="colophon-links smallcaps">
        <a :href="`mailto:${site.email}`">Epistle</a>
        <span aria-hidden="true">·</span>
        <a :href="site.github" target="_blank" rel="noopener">GitHub</a>
        <span aria-hidden="true">·</span>
        <a :href="site.linkedin" target="_blank" rel="noopener">LinkedIn</a>
      </nav>
      <p class="annotation colophon-fin">{{ site.location }} · ΤΕΛΟΣ</p>
    </footer>
  </div>
</template>

<style scoped>
.home {
  position: relative;
}

.stage {
  position: fixed;
  inset: 0;
  width: 100vw;
  height: 100vh;
  z-index: 0;
}

.hero,
.works,
.colophon {
  position: relative;
  z-index: 1;
}

/* ——— hero ——— */
.hero {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0 1.5rem;
}

.hero-kicker {
  margin-bottom: 1.4rem;
}

.hero-name {
  font-size: clamp(3.4rem, 11vw, 8.5rem);
  font-weight: 500;
  letter-spacing: 0.02em;
  text-shadow: 0 2px 40px rgba(244, 239, 230, 0.9);
}

.hero-name em {
  font-style: italic;
  font-weight: 600;
}

.hero-meander {
  width: 168px;
  margin: 1.6rem 0 1.2rem;
}

.hero-role {
  font-family: var(--serif-display);
  font-size: clamp(1.1rem, 2.4vw, 1.5rem);
  color: var(--ink-soft);
  margin: 0 0 0.8rem;
}

.hero-tagline {
  font-style: italic;
  max-width: 34em;
  color: var(--ink-soft);
  text-shadow: 0 1px 24px rgba(244, 239, 230, 0.95);
}

.scroll-hint {
  position: absolute;
  bottom: 4vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  color: var(--ink-faint);
}

.scroll-line {
  width: 1px;
  height: 56px;
  background: linear-gradient(var(--gold), transparent);
  animation: descend 2.2s ease-in-out infinite;
  transform-origin: top;
}

@keyframes descend {
  0% { transform: scaleY(0); opacity: 0; }
  35% { transform: scaleY(1); opacity: 1; }
  100% { transform: scaleY(1) translateY(18px); opacity: 0; }
}

/* ——— works ——— */
.works {
  max-width: 1280px;
  margin: 0 auto;
  padding: 6vh 4vw 10vh;
}

.works-heading {
  text-align: center;
  margin-bottom: 6vh;
}

.section-title {
  font-size: clamp(2rem, 5vw, 3.4rem);
  font-weight: 600;
}

/* ——— colophon ——— */
.colophon {
  text-align: center;
  padding: 10vh 1.5rem 8vh;
  background: linear-gradient(transparent, color-mix(in srgb, var(--paper-deep) 85%, transparent));
}

.colophon .meander {
  width: 196px;
  margin: 0 auto 2.4rem;
}

.colophon-title {
  margin-bottom: 1rem;
}

.colophon-text {
  font-style: italic;
  color: var(--ink-soft);
}

.colophon-links {
  display: flex;
  justify-content: center;
  gap: 1.2rem;
  font-family: var(--serif-display);
  font-size: 1.15rem;
  margin: 1.8rem 0 2.6rem;
}

.colophon-fin {
  letter-spacing: 0.5em;
}
</style>
