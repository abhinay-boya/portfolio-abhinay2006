import { useEffect, useRef, useState } from 'react'
import * as THREE from 'three'
import focusItems from './focusItems'

const nodeAngles = [0.28, 2.08, 3.58, 5.12]
const nodeRadii = [1.02, 0.94, 1.04, 0.97]
const FRAME_INTERVAL = 1000 / 30

function createLabelTexture(label, index, active, anisotropy) {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 128
  const context = canvas.getContext('2d')

  context.clearRect(0, 0, canvas.width, canvas.height)
  context.beginPath()
  context.roundRect(4, 4, 504, 120, 60)
  context.fillStyle = active ? '#0a0a0a' : '#efefed'
  context.fill()
  context.strokeStyle = active ? '#0a0a0a' : 'rgba(10, 10, 10, 0.3)'
  context.lineWidth = 1.5
  context.stroke()

  context.fillStyle = active ? '#969691' : '#777773'
  context.font = '500 20px Arial, sans-serif'
  context.textBaseline = 'middle'
  context.fillText(String(index + 1).padStart(2, '0'), 33, 64)

  context.fillStyle = active ? '#efefed' : '#0a0a0a'
  context.font = '600 30px Arial, sans-serif'
  context.fillText(label, 89, 64)

  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  texture.anisotropy = Math.min(anisotropy, 4)
  texture.minFilter = THREE.LinearMipmapLinearFilter
  texture.magFilter = THREE.LinearFilter
  return texture
}

function CoreFocusOrbit() {
  const mountRef = useRef(null)
  const [activeIndex, setActiveIndex] = useState(-1)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const scene = new THREE.Scene()
    const camera = new THREE.OrthographicCamera(-5, 5, 3.5, -3.5, 0.1, 20)
    camera.position.z = 10

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    mount.appendChild(renderer.domElement)

    const haloGeometry = new THREE.RingGeometry(1.08, 1.095, 96)
    const haloMaterial = new THREE.MeshBasicMaterial({
      color: 0x0a0a0a,
      transparent: true,
      opacity: 0.14,
      side: THREE.DoubleSide,
    })
    const halo = new THREE.Mesh(haloGeometry, haloMaterial)
    scene.add(halo)

    const connectors = focusItems.map(() => {
      const geometry = new THREE.BufferGeometry()
      geometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(6), 3))
      const material = new THREE.LineBasicMaterial({
        color: 0x555550,
        transparent: true,
        opacity: 0.25,
      })
      const line = new THREE.Line(geometry, material)
      scene.add(line)
      return line
    })

    const labelGeometry = new THREE.PlaneGeometry(3.3, 0.84)
    const maxAnisotropy = renderer.capabilities.getMaxAnisotropy()
    const labels = focusItems.map((label, index) => {
      const defaultTexture = createLabelTexture(label, index, false, maxAnisotropy)
      const activeTexture = createLabelTexture(label, index, true, maxAnisotropy)
      const material = new THREE.MeshBasicMaterial({
        map: defaultTexture,
        transparent: true,
        depthTest: false,
        toneMapped: false,
      })
      const mesh = new THREE.Mesh(labelGeometry, material)
      mesh.userData.index = index
      mesh.userData.defaultTexture = defaultTexture
      mesh.userData.activeTexture = activeTexture
      scene.add(mesh)
      return mesh
    })

    const raycaster = new THREE.Raycaster()
    const pointer = new THREE.Vector2()
    const clock = new THREE.Clock()
    let hoveredIndex = -1
    let phase = 0.24
    let frame = 0
    let radiusX = 3.35
    let radiusY = 2.12
    let compact = false
    let inViewport = false
    let lastRenderTime = 0

    const updateHover = (nextIndex) => {
      if (hoveredIndex === nextIndex) return
      hoveredIndex = nextIndex
      setActiveIndex(nextIndex)
      mount.classList.toggle('is-node-hovered', nextIndex >= 0)
    }

    const handlePointerMove = (event) => {
      const bounds = mount.getBoundingClientRect()
      pointer.x = ((event.clientX - bounds.left) / bounds.width) * 2 - 1
      pointer.y = -(((event.clientY - bounds.top) / bounds.height) * 2 - 1)
      raycaster.setFromCamera(pointer, camera)
      const intersection = raycaster.intersectObjects(labels, false)[0]
      updateHover(intersection ? intersection.object.userData.index : -1)
    }

    const handlePointerLeave = () => updateHover(-1)

    const resize = () => {
      const bounds = mount.getBoundingClientRect()
      const width = Math.max(1, bounds.width)
      const height = Math.max(1, bounds.height)
      const aspect = width / height
      const viewHeight = 7

      compact = width < 580
      radiusX = compact ? 1.3 : 3.35
      radiusY = compact ? 2.08 : 2.12
      camera.left = -(viewHeight * aspect) / 2
      camera.right = (viewHeight * aspect) / 2
      camera.top = viewHeight / 2
      camera.bottom = -viewHeight / 2
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
    }

    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(mount)
    mount.addEventListener('pointermove', handlePointerMove, { passive: true })
    mount.addEventListener('pointerleave', handlePointerLeave, { passive: true })
    resize()

    const render = (timestamp) => {
      frame = 0
      if (timestamp - lastRenderTime < FRAME_INTERVAL) {
        if (inViewport && !document.hidden) frame = requestAnimationFrame(render)
        return
      }

      const delta = Math.min(clock.getDelta(), 0.05)
      if (!reducedMotion && hoveredIndex < 0) phase += delta * 0.055

      labels.forEach((label, index) => {
        const angle = nodeAngles[index] + phase
        const x = Math.cos(angle) * radiusX * nodeRadii[index]
        const y = Math.sin(angle) * radiusY * nodeRadii[index]
        label.position.set(x, y, 0)

        const isHovered = hoveredIndex === index
        const targetOpacity = hoveredIndex < 0 || isHovered ? 1 : 0.3
        const baseScale = compact ? 0.75 : 1
        const targetScale = baseScale * (isHovered ? 1.07 : 1)
        const scale = THREE.MathUtils.lerp(label.scale.x, targetScale, 0.12)
        label.scale.setScalar(scale)
        label.material.opacity = THREE.MathUtils.lerp(label.material.opacity, targetOpacity, 0.12)
        label.material.map = isHovered ? label.userData.activeTexture : label.userData.defaultTexture

        const connector = connectors[index]
        const positionAttribute = connector.geometry.getAttribute('position')
        positionAttribute.setXYZ(0, 0, 0, -0.01)
        positionAttribute.setXYZ(1, x, y, -0.01)
        positionAttribute.needsUpdate = true
        const targetLineOpacity = hoveredIndex < 0 ? 0.25 : (isHovered ? 0.72 : 0.07)
        connector.material.opacity = THREE.MathUtils.lerp(connector.material.opacity, targetLineOpacity, 0.12)
      })

      halo.rotation.z -= delta * 0.025
      renderer.render(scene, camera)
      lastRenderTime = timestamp
      if (inViewport && !document.hidden) frame = requestAnimationFrame(render)
    }

    const startRendering = () => {
      if (frame || !inViewport || document.hidden) return
      clock.getDelta()
      frame = requestAnimationFrame(render)
    }

    const playbackObserver = new IntersectionObserver(([entry]) => {
      inViewport = entry.isIntersecting
      if (inViewport) startRendering()
      else if (frame) {
        cancelAnimationFrame(frame)
        frame = 0
      }
    }, { rootMargin: '80px 0px' })

    const handleVisibilityChange = () => {
      if (document.hidden && frame) {
        cancelAnimationFrame(frame)
        frame = 0
      } else {
        startRendering()
      }
    }

    playbackObserver.observe(mount)
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      cancelAnimationFrame(frame)
      resizeObserver.disconnect()
      playbackObserver.disconnect()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      mount.removeEventListener('pointermove', handlePointerMove)
      mount.removeEventListener('pointerleave', handlePointerLeave)
      mount.classList.remove('is-node-hovered')
      labels.forEach((label) => {
        label.userData.defaultTexture.dispose()
        label.userData.activeTexture.dispose()
        label.material.dispose()
      })
      connectors.forEach((connector) => {
        connector.geometry.dispose()
        connector.material.dispose()
      })
      labelGeometry.dispose()
      haloGeometry.dispose()
      haloMaterial.dispose()
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  const activeLabel = activeIndex >= 0 ? focusItems[activeIndex] : 'Systems Core'

  return (
    <div className="core-orbit" ref={mountRef} aria-hidden="true">
      <div className="pointer-events-none absolute top-1/2 left-1/2 z-[1] grid size-28 -translate-1/2 place-items-center rounded-full border border-ink bg-ink text-center text-paper sm:size-32">
        <div>
          <span className="block text-[.55rem] tracking-[.13em] text-paper/40 uppercase">{activeIndex >= 0 ? String(activeIndex + 1).padStart(2, '0') : '04 / Focus'}</span>
          <span className="mx-auto mt-1 block max-w-24 text-[.8rem] leading-tight font-medium tracking-[-.02em]">{activeLabel}</span>
          <span className="mt-2 block text-[.5rem] tracking-[.13em] text-paper/35 uppercase">{activeIndex >= 0 ? 'Focus locked' : 'Engineering'}</span>
        </div>
      </div>
    </div>
  )
}

export default CoreFocusOrbit
