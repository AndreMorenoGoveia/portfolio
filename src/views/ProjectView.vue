<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { gsap } from 'gsap'
import { InkField } from '../three/inkField'
import { getProject, projects } from '../data/projects'
import { site } from '../data/site'

const props = defineProps<{ slug: string }>()
const router = useRouter()

const project = computed(() => getProject(props.slug))

const neighbours = computed(() => {
  const i = projects.findIndex((p) => p.slug === props.slug)
  return {
    prev: i > 0 ? projects[i - 1] : null,
    next: i >= 0 && i < projects.length - 1 ? projects[i + 1] : null,
  }
})

const canvasEl = ref<HTMLCanvasElement | null>(null)
let field: InkField | null = null

function mountField() {
  field?.dispose()
  field = null
  if (canvasEl.value && project.value) {
    field = new InkField(canvasEl.value, project.value.accent)
  }
}

onMounted(() => {
  if (!project.value) {
    router.replace('/')
    return
  }
  mountField()
  gsap.from('.sheet > *', {
    opacity: 0,
    y: 30,
    duration: 0.9,
    stagger: 0.08,
    ease: 'power3.out',
  })
})

watch(
  () => props.slug,
  () => {
    if (!project.value) {
      router.replace('/')
      return
    }
    window.scrollTo({ top: 0 })
    mountField()
  },
)

onBeforeUnmount(() => {
  field?.dispose()
  field = null
})
</script>

<template>
  <div v-if="project" class="paper" :style="{ '--accent': `var(--${project.accent})` }">
    <canvas ref="canvasEl" class="ink" aria-hidden="true"></canvas>

    <nav class="return">
      <router-link to="/" class="smallcaps">⟵ Return to the gallery</router-link>
    </nav>

    <article class="sheet">
      <header class="paper-head">
        <p class="annotation">Monograph No. {{ project.numeral }} · {{ project.year }}</p>
        <h1 class="paper-title">{{ project.title }}</h1>
        <p class="paper-subtitle">{{ project.epithet }}</p>
        <div class="meander head-meander" aria-hidden="true"></div>
        <p class="paper-author">
          {{ site.name }}<sup>†</sup>
        </p>
        <p class="annotation paper-affil"><sup>†</sup>{{ site.location }} · {{ site.email }}</p>
      </header>

      <section class="abstract">
        <p>
          <strong class="smallcaps">Abstract — </strong>
          <em>{{ project.abstract }}</em>
        </p>
        <p class="annotation keywords">
          Keywords: {{ project.tags.join(' · ') }}
        </p>
      </section>

      <section
        v-for="(section, i) in project.sections"
        :key="section.heading"
        class="paper-section"
      >
        <h2 class="section-heading">
          <span class="section-no">§{{ i + 1 }}</span> {{ section.heading }}
        </h2>
        <p v-for="(para, j) in section.body" :key="j" :class="{ 'first-para': i === 0 && j === 0 }">
          {{ para }}
        </p>

        <figure v-if="section.figure" class="paper-figure">
          <img v-if="section.figure.src" :src="section.figure.src" :alt="section.figure.caption" />
          <svg v-else viewBox="0 0 480 200" aria-hidden="true" class="figure-placeholder">
            <rect x="1" y="1" width="478" height="198" fill="var(--paper-bright)" stroke="var(--gold)" />
            <path
              d="M20 150 C 90 40, 150 180, 240 90 S 400 30, 460 110"
              fill="none" stroke="var(--accent)" stroke-width="2"
            />
            <path
              d="M20 120 C 110 160, 200 60, 290 130 S 420 150, 460 70"
              fill="none" stroke="var(--gold)" stroke-width="1.4" stroke-dasharray="5 4"
            />
            <g stroke="var(--ink-faint)" stroke-width="0.6">
              <line x1="20" y1="170" x2="460" y2="170" />
              <line x1="20" y1="170" x2="20" y2="25" />
            </g>
          </svg>
          <figcaption class="annotation">{{ section.figure.caption }}</figcaption>
        </figure>
      </section>

      <section v-if="project.links?.length" class="paper-section">
        <h2 class="section-heading"><span class="section-no">⁂</span> Artifacts</h2>
        <ul class="artifact-list">
          <li v-for="link in project.links" :key="link.url">
            <a :href="link.url" target="_blank" rel="noopener">{{ link.label }}</a>
            <span class="annotation"> — {{ link.url }}</span>
          </li>
        </ul>
      </section>

      <section v-if="project.references?.length" class="references">
        <h2 class="section-heading">References</h2>
        <ol>
          <li v-for="(reference, i) in project.references" :key="i">{{ reference }}</li>
        </ol>
      </section>

      <div class="fleuron" aria-hidden="true">❧</div>
    </article>

    <nav class="paper-nav">
      <router-link v-if="neighbours.prev" :to="`/work/${neighbours.prev.slug}`" class="nav-card">
        <span class="annotation">⟵ Previous</span>
        <span class="nav-title">{{ neighbours.prev.title }}</span>
      </router-link>
      <span v-else></span>
      <router-link v-if="neighbours.next" :to="`/work/${neighbours.next.slug}`" class="nav-card nav-next">
        <span class="annotation">Next ⟶</span>
        <span class="nav-title">{{ neighbours.next.title }}</span>
      </router-link>
    </nav>
  </div>
</template>

<style scoped>
.paper {
  position: relative;
  min-height: 100vh;
  padding: 5rem 1.5rem 6rem;
}

.ink {
  position: fixed;
  inset: 0;
  z-index: 0;
  pointer-events: none;
}

.return {
  position: fixed;
  top: 1.6rem;
  left: 2rem;
  z-index: 2;
  font-family: var(--serif-display);
  font-size: 1.05rem;
}

/* ——— the sheet ——— */
.sheet {
  position: relative;
  z-index: 1;
  max-width: 760px;
  margin: 0 auto;
  background: color-mix(in srgb, var(--paper-bright) 92%, transparent);
  border: 1px solid color-mix(in srgb, var(--gold) 40%, transparent);
  box-shadow: 0 30px 80px -40px rgba(43, 37, 29, 0.4);
  padding: clamp(2rem, 6vw, 4.5rem) clamp(1.4rem, 5vw, 4rem);
}

.paper-head {
  text-align: center;
  margin-bottom: 2.6rem;
}

.paper-title {
  font-size: clamp(2.6rem, 7vw, 4.2rem);
  font-weight: 600;
  margin: 0.5rem 0 0.2rem;
}

.paper-subtitle {
  font-family: var(--serif-display);
  font-style: italic;
  font-size: clamp(1.15rem, 3vw, 1.5rem);
  color: var(--ink-soft);
  margin-bottom: 0;
}

.head-meander {
  width: 132px;
  margin: 1.3rem auto;
}

.paper-author {
  font-family: var(--serif-display);
  font-size: 1.25rem;
  margin-bottom: 0.2rem;
}

.paper-affil {
  text-transform: none;
  letter-spacing: 0.06em;
}

/* ——— abstract ——— */
.abstract {
  border-top: var(--frame-rule);
  border-bottom: var(--frame-rule);
  padding: 1.4rem 1.6rem 0.9rem;
  margin-bottom: 2.4rem;
  background: color-mix(in srgb, var(--gold-pale) 18%, transparent);
}

.abstract .smallcaps {
  color: var(--accent);
}

.keywords {
  text-transform: none;
  letter-spacing: 0.08em;
}

/* ——— body ——— */
.paper-section {
  margin-bottom: 2.2rem;
}

.section-heading {
  font-size: 1.6rem;
  font-weight: 600;
  margin-bottom: 0.7rem;
}

.section-no {
  color: var(--accent);
  font-weight: 500;
  margin-right: 0.25rem;
}

.paper-section p {
  text-align: justify;
  hyphens: auto;
}

.first-para::first-letter {
  font-family: var(--serif-display);
  font-size: 3.4em;
  font-weight: 600;
  float: left;
  line-height: 0.8;
  padding: 0.05em 0.12em 0 0;
  color: var(--accent);
}

/* ——— figures ——— */
.paper-figure {
  margin: 1.6rem 0;
  text-align: center;
}

.paper-figure img,
.figure-placeholder {
  width: 100%;
  border: 1px solid color-mix(in srgb, var(--gold) 40%, transparent);
}

.paper-figure figcaption {
  margin-top: 0.6rem;
  text-transform: none;
  letter-spacing: 0.08em;
}

/* ——— references & artifacts ——— */
.artifact-list {
  list-style: none;
  padding: 0;
}

.artifact-list a {
  font-family: var(--serif-display);
  font-size: 1.15rem;
}

.references {
  border-top: var(--frame-rule);
  padding-top: 1.4rem;
}

.references .section-heading {
  font-size: 1.3rem;
}

.references ol {
  padding-left: 1.4rem;
  color: var(--ink-soft);
  font-size: 0.95rem;
}

/* ——— prev / next ——— */
.paper-nav {
  position: relative;
  z-index: 1;
  max-width: 760px;
  margin: 2.5rem auto 0;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}

.nav-card {
  display: flex;
  flex-direction: column;
  gap: 0.2rem;
}

.nav-next {
  text-align: right;
}

.nav-title {
  font-family: var(--serif-display);
  font-size: 1.35rem;
  font-weight: 600;
}

@media (max-width: 720px) {
  .return {
    position: absolute;
  }
}
</style>
