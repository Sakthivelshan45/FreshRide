// // 'use client'

// // import { useRef, useState } from 'react'
// // import * as THREE from 'three'
// // import { Canvas, useFrame } from '@react-three/fiber'
// // import { Float, RoundedBox, ContactShadows, Environment, Lightformer } from '@react-three/drei'

// // type LayerProps = {
// //   size: [number, number, number]
// //   color: string
// //   baseY: number
// //   spreadY: number
// //   rotY: number
// //   spread: React.MutableRefObject<number>
// // }

// // function Layer({ size, color, baseY, spreadY, rotY, spread }: LayerProps) {
// //   const ref = useRef<THREE.Group>(null!)
// //   useFrame(() => {
// //     ref.current.position.y = baseY + spreadY * spread.current
// //     ref.current.rotation.y = rotY * (0.4 + spread.current * 0.6)
// //   })
// //   return (
// //     <group ref={ref}>
// //       <RoundedBox args={size} radius={0.09} smoothness={5} castShadow receiveShadow>
// //         <meshStandardMaterial color={color} roughness={0.85} metalness={0} />
// //       </RoundedBox>
// //       {/* fold line */}
// //       <mesh position={[0, size[1] / 2 + 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
// //         <planeGeometry args={[size[0] * 0.92, 0.012]} />
// //         <meshBasicMaterial color="#000" transparent opacity={0.08} />
// //       </mesh>
// //     </group>
// //   )
// // }

// // function Kit() {
// //   const group = useRef<THREE.Group>(null!)
// //   const spread = useRef(0)
// //   const [hovered, setHovered] = useState(false)

// //   useFrame((state, delta) => {
// //     // mouse parallax tilt
// //     const { x, y } = state.pointer
// //     group.current.rotation.y = THREE.MathUtils.damp(group.current.rotation.y, x * 0.6 + 0.5, 4, delta)
// //     group.current.rotation.x = THREE.MathUtils.damp(group.current.rotation.x, -y * 0.25 + 0.15, 4, delta)
// //     // hover spread
// //     spread.current = THREE.MathUtils.damp(spread.current, hovered ? 1 : 0, 5, delta)
// //   })

// //   return (
// //     <group
// //       ref={group}
// //       onPointerOver={() => setHovered(true)}
// //       onPointerOut={() => setHovered(false)}
// //     >
// //       {/* Blanket (bottom) */}
// //       <Layer size={[2.6, 0.34, 1.8]} color="#C9A24A" baseY={-0.32} spreadY={-0.45} rotY={0.0} spread={spread} />
// //       {/* Bedsheet (middle) */}
// //       <Layer size={[2.4, 0.26, 1.65]} color="#F4F1EA" baseY={0.0} spreadY={0.0} rotY={0.12} spread={spread} />
// //       {/* Pillow cover (top) */}
// //       <Layer size={[1.7, 0.22, 1.15]} color="#CFE8D6" baseY={0.3} spreadY={0.5} rotY={-0.18} spread={spread} />
// //     </group>
// //   )
// // }

// // export default function HeroScene3D() {
// //   return (
// //     <Canvas
// //       shadows
// //       dpr={[1, 2]}
// //       camera={{ position: [0, 1.6, 5.2], fov: 38 }}
// //       gl={{ alpha: true, antialias: true }}
// //       style={{ background: 'transparent' }}
// //     >
// //       <ambientLight intensity={0.6} />
// //       <directionalLight
// //         position={[4, 6, 3]}
// //         intensity={1.8}
// //         castShadow
// //         shadow-mapSize={[1024, 1024]}
// //       />
// //       <pointLight position={[-4, 1, -2]} intensity={12} color="#D4A94F" />

// //       <Float speed={1.6} rotationIntensity={0.15} floatIntensity={0.9} floatingRange={[-0.1, 0.15]}>
// //         <Kit />
// //       </Float>

// //       <ContactShadows position={[0, -1.35, 0]} opacity={0.45} scale={9} blur={2.8} far={3} />

// //       {/* Local lighting rig — no external HDR download needed */}
// //       <Environment resolution={256}>
// //         <Lightformer form="rect" intensity={2.5} position={[0, 5, -3]} scale={[10, 3, 1]} />
// //         <Lightformer form="rect" intensity={1.5} position={[-5, 1, 2]} scale={[3, 6, 1]} />
// //         <Lightformer form="rect" intensity={1.2} position={[5, 2, 2]} scale={[3, 6, 1]} />
// //       </Environment>
// //     </Canvas>
// //   )
// // }











// 'use client'

// import { useEffect, useMemo, useRef, useState } from 'react'
// import * as THREE from 'three'
// import { Canvas, useFrame, useThree } from '@react-three/fiber'
// import { Environment, Lightformer, RoundedBox } from '@react-three/drei'

// /* ═══════════════════════════════════════════════════════════════
//    Butterfly Fresh Ride — cinematic 3D hero

//    One disposable nonwoven bedsheet, folded like a pleated fan,
//    slowly opens in mid-air next to a minimal Fresh Ride package.

//    • The sheet is ONE opaque mesh. The pleat / unfold / wave motion
//      runs in the vertex shader (no per-frame CPU vertex work and no
//      per-frame normal recomputation).
//    • The nonwoven look comes from a procedurally generated fibre
//      texture (colour + bump), generated once on mount.
//    • Exactly one render loop: it pauses when the hero is off screen,
//      and reduced-motion users get a single, finished still frame.
//    ═══════════════════════════════════════════════════════════════ */

// /* ───────── Brand + layout constants ───────── */

// const BLUE = '#8CBED6'
// const GREEN = '#8FC3A8'
// const INK = '#20252B'

// const SHEET_W = 2.9
// const SHEET_D = 1.9
// const PANELS = 6

// /** Seconds on the intro timeline */
// const T_PACKAGE_IN = { start: 0.2, dur: 1.5 }
// const T_SHEET_IN = { start: 0.5, dur: 1.6 }
// const T_UNFOLD = { start: 1.9, dur: 4.4 }

// /** Value the reduced-motion still frame uses for "how open is the sheet" */
// const STILL_OPEN = 0.8

// type TimeRef = { current: number }

// /* ───────── Small helpers ───────── */

// const clamp01 = (v: number) => Math.max(0, Math.min(1, v))

// function seg(time: number, start: number, dur: number) {
//   return clamp01((time - start) / dur)
// }

// const easeInOut = (t: number) => t * t * (3 - 2 * t)
// const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
// const easeInOutCubic = (t: number) =>
//   t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

// /** GLSL needs "3.0", never "3" */
// const glf = (n: number) => (Number.isInteger(n) ? n.toFixed(1) : String(n))

// /* ═══════════════════════════════════════════════════════════════
//    Procedural textures
//    ═══════════════════════════════════════════════════════════════ */

// /** Tileable spunbond-style fibre texture: random fine fibres + soft cloudiness. */
// function makeNonwovenTexture(size: number): THREE.CanvasTexture {
//   const canvas = document.createElement('canvas')
//   canvas.width = canvas.height = size
//   const g = canvas.getContext('2d')!

//   let seed = 20261110
//   const rnd = () => {
//     seed = (seed * 16807) % 2147483647
//     return (seed - 1) / 2147483646
//   }

//   g.fillStyle = '#f2eee5'
//   g.fillRect(0, 0, size, size)

//   // Soft cloudy density variation (bonding / basis-weight variation)
//   for (let i = 0; i < 120; i++) {
//     const x = rnd() * size
//     const y = rnd() * size
//     const r = size * (0.06 + rnd() * 0.14)
//     const light = rnd() < 0.5
//     for (const ox of [-size, 0, size]) {
//       for (const oy of [-size, 0, size]) {
//         const grad = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r)
//         grad.addColorStop(0, light ? 'rgba(255,255,255,0.10)' : 'rgba(150,140,120,0.06)')
//         grad.addColorStop(1, 'rgba(255,255,255,0)')
//         g.fillStyle = grad
//         g.fillRect(x + ox - r, y + oy - r, r * 2, r * 2)
//       }
//     }
//   }

//   // Individual fibres
//   const scale = size / 512
//   const fibreCount = Math.round((size * size) / 95)
//   g.lineCap = 'round'
//   for (let i = 0; i < fibreCount; i++) {
//     const x = rnd() * size
//     const y = rnd() * size
//     const a = rnd() * Math.PI
//     const len = size * (0.035 + rnd() * 0.09)
//     const dx = Math.cos(a) * len
//     const dy = Math.sin(a) * len
//     const light = rnd() < 0.55
//     g.strokeStyle = light
//       ? `rgba(255,255,255,${0.35 + rnd() * 0.4})`
//       : `rgba(120,112,98,${0.06 + rnd() * 0.12})`
//     g.lineWidth = (0.5 + rnd() * 1.1) * scale
//     for (const ox of [-size, 0, size]) {
//       for (const oy of [-size, 0, size]) {
//         const x0 = x + ox
//         const y0 = y + oy
//         if (x0 < -len || x0 > size + len || y0 < -len || y0 > size + len) continue
//         g.beginPath()
//         g.moveTo(x0, y0)
//         // slight curve so fibres are not perfectly straight
//         g.quadraticCurveTo(x0 + dx * 0.5 + dy * 0.12, y0 + dy * 0.5 - dx * 0.12, x0 + dx, y0 + dy)
//         g.stroke()
//       }
//     }
//   }

//   const tex = new THREE.CanvasTexture(canvas)
//   tex.wrapS = tex.wrapT = THREE.RepeatWrapping
//   tex.colorSpace = THREE.SRGBColorSpace
//   tex.anisotropy = 8
//   tex.repeat.set(3.5, 2.3)
//   tex.needsUpdate = true
//   return tex
// }

// /** Soft elliptical ground shadow */
// function makeShadowTexture(): THREE.CanvasTexture {
//   const size = 256
//   const c = document.createElement('canvas')
//   c.width = c.height = size
//   const g = c.getContext('2d')!
//   const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
//   grad.addColorStop(0, 'rgba(48,62,78,0.55)')
//   grad.addColorStop(0.45, 'rgba(48,62,78,0.22)')
//   grad.addColorStop(1, 'rgba(48,62,78,0)')
//   g.fillStyle = grad
//   g.fillRect(0, 0, size, size)
//   const tex = new THREE.CanvasTexture(c)
//   tex.colorSpace = THREE.SRGBColorSpace
//   return tex
// }

// /** Letter-spaced text (ctx.letterSpacing is not supported everywhere) */
// function drawSpaced(
//   g: CanvasRenderingContext2D,
//   text: string,
//   cx: number,
//   y: number,
//   spacing: number,
// ) {
//   const widths = [...text].map((ch) => g.measureText(ch).width)
//   const total = widths.reduce((a, b) => a + b, 0) + spacing * (text.length - 1)
//   let x = cx - total / 2
//   const prevAlign = g.textAlign
//   g.textAlign = 'left'
//   ;[...text].forEach((ch, i) => {
//     g.fillText(ch, x, y)
//     x += widths[i] + spacing
//   })
//   g.textAlign = prevAlign
// }

// /** Simple butterfly mark, used until a real logo file is supplied */
// function drawButterfly(g: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
//   g.save()
//   g.translate(cx, cy)
//   g.scale(s, s)
//   for (const side of [1, -1]) {
//     g.save()
//     g.scale(side, 1)
//     // upper wing
//     g.fillStyle = BLUE
//     g.beginPath()
//     g.moveTo(0.04, -0.02)
//     g.bezierCurveTo(0.12, -0.95, 1.1, -1.05, 1.02, -0.22)
//     g.bezierCurveTo(0.96, 0.18, 0.3, 0.16, 0.04, -0.02)
//     g.fill()
//     // lower wing
//     g.fillStyle = GREEN
//     g.beginPath()
//     g.moveTo(0.04, 0.04)
//     g.bezierCurveTo(0.5, 0.05, 0.8, 0.3, 0.62, 0.62)
//     g.bezierCurveTo(0.42, 0.85, 0.1, 0.55, 0.04, 0.04)
//     g.fill()
//     g.restore()
//   }
//   g.fillStyle = INK
//   g.beginPath()
//   g.ellipse(0, 0.08, 0.035, 0.34, 0, 0, Math.PI * 2)
//   g.fill()
//   g.restore()
// }

// const LABEL_W = 512
// const LABEL_H = 768

// function drawLabel(canvas: HTMLCanvasElement, logo?: HTMLImageElement) {
//   const g = canvas.getContext('2d')!
//   g.clearRect(0, 0, LABEL_W, LABEL_H)
//   g.fillStyle = '#fcfcfa'
//   g.fillRect(0, 0, LABEL_W, LABEL_H)

//   // subtle top gradient wash
//   const wash = g.createLinearGradient(0, 0, 0, LABEL_H)
//   wash.addColorStop(0, 'rgba(140,190,214,0.10)')
//   wash.addColorStop(0.45, 'rgba(140,190,214,0)')
//   g.fillStyle = wash
//   g.fillRect(0, 0, LABEL_W, LABEL_H)

//   if (logo && logo.naturalWidth > 0) {
//     const w = 280
//     const h = (logo.naturalHeight / logo.naturalWidth) * w
//     g.drawImage(logo, (LABEL_W - w) / 2, 150, w, Math.min(h, 260))
//   } else {
//     drawButterfly(g, LABEL_W / 2, 250, 120)
//   }

//   g.textAlign = 'center'
//   g.fillStyle = INK
//   g.font = '500 54px Georgia, "Times New Roman", serif'
//   g.fillText('Butterfly', LABEL_W / 2, 458)

//   g.fillStyle = BLUE
//   g.font = '600 25px "Helvetica Neue", Arial, sans-serif'
//   drawSpaced(g, 'FRESH RIDE', LABEL_W / 2, 504, 10)

//   g.strokeStyle = 'rgba(32,37,43,0.18)'
//   g.lineWidth = 1.5
//   g.beginPath()
//   g.moveTo(LABEL_W / 2 - 46, 540)
//   g.lineTo(LABEL_W / 2 + 46, 540)
//   g.stroke()

//   g.fillStyle = 'rgba(32,37,43,0.62)'
//   g.font = '400 21px "Helvetica Neue", Arial, sans-serif'
//   g.fillText('Disposable Bedsheet Kit', LABEL_W / 2, 582)

//   g.fillStyle = 'rgba(32,37,43,0.38)'
//   g.font = '500 14px "Helvetica Neue", Arial, sans-serif'
//   drawSpaced(g, 'DESIGNED FOR TRAVEL · MADE FOR FRESHNESS', LABEL_W / 2, 700, 2.2)

//   // brand accent bar
//   const bar = g.createLinearGradient(0, 0, LABEL_W, 0)
//   bar.addColorStop(0, BLUE)
//   bar.addColorStop(1, GREEN)
//   g.fillStyle = bar
//   g.fillRect(0, LABEL_H - 22, LABEL_W, 22)
// }

// function usePackageLabel(logoSrc?: string) {
//   const texture = useMemo(() => {
//     const canvas = document.createElement('canvas')
//     canvas.width = LABEL_W
//     canvas.height = LABEL_H
//     drawLabel(canvas)
//     const tex = new THREE.CanvasTexture(canvas)
//     tex.colorSpace = THREE.SRGBColorSpace
//     tex.anisotropy = 8
//     return tex
//   }, [])

//   const invalidate = useThree((s) => s.invalidate)

//   useEffect(() => {
//     if (!logoSrc) return
//     let cancelled = false
//     const img = new Image()
//     img.crossOrigin = 'anonymous'
//     img.onload = () => {
//       if (cancelled) return
//       drawLabel(texture.image as HTMLCanvasElement, img)
//       texture.needsUpdate = true
//       invalidate()
//     }
//     img.src = logoSrc
//     return () => {
//       cancelled = true
//     }
//   }, [logoSrc, texture, invalidate])

//   useEffect(() => () => texture.dispose(), [texture])
//   return texture
// }

// /* ═══════════════════════════════════════════════════════════════
//    Time keeper — one clock for the whole scene.
//    Clamped so a paused / throttled tab never makes the intro jump.
//    ═══════════════════════════════════════════════════════════════ */

// function TimeKeeper({ time, still }: { time: TimeRef; still: boolean }) {
//   useFrame((_, delta) => {
//     if (still) return
//     time.current += Math.min(delta, 0.05)
//   })
//   return null
// }

// /** Reduced-motion mode renders on demand; nudge a few frames so textures/env settle. */
// function StillInvalidator({ still }: { still: boolean }) {
//   const invalidate = useThree((s) => s.invalidate)
//   useEffect(() => {
//     if (!still) return
//     const ids = [50, 250, 800, 1800].map((ms) => window.setTimeout(invalidate, ms))
//     return () => ids.forEach((id) => window.clearTimeout(id))
//   }, [still, invalidate])
//   return null
// }

// /* ═══════════════════════════════════════════════════════════════
//    Camera — dolly in, then a very slow orbit. Framing adapts to the
//    canvas aspect so the product is never cropped on narrow screens.
//    ═══════════════════════════════════════════════════════════════ */

// function CameraRig({
//   time,
//   still,
//   parallax,
// }: {
//   time: TimeRef
//   still: boolean
//   parallax: boolean
// }) {
//   const target = useMemo(() => new THREE.Vector3(0.05, 0.02, 0.2), [])

//   useFrame((state, delta) => {
//     const cam = state.camera as THREE.PerspectiveCamera
//     const t = time.current
//     const aspect = state.size.width / Math.max(1, state.size.height)

//     const vFov = THREE.MathUtils.degToRad(cam.fov)
//     const needWidth = 4.8
//     const baseDist = Math.max(4.8, needWidth / (2 * Math.tan(vFov / 2) * aspect))

//     const dolly = still ? 1 : 1 + 0.14 * (1 - easeOutCubic(seg(t, 0, 5.5)))
//     const dist = baseDist * dolly

//     const orbit = still ? 0.12 : 0.12 + Math.sin(t * 0.11) * 0.17
//     const px = parallax && !still ? state.pointer.x * 0.12 : 0
//     const py = parallax && !still ? state.pointer.y * 0.06 : 0

//     const tx = Math.sin(orbit + px) * dist
//     const tz = Math.cos(orbit + px) * dist
//     const ty = 0.85 + dist * 0.07 + py + (still ? 0 : Math.sin(t * 0.09) * 0.04)

//     if (still) {
//       cam.position.set(tx, ty, tz)
//     } else {
//       cam.position.x = THREE.MathUtils.damp(cam.position.x, tx, 3, delta)
//       cam.position.y = THREE.MathUtils.damp(cam.position.y, ty, 3, delta)
//       cam.position.z = THREE.MathUtils.damp(cam.position.z, tz, 3, delta)
//     }
//     cam.lookAt(target)
//   })
//   return null
// }

// /* ═══════════════════════════════════════════════════════════════
//    The disposable sheet

//    The sheet is a plane in the XZ plane. In the vertex shader its X
//    coordinate is "folded" into PANELS pleats whose angle opens from
//    ~70° to almost flat (uOpen 0 → 1). Per-pleat irregularity, a soft
//    arch, fine wrinkles and travelling waves are layered on top, and
//    normals are derived analytically so lighting follows every fold.
//    ═══════════════════════════════════════════════════════════════ */

// const HALF_W = SHEET_W / 2
// const HALF_D = SHEET_D / 2
// const PANEL_LEN = SHEET_W / PANELS

// const SHEET_GLSL = /* glsl */ `
// uniform float uOpen;
// uniform float uTime;
// uniform float uMotion;

// float frHash(float n) { return fract(sin(n * 127.1) * 43758.5453); }

// vec3 sheetRaw(vec2 p) {
//   float s = p.x + ${glf(HALF_W)};
//   float x = 0.0;
//   float y = 0.0;
//   float xt = 0.0;
//   for (int i = 0; i < ${PANELS}; i++) {
//     float fi = float(i);
//     float segLen = clamp(s - fi * ${glf(PANEL_LEN)}, 0.0, ${glf(PANEL_LEN)});
//     float h = frHash(fi + 3.7);
//     float closedA = 1.15 + 0.2 * h;
//     float openA = 0.04 + 0.05 * h;
//     float ang = mix(closedA, openA, uOpen);
//     float dir = mod(fi, 2.0) < 0.5 ? 1.0 : -1.0;
//     x += segLen * cos(ang);
//     y += dir * segLen * sin(ang);
//     xt += ${glf(PANEL_LEN)} * cos(ang);
//   }
//   x -= xt * 0.5;
//   y -= 0.22 * (1.0 - uOpen);

//   float nx = p.x / ${glf(HALF_W)};
//   float nz = p.y / ${glf(HALF_D)};

//   // soft arch across the depth once it opens
//   y += 0.16 * (1.0 - nz * nz) * uOpen;

//   // fine irregular wrinkles
//   y += sin(p.x * 7.0 + p.y * 3.1 + 1.3) * sin(p.y * 5.3 - p.x * 2.1) * 0.012 * (0.4 + 0.6 * uOpen);

//   // gentle waves travelling along the sheet, stronger toward the free end
//   float freeEnd = 0.35 + 0.65 * (nx * 0.5 + 0.5);
//   y += sin(p.x * 2.3 - uTime * 0.8) * 0.035 * freeEnd * uOpen * uMotion;
//   y += sin(p.y * 3.1 + p.x * 1.1 + uTime * 0.6) * 0.018 * uOpen * uMotion;

//   // corner flutter on the free edge
//   float edge = nz * nz * max(nx, 0.0) * max(nx, 0.0);
//   y += edge * 0.07 * sin(uTime * 0.9 + p.y * 2.0) * uOpen * uMotion;

//   return vec3(x, y, p.y);
// }

// // 3-tap blur along the fold axis: rounds the creases so they read as fabric, not paper
// vec3 sheetPos(vec2 p) {
//   float w = 0.09;
//   return 0.25 * sheetRaw(p - vec2(w, 0.0)) + 0.5 * sheetRaw(p) + 0.25 * sheetRaw(p + vec2(w, 0.0));
// }

// vec3 sheetNormal(vec2 p) {
//   float e = 0.01;
//   vec3 c = sheetPos(p);
//   vec3 dx = sheetPos(p + vec2(e, 0.0)) - c;
//   vec3 dz = sheetPos(p + vec2(0.0, e)) - c;
//   return normalize(cross(dz, dx));
// }
// `

// function NonwovenSheet({
//   time,
//   still,
//   lowPower,
// }: {
//   time: TimeRef
//   still: boolean
//   lowPower: boolean
// }) {
//   const group = useRef<THREE.Group>(null!)

//   const geometry = useMemo(() => {
//     const g = new THREE.PlaneGeometry(SHEET_W, SHEET_D, lowPower ? 96 : 168, lowPower ? 28 : 48)
//     g.rotateX(-Math.PI / 2)
//     return g
//   }, [lowPower])

//   const texture = useMemo(() => makeNonwovenTexture(lowPower ? 256 : 512), [lowPower])

//   const uniforms = useMemo(
//     () => ({
//       uOpen: { value: 0 },
//       uTime: { value: 0 },
//       uMotion: { value: still ? 0 : 1 },
//     }),
//     [still],
//   )

//   const onBeforeCompile = useMemo(
//     () => (shader: { vertexShader: string; uniforms: Record<string, THREE.IUniform> }) => {
//       shader.uniforms.uOpen = uniforms.uOpen
//       shader.uniforms.uTime = uniforms.uTime
//       shader.uniforms.uMotion = uniforms.uMotion
//       shader.vertexShader = shader.vertexShader
//         .replace('#include <common>', `#include <common>\n${SHEET_GLSL}`)
//         .replace(
//           '#include <beginnormal_vertex>',
//           '#include <beginnormal_vertex>\nobjectNormal = sheetNormal(position.xz);',
//         )
//         .replace(
//           '#include <begin_vertex>',
//           '#include <begin_vertex>\ntransformed = sheetPos(position.xz);',
//         )
//     },
//     [uniforms],
//   )

//   useEffect(
//     () => () => {
//       geometry.dispose()
//       texture.dispose()
//     },
//     [geometry, texture],
//   )

//   useFrame(() => {
//     const t = time.current
//     const g = group.current
//     if (!g) return

//     const enter = easeOutCubic(seg(t, T_SHEET_IN.start, T_SHEET_IN.dur))
//     const open = still ? STILL_OPEN : easeInOutCubic(seg(t, T_UNFOLD.start, T_UNFOLD.dur))

//     uniforms.uOpen.value = open
//     uniforms.uTime.value = t

//     const bob = still ? 0 : Math.sin(t * 0.5) * 0.025
//     g.position.set(0.42, 0.14 + bob - (1 - enter) * 0.35, 0)
//     g.rotation.set(0.4, -0.52 + (still ? 0 : Math.sin(t * 0.14) * 0.04), 0.05)
//     g.scale.setScalar(0.92 + 0.08 * enter)
//   })

//   return (
//     <group ref={group}>
//       <mesh geometry={geometry} frustumCulled={false}>
//         <meshPhysicalMaterial
//           color="#f7f3ea"
//           map={texture}
//           bumpMap={texture}
//           bumpScale={2.2}
//           roughness={0.95}
//           metalness={0}
//           side={THREE.DoubleSide}
//           sheen={0.6}
//           sheenRoughness={0.65}
//           sheenColor="#ffffff"
//           envMapIntensity={0.5}
//           onBeforeCompile={onBeforeCompile}
//           customProgramCacheKey={() => 'fresh-ride-nonwoven-sheet-v1'}
//         />
//       </mesh>
//     </group>
//   )
// }

// /* ═══════════════════════════════════════════════════════════════
//    Fresh Ride package — minimal white box, silver foil band,
//    printed label (butterfly mark + wordmark, or the real logo).
//    ═══════════════════════════════════════════════════════════════ */

// function FreshRidePackage({
//   time,
//   still,
//   logoSrc,
// }: {
//   time: TimeRef
//   still: boolean
//   logoSrc?: string
// }) {
//   const group = useRef<THREE.Group>(null!)
//   const label = usePackageLabel(logoSrc)

//   useFrame(() => {
//     const g = group.current
//     if (!g) return
//     const t = time.current
//     const enter = easeOutCubic(seg(t, T_PACKAGE_IN.start, T_PACKAGE_IN.dur))
//     const bob = still ? 0 : Math.sin(t * 0.42 + 1.2) * 0.02
//     g.position.set(-1.5, -0.3 + bob + (1 - enter) * 0.4, 0.62)
//     g.rotation.set(0.02, 0.42 + (1 - enter) * 0.7 + (still ? 0 : Math.sin(t * 0.13) * 0.03), -0.025)
//     g.scale.setScalar(0.88 + 0.12 * enter)
//   })

//   const W = 0.62
//   const H = 0.9
//   const D = 0.17

//   return (
//     <group ref={group}>
//       <RoundedBox args={[W, H, D]} radius={0.028} smoothness={4}>
//         <meshPhysicalMaterial
//           color="#fbfbf9"
//           roughness={0.5}
//           metalness={0}
//           clearcoat={0.35}
//           clearcoatRoughness={0.4}
//         />
//       </RoundedBox>

//       {/* printed label on the front face */}
//       <mesh position={[0, 0, D / 2 + 0.0015]}>
//         <planeGeometry args={[0.56, 0.84]} />
//         <meshStandardMaterial map={label} roughness={0.55} metalness={0} />
//       </mesh>

//       {/* silver foil band */}
//       <mesh position={[0, -H / 2 + 0.2, 0]}>
//         <boxGeometry args={[W + 0.004, 0.018, D + 0.004]} />
//         <meshStandardMaterial color="#d3d8dd" metalness={1} roughness={0.28} envMapIntensity={1.3} />
//       </mesh>
//     </group>
//   )
// }

// /* ═══════════════════════════════════════════════════════════════
//    Soft ground shadow (no shadow maps needed)
//    ═══════════════════════════════════════════════════════════════ */

// function GroundShadow({ time, still }: { time: TimeRef; still: boolean }) {
//   const mesh = useRef<THREE.Mesh>(null!)
//   const matRef = useRef<THREE.MeshBasicMaterial>(null!)
//   const tex = useMemo(() => makeShadowTexture(), [])
//   useEffect(() => () => tex.dispose(), [tex])

//   useFrame(() => {
//     const t = time.current
//     const m = mesh.current
//     if (!m) return
//     const enter = easeOutCubic(seg(t, 0.3, 1.8))
//     const open = still ? STILL_OPEN : easeInOutCubic(seg(t, T_UNFOLD.start, T_UNFOLD.dur))
//     const pulse = still ? 0 : Math.sin(t * 0.5) * 0.04
//     m.scale.set(4.4 + open * 0.8, 2.5 + open * 0.3, 1)
//     if (matRef.current) matRef.current.opacity = (0.34 + open * 0.14 + pulse * 0.5) * enter
//   })

//   return (
//     <mesh ref={mesh} position={[-0.1, -0.95, 0.1]} rotation={[-Math.PI / 2, 0, 0]}>
//       <planeGeometry args={[1, 1]} />
//       <meshBasicMaterial
//         ref={matRef}
//         map={tex}
//         transparent
//         opacity={0}
//         depthWrite={false}
//         toneMapped={false}
//       />
//     </mesh>
//   )
// }


// /* ═══════════════════════════════════════════════════════════════
//    Scene
//    ═══════════════════════════════════════════════════════════════ */

// function Scene({
//   still,
//   lowPower,
//   logoSrc,
// }: {
//   still: boolean
//   lowPower: boolean
//   logoSrc?: string
// }) {
//   const time = useRef<number>(still ? 99 : 0)

//   return (
//     <>
//       <TimeKeeper time={time} still={still} />
//       <StillInvalidator still={still} />
//       <CameraRig time={time} still={still} parallax={!lowPower} />

//       {/* Three-point lighting: soft warm key, cool fill, subtle blue rim */}
//       <ambientLight intensity={0.22} />
//       <directionalLight position={[4.5, 2.6, 3.2]} intensity={2.1} color="#fff3e2" />
//       <directionalLight position={[-4.5, 1.5, 3.5]} intensity={0.4} color="#dfeaff" />
//       <directionalLight position={[-1.5, 3.2, -4.5]} intensity={1.3} color="#cfe6f5" />

//       <GroundShadow time={time} still={still} />
//       <NonwovenSheet time={time} still={still} lowPower={lowPower} />
//       <FreshRidePackage time={time} still={still} logoSrc={logoSrc} />

//       {/* Seamless studio reflections — rendered once, never per frame */}
//       <Environment resolution={128} frames={1}>
//         <Lightformer form="rect" intensity={1.8} position={[0, 5, -3]} scale={[14, 5, 1]} />
//         <Lightformer
//           form="rect"
//           intensity={0.9}
//           position={[-5, 2, 3]}
//           scale={[5, 8, 1]}
//           color="#eef4ff"
//         />
//         <Lightformer
//           form="rect"
//           intensity={0.8}
//           position={[5, 2, 3]}
//           scale={[5, 8, 1]}
//           color="#fff6e6"
//         />
//         <Lightformer
//           form="rect"
//           intensity={0.6}
//           position={[0, -1, 5]}
//           scale={[10, 2, 1]}
//           color="#ffffff"
//         />
//       </Environment>
//     </>
//   )
// }

// /* ═══════════════════════════════════════════════════════════════
//    Public component
//    ═══════════════════════════════════════════════════════════════ */

// export interface HeroScene3DProps {
//   /** prefers-reduced-motion: renders one finished, static frame */
//   reducedMotion?: boolean
//   /** phones / small screens: fewer vertices, lower pixel ratio, no pointer parallax */
//   lowPower?: boolean
//   /** optional real logo (e.g. "/images/logo.png"); printed on the package instead of the drawn mark */
//   logoSrc?: string
// }

// export default function HeroScene3D({
//   reducedMotion = false,
//   lowPower = false,
//   logoSrc,
// }: HeroScene3DProps) {
//   const wrapRef = useRef<HTMLDivElement>(null)
//   const [visible, setVisible] = useState(true)

//   // Pause the render loop whenever the hero is scrolled out of view
//   useEffect(() => {
//     const el = wrapRef.current
//     if (!el || typeof IntersectionObserver === 'undefined') return
//     const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
//       threshold: 0,
//     })
//     io.observe(el)
//     return () => io.disconnect()
//   }, [])

//   const frameloop = reducedMotion ? 'demand' : visible ? 'always' : 'never'

//   return (
//     <div
//       ref={wrapRef}
//       role="img"
//       aria-label="Butterfly Fresh Ride disposable bedsheet unfolding beside its package"
//       style={{ width: '100%', height: '100%' }}
//     >
//       <Canvas
//         frameloop={frameloop}
//         dpr={lowPower ? [1, 1.25] : [1, 1.75]}
//         camera={{ position: [0.6, 1.4, 6.6], fov: 30, near: 0.1, far: 50 }}
//         gl={{ alpha: true, antialias: true, powerPreference: 'default' }}
//         onCreated={({ gl }) => {
//           gl.toneMapping = THREE.ACESFilmicToneMapping
//           gl.toneMappingExposure = 0.95
//         }}
//         style={{ background: 'transparent', touchAction: 'pan-y' }}
//       >
//         <Scene still={reducedMotion} lowPower={lowPower} logoSrc={logoSrc} />
//       </Canvas>
//     </div>
//   )
// }



































































'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Lightformer, OrbitControls, RoundedBox } from '@react-three/drei'

/* ═══════════════════════════════════════════════════════════════
   Butterfly Fresh Ride — "A Fresh Journey Begins Here."

   One premium sleeper-bus berth (corner cabin, quilted walls,
   charcoal base, steel trim, warm reading lamp).

   Timeline
     1. Scene fades in, camera dollies gently forward
     2. Fresh Ride package drops in beside the berth
     3. Its lid lifts and floats away
     4. A pleated nonwoven sheet rises out of the package, unfolds
        in mid-air and drifts over the berth
     5. It settles, draping over the mattress edge; pillow drops in
     6. Logo is revealed on the package, one soft light sweep passes
     7. Idle: tiny sheet movement, very slow camera orbit

   Performance
     • Sheet pleat / unfold / settle / wave runs in the vertex shader
     • One clock, one render loop; pauses off screen
     • reduced motion → single finished frame (frameloop="demand")
     • lowPower (phones/tablets) → fewer vertices, smaller textures,
       no pointer parallax
   ═══════════════════════════════════════════════════════════════ */

/* ───────── Brand + layout constants ───────── */

const GOLD = '#C8A96E'
const GREEN = '#8FB99A'
const INK = '#20252B'
/** Put the logo here (public/images/butterfly-logo.png, transparent PNG). Falls back to a drawn mark. */
const DEFAULT_LOGO = '/images/butterfly-logo.png'

/* Berth geometry (world units). Mattress top surface is y = 0. */
const MAT_W = 3.0
const MAT_H = 0.22
const MAT_D = 1.36
const BASE_W = 3.1
const BASE_H = 0.58
const BASE_D = 1.46
const FLOOR_Y = -0.8

/* Sheet geometry. Slightly larger than the mattress in depth/front, tucked at the wall side. */
const SHEET_W = 3.1
const SHEET_D = 1.5
const PANELS = 6
const SHEET_OFF = { x: 0.05, z: 0.07 } // sheet-centre offset relative to mattress centre
const OVER_X = MAT_W / 2 - SHEET_OFF.x // local x where sheet leaves the mattress (right end)
const OVER_Z = MAT_D / 2 - SHEET_OFF.z // local z where sheet leaves the mattress (front)

/* Package geometry + placement */
const PW = 1.0
const PH = 0.34
const PD = 0.7
const PWALL = 0.025
const PKG_LID_H = 0.085
const PKG_POS = new THREE.Vector3(0.85, FLOOR_Y + PH / 2, 1.55)
const PKG_YAW = 0.5

/** Seconds on the intro timeline */
const T_BOX_IN = { start: 0.5, dur: 1.4 }
const T_LID = { start: 1.9, dur: 1.5 }
const T_FLIGHT = { start: 3.3, dur: 2.8 }
const T_SETTLE = { start: 5.6, dur: 2.2 }
const T_BRAND = { start: 7.0, dur: 1.6 }
const T_PILLOW = { start: 7.4, dur: 2.9 }
const T_BLANKET = { start: 8.3, dur: 4.2 }
const T_LID_CLOSE = { start: 13.0, dur: 1.3 }
const T_SWEEP = { start: 7.0, dur: 2.8 }

type TimeRef = { current: number }

/* ───────── Small helpers ───────── */

const clamp01 = (v: number) => Math.max(0, Math.min(1, v))
const seg = (time: number, start: number, dur: number) => clamp01((time - start) / dur)
const easeInOut = (t: number) => t * t * (3 - 2 * t)
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
const lerp = (a: number, b: number, t: number) => a + (b - a) * t

/** GLSL needs "3.0", never "3" */
const glf = (n: number) => (Number.isInteger(n) ? n.toFixed(1) : String(n))

/* ═══════════════════════════════════════════════════════════════
   Canvas drawing — all textures are generated at runtime
   ═══════════════════════════════════════════════════════════════ */

type Draw = (
  g: CanvasRenderingContext2D,
  w: number,
  h: number,
  logo: HTMLImageElement | null,
) => void

function spacedWidth(g: CanvasRenderingContext2D, text: string, spacing: number) {
  const widths = [...text].map((ch) => g.measureText(ch).width)
  return widths.reduce((a, b) => a + b, 0) + spacing * (text.length - 1)
}

/** Letter-spaced text, centred on cx (ctx.letterSpacing is not supported everywhere) */
function drawSpaced(
  g: CanvasRenderingContext2D,
  text: string,
  cx: number,
  y: number,
  spacing: number,
) {
  const widths = [...text].map((ch) => g.measureText(ch).width)
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (text.length - 1)
  let x = cx - total / 2
  const prevAlign = g.textAlign
  g.textAlign = 'left'
  ;[...text].forEach((ch, i) => {
    g.fillText(ch, x, y)
    x += widths[i] + spacing
  })
  g.textAlign = prevAlign
}

/** Fallback butterfly mark, used only until/unless the real logo loads */
function drawButterfly(g: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
  g.save()
  g.translate(cx, cy)
  g.scale(s, s)
  for (const side of [1, -1]) {
    g.save()
    g.scale(side, 1)
    g.fillStyle = GOLD
    g.beginPath()
    g.moveTo(0.04, -0.02)
    g.bezierCurveTo(0.12, -0.95, 1.1, -1.05, 1.02, -0.22)
    g.bezierCurveTo(0.96, 0.18, 0.3, 0.16, 0.04, -0.02)
    g.fill()
    g.fillStyle = GREEN
    g.beginPath()
    g.moveTo(0.04, 0.04)
    g.bezierCurveTo(0.5, 0.05, 0.8, 0.3, 0.62, 0.62)
    g.bezierCurveTo(0.42, 0.85, 0.1, 0.55, 0.04, 0.04)
    g.fill()
    g.restore()
  }
  g.restore()
}

function drawMark(
  g: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  size: number,
  logo: HTMLImageElement | null,
) {
  if (logo && logo.naturalWidth > 0) {
    const h = size * (logo.naturalHeight / logo.naturalWidth)
    g.drawImage(logo, cx - size / 2, cy - h / 2, size, h)
  } else {
    drawButterfly(g, cx, cy, size * 0.42)
  }
}

/** Lid top, base print: ivory board with a fine gold frame (no logo — revealed later) */
const drawLidBase: Draw = (g, w, h) => {
  g.fillStyle = '#f8f6f0'
  g.fillRect(0, 0, w, h)
  const v = g.createRadialGradient(w / 2, h / 2, h * 0.1, w / 2, h / 2, w * 0.7)
  v.addColorStop(0, 'rgba(255,255,255,0.7)')
  v.addColorStop(1, 'rgba(200,169,110,0.10)')
  g.fillStyle = v
  g.fillRect(0, 0, w, h)
  g.strokeStyle = 'rgba(200,169,110,0.85)'
  g.lineWidth = 3
  g.strokeRect(36, 36, w - 72, h - 72)
  g.lineWidth = 1
  g.strokeRect(50, 50, w - 100, h - 100)
}

/** Lid top, logo layer (transparent) */
const drawLidLogo: Draw = (g, w, h, logo) => {
  g.clearRect(0, 0, w, h)
  drawMark(g, w / 2, h * 0.36, 290, logo)
  g.textAlign = 'center'
  g.fillStyle = INK
  g.font = '500 70px Georgia, "Times New Roman", serif'
  g.fillText('Butterfly', w / 2, h * 0.67)
  g.fillStyle = GOLD
  g.font = '600 27px "Helvetica Neue", Arial, sans-serif'
  drawSpaced(g, 'FRESH RIDE', w / 2, h * 0.75, 13)
  g.strokeStyle = 'rgba(32,37,43,0.18)'
  g.lineWidth = 1.5
  g.beginPath()
  g.moveTo(w / 2 - 70, h * 0.8)
  g.lineTo(w / 2 + 70, h * 0.8)
  g.stroke()
  g.fillStyle = 'rgba(32,37,43,0.5)'
  g.font = '500 17px "Helvetica Neue", Arial, sans-serif'
  drawSpaced(g, 'DESIGNED FOR TRAVEL · MADE FOR FRESHNESS', w / 2, h * 0.88, 3)
}

/** Front wall label (transparent): logo left, wordmark right */
const drawFrontLogo: Draw = (g, w, h, logo) => {
  g.clearRect(0, 0, w, h)
  drawMark(g, w * 0.2, h / 2, 230, logo)
  const x0 = w * 0.36
  g.textAlign = 'left'
  g.fillStyle = INK
  g.font = '500 96px Georgia, "Times New Roman", serif'
  g.fillText('Butterfly', x0, h * 0.5)
  g.fillStyle = GOLD
  g.font = '600 32px "Helvetica Neue", Arial, sans-serif'
  const sw = spacedWidth(g, 'FRESH RIDE', 12)
  drawSpaced(g, 'FRESH RIDE', x0 + sw / 2, h * 0.74, 12)
}

/** Gold → green accent stripe along the base of the front wall */
const drawStripe: Draw = (g, w, h) => {
  const grad = g.createLinearGradient(0, 0, w, 0)
  grad.addColorStop(0, GOLD)
  grad.addColorStop(1, GREEN)
  g.fillStyle = grad
  g.fillRect(0, 0, w, h)
}

/** Soft pastel tissue lining the package */
const drawTissue: Draw = (g, w, h) => {
  const grad = g.createLinearGradient(0, 0, w, h)
  grad.addColorStop(0, '#F5F7F4')
  grad.addColorStop(1, '#E8EEF0')
  g.fillStyle = grad
  g.fillRect(0, 0, w, h)
  g.lineWidth = 2
  for (let i = 0; i < 12; i++) {
    const x = (i / 12) * w + Math.sin(i * 12.9898) * 24
    g.strokeStyle = i % 2 ? 'rgba(255,255,255,0.45)' : 'rgba(120,150,160,0.10)'
    g.beginPath()
    g.moveTo(x, 0)
    g.bezierCurveTo(x + 30, h * 0.3, x - 30, h * 0.6, x + 16, h)
    g.stroke()
  }
}

function useLogoImage(src?: string) {
  const [img, setImg] = useState<HTMLImageElement | null>(null)
  useEffect(() => {
    if (!src) return
    let cancelled = false
    const im = new Image()
    im.onload = () => {
      if (!cancelled) setImg(im)
    }
    im.src = src
    return () => {
      cancelled = true
    }
  }, [src])
  return img
}

/** Canvas texture that redraws itself once the logo has loaded */
function useCanvasTexture(w: number, h: number, draw: Draw, logo: HTMLImageElement | null) {
  const invalidate = useThree((s) => s.invalidate)

  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    draw(c.getContext('2d')!, w, h, null)
    const t = new THREE.CanvasTexture(c)
    t.colorSpace = THREE.SRGBColorSpace
    t.anisotropy = 16
    return t
  }, [w, h, draw])

  useEffect(() => {
    if (!logo) return
    const c = tex.image as HTMLCanvasElement
    const g = c.getContext('2d')!
    g.clearRect(0, 0, w, h)
    draw(g, w, h, logo)
    tex.needsUpdate = true
    invalidate()
  }, [logo, tex, w, h, draw, invalidate])

  useEffect(() => () => tex.dispose(), [tex])
  return tex
}

/** Tileable spunbond-style fibre texture: random fine fibres + soft cloudiness. */
function makeNonwovenTexture(size: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = size
  const g = canvas.getContext('2d')!

  let seed = 20261110
  const rnd = () => {
    seed = (seed * 16807) % 2147483647
    return (seed - 1) / 2147483646
  }

  g.fillStyle = '#f3efe7'
  g.fillRect(0, 0, size, size)

  for (let i = 0; i < 120; i++) {
    const x = rnd() * size
    const y = rnd() * size
    const r = size * (0.06 + rnd() * 0.14)
    const light = rnd() < 0.5
    for (const ox of [-size, 0, size]) {
      for (const oy of [-size, 0, size]) {
        const grad = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r)
        grad.addColorStop(0, light ? 'rgba(255,255,255,0.10)' : 'rgba(150,140,120,0.06)')
        grad.addColorStop(1, 'rgba(255,255,255,0)')
        g.fillStyle = grad
        g.fillRect(x + ox - r, y + oy - r, r * 2, r * 2)
      }
    }
  }

  const scale = size / 512
  const fibreCount = Math.round((size * size) / 95)
  g.lineCap = 'round'
  for (let i = 0; i < fibreCount; i++) {
    const x = rnd() * size
    const y = rnd() * size
    const a = rnd() * Math.PI
    const len = size * (0.035 + rnd() * 0.09)
    const dx = Math.cos(a) * len
    const dy = Math.sin(a) * len
    const light = rnd() < 0.55
    g.strokeStyle = light
      ? `rgba(255,255,255,${0.35 + rnd() * 0.4})`
      : `rgba(120,112,98,${0.06 + rnd() * 0.12})`
    g.lineWidth = (0.5 + rnd() * 1.1) * scale
    for (const ox of [-size, 0, size]) {
      for (const oy of [-size, 0, size]) {
        const x0 = x + ox
        const y0 = y + oy
        if (x0 < -len || x0 > size + len || y0 < -len || y0 > size + len) continue
        g.beginPath()
        g.moveTo(x0, y0)
        g.quadraticCurveTo(x0 + dx * 0.5 + dy * 0.12, y0 + dy * 0.5 - dx * 0.12, x0 + dx, y0 + dy)
        g.stroke()
      }
    }
  }

  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 8
  tex.repeat.set(3.5, 2.3)
  tex.needsUpdate = true
  return tex
}

/** One vertical quilted channel (tiles horizontally) for the cabin wall upholstery */
function makeQuiltTexture(repeatX: number): THREE.CanvasTexture {
  const size = 256
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  const lg = g.createLinearGradient(0, 0, size, 0)
  lg.addColorStop(0, '#cfc5b4')
  lg.addColorStop(0.5, '#e6dfd2')
  lg.addColorStop(1, '#cfc5b4')
  g.fillStyle = lg
  g.fillRect(0, 0, size, size)
  g.fillStyle = 'rgba(70,60,48,0.5)'
  g.fillRect(0, 0, 2, size)
  g.fillRect(size - 2, 0, 2, size)
  g.fillStyle = 'rgba(70,60,48,0.35)'
  for (let y = 6; y < size; y += 14) {
    g.fillRect(4, y, 3, 5)
    g.fillRect(size - 7, y, 3, 5)
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  t.repeat.set(repeatX, 1)
  return t
}

/** Diamond-tufted upholstery (headboard / bolster): seams + buttons, tiles seamlessly */
function makeDiamondTexture(rx: number, ry: number): THREE.CanvasTexture {
  const size = 256
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  g.fillStyle = '#b3a999'
  g.fillRect(0, 0, size, size)
  // puffy diamond centres
  for (const [x, y] of [
    [64, 0],
    [192, 0],
    [0, 64],
    [128, 64],
    [256, 64],
    [64, 128],
    [192, 128],
    [0, 192],
    [128, 192],
    [256, 192],
    [64, 256],
    [192, 256],
  ]) {
    const r = g.createRadialGradient(x, y, 0, x, y, 72)
    r.addColorStop(0, 'rgba(255,248,235,0.55)')
    r.addColorStop(1, 'rgba(255,248,235,0)')
    g.fillStyle = r
    g.fillRect(x - 72, y - 72, 144, 144)
  }
  g.strokeStyle = 'rgba(55,47,38,0.65)'
  g.lineWidth = 2.5
  for (let n = -2; n <= 4; n++) {
    g.beginPath()
    g.moveTo(n * 128 - 256, -256 + 0)
    g.lineTo(n * 128 + 256, 256 + 0)
    g.stroke()
    g.beginPath()
    g.moveTo(n * 128 + 256, -256)
    g.lineTo(n * 128 - 256, 256)
    g.stroke()
  }
  for (let i = 0; i <= 2; i++) {
    for (let j = 0; j <= 2; j++) {
      for (const [x, y] of [
        [i * 128, j * 128],
        [i * 128 + 64, j * 128 + 64],
      ]) {
        g.fillStyle = 'rgba(50,43,35,0.85)'
        g.beginPath()
        g.arc(x, y, 6, 0, Math.PI * 2)
        g.fill()
        g.fillStyle = 'rgba(255,245,230,0.5)'
        g.beginPath()
        g.arc(x - 1.5, y - 1.5, 2, 0, Math.PI * 2)
        g.fill()
      }
    }
  }
  const t = new THREE.CanvasTexture(c)
  t.wrapS = t.wrapT = THREE.RepeatWrapping
  t.colorSpace = THREE.SRGBColorSpace
  t.anisotropy = 4
  t.repeat.set(rx, ry)
  return t
}

/** Soft, out-of-focus daylight for the berth window */
function makeWindowTexture(): THREE.CanvasTexture {
  const w = 256
  const h = 160
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  const g = c.getContext('2d')!
  const sky = g.createLinearGradient(0, 0, 0, h)
  sky.addColorStop(0, '#cfe6f4')
  sky.addColorStop(0.6, '#eaf3f4')
  sky.addColorStop(1, '#f5efe2')
  g.fillStyle = sky
  g.fillRect(0, 0, w, h)
  const blobs: [number, number, number, string][] = [
    [30, 128, 46, 'rgba(143,195,168,0.45)'],
    [95, 140, 54, 'rgba(120,175,150,0.4)'],
    [165, 132, 50, 'rgba(143,195,168,0.42)'],
    [230, 138, 48, 'rgba(120,175,150,0.4)'],
    [70, 40, 40, 'rgba(255,255,255,0.7)'],
    [190, 56, 34, 'rgba(255,255,255,0.55)'],
  ]
  for (const [x, y, r, col] of blobs) {
    const gr = g.createRadialGradient(x, y, 0, x, y, r)
    gr.addColorStop(0, col)
    gr.addColorStop(1, 'rgba(255,255,255,0)')
    g.fillStyle = gr
    g.fillRect(x - r, y - r, r * 2, r * 2)
  }
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/** Soft radial glow (white centre → transparent), tinted by the material colour */
function makeGlowTexture(): THREE.CanvasTexture {
  const size = 128
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grad.addColorStop(0, 'rgba(255,255,255,1)')
  grad.addColorStop(0.35, 'rgba(255,255,255,0.3)')
  grad.addColorStop(1, 'rgba(255,255,255,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, size, size)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/** Soft elliptical ground shadow */
function makeShadowTexture(): THREE.CanvasTexture {
  const size = 256
  const c = document.createElement('canvas')
  c.width = c.height = size
  const g = c.getContext('2d')!
  const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
  grad.addColorStop(0, 'rgba(48,62,78,0.55)')
  grad.addColorStop(0.45, 'rgba(48,62,78,0.22)')
  grad.addColorStop(1, 'rgba(48,62,78,0)')
  g.fillStyle = grad
  g.fillRect(0, 0, size, size)
  const t = new THREE.CanvasTexture(c)
  t.colorSpace = THREE.SRGBColorSpace
  return t
}

/* ═══════════════════════════════════════════════════════════════
   Clock, still-frame helper, intro fade
   ═══════════════════════════════════════════════════════════════ */

function TimeKeeper({ time, still }: { time: TimeRef; still: boolean }) {
  useFrame((_, delta) => {
    if (still) return
    time.current += Math.min(delta, 0.05)
  })
  return null
}

/** Reduced-motion mode renders on demand; nudge a few frames so textures/env settle. */
function StillInvalidator({ still }: { still: boolean }) {
  const invalidate = useThree((s) => s.invalidate)
  useEffect(() => {
    if (!still) return
    const ids = [50, 250, 800, 1800, 3000].map((ms) => window.setTimeout(invalidate, ms))
    return () => ids.forEach((id) => window.clearTimeout(id))
  }, [still, invalidate])
  return null
}

/* Set responsive initial framing, then leave all camera movement to OrbitControls. */
function CameraRig() {
  const target = useMemo(() => new THREE.Vector3(0.1, 0.12, 0.35), [])
  const { camera, size } = useThree()

  useEffect(() => {
    const cam = camera as THREE.PerspectiveCamera
    const aspect = size.width / Math.max(1, size.height)

    const half = Math.tan(THREE.MathUtils.degToRad(cam.fov) / 2)
    const needWidth = 5.4
    const needHeight = 4.3
    const baseDist = Math.max(5, needWidth / (2 * half * aspect), needHeight / (2 * half))
    const orbit = 0.62

    cam.position.set(Math.sin(orbit) * baseDist, 1.6 + baseDist * 0.14, Math.cos(orbit) * baseDist)
    cam.lookAt(target)
    cam.updateProjectionMatrix()
  }, [camera, size.width, size.height, target])

  return null
}

/* ═══════════════════════════════════════════════════════════════
   The disposable sheet

   A plane in XZ. In the vertex shader its X coordinate is folded
   into PANELS pleats whose angle opens from ~70° to almost flat
   (uOpen 0 → 1). uSettle (0 → 1) flattens the arch, adds creases
   and drapes the front / right edges over the mattress. Normals
   are derived analytically so lighting follows every fold.
   ═══════════════════════════════════════════════════════════════ */

const HALF_W = SHEET_W / 2
const HALF_D = SHEET_D / 2
const PANEL_LEN = SHEET_W / PANELS

const SHEET_GLSL = /* glsl */ `
uniform float uOpen;
uniform float uSettle;
uniform float uTime;
uniform float uMotion;

float frHash(float n) { return fract(sin(n * 127.1) * 43758.5453); }

vec3 sheetRaw(vec2 p) {
  float s = p.x + ${glf(HALF_W)};
  float x = 0.0;
  float y = 0.0;
  float xt = 0.0;
  float zig = mix(1.0, 0.5, uSettle);
  for (int i = 0; i < ${PANELS}; i++) {
    float fi = float(i);
    float segLen = clamp(s - fi * ${glf(PANEL_LEN)}, 0.0, ${glf(PANEL_LEN)});
    float h = frHash(fi + 3.7);
    float closedA = 1.15 + 0.2 * h;
    float openA = 0.04 + 0.05 * h;
    float ang = mix(closedA, openA, uOpen);
    float dir = mod(fi, 2.0) < 0.5 ? 1.0 : -1.0;
    x += segLen * cos(ang);
    y += dir * segLen * sin(ang) * zig;
    xt += ${glf(PANEL_LEN)} * cos(ang);
  }
  x -= xt * 0.5;
  y -= 0.22 * (1.0 - uOpen);

  float nx = p.x / ${glf(HALF_W)};
  float nz = p.y / ${glf(HALF_D)};

  // soft arch across the depth while it floats; flattens as it settles
  y += 0.16 * (1.0 - nz * nz) * uOpen * (1.0 - uSettle);

  // fine irregular wrinkles (stronger once it lies on the mattress)
  float wr = 0.012 * (0.4 + 0.6 * uOpen) * (1.0 + 0.9 * uSettle);
  y += sin(p.x * 7.0 + p.y * 3.1 + 1.3) * sin(p.y * 5.3 - p.x * 2.1) * wr;

  // a few long, soft creases left behind by the folding
  y += uSettle * 0.012 * sin(p.x * 3.3 + sin(p.y * 2.2) * 1.4) * (0.5 + 0.5 * sin(p.y * 4.1 - 0.6));

  // lightweight motion; almost still after settling
  float mot = uMotion * (1.0 - 0.85 * uSettle);
  float freeEnd = 0.35 + 0.65 * (nx * 0.5 + 0.5);
  y += sin(p.x * 2.3 - uTime * 0.8) * 0.035 * freeEnd * uOpen * mot;
  y += sin(p.y * 3.1 + p.x * 1.1 + uTime * 0.6) * 0.018 * uOpen * mot;
  float edge = nz * nz * max(nx, 0.0) * max(nx, 0.0);
  y += edge * 0.07 * sin(uTime * 0.9 + p.y * 2.0) * uOpen * mot;

  // drape over the front and right edges of the mattress
  float overZ = max(p.y - ${glf(OVER_Z)}, 0.0);
  float overX = max(p.x - ${glf(OVER_X)}, 0.0);
  y -= uSettle * ((1.0 - exp(-overZ * 7.0)) * 0.34 + (1.0 - exp(-overX * 7.0)) * 0.3);

  return vec3(x, y, p.y);
}

// 3-tap blur along the fold axis: rounds the creases so they read as fabric, not paper
vec3 sheetPos(vec2 p) {
  float w = 0.09;
  return 0.25 * sheetRaw(p - vec2(w, 0.0)) + 0.5 * sheetRaw(p) + 0.25 * sheetRaw(p + vec2(w, 0.0));
}

vec3 sheetNormal(vec2 p) {
  float e = 0.01;
  vec3 c = sheetPos(p);
  vec3 dx = sheetPos(p + vec2(e, 0.0)) - c;
  vec3 dz = sheetPos(p + vec2(0.0, e)) - c;
  return normalize(cross(dz, dx));
}
`

function NonwovenSheet({
  time,
  still,
  lowPower,
  texture,
}: {
  time: TimeRef
  still: boolean
  lowPower: boolean
  texture: THREE.Texture
}) {
  const group = useRef<THREE.Group>(null!)

  const geometry = useMemo(() => {
    const g = new THREE.PlaneGeometry(SHEET_W, SHEET_D, lowPower ? 96 : 168, lowPower ? 28 : 48)
    g.rotateX(-Math.PI / 2)
    return g
  }, [lowPower])

  const uniforms = useMemo(
    () => ({
      uOpen: { value: 0 },
      uSettle: { value: 0 },
      uTime: { value: 0 },
      uMotion: { value: still ? 0 : 1 },
    }),
    [still],
  )

  const onBeforeCompile = useMemo(
    () => (shader: { vertexShader: string; uniforms: Record<string, THREE.IUniform> }) => {
      shader.uniforms.uOpen = uniforms.uOpen
      shader.uniforms.uSettle = uniforms.uSettle
      shader.uniforms.uTime = uniforms.uTime
      shader.uniforms.uMotion = uniforms.uMotion
      shader.vertexShader = shader.vertexShader
        .replace('#include <common>', `#include <common>\n${SHEET_GLSL}`)
        .replace(
          '#include <beginnormal_vertex>',
          '#include <beginnormal_vertex>\nobjectNormal = sheetNormal(position.xz);',
        )
        .replace(
          '#include <begin_vertex>',
          '#include <begin_vertex>\ntransformed = sheetPos(position.xz);',
        )
    },
    [uniforms],
  )

  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame(() => {
    const g = group.current
    if (!g) return
    const t = time.current

    const emerge = still ? 1 : easeOutCubic(seg(t, T_LID.start + 0.3, 0.9))
    const fl = still ? 1 : easeInOutCubic(seg(t, T_FLIGHT.start, T_FLIGHT.dur))
    const se = still ? 1 : easeInOutCubic(seg(t, T_SETTLE.start, T_SETTLE.dur))

    uniforms.uOpen.value = still ? 1 : 0.72 * fl + 0.28 * se
    uniforms.uSettle.value = se
    uniforms.uTime.value = t

    g.visible = still || t > T_LID.start + 0.25

    // start: inside the package; hover: above the berth; end: lying on the mattress
    const sx = PKG_POS.x
    const sy = PKG_POS.y + PH / 2 - 0.04
    const sz = PKG_POS.z
    const hx = SHEET_OFF.x
    const hy = 0.62
    const hz = SHEET_OFF.z

    const x = lerp(sx, hx, fl)
    const z = lerp(sz, hz, fl)
    const arc = Math.sin(Math.PI * fl) * 0.85
    const yFlight = lerp(sy, hy, fl) + arc
    const y = lerp(yFlight, 0.025, se)

    const sway = still ? 0 : (1 - se) * Math.sin(t * 0.5) * 0.05
    const yaw = (1 - fl) * PKG_YAW + Math.sin(Math.PI * fl) * 0.25 + sway
    const tiltZ = Math.sin(Math.PI * fl) * 0.3
    const tiltX = (1 - se) * 0.18 * fl

    const startScale = 0.28 * emerge
    const scale = lerp(startScale, 1, fl)

    g.position.set(x, y, z)
    g.rotation.set(tiltX, yaw, tiltZ)
    g.scale.setScalar(Math.max(0.001, scale))
  })

  return (
    <group ref={group}>
      <mesh geometry={geometry} frustumCulled={false}>
        <meshPhysicalMaterial
          color="#f8f4ec"
          map={texture}
          bumpMap={texture}
          bumpScale={2.2}
          roughness={0.95}
          metalness={0}
          side={THREE.DoubleSide}
          sheen={0.4}
          sheenRoughness={0.7}
          sheenColor="#ffffff"
          envMapIntensity={0.5}
          onBeforeCompile={onBeforeCompile}
          customProgramCacheKey={() => 'fresh-ride-berth-sheet-v3'}
        />
      </mesh>
    </group>
  )
}

function makePillowGeometry(width: number, depth: number, height: number) {
  const radialSegments = 12
  const angularSegments = 64
  const verticesPerSurface = 1 + radialSegments * angularSegments
  const positions: number[] = []
  const uvs: number[] = []
  const indices: number[] = []
  const exponent = 5 / 7.5

  const addSurface = (side: 1 | -1) => {
    positions.push(0, side * height * 0.5, 0)
    uvs.push(0.5, 0.5)

    for (let ring = 1; ring <= radialSegments; ring++) {
      const radius = ring / radialSegments
      const y = side * height * 0.5 * Math.pow(Math.max(0, 1 - radius * radius), 0.42)

      for (let segment = 0; segment < angularSegments; segment++) {
        const angle = (segment / angularSegments) * Math.PI * 2
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)
        const x = (width / 2) * Math.sign(cos) * Math.pow(Math.abs(cos), exponent) * radius
        const z = (depth / 2) * Math.sign(sin) * Math.pow(Math.abs(sin), exponent) * radius
        positions.push(x, y, z)
        uvs.push(x / width + 0.5, z / depth + 0.5)
      }
    }
  }

  addSurface(1)
  addSurface(-1)

  const ringVertex = (base: number, ring: number, segment: number) =>
    base + 1 + (ring - 1) * angularSegments + (segment % angularSegments)

  for (const [side, base] of [[1, 0], [-1, verticesPerSurface]] as const) {
    const center = base
    const firstRing = (segment: number) => ringVertex(base, 1, segment)

    for (let segment = 0; segment < angularSegments; segment++) {
      const next = (segment + 1) % angularSegments
      indices.push(
        center,
        ...(side === 1 ? [firstRing(next), firstRing(segment)] : [firstRing(segment), firstRing(next)]),
      )
    }

    for (let ring = 1; ring < radialSegments; ring++) {
      for (let segment = 0; segment < angularSegments; segment++) {
        const next = (segment + 1) % angularSegments
        const inner = ringVertex(base, ring, segment)
        const innerNext = ringVertex(base, ring, next)
        const outer = ringVertex(base, ring + 1, segment)
        const outerNext = ringVertex(base, ring + 1, next)
        indices.push(
          inner,
          ...(side === 1
            ? [innerNext, outerNext, inner, outerNext, outer]
            : [outer, outerNext, innerNext, inner, outer, innerNext]),
        )
      }
    }
  }

  const topEdge = (segment: number) => ringVertex(0, radialSegments, segment)
  const bottomEdge = (segment: number) => ringVertex(verticesPerSurface, radialSegments, segment)
  for (let segment = 0; segment < angularSegments; segment++) {
    const next = (segment + 1) % angularSegments
    indices.push(topEdge(segment), topEdge(next), bottomEdge(segment))
    indices.push(topEdge(next), bottomEdge(next), bottomEdge(segment))
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}

/** Pillow stays on the berth while its protective cover is revealed from the package. */
function Pillow({ texture }: { texture: THREE.Texture }) {
  const geometry = useMemo(() => makePillowGeometry(0.74, 0.5, 0.19), [])
  useEffect(() => () => geometry.dispose(), [geometry])

  return (
    <group position={[-0.96, 0.115, 0.02]} rotation={[0, 0.05, 0.01]}>
      <mesh geometry={geometry}>
        <meshPhysicalMaterial
          color="#f8f5ee"
          map={texture}
          bumpMap={texture}
          bumpScale={1.4}
          roughness={0.95}
          sheen={0.4}
          sheenRoughness={0.7}
          sheenColor="#ffffff"
        />
      </mesh>
    </group>
  )
}

function PillowCover({
  time,
  still,
  texture,
}: {
  time: TimeRef
  still: boolean
  texture: THREE.Texture
}) {
  const ref = useRef<THREE.Group>(null!)
  const geometry = useMemo(() => makePillowGeometry(0.77, 0.53, 0.195), [])
  useEffect(() => () => geometry.dispose(), [geometry])

  useFrame(() => {
    const group = ref.current
    if (!group) return

    const progress = still ? 1 : easeInOutCubic(seg(time.current, T_PILLOW.start, T_PILLOW.dur))
    group.visible = still || progress > 0.01

    const startX = PKG_POS.x
    const startY = PKG_POS.y + PH / 2 + 0.025
    const startZ = PKG_POS.z
    const endX = -0.96
    const endY = 0.118
    const endZ = 0.02
    const arc = Math.sin(Math.PI * progress) * 0.55

    group.position.set(lerp(startX, endX, progress), lerp(startY, endY, progress) + arc, lerp(startZ, endZ, progress))
    group.rotation.set(
      (1 - progress) * 0.35,
      lerp(PKG_YAW, 0.05, progress),
      (1 - progress) * -0.25,
    )
    group.scale.setScalar(lerp(0.22, 1, progress))
  })

  return (
    <group ref={ref}>
      <mesh geometry={geometry}>
        <meshPhysicalMaterial
          color="#f8f5ee"
          map={texture}
          bumpMap={texture}
          bumpScale={1.2}
          roughness={0.94}
          sheen={0.45}
          sheenRoughness={0.72}
          sheenColor="#ffffff"
        />
      </mesh>
    </group>
  )
}

function TravelBlanket({
  time,
  still,
  texture,
}: {
  time: TimeRef
  still: boolean
  texture: THREE.Texture
}) {
  const ref = useRef<THREE.Group>(null!)
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: '#dce4d9',
        map: texture,
        bumpMap: texture,
        bumpScale: 0.45,
        roughness: 0.98,
        sheen: 0.25,
        sheenRoughness: 0.9,
        sheenColor: new THREE.Color('#f3f1e8'),
      }),
    [texture],
  )

  useEffect(() => () => material.dispose(), [material])

  useFrame(() => {
    const group = ref.current
    if (!group) return

    const t = time.current
    const progress = still ? 1 : easeInOutCubic(seg(t, T_BLANKET.start, T_BLANKET.dur))
    const settling = still
      ? 1
      : easeInOutCubic(seg(t, T_BLANKET.start + T_BLANKET.dur * 0.76, T_BLANKET.dur * 0.18))
    group.visible = still || t > T_BLANKET.start

    const arc = Math.sin(Math.PI * progress) * 0.52
    const sway = still ? 0 : (1 - settling) * Math.sin(t * 1.2) * 0.025
    group.position.set(
      lerp(PKG_POS.x, 0.65, progress),
      lerp(PKG_POS.y + PH / 2 + 0.05, 0.085, progress) + arc + sway,
      lerp(PKG_POS.z, 0.05, progress),
    )
    group.rotation.set(
      (1 - progress) * 0.22 + sway,
      lerp(PKG_YAW, 0.04, progress),
      (1 - progress) * -0.18,
    )
    group.scale.setScalar(lerp(0.38, 1, easeOutCubic(progress)))
  })

  return (
    <group ref={ref}>
      <RoundedBox args={[1.42, 0.16, 1.28]} radius={0.065} smoothness={5} material={material} />
      <RoundedBox
        args={[0.82, 0.075, 1.26]}
        radius={0.04}
        smoothness={5}
        position={[-0.18, 0.105, 0]}
        material={material}
      />
      <RoundedBox
        args={[0.64, 0.065, 1.24]}
        radius={0.035}
        smoothness={5}
        position={[0.27, 0.17, 0]}
        material={material}
      />
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════
   The sleeper berth — corner cabin: quilted back + head walls,
   charcoal base with steel trim, neutral upholstered mattress,
   warm reading lamp and cove light.
   ═══════════════════════════════════════════════════════════════ */

const POD_TOP = 1.4
const POD_H = POD_TOP - FLOOR_Y
const POD_CY = (POD_TOP + FLOOR_Y) / 2
const POD_X0 = -1.57
const POD_X1 = 1.65

function Berth() {
  const quiltBack = useMemo(() => makeQuiltTexture((POD_X1 - POD_X0) / 0.32), [])
  const quiltHead = useMemo(() => makeQuiltTexture(1.53 / 0.32), [])
  const diaHead = useMemo(() => makeDiamondTexture(2.6, 1.5), [])
  const diaBolster = useMemo(() => makeDiamondTexture(5.8, 0.6), [])
  const windowTex = useMemo(() => makeWindowTexture(), [])
  const glow = useMemo(() => makeGlowTexture(), [])

  const curtainGeo = useMemo(() => {
    const g = new THREE.PlaneGeometry(0.3, 1.3, 36, 2)
    const pos = g.attributes.position
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const gather = 0.55 + 0.45 * ((y + 0.65) / 1.3) // folds deepen toward the bottom
      pos.setZ(i, Math.sin(x * 46) * 0.035 * (1.5 - gather))
    }
    g.computeVertexNormals()
    return g
  }, [])

  const mats = useMemo(() => {
    const wall = (map: THREE.Texture) =>
      new THREE.MeshStandardMaterial({
        color: '#ece5d8',
        map,
        bumpMap: map,
        bumpScale: 1.6,
        roughness: 0.92,
      })
    const padded = (map: THREE.Texture) =>
      new THREE.MeshPhysicalMaterial({
        color: '#d9cfc0',
        map,
        bumpMap: map,
        bumpScale: 2.2,
        roughness: 0.62,
        sheen: 0.6,
        sheenRoughness: 0.5,
        sheenColor: new THREE.Color('#fff4e0'),
        clearcoat: 0.12,
        clearcoatRoughness: 0.6,
      })
    return {
      back: wall(quiltBack),
      head: wall(quiltHead),
      headboard: padded(diaHead),
      bolster: padded(diaBolster),
      mattress: new THREE.MeshPhysicalMaterial({
        color: '#b9b1a4',
        roughness: 0.95,
        sheen: 0.5,
        sheenRoughness: 0.8,
        sheenColor: new THREE.Color('#ffffff'),
      }),
      base: new THREE.MeshStandardMaterial({ color: '#2d3237', roughness: 0.5, metalness: 0.2 }),
      dark: new THREE.MeshStandardMaterial({ color: '#171a1d', roughness: 0.55, metalness: 0.2 }),
      steel: new THREE.MeshStandardMaterial({
        color: '#c9ced3',
        metalness: 1,
        roughness: 0.34,
        envMapIntensity: 1.0,
      }),
      canopy: new THREE.MeshStandardMaterial({ color: '#efe9dd', roughness: 0.8 }),
      curtain: new THREE.MeshStandardMaterial({
        color: '#d8d0c2',
        roughness: 0.92,
        side: THREE.DoubleSide,
      }),
    }
  }, [quiltBack, quiltHead, diaHead, diaBolster])

  useEffect(
    () => () => {
      Object.values(mats).forEach((m) => m.dispose())
      ;[quiltBack, quiltHead, diaHead, diaBolster, windowTex, glow].forEach((t) => t.dispose())
      curtainGeo.dispose()
    },
    [mats, quiltBack, quiltHead, diaHead, diaBolster, windowTex, glow, curtainGeo],
  )

  const podW = POD_X1 - POD_X0
  const podCx = (POD_X0 + POD_X1) / 2

  return (
    <group>
      {/* ── pod shell: quilted back + head walls, charcoal corner posts ── */}
      <mesh position={[podCx, POD_CY, -0.765]} material={mats.back}>
        <boxGeometry args={[podW, POD_H, 0.06]} />
      </mesh>
      <mesh position={[-1.57, POD_CY, -0.035]} material={mats.head}>
        <boxGeometry args={[0.1, POD_H, 1.53]} />
      </mesh>
      <RoundedBox
        args={[0.1, POD_H, 0.14]}
        radius={0.02}
        smoothness={2}
        position={[POD_X1, POD_CY, -0.72]}
        material={mats.base}
      />
      <RoundedBox
        args={[0.16, POD_H, 0.06]}
        radius={0.02}
        smoothness={2}
        position={[-1.57, POD_CY, 0.76]}
        material={mats.base}
      />

      {/* ── headliner / canopy with warm LED edge ── */}
      <RoundedBox
        args={[podW, 0.1, 0.55]}
        radius={0.03}
        smoothness={3}
        position={[podCx, POD_TOP - 0.05, -0.495]}
        material={mats.canopy}
      />
      <mesh position={[podCx, POD_TOP - 0.108, -0.235]}>
        <boxGeometry args={[podW - 0.3, 0.012, 0.012]} />
        <meshBasicMaterial color="#ffdcae" toneMapped={false} />
      </mesh>

      {/* ── window with half-drawn roller blind ── */}
      <group position={[0.62, 0.64, -0.715]}>
        <RoundedBox args={[1.16, 0.68, 0.04]} radius={0.02} smoothness={2} material={mats.dark} />
        <mesh position={[0, 0, 0.0215]}>
          <planeGeometry args={[1.02, 0.54]} />
          <meshBasicMaterial map={windowTex} toneMapped={false} />
        </mesh>
        <mesh position={[0, 0.18, 0.023]}>
          <planeGeometry args={[1.02, 0.18]} />
          <meshStandardMaterial color="#efe9dc" roughness={0.9} />
        </mesh>
        <mesh position={[0, 0.088, 0.026]} material={mats.steel}>
          <boxGeometry args={[1.02, 0.012, 0.014]} />
        </mesh>
      </group>

      {/* ── padded headboard, diamond tufted ── */}
      <RoundedBox
        args={[0.14, 0.78, 1.3]}
        radius={0.06}
        smoothness={4}
        position={[-1.45, 0.38, 0]}
        material={mats.headboard}
      />

      {/* ── padded side bolster along the wall ── */}
      <RoundedBox
        args={[2.82, 0.27, 0.2]}
        radius={0.095}
        smoothness={5}
        position={[0.07, 0.125, -0.58]}
        material={mats.bolster}
      />

      {/* ── mattress ── */}
      <RoundedBox
        args={[MAT_W, MAT_H, MAT_D]}
        radius={0.07}
        smoothness={4}
        position={[0, -MAT_H / 2, 0]}
        material={mats.mattress}
      />

      {/* ── charcoal base: steel trim, handle slots, recessed plinth with underglow ── */}
      <RoundedBox
        args={[BASE_W, 0.5, BASE_D]}
        radius={0.03}
        smoothness={3}
        position={[0, -MAT_H - 0.25, 0]}
        material={mats.base}
      />
      <mesh position={[0, -MAT_H - 0.004, BASE_D / 2 + 0.004]} material={mats.steel}>
        <boxGeometry args={[BASE_W + 0.01, 0.018, 0.018]} />
      </mesh>
      <mesh position={[BASE_W / 2 + 0.004, -MAT_H - 0.004, 0]} material={mats.steel}>
        <boxGeometry args={[0.018, 0.018, BASE_D + 0.01]} />
      </mesh>
      {[-0.72, 0.72].map((x) => (
        <mesh key={x} position={[x, -0.44, BASE_D / 2 + 0.003]} material={mats.dark}>
          <boxGeometry args={[0.55, 0.022, 0.012]} />
        </mesh>
      ))}
      <mesh position={[0, FLOOR_Y + 0.04, 0]} material={mats.dark}>
        <boxGeometry args={[BASE_W - 0.14, 0.08, BASE_D - 0.12]} />
      </mesh>
      <mesh position={[0, -0.728, BASE_D / 2 - 0.05]}>
        <boxGeometry args={[BASE_W - 0.25, 0.01, 0.01]} />
        <meshBasicMaterial color="#ffe4bd" toneMapped={false} />
      </mesh>
      <mesh position={[0, FLOOR_Y + 0.004, BASE_D / 2 + 0.2]} rotation={[-Math.PI / 2, 0, 0]} scale={[3.5, 0.9, 1]}>
        <planeGeometry args={[1, 1]} />
        <meshBasicMaterial
          map={glow}
          color="#ffdca8"
          transparent
          opacity={0.3}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>

      {/* ── gathered privacy curtain at the head end ── */}
      <mesh geometry={curtainGeo} material={mats.curtain} position={[-1.41, 0.5, 0.7]} />

      {/* ── details: charging panel, grab bar, reading light ── */}
      <group position={[-0.5, 0.42, -0.735]}>
        <RoundedBox args={[0.14, 0.08, 0.014]} radius={0.006} smoothness={2} material={mats.steel} />
        <mesh position={[-0.03, 0, 0.009]}>
          <sphereGeometry args={[0.009, 10, 10]} />
          <meshBasicMaterial color={GOLD} toneMapped={false} />
        </mesh>
        <mesh position={[0.03, 0, 0.009]}>
          <sphereGeometry args={[0.009, 10, 10]} />
          <meshBasicMaterial color={GREEN} toneMapped={false} />
        </mesh>
      </group>

      <mesh position={[1.58, 0.42, -0.64]} material={mats.steel}>
        <cylinderGeometry args={[0.014, 0.014, 0.62, 12]} />
      </mesh>
      {[0.14, 0.7].map((y) => (
        <mesh key={y} position={[1.58, y, -0.66]} material={mats.steel}>
          <boxGeometry args={[0.03, 0.03, 0.06]} />
        </mesh>
      ))}

      <group position={[-0.95, POD_TOP - 0.1, -0.45]}>
        <mesh material={mats.steel}>
          <cylinderGeometry args={[0.07, 0.07, 0.02, 24]} />
        </mesh>
        <mesh position={[0, -0.012, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.05, 24]} />
          <meshBasicMaterial color="#ffe3b5" toneMapped={false} />
        </mesh>
        <sprite position={[0, -0.07, 0]} scale={[0.9, 0.9, 1]}>
          <spriteMaterial
            map={glow}
            color="#ffd9a0"
            transparent
            opacity={0.32}
            depthWrite={false}
            toneMapped={false}
          />
        </sprite>
        <pointLight position={[0, -0.12, 0]} color="#ffd9a0" intensity={1.5} distance={3} decay={2} />
      </group>
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Fresh Ride package — minimal ivory box, blue/green accent stripe,
   pastel tissue; the lid lifts and floats away; the logo and
   wordmark are revealed once the sheet has settled.
   ═══════════════════════════════════════════════════════════════ */

const LID_W = PW + 0.03
const LID_D = PD + 0.03

function FreshRidePackage({
  time,
  still,
  logo,
}: {
  time: TimeRef
  still: boolean
  logo: HTMLImageElement | null
}) {
  const group = useRef<THREE.Group>(null!)
  const lid = useRef<THREE.Group>(null!)
  const lidLogoMat = useRef<THREE.MeshStandardMaterial>(null!)
  const frontLogoMat = useRef<THREE.MeshStandardMaterial>(null!)

  const lidBaseTex = useCanvasTexture(1024, 682, drawLidBase, null)
  const lidLogoTex = useCanvasTexture(1024, 682, drawLidLogo, logo)
  const frontLogoTex = useCanvasTexture(1024, 334, drawFrontLogo, logo)
  const stripeTex = useCanvasTexture(512, 16, drawStripe, null)
  const tissueTex = useCanvasTexture(768, 540, drawTissue, null)

  const boxMat = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: '#f6f3ec',
        roughness: 0.78,
        metalness: 0,
      }),
    [],
  )
  useEffect(() => () => boxMat.dispose(), [boxMat])

  useFrame(() => {
    const g = group.current
    const l = lid.current
    if (!g || !l) return
    const t = time.current

    const enter = still ? 1 : easeOutCubic(seg(t, T_BOX_IN.start, T_BOX_IN.dur))
    const lift = still ? 1 : easeInOut(seg(t, T_LID.start, T_LID.dur))
    const close = still ? 0 : easeInOut(seg(t, T_LID_CLOSE.start, T_LID_CLOSE.dur))
    const lidOpen = still ? 1 : Math.max(0, Math.min(1, lift * (1 - close)))
    const brand = still ? 1 : easeOutCubic(seg(t, T_BRAND.start, T_BRAND.dur))

    g.position.set(PKG_POS.x, PKG_POS.y + (1 - enter) * 0.6, PKG_POS.z)
    g.rotation.set(0, PKG_YAW + (1 - enter) * 0.5, 0)
    g.scale.setScalar(0.9 + 0.1 * enter)

    // lid rises, then closes after the sheet is revealed, so the box feels finished
    const lidBob = still ? 0 : Math.sin(t * 0.55) * 0.02 * lidOpen
    l.position.set(lidOpen * 0.42, PH / 2 + 0.002 + lidOpen * 0.95 + lidBob, -lidOpen * 0.08)
    l.rotation.set(lidOpen * 0.5, 0, -lidOpen * 0.1)

    if (lidLogoMat.current) lidLogoMat.current.opacity = brand
    if (frontLogoMat.current) frontLogoMat.current.opacity = brand
  })

  const wall = (
    key: string,
    args: [number, number, number],
    pos: [number, number, number],
  ) => (
    <RoundedBox
      key={key}
      args={args}
      radius={0.006}
      smoothness={2}
      position={pos}
      material={boxMat}
    />
  )

  return (
    <group ref={group}>
      {/* base: floor + four walls */}
      {wall('bottom', [PW, 0.03, PD], [0, -PH / 2 + 0.015, 0])}
      {wall('front', [PW, PH, PWALL], [0, 0, PD / 2 - PWALL / 2])}
      {wall('back', [PW, PH, PWALL], [0, 0, -PD / 2 + PWALL / 2])}
      {wall('left', [PWALL, PH, PD - 2 * PWALL], [-PW / 2 + PWALL / 2, 0, 0])}
      {wall('right', [PWALL, PH, PD - 2 * PWALL], [PW / 2 - PWALL / 2, 0, 0])}

      {/* tissue lining */}
      <mesh position={[0, -PH / 2 + 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[PW - 2 * PWALL, PD - 2 * PWALL]} />
        <meshStandardMaterial map={tissueTex} roughness={0.9} />
      </mesh>

      {/* front: accent stripe + logo label */}
      <mesh position={[0, -PH / 2 + 0.032, PD / 2 + 0.001]}>
        <planeGeometry args={[PW, 0.03]} />
        <meshStandardMaterial map={stripeTex} roughness={0.6} />
      </mesh>
      <mesh position={[0, 0.02, PD / 2 + 0.0015]}>
        <planeGeometry args={[0.8, 0.8 * (337 / 1024)]} />
        <meshStandardMaterial
          ref={frontLogoMat}
          map={frontLogoTex}
          transparent
          opacity={0}
          depthWrite={false}
          roughness={0.6}
        />
      </mesh>

      {/* lid */}
      <group ref={lid}>
        <RoundedBox
          args={[LID_W, 0.025, LID_D]}
          radius={0.006}
          smoothness={2}
          position={[0, PKG_LID_H - 0.0125, 0]}
          material={boxMat}
        />
        <RoundedBox
          args={[LID_W, PKG_LID_H, PWALL]}
          radius={0.006}
          smoothness={2}
          position={[0, PKG_LID_H / 2, LID_D / 2 - PWALL / 2]}
          material={boxMat}
        />
        <RoundedBox
          args={[LID_W, PKG_LID_H, PWALL]}
          radius={0.006}
          smoothness={2}
          position={[0, PKG_LID_H / 2, -LID_D / 2 + PWALL / 2]}
          material={boxMat}
        />
        <RoundedBox
          args={[PWALL, PKG_LID_H, LID_D - 2 * PWALL]}
          radius={0.006}
          smoothness={2}
          position={[-LID_W / 2 + PWALL / 2, PKG_LID_H / 2, 0]}
          material={boxMat}
        />
        <RoundedBox
          args={[PWALL, PKG_LID_H, LID_D - 2 * PWALL]}
          radius={0.006}
          smoothness={2}
          position={[LID_W / 2 - PWALL / 2, PKG_LID_H / 2, 0]}
          material={boxMat}
        />
        <mesh position={[0, PKG_LID_H + 0.0013, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[LID_W - 0.04, LID_D - 0.04]} />
          <meshStandardMaterial map={lidBaseTex} roughness={0.7} />
        </mesh>
        <mesh position={[0, PKG_LID_H + 0.0026, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[LID_W - 0.04, LID_D - 0.04]} />
          <meshStandardMaterial
            ref={lidLogoMat}
            map={lidLogoTex}
            transparent
            opacity={0}
            depthWrite={false}
            roughness={0.6}
          />
        </mesh>
      </group>
    </group>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Soft contact shadows (no shadow maps) + a travelling light sweep
   ═══════════════════════════════════════════════════════════════ */

function BlobShadow({
  time,
  still,
  tex,
  position,
  scale,
  opacity,
  start = 0.3,
}: {
  time: TimeRef
  still: boolean
  tex: THREE.Texture
  position: [number, number, number]
  scale: [number, number]
  opacity: number
  start?: number
}) {
  const mat = useRef<THREE.MeshBasicMaterial>(null!)
  useFrame(() => {
    if (!mat.current) return
    const enter = still ? 1 : easeOutCubic(seg(time.current, start, 1.4))
    mat.current.opacity = opacity * enter
  })
  return (
    <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} scale={[scale[0], scale[1], 1]}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial
        ref={mat}
        map={tex}
        transparent
        opacity={0}
        depthWrite={false}
        toneMapped={false}
      />
    </mesh>
  )
}

/** One warm highlight passes across the finished composition, then it idles slowly */
function LightSweep({ time, still }: { time: TimeRef; still: boolean }) {
  const light = useRef<THREE.PointLight>(null!)
  useFrame(() => {
    const l = light.current
    if (!l) return
    if (still) {
      l.position.set(1.2, 2.3, 2.8)
      l.intensity = 4
      return
    }
    const t = time.current
    const sweep = seg(t, T_SWEEP.start, T_SWEEP.dur)
    const idle = seg(t, T_SWEEP.start + T_SWEEP.dur, 2)
    const x = -2.5 + 5 * easeInOut(sweep) + idle * 0.8 * Math.sin(t * 0.3)
    l.position.set(x, 2.3, 2.8)
    l.intensity = 3 + 4 * Math.sin(Math.PI * sweep)
  })
  return <pointLight ref={light} color="#ffe6c4" distance={14} decay={2} intensity={3} />
}

/* ═══════════════════════════════════════════════════════════════
   Scene
   ═══════════════════════════════════════════════════════════════ */

function Scene({
  still,
  lowPower,
  logoSrc,
}: {
  still: boolean
  lowPower: boolean
  logoSrc?: string
}) {
  const time = useRef<number>(still ? 99 : 0)
  const logo = useLogoImage(logoSrc)

  const nonwoven = useMemo(() => makeNonwovenTexture(lowPower ? 256 : 384), [lowPower])
  const shadow = useMemo(() => makeShadowTexture(), [])
  useEffect(
    () => () => {
      nonwoven.dispose()
      shadow.dispose()
    },
    [nonwoven, shadow],
  )

  const sy = FLOOR_Y + 0.005

  return (
    <>
      <TimeKeeper time={time} still={still} />
      <StillInvalidator still={still} />
      <CameraRig />

      {/* Soft warm key, cool fill, pale blue rim */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[4.5, 3.2, 3.2]} intensity={1.9} color="#fff3e2" />
      <directionalLight position={[-4.5, 1.5, 3.5]} intensity={0.45} color="#dfeaff" />
      <directionalLight position={[-1.5, 3.2, -4.5]} intensity={1.0} color="#cfe6f5" />
      <spotLight
        position={[0, 5, 4]}
        angle={0.46}
        penumbra={0.9}
        intensity={2.2}
        color="#f7f2ea"
      />
      <LightSweep time={time} still={still} />

      {/* Light, natural ground shadows */}
      <BlobShadow
        time={time}
        still={still}
        tex={shadow}
        position={[0.15, sy, 0.1]}
        scale={[5.4, 3.0]}
        opacity={0.5}
      />
      <BlobShadow
        time={time}
        still={still}
        tex={shadow}
        position={[0.05, sy, 0.05]}
        scale={[3.9, 2.1]}
        opacity={0.35}
      />
      <BlobShadow
        time={time}
        still={still}
        tex={shadow}
        position={[PKG_POS.x, sy, PKG_POS.z]}
        scale={[1.9, 1.4]}
        opacity={0.5}
        start={T_BOX_IN.start + 0.7}
      />

      <Berth />
      <NonwovenSheet time={time} still={still} lowPower={lowPower} texture={nonwoven} />
      <Pillow texture={nonwoven} />
      <PillowCover time={time} still={still} texture={nonwoven} />
      <TravelBlanket time={time} still={still} texture={nonwoven} />
      <FreshRidePackage time={time} still={still} logo={logo} />

      {/* Seamless studio reflections — rendered once, never per frame */}
      <Environment resolution={64} frames={1}>
        <Lightformer form="rect" intensity={1.8} position={[0, 5, -3]} scale={[14, 5, 1]} />
        <Lightformer
          form="rect"
          intensity={0.9}
          position={[-5, 2, 3]}
          scale={[5, 8, 1]}
          color="#eef4ff"
        />
        <Lightformer
          form="rect"
          intensity={0.9}
          position={[5, 2, 3]}
          scale={[5, 8, 1]}
          color="#fff6e6"
        />
        <Lightformer
          form="rect"
          intensity={0.6}
          position={[0, -1, 5]}
          scale={[10, 2, 1]}
          color="#ffffff"
        />
      </Environment>
    </>
  )
}

/* ═══════════════════════════════════════════════════════════════
   Public component (props unchanged — HeroSection needs no edits)
   ═══════════════════════════════════════════════════════════════ */

export interface HeroScene3DProps {
  /** prefers-reduced-motion: renders one finished, static frame */
  reducedMotion?: boolean
  /** phones / tablets: fewer vertices, smaller textures, lower pixel ratio, no pointer parallax */
  lowPower?: boolean
  /** URL of the logo (transparent PNG). Defaults to /images/butterfly-logo.png */
  logoSrc?: string
}

export default function HeroScene3D({
  reducedMotion = false,
  lowPower = false,
  logoSrc = DEFAULT_LOGO,
}: HeroScene3DProps) {
  const wrapRef = useRef<HTMLDivElement>(null)
  const [visible, setVisible] = useState(true)

  // Pause the render loop whenever the hero is scrolled out of view
  useEffect(() => {
    const el = wrapRef.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
      threshold: 0,
    })
    io.observe(el)
    return () => io.disconnect()
  }, [])

  const frameloop = reducedMotion ? 'demand' : visible ? 'always' : 'never'

  return (
    <div
      ref={wrapRef}
      role="img"
      aria-label="A premium sleeper-bus berth where a Butterfly Fresh Ride disposable bedsheet unfolds from its package"
      style={{ width: '100%', height: '100%' }}
    >
      <Canvas
        shadows={true}
        frameloop={frameloop}
        dpr={lowPower ? [1, 1.25] : [1, 1.6]}
        camera={{ position: [5.8, 3.2, 9.2], fov: 28, near: 0.1, far: 60 }}
        gl={{ alpha: true, antialias: true, powerPreference: 'high-performance' }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping
          gl.toneMappingExposure = 1.05
        }}
        style={{ background: 'transparent', touchAction: 'pan-y' }}
      >
        <Scene still={reducedMotion} lowPower={lowPower} logoSrc={logoSrc} />
        <OrbitControls
          enablePan={false}
          enableZoom={false}
          enableDamping
          dampingFactor={0.08}
          rotateSpeed={0.8}
          minPolarAngle={Math.PI / 3.7}
          maxPolarAngle={Math.PI / 1.9}
          target={[0.1, 0.15, 0.35]}
        />
      </Canvas>
    </div>
  )
}












































// 'use client'

// import { useEffect, useMemo, useRef, useState } from 'react'
// import * as THREE from 'three'
// import { Canvas, useFrame, useThree } from '@react-three/fiber'
// import { Environment, Html, Lightformer, OrbitControls, RoundedBox } from '@react-three/drei'

// /* ═══════════════════════════════════════════════════════════════
//    Butterfly Fresh Ride — "A Fresh Journey Begins Here."  (cinematic cut)

//    What changed vs. the flat version
//      • Real soft shadow maps (the sheet casts a shadow that follows
//        its folds, via a matching depth shader)
//      • Ambient occlusion, bloom on the warm practicals, depth of
//        field with a focus pull, vignette, film grain, filmic grade
//      • Directed camera: low push-in on the package, rise with the
//        sheet, long pull-back to the hero frame, subtle handheld
//        drift, then hands over to OrbitControls with a slow idle drift
//      • Motivated lighting: cool daylight from the window with faint
//        light shafts + floating dust, warm lamp / cove, cool rim
//      • Dark graded backdrop + glossy floor (or transparent mode)

//    Needs:  npm i @react-three/postprocessing postprocessing
//    ═══════════════════════════════════════════════════════════════ */

// /* ───────── Brand + layout constants ───────── */

// const GOLD = '#C8A96E'
// const GREEN = '#8FB99A'
// const INK = '#20252B'
// /** Put the logo here (public/images/butterfly-logo.png, transparent PNG). Falls back to a drawn mark. */
// const DEFAULT_LOGO = '/images/butterfly-logo.png'

// /* HDR-ish emissive colours so bloom picks the practicals up */
// const EMIT_WARM = new THREE.Color('#ffdcae').multiplyScalar(2.6)
// const EMIT_LAMP = new THREE.Color('#ffe3b5').multiplyScalar(3.2)
// const EMIT_COVE = new THREE.Color('#ffe4bd').multiplyScalar(2.4)
// const EMIT_GOLD = new THREE.Color(GOLD).multiplyScalar(2.2)
// const EMIT_GREEN = new THREE.Color(GREEN).multiplyScalar(2.2)

// /* Berth geometry (world units). Mattress top surface is y = 0. */
// const MAT_W = 3.0
// const MAT_H = 0.22
// const MAT_D = 1.36
// const BASE_W = 3.1
// const BASE_H = 0.58
// const BASE_D = 1.46
// const FLOOR_Y = -0.8

// /* Sheet geometry. Slightly larger than the mattress in depth/front, tucked at the wall side. */
// const SHEET_W = 3.1
// const SHEET_D = 1.5
// const PANELS = 6
// const SHEET_OFF = { x: 0.05, z: 0.07 } // sheet-centre offset relative to mattress centre
// const OVER_X = MAT_W / 2 - SHEET_OFF.x // local x where sheet leaves the mattress (right end)
// const OVER_Z = MAT_D / 2 - SHEET_OFF.z // local z where sheet leaves the mattress (front)

// /* Package geometry + placement */
// const PW = 1.0
// const PH = 0.34
// const PD = 0.7
// const PWALL = 0.025
// const PKG_LID_H = 0.085
// const PKG_POS = new THREE.Vector3(0.85, FLOOR_Y + PH / 2, 1.55)
// const PKG_YAW = 0.5

// /** Seconds on the intro timeline */
// const T_BOX_IN = { start: 0.5, dur: 1.4 }
// const T_LID = { start: 1.9, dur: 1.5 }
// const T_FLIGHT = { start: 3.3, dur: 2.8 }
// const T_SETTLE = { start: 5.6, dur: 2.2 }
// const T_BRAND = { start: 7.0, dur: 1.6 }
// const T_PILLOW = { start: 7.4, dur: 2.9 }
// const T_BLANKET = { start: 8.3, dur: 2.6 }
// const T_MASK = { start: 9.2, dur: 2.0 }
// const T_FOAM = { start: 9.6, dur: 2.0 }
// const T_SILICONE = { start: 10.0, dur: 2.0 }
// const T_HYGIENE = { start: 10.4, dur: 2.0 }
// const T_NECK = { start: 10.8, dur: 2.2 }
// const T_INFLATE = { start: 12.6, dur: 1.2 }
// const T_SLIPPERS = { start: 11.4, dur: 2.2 }
// const T_LID_CLOSE = { start: 14.0, dur: 1.3 }
// const T_SWEEP = { start: 12.4, dur: 2.8 }
// /** hotspot pins fade in */
// const T_LABELS = 14.4

// type TimeRef = { current: number }

// /* ───────── Small helpers ───────── */

// const clamp01 = (v: number) => Math.max(0, Math.min(1, v))
// const seg = (time: number, start: number, dur: number) => clamp01((time - start) / dur)
// const easeInOut = (t: number) => t * t * (3 - 2 * t)
// const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3)
// const easeInOutCubic = (t: number) =>
//   t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
// const lerp = (a: number, b: number, t: number) => a + (b - a) * t

// /** GLSL needs "3.0", never "3" */
// const glf = (n: number) => (Number.isInteger(n) ? n.toFixed(1) : String(n))

// const _v2 = new THREE.Vector2()

// /* ═══════════════════════════════════════════════════════════════
//    Canvas drawing — all textures are generated at runtime
//    ═══════════════════════════════════════════════════════════════ */

// type Draw = (
//   g: CanvasRenderingContext2D,
//   w: number,
//   h: number,
//   logo: HTMLImageElement | null,
// ) => void

// function spacedWidth(g: CanvasRenderingContext2D, text: string, spacing: number) {
//   const widths = [...text].map((ch) => g.measureText(ch).width)
//   return widths.reduce((a, b) => a + b, 0) + spacing * (text.length - 1)
// }

// /** Letter-spaced text, centred on cx (ctx.letterSpacing is not supported everywhere) */
// function drawSpaced(
//   g: CanvasRenderingContext2D,
//   text: string,
//   cx: number,
//   y: number,
//   spacing: number,
// ) {
//   const widths = [...text].map((ch) => g.measureText(ch).width)
//   const total = widths.reduce((a, b) => a + b, 0) + spacing * (text.length - 1)
//   let x = cx - total / 2
//   const prevAlign = g.textAlign
//   g.textAlign = 'left'
//   ;[...text].forEach((ch, i) => {
//     g.fillText(ch, x, y)
//     x += widths[i] + spacing
//   })
//   g.textAlign = prevAlign
// }

// /** Fallback butterfly mark, used only until/unless the real logo loads */
// function drawButterfly(g: CanvasRenderingContext2D, cx: number, cy: number, s: number) {
//   g.save()
//   g.translate(cx, cy)
//   g.scale(s, s)
//   for (const side of [1, -1]) {
//     g.save()
//     g.scale(side, 1)
//     g.fillStyle = GOLD
//     g.beginPath()
//     g.moveTo(0.04, -0.02)
//     g.bezierCurveTo(0.12, -0.95, 1.1, -1.05, 1.02, -0.22)
//     g.bezierCurveTo(0.96, 0.18, 0.3, 0.16, 0.04, -0.02)
//     g.fill()
//     g.fillStyle = GREEN
//     g.beginPath()
//     g.moveTo(0.04, 0.04)
//     g.bezierCurveTo(0.5, 0.05, 0.8, 0.3, 0.62, 0.62)
//     g.bezierCurveTo(0.42, 0.85, 0.1, 0.55, 0.04, 0.04)
//     g.fill()
//     g.restore()
//   }
//   g.restore()
// }

// function drawMark(
//   g: CanvasRenderingContext2D,
//   cx: number,
//   cy: number,
//   size: number,
//   logo: HTMLImageElement | null,
// ) {
//   if (logo && logo.naturalWidth > 0) {
//     const h = size * (logo.naturalHeight / logo.naturalWidth)
//     g.drawImage(logo, cx - size / 2, cy - h / 2, size, h)
//   } else {
//     drawButterfly(g, cx, cy, size * 0.42)
//   }
// }

// /** Lid top, base print: ivory board with a fine gold frame (no logo — revealed later) */
// const drawLidBase: Draw = (g, w, h) => {
//   g.fillStyle = '#f8f6f0'
//   g.fillRect(0, 0, w, h)
//   const v = g.createRadialGradient(w / 2, h / 2, h * 0.1, w / 2, h / 2, w * 0.7)
//   v.addColorStop(0, 'rgba(255,255,255,0.7)')
//   v.addColorStop(1, 'rgba(200,169,110,0.10)')
//   g.fillStyle = v
//   g.fillRect(0, 0, w, h)
//   g.strokeStyle = 'rgba(200,169,110,0.85)'
//   g.lineWidth = 3
//   g.strokeRect(36, 36, w - 72, h - 72)
//   g.lineWidth = 1
//   g.strokeRect(50, 50, w - 100, h - 100)
// }

// /** Lid top, logo layer (transparent) */
// const drawLidLogo: Draw = (g, w, h, logo) => {
//   g.clearRect(0, 0, w, h)
//   drawMark(g, w / 2, h * 0.36, 290, logo)
//   g.textAlign = 'center'
//   g.fillStyle = INK
//   g.font = '500 70px Georgia, "Times New Roman", serif'
//   g.fillText('Butterfly', w / 2, h * 0.67)
//   g.fillStyle = GOLD
//   g.font = '600 27px "Helvetica Neue", Arial, sans-serif'
//   drawSpaced(g, 'FRESH RIDE', w / 2, h * 0.75, 13)
//   g.strokeStyle = 'rgba(32,37,43,0.18)'
//   g.lineWidth = 1.5
//   g.beginPath()
//   g.moveTo(w / 2 - 70, h * 0.8)
//   g.lineTo(w / 2 + 70, h * 0.8)
//   g.stroke()
//   g.fillStyle = 'rgba(32,37,43,0.5)'
//   g.font = '500 17px "Helvetica Neue", Arial, sans-serif'
//   drawSpaced(g, 'DESIGNED FOR TRAVEL · MADE FOR FRESHNESS', w / 2, h * 0.88, 3)
// }

// /** Front wall label (transparent): logo left, wordmark right */
// const drawFrontLogo: Draw = (g, w, h, logo) => {
//   g.clearRect(0, 0, w, h)
//   drawMark(g, w * 0.2, h / 2, 230, logo)
//   const x0 = w * 0.36
//   g.textAlign = 'left'
//   g.fillStyle = INK
//   g.font = '500 96px Georgia, "Times New Roman", serif'
//   g.fillText('Butterfly', x0, h * 0.5)
//   g.fillStyle = GOLD
//   g.font = '600 32px "Helvetica Neue", Arial, sans-serif'
//   const sw = spacedWidth(g, 'FRESH RIDE', 12)
//   drawSpaced(g, 'FRESH RIDE', x0 + sw / 2, h * 0.74, 12)
// }

// /** Gold → green accent stripe along the base of the front wall */
// const drawStripe: Draw = (g, w, h) => {
//   const grad = g.createLinearGradient(0, 0, w, 0)
//   grad.addColorStop(0, GOLD)
//   grad.addColorStop(1, GREEN)
//   g.fillStyle = grad
//   g.fillRect(0, 0, w, h)
// }

// /** Just the butterfly mark on a transparent square (decals on small products) */
// const drawRoundMark: Draw = (g, w, h, logo) => {
//   g.clearRect(0, 0, w, h)
//   drawMark(g, w / 2, h / 2, w * 0.7, logo)
// }

// /** Soft pastel tissue lining the package */
// const drawTissue: Draw = (g, w, h) => {
//   const grad = g.createLinearGradient(0, 0, w, h)
//   grad.addColorStop(0, '#F5F7F4')
//   grad.addColorStop(1, '#E8EEF0')
//   g.fillStyle = grad
//   g.fillRect(0, 0, w, h)
//   g.lineWidth = 2
//   for (let i = 0; i < 12; i++) {
//     const x = (i / 12) * w + Math.sin(i * 12.9898) * 24
//     g.strokeStyle = i % 2 ? 'rgba(255,255,255,0.45)' : 'rgba(120,150,160,0.10)'
//     g.beginPath()
//     g.moveTo(x, 0)
//     g.bezierCurveTo(x + 30, h * 0.3, x - 30, h * 0.6, x + 16, h)
//     g.stroke()
//   }
// }

// function useLogoImage(src?: string) {
//   const [img, setImg] = useState<HTMLImageElement | null>(null)
//   useEffect(() => {
//     if (!src) return
//     let cancelled = false
//     const im = new Image()
//     im.onload = () => {
//       if (!cancelled) setImg(im)
//     }
//     im.src = src
//     return () => {
//       cancelled = true
//     }
//   }, [src])
//   return img
// }

// /** Canvas texture that redraws itself once the logo has loaded */
// function useCanvasTexture(w: number, h: number, draw: Draw, logo: HTMLImageElement | null) {
//   const invalidate = useThree((s) => s.invalidate)

//   const tex = useMemo(() => {
//     const c = document.createElement('canvas')
//     c.width = w
//     c.height = h
//     draw(c.getContext('2d')!, w, h, null)
//     const t = new THREE.CanvasTexture(c)
//     t.colorSpace = THREE.SRGBColorSpace
//     t.anisotropy = 16
//     return t
//   }, [w, h, draw])

//   useEffect(() => {
//     if (!logo) return
//     const c = tex.image as HTMLCanvasElement
//     const g = c.getContext('2d')!
//     g.clearRect(0, 0, w, h)
//     draw(g, w, h, logo)
//     tex.needsUpdate = true
//     invalidate()
//   }, [logo, tex, w, h, draw, invalidate])

//   useEffect(() => () => tex.dispose(), [tex])
//   return tex
// }

// /** Tileable spunbond-style fibre texture: random fine fibres + soft cloudiness. */
// function makeNonwovenTexture(size: number): THREE.CanvasTexture {
//   const canvas = document.createElement('canvas')
//   canvas.width = canvas.height = size
//   const g = canvas.getContext('2d')!

//   let seed = 20261110
//   const rnd = () => {
//     seed = (seed * 16807) % 2147483647
//     return (seed - 1) / 2147483646
//   }

//   g.fillStyle = '#f3efe7'
//   g.fillRect(0, 0, size, size)

//   for (let i = 0; i < 120; i++) {
//     const x = rnd() * size
//     const y = rnd() * size
//     const r = size * (0.06 + rnd() * 0.14)
//     const light = rnd() < 0.5
//     for (const ox of [-size, 0, size]) {
//       for (const oy of [-size, 0, size]) {
//         const grad = g.createRadialGradient(x + ox, y + oy, 0, x + ox, y + oy, r)
//         grad.addColorStop(0, light ? 'rgba(255,255,255,0.10)' : 'rgba(150,140,120,0.06)')
//         grad.addColorStop(1, 'rgba(255,255,255,0)')
//         g.fillStyle = grad
//         g.fillRect(x + ox - r, y + oy - r, r * 2, r * 2)
//       }
//     }
//   }

//   const scale = size / 512
//   const fibreCount = Math.round((size * size) / 95)
//   g.lineCap = 'round'
//   for (let i = 0; i < fibreCount; i++) {
//     const x = rnd() * size
//     const y = rnd() * size
//     const a = rnd() * Math.PI
//     const len = size * (0.035 + rnd() * 0.09)
//     const dx = Math.cos(a) * len
//     const dy = Math.sin(a) * len
//     const light = rnd() < 0.55
//     g.strokeStyle = light
//       ? `rgba(255,255,255,${0.35 + rnd() * 0.4})`
//       : `rgba(120,112,98,${0.06 + rnd() * 0.12})`
//     g.lineWidth = (0.5 + rnd() * 1.1) * scale
//     for (const ox of [-size, 0, size]) {
//       for (const oy of [-size, 0, size]) {
//         const x0 = x + ox
//         const y0 = y + oy
//         if (x0 < -len || x0 > size + len || y0 < -len || y0 > size + len) continue
//         g.beginPath()
//         g.moveTo(x0, y0)
//         g.quadraticCurveTo(x0 + dx * 0.5 + dy * 0.12, y0 + dy * 0.5 - dx * 0.12, x0 + dx, y0 + dy)
//         g.stroke()
//       }
//     }
//   }

//   const tex = new THREE.CanvasTexture(canvas)
//   tex.wrapS = tex.wrapT = THREE.RepeatWrapping
//   tex.colorSpace = THREE.SRGBColorSpace
//   tex.anisotropy = 8
//   tex.repeat.set(3.5, 2.3)
//   tex.needsUpdate = true
//   return tex
// }

// /** One vertical quilted channel (tiles horizontally) for the cabin wall upholstery */
// function makeQuiltTexture(repeatX: number): THREE.CanvasTexture {
//   const size = 256
//   const c = document.createElement('canvas')
//   c.width = c.height = size
//   const g = c.getContext('2d')!
//   const lg = g.createLinearGradient(0, 0, size, 0)
//   lg.addColorStop(0, '#cfc5b4')
//   lg.addColorStop(0.5, '#e6dfd2')
//   lg.addColorStop(1, '#cfc5b4')
//   g.fillStyle = lg
//   g.fillRect(0, 0, size, size)
//   g.fillStyle = 'rgba(70,60,48,0.5)'
//   g.fillRect(0, 0, 2, size)
//   g.fillRect(size - 2, 0, 2, size)
//   g.fillStyle = 'rgba(70,60,48,0.35)'
//   for (let y = 6; y < size; y += 14) {
//     g.fillRect(4, y, 3, 5)
//     g.fillRect(size - 7, y, 3, 5)
//   }
//   const t = new THREE.CanvasTexture(c)
//   t.wrapS = t.wrapT = THREE.RepeatWrapping
//   t.colorSpace = THREE.SRGBColorSpace
//   t.anisotropy = 4
//   t.repeat.set(repeatX, 1)
//   return t
// }

// /** Diamond-tufted upholstery (headboard / bolster): seams + buttons, tiles seamlessly */
// function makeDiamondTexture(rx: number, ry: number): THREE.CanvasTexture {
//   const size = 256
//   const c = document.createElement('canvas')
//   c.width = c.height = size
//   const g = c.getContext('2d')!
//   g.fillStyle = '#b3a999'
//   g.fillRect(0, 0, size, size)
//   // puffy diamond centres
//   for (const [x, y] of [
//     [64, 0],
//     [192, 0],
//     [0, 64],
//     [128, 64],
//     [256, 64],
//     [64, 128],
//     [192, 128],
//     [0, 192],
//     [128, 192],
//     [256, 192],
//     [64, 256],
//     [192, 256],
//   ]) {
//     const r = g.createRadialGradient(x, y, 0, x, y, 72)
//     r.addColorStop(0, 'rgba(255,248,235,0.55)')
//     r.addColorStop(1, 'rgba(255,248,235,0)')
//     g.fillStyle = r
//     g.fillRect(x - 72, y - 72, 144, 144)
//   }
//   g.strokeStyle = 'rgba(55,47,38,0.65)'
//   g.lineWidth = 2.5
//   for (let n = -2; n <= 4; n++) {
//     g.beginPath()
//     g.moveTo(n * 128 - 256, -256 + 0)
//     g.lineTo(n * 128 + 256, 256 + 0)
//     g.stroke()
//     g.beginPath()
//     g.moveTo(n * 128 + 256, -256)
//     g.lineTo(n * 128 - 256, 256)
//     g.stroke()
//   }
//   for (let i = 0; i <= 2; i++) {
//     for (let j = 0; j <= 2; j++) {
//       for (const [x, y] of [
//         [i * 128, j * 128],
//         [i * 128 + 64, j * 128 + 64],
//       ]) {
//         g.fillStyle = 'rgba(50,43,35,0.85)'
//         g.beginPath()
//         g.arc(x, y, 6, 0, Math.PI * 2)
//         g.fill()
//         g.fillStyle = 'rgba(255,245,230,0.5)'
//         g.beginPath()
//         g.arc(x - 1.5, y - 1.5, 2, 0, Math.PI * 2)
//         g.fill()
//       }
//     }
//   }
//   const t = new THREE.CanvasTexture(c)
//   t.wrapS = t.wrapT = THREE.RepeatWrapping
//   t.colorSpace = THREE.SRGBColorSpace
//   t.anisotropy = 4
//   t.repeat.set(rx, ry)
//   return t
// }

// /** Soft, out-of-focus daylight for the berth window */
// function makeWindowTexture(): THREE.CanvasTexture {
//   const w = 256
//   const h = 160
//   const c = document.createElement('canvas')
//   c.width = w
//   c.height = h
//   const g = c.getContext('2d')!
//   const sky = g.createLinearGradient(0, 0, 0, h)
//   sky.addColorStop(0, '#cfe6f4')
//   sky.addColorStop(0.6, '#eaf3f4')
//   sky.addColorStop(1, '#f5efe2')
//   g.fillStyle = sky
//   g.fillRect(0, 0, w, h)
//   const blobs: [number, number, number, string][] = [
//     [30, 128, 46, 'rgba(143,195,168,0.45)'],
//     [95, 140, 54, 'rgba(120,175,150,0.4)'],
//     [165, 132, 50, 'rgba(143,195,168,0.42)'],
//     [230, 138, 48, 'rgba(120,175,150,0.4)'],
//     [70, 40, 40, 'rgba(255,255,255,0.7)'],
//     [190, 56, 34, 'rgba(255,255,255,0.55)'],
//   ]
//   for (const [x, y, r, col] of blobs) {
//     const gr = g.createRadialGradient(x, y, 0, x, y, r)
//     gr.addColorStop(0, col)
//     gr.addColorStop(1, 'rgba(255,255,255,0)')
//     g.fillStyle = gr
//     g.fillRect(x - r, y - r, r * 2, r * 2)
//   }
//   const t = new THREE.CanvasTexture(c)
//   t.colorSpace = THREE.SRGBColorSpace
//   return t
// }

// /** Soft radial glow (white centre → transparent), tinted by the material colour */
// function makeGlowTexture(): THREE.CanvasTexture {
//   const size = 128
//   const c = document.createElement('canvas')
//   c.width = c.height = size
//   const g = c.getContext('2d')!
//   const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
//   grad.addColorStop(0, 'rgba(255,255,255,1)')
//   grad.addColorStop(0.35, 'rgba(255,255,255,0.3)')
//   grad.addColorStop(1, 'rgba(255,255,255,0)')
//   g.fillStyle = grad
//   g.fillRect(0, 0, size, size)
//   const t = new THREE.CanvasTexture(c)
//   t.colorSpace = THREE.SRGBColorSpace
//   return t
// }

// /** Soft elliptical ground shadow (extra ambient occlusion under the real shadow map) */
// function makeShadowTexture(): THREE.CanvasTexture {
//   const size = 256
//   const c = document.createElement('canvas')
//   c.width = c.height = size
//   const g = c.getContext('2d')!
//   const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
//   grad.addColorStop(0, 'rgba(0,0,0,0.6)')
//   grad.addColorStop(0.45, 'rgba(0,0,0,0.25)')
//   grad.addColorStop(1, 'rgba(0,0,0,0)')
//   g.fillStyle = grad
//   g.fillRect(0, 0, size, size)
//   const t = new THREE.CanvasTexture(c)
//   t.colorSpace = THREE.SRGBColorSpace
//   return t
// }

// /** Graded studio backdrop: deep teal-charcoal, warm pool behind the berth, cool kicker top-left */
// function makeBackdropTexture(): THREE.CanvasTexture {
//   const w = 512
//   const h = 512
//   const c = document.createElement('canvas')
//   c.width = w
//   c.height = h
//   const g = c.getContext('2d')!
//   const base = g.createLinearGradient(0, 0, 0, h)
//   base.addColorStop(0, '#0a0e12')
//   base.addColorStop(0.55, '#151c21')
//   base.addColorStop(1, '#0d0c0b')
//   g.fillStyle = base
//   g.fillRect(0, 0, w, h)
//   const warm = g.createRadialGradient(w * 0.56, h * 0.52, 0, w * 0.56, h * 0.52, w * 0.62)
//   warm.addColorStop(0, 'rgba(140,108,70,0.34)')
//   warm.addColorStop(0.5, 'rgba(90,70,48,0.12)')
//   warm.addColorStop(1, 'rgba(0,0,0,0)')
//   g.fillStyle = warm
//   g.fillRect(0, 0, w, h)
//   const cool = g.createRadialGradient(w * 0.12, h * 0.1, 0, w * 0.12, h * 0.1, w * 0.55)
//   cool.addColorStop(0, 'rgba(70,108,130,0.28)')
//   cool.addColorStop(1, 'rgba(0,0,0,0)')
//   g.fillStyle = cool
//   g.fillRect(0, 0, w, h)
//   const t = new THREE.CanvasTexture(c)
//   t.colorSpace = THREE.SRGBColorSpace
//   return t
// }

// /** Radial alpha for the glossy floor disc */
// function makeFloorFadeTexture(): THREE.CanvasTexture {
//   const size = 256
//   const c = document.createElement('canvas')
//   c.width = c.height = size
//   const g = c.getContext('2d')!
//   const grad = g.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2)
//   grad.addColorStop(0, '#ffffff')
//   grad.addColorStop(0.22, '#e8e8e8')
//   grad.addColorStop(0.58, '#000000')
//   g.fillStyle = grad
//   g.fillRect(0, 0, size, size)
//   return new THREE.CanvasTexture(c)
// }

// /** Ribbed rubber aisle runner */
// function makeAisleTexture(): THREE.CanvasTexture {
//   const size = 256
//   const c = document.createElement('canvas')
//   c.width = c.height = size
//   const g = c.getContext('2d')!
//   g.fillStyle = '#23282d'
//   g.fillRect(0, 0, size, size)
//   for (let y = 0; y < size; y += 16) {
//     g.fillStyle = 'rgba(255,255,255,0.10)'
//     g.fillRect(0, y, size, 3)
//     g.fillStyle = 'rgba(0,0,0,0.35)'
//     g.fillRect(0, y + 5, size, 4)
//   }
//   const t = new THREE.CanvasTexture(c)
//   t.wrapS = t.wrapT = THREE.RepeatWrapping
//   t.colorSpace = THREE.SRGBColorSpace
//   t.anisotropy = 8
//   t.repeat.set(3, 1.6)
//   return t
// }

// /** Fine dark mesh (transparent between the threads) for the storage pocket */
// function makeMeshTexture(): THREE.CanvasTexture {
//   const size = 128
//   const c = document.createElement('canvas')
//   c.width = c.height = size
//   const g = c.getContext('2d')!
//   g.clearRect(0, 0, size, size)
//   g.strokeStyle = 'rgba(30,34,38,0.95)'
//   g.lineWidth = 3
//   for (let i = 0; i <= size; i += 16) {
//     g.beginPath()
//     g.moveTo(i, 0)
//     g.lineTo(i, size)
//     g.stroke()
//     g.beginPath()
//     g.moveTo(0, i)
//     g.lineTo(size, i)
//     g.stroke()
//   }
//   const t = new THREE.CanvasTexture(c)
//   t.wrapS = t.wrapT = THREE.RepeatWrapping
//   t.colorSpace = THREE.SRGBColorSpace
//   t.repeat.set(3, 2.2)
//   return t
// }

// /** Light-shaft fade along the beam (bright at the window, gone at the far end) */
// function makeBeamTexture(): THREE.CanvasTexture {
//   const c = document.createElement('canvas')
//   c.width = 8
//   c.height = 128
//   const g = c.getContext('2d')!
//   const grad = g.createLinearGradient(0, 0, 0, 128)
//   grad.addColorStop(0, 'rgba(255,255,255,1)')
//   grad.addColorStop(0.35, 'rgba(255,255,255,0.45)')
//   grad.addColorStop(1, 'rgba(255,255,255,0)')
//   g.fillStyle = grad
//   g.fillRect(0, 0, 8, 128)
//   const t = new THREE.CanvasTexture(c)
//   t.colorSpace = THREE.SRGBColorSpace
//   return t
// }

// /* ═══════════════════════════════════════════════════════════════
//    Clock, still-frame helper
//    ═══════════════════════════════════════════════════════════════ */

// function TimeKeeper({ time, still }: { time: TimeRef; still: boolean }) {
//   useFrame((_, delta) => {
//     if (still) return
//     time.current += Math.min(delta, 0.05)
//   })
//   return null
// }

// /** Reduced-motion mode renders on demand; nudge a few frames so textures/env settle. */
// function StillInvalidator({ still }: { still: boolean }) {
//   const invalidate = useThree((s) => s.invalidate)
//   useEffect(() => {
//     if (!still) return
//     const ids = [50, 250, 800, 1800, 3000].map((ms) => window.setTimeout(invalidate, ms))
//     return () => ids.forEach((id) => window.clearTimeout(id))
//   }, [still, invalidate])
//   return null
// }

// /* ═══════════════════════════════════════════════════════════════
//    Camera direction

//    A keyframed move (Catmull-Rom through positions and look-at
//    points, with a lens change per key), a little handheld drift,
//    then a hand-over to OrbitControls. The last key is exactly the
//    old responsive hero framing, so the hand-over has no jump.
//    ═══════════════════════════════════════════════════════════════ */

// type OrbitLike = {
//   enabled: boolean
//   target: THREE.Vector3
//   update: () => void
//   autoRotate: boolean
//   autoRotateSpeed: number
//   getAzimuthalAngle: () => number
//   addEventListener: (type: string, fn: () => void) => void
//   removeEventListener: (type: string, fn: () => void) => void
// }

// const HERO_FOV = 28
// const HERO_TARGET = new THREE.Vector3(0.1, 0.12, 0.35)
// const HERO_FOCUS = new THREE.Vector3(-0.05, 0.08, 0.35)

// function heroPose(aspect: number) {
//   const half = Math.tan(THREE.MathUtils.degToRad(HERO_FOV) / 2)
//   const needWidth = 5.4
//   const needHeight = 4.3
//   const dist = Math.max(5, needWidth / (2 * half * aspect), needHeight / (2 * half))
//   const orbit = 0.62
//   const pos = new THREE.Vector3(
//     Math.sin(orbit) * dist,
//     1.6 + dist * 0.14,
//     Math.cos(orbit) * dist,
//   )
//   return { pos, dist }
// }

// type CamKey = {
//   t: number
//   p: [number, number, number] | null // null → hero position
//   l: [number, number, number] | null // null → hero target
//   fov: number
// }

// const CAM_KEYS: CamKey[] = [
//   { t: 0.0, p: [3.9, -0.35, 4.9], l: [0.45, 0.05, 0.4], fov: 30 }, // low, wide, lamp glow in frame
//   { t: 2.4, p: [2.9, -0.12, 3.9], l: [0.85, -0.5, 1.5], fov: 24 }, // push in on the package
//   { t: 4.2, p: [2.4, 0.7, 3.7], l: [0.7, 0.15, 1.1], fov: 24 }, // rise with the sheet
//   { t: 6.6, p: [2.0, 1.4, 5.0], l: [0.3, 0.45, 0.6], fov: 26 }, // sheet in flight
//   { t: 9.8, p: [3.2, 1.7, 6.2], l: [0.15, 0.25, 0.4], fov: 27 }, // settle, pillow + blanket
//   { t: 12.6, p: [1.9, 1.5, 4.9], l: [-0.2, 0.05, 0.45], fov: 24 }, // closer on the products landing
//   { t: 15.5, p: null, l: null, fov: HERO_FOV }, // hero frame
// ]
// const CAM_END = CAM_KEYS[CAM_KEYS.length - 1].t

// function CameraDirector({
//   time,
//   still,
//   focus,
//   sheetWorld,
// }: {
//   time: TimeRef
//   still: boolean
//   focus: THREE.Vector3
//   sheetWorld: THREE.Vector3
// }) {
//   const camera = useThree((s) => s.camera) as THREE.PerspectiveCamera
//   const size = useThree((s) => s.size)
//   const invalidate = useThree((s) => s.invalidate)
//   const domElement = useThree((s) => s.gl.domElement)
//   const controls = useThree((s) => s.controls) as unknown as OrbitLike | null

//   const phase = useRef<'intro' | 'idle'>(still ? 'idle' : 'intro')
//   const skip = useRef(false)
//   const lastLook = useRef(new THREE.Vector3().copy(HERO_TARGET))
//   const tmpP = useMemo(() => new THREE.Vector3(), [])
//   const tmpL = useMemo(() => new THREE.Vector3(), [])

//   const rig = useMemo(() => {
//     const aspect = size.width / Math.max(1, size.height)
//     const hero = heroPose(aspect)
//     // narrow screens need the whole path pulled back
//     const s = THREE.MathUtils.clamp(hero.dist / 8.6, 1, 2.4)
//     const P = CAM_KEYS.map((k) =>
//       k.p
//         ? new THREE.Vector3(...k.p).sub(HERO_TARGET).multiplyScalar(s).add(HERO_TARGET)
//         : hero.pos.clone(),
//     )
//     const L = CAM_KEYS.map((k) => (k.l ? new THREE.Vector3(...k.l) : HERO_TARGET.clone()))
//     return {
//       hero,
//       s,
//       posCurve: new THREE.CatmullRomCurve3(P, false, 'catmullrom', 0.5),
//       lookCurve: new THREE.CatmullRomCurve3(L, false, 'catmullrom', 0.5),
//       fov: CAM_KEYS.map((k) => k.fov),
//     }
//   }, [size.width, size.height])

//   const pose = (t: number) => {
//     const n = CAM_KEYS.length
//     let i = 0
//     while (i < n - 2 && t >= CAM_KEYS[i + 1].t) i++
//     const local = clamp01((t - CAM_KEYS[i].t) / (CAM_KEYS[i + 1].t - CAM_KEYS[i].t))
//     const sm = lerp(local, easeInOut(local), 0.55)
//     const u = (i + sm) / (n - 1)
//     rig.posCurve.getPoint(u, tmpP)
//     rig.lookCurve.getPoint(u, tmpL)
//     const fov = lerp(rig.fov[i], rig.fov[i + 1], sm)

//     // handheld drift, fading out as we approach the hero frame
//     const hh = 1 - easeInOut(seg(t, CAM_END - 2.2, 2.2))
//     const k = hh * 0.012 * rig.s
//     tmpP.x += (Math.sin(t * 0.83) + 0.5 * Math.sin(t * 1.9 + 1.3)) * k
//     tmpP.y += (Math.sin(t * 0.71 + 2.0) + 0.5 * Math.sin(t * 2.3)) * k * 0.8
//     tmpL.x += Math.sin(t * 0.6 + 0.7) * k * 0.6
//     tmpL.y += Math.sin(t * 0.9 + 2.2) * k * 0.5

//     camera.position.copy(tmpP)
//     camera.lookAt(tmpL)
//     if (Math.abs(camera.fov - fov) > 1e-4) {
//       camera.fov = fov
//       camera.updateProjectionMatrix()
//     }
//     lastLook.current.copy(tmpL)
//   }

//   const handover = (look: THREE.Vector3, user: boolean) => {
//     phase.current = 'idle'
//     if (!controls) return
//     controls.target.copy(look)
//     controls.enabled = true
//     controls.autoRotateSpeed = 0.35
//     controls.autoRotate = !user
//     controls.update()
//   }

//   // initial placement / reduced-motion final frame
//   useEffect(() => {
//     if (phase.current === 'intro') {
//       pose(time.current)
//       if (controls) controls.enabled = false
//     } else {
//       camera.position.copy(rig.hero.pos)
//       if (camera.fov !== HERO_FOV) {
//         camera.fov = HERO_FOV
//         camera.updateProjectionMatrix()
//       }
//       camera.lookAt(HERO_TARGET)
//       if (controls) {
//         controls.target.copy(HERO_TARGET)
//         controls.enabled = true
//         controls.update()
//       }
//       invalidate()
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [rig, controls])

//   // any real pointer press during the intro (or later) takes over from the autopilot
//   useEffect(() => {
//     const onDown = (e: PointerEvent) => {
//       if (e.pointerType === 'touch') return
//       skip.current = true
//       if (controls) controls.autoRotate = false
//     }
//     domElement.addEventListener('pointerdown', onDown)
//     const stopAuto = () => {
//       if (controls) controls.autoRotate = false
//     }
//     controls?.addEventListener('start', stopAuto)
//     return () => {
//       domElement.removeEventListener('pointerdown', onDown)
//       controls?.removeEventListener('start', stopAuto)
//     }
//   }, [domElement, controls])

//   useFrame(() => {
//     const t = time.current

//     // focus pull: package → sheet in flight → the finished berth
//     const toSheet = easeInOut(seg(t, T_FLIGHT.start - 0.4, 1.6))
//     const toHero = easeInOut(seg(t, T_SETTLE.start + 0.8, 2.6))
//     focus.set(
//       lerp(lerp(PKG_POS.x, sheetWorld.x, toSheet), HERO_FOCUS.x, toHero),
//       lerp(lerp(PKG_POS.y + 0.1, sheetWorld.y, toSheet), HERO_FOCUS.y, toHero),
//       lerp(lerp(PKG_POS.z, sheetWorld.z, toSheet), HERO_FOCUS.z, toHero),
//     )

//     if (phase.current === 'idle') {
//       if (controls && controls.autoRotate) {
//         const az = controls.getAzimuthalAngle()
//         if (az < 0.25) controls.autoRotateSpeed = -Math.abs(controls.autoRotateSpeed)
//         else if (az > 1.0) controls.autoRotateSpeed = Math.abs(controls.autoRotateSpeed)
//       }
//       return
//     }

//     if (skip.current) {
//       handover(lastLook.current, true)
//       return
//     }
//     if (t >= CAM_END) {
//       handover(HERO_TARGET, false)
//       return
//     }
//     pose(t)
//   })

//   return null
// }

// /* ═══════════════════════════════════════════════════════════════
//    The disposable sheet

//    A plane in XZ. In the vertex shader its X coordinate is folded
//    into PANELS pleats whose angle opens from ~70° to almost flat
//    (uOpen 0 → 1). uSettle (0 → 1) flattens the arch, adds creases
//    and drapes the front / right edges over the mattress. Normals
//    are derived analytically so lighting follows every fold.
//    The same displacement runs in a custom depth material, so the
//    shadow it casts follows the folds too.
//    ═══════════════════════════════════════════════════════════════ */

// const HALF_W = SHEET_W / 2
// const HALF_D = SHEET_D / 2
// const PANEL_LEN = SHEET_W / PANELS

// const SHEET_GLSL = /* glsl */ `
// uniform float uOpen;
// uniform float uSettle;
// uniform float uTime;
// uniform float uMotion;

// float frHash(float n) { return fract(sin(n * 127.1) * 43758.5453); }

// vec3 sheetRaw(vec2 p) {
//   float s = p.x + ${glf(HALF_W)};
//   float x = 0.0;
//   float y = 0.0;
//   float xt = 0.0;
//   float zig = mix(1.0, 0.5, uSettle);
//   for (int i = 0; i < ${PANELS}; i++) {
//     float fi = float(i);
//     float segLen = clamp(s - fi * ${glf(PANEL_LEN)}, 0.0, ${glf(PANEL_LEN)});
//     float h = frHash(fi + 3.7);
//     float closedA = 1.15 + 0.2 * h;
//     float openA = 0.04 + 0.05 * h;
//     float ang = mix(closedA, openA, uOpen);
//     float dir = mod(fi, 2.0) < 0.5 ? 1.0 : -1.0;
//     x += segLen * cos(ang);
//     y += dir * segLen * sin(ang) * zig;
//     xt += ${glf(PANEL_LEN)} * cos(ang);
//   }
//   x -= xt * 0.5;
//   y -= 0.22 * (1.0 - uOpen);

//   float nx = p.x / ${glf(HALF_W)};
//   float nz = p.y / ${glf(HALF_D)};

//   // soft arch across the depth while it floats; flattens as it settles
//   y += 0.16 * (1.0 - nz * nz) * uOpen * (1.0 - uSettle);

//   // fine irregular wrinkles (stronger once it lies on the mattress)
//   float wr = 0.012 * (0.4 + 0.6 * uOpen) * (1.0 + 0.9 * uSettle);
//   y += sin(p.x * 7.0 + p.y * 3.1 + 1.3) * sin(p.y * 5.3 - p.x * 2.1) * wr;

//   // a few long, soft creases left behind by the folding
//   y += uSettle * 0.012 * sin(p.x * 3.3 + sin(p.y * 2.2) * 1.4) * (0.5 + 0.5 * sin(p.y * 4.1 - 0.6));

//   // lightweight motion; almost still after settling
//   float mot = uMotion * (1.0 - 0.85 * uSettle);
//   float freeEnd = 0.35 + 0.65 * (nx * 0.5 + 0.5);
//   y += sin(p.x * 2.3 - uTime * 0.8) * 0.035 * freeEnd * uOpen * mot;
//   y += sin(p.y * 3.1 + p.x * 1.1 + uTime * 0.6) * 0.018 * uOpen * mot;
//   float edge = nz * nz * max(nx, 0.0) * max(nx, 0.0);
//   y += edge * 0.07 * sin(uTime * 0.9 + p.y * 2.0) * uOpen * mot;

//   // drape over the front and right edges of the mattress
//   float overZ = max(p.y - ${glf(OVER_Z)}, 0.0);
//   float overX = max(p.x - ${glf(OVER_X)}, 0.0);
//   y -= uSettle * ((1.0 - exp(-overZ * 7.0)) * 0.34 + (1.0 - exp(-overX * 7.0)) * 0.3);

//   return vec3(x, y, p.y);
// }

// // 3-tap blur along the fold axis: rounds the creases so they read as fabric, not paper
// vec3 sheetPos(vec2 p) {
//   float w = 0.09;
//   return 0.25 * sheetRaw(p - vec2(w, 0.0)) + 0.5 * sheetRaw(p) + 0.25 * sheetRaw(p + vec2(w, 0.0));
// }

// vec3 sheetNormal(vec2 p) {
//   float e = 0.01;
//   vec3 c = sheetPos(p);
//   vec3 dx = sheetPos(p + vec2(e, 0.0)) - c;
//   vec3 dz = sheetPos(p + vec2(0.0, e)) - c;
//   return normalize(cross(dz, dx));
// }
// `

// type ShaderLike = { vertexShader: string; uniforms: Record<string, THREE.IUniform> }

// function NonwovenSheet({
//   time,
//   still,
//   lowPower,
//   texture,
//   sheetWorld,
// }: {
//   time: TimeRef
//   still: boolean
//   lowPower: boolean
//   texture: THREE.Texture
//   sheetWorld: THREE.Vector3
// }) {
//   const group = useRef<THREE.Group>(null!)

//   const geometry = useMemo(() => {
//     const g = new THREE.PlaneGeometry(SHEET_W, SHEET_D, lowPower ? 96 : 168, lowPower ? 28 : 48)
//     g.rotateX(-Math.PI / 2)
//     return g
//   }, [lowPower])

//   const uniforms = useMemo(
//     () => ({
//       uOpen: { value: 0 },
//       uSettle: { value: 0 },
//       uTime: { value: 0 },
//       uMotion: { value: still ? 0 : 1 },
//     }),
//     [still],
//   )

//   const bindUniforms = useMemo(
//     () => (shader: ShaderLike) => {
//       shader.uniforms.uOpen = uniforms.uOpen
//       shader.uniforms.uSettle = uniforms.uSettle
//       shader.uniforms.uTime = uniforms.uTime
//       shader.uniforms.uMotion = uniforms.uMotion
//     },
//     [uniforms],
//   )

//   const onBeforeCompile = useMemo(
//     () => (shader: ShaderLike) => {
//       bindUniforms(shader)
//       shader.vertexShader = shader.vertexShader
//         .replace('#include <common>', `#include <common>\n${SHEET_GLSL}`)
//         .replace(
//           '#include <beginnormal_vertex>',
//           '#include <beginnormal_vertex>\nobjectNormal = sheetNormal(position.xz);',
//         )
//         .replace(
//           '#include <begin_vertex>',
//           '#include <begin_vertex>\ntransformed = sheetPos(position.xz);',
//         )
//     },
//     [bindUniforms],
//   )

//   // shadow pass uses the same fold displacement
//   const depthMaterial = useMemo(() => {
//     const m = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking })
//     m.onBeforeCompile = (shader: ShaderLike) => {
//       bindUniforms(shader)
//       shader.vertexShader = shader.vertexShader
//         .replace('#include <common>', `#include <common>\n${SHEET_GLSL}`)
//         .replace(
//           '#include <begin_vertex>',
//           '#include <begin_vertex>\ntransformed = sheetPos(position.xz);',
//         )
//     }
//     m.customProgramCacheKey = () => 'fresh-ride-berth-sheet-depth-v1'
//     return m
//   }, [bindUniforms])

//   useEffect(() => () => geometry.dispose(), [geometry])
//   useEffect(() => () => depthMaterial.dispose(), [depthMaterial])

//   useFrame(() => {
//     const g = group.current
//     if (!g) return
//     const t = time.current

//     const emerge = still ? 1 : easeOutCubic(seg(t, T_LID.start + 0.3, 0.9))
//     const fl = still ? 1 : easeInOutCubic(seg(t, T_FLIGHT.start, T_FLIGHT.dur))
//     const se = still ? 1 : easeInOutCubic(seg(t, T_SETTLE.start, T_SETTLE.dur))

//     uniforms.uOpen.value = still ? 1 : 0.72 * fl + 0.28 * se
//     uniforms.uSettle.value = se
//     uniforms.uTime.value = t

//     g.visible = still || t > T_LID.start + 0.25

//     // start: inside the package; hover: above the berth; end: lying on the mattress
//     const sx = PKG_POS.x
//     const sy = PKG_POS.y + PH / 2 - 0.04
//     const sz = PKG_POS.z
//     const hx = SHEET_OFF.x
//     const hy = 0.62
//     const hz = SHEET_OFF.z

//     const x = lerp(sx, hx, fl)
//     const z = lerp(sz, hz, fl)
//     const arc = Math.sin(Math.PI * fl) * 0.85
//     const yFlight = lerp(sy, hy, fl) + arc
//     const y = lerp(yFlight, 0.025, se)

//     const sway = still ? 0 : (1 - se) * Math.sin(t * 0.5) * 0.05
//     const yaw = (1 - fl) * PKG_YAW + Math.sin(Math.PI * fl) * 0.25 + sway
//     const tiltZ = Math.sin(Math.PI * fl) * 0.3
//     const tiltX = (1 - se) * 0.18 * fl

//     const startScale = 0.28 * emerge
//     const scale = lerp(startScale, 1, fl)

//     g.position.set(x, y, z)
//     g.rotation.set(tiltX, yaw, tiltZ)
//     g.scale.setScalar(Math.max(0.001, scale))
//     sheetWorld.set(x, y, z)
//   })

//   return (
//     <group ref={group}>
//       <mesh geometry={geometry} frustumCulled={false} castShadow receiveShadow customDepthMaterial={depthMaterial}>
//         <meshPhysicalMaterial
//           color="#f8f4ec"
//           map={texture}
//           bumpMap={texture}
//           bumpScale={2.6}
//           roughness={0.95}
//           metalness={0}
//           side={THREE.DoubleSide}
//           shadowSide={THREE.DoubleSide}
//           sheen={0.55}
//           sheenRoughness={0.6}
//           sheenColor="#ffffff"
//           envMapIntensity={0.5}
//           onBeforeCompile={onBeforeCompile}
//           customProgramCacheKey={() => 'fresh-ride-berth-sheet-v4'}
//         />
//       </mesh>
//     </group>
//   )
// }

// function makePillowGeometry(width: number, depth: number, height: number) {
//   const radialSegments = 12
//   const angularSegments = 64
//   const verticesPerSurface = 1 + radialSegments * angularSegments
//   const positions: number[] = []
//   const uvs: number[] = []
//   const indices: number[] = []
//   const exponent = 5 / 7.5

//   const addSurface = (side: 1 | -1) => {
//     positions.push(0, side * height * 0.5, 0)
//     uvs.push(0.5, 0.5)

//     for (let ring = 1; ring <= radialSegments; ring++) {
//       const radius = ring / radialSegments
//       const y = side * height * 0.5 * Math.pow(Math.max(0, 1 - radius * radius), 0.42)

//       for (let segment = 0; segment < angularSegments; segment++) {
//         const angle = (segment / angularSegments) * Math.PI * 2
//         const cos = Math.cos(angle)
//         const sin = Math.sin(angle)
//         const x = (width / 2) * Math.sign(cos) * Math.pow(Math.abs(cos), exponent) * radius
//         const z = (depth / 2) * Math.sign(sin) * Math.pow(Math.abs(sin), exponent) * radius
//         positions.push(x, y, z)
//         uvs.push(x / width + 0.5, z / depth + 0.5)
//       }
//     }
//   }

//   addSurface(1)
//   addSurface(-1)

//   const ringVertex = (base: number, ring: number, segment: number) =>
//     base + 1 + (ring - 1) * angularSegments + (segment % angularSegments)

//   for (const [side, base] of [[1, 0], [-1, verticesPerSurface]] as const) {
//     const center = base
//     const firstRing = (segment: number) => ringVertex(base, 1, segment)

//     for (let segment = 0; segment < angularSegments; segment++) {
//       const next = (segment + 1) % angularSegments
//       indices.push(
//         center,
//         ...(side === 1 ? [firstRing(next), firstRing(segment)] : [firstRing(segment), firstRing(next)]),
//       )
//     }

//     for (let ring = 1; ring < radialSegments; ring++) {
//       for (let segment = 0; segment < angularSegments; segment++) {
//         const next = (segment + 1) % angularSegments
//         const inner = ringVertex(base, ring, segment)
//         const innerNext = ringVertex(base, ring, next)
//         const outer = ringVertex(base, ring + 1, segment)
//         const outerNext = ringVertex(base, ring + 1, next)
//         indices.push(
//           inner,
//           ...(side === 1
//             ? [innerNext, outerNext, inner, outerNext, outer]
//             : [outer, outerNext, innerNext, inner, outer, innerNext]),
//         )
//       }
//     }
//   }

//   const topEdge = (segment: number) => ringVertex(0, radialSegments, segment)
//   const bottomEdge = (segment: number) => ringVertex(verticesPerSurface, radialSegments, segment)
//   for (let segment = 0; segment < angularSegments; segment++) {
//     const next = (segment + 1) % angularSegments
//     indices.push(topEdge(segment), topEdge(next), bottomEdge(segment))
//     indices.push(topEdge(next), bottomEdge(next), bottomEdge(segment))
//   }

//   const geometry = new THREE.BufferGeometry()
//   geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
//   geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
//   geometry.setIndex(indices)
//   geometry.computeVertexNormals()
//   return geometry
// }

// /** Pillow stays on the berth while its protective cover is revealed from the package. */
// function Pillow({ texture }: { texture: THREE.Texture }) {
//   const geometry = useMemo(() => makePillowGeometry(0.74, 0.5, 0.19), [])
//   useEffect(() => () => geometry.dispose(), [geometry])

//   return (
//     <group position={[-0.96, 0.115, 0.02]} rotation={[0, 0.05, 0.01]}>
//       <mesh geometry={geometry} castShadow receiveShadow>
//         <meshPhysicalMaterial
//           color="#f8f5ee"
//           map={texture}
//           bumpMap={texture}
//           bumpScale={1.4}
//           roughness={0.95}
//           sheen={0.5}
//           sheenRoughness={0.6}
//           sheenColor="#ffffff"
//         />
//       </mesh>
//     </group>
//   )
// }

// function PillowCover({
//   time,
//   still,
//   texture,
// }: {
//   time: TimeRef
//   still: boolean
//   texture: THREE.Texture
// }) {
//   const ref = useRef<THREE.Group>(null!)
//   const geometry = useMemo(() => makePillowGeometry(0.77, 0.53, 0.195), [])
//   useEffect(() => () => geometry.dispose(), [geometry])

//   useFrame(() => {
//     const group = ref.current
//     if (!group) return

//     const progress = still ? 1 : easeInOutCubic(seg(time.current, T_PILLOW.start, T_PILLOW.dur))
//     group.visible = still || progress > 0.01

//     const startX = PKG_POS.x
//     const startY = PKG_POS.y + PH / 2 + 0.025
//     const startZ = PKG_POS.z
//     const endX = -0.96
//     const endY = 0.118
//     const endZ = 0.02
//     const arc = Math.sin(Math.PI * progress) * 0.55

//     group.position.set(lerp(startX, endX, progress), lerp(startY, endY, progress) + arc, lerp(startZ, endZ, progress))
//     group.rotation.set(
//       (1 - progress) * 0.35,
//       lerp(PKG_YAW, 0.05, progress),
//       (1 - progress) * -0.25,
//     )
//     group.scale.setScalar(lerp(0.22, 1, progress))
//   })

//   return (
//     <group ref={ref}>
//       <mesh geometry={geometry} castShadow receiveShadow>
//         <meshPhysicalMaterial
//           color="#f8f5ee"
//           map={texture}
//           bumpMap={texture}
//           bumpScale={1.2}
//           roughness={0.94}
//           sheen={0.55}
//           sheenRoughness={0.62}
//           sheenColor="#ffffff"
//         />
//       </mesh>
//     </group>
//   )
// }

// /* ═══════════════════════════════════════════════════════════════
//    The products — every piece of the Fresh Ride kit, built in-scene.
//    Each one flies out of the package and lands where it belongs.

//    ProductId values are what onProductClick returns: map them to
//    your product slugs.
//    ═══════════════════════════════════════════════════════════════ */

// export type ProductId =
//   | 'bedsheet'
//   | 'pillow-cover'
//   | 'travel-blanket'
//   | 'sleep-eye-mask'
//   | 'foam-ear-plugs'
//   | 'silicone-ear-plugs'
//   | 'neck-pillow'
//   | 'hygiene-kit'
//   | 'slippers'

// type V3 = [number, number, number]

// const PKG_MOUTH = new THREE.Vector3(PKG_POS.x, PKG_POS.y + PH / 2 + 0.08, PKG_POS.z)
// /** Top of the laid sheet on the mattress */
// const SURF = 0.027

// /** Moves its children from the open package to a resting pose, on an arc */
// function FlyIn({
//   time,
//   still,
//   t0,
//   dur,
//   to,
//   rot = [0, 0, 0],
//   arc = 0.6,
//   fromScale = 0.2,
//   spin = 0.6,
//   children,
// }: {
//   time: TimeRef
//   still: boolean
//   t0: number
//   dur: number
//   to: V3
//   rot?: V3
//   arc?: number
//   fromScale?: number
//   spin?: number
//   children: React.ReactNode
// }) {
//   const ref = useRef<THREE.Group>(null!)
//   useFrame(() => {
//     const g = ref.current
//     if (!g) return
//     const p = still ? 1 : easeInOutCubic(seg(time.current, t0, dur))
//     g.visible = still || p > 0.001
//     const bump = Math.sin(Math.PI * p)
//     g.position.set(
//       lerp(PKG_MOUTH.x, to[0], p),
//       lerp(PKG_MOUTH.y, to[1], p) + arc * bump,
//       lerp(PKG_MOUTH.z, to[2], p),
//     )
//     g.rotation.set(lerp(0.5, rot[0], p), lerp(PKG_YAW + spin, rot[1], p), lerp(-0.4, rot[2], p))
//     g.scale.setScalar(lerp(fromScale, 1, easeOutCubic(p)))
//   })
//   return <group ref={ref}>{children}</group>
// }

// /** 3D contoured sleep eye mask, lying on the pillow */
// function EyeMask({ decal }: { decal: THREE.Texture }) {
//   const { bodyGeo, strapGeo } = useMemo(() => {
//     const s = new THREE.Shape()
//     s.moveTo(0, 0.062)
//     s.bezierCurveTo(0.05, 0.085, 0.13, 0.085, 0.175, 0.045)
//     s.bezierCurveTo(0.205, 0.0, 0.18, -0.07, 0.11, -0.078)
//     s.bezierCurveTo(0.07, -0.082, 0.04, -0.06, 0.0, -0.048)
//     s.bezierCurveTo(-0.04, -0.06, -0.07, -0.082, -0.11, -0.078)
//     s.bezierCurveTo(-0.18, -0.07, -0.205, 0.0, -0.175, 0.045)
//     s.bezierCurveTo(-0.13, 0.085, -0.05, 0.085, 0, 0.062)
//     const body = new THREE.ExtrudeGeometry(s, {
//       depth: 0.03,
//       bevelEnabled: true,
//       bevelThickness: 0.014,
//       bevelSize: 0.012,
//       bevelSegments: 4,
//       curveSegments: 24,
//     })
//     body.rotateX(-Math.PI / 2)
//     const curve = new THREE.CatmullRomCurve3([
//       new THREE.Vector3(0.19, 0.005, 0),
//       new THREE.Vector3(0.26, 0.005, -0.07),
//       new THREE.Vector3(0.14, 0.005, -0.17),
//       new THREE.Vector3(-0.14, 0.005, -0.17),
//       new THREE.Vector3(-0.26, 0.005, -0.07),
//       new THREE.Vector3(-0.19, 0.005, 0),
//     ])
//     return { bodyGeo: body, strapGeo: new THREE.TubeGeometry(curve, 48, 0.011, 6, false) }
//   }, [])
//   useEffect(
//     () => () => {
//       bodyGeo.dispose()
//       strapGeo.dispose()
//     },
//     [bodyGeo, strapGeo],
//   )
//   return (
//     <group position={[0, 0.014, 0]}>
//       <mesh geometry={bodyGeo} castShadow receiveShadow>
//         <meshPhysicalMaterial
//           color="#2a2f37"
//           roughness={0.42}
//           sheen={1}
//           sheenColor="#8a96a8"
//           sheenRoughness={0.4}
//         />
//       </mesh>
//       <mesh geometry={strapGeo} castShadow>
//         <meshStandardMaterial color="#1f2329" roughness={0.85} />
//       </mesh>
//       <mesh position={[0.1, 0.0455, 0]} rotation={[-Math.PI / 2, 0, 0]}>
//         <planeGeometry args={[0.07, 0.07]} />
//         <meshStandardMaterial
//           map={decal}
//           transparent
//           depthWrite={false}
//           roughness={0.5}
//           polygonOffset
//           polygonOffsetFactor={-2}
//         />
//       </mesh>
//     </group>
//   )
// }

// /** Disposable foam ear plugs: a pair of bright capsules on a clear paper sachet */
// function FoamEarPlugs() {
//   return (
//     <group>
//       <RoundedBox args={[0.15, 0.012, 0.1]} radius={0.004} smoothness={2} position={[0, 0.006, 0]} castShadow receiveShadow>
//         <meshStandardMaterial color="#f4f1ea" roughness={0.6} />
//       </RoundedBox>
//       <mesh position={[0, 0.023, -0.02]} rotation={[0, 0.1, Math.PI / 2]} castShadow>
//         <capsuleGeometry args={[0.011, 0.045, 6, 14]} />
//         <meshStandardMaterial color="#f4a23c" roughness={1} />
//       </mesh>
//       <mesh position={[0.005, 0.023, 0.022]} rotation={[0, -0.15, Math.PI / 2]} castShadow>
//         <capsuleGeometry args={[0.011, 0.045, 6, 14]} />
//         <meshStandardMaterial color="#f4a23c" roughness={1} />
//       </mesh>
//     </group>
//   )
// }

// /** Reusable silicone ear plugs: flanged pair beside a round pastel case */
// function SiliconeEarPlugs({ decal }: { decal: THREE.Texture }) {
//   const plugGeo = useMemo(() => {
//     const pts = [
//       [0, 0],
//       [0.02, 0.002],
//       [0.014, 0.008],
//       [0.0085, 0.011],
//       [0.017, 0.017],
//       [0.0105, 0.02],
//       [0.0135, 0.026],
//       [0.0065, 0.031],
//       [0.011, 0.037],
//       [0.0075, 0.043],
//       [0, 0.046],
//     ].map(([r, y]) => new THREE.Vector2(r, y))
//     return new THREE.LatheGeometry(pts, 20)
//   }, [])
//   useEffect(() => () => plugGeo.dispose(), [plugGeo])
//   return (
//     <group>
//       <mesh position={[0, 0.013, 0]} castShadow receiveShadow>
//         <cylinderGeometry args={[0.05, 0.05, 0.026, 36]} />
//         <meshPhysicalMaterial color="#a9cdb5" roughness={0.4} clearcoat={0.3} clearcoatRoughness={0.4} />
//       </mesh>
//       <mesh position={[0, 0.033, 0]} castShadow>
//         <cylinderGeometry args={[0.052, 0.052, 0.014, 36]} />
//         <meshPhysicalMaterial color="#b9d8c3" roughness={0.35} clearcoat={0.4} clearcoatRoughness={0.35} />
//       </mesh>
//       <mesh position={[0, 0.0402, 0]} rotation={[-Math.PI / 2, 0, 0]}>
//         <planeGeometry args={[0.06, 0.06]} />
//         <meshStandardMaterial
//           map={decal}
//           transparent
//           depthWrite={false}
//           roughness={0.5}
//           polygonOffset
//           polygonOffsetFactor={-2}
//         />
//       </mesh>
//       <mesh geometry={plugGeo} position={[0.1, 0.02, -0.025]} rotation={[0, 0.2, Math.PI / 2]} castShadow>
//         <meshPhysicalMaterial color="#6fbdb4" roughness={0.3} clearcoat={0.5} clearcoatRoughness={0.3} />
//       </mesh>
//       <mesh geometry={plugGeo} position={[0.105, 0.02, 0.028]} rotation={[0, Math.PI - 0.15, Math.PI / 2]} castShadow>
//         <meshPhysicalMaterial color="#6fbdb4" roughness={0.3} clearcoat={0.5} clearcoatRoughness={0.3} />
//       </mesh>
//     </group>
//   )
// }

// /** Travel hygiene kit: zip pouch with the brand label, plus toothbrush and paste */
// function HygieneKit({ label }: { label: THREE.Texture }) {
//   return (
//     <group>
//       <RoundedBox args={[0.3, 0.07, 0.2]} radius={0.028} smoothness={4} position={[0, 0.035, 0]} castShadow receiveShadow>
//         <meshStandardMaterial color="#efe9dc" roughness={0.75} />
//       </RoundedBox>
//       <RoundedBox args={[0.304, 0.014, 0.204]} radius={0.007} smoothness={3} position={[0, 0.012, 0]} castShadow>
//         <meshStandardMaterial color={GREEN} roughness={0.7} />
//       </RoundedBox>
//       <mesh position={[0, 0.0695, -0.06]}>
//         <boxGeometry args={[0.24, 0.004, 0.008]} />
//         <meshStandardMaterial color="#c9ced3" metalness={1} roughness={0.3} />
//       </mesh>
//       <mesh position={[0.115, 0.072, -0.06]}>
//         <boxGeometry args={[0.022, 0.006, 0.014]} />
//         <meshStandardMaterial color="#c9ced3" metalness={1} roughness={0.3} />
//       </mesh>
//       <mesh position={[0, 0.0712, 0.008]} rotation={[-Math.PI / 2, 0, 0]}>
//         <planeGeometry args={[0.19, 0.19 * (334 / 1024)]} />
//         <meshStandardMaterial
//           map={label}
//           transparent
//           depthWrite={false}
//           roughness={0.6}
//           polygonOffset
//           polygonOffsetFactor={-2}
//         />
//       </mesh>
//       {/* toothbrush */}
//       <group position={[-0.07, 0, 0.17]} rotation={[0, 0.08, 0]}>
//         <RoundedBox args={[0.13, 0.008, 0.016]} radius={0.003} smoothness={2} position={[0, 0.004, 0]} castShadow>
//           <meshStandardMaterial color={GREEN} roughness={0.5} />
//         </RoundedBox>
//         <RoundedBox args={[0.034, 0.012, 0.015]} radius={0.003} smoothness={2} position={[0.08, 0.006, 0]} castShadow>
//           <meshStandardMaterial color="#f5f5f2" roughness={0.9} />
//         </RoundedBox>
//       </group>
//       {/* toothpaste */}
//       <group position={[0.1, 0, 0.17]} rotation={[0, -0.12, 0]}>
//         <mesh position={[0, 0.014, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
//           <capsuleGeometry args={[0.014, 0.07, 6, 14]} />
//           <meshStandardMaterial color="#fafafa" roughness={0.45} />
//         </mesh>
//         <mesh position={[0.06, 0.014, 0]} rotation={[0, 0, Math.PI / 2]} castShadow>
//           <cylinderGeometry args={[0.011, 0.011, 0.02, 16]} />
//           <meshStandardMaterial color={GOLD} roughness={0.4} />
//         </mesh>
//       </group>
//     </group>
//   )
// }

// /** Inflatable travel neck pillow: lands flat, then puffs up */
// function NeckPillow({
//   time,
//   still,
//   decal,
// }: {
//   time: TimeRef
//   still: boolean
//   decal: THREE.Texture
// }) {
//   const outer = useRef<THREE.Group>(null!)
//   const R = 0.16
//   const TUBE = 0.058
//   const FLAT = 0.75
//   const ARC = Math.PI * 1.55
//   const geo = useMemo(() => {
//     const g = new THREE.TorusGeometry(R, TUBE, 22, 56, ARC)
//     g.rotateZ(-0.275 * Math.PI) // opening faces the front of the berth
//     g.rotateX(-Math.PI / 2) // lay flat
//     return g
//   }, [ARC])
//   useEffect(() => () => geo.dispose(), [geo])

//   const ends = useMemo(() => {
//     const a1 = -0.275 * Math.PI
//     const a2 = a1 + ARC
//     return [a1, a2].map((a) => [Math.cos(a) * R, 0, -Math.sin(a) * R] as V3)
//   }, [ARC])

//   useFrame(() => {
//     const g = outer.current
//     if (!g) return
//     const p = still ? 1 : easeInOutCubic(seg(time.current, T_INFLATE.start, T_INFLATE.dur))
//     const e = easeOutCubic(p) + Math.sin(p * Math.PI) * 0.07
//     g.scale.set(lerp(0.9, 1, e), lerp(0.14, 1, e), lerp(0.9, 1, e))
//   })

//   const fabric = (
//     <meshPhysicalMaterial
//       color="#7da0a6"
//       roughness={0.88}
//       sheen={0.6}
//       sheenRoughness={0.55}
//       sheenColor="#e9f3f3"
//     />
//   )
//   return (
//     <group ref={outer}>
//       <mesh geometry={geo} position={[0, TUBE * FLAT, 0]} scale={[1, FLAT, 1]} castShadow receiveShadow>
//         {fabric}
//       </mesh>
//       {ends.map((p, i) => (
//         <mesh key={i} position={[p[0], TUBE * FLAT, p[2]]} scale={[1, FLAT, 1]} castShadow receiveShadow>
//           <sphereGeometry args={[TUBE, 20, 14]} />
//           {fabric}
//         </mesh>
//       ))}
//       <mesh position={[0, TUBE * FLAT, -(R + TUBE + 0.012)]} rotation={[Math.PI / 2, 0, 0]} castShadow>
//         <cylinderGeometry args={[0.011, 0.014, 0.034, 14]} />
//         <meshStandardMaterial color="#e9edf0" roughness={0.4} />
//       </mesh>
//       <mesh position={[0, TUBE * FLAT * 2 + 0.001, -R]} rotation={[-Math.PI / 2, 0, 0]}>
//         <planeGeometry args={[0.08, 0.08]} />
//         <meshStandardMaterial
//           map={decal}
//           transparent
//           depthWrite={false}
//           roughness={0.7}
//           polygonOffset
//           polygonOffsetFactor={-2}
//         />
//       </mesh>
//     </group>
//   )
// }

// /** Disposable travel slipper (terry upper, flat sole), toe pointing at −z */
// function Slipper({
//   terry,
//   decal,
//   mirror = false,
// }: {
//   terry: THREE.Texture
//   decal: THREE.Texture
//   mirror?: boolean
// }) {
//   const { soleGeo, domeGeo } = useMemo(() => {
//     const s = new THREE.Shape()
//     s.moveTo(0, -0.14)
//     s.bezierCurveTo(0.045, -0.14, 0.052, -0.09, 0.05, -0.04)
//     s.bezierCurveTo(0.048, 0.02, 0.062, 0.07, 0.055, 0.1)
//     s.bezierCurveTo(0.045, 0.14, -0.045, 0.14, -0.055, 0.1)
//     s.bezierCurveTo(-0.062, 0.07, -0.048, 0.02, -0.05, -0.04)
//     s.bezierCurveTo(-0.052, -0.09, -0.045, -0.14, 0, -0.14)
//     const sole = new THREE.ExtrudeGeometry(s, {
//       depth: 0.012,
//       bevelEnabled: true,
//       bevelThickness: 0.006,
//       bevelSize: 0.005,
//       bevelSegments: 3,
//       curveSegments: 20,
//     })
//     const dome = new THREE.SphereGeometry(1, 28, 14, 0, Math.PI * 2, 0, Math.PI / 2)
//     dome.rotateX(Math.PI / 2) // pole → +z (up, once the slipper is laid flat)
//     return { soleGeo: sole, domeGeo: dome }
//   }, [])
//   useEffect(
//     () => () => {
//       soleGeo.dispose()
//       domeGeo.dispose()
//     },
//     [soleGeo, domeGeo],
//   )
//   return (
//     <group scale={[mirror ? -1 : 1, 1, 1]}>
//       <group rotation={[-Math.PI / 2, 0, 0]}>
//         <mesh geometry={soleGeo} castShadow receiveShadow>
//           <meshStandardMaterial color="#cfc9bb" roughness={0.95} />
//         </mesh>
//         <mesh geometry={domeGeo} position={[0, 0.052, 0.012]} scale={[0.054, 0.088, 0.05]} castShadow receiveShadow>
//           <meshPhysicalMaterial
//             color="#f3efe6"
//             map={terry}
//             bumpMap={terry}
//             bumpScale={2}
//             roughness={1}
//             sheen={0.35}
//             sheenRoughness={0.8}
//             sheenColor="#ffffff"
//           />
//         </mesh>
//         <mesh position={[0, 0.056, 0.0625]}>
//           <planeGeometry args={[0.04, 0.04]} />
//           <meshStandardMaterial
//             map={decal}
//             transparent
//             depthWrite={false}
//             roughness={0.8}
//             polygonOffset
//             polygonOffsetFactor={-2}
//           />
//         </mesh>
//       </group>
//     </group>
//   )
// }

// /** Compact travel blanket: neatly folded, with a Fresh Ride paper band */
// function TravelBlanket({
//   time,
//   still,
//   texture,
//   label,
// }: {
//   time: TimeRef
//   still: boolean
//   texture: THREE.Texture
//   label: THREE.Texture
// }) {
//   const ref = useRef<THREE.Group>(null!)
//   const material = useMemo(
//     () =>
//       new THREE.MeshPhysicalMaterial({
//         color: '#d3ddd1',
//         map: texture,
//         bumpMap: texture,
//         bumpScale: 0.6,
//         roughness: 0.98,
//         sheen: 0.3,
//         sheenRoughness: 0.85,
//         sheenColor: new THREE.Color('#f3f1e8'),
//       }),
//     [texture],
//   )
//   const bandMat = useMemo(
//     () => new THREE.MeshStandardMaterial({ color: '#f1ece1', roughness: 0.7 }),
//     [],
//   )
//   useEffect(
//     () => () => {
//       material.dispose()
//       bandMat.dispose()
//     },
//     [material, bandMat],
//   )

//   useFrame(() => {
//     const group = ref.current
//     if (!group) return
//     const t = time.current
//     const progress = still ? 1 : easeInOutCubic(seg(t, T_BLANKET.start, T_BLANKET.dur))
//     group.visible = still || t > T_BLANKET.start
//     const arc = Math.sin(Math.PI * progress) * 0.6
//     group.position.set(
//       lerp(PKG_POS.x, 0.95, progress),
//       lerp(PKG_POS.y + PH / 2 + 0.05, 0.135, progress) + arc,
//       lerp(PKG_POS.z, -0.1, progress),
//     )
//     group.rotation.set(
//       (1 - progress) * 0.25,
//       lerp(PKG_YAW, 0.08, progress),
//       (1 - progress) * -0.2,
//     )
//     group.scale.setScalar(lerp(0.35, 1, easeOutCubic(progress)))
//   })

//   return (
//     <group ref={ref}>
//       <RoundedBox args={[0.98, 0.2, 0.64]} radius={0.05} smoothness={5} material={material} castShadow receiveShadow />
//       <RoundedBox args={[0.2, 0.206, 0.652]} radius={0.01} smoothness={3} material={bandMat} castShadow />
//       <mesh position={[0, 0.1045, 0]} rotation={[-Math.PI / 2, 0, 0]}>
//         <planeGeometry args={[0.17, 0.17 * (334 / 1024)]} />
//         <meshStandardMaterial
//           map={label}
//           transparent
//           depthWrite={false}
//           roughness={0.6}
//           polygonOffset
//           polygonOffsetFactor={-2}
//         />
//       </mesh>
//     </group>
//   )
// }

// function Products({
//   time,
//   still,
//   logo,
//   terry,
// }: {
//   time: TimeRef
//   still: boolean
//   logo: HTMLImageElement | null
//   terry: THREE.Texture
// }) {
//   const round = useCanvasTexture(256, 256, drawRoundMark, logo)
//   const label = useCanvasTexture(1024, 334, drawFrontLogo, logo)
//   const common = { time, still }
//   return (
//     <>
//       <TravelBlanket {...common} texture={terry} label={label} />

//       <FlyIn {...common} t0={T_MASK.start} dur={T_MASK.dur} to={[-0.93, 0.205, 0.04]} rot={[0, 0.15, 0]} arc={0.8}>
//         <EyeMask decal={round} />
//       </FlyIn>
//       <FlyIn {...common} t0={T_FOAM.start} dur={T_FOAM.dur} to={[-0.28, SURF, 0.5]} rot={[0, 0.3, 0]} arc={0.6}>
//         <FoamEarPlugs />
//       </FlyIn>
//       <FlyIn {...common} t0={T_SILICONE.start} dur={T_SILICONE.dur} to={[-0.58, SURF, 0.46]} rot={[0, -0.35, 0]} arc={0.6}>
//         <SiliconeEarPlugs decal={round} />
//       </FlyIn>
//       <FlyIn {...common} t0={T_HYGIENE.start} dur={T_HYGIENE.dur} to={[0.3, SURF, 0.4]} rot={[0, -0.22, 0]} arc={0.7}>
//         <HygieneKit label={label} />
//       </FlyIn>
//       <FlyIn {...common} t0={T_NECK.start} dur={T_NECK.dur} to={[-0.06, SURF, 0.08]} rot={[0, 0.1, 0]} arc={1.0}>
//         <NeckPillow {...common} decal={round} />
//       </FlyIn>
//       <FlyIn
//         {...common}
//         t0={T_SLIPPERS.start}
//         dur={T_SLIPPERS.dur}
//         to={[-0.5, FLOOR_Y + 0.012, 1.15]}
//         rot={[0, 0.12, 0]}
//         arc={0.9}
//         fromScale={0.15}
//       >
//         <Slipper terry={terry} decal={round} />
//       </FlyIn>
//       <FlyIn
//         {...common}
//         t0={T_SLIPPERS.start + 0.25}
//         dur={T_SLIPPERS.dur}
//         to={[-0.3, FLOOR_Y + 0.012, 1.2]}
//         rot={[0, -0.05, 0]}
//         arc={0.9}
//         fromScale={0.15}
//       >
//         <Slipper terry={terry} decal={round} mirror />
//       </FlyIn>
//     </>
//   )
// }

// /* ───────── Hotspot pins (DOM, anchored to 3D positions) ───────── */

// const HOTSPOTS: { id: ProductId; label: string; pos: V3 }[] = [
//   { id: 'bedsheet', label: 'Disposable Bedsheet', pos: [0.15, 0.25, -0.35] },
//   { id: 'pillow-cover', label: 'Disposable Pillow Cover', pos: [-1.15, 0.38, -0.12] },
//   { id: 'sleep-eye-mask', label: '3D Contoured Sleep Eye Mask', pos: [-0.85, 0.32, 0.12] },
//   { id: 'neck-pillow', label: 'Inflatable Neck Pillow', pos: [-0.06, 0.2, 0.08] },
//   { id: 'silicone-ear-plugs', label: 'Reusable Silicone Ear Plugs', pos: [-0.55, 0.12, 0.48] },
//   { id: 'foam-ear-plugs', label: 'Disposable Foam Ear Plugs', pos: [-0.28, 0.12, 0.5] },
//   { id: 'hygiene-kit', label: 'Travel Hygiene Kit', pos: [0.3, 0.2, 0.42] },
//   { id: 'travel-blanket', label: 'Compact Travel Blanket', pos: [0.95, 0.38, -0.1] },
//   { id: 'slippers', label: 'Disposable Travel Slippers', pos: [-0.4, -0.6, 1.18] },
// ]

// function Pin({
//   label,
//   show,
//   delay,
//   onClick,
// }: {
//   label: string
//   show: boolean
//   delay: number
//   onClick?: () => void
// }) {
//   const [hover, setHover] = useState(false)
//   return (
//     <button
//       type="button"
//       aria-label={label}
//       onClick={onClick}
//       onMouseEnter={() => setHover(true)}
//       onMouseLeave={() => setHover(false)}
//       onFocus={() => setHover(true)}
//       onBlur={() => setHover(false)}
//       style={{
//         all: 'unset',
//         position: 'relative',
//         display: 'inline-flex',
//         alignItems: 'center',
//         justifyContent: 'center',
//         minWidth: 18,
//         minHeight: 18,
//         cursor: onClick ? 'pointer' : 'default',
//         opacity: show ? 1 : 0,
//         transform: show ? 'scale(1)' : 'scale(0.5)',
//         transition: `opacity .6s ease ${delay}s, transform .6s ease ${delay}s`,
//         pointerEvents: show ? 'auto' : 'none',
//       }}
//     >
//       <span
//         style={{
//           position: 'absolute',
//           left: 0,
//           top: '50%',
//           transform: `translateY(-50%) translateX(${hover ? 0 : -6}px)`,
//           opacity: hover ? 1 : 0,
//           transition: 'opacity .2s ease, transform .2s ease',
//           whiteSpace: 'nowrap',
//           font: '600 11px/1 system-ui, -apple-system, sans-serif',
//           letterSpacing: '0.04em',
//           color: INK,
//           background: 'rgba(248,246,240,0.96)',
//           padding: '7px 10px',
//           borderRadius: 999,
//           boxShadow: '0 4px 14px rgba(0,0,0,0.3)',
//           pointerEvents: 'none',
//         }}
//       >
//         {label}
//       </span>
//     </button>
//   )
// }

// function Hotspots({
//   time,
//   still,
//   enabled,
//   onClick,
// }: {
//   time: TimeRef
//   still: boolean
//   enabled: boolean
//   onClick?: (id: ProductId) => void
// }) {
//   const [show, setShow] = useState(still)
//   useFrame(() => {
//     if (!show && time.current >= T_LABELS) setShow(true)
//   })
//   if (!enabled) return null
//   return (
//     <>
//       {HOTSPOTS.map((h, i) => (
//         <Html key={h.id} position={h.pos} center zIndexRange={[20, 0]}>
//           <Pin label={h.label} show={show} delay={i * 0.12} onClick={onClick ? () => onClick(h.id) : undefined} />
//         </Html>
//       ))}
//     </>
//   )
// }

// /* ═══════════════════════════════════════════════════════════════
//    The sleeper berth — corner cabin: quilted back + head walls,
//    charcoal base with steel trim, neutral upholstered mattress,
//    warm reading lamp and cove light.
//    ═══════════════════════════════════════════════════════════════ */

// const POD_TOP = 1.4
// const POD_H = POD_TOP - FLOOR_Y
// const POD_CY = (POD_TOP + FLOOR_Y) / 2
// const POD_X0 = -1.57
// const POD_X1 = 1.65

// function Berth() {
//   const quiltBack = useMemo(() => makeQuiltTexture((POD_X1 - POD_X0) / 0.32), [])
//   const quiltHead = useMemo(() => makeQuiltTexture(1.53 / 0.32), [])
//   const diaHead = useMemo(() => makeDiamondTexture(2.6, 1.5), [])
//   const diaBolster = useMemo(() => makeDiamondTexture(5.8, 0.6), [])
//   const windowTex = useMemo(() => makeWindowTexture(), [])
//   const glow = useMemo(() => makeGlowTexture(), [])
//   const pocketMesh = useMemo(makeMeshTexture, [])

//   const curtainGeo = useMemo(() => {
//     const g = new THREE.PlaneGeometry(0.5, 1.25, 56, 2)
//     const pos = g.attributes.position
//     for (let i = 0; i < pos.count; i++) {
//       const x = pos.getX(i)
//       const y = pos.getY(i)
//       const gather = 0.55 + 0.45 * ((y + 0.625) / 1.25) // folds deepen toward the bottom
//       pos.setZ(i, Math.sin(x * 42) * 0.04 * (1.5 - gather))
//     }
//     g.computeVertexNormals()
//     return g
//   }, [])

//   const mats = useMemo(() => {
//     const wall = (map: THREE.Texture) =>
//       new THREE.MeshStandardMaterial({
//         color: '#ece5d8',
//         map,
//         bumpMap: map,
//         bumpScale: 1.6,
//         roughness: 0.92,
//       })
//     const padded = (map: THREE.Texture) =>
//       new THREE.MeshPhysicalMaterial({
//         color: '#d9cfc0',
//         map,
//         bumpMap: map,
//         bumpScale: 2.2,
//         roughness: 0.62,
//         sheen: 0.6,
//         sheenRoughness: 0.5,
//         sheenColor: new THREE.Color('#fff4e0'),
//         clearcoat: 0.12,
//         clearcoatRoughness: 0.6,
//       })
//     return {
//       back: wall(quiltBack),
//       head: wall(quiltHead),
//       headboard: padded(diaHead),
//       bolster: padded(diaBolster),
//       mattress: new THREE.MeshPhysicalMaterial({
//         color: '#b9b1a4',
//         roughness: 0.95,
//         sheen: 0.5,
//         sheenRoughness: 0.8,
//         sheenColor: new THREE.Color('#ffffff'),
//       }),
//       base: new THREE.MeshStandardMaterial({ color: '#2d3237', roughness: 0.42, metalness: 0.25 }),
//       dark: new THREE.MeshStandardMaterial({ color: '#171a1d', roughness: 0.5, metalness: 0.25 }),
//       steel: new THREE.MeshStandardMaterial({
//         color: '#c9ced3',
//         metalness: 1,
//         roughness: 0.28,
//         envMapIntensity: 1.2,
//       }),
//       canopy: new THREE.MeshStandardMaterial({ color: '#efe9dd', roughness: 0.8 }),
//       curtain: new THREE.MeshStandardMaterial({
//         color: '#d8d0c2',
//         roughness: 0.92,
//         side: THREE.DoubleSide,
//       }),
//     }
//   }, [quiltBack, quiltHead, diaHead, diaBolster])

//   useEffect(
//     () => () => {
//       Object.values(mats).forEach((m) => m.dispose())
//       ;[quiltBack, quiltHead, diaHead, diaBolster, windowTex, glow, pocketMesh].forEach((t) => t.dispose())
//       curtainGeo.dispose()
//     },
//     [mats, quiltBack, quiltHead, diaHead, diaBolster, windowTex, glow, pocketMesh, curtainGeo],
//   )

//   const podW = POD_X1 - POD_X0
//   const podCx = (POD_X0 + POD_X1) / 2

//   return (
//     <group>
//       {/* ── pod shell: quilted back + head walls, charcoal corner posts ── */}
//       <mesh position={[podCx, POD_CY, -0.765]} material={mats.back} castShadow receiveShadow>
//         <boxGeometry args={[podW, POD_H, 0.06]} />
//       </mesh>
//       <mesh position={[-1.57, POD_CY, -0.035]} material={mats.head} castShadow receiveShadow>
//         <boxGeometry args={[0.1, POD_H, 1.53]} />
//       </mesh>
//       <RoundedBox
//         args={[0.1, POD_H, 0.14]}
//         radius={0.02}
//         smoothness={2}
//         position={[POD_X1, POD_CY, -0.72]}
//         material={mats.base}
//         castShadow
//         receiveShadow
//       />
//       <RoundedBox
//         args={[0.16, POD_H, 0.06]}
//         radius={0.02}
//         smoothness={2}
//         position={[-1.57, POD_CY, 0.76]}
//         material={mats.base}
//         castShadow
//         receiveShadow
//       />

//       {/* ── headliner / canopy with warm LED edge ── */}
//       <RoundedBox
//         args={[podW, 0.1, 0.55]}
//         radius={0.03}
//         smoothness={3}
//         position={[podCx, POD_TOP - 0.05, -0.495]}
//         material={mats.canopy}
//         castShadow
//         receiveShadow
//       />
//       <mesh position={[podCx, POD_TOP - 0.108, -0.235]}>
//         <boxGeometry args={[podW - 0.3, 0.012, 0.012]} />
//         <meshBasicMaterial color={EMIT_COVE} toneMapped={false} />
//       </mesh>

//       {/* ── window with half-drawn roller blind ── */}
//       <group position={[0.62, 0.64, -0.715]}>
//         <RoundedBox args={[1.16, 0.68, 0.04]} radius={0.02} smoothness={2} material={mats.dark} />
//         <mesh position={[0, 0, 0.0215]}>
//           <planeGeometry args={[1.02, 0.54]} />
//           <meshBasicMaterial map={windowTex} toneMapped={false} color={new THREE.Color(1.6, 1.6, 1.7)} />
//         </mesh>
//         <mesh position={[0, 0.18, 0.023]}>
//           <planeGeometry args={[1.02, 0.18]} />
//           <meshStandardMaterial color="#efe9dc" roughness={0.9} />
//         </mesh>
//         <mesh position={[0, 0.088, 0.026]} material={mats.steel}>
//           <boxGeometry args={[1.02, 0.012, 0.014]} />
//         </mesh>
//       </group>

//       {/* ── padded headboard, diamond tufted ── */}
//       <RoundedBox
//         args={[0.14, 0.78, 1.3]}
//         radius={0.06}
//         smoothness={4}
//         position={[-1.45, 0.38, 0]}
//         material={mats.headboard}
//         castShadow
//         receiveShadow
//       />

//       {/* ── padded side bolster along the wall ── */}
//       <RoundedBox
//         args={[2.82, 0.27, 0.2]}
//         radius={0.095}
//         smoothness={5}
//         position={[0.07, 0.125, -0.58]}
//         material={mats.bolster}
//         castShadow
//         receiveShadow
//       />

//       {/* ── mattress ── */}
//       <RoundedBox
//         args={[MAT_W, MAT_H, MAT_D]}
//         radius={0.07}
//         smoothness={4}
//         position={[0, -MAT_H / 2, 0]}
//         material={mats.mattress}
//         castShadow
//         receiveShadow
//       />

//       {/* ── charcoal base: steel trim, handle slots, recessed plinth with underglow ── */}
//       <RoundedBox
//         args={[BASE_W, 0.5, BASE_D]}
//         radius={0.03}
//         smoothness={3}
//         position={[0, -MAT_H - 0.25, 0]}
//         material={mats.base}
//         castShadow
//         receiveShadow
//       />
//       <mesh position={[0, -MAT_H - 0.004, BASE_D / 2 + 0.004]} material={mats.steel}>
//         <boxGeometry args={[BASE_W + 0.01, 0.018, 0.018]} />
//       </mesh>
//       <mesh position={[BASE_W / 2 + 0.004, -MAT_H - 0.004, 0]} material={mats.steel}>
//         <boxGeometry args={[0.018, 0.018, BASE_D + 0.01]} />
//       </mesh>
//       {[-0.72, 0.72].map((x) => (
//         <mesh key={x} position={[x, -0.44, BASE_D / 2 + 0.003]} material={mats.dark}>
//           <boxGeometry args={[0.55, 0.022, 0.012]} />
//         </mesh>
//       ))}
//       <mesh position={[0, FLOOR_Y + 0.04, 0]} material={mats.dark}>
//         <boxGeometry args={[BASE_W - 0.14, 0.08, BASE_D - 0.12]} />
//       </mesh>
//       <mesh position={[0, -0.728, BASE_D / 2 - 0.05]}>
//         <boxGeometry args={[BASE_W - 0.25, 0.01, 0.01]} />
//         <meshBasicMaterial color={EMIT_COVE} toneMapped={false} />
//       </mesh>
//       <mesh position={[0, FLOOR_Y + 0.016, BASE_D / 2 + 0.2]} rotation={[-Math.PI / 2, 0, 0]} scale={[3.5, 0.9, 1]}>
//         <planeGeometry args={[1, 1]} />
//         <meshBasicMaterial
//           map={glow}
//           color="#ffdca8"
//           transparent
//           opacity={0.38}
//           depthWrite={false}
//           toneMapped={false}
//         />
//       </mesh>

//       {/* ── gathered privacy curtain at the head end ── */}
//       <mesh geometry={curtainGeo} material={mats.curtain} position={[-1.28, 0.675, 0.7]} castShadow receiveShadow />
//       <mesh position={[-1.12, 1.32, 0.7]} rotation={[0, 0, Math.PI / 2]} material={mats.steel}>
//         <cylinderGeometry args={[0.012, 0.012, 1.0, 12]} />
//       </mesh>

//       {/* ── mesh storage pocket on the wall, with a water bottle ── */}
//       <group position={[-1.12, 0.66, -0.733]}>
//         <RoundedBox args={[0.4, 0.3, 0.012]} radius={0.01} smoothness={2} material={mats.dark} />
//         <mesh position={[0.06, -0.02, 0.03]} castShadow>
//           <cylinderGeometry args={[0.032, 0.032, 0.2, 20]} />
//           <meshPhysicalMaterial color="#8fb99a" roughness={0.35} clearcoat={0.4} />
//         </mesh>
//         <mesh position={[0.06, 0.092, 0.03]}>
//           <cylinderGeometry args={[0.02, 0.02, 0.024, 16]} />
//           <meshStandardMaterial color="#2d3237" roughness={0.5} />
//         </mesh>
//         <mesh position={[0, 0, 0.056]}>
//           <planeGeometry args={[0.38, 0.28]} />
//           <meshStandardMaterial map={pocketMesh} transparent alphaTest={0.1} roughness={0.9} />
//         </mesh>
//         <RoundedBox args={[0.4, 0.022, 0.016]} radius={0.006} smoothness={2} position={[0, 0.14, 0.056]} material={mats.base} />
//       </group>

//       {/* ── details: charging panel, grab bar, reading light ── */}
//       <group position={[-0.5, 0.42, -0.735]}>
//         <RoundedBox args={[0.14, 0.08, 0.014]} radius={0.006} smoothness={2} material={mats.steel} />
//         <mesh position={[-0.03, 0, 0.009]}>
//           <sphereGeometry args={[0.009, 10, 10]} />
//           <meshBasicMaterial color={EMIT_GOLD} toneMapped={false} />
//         </mesh>
//         <mesh position={[0.03, 0, 0.009]}>
//           <sphereGeometry args={[0.009, 10, 10]} />
//           <meshBasicMaterial color={EMIT_GREEN} toneMapped={false} />
//         </mesh>
//       </group>

//       <mesh position={[1.58, 0.42, -0.64]} material={mats.steel} castShadow>
//         <cylinderGeometry args={[0.014, 0.014, 0.62, 12]} />
//       </mesh>
//       {[0.14, 0.7].map((y) => (
//         <mesh key={y} position={[1.58, y, -0.66]} material={mats.steel}>
//           <boxGeometry args={[0.03, 0.03, 0.06]} />
//         </mesh>
//       ))}

//       <group position={[-0.95, POD_TOP - 0.1, -0.45]}>
//         <mesh material={mats.steel}>
//           <cylinderGeometry args={[0.07, 0.07, 0.02, 24]} />
//         </mesh>
//         <mesh position={[0, -0.012, 0]} rotation={[Math.PI / 2, 0, 0]}>
//           <circleGeometry args={[0.05, 24]} />
//           <meshBasicMaterial color={EMIT_LAMP} toneMapped={false} />
//         </mesh>
//         <sprite position={[0, -0.07, 0]} scale={[1.0, 1.0, 1]}>
//           <spriteMaterial
//             map={glow}
//             color="#ffd9a0"
//             transparent
//             opacity={0.36}
//             depthWrite={false}
//             toneMapped={false}
//           />
//         </sprite>
//         <pointLight position={[0, -0.12, 0]} color="#ffd9a0" intensity={1.3} distance={3.2} decay={2} />
//       </group>
//     </group>
//   )
// }

// /* ═══════════════════════════════════════════════════════════════
//    Fresh Ride package — minimal ivory box, blue/green accent stripe,
//    pastel tissue; the lid lifts and floats away; the logo and
//    wordmark are revealed once the sheet has settled.
//    ═══════════════════════════════════════════════════════════════ */

// const LID_W = PW + 0.03
// const LID_D = PD + 0.03

// function FreshRidePackage({
//   time,
//   still,
//   logo,
// }: {
//   time: TimeRef
//   still: boolean
//   logo: HTMLImageElement | null
// }) {
//   const group = useRef<THREE.Group>(null!)
//   const lid = useRef<THREE.Group>(null!)
//   const lidLogoMat = useRef<THREE.MeshStandardMaterial>(null!)
//   const frontLogoMat = useRef<THREE.MeshStandardMaterial>(null!)

//   const lidBaseTex = useCanvasTexture(1024, 682, drawLidBase, null)
//   const lidLogoTex = useCanvasTexture(1024, 682, drawLidLogo, logo)
//   const frontLogoTex = useCanvasTexture(1024, 334, drawFrontLogo, logo)
//   const stripeTex = useCanvasTexture(512, 16, drawStripe, null)
//   const tissueTex = useCanvasTexture(768, 540, drawTissue, null)

//   const boxMat = useMemo(
//     () =>
//       new THREE.MeshStandardMaterial({
//         color: '#f6f3ec',
//         roughness: 0.74,
//         metalness: 0,
//       }),
//     [],
//   )
//   useEffect(() => () => boxMat.dispose(), [boxMat])

//   useFrame(() => {
//     const g = group.current
//     const l = lid.current
//     if (!g || !l) return
//     const t = time.current

//     const enter = still ? 1 : easeOutCubic(seg(t, T_BOX_IN.start, T_BOX_IN.dur))
//     const lift = still ? 1 : easeInOut(seg(t, T_LID.start, T_LID.dur))
//     const close = still ? 0 : easeInOut(seg(t, T_LID_CLOSE.start, T_LID_CLOSE.dur))
//     const lidOpen = still ? 1 : Math.max(0, Math.min(1, lift * (1 - close)))
//     const brand = still ? 1 : easeOutCubic(seg(t, T_BRAND.start, T_BRAND.dur))

//     g.position.set(PKG_POS.x, PKG_POS.y + (1 - enter) * 0.6, PKG_POS.z)
//     g.rotation.set(0, PKG_YAW + (1 - enter) * 0.5, 0)
//     g.scale.setScalar(0.9 + 0.1 * enter)

//     // lid rises, then closes after the sheet is revealed, so the box feels finished
//     const lidBob = still ? 0 : Math.sin(t * 0.55) * 0.02 * lidOpen
//     l.position.set(lidOpen * 0.42, PH / 2 + 0.002 + lidOpen * 0.95 + lidBob, -lidOpen * 0.08)
//     l.rotation.set(lidOpen * 0.5, 0, -lidOpen * 0.1)

//     if (lidLogoMat.current) lidLogoMat.current.opacity = brand
//     if (frontLogoMat.current) frontLogoMat.current.opacity = brand
//   })

//   const wall = (
//     key: string,
//     args: [number, number, number],
//     pos: [number, number, number],
//   ) => (
//     <RoundedBox
//       key={key}
//       args={args}
//       radius={0.006}
//       smoothness={2}
//       position={pos}
//       material={boxMat}
//       castShadow
//       receiveShadow
//     />
//   )

//   return (
//     <group ref={group}>
//       {/* base: floor + four walls */}
//       {wall('bottom', [PW, 0.03, PD], [0, -PH / 2 + 0.015, 0])}
//       {wall('front', [PW, PH, PWALL], [0, 0, PD / 2 - PWALL / 2])}
//       {wall('back', [PW, PH, PWALL], [0, 0, -PD / 2 + PWALL / 2])}
//       {wall('left', [PWALL, PH, PD - 2 * PWALL], [-PW / 2 + PWALL / 2, 0, 0])}
//       {wall('right', [PWALL, PH, PD - 2 * PWALL], [PW / 2 - PWALL / 2, 0, 0])}

//       {/* tissue lining */}
//       <mesh position={[0, -PH / 2 + 0.045, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
//         <planeGeometry args={[PW - 2 * PWALL, PD - 2 * PWALL]} />
//         <meshStandardMaterial map={tissueTex} roughness={0.9} />
//       </mesh>

//       {/* front: accent stripe + logo label */}
//       <mesh position={[0, -PH / 2 + 0.032, PD / 2 + 0.001]}>
//         <planeGeometry args={[PW, 0.03]} />
//         <meshStandardMaterial map={stripeTex} roughness={0.6} />
//       </mesh>
//       <mesh position={[0, 0.02, PD / 2 + 0.0015]}>
//         <planeGeometry args={[0.8, 0.8 * (337 / 1024)]} />
//         <meshStandardMaterial
//           ref={frontLogoMat}
//           map={frontLogoTex}
//           transparent
//           opacity={0}
//           depthWrite={false}
//           roughness={0.6}
//         />
//       </mesh>

//       {/* lid */}
//       <group ref={lid}>
//         <RoundedBox
//           args={[LID_W, 0.025, LID_D]}
//           radius={0.006}
//           smoothness={2}
//           position={[0, PKG_LID_H - 0.0125, 0]}
//           material={boxMat}
//           castShadow
//           receiveShadow
//         />
//         <RoundedBox
//           args={[LID_W, PKG_LID_H, PWALL]}
//           radius={0.006}
//           smoothness={2}
//           position={[0, PKG_LID_H / 2, LID_D / 2 - PWALL / 2]}
//           material={boxMat}
//           castShadow
//         />
//         <RoundedBox
//           args={[LID_W, PKG_LID_H, PWALL]}
//           radius={0.006}
//           smoothness={2}
//           position={[0, PKG_LID_H / 2, -LID_D / 2 + PWALL / 2]}
//           material={boxMat}
//           castShadow
//         />
//         <RoundedBox
//           args={[PWALL, PKG_LID_H, LID_D - 2 * PWALL]}
//           radius={0.006}
//           smoothness={2}
//           position={[-LID_W / 2 + PWALL / 2, PKG_LID_H / 2, 0]}
//           material={boxMat}
//           castShadow
//         />
//         <RoundedBox
//           args={[PWALL, PKG_LID_H, LID_D - 2 * PWALL]}
//           radius={0.006}
//           smoothness={2}
//           position={[LID_W / 2 - PWALL / 2, PKG_LID_H / 2, 0]}
//           material={boxMat}
//           castShadow
//         />
//         <mesh position={[0, PKG_LID_H + 0.0013, 0]} rotation={[-Math.PI / 2, 0, 0]}>
//           <planeGeometry args={[LID_W - 0.04, LID_D - 0.04]} />
//           <meshStandardMaterial map={lidBaseTex} roughness={0.7} />
//         </mesh>
//         <mesh position={[0, PKG_LID_H + 0.0026, 0]} rotation={[-Math.PI / 2, 0, 0]}>
//           <planeGeometry args={[LID_W - 0.04, LID_D - 0.04]} />
//           <meshStandardMaterial
//             ref={lidLogoMat}
//             map={lidLogoTex}
//             transparent
//             opacity={0}
//             depthWrite={false}
//             roughness={0.6}
//           />
//         </mesh>
//       </group>
//     </group>
//   )
// }

// /* ═══════════════════════════════════════════════════════════════
//    Atmosphere: window light shafts, floating dust, floor
//    ═══════════════════════════════════════════════════════════════ */

// /* Window opening on the back wall (matches the <group> in Berth) */
// const WIN = { x0: 0.12, x1: 1.12, y0: 0.38, y1: 0.9, z: -0.69, cx: 0.62, cy: 0.64 }
// const BEAM_DIR = new THREE.Vector3(0.28, -0.58, 1.0).multiplyScalar(1.8)

// function makeBeamGeometry() {
//   const S = [
//     new THREE.Vector3(WIN.x0, WIN.y1, WIN.z), // TL
//     new THREE.Vector3(WIN.x1, WIN.y1, WIN.z), // TR
//     new THREE.Vector3(WIN.x1, WIN.y0, WIN.z), // BR
//     new THREE.Vector3(WIN.x0, WIN.y0, WIN.z), // BL
//   ]
//   // the shaft widens a little as it travels
//   const E = S.map((s) =>
//     s
//       .clone()
//       .add(BEAM_DIR)
//       .add(new THREE.Vector3((s.x - WIN.cx) * 0.35, (s.y - WIN.cy) * 0.2, 0)),
//   )
//   const positions: number[] = []
//   const uvs: number[] = []
//   const indices: number[] = []
//   let base = 0
//   for (let i = 0; i < 4; i++) {
//     const j = (i + 1) % 4
//     for (const v of [S[i], S[j], E[j], E[i]]) positions.push(v.x, v.y, v.z)
//     uvs.push(0, 1, 1, 1, 1, 0, 0, 0)
//     indices.push(base, base + 1, base + 2, base, base + 2, base + 3)
//     base += 4
//   }
//   const g = new THREE.BufferGeometry()
//   g.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
//   g.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2))
//   g.setIndex(indices)
//   return g
// }

// function LightBeams({ time, still }: { time: TimeRef; still: boolean }) {
//   const mat = useRef<THREE.MeshBasicMaterial>(null!)
//   const geometry = useMemo(makeBeamGeometry, [])
//   const tex = useMemo(makeBeamTexture, [])
//   useEffect(
//     () => () => {
//       geometry.dispose()
//       tex.dispose()
//     },
//     [geometry, tex],
//   )
//   useFrame(() => {
//     if (!mat.current) return
//     const t = time.current
//     const fade = still ? 1 : easeInOut(seg(t, 0.6, 3.0))
//     const flicker = still ? 0 : Math.sin(t * 0.35) * 0.012
//     mat.current.opacity = (0.085 + flicker) * fade
//   })
//   return (
//     <mesh geometry={geometry} frustumCulled={false} renderOrder={5}>
//       <meshBasicMaterial
//         ref={mat}
//         map={tex}
//         color="#dbe8ff"
//         transparent
//         opacity={0}
//         depthWrite={false}
//         blending={THREE.AdditiveBlending}
//         side={THREE.DoubleSide}
//         toneMapped={false}
//       />
//     </mesh>
//   )
// }

// const DUST_VERT = /* glsl */ `
// attribute float aPhase;
// attribute float aSize;
// uniform float uTime;
// uniform float uHeight;
// varying float vA;
// void main() {
//   vec3 p = position;
//   p.x += sin(uTime * 0.15 + aPhase * 6.283) * 0.12;
//   p.y += sin(uTime * 0.11 + aPhase * 12.0) * 0.08 + mod(uTime * 0.012 * (0.5 + aPhase) + aPhase * 3.0, 0.6) - 0.3;
//   p.z += cos(uTime * 0.13 + aPhase * 9.0) * 0.1;
//   vec4 mv = modelViewMatrix * vec4(p, 1.0);
//   gl_PointSize = clamp(aSize * uHeight * 0.5 * projectionMatrix[1][1] / -mv.z, 1.0, 48.0);
//   gl_Position = projectionMatrix * mv;
//   vA = 0.3 + 0.7 * (0.5 + 0.5 * sin(uTime * 0.6 + aPhase * 40.0));
// }
// `

// const DUST_FRAG = /* glsl */ `
// uniform float uFade;
// varying float vA;
// void main() {
//   float d = length(gl_PointCoord - 0.5);
//   float a = smoothstep(0.5, 0.0, d);
//   gl_FragColor = vec4(vec3(1.0, 0.93, 0.8), a * a * vA * 0.5 * uFade);
// }
// `

// function DustMotes({ time, still, count }: { time: TimeRef; still: boolean; count: number }) {
//   const { geometry, uniforms } = useMemo(() => {
//     let seed = 777
//     const rnd = () => {
//       seed = (seed * 16807) % 2147483647
//       return (seed - 1) / 2147483646
//     }
//     const pos = new Float32Array(count * 3)
//     const phase = new Float32Array(count)
//     const size = new Float32Array(count)
//     for (let i = 0; i < count; i++) {
//       pos[i * 3] = -1.7 + rnd() * 3.6
//       pos[i * 3 + 1] = -0.6 + rnd() * 1.9
//       pos[i * 3 + 2] = -0.6 + rnd() * 2.8
//       phase[i] = rnd()
//       size[i] = 0.01 + rnd() * 0.026
//     }
//     const g = new THREE.BufferGeometry()
//     g.setAttribute('position', new THREE.BufferAttribute(pos, 3))
//     g.setAttribute('aPhase', new THREE.BufferAttribute(phase, 1))
//     g.setAttribute('aSize', new THREE.BufferAttribute(size, 1))
//     return {
//       geometry: g,
//       uniforms: { uTime: { value: 0 }, uHeight: { value: 800 }, uFade: { value: 0 } },
//     }
//   }, [count])

//   useEffect(() => () => geometry.dispose(), [geometry])

//   useFrame(({ gl }) => {
//     const t = time.current
//     uniforms.uTime.value = t
//     uniforms.uFade.value = still ? 1 : easeInOut(seg(t, 1.0, 3.0))
//     gl.getDrawingBufferSize(_v2)
//     uniforms.uHeight.value = _v2.y
//   })

//   return (
//     <points geometry={geometry} frustumCulled={false} renderOrder={6}>
//       <shaderMaterial
//         uniforms={uniforms}
//         vertexShader={DUST_VERT}
//         fragmentShader={DUST_FRAG}
//         transparent
//         depthWrite={false}
//         blending={THREE.AdditiveBlending}
//       />
//     </points>
//   )
// }

// /** Glossy dark floor disc (opaque mode) or a shadow-only catcher (transparent mode) */
// function Floor({ transparent }: { transparent: boolean }) {
//   const fade = useMemo(makeFloorFadeTexture, [])
//   const aisle = useMemo(makeAisleTexture, [])
//   useEffect(
//     () => () => {
//       fade.dispose()
//       aisle.dispose()
//     },
//     [fade, aisle],
//   )

//   if (transparent) {
//     return (
//       <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y + 0.001, 0]} receiveShadow>
//         <planeGeometry args={[24, 24]} />
//         <shadowMaterial transparent opacity={0.3} />
//       </mesh>
//     )
//   }
//   return (
//     <>
//       <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, FLOOR_Y, 0]} receiveShadow>
//         <circleGeometry args={[9, 72]} />
//         <meshStandardMaterial
//           color="#1d2328"
//           roughness={0.4}
//           metalness={0.2}
//           alphaMap={fade}
//           transparent
//           depthWrite={false}
//           envMapIntensity={0.9}
//         />
//       </mesh>
//       {/* the bus aisle: ribbed rubber runner in front of the berth */}
//       <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0.1, FLOOR_Y + 0.004, 1.5]} receiveShadow>
//         <planeGeometry args={[3.8, 1.4]} />
//         <meshStandardMaterial map={aisle} bumpMap={aisle} bumpScale={1.5} roughness={0.55} metalness={0.05} />
//       </mesh>
//     </>
//   )
// }

// /* ═══════════════════════════════════════════════════════════════
//    Soft contact shadows (extra occlusion) + a travelling light sweep
//    ═══════════════════════════════════════════════════════════════ */

// function BlobShadow({
//   time,
//   still,
//   tex,
//   position,
//   scale,
//   opacity,
//   start = 0.3,
// }: {
//   time: TimeRef
//   still: boolean
//   tex: THREE.Texture
//   position: [number, number, number]
//   scale: [number, number]
//   opacity: number
//   start?: number
// }) {
//   const mat = useRef<THREE.MeshBasicMaterial>(null!)
//   useFrame(() => {
//     if (!mat.current) return
//     const enter = still ? 1 : easeOutCubic(seg(time.current, start, 1.4))
//     mat.current.opacity = opacity * enter
//   })
//   return (
//     <mesh position={position} rotation={[-Math.PI / 2, 0, 0]} scale={[scale[0], scale[1], 1]}>
//       <planeGeometry args={[1, 1]} />
//       <meshBasicMaterial
//         ref={mat}
//         map={tex}
//         transparent
//         opacity={0}
//         depthWrite={false}
//         toneMapped={false}
//       />
//     </mesh>
//   )
// }

// /** One warm highlight passes across the finished composition, then it idles slowly */
// function LightSweep({ time, still }: { time: TimeRef; still: boolean }) {
//   const light = useRef<THREE.PointLight>(null!)
//   useFrame(() => {
//     const l = light.current
//     if (!l) return
//     if (still) {
//       l.position.set(1.2, 2.3, 2.8)
//       l.intensity = 4
//       return
//     }
//     const t = time.current
//     const sweep = seg(t, T_SWEEP.start, T_SWEEP.dur)
//     const idle = seg(t, T_SWEEP.start + T_SWEEP.dur, 2)
//     const x = -2.5 + 5 * easeInOut(sweep) + idle * 0.8 * Math.sin(t * 0.3)
//     l.position.set(x, 2.3, 2.8)
//     l.intensity = 3 + 4 * Math.sin(Math.PI * sweep)
//   })
//   return <pointLight ref={light} color="#ffe6c4" distance={14} decay={2} intensity={3} />
// }

// /* ═══════════════════════════════════════════════════════════════
//    Scene
//    ═══════════════════════════════════════════════════════════════ */

// function Scene({
//   still,
//   lowPower,
//   logoSrc,
//   transparent,
//   focus,
//   showLabels,
//   onProductClick,
// }: {
//   still: boolean
//   lowPower: boolean
//   logoSrc?: string
//   transparent: boolean
//   focus: THREE.Vector3
//   showLabels: boolean
//   onProductClick?: (id: ProductId) => void
// }) {
//   const time = useRef<number>(still ? 99 : 0)
//   const logo = useLogoImage(logoSrc)
//   const sheetWorld = useMemo(() => new THREE.Vector3(PKG_POS.x, 0.2, PKG_POS.z), [])

//   const nonwoven = useMemo(() => makeNonwovenTexture(lowPower ? 256 : 384), [lowPower])
//   const shadow = useMemo(() => makeShadowTexture(), [])
//   const backdrop = useMemo(() => (transparent ? null : makeBackdropTexture()), [transparent])
//   useEffect(
//     () => () => {
//       nonwoven.dispose()
//       shadow.dispose()
//       backdrop?.dispose()
//     },
//     [nonwoven, shadow, backdrop],
//   )

//   const sy = FLOOR_Y + 0.012
//   const shadowSize = lowPower ? 1024 : 2048

//   return (
//     <>
//       <TimeKeeper time={time} still={still} />
//       <StillInvalidator still={still} />
//       <CameraDirector time={time} still={still} focus={focus} sheetWorld={sheetWorld} />

//       {backdrop && <primitive object={backdrop} attach="background" />}

//       {/* Key: warm, soft-shadowed. Cool daylight from the window. Cool rim to peel it off the dark. */}
//       <ambientLight intensity={0.22} />
//       <directionalLight
//         position={[4.5, 5.5, 3.5]}
//         intensity={2.4}
//         color="#ffe9cc"
//         castShadow
//         shadow-mapSize-width={shadowSize}
//         shadow-mapSize-height={shadowSize}
//         shadow-camera-left={-4}
//         shadow-camera-right={4}
//         shadow-camera-top={4}
//         shadow-camera-bottom={-4}
//         shadow-camera-near={0.5}
//         shadow-camera-far={18}
//         shadow-bias={-0.0003}
//         shadow-normalBias={0.03}
//       />
//       <directionalLight position={[-4.5, 1.5, 3.5]} intensity={0.3} color="#dfeaff" />
//       <directionalLight position={[-1.5, 3.2, -4.5]} intensity={1.6} color="#9cc7ff" />
//       <spotLight
//         position={[0.62, 0.75, -1.5]}
//         angle={0.62}
//         penumbra={1}
//         intensity={4}
//         distance={8}
//         decay={2}
//         color="#cfe2ff"
//       />
//       <LightSweep time={time} still={still} />

//       <Floor transparent={transparent} />
//       <BlobShadow
//         time={time}
//         still={still}
//         tex={shadow}
//         position={[0.15, sy, 0.1]}
//         scale={[5.4, 3.0]}
//         opacity={0.55}
//       />
//       <BlobShadow
//         time={time}
//         still={still}
//         tex={shadow}
//         position={[0.05, sy, 0.05]}
//         scale={[3.9, 2.1]}
//         opacity={0.4}
//       />
//       <BlobShadow
//         time={time}
//         still={still}
//         tex={shadow}
//         position={[PKG_POS.x, sy, PKG_POS.z]}
//         scale={[1.9, 1.4]}
//         opacity={0.5}
//         start={T_BOX_IN.start + 0.7}
//       />

//       <Berth />
//       <NonwovenSheet time={time} still={still} lowPower={lowPower} texture={nonwoven} sheetWorld={sheetWorld} />
//       <Pillow texture={nonwoven} />
//       <PillowCover time={time} still={still} texture={nonwoven} />
//       <Products time={time} still={still} logo={logo} terry={nonwoven} />
//       <FreshRidePackage time={time} still={still} logo={logo} />
//       <Hotspots time={time} still={still} enabled={showLabels} onClick={onProductClick} />

//       <LightBeams time={time} still={still} />
//       <DustMotes time={time} still={still} count={lowPower ? 90 : 260} />

//       {/* Seamless studio reflections — rendered once, never per frame */}
//       <Environment resolution={lowPower ? 64 : 128} frames={1}>
//         <Lightformer form="rect" intensity={1.6} position={[0, 5, -3]} scale={[14, 5, 1]} />
//         <Lightformer
//           form="rect"
//           intensity={1.2}
//           position={[-5, 2, 3]}
//           scale={[5, 8, 1]}
//           color="#cfe0ff"
//         />
//         <Lightformer
//           form="rect"
//           intensity={1.1}
//           position={[5, 2, 3]}
//           scale={[5, 8, 1]}
//           color="#ffe9cc"
//         />
//         <Lightformer
//           form="rect"
//           intensity={0.5}
//           position={[0, -1, 5]}
//           scale={[10, 2, 1]}
//           color="#ffffff"
//         />
//       </Environment>
//     </>
//   )
// }

// /* ═══════════════════════════════════════════════════════════════
//    Public component (HeroSection needs no edits; new props are optional)
//    ═══════════════════════════════════════════════════════════════ */

// export interface HeroScene3DProps {
//   /** prefers-reduced-motion: renders one finished, static frame */
//   reducedMotion?: boolean
//   /** phones / tablets: fewer vertices, smaller textures, lower pixel ratio, lighter post-processing */
//   lowPower?: boolean
//   /** URL of the logo (transparent PNG). Defaults to /images/butterfly-logo.png */
//   logoSrc?: string
//   /**
//    * Keep the canvas transparent so the page behind shows through (old behaviour).
//    * Disables the graded backdrop, floor and post-processing. Default false.
//    */
//   transparent?: boolean
//   /** 2.39:1 cinema bars that slide in over the intro. Default false. */
//   letterbox?: boolean
//   /** Hover pins on every product once the reveal finishes. Default true. */
//   showLabels?: boolean
//   /** Called with the product id when a pin is clicked, e.g. to scroll to / open that product. */
//   onProductClick?: (id: ProductId) => void
// }

// export default function HeroScene3D({
//   reducedMotion = false,
//   lowPower = false,
//   logoSrc = DEFAULT_LOGO,
//   transparent = false,
//   letterbox = false,
//   showLabels = true,
//   onProductClick,
// }: HeroScene3DProps) {
//   const wrapRef = useRef<HTMLDivElement>(null)
//   const [visible, setVisible] = useState(true)
//   const [ready, setReady] = useState(false)
//   const focus = useMemo(() => HERO_FOCUS.clone(), [])

//   // Pause the render loop whenever the hero is scrolled out of view
//   useEffect(() => {
//     const el = wrapRef.current
//     if (!el || typeof IntersectionObserver === 'undefined') return
//     const io = new IntersectionObserver(([entry]) => setVisible(entry.isIntersecting), {
//       threshold: 0,
//     })
//     io.observe(el)
//     return () => io.disconnect()
//   }, [])

//   // fade up from black once mounted
//   useEffect(() => {
//     const id = requestAnimationFrame(() => setReady(true))
//     return () => cancelAnimationFrame(id)
//   }, [])

//   const frameloop = reducedMotion ? 'demand' : visible ? 'always' : 'never'

//   const bar: React.CSSProperties = {
//     position: 'absolute',
//     left: 0,
//     right: 0,
//     background: '#000',
//     pointerEvents: 'none',
//     transition: 'height 2.2s cubic-bezier(0.22, 0.61, 0.36, 1)',
//     height: letterbox && ready ? '9%' : '0%',
//   }

//   return (
//     <div
//       ref={wrapRef}
//       role="img"
//       aria-label="A premium sleeper-bus berth where a Butterfly Fresh Ride disposable bedsheet unfolds from its package"
//       style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}
//     >
//       <Canvas
//         shadows="soft"
//         frameloop={frameloop}
//         dpr={lowPower ? [1, 1.25] : [1, 1.6]}
//         camera={{ position: [3.9, -0.35, 4.9], fov: 30, near: 0.1, far: 60 }}
//         gl={{
//           alpha: transparent,
//           antialias: true,
//           powerPreference: 'high-performance',
//         }}
//         onCreated={({ gl }) => {
//           gl.toneMapping = THREE.ACESFilmicToneMapping
//           gl.toneMappingExposure = 1.05
//         }}
//         style={{ background: 'transparent', touchAction: 'pan-y' }}
//       >
//         <Scene
//           still={reducedMotion}
//           lowPower={lowPower}
//           logoSrc={logoSrc}
//           transparent={transparent}
//           focus={focus}
//           showLabels={showLabels}
//           onProductClick={onProductClick}
//         />
//         <OrbitControls
//           makeDefault
//           enabled={reducedMotion}
//           enablePan={false}
//           enableZoom={false}
//           enableDamping
//           dampingFactor={0.08}
//           rotateSpeed={0.8}
//           minPolarAngle={Math.PI / 3.7}
//           maxPolarAngle={Math.PI / 1.9}
//           minAzimuthAngle={-0.5}
//           maxAzimuthAngle={1.5}
//           target={[0.1, 0.12, 0.35]}
//         />
//       </Canvas>

//       {letterbox && (
//         <>
//           <div style={{ ...bar, top: 0 }} />
//           <div style={{ ...bar, bottom: 0 }} />
//         </>
//       )}
//       {!transparent && (
//         <div
//           style={{
//             position: 'absolute',
//             inset: 0,
//             background: '#000',
//             pointerEvents: 'none',
//             opacity: ready ? 0 : 1,
//             transition: 'opacity 2.2s ease-out',
//           }}
//         />
//       )}
//     </div>
//   )
// }