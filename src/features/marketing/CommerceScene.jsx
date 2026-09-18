import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import './CommerceScene.css'

// Loaded only on public/auth pages; the seller workspace never initializes WebGL.
export default function CommerceScene({ variant = 'hero' }) {
  const hostRef = useRef(null)
  const controlsRef = useRef(null)
  const pausedRef = useRef(false)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    const host = hostRef.current
    let disposed = false
    let cleanup = () => {}
    async function start() {
      const THREE = await import('./scene-engine')
      const { RoundedBoxGeometry } = THREE
      if (disposed) return
      let renderer
      try {
        renderer = new THREE.WebGLRenderer({
          alpha: true,
          antialias: true,
          powerPreference: 'low-power',
        })
      } catch {
        host.dataset.state = 'fallback'
        return
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
      renderer.setClearColor(0x000000, 0)
      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.toneMappingExposure = 1.35
      renderer.domElement.setAttribute('aria-hidden', 'true')
      host.appendChild(renderer.domElement)
      const scene = new THREE.Scene()
      const camera = new THREE.OrthographicCamera(-10, 10, 5, -5, 0.1, 100)
      camera.position.set(0, 0, 20)
      scene.add(new THREE.HemisphereLight(0xffffff, 0xb1a3ba, 2.7))
      const key = new THREE.DirectionalLight(0xffffff, 4)
      key.position.set(-4, 7, 9)
      scene.add(key)
      const fill = new THREE.DirectionalLight(0xd8f9ff, 2)
      fill.position.set(6, 1, 4)
      scene.add(fill)
      const material = (color) =>
        new THREE.MeshStandardMaterial({
          color,
          roughness: 0.3,
          metalness: 0.08,
        })
      const coral = material('#ff674d'),
        lilac = material('#a791ed'),
        teal = material('#63ced0')
      const white = material('#fffdfb'),
        ink = material('#514369'),
        yellow = material('#ffc852')
      const box = (parent, size, position, mat, radius = 0.12) => {
        const mesh = new THREE.Mesh(
          new RoundedBoxGeometry(...size, 3, radius),
          mat,
        )
        mesh.position.set(...position)
        parent.add(mesh)
        return mesh
      }
      const ring = (parent, radius, tube, position, mat) => {
        const mesh = new THREE.Mesh(
          new THREE.TorusGeometry(radius, tube, 12, 48),
          mat,
        )
        mesh.position.set(...position)
        parent.add(mesh)
        return mesh
      }
      const bag = new THREE.Group()
      box(bag, [1.9, 2.05, 0.85], [0, 0, 0], coral)
      box(bag, [1.55, 0.05, 0.52], [0, 1.025, 0], ink, 0.02)
      for (const z of [-0.24, 0.3]) {
        const handle = ring(bag, 0.5, 0.085, [0, 1.12, z], coral)
        handle.scale.y = 1.25
      }
      box(bag, [1.06, 0.85, 0.06], [0, -0.12, 0.46], white, 0.08)
      for (let i = 0; i < 3; i++)
        box(
          bag,
          [0.15, 0.2 + i * 0.18, 0.05],
          [-0.27 + i * 0.27, -0.3 + i * 0.09, 0.51],
          coral,
          0.03,
        )

      const clipboard = new THREE.Group()
      box(clipboard, [1.7, 2.25, 0.25], [0, 0, 0], lilac)
      box(clipboard, [1.43, 1.92, 0.06], [0, -0.04, 0.16], white, 0.05)
      box(clipboard, [0.7, 0.3, 0.16], [0, 1.02, 0.23], yellow, 0.07)
      for (let i = 0; i < 3; i++) {
        const y = 0.52 - i * 0.5
        box(clipboard, [0.24, 0.24, 0.06], [-0.43, y, 0.22], teal, 0.04)
        box(clipboard, [0.62, 0.08, 0.04], [0.15, y + 0.06, 0.22], lilac, 0.02)
        box(clipboard, [0.42, 0.055, 0.04], [0.05, y - 0.1, 0.22], lilac, 0.02)
      }

      const tag = new THREE.Group()
      const shape = new THREE.Shape()
      shape.moveTo(-0.65, -0.8)
      shape.lineTo(0.65, -0.8)
      shape.lineTo(0.65, 0.48)
      shape.lineTo(0, 1)
      shape.lineTo(-0.65, 0.48)
      shape.closePath()
      const hole = new THREE.Path()
      hole.absarc(0, 0.58, 0.1, 0, Math.PI * 2, true)
      shape.holes.push(hole)
      const tagMesh = new THREE.Mesh(
        new THREE.ExtrudeGeometry(shape, {
          depth: 0.18,
          bevelEnabled: true,
          bevelSize: 0.07,
          bevelThickness: 0.07,
          bevelSegments: 4,
          steps: 1,
        }),
        teal,
      )
      tag.add(tagMesh)
      ring(tag, 0.11, 0.038, [-0.23, 0.08, 0.3], white)
      ring(tag, 0.11, 0.038, [0.23, -0.39, 0.3], white)
      box(tag, [0.075, 0.77, 0.06], [0, -0.16, 0.3], white, 0.03).rotation.z =
        -0.6

      const arrow = new THREE.Group()
      const arrowShape = new THREE.Shape()
      ;[
        [-0.23, -0.9],
        [0.23, -0.9],
        [0.23, 0.25],
        [0.65, 0.25],
        [0, 1],
        [-0.65, 0.25],
        [-0.23, 0.25],
      ].forEach(([x, y], i) =>
        i ? arrowShape.lineTo(x, y) : arrowShape.moveTo(x, y),
      )
      arrowShape.closePath()
      arrow.add(
        new THREE.Mesh(
          new THREE.ExtrudeGeometry(arrowShape, {
            depth: 0.25,
            bevelEnabled: true,
            bevelSize: 0.08,
            bevelThickness: 0.08,
            bevelSegments: 4,
            steps: 1,
          }),
          lilac,
        ),
      )

      const parcel = new THREE.Group()
      box(parcel, [1.3, 1.1, 1], [0, 0, 0], white)
      box(parcel, [0.28, 1.12, 1.02], [0, 0, 0], lilac, 0.04)
      box(parcel, [0.4, 0.27, 0.04], [0.33, -0.19, 0.53], teal, 0.03)
      const objects = [bag, clipboard, tag, arrow, parcel]
      objects.forEach((object) => scene.add(object))
      const pointer = { x: 0, y: 0 }
      let layout = [],
        width = 1,
        height = 1,
        frame = 0,
        elapsed = 0,
        lastTime = 0,
        visible = true,
        manualPause = pausedRef.current
      const motion = window.matchMedia('(prefers-reduced-motion: reduce)')
      const resize = () => {
        width = host.clientWidth
        height = host.clientHeight
        if (!width || !height) return
        renderer.setSize(width, height)
        const halfWidth = (width / height) * 5
        camera.left = -halfWidth
        camera.right = halfWidth
        camera.updateProjectionMatrix()
        if (variant === 'auth') {
          layout = [
            [-1.05, -0.25, 1.25],
            [1.7, 0.45, 0.8],
            [-2.1, 2.4, 0.55],
            [2, 2.6, 0.65],
            [1.2, -2.1, 0.8],
          ]
        } else if (width < 960) {
          layout = [
            [-halfWidth * 0.58, -2.8, 0.72],
            [halfWidth * 0.58, -2.8, 0.7],
            [-halfWidth * 0.72, 3.8, 0.34],
            [halfWidth * 0.72, 3.8, 0.34],
            [0, -3.4, 0.55],
          ]
        } else {
          layout = [
            [-halfWidth * 0.77, -0.65, 1.18],
            [halfWidth * 0.77, -0.65, 1.17],
            [-halfWidth * 0.55, 3.25, 0.61],
            [halfWidth * 0.55, 3.25, 0.72],
            [halfWidth * 0.53, -3.35, 0.68],
          ]
        }
        draw()
      }
      const draw = () => {
        objects.forEach((object, i) => {
          const [x, y, scale] = layout[i] || [0, 0, 1]
          object.position.set(
            x + pointer.x * 0.13 * (i % 2 ? 1 : -1),
            y + Math.sin(elapsed * 0.7 + i * 1.5) * 0.12 + pointer.y * 0.1,
            0,
          )
          object.scale.setScalar(scale)
          object.rotation.set(
            0.1 + Math.sin(elapsed * 0.5 + i) * 0.04,
            (i % 2 ? -0.32 : 0.32) + pointer.x * 0.14,
            (i % 2 ? -0.15 : 0.16) + Math.sin(elapsed * 0.5 + i) * 0.045,
          )
        })
        renderer.render(scene, camera)
        host.dataset.state = 'ready'
      }
      const stop = () => {
        cancelAnimationFrame(frame)
        frame = 0
        lastTime = 0
      }
      const tick = (time) => {
        if (lastTime) elapsed += Math.min((time - lastTime) / 1000, 0.05)
        lastTime = time
        draw()
        frame = requestAnimationFrame(tick)
      }
      const sync = () => {
        stop()
        const animate =
          visible && !document.hidden && !motion.matches && !manualPause
        host.dataset.motion = animate ? 'playing' : 'paused'
        if (animate) frame = requestAnimationFrame(tick)
        else draw()
      }
      const move = (event) => {
        if (motion.matches || manualPause) return
        const rect = host.getBoundingClientRect()
        pointer.x = ((event.clientX - rect.left) / width) * 2 - 1
        pointer.y = -(((event.clientY - rect.top) / height) * 2 - 1)
      }
      const parent = host.parentElement
      parent.addEventListener('pointermove', move)
      const observer = new ResizeObserver(resize)
      observer.observe(host)
      const intersection = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting
        sync()
      })
      intersection.observe(host)
      motion.addEventListener('change', sync)
      document.addEventListener('visibilitychange', sync)
      controlsRef.current = (value) => {
        manualPause = value
        sync()
      }
      resize()
      sync()
      cleanup = () => {
        stop()
        observer.disconnect()
        intersection.disconnect()
        parent.removeEventListener('pointermove', move)
        motion.removeEventListener('change', sync)
        document.removeEventListener('visibilitychange', sync)
        scene.traverse((object) => {
          object.geometry?.dispose()
        })
        ;[coral, lilac, teal, white, ink, yellow].forEach((mat) =>
          mat.dispose(),
        )
        renderer.dispose()
        renderer.domElement.remove()
        controlsRef.current = null
      }
    }
    start().catch(() => {
      if (!disposed) host.dataset.state = 'fallback'
    })
    return () => {
      disposed = true
      cleanup()
    }
  }, [variant])

  return (
    <>
      <div
        ref={hostRef}
        className={`commerce-scene commerce-scene-${variant}`}
        data-state="loading"
        aria-hidden="true"
      >
        <img className="scene-fallback" src="/seller-toolkit-3d.png" alt="" />
      </div>
      <button
        className="scene-motion-control"
        aria-label={paused ? 'Play animation' : 'Pause animation'}
        title={paused ? 'Play animation' : 'Pause animation'}
        onClick={() => {
          const next = !paused
          pausedRef.current = next
          setPaused(next)
          controlsRef.current?.(next)
        }}
      >
        {paused ? <Play size={15} /> : <Pause size={15} />}
      </button>
    </>
  )
}
