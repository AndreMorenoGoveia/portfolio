/**
 * Project catalogue. Each entry renders as a "plate" on the home scroll
 * and as a paper-style monograph at /work/<slug>.
 *
 * Replace the placeholder entries with your real work — the layout adapts
 * to however many sections, figures and references you provide.
 */

export interface PaperFigure {
  caption: string
  /** Optional image path under /public. Falls back to a generated fresco placeholder. */
  src?: string
}

export interface PaperSection {
  heading: string
  body: string[]
  figure?: PaperFigure
}

export interface Project {
  slug: string
  /** Roman numeral used as the plate number on the home page. */
  numeral: string
  title: string
  epithet: string
  year: string
  tags: string[]
  /** One-paragraph summary shown on the home plate and as the paper abstract. */
  abstract: string
  /** Accent used for this project's ornaments. */
  accent: 'clay' | 'gold' | 'azure' | 'verdigris'
  links?: { label: string; url: string }[]
  sections: PaperSection[]
  references?: string[]
}

export const projects: Project[] = [
  {
    slug: 'oracle',
    numeral: 'I',
    title: 'Oracle',
    epithet: 'A real-time analytics engine',
    year: '2025',
    tags: ['TypeScript', 'Node.js', 'ClickHouse', 'WebSockets'],
    accent: 'clay',
    abstract:
      'Oracle ingests millions of events per minute and answers questions about them while they are still warm. This paper describes its streaming architecture, the query planner that keeps p99 latency under 80 ms, and what was learned about backpressure the hard way.',
    links: [{ label: 'Source', url: 'https://github.com/andregoveia' }],
    sections: [
      {
        heading: 'Introduction',
        body: [
          'Every product team eventually asks the same question: what is happening right now? Most analytics stacks answer a different question — what happened fifteen minutes ago — and call it close enough. Oracle was built on the premise that it is not.',
          'The system accepts an arbitrary event stream, maintains materialised aggregates over sliding windows, and exposes them through a subscription API so dashboards update without polling.',
        ],
      },
      {
        heading: 'Architecture',
        body: [
          'Events arrive over HTTP or a message bus, are validated against a versioned schema registry, and land in ClickHouse via buffered inserts tuned to trade at most two seconds of freshness for an order of magnitude in throughput.',
          'The interesting part is the subscription layer: a query is parsed once, fingerprinted, and shared between every client watching it. A thousand dashboards watching the same chart cost the database exactly one query per tick.',
        ],
        figure: { caption: 'Fig. 1 — Event flow from ingestion to live subscription fan-out.' },
      },
      {
        heading: 'Results',
        body: [
          'In production the system sustains 2.3 M events/min on three modest nodes, with a p99 end-to-end latency (event received → dashboard updated) of 78 ms.',
          'Backpressure proved more important than raw speed: the first version fell over not when traffic grew, but when a single slow consumer made everyone wait. The fix — per-subscriber ring buffers with drop-oldest semantics — is now the part of the codebase I am proudest of.',
        ],
      },
    ],
    references: [
      'Kleppmann, M. — Designing Data-Intensive Applications. O’Reilly, 2017.',
      'ClickHouse documentation — Buffer table engine.',
    ],
  },
  {
    slug: 'daedalus',
    numeral: 'II',
    title: 'Daedalus',
    epithet: 'A code-generation toolchain',
    year: '2024',
    tags: ['Vue', 'TypeScript', 'AST', 'Compilers'],
    accent: 'gold',
    abstract:
      'Daedalus turns OpenAPI specifications into fully typed Vue data layers — stores, composables, mocks and tests — eliminating an entire class of frontend/backend drift. Named for the craftsman who built the labyrinth, it now generates the maze so nobody has to walk it.',
    sections: [
      {
        heading: 'Motivation',
        body: [
          'On a team of forty engineers, the API contract was the most frequently broken promise. Types were written twice — once in the backend schema, once by hand on the frontend — and the two disagreed roughly weekly, always discovered at runtime, always on a Friday.',
          'Daedalus makes the specification the single source of truth and generates everything downstream of it.',
        ],
      },
      {
        heading: 'Method',
        body: [
          'The generator walks the OpenAPI document into a normalised intermediate representation, then emits code through composable printer passes: one for types, one for Pinia stores, one for MSW mock handlers, one for contract tests.',
          'Generated code is treated as a build artifact, never committed, which forces the pipeline to stay honest — if generation breaks, the build breaks, loudly and immediately.',
        ],
        figure: { caption: 'Fig. 1 — Printer-pass pipeline from specification to artifacts.' },
      },
      {
        heading: 'Adoption & results',
        body: [
          'Within one quarter, contract-drift incidents went from weekly to zero. The unexpected benefit was social: API design reviews became real, because changing the spec now visibly changed forty engineers’ type errors.',
        ],
      },
    ],
  },
  {
    slug: 'symposium',
    numeral: 'III',
    title: 'Symposium',
    epithet: 'Collaborative whiteboarding, CRDT-style',
    year: '2024',
    tags: ['CRDTs', 'Canvas', 'WebRTC', 'Rust → WASM'],
    accent: 'azure',
    abstract:
      'Symposium is a multiplayer drawing surface where conflict resolution is mathematical rather than social. Built on a custom CRDT compiled from Rust to WebAssembly, it keeps fifty cursors coherent over flaky connections without a central arbiter — every participant is equal, as at any good symposium.',
    sections: [
      {
        heading: 'Problem',
        body: [
          'Real-time collaboration usually means a server that owns the truth, which means the truth disappears when the Wi-Fi does. The goal was a whiteboard that stays usable offline, merges automatically on reconnection, and never asks a human to resolve a conflict.',
        ],
      },
      {
        heading: 'A CRDT for ink',
        body: [
          'Strokes are immutable and identified by (author, lamport-timestamp), which makes the document a grow-only set — the simplest CRDT there is. The hard part is everything around it: erasure as tombstones, z-order as a fractional index, and selection as ephemeral state that deliberately does not replicate.',
          'The merge engine is written in Rust and compiled to WASM; the same module runs in the browser, in tests, and in the relay, so there is exactly one implementation of the semantics.',
        ],
        figure: { caption: 'Fig. 1 — Two divergent replicas converging after a network partition.' },
      },
      {
        heading: 'Findings',
        body: [
          'Latency hiding matters more than latency: optimistic local rendering with ~16 ms feedback makes a 300 ms network feel instant. And tombstones, left unchecked, will eat your document — compaction is not optional, it is the product.',
        ],
      },
    ],
    references: ['Shapiro et al. — Conflict-free Replicated Data Types. INRIA, 2011.'],
  },
  {
    slug: 'arcadia',
    numeral: 'IV',
    title: 'Arcadia',
    epithet: 'Procedural landscapes in the browser',
    year: '2023',
    tags: ['Three.js', 'GLSL', 'WebGL', 'Generative'],
    accent: 'verdigris',
    abstract:
      'Arcadia generates infinite pastoral landscapes — rolling hills, cypress groves, ruined temples — entirely in shaders, streaming at 60 fps on integrated graphics. A study in how far procedural beauty can go with zero assets and a strict frame budget.',
    sections: [
      {
        heading: 'Constraint as muse',
        body: [
          'The rule was: no textures, no models, no downloads. Every hill is a noise function, every tree an instanced billboard shaded by math, every ruin a signed-distance field. The entire world ships in 41 KB of GLSL.',
        ],
      },
      {
        heading: 'Technique',
        body: [
          'Terrain is domain-warped fractal Brownian motion sampled in the vertex shader over a frustum-following clipmap grid, so detail is spent exactly where the camera looks. Atmosphere is a single-scattering approximation cheap enough to run per-pixel.',
          'The temples are the indulgence: ray-marched SDF columns, broken by subtracting noise-displaced spheres, placed by a poisson-disc scatter seeded from the terrain height field so they only crown the hills.',
        ],
        figure: { caption: 'Fig. 1 — SDF temple composition: column primitive, repetition, erosion.' },
      },
      {
        heading: 'What it taught me',
        body: [
          'Performance work is aesthetic work. Every milliseconds saved was reinvested in light — and the difference between a tech demo and a place you want to linger is entirely in the light.',
        ],
      },
    ],
  },
]

export function getProject(slug: string): Project | undefined {
  return projects.find((p) => p.slug === slug)
}
