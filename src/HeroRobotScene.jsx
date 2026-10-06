import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'

const MODEL_URL = '/assets/models/baymax/baymax-optimized.glb'
const FRAME_INTERVAL = 1000 / 30

const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value))

function disposeScene(root) {
  const geometries = new Set()
  const materials = new Set()
  const textures = new Set()

  root.traverse((object) => {
    if (object.geometry) geometries.add(object.geometry)
    const objectMaterials = Array.isArray(object.material) ? object.material : [object.material]
    objectMaterials.filter(Boolean).forEach((material) => {
      materials.add(material)
      Object.values(material).forEach((value) => {
        if (value?.isTexture) textures.add(value)
      })
    })
  })

  textures.forEach((texture) => texture.dispose())
  materials.forEach((material) => material.dispose())
  geometries.forEach((geometry) => geometry.dispose())
}

export default function HeroRobotScene({ onReady }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return undefined

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(29, 1, 0.1, 40)
    camera.position.set(0, 0.02, 8.4)
    camera.lookAt(0, -0.22, 0)

    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' })
    renderer.setClearColor(0x000000, 0)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.outputColorSpace = THREE.SRGBColorSpace
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.02
    mount.appendChild(renderer.domElement)

    const hemisphere = new THREE.HemisphereLight(0xffffff, 0xb8c5ce, 0.95)
    scene.add(hemisphere)

    const ambient = new THREE.AmbientLight(0xf5f8fb, 0.25)
    scene.add(ambient)

    const keyLight = new THREE.DirectionalLight(0xfff7e8, 1.25)
    keyLight.position.set(-4.2, 6.5, 5.8)
    keyLight.target.position.set(0, -0.35, 0)
    scene.add(keyLight, keyLight.target)

    const rimLight = new THREE.DirectionalLight(0xaacfff, 1)
    rimLight.position.set(5, 3.8, -4.5)
    scene.add(rimLight)

    const fillLight = new THREE.DirectionalLight(0xdcecff, 0.52)
    fillLight.position.set(3.5, -0.5, 5)
    scene.add(fillLight)

    const faceLight = new THREE.PointLight(0xffffff, 0.3, 12, 2)
    faceLight.position.set(0, 1.3, 5.5)
    scene.add(faceLight)

    const modelAnchor = new THREE.Group()
    scene.add(modelAnchor)

    let headPivot = null
    let modelRoot = null
    let shadowCatcher = null
    let disposed = false
    let targetYaw = 0
    let targetPitch = 0
    let currentYaw = 0
    let currentPitch = 0
    let yawVelocity = 0
    let pitchVelocity = 0
    let frame = 0
    let inViewport = false
    let lastRenderTime = 0

    const modelLoader = new GLTFLoader()

    modelLoader.loadAsync(MODEL_URL).then((gltf) => {
      const model = gltf.scene
      if (disposed) {
        disposeScene(model)
        return
      }

      const inflatableMaterial = new THREE.MeshStandardMaterial({
        color: 0xf5f7f8,
        roughness: 0.44,
        metalness: 0,
      })
      const headMaterial = new THREE.MeshStandardMaterial({
        color: 0xfafcfd,
        roughness: 0.4,
        metalness: 0,
      })
      const badgeMaterial = new THREE.MeshStandardMaterial({
        color: 0xe1e7ea,
        roughness: 0.36,
        metalness: 0.06,
      })

      const importedMaterials = new Set()
      model.traverse((object) => {
        if (!object.isMesh) return
        const sourceMaterials = Array.isArray(object.material) ? object.material : [object.material]
        sourceMaterials.filter(Boolean).forEach((material) => importedMaterials.add(material))
        object.material = object.name === 'Head'
          ? headMaterial
          : object.name === 'Stamp'
            ? badgeMaterial
            : inflatableMaterial
        object.castShadow = false
        object.receiveShadow = false
      })
      importedMaterials.forEach((material) => material.dispose())

      const head = model.getObjectByName('Head')
      if (head?.isMesh && head.parent) {
        const parent = head.parent
        const headBounds = new THREE.Box3().setFromObject(head)
        const headCenter = headBounds.getCenter(new THREE.Vector3())
        const headSize = headBounds.getSize(new THREE.Vector3())
        const pivotPoint = new THREE.Vector3(headCenter.x, headBounds.min.y + 0.2, headCenter.z)

        const faceMaterial = new THREE.MeshBasicMaterial({
          color: 0x111820,
          side: THREE.DoubleSide,
          toneMapped: false,
        })
        const face = new THREE.Group()
        face.name = 'Face'
        const eyeRadius = headSize.x * 0.052
        const eyeOffset = headSize.x * 0.19
        const eyeLine = new THREE.Mesh(
          new THREE.PlaneGeometry(eyeOffset * 2, eyeRadius * 0.52),
          faceMaterial,
        )
        const leftEye = new THREE.Mesh(new THREE.CircleGeometry(eyeRadius, 32), faceMaterial)
        const rightEye = new THREE.Mesh(new THREE.CircleGeometry(eyeRadius, 32), faceMaterial)
        leftEye.position.x = -eyeOffset
        rightEye.position.x = eyeOffset
        face.add(eyeLine, leftEye, rightEye)
        face.position.set(
          headCenter.x,
          headCenter.y + headSize.y * 0.035,
          headBounds.max.z + Math.max(0.05, headSize.z * 0.012),
        )
        head.add(face)

        parent.remove(head)
        headPivot = new THREE.Group()
        headPivot.name = 'HeadPivot'
        headPivot.position.copy(pivotPoint)
        headPivot.rotation.order = 'YXZ'
        head.position.sub(pivotPoint)
        headPivot.add(head)
        parent.add(headPivot)
      }

      const bounds = new THREE.Box3().setFromObject(model)
      const center = bounds.getCenter(new THREE.Vector3())
      const size = bounds.getSize(new THREE.Vector3())
      const scale = 3.72 / size.y
      model.scale.setScalar(scale)
      model.position.set(-center.x * scale, -center.y * scale - 0.2, -center.z * scale)
      model.rotation.y = THREE.MathUtils.degToRad(-25)

      modelRoot = model
      modelAnchor.add(model)

      model.updateMatrixWorld(true)
      const placedBounds = new THREE.Box3().setFromObject(model)
      const shadowCanvas = document.createElement('canvas')
      shadowCanvas.width = 256
      shadowCanvas.height = 128
      const shadowContext = shadowCanvas.getContext('2d')
      const shadowGradient = shadowContext.createRadialGradient(128, 64, 2, 128, 64, 118)
      shadowGradient.addColorStop(0, 'rgba(22, 35, 48, 0.34)')
      shadowGradient.addColorStop(0.38, 'rgba(22, 35, 48, 0.2)')
      shadowGradient.addColorStop(0.76, 'rgba(22, 35, 48, 0.055)')
      shadowGradient.addColorStop(1, 'rgba(22, 35, 48, 0)')
      shadowContext.fillStyle = shadowGradient
      shadowContext.fillRect(0, 0, shadowCanvas.width, shadowCanvas.height)
      const shadowTexture = new THREE.CanvasTexture(shadowCanvas)
      shadowTexture.colorSpace = THREE.SRGBColorSpace
      shadowCatcher = new THREE.Mesh(
        new THREE.PlaneGeometry(3.5, 1.5),
        new THREE.MeshBasicMaterial({
          map: shadowTexture,
          opacity: 0.72,
          transparent: true,
          depthWrite: false,
          toneMapped: false,
        }),
      )
      shadowCatcher.name = 'ContactShadow'
      shadowCatcher.rotation.x = -Math.PI / 2
      shadowCatcher.position.set(0, placedBounds.min.y + 0.018, 0.02)
      scene.add(shadowCatcher)
      mount.classList.add('is-loaded')
      onReady?.()
      startRendering()
    }).catch((error) => {
      console.error('Unable to load the Baymax model.', error)
      onReady?.()
    })

    const resize = () => {
      const width = mount.clientWidth
      const height = mount.clientHeight
      if (!width || !height) return
      camera.aspect = width / height
      camera.updateProjectionMatrix()
      renderer.setSize(width, height, false)
      startRendering()
    }

    const trackPointer = (event) => {
      const bounds = mount.getBoundingClientRect()
      const centerX = bounds.left + bounds.width / 2
      const centerY = bounds.top + bounds.height * 0.34
      const horizontal = clamp((event.clientX - centerX) / (window.innerWidth * 0.22), -1, 1)
      const vertical = clamp((event.clientY - centerY) / (window.innerHeight * 0.4), -1, 1)
      targetYaw = horizontal * 0.55
      targetPitch = vertical * 0.2
    }

    const centerHead = () => {
      targetYaw = 0
      targetPitch = 0
    }

    const render = (timestamp) => {
      frame = 0
      if (!inViewport || document.hidden) return

      if (!reducedMotion && timestamp - lastRenderTime < FRAME_INTERVAL) {
        frame = requestAnimationFrame(render)
        return
      }

      if (!reducedMotion) {
        const time = timestamp * 0.001
        if (modelRoot) {
          const breath = (Math.sin(time * 1.35) + 1) * 0.5
          modelAnchor.position.x = Math.sin(time * 0.9) * 0.012
          modelAnchor.position.y = Math.sin(time * 1.15) * 0.024 + Math.sin(time * 2.7) * 0.005 + breath * 0.008
          modelAnchor.rotation.x = Math.sin(time * 0.82) * 0.0035
          modelAnchor.rotation.z = Math.sin(time * 0.76) * 0.009 + Math.sin(time * 2.15) * 0.002
          modelAnchor.scale.set(
            1 + breath * 0.012,
            1 + breath * 0.004,
            1 + breath * 0.014,
          )
        }
        if (headPivot) {
          yawVelocity = (yawVelocity + (targetYaw - currentYaw) * 0.022) * 0.82
          pitchVelocity = (pitchVelocity + (targetPitch - currentPitch) * 0.022) * 0.82
          currentYaw += yawVelocity
          currentPitch += pitchVelocity
          headPivot.rotation.y = currentYaw
          headPivot.rotation.x = currentPitch
          headPivot.rotation.z = currentYaw * -0.045
        }
      }

      renderer.render(scene, camera)
      lastRenderTime = timestamp
      if (!reducedMotion) frame = requestAnimationFrame(render)
    }

    function startRendering() {
      if (frame || !inViewport || document.hidden) return
      frame = requestAnimationFrame(render)
    }

    const resizeObserver = new ResizeObserver(resize)
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      inViewport = entry.isIntersecting
      if (inViewport) startRendering()
      else if (frame) {
        cancelAnimationFrame(frame)
        frame = 0
      }
    }, { rootMargin: '100px' })

    const handleVisibilityChange = () => {
      if (document.hidden && frame) {
        cancelAnimationFrame(frame)
        frame = 0
      } else {
        startRendering()
      }
    }

    resizeObserver.observe(mount)
    visibilityObserver.observe(mount)
    resize()
    if (!reducedMotion) {
      window.addEventListener('pointermove', trackPointer, { passive: true })
      window.addEventListener('blur', centerHead)
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      disposed = true
      resizeObserver.disconnect()
      visibilityObserver.disconnect()
      window.removeEventListener('pointermove', trackPointer)
      window.removeEventListener('blur', centerHead)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      cancelAnimationFrame(frame)

      if (modelRoot) disposeScene(modelRoot)
      if (shadowCatcher) disposeScene(shadowCatcher)
      renderer.dispose()
      renderer.domElement.remove()
    }
  }, [])

  return <div ref={mountRef} className="hero-robot-canvas" aria-hidden="true" />
}
