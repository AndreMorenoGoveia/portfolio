<script setup lang="ts">
import { computed } from 'vue'
import type { Project } from '../data/projects'
import { useTilt } from '../composables/useTilt'

const props = defineProps<{ project: Project; flip: boolean }>()

const { style, onMove, onLeave } = useTilt(4)

const accentVar = computed(() => `var(--${props.project.accent})`)
</script>

<template>
  <article class="plate-row" :class="{ flip }">
    <!-- giant numeral watermark -->
    <div class="numeral" aria-hidden="true">{{ project.numeral }}</div>

    <router-link
      :to="`/work/${project.slug}`"
      class="plate"
      :style="{ ...style, '--accent': accentVar }"
      @mousemove="onMove"
      @mouseleave="onLeave"
    >
      <div class="plate-inner">
        <!-- fresco: an arched window onto a gradient sky -->
        <div class="fresco">
          <svg viewBox="0 0 300 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
            <defs>
              <linearGradient :id="`sky-${project.slug}`" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stop-color="var(--paper-bright)" />
                <stop offset="55%" stop-color="var(--gold-pale)" />
                <stop offset="100%" :stop-color="accentVar" stop-opacity="0.8" />
              </linearGradient>
              <clipPath :id="`arch-${project.slug}`">
                <path d="M40 200 V90 A110 110 0 0 1 260 90 V200 Z" />
              </clipPath>
            </defs>
            <g :clip-path="`url(#arch-${project.slug})`">
              <rect width="300" height="200" :fill="`url(#sky-${project.slug})`" />
              <circle cx="150" cy="105" r="26" fill="var(--gold-bright)" opacity="0.9" />
              <circle cx="150" cy="105" r="40" fill="var(--gold-bright)" opacity="0.22" />
              <path d="M-10 175 Q70 140 150 168 T310 160 V210 H-10 Z" :fill="accentVar" opacity="0.35" />
              <path d="M-10 190 Q90 160 190 185 T310 178 V210 H-10 Z" :fill="accentVar" opacity="0.55" />
            </g>
            <path
              d="M40 200 V90 A110 110 0 0 1 260 90 V200"
              fill="none"
              stroke="var(--gold)"
              stroke-width="2.5"
            />
          </svg>
          <span class="fresco-year annotation">{{ project.year }}</span>
        </div>

        <div class="plate-text">
          <p class="annotation plate-kicker">Plate {{ project.numeral }} · {{ project.epithet }}</p>
          <h3 class="plate-title">{{ project.title }}</h3>
          <div class="meander plate-meander" aria-hidden="true"></div>
          <p class="plate-abstract">{{ project.abstract }}</p>
          <ul class="plate-tags">
            <li v-for="tag in project.tags" :key="tag" class="annotation">{{ tag }}</li>
          </ul>
          <span class="plate-cta smallcaps">Read the monograph <span class="cta-arrow">⟶</span></span>
        </div>
      </div>
      <div class="sheen" aria-hidden="true"></div>
    </router-link>
  </article>
</template>

<style scoped>
.plate-row {
  position: relative;
  display: flex;
  justify-content: flex-start;
  padding: 8vh 0;
  perspective: 1200px;
}

.plate-row.flip {
  justify-content: flex-end;
}

.numeral {
  position: absolute;
  top: 50%;
  font-family: var(--serif-display);
  font-size: clamp(12rem, 28vw, 24rem);
  font-weight: 500;
  line-height: 1;
  color: transparent;
  -webkit-text-stroke: 1.5px color-mix(in srgb, var(--gold) 45%, transparent);
  transform: translateY(-50%);
  user-select: none;
  pointer-events: none;
}

.plate-row:not(.flip) .numeral {
  right: 2vw;
}

.plate-row.flip .numeral {
  left: 2vw;
}

.plate {
  position: relative;
  display: block;
  width: min(640px, 92vw);
  color: var(--ink);
  background: linear-gradient(160deg, var(--paper-bright), var(--paper-deep));
  border: 1px solid color-mix(in srgb, var(--gold) 50%, transparent);
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.6) inset,
    0 24px 60px -28px rgba(43, 37, 29, 0.45);
  transform: rotateX(var(--tilt-x, 0deg)) rotateY(var(--tilt-y, 0deg));
  transition: transform 0.25s var(--ease-out-soft), box-shadow 0.3s ease;
  will-change: transform;
  overflow: hidden;
}

.plate:hover {
  box-shadow:
    0 1px 0 rgba(255, 255, 255, 0.6) inset,
    0 36px 80px -30px rgba(43, 37, 29, 0.55);
}

/* inner double rule, like an engraving border */
.plate-inner {
  margin: 10px;
  padding: clamp(1.2rem, 3vw, 2.2rem);
  border: var(--frame-rule);
  outline: 1px solid color-mix(in srgb, var(--gold) 25%, transparent);
  outline-offset: 3px;
}

.fresco {
  position: relative;
  margin-bottom: 1.6rem;
  border-bottom: var(--frame-rule);
}

.fresco svg {
  width: 100%;
  height: clamp(150px, 24vw, 210px);
}

.fresco-year {
  position: absolute;
  right: 0;
  bottom: 0.5rem;
  color: var(--ink-soft);
}

.plate-kicker {
  margin: 0 0 0.4rem;
  color: color-mix(in srgb, var(--accent) 75%, var(--ink));
}

.plate-title {
  font-size: clamp(2.2rem, 5vw, 3.2rem);
  font-weight: 600;
  letter-spacing: 0.01em;
}

.plate-meander {
  width: 112px;
  margin: 0.8rem 0 1rem;
}

.plate-abstract {
  font-size: 1.02rem;
  color: var(--ink-soft);
  margin-bottom: 1.1rem;
}

/* illuminated drop cap on the first letter */
.plate-abstract::first-letter {
  font-family: var(--serif-display);
  font-size: 3.1em;
  font-weight: 600;
  float: left;
  line-height: 0.82;
  padding: 0.04em 0.12em 0 0;
  color: var(--accent);
}

.plate-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem 1.2rem;
  list-style: none;
  margin: 0 0 1.3rem;
  padding: 0;
}

.plate-tags li::before {
  content: '◆ ';
  color: var(--gold);
  font-size: 0.6em;
  vertical-align: 0.2em;
}

.plate-cta {
  font-family: var(--serif-display);
  font-size: 1.05rem;
  color: var(--clay-deep);
  letter-spacing: 0.12em;
}

.cta-arrow {
  display: inline-block;
  transition: transform 0.3s var(--ease-out-soft);
}

.plate:hover .cta-arrow {
  transform: translateX(8px);
}

/* varnish sheen following the cursor */
.sheen {
  position: absolute;
  inset: 0;
  pointer-events: none;
  opacity: var(--sheen-opacity, 0);
  transition: opacity 0.4s ease;
  background: radial-gradient(
    420px circle at var(--sheen-x, 50%) var(--sheen-y, 50%),
    rgba(255, 244, 214, 0.5),
    transparent 65%
  );
  mix-blend-mode: soft-light;
}

@media (max-width: 720px) {
  .plate-row,
  .plate-row.flip {
    justify-content: center;
  }

  .numeral {
    display: none;
  }
}
</style>
