import { lazy, Suspense, useEffect, useRef, useState } from 'react'

const CoreFocusOrbit = lazy(() => import('./CoreFocusOrbit'))

function DeferredCoreFocusOrbit() {
  const boundaryRef = useRef(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const boundary = boundaryRef.current
    if (!boundary) return undefined

    if (!('IntersectionObserver' in window)) {
      setReady(true)
      return undefined
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return
      setReady(true)
      observer.disconnect()
    }, { rootMargin: '400px 0px' })

    observer.observe(boundary)
    return () => observer.disconnect()
  }, [])

  return (
    <div className="absolute inset-0" ref={boundaryRef}>
      {ready && (
        <Suspense fallback={null}>
          <CoreFocusOrbit />
        </Suspense>
      )}
    </div>
  )
}

export default DeferredCoreFocusOrbit
