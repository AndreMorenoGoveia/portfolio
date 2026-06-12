import { ref, type Ref } from 'vue'

/**
 * Renaissance-plate hover physics: the card tilts toward the cursor and a
 * varnish sheen follows it. Returns handlers to spread on the element and
 * reactive CSS custom-property style.
 */
export function useTilt(maxDeg = 5) {
  const style: Ref<Record<string, string>> = ref({})

  function onMove(e: MouseEvent) {
    const el = e.currentTarget as HTMLElement
    const rect = el.getBoundingClientRect()
    const nx = (e.clientX - rect.left) / rect.width - 0.5
    const ny = (e.clientY - rect.top) / rect.height - 0.5
    style.value = {
      '--tilt-x': `${(-ny * maxDeg).toFixed(2)}deg`,
      '--tilt-y': `${(nx * maxDeg).toFixed(2)}deg`,
      '--sheen-x': `${((nx + 0.5) * 100).toFixed(1)}%`,
      '--sheen-y': `${((ny + 0.5) * 100).toFixed(1)}%`,
      '--sheen-opacity': '1',
    }
  }

  function onLeave() {
    style.value = {
      '--tilt-x': '0deg',
      '--tilt-y': '0deg',
      '--sheen-opacity': '0',
    }
  }

  return { style, onMove, onLeave }
}
