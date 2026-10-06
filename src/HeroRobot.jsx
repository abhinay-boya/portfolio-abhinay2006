import { lazy, Suspense } from 'react'

const HeroRobotScene = lazy(() => import('./HeroRobotScene'))

export default function HeroRobot({ onReady }) {
  return (
    <div className="hero-robot" aria-label="Interactive 3D robot companion" role="img">
      <span className="hero-robot-aura" aria-hidden="true" />
      <Suspense fallback={<span className="hero-robot-fallback" aria-hidden="true" />}>
        <HeroRobotScene onReady={onReady} />
      </Suspense>
    </div>
  )
}
