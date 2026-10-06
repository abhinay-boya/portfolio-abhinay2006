import { useEffect, useRef, useState } from 'react'
import Lenis from 'lenis'
import DeferredCoreFocusOrbit from './DeferredCoreFocusOrbit'
import HeroRobot from './HeroRobot'
import focusItems from './focusItems'

const navigation = [
  { label: 'About', href: '#about' },
  { label: 'Projects', href: '#projects' },
  { label: 'Skills', href: '#skills' },
  { label: 'Experience', href: '#experience' },
  { label: 'Contact', href: '#contact' },
]

const projects = [
  {
    number: '01',
    name: 'AgentFlow',
    mark: 'AF',
    type: 'Agentic AI / Platform',
    year: '2026',
    description: 'A collaborative workspace for planning, running, and reviewing multi-step AI agent workflows with human checkpoints.',
    stack: ['React', 'Node.js', 'Python'],
    visual: 'orbit',
    demoUrl: '',
    sourceUrl: '',
  },
  {
    number: '02',
    name: 'QueueCore',
    mark: 'QC',
    type: 'Distributed Systems',
    year: '2026',
    description: 'A fault-tolerant background job platform with retries, worker health monitoring, scheduling, and live queue metrics.',
    stack: ['Java', 'Redis', 'Docker'],
    visual: 'grid',
    demoUrl: '',
    sourceUrl: '',
  },
  {
    number: '03',
    name: 'Campus Connect',
    mark: 'CC',
    type: 'Full-Stack / Community',
    year: '2025',
    description: 'A student collaboration hub for discovering clubs, coordinating events, and finding teammates for campus projects.',
    stack: ['TypeScript', 'Express', 'PostgreSQL'],
    visual: 'signal',
    demoUrl: '',
    sourceUrl: '',
  },
  {
    number: '04',
    name: 'SpendWise',
    mark: 'SW',
    type: 'Fintech / Dashboard',
    year: '2025',
    description: 'A focused personal finance dashboard that turns transactions into clear budgets, trends, and actionable insights.',
    stack: ['React', 'REST API', 'PostgreSQL'],
    visual: 'radial',
    demoUrl: '',
    sourceUrl: '',
  },
]

const skillGroups = [
  {
    icon: 'ϟ',
    title: 'Languages',
    description: 'Core programming languages I work with daily',
    items: [
      { name: 'JavaScript', mark: 'JS', color: '#f7df1e' },
      { name: 'TypeScript', mark: 'TS', color: '#3178c6' },
      { name: 'Python', mark: 'Py', color: '#4b8bbe' },
      { name: 'Java', mark: 'Jv', color: '#f89820' },
      { name: 'C++', mark: 'C+', color: '#5c8dbc' },
      { name: 'C', mark: 'C', color: '#a8b9cc' },
    ],
  },
  {
    icon: '⌁',
    title: 'Frameworks & Runtime',
    description: 'Tools and frameworks for building scalable applications',
    items: [
      { name: 'React', mark: '⚛', color: '#61dafb' },
      { name: 'Next.js', mark: 'N', color: '#f5f5f5' },
      { name: 'Node.js', mark: 'JS', color: '#68a063' },
      { name: 'Express', mark: 'ex', color: '#b8b8b8' },
      { name: 'Tailwind CSS', mark: '≈', color: '#38bdf8' },
      { name: 'Shadcn UI', mark: '//', color: '#f5f5f5' },
    ],
  },
  {
    icon: '▦',
    title: 'Databases & DevOps',
    description: 'Data persistence, deployment, and version control',
    items: [
      { name: 'PostgreSQL', mark: 'PG', color: '#336791' },
      { name: 'MongoDB', mark: '◆', color: '#47a248' },
      { name: 'Docker', mark: 'D', color: '#2496ed' },
      { name: 'Git', mark: '◇', color: '#f05032' },
    ],
  },
]

const experience = [
  {
    period: '2024 — Present',
    role: 'Independent Designer & Developer',
    company: 'Freelance · Remote',
    detail: 'Designing and building focused digital experiences for independent brands, founders, and creative teams.',
  },
  {
    period: '2023 — 2024',
    role: 'UI/UX Designer',
    company: 'Creative Studio',
    detail: 'Created interface systems, prototypes, and responsive product experiences from early concept to launch.',
  },
  {
    period: '2022 — 2023',
    role: 'Front-end Developer',
    company: 'Product Team',
    detail: 'Translated design systems into accessible, reusable interfaces with a strong focus on performance.',
  },
]

function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

function smoothScrollTo(target) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reducedMotion) {
    target.scrollIntoView()
    return
  }

  const start = window.scrollY
  const destination = Math.max(0, target.getBoundingClientRect().top + start)
  const distance = destination - start
  const duration = Math.min(1100, Math.max(600, Math.abs(distance) * 0.55))
  const startedAt = performance.now()

  function step(now) {
    const elapsed = Math.min(1, (now - startedAt) / duration)
    const eased = elapsed < 0.5
      ? 4 * elapsed * elapsed * elapsed
      : 1 - Math.pow(-2 * elapsed + 2, 3) / 2
    window.scrollTo(0, start + distance * eased)
    if (elapsed < 1) requestAnimationFrame(step)
  }

  requestAnimationFrame(step)
}

function SocialIcon({ children, href, label }) {
  const external = href.startsWith('http')

  return (
    <a
      className="grid size-6 place-items-center transition duration-300 ease-fluid hover:translate-x-1 hover:opacity-55 focus-visible:translate-x-1"
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      aria-label={label}
    >
      {children}
    </a>
  )
}

function ProjectAction({ href, children }) {
  const available = Boolean(href)

  return (
    <a
      className={cn(
        'group/action flex items-center justify-between gap-2 border-t border-paper/15 py-2.5 text-[.6rem] tracking-[.09em] uppercase transition-colors duration-300',
        available ? 'text-paper hover:text-paper/55' : 'text-paper/35',
      )}
      href={available ? href : '#'}
      target={available ? '_blank' : undefined}
      rel={available ? 'noreferrer' : undefined}
      aria-disabled={!available}
      title={available ? undefined : 'Link coming soon'}
      onClick={available ? undefined : (event) => event.preventDefault()}
    >
      <span>{children}</span>
      <svg className="size-3.5 fill-none stroke-current transition-transform duration-300 group-hover/action:translate-x-0.5 group-hover/action:-translate-y-0.5" viewBox="0 0 16 16" aria-hidden="true">
        <path d="M4 12 12 4M6 4h6v6" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </a>
  )
}

function ProjectVisual({ project }) {
  if (project.visual === 'orbit') {
    return (
      <div className="absolute inset-x-5 top-14 bottom-5 z-[1]">
        <svg className="absolute inset-0 size-full overflow-visible stroke-ink/25" viewBox="0 0 300 180" preserveAspectRatio="none" aria-hidden="true">
          <path d="M68 48 150 90 238 42M150 90 78 145M150 90l91 55" fill="none" strokeWidth="1" strokeDasharray="4 5" />
        </svg>
        <span className="absolute top-[34%] left-1/2 grid size-20 -translate-x-1/2 place-items-center rounded-full bg-ink text-[.65rem] tracking-[.1em] text-paper uppercase shadow-[0_1rem_2.5rem_rgba(10,10,10,.2)] transition-transform duration-500 ease-fluid group-hover:scale-105">Agent<br />Core</span>
        <span className="absolute top-1 left-2 rounded-full border border-ink/20 bg-paper/75 px-3 py-2 text-[.58rem] tracking-[.08em] uppercase backdrop-blur transition-transform duration-500 ease-fluid group-hover:-translate-y-1">Plan</span>
        <span className="absolute top-0 right-1 rounded-full border border-ink/20 bg-paper/75 px-3 py-2 text-[.58rem] tracking-[.08em] uppercase backdrop-blur transition-transform duration-500 ease-fluid group-hover:translate-x-1">Tools</span>
        <span className="absolute bottom-0 left-4 rounded-full border border-ink/20 bg-paper/75 px-3 py-2 text-[.58rem] tracking-[.08em] uppercase backdrop-blur transition-transform duration-500 ease-fluid group-hover:-translate-x-1">Memory</span>
        <span className="absolute right-0 bottom-0 rounded-full border border-ink/20 bg-paper/75 px-3 py-2 text-[.58rem] tracking-[.08em] uppercase backdrop-blur transition-transform duration-500 ease-fluid group-hover:translate-y-1">Review</span>
      </div>
    )
  }

  if (project.visual === 'grid') {
    return (
      <div className="absolute inset-x-5 top-14 bottom-5 z-[1] overflow-hidden rounded-xl border border-ink/15 bg-[#eef0eb]/80 shadow-[0_1rem_2.5rem_rgba(10,10,10,.1)] backdrop-blur-sm">
        <div className="flex items-center justify-between border-b border-ink/10 px-3 py-2.5">
          <div className="flex gap-1.5" aria-hidden="true"><i className="size-1.5 rounded-full bg-ink/20" /><i className="size-1.5 rounded-full bg-ink/20" /><i className="size-1.5 rounded-full bg-ink/20" /></div>
          <span className="text-[.52rem] tracking-[.1em] text-ink/45 uppercase">Queue / Live</span>
        </div>
        <div className="space-y-2 p-3">
          {[
            ['worker-01', '72%', 'w-[72%]'],
            ['worker-02', '48%', 'w-[48%]'],
            ['worker-03', '86%', 'w-[86%]'],
          ].map(([worker, load, width]) => (
            <div className="grid grid-cols-[4.2rem_1fr_2rem] items-center gap-2" key={worker}>
              <span className="font-mono text-[.5rem] text-ink/55">{worker}</span>
              <span className="h-1 overflow-hidden rounded-full bg-ink/10"><i className={cn('block h-full rounded-full bg-ink/65 transition-[width] duration-700 ease-fluid group-hover:w-full', width)} /></span>
              <span className="font-mono text-[.48rem] text-ink/45">{load}</span>
            </div>
          ))}
        </div>
        <div className="absolute inset-x-3 bottom-3 flex items-center justify-between border-t border-ink/10 pt-2 text-[.5rem] tracking-[.08em] text-ink/40 uppercase">
          <span>24 processed</span><span className="flex items-center gap-1.5"><i className="size-1.5 rounded-full bg-[#36a269]" />Healthy</span>
        </div>
      </div>
    )
  }

  if (project.visual === 'signal') {
    return (
      <div className="absolute inset-x-5 top-14 bottom-5 z-[1]">
        <div className="absolute top-1 left-0 w-[72%] rotate-[-3deg] rounded-xl border border-ink/15 bg-[#ecece8] p-3 shadow-[0_1rem_2rem_rgba(10,10,10,.1)] transition-transform duration-500 ease-fluid group-hover:-translate-x-1 group-hover:-rotate-6">
          <div className="mb-5 flex items-center justify-between"><span className="text-[.52rem] tracking-[.1em] text-ink/45 uppercase">Design Club</span><span className="size-2 rounded-full bg-[#d66c55]" /></div>
          <p className="m-0 text-[.8rem] leading-tight font-medium tracking-[-.03em]">Build Night<br />Friday · 6 PM</p>
        </div>
        <div className="absolute right-0 bottom-0 w-[68%] rotate-[3deg] rounded-xl bg-ink p-3 text-paper shadow-[0_1rem_2.5rem_rgba(10,10,10,.2)] transition-transform duration-500 ease-fluid group-hover:translate-x-1 group-hover:rotate-6">
          <span className="text-[.5rem] tracking-[.1em] text-paper/40 uppercase">Team match</span>
          <p className="mt-3 mb-4 text-[.75rem] leading-tight">Backend developer<br />wanted for HackFest</p>
          <div className="flex -space-x-1.5" aria-hidden="true"><i className="grid size-6 place-items-center rounded-full border border-ink bg-[#d7cabd] text-[.45rem] text-ink not-italic">AK</i><i className="grid size-6 place-items-center rounded-full border border-ink bg-[#b8c7c0] text-[.45rem] text-ink not-italic">RM</i><i className="grid size-6 place-items-center rounded-full border border-ink bg-paper text-[.45rem] text-ink not-italic">+3</i></div>
        </div>
      </div>
    )
  }

  return (
    <div className="absolute inset-x-5 top-14 bottom-5 z-[1] overflow-hidden rounded-xl border border-ink/15 bg-[#eeeae3]/85 p-4 shadow-[0_1rem_2.5rem_rgba(10,10,10,.1)] backdrop-blur-sm">
      <div className="flex items-start justify-between gap-3">
        <div><span className="text-[.5rem] tracking-[.1em] text-ink/45 uppercase">Monthly balance</span><p className="mt-1 mb-0 text-[1.35rem] font-medium tracking-[-.06em]">₹24,860</p></div>
        <span className="rounded-full bg-[#bbd0bd] px-2 py-1 text-[.48rem] font-medium text-[#285a35]">+12.4%</span>
      </div>
      <svg className="mt-4 h-14 w-full overflow-visible" viewBox="0 0 240 64" preserveAspectRatio="none" aria-hidden="true">
        <path className="project-chart-line fill-none stroke-ink" d="M0 54C24 50 29 36 51 39s31 14 50 3 27-32 48-25 30 22 49 9 23-20 42-22" strokeWidth="2" strokeLinecap="round" />
        <path d="M0 54C24 50 29 36 51 39s31 14 50 3 27-32 48-25 30 22 49 9 23-20 42-22V64H0Z" fill="rgba(10,10,10,.06)" />
      </svg>
      <div className="mt-2 grid grid-cols-4 items-end gap-1.5" aria-hidden="true">
        {[38, 68, 52, 84].map((height, index) => <i className="block rounded-sm bg-ink/15 transition-all duration-500 ease-fluid group-hover:bg-ink/30" style={{ height: `${height / 4}px` }} key={height + index} />)}
      </div>
    </div>
  )
}

function SectionTop({ index, note, inverse = false }) {
  return (
    <div className={cn('reveal flex items-start justify-between gap-8 border-b pb-4', inverse ? 'border-paper/30' : 'border-ink/20')}>
      <p className="m-0 text-[.82rem] uppercase tracking-[.08em]">{index}</p>
      <p className="m-0 text-right text-[.82rem] uppercase tracking-[.08em]">{note}</p>
    </div>
  )
}

function App() {
  const [loaded, setLoaded] = useState(false)
  const [robotReady, setRobotReady] = useState(() => window.innerWidth < 768)
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeSection, setActiveSection] = useState('about')
  const [toastVisible, setToastVisible] = useState(false)
  const progressRef = useRef(null)
  const portraitRef = useRef(null)
  const nameRef = useRef(null)
  const cursorRef = useRef(null)
  const lenisRef = useRef(null)
  const toastTimerRef = useRef(null)
  const loadingStartedAtRef = useRef(performance.now())

  useEffect(() => {
    let minimumTimer = 0
    let pageReady = document.readyState === 'complete'

    const completeWhenReady = () => {
      if (!pageReady || !robotReady) return
      const elapsed = performance.now() - loadingStartedAtRef.current
      minimumTimer = window.setTimeout(() => setLoaded(true), Math.max(0, 900 - elapsed))
    }

    const handleWindowLoad = () => {
      pageReady = true
      completeWhenReady()
    }

    if (pageReady) completeWhenReady()
    else window.addEventListener('load', handleWindowLoad, { once: true })

    const fallbackTimer = window.setTimeout(() => setLoaded(true), 5000)
    return () => {
      window.removeEventListener('load', handleWindowLoad)
      window.clearTimeout(minimumTimer)
      window.clearTimeout(fallbackTimer)
    }
  }, [robotReady])

  useEffect(() => {
    if (!loaded || !window.location.hash) return undefined
    const target = document.querySelector(window.location.hash)
    if (!target) return undefined
    const frame = requestAnimationFrame(() => {
      if (lenisRef.current) lenisRef.current.scrollTo(target, { immediate: true })
      else target.scrollIntoView()
    })
    return () => cancelAnimationFrame(frame)
  }, [loaded])

  useEffect(() => {
    const canSmoothScroll = window.matchMedia('(pointer: fine)').matches
      && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!canSmoothScroll) return undefined

    const lenis = new Lenis({
      autoRaf: true,
      lerp: 0.06,
      smoothWheel: true,
      wheelMultiplier: 0.82,
      syncTouch: false,
      overscroll: true,
      respectReducedMotion: true,
    })

    lenisRef.current = lenis

    return () => {
      lenis.destroy()
      lenisRef.current = null
    }
  }, [])

  useEffect(() => {
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let frame = 0
    let wasScrolled = false

    const update = () => {
      frame = 0
      const scrollTop = window.scrollY
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight
      const heroProgress = Math.min(1, scrollTop / Math.max(1, window.innerHeight))

      if (progressRef.current) {
        progressRef.current.style.transform = `scaleX(${maxScroll > 0 ? scrollTop / maxScroll : 0})`
      }
      const isScrolled = scrollTop > 48
      if (isScrolled !== wasScrolled) {
        wasScrolled = isScrolled
        setScrolled(isScrolled)
      }

      if (!reducedMotion) {
        if (portraitRef.current) {
          portraitRef.current.style.transform = `translate3d(-50%, ${heroProgress * 42}px, 0) scale(${1 + heroProgress * 0.025})`
        }
        if (nameRef.current) {
          const horizontalPosition = window.innerWidth >= 768
            ? `${heroProgress * -28}px`
            : `calc(-50% - ${heroProgress * 28}px)`
          nameRef.current.style.transform = `translate3d(${horizontalPosition}, -50%, 0)`
        }
      }
    }

    const requestUpdate = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }

    update()
    window.addEventListener('scroll', requestUpdate, { passive: true })
    window.addEventListener('resize', requestUpdate)
    return () => {
      window.removeEventListener('scroll', requestUpdate)
      window.removeEventListener('resize', requestUpdate)
      if (frame) cancelAnimationFrame(frame)
    }
  }, [])

  useEffect(() => {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return
        entry.target.classList.add('is-visible')
        observer.unobserve(entry.target)
      })
    }, { threshold: 0.14, rootMargin: '0px 0px -7% 0px' })

    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveSection(entry.target.id)
      })
    }, { rootMargin: '-35% 0px -55% 0px' })

    document.querySelectorAll('.reveal').forEach((element) => revealObserver.observe(element))
    document.querySelectorAll('[data-section]').forEach((element) => sectionObserver.observe(element))

    return () => {
      revealObserver.disconnect()
      sectionObserver.disconnect()
    }
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    if (menuOpen) lenisRef.current?.stop()
    else lenisRef.current?.start()
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  useEffect(() => {
    const closeOnEscape = (event) => {
      if (event.key === 'Escape') setMenuOpen(false)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [])

  useEffect(() => {
    if (!window.matchMedia('(pointer: fine)').matches) return undefined

    const cursor = cursorRef.current
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    let targetX = -100
    let targetY = -100
    let currentX = -100
    let currentY = -100
    let frame = 0
    let cursorVisible = false

    document.documentElement.classList.add('cursor-ready')

    const moveCursor = (event) => {
      targetX = event.clientX
      targetY = event.clientY
      cursorVisible = true
      cursor?.classList.add('is-visible')
      cursor?.classList.toggle('is-active', Boolean(event.target.closest('a, button, .core-orbit.is-node-hovered')))
      if (!frame && !document.hidden) frame = requestAnimationFrame(renderCursor)
    }

    const hideCursor = (event) => {
      if (event.relatedTarget) return
      cursorVisible = false
      cursor?.classList.remove('is-visible', 'is-active')
    }

    const renderCursor = () => {
      frame = 0
      const ease = reducedMotion ? 1 : 0.055
      currentX += (targetX - currentX) * ease
      currentY += (targetY - currentY) * ease
      cursor?.style.setProperty('--cursor-x', `${currentX}px`)
      cursor?.style.setProperty('--cursor-y', `${currentY}px`)
      if (Math.abs(targetX - currentX) > 0.1 || Math.abs(targetY - currentY) > 0.1) {
        frame = requestAnimationFrame(renderCursor)
      }
    }

    const handleVisibilityChange = () => {
      if (document.hidden && frame) {
        cancelAnimationFrame(frame)
        frame = 0
      } else if (cursorVisible && !frame) {
        frame = requestAnimationFrame(renderCursor)
      }
    }

    window.addEventListener('pointermove', moveCursor, { passive: true })
    window.addEventListener('pointerout', hideCursor, { passive: true })
    document.addEventListener('visibilitychange', handleVisibilityChange)

    return () => {
      document.documentElement.classList.remove('cursor-ready')
      window.removeEventListener('pointermove', moveCursor)
      window.removeEventListener('pointerout', hideCursor)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      cancelAnimationFrame(frame)
    }
  }, [])

  function navigate(event, href) {
    event.preventDefault()
    const target = document.querySelector(href)
    if (!target) return
    setMenuOpen(false)
    window.history.replaceState(null, '', href)

    requestAnimationFrame(() => {
      if (lenisRef.current) {
        lenisRef.current.start()
        lenisRef.current.scrollTo(target, { lerp: 0.055 })
      } else {
        smoothScrollTo(target)
      }
    })
  }

  async function copyEmail() {
    const email = 'abhinayboya2@gmail.com'
    try {
      await navigator.clipboard.writeText(email)
    } catch {
      const input = document.createElement('textarea')
      input.value = email
      input.setAttribute('readonly', '')
      input.style.position = 'fixed'
      input.style.opacity = '0'
      document.body.appendChild(input)
      input.select()
      document.execCommand('copy')
      input.remove()
    }

    setToastVisible(true)
    window.clearTimeout(toastTimerRef.current)
    toastTimerRef.current = window.setTimeout(() => setToastVisible(false), 2200)
  }

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-[999] grid place-items-center bg-ink text-paper transition-[clip-path,visibility] duration-900 ease-fluid',
          loaded ? 'invisible [clip-path:inset(0_0_100%_0)]' : 'visible [clip-path:inset(0_0_0_0)]',
        )}
        aria-hidden="true"
      >
        <span className="text-[clamp(3rem,8vw,7rem)] font-bold tracking-[-.08em]">AK</span>
        <span className="loader-line absolute inset-x-0 bottom-0 h-1 bg-paper" />
      </div>

      <div className="pointer-events-none fixed inset-x-0 top-0 z-[120] h-[3px]" aria-hidden="true">
        <span ref={progressRef} className="block h-full w-full origin-left scale-x-0 bg-ink" />
      </div>

      <span ref={cursorRef} className="site-cursor site-cursor-dot" aria-hidden="true" />

      <a className="fixed top-4 left-4 z-[1000] -translate-y-[200%] bg-ink px-4 py-3 text-paper transition focus:translate-y-0" href="#main">
        Skip to content
      </a>

      <header className={cn('pointer-events-none fixed inset-x-0 top-0 z-[100] px-[calc(clamp(.75rem,2.2vw,2.25rem)+.4rem)] transition-all duration-500 ease-fluid', scrolled ? 'pt-3' : 'pt-[calc(clamp(.75rem,2.2vw,2.25rem)+1.25rem)]')}>
        <div className={cn('pointer-events-auto mx-auto grid w-full max-w-[92rem] grid-cols-[1fr_auto] items-center px-2.5 transition-all duration-500 ease-fluid', scrolled && 'border border-ink/15 bg-paper/85 px-4 py-3 backdrop-blur-lg')}>
          <a className={cn('relative z-30 justify-self-start text-[clamp(.9rem,1.2vw,1.08rem)] font-medium tracking-[-.035em]', menuOpen && 'text-paper')} href="#home" onClick={(event) => navigate(event, '#home')} aria-label="Boya Abhinay Kumar, home">
            <span aria-hidden="true">©</span> Abhinay Design &amp; Strategy
          </a>

          <button
            className={cn('relative z-30 flex items-center justify-self-end gap-2 border-0 bg-transparent p-0 md:hidden', menuOpen && 'text-paper')}
            type="button"
            aria-expanded={menuOpen}
            aria-controls="site-nav"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <span>{menuOpen ? 'Close' : 'Menu'}</span>
            <i className={cn('relative block h-px w-5 bg-current transition-transform duration-300 ease-fluid after:absolute after:left-0 after:block after:h-px after:w-5 after:bg-current after:content-[\"\"]', menuOpen ? 'rotate-45 after:-rotate-90' : 'after:translate-y-[.34rem]')} aria-hidden="true" />
          </button>

          <nav
            className={cn(
              'fixed inset-0 z-20 flex flex-col justify-center bg-ink p-3 text-paper transition-[clip-path,visibility] duration-700 ease-fluid md:static md:visible md:flex-row md:items-center md:gap-[clamp(1.5rem,4vw,4rem)] md:bg-transparent md:p-0 md:text-ink md:[clip-path:none]',
              menuOpen ? 'visible [clip-path:inset(0_0_0_0)]' : 'invisible [clip-path:inset(0_0_100%_0)] md:visible',
            )}
            id="site-nav"
            aria-label="Primary navigation"
          >
            {navigation.map((item) => {
              const section = item.href.slice(1)
              return (
                <a
                  key={item.href}
                  className={cn(
                    'relative py-1 text-[clamp(3.5rem,15vw,7rem)] leading-[.9] tracking-[-.08em] after:absolute after:inset-x-0 after:-bottom-1 after:h-px after:origin-right after:scale-x-0 after:bg-current after:transition-transform after:duration-300 after:ease-fluid hover:after:origin-left hover:after:scale-x-100 focus-visible:after:scale-x-100 md:py-0 md:text-[clamp(.9rem,1.2vw,1.08rem)] md:leading-normal md:tracking-[-.035em]',
                    activeSection === section && 'after:scale-x-100',
                  )}
                  href={item.href}
                  onClick={(event) => navigate(event, item.href)}
                >
                  {item.label}
                </a>
              )
            })}
          </nav>
        </div>
      </header>

      <main id="main">
        <section className="min-h-svh bg-field p-[clamp(.75rem,2.2vw,2.25rem)]" id="home" aria-labelledby="hero-title">
          <div className="hero-shine relative isolate mx-auto min-h-[calc(100svh-(clamp(.75rem,2.2vw,2.25rem)*2))] w-full max-w-[92rem] overflow-hidden rounded-[clamp(1.3rem,2.3vw,2.5rem)] border-[clamp(3px,.32vw,5px)] border-ink bg-surface shadow-[2rem_2rem_3.6rem_rgba(0,0,0,.22)]">
            <p className="absolute top-20 left-3 z-10 m-0 rotate-180 text-[.76rem] leading-none tracking-[.1em] uppercase [writing-mode:vertical-rl]">Computer Science Engineer · CBIT · Hyderabad / Remote</p>

            <div className="absolute top-20 right-3 z-10 flex items-center gap-2.5 rounded-full border border-ink/15 bg-paper/80 px-3.5 py-2 text-[.7rem] font-medium tracking-[.08em] uppercase shadow-[0_.5rem_1.5rem_rgba(0,0,0,.08)] backdrop-blur-md sm:right-5" role="status" aria-label="Currently available for internships">
              <span className="availability-dot" aria-hidden="true" />
              <span>Available for Internships</span>
            </div>

            <div ref={portraitRef} className="absolute inset-y-0 left-1/2 z-[1] w-[98%] origin-bottom -translate-x-1/2 will-change-transform sm:w-[75%] md:left-[62%] md:w-[min(57%,48rem)]" aria-hidden="true">
              <img className="h-full w-full object-cover object-[47%_28%] contrast-[1.06] grayscale sm:object-[center_20%]" src="/assets/alex-portrait.webp" alt="" width="1122" height="1402" fetchPriority="high" />
            </div>

            <HeroRobot onReady={() => setRobotReady(true)} />

            <h1 ref={nameRef} className="absolute top-[51%] left-[53%] z-[3] m-0 flex w-max -translate-1/2 flex-col items-start text-left text-[clamp(3.3rem,13vw,4.8rem)] leading-[.72] font-bold tracking-[-.085em] whitespace-nowrap text-white mix-blend-difference will-change-transform md:top-[54%] md:left-[4%] md:translate-x-0 md:text-[clamp(5rem,10vw,10rem)] md:leading-[.76]" id="hero-title" aria-label="Boya Abhinay Kumar">
              <span className="mb-[.22em] ml-[.12em] text-[.34em] tracking-[-.025em]">Boya</span>
              <span>Abhinay Kumar</span>
            </h1>

            <div className="absolute bottom-4 left-3 z-10 flex flex-col gap-3.5 sm:bottom-6 sm:left-5" aria-label="Social links">
              <SocialIcon href="https://github.com/abhinay-boya" label="GitHub">
                <svg className="size-[1.1rem] fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.48 2 2 6.58 2 12.24c0 4.52 2.87 8.36 6.84 9.72.5.1.68-.22.68-.49 0-.24-.01-1.05-.01-1.9-2.78.62-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .08 1.53 1.06 1.53 1.06.9 1.56 2.35 1.11 2.92.85.09-.66.35-1.11.64-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.35 9.35 0 0 1 12 7.06c.85 0 1.69.12 2.49.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.59.69.49A10.25 10.25 0 0 0 22 12.24C22 6.58 17.52 2 12 2Z" /></svg>
              </SocialIcon>
              <SocialIcon href="https://www.linkedin.com/in/boya-abhinay-kumar-b1b775329" label="LinkedIn">
                <svg className="size-[1.1rem] fill-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 3A2.5 2.5 0 1 1 4.5 8a2.5 2.5 0 0 1 0-5ZM2.3 9.5h4.4V22H2.3V9.5Zm7.1 0h4.2v1.7h.1c.6-1.1 2-2.2 4.1-2.2 4.4 0 5.2 2.9 5.2 6.6V22h-4.4v-5.7c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1V22H9.4V9.5Z" /></svg>
              </SocialIcon>
              <SocialIcon href="mailto:abhinayboya2@gmail.com" label="Email">
                <svg className="size-[1.1rem] fill-none stroke-current" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6.5h18v12H3z" strokeWidth="1.7" strokeLinejoin="round" /><path d="m4 7.5 8 6 8-6" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
              </SocialIcon>
            </div>

            <p className="absolute right-4 bottom-4 z-10 m-0 w-48 text-right text-[1.35rem] leading-[.95] font-medium tracking-[-.065em] sm:right-7 sm:bottom-6 sm:w-auto sm:text-[clamp(1.65rem,6vw,2.8rem)] md:text-left md:text-[clamp(2rem,4.35vw,4.2rem)]">Backend Engineer<br />AI Developer</p>

            <a className="absolute bottom-7 left-1/2 z-10 hidden -translate-x-1/2 items-center gap-3 text-xs tracking-[.08em] text-white uppercase md:flex" href="#about" onClick={(event) => navigate(event, '#about')}>
              <span>Scroll to explore</span>
              <i className="scroll-cue h-px w-8 overflow-hidden bg-current" aria-hidden="true" />
            </a>
          </div>
        </section>

        <div className="overflow-hidden border-y border-ink bg-ink text-paper" aria-hidden="true">
          <div className="ticker-track flex w-max items-center py-4">
            {[0, 1].map((group) => (
              <div className="flex items-center" key={group}>
          {['Backend Engineering', 'Agentic AI', 'Full-Stack Development', 'Scalable Systems'].map((item) => (
                  <span className="flex items-center" key={item}>
                    <span className="px-6 text-[clamp(.9rem,1.25vw,1.2rem)] tracking-[-.03em]">{item}</span>
                    <i className="text-base not-italic">✦</i>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>

        <section className="px-[clamp(1.5rem,12vw,15rem)] py-[clamp(4.5rem,7vw,7rem)]" id="about" data-section>
          <SectionTop index="01 / About" note={<>B.E. Computer Science<br />CBIT · Hyderabad</>} />

          <div className="grid grid-cols-1 gap-10 py-[clamp(3rem,5vw,5rem)] lg:grid-cols-[minmax(0,1.25fr)_minmax(20rem,.75fr)] lg:items-end lg:gap-[clamp(4rem,9vw,9rem)]">
            <div className="reveal">
              <p className="mb-5 text-[.68rem] tracking-[.12em] text-ink/50 uppercase">Profile / 2026</p>
              <h2 className="m-0 max-w-[56rem] text-[clamp(2.7rem,5.6vw,5.8rem)] leading-[.9] font-medium tracking-[-.065em]">
                Building <em className="font-serif font-normal">reliable systems</em> from interface to infrastructure.
              </h2>
            </div>

            <div className="reveal">
              <p className="m-0 text-[clamp(1rem,1.3vw,1.3rem)] leading-[1.45] tracking-[-.02em] text-ink/70">
                I’m a Computer Science undergraduate at CBIT, focused on dependable backends, thoughtful full-stack products, and intelligent systems designed to scale.
              </p>
              <div className="mt-8 grid grid-cols-3 border-t border-ink/20 pt-4">
                <div>
                  <span className="block text-[.62rem] tracking-[.1em] text-ink/45 uppercase">CGPA</span>
                  <strong className="mt-1 block font-medium">9.02</strong>
                </div>
                <div className="px-3">
                  <span className="block text-[.62rem] tracking-[.1em] text-ink/45 uppercase">Degree</span>
                  <strong className="mt-1 block font-medium">B.E. CSE</strong>
                </div>
                <div>
                  <span className="block text-[.62rem] tracking-[.1em] text-ink/45 uppercase">Based</span>
                  <strong className="mt-1 block font-medium">Hyderabad</strong>
                </div>
              </div>
            </div>
          </div>

          <div className="reveal grid grid-cols-1 border-t border-ink/20 pt-8 lg:grid-cols-[minmax(14rem,.32fr)_minmax(0,.68fr)] lg:gap-12">
            <div className="relative z-10 pb-4 lg:py-8">
              <p className="mb-3 text-[.62rem] tracking-[.13em] text-ink/45 uppercase">Core focus / 04</p>
              <h3 className="m-0 text-[clamp(1.8rem,3vw,3rem)] leading-none font-medium tracking-[-.05em]" id="core-focus-title">Connected<br /><em className="font-serif font-normal">capabilities.</em></h3>
              <p className="mt-5 mb-0 max-w-[19rem] text-sm leading-relaxed text-ink/55">Four disciplines moving together across product and systems engineering.</p>
              <p className="mt-8 mb-0 hidden text-[.58rem] tracking-[.11em] text-ink/40 uppercase lg:block">Hover a node to pause</p>
            </div>
            <div className="relative h-[25rem] overflow-hidden sm:h-[27rem]" aria-labelledby="core-focus-title">
              <DeferredCoreFocusOrbit />
              <ul className="sr-only">
                {focusItems.map((item, index) => (
                  <li key={item}>{String(index + 1).padStart(2, '0')} {item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-ink px-[clamp(1.5rem,12vw,15rem)] py-[clamp(3.75rem,6vw,6rem)] text-paper" id="projects" data-section>
          <SectionTop index="02 / Selected work" note={<>Independent builds<br />across product and systems</>} inverse />

          <div className="reveal flex flex-col gap-5 py-[clamp(2.5rem,4vw,4rem)] sm:flex-row sm:items-end sm:justify-between">
            <h2 className="m-0 text-[clamp(2.8rem,6vw,5.5rem)] leading-[.86] font-medium tracking-[-.065em]">Projects<span className="text-[#7a7a75]">.</span></h2>
            <p className="m-0 max-w-[20rem] text-sm leading-relaxed text-paper/50">Selected explorations in reliable backends, intelligent tooling, and useful digital products.</p>
          </div>

          <div className="reveal grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            {projects.map((project) => (
              <article className="group overflow-hidden rounded-[1.2rem] border border-paper/15 bg-[#121210] transition duration-500 ease-fluid hover:-translate-y-1 hover:border-paper/30" key={project.name}>
                <div className="project-visual relative isolate aspect-[4/3] overflow-hidden p-4 text-ink" data-variant={project.visual}>
                  <div className="relative z-10 flex items-start justify-between gap-4 text-[.62rem] tracking-[.1em] uppercase">
                    <span>{project.number} / {project.type}</span>
                    <span>{project.year}</span>
                  </div>
                  <ProjectVisual project={project} />
                </div>

                <div className="p-[clamp(1.1rem,1.5vw,1.5rem)]">
                  <div className="flex items-start justify-between gap-5">
                    <h3 className="m-0 text-[clamp(1.4rem,1.8vw,1.85rem)] leading-none font-medium tracking-[-.05em]">{project.name}</h3>
                  </div>
                  <p className="mt-4 mb-0 min-h-[5.8rem] text-[.8rem] leading-relaxed text-paper/55">{project.description}</p>

                  <ul className="mt-5 mb-5 flex min-h-[3.5rem] list-none flex-wrap content-start gap-1.5 p-0" aria-label={`${project.name} technologies`}>
                    {project.stack.map((technology) => (
                      <li className="rounded-full border border-paper/15 px-2.5 py-1 text-[.58rem] tracking-[.06em] text-paper/55 uppercase" key={technology}>{technology}</li>
                    ))}
                  </ul>

                  <div className="grid grid-cols-2 gap-3">
                    <ProjectAction href={project.demoUrl}>Live demo</ProjectAction>
                    <ProjectAction href={project.sourceUrl}>Source code</ProjectAction>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="bg-[#f5f5f2] px-[clamp(1.5rem,12vw,15rem)] py-[clamp(3.75rem,6vw,6rem)] text-ink" id="skills" data-section>
          <SectionTop index="03 / Skills" note={<>Technologies used across<br />design and development</>} />

          <div className="reveal py-[clamp(2.5rem,4vw,4rem)]">
            <div className="mb-8 max-w-[35rem]">
              <p className="mb-3 text-xs tracking-[.08em] text-ink/45 uppercase">Technical toolkit</p>
              <h2 className="m-0 text-[clamp(2.4rem,4.5vw,4rem)] leading-[.92] font-medium tracking-[-.055em]">The tools behind the work.</h2>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
              {skillGroups.map((group, groupIndex) => (
                <article
                  className="group relative min-h-[19rem] overflow-hidden rounded-[1.4rem] border border-ink/12 bg-[radial-gradient(circle_at_top_left,rgba(229,229,225,1),rgba(216,216,212,.96)_55%,rgba(198,198,194,.88))] p-[clamp(1.25rem,2vw,2rem)] shadow-[0_1.5rem_4rem_rgba(10,10,10,.09)] transition duration-500 ease-fluid hover:-translate-y-1 hover:border-ink/22 hover:shadow-[0_2rem_5rem_rgba(10,10,10,.14)]"
                  key={group.title}
                >
                  <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100 [background:radial-gradient(circle_at_35%_15%,rgba(255,255,255,.9),transparent_52%)]" />
                  <div className="relative">
                    <div className="mb-4 flex items-center gap-4">
                      <span className={cn('grid size-7 place-items-center text-xl font-bold', groupIndex === 0 && 'text-[#ff7a45]', groupIndex === 1 && 'text-[#ff6584]', groupIndex === 2 && 'text-[#9f7aea]')} aria-hidden="true">{group.icon}</span>
                      <h3 className="m-0 text-[1.08rem] font-semibold tracking-[-.015em] text-ink/85">{group.title}</h3>
                    </div>
                    <p className="m-0 min-h-12 max-w-[25rem] text-sm leading-relaxed text-ink/45">{group.description}</p>

                    <ul className="mt-7 flex list-none flex-wrap gap-2 p-0">
                      {group.items.map((item) => (
                        <li className="flex items-center gap-2 rounded-lg border border-ink/12 bg-white/35 px-3 py-2 text-[.82rem] font-medium text-ink/65 shadow-[0_.3rem_1rem_rgba(10,10,10,.045)] transition duration-300 hover:border-ink/22 hover:bg-white/60 hover:text-ink" key={item.name}>
                          <span className="min-w-4 text-center text-[.72rem] font-bold" style={{ color: item.color }} aria-hidden="true">{item.mark}</span>
                          <span>{item.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-[#dcdcd8] px-[clamp(1.5rem,12vw,15rem)] py-[clamp(3.75rem,6vw,6rem)]" id="experience" data-section>
          <SectionTop index="04 / Experience" note={<>A practical path through<br />design and development</>} />

          <div className="reveal grid grid-cols-1 gap-10 py-[clamp(2.5rem,4vw,4rem)] lg:grid-cols-[.7fr_1.8fr] lg:gap-20">
            <div>
              <p className="mb-4 text-xs tracking-[.08em] text-ink/55 uppercase">Selected experience</p>
              <h2 className="m-0 max-w-[25rem] text-[clamp(2.6rem,5vw,4.5rem)] leading-[.9] font-medium tracking-[-.065em]">Learning through making.</h2>
            </div>

            <div className="border-t border-ink/25">
              {experience.map((item) => (
                <article className="grid grid-cols-1 gap-3 border-b border-ink/25 py-6 sm:grid-cols-[8rem_minmax(0,1fr)] sm:gap-8" key={`${item.period}-${item.role}`}>
                  <p className="m-0 text-xs tracking-[.05em] text-ink/55 uppercase">{item.period}</p>
                  <div>
                    <div className="mb-3 flex flex-col justify-between gap-1 sm:flex-row sm:items-baseline sm:gap-5">
                      <h3 className="m-0 text-[clamp(1.2rem,2vw,1.8rem)] font-medium tracking-[-.035em]">{item.role}</h3>
                      <p className="m-0 text-sm text-ink/55">{item.company}</p>
                    </div>
                    <p className="m-0 max-w-[42rem] text-[.95rem] leading-relaxed text-ink/70">{item.detail}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="px-[clamp(1.5rem,12vw,15rem)] pt-[clamp(3.75rem,6vw,6rem)] pb-8" id="contact" data-section>
          <SectionTop index="05 / Contact" note={<>Have a project in mind?<br />Let’s make it feel inevitable.</>} />

          <div className="reveal flex flex-col items-center py-[clamp(3.25rem,5.5vw,5.5rem)] text-center">
            <p className="mb-8 text-xs tracking-[.08em] text-ink/60 uppercase">New projects · Collaborations · Good conversations</p>
            <h2 className="m-0 text-[clamp(2.8rem,9vw,4.2rem)] leading-[.9] font-medium tracking-[-.065em] md:text-[clamp(3.2rem,6vw,5.5rem)]">Let’s make<br />something <em className="font-serif font-normal">real.</em></h2>
            <div className="mt-[clamp(2.5rem,4vw,4rem)] flex flex-col items-center gap-4 sm:flex-row">
              <a className="border-b border-current pb-1 text-[clamp(1rem,1.6vw,1.35rem)] tracking-[-.025em]" href="mailto:abhinayboya2@gmail.com">abhinayboya2@gmail.com</a>
              <button className="cursor-pointer rounded-full border border-ink bg-transparent px-4 py-3 transition hover:bg-ink hover:text-paper focus-visible:bg-ink focus-visible:text-paper" type="button" onClick={copyEmail}>Copy email</button>
            </div>

            <div className="mt-7 flex flex-wrap justify-center gap-2.5" aria-label="Contact links">
              <a className="group flex items-center gap-2 rounded-full border border-ink/20 px-4 py-2 text-sm font-medium text-ink/65 transition-transform duration-300 ease-fluid hover:-translate-y-1 hover:scale-[1.03]" href="https://github.com/abhinay-boya" target="_blank" rel="noreferrer">
                <svg className="size-4 fill-current transition duration-300 group-hover:scale-110 group-hover:text-violet-600" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2C6.48 2 2 6.58 2 12.24c0 4.52 2.87 8.36 6.84 9.72.5.1.68-.22.68-.49 0-.24-.01-1.05-.01-1.9-2.78.62-3.37-1.21-3.37-1.21-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .08 1.53 1.06 1.53 1.06.9 1.56 2.35 1.11 2.92.85.09-.66.35-1.11.64-1.37-2.22-.26-4.56-1.14-4.56-5.06 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.35 9.35 0 0 1 12 7.06c.85 0 1.69.12 2.49.34 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.93-2.34 4.79-4.57 5.05.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.59.69.49A10.25 10.25 0 0 0 22 12.24C22 6.58 17.52 2 12 2Z" /></svg>
                GitHub
              </a>
              <a className="group flex items-center gap-2 rounded-full border border-ink/20 px-4 py-2 text-sm font-medium text-ink/65 transition-transform duration-300 ease-fluid hover:-translate-y-1 hover:scale-[1.03]" href="https://www.linkedin.com/in/boya-abhinay-kumar-b1b775329" target="_blank" rel="noreferrer">
                <svg className="size-4 fill-current transition duration-300 group-hover:scale-110 group-hover:text-[#0a66c2]" viewBox="0 0 24 24" aria-hidden="true"><path d="M5.4 7.8H1.8V22h3.6V7.8ZM3.6 2A2.2 2.2 0 1 0 3.6 6.4 2.2 2.2 0 0 0 3.6 2ZM22.2 14.1c0-4.3-2.3-6.3-5.4-6.3-2.5 0-3.6 1.4-4.2 2.3V8.2H9V22h3.6v-6.8c0-1.8.3-3.6 2.6-3.6 2.2 0 2.3 2.1 2.3 3.7V22h3.6l1.1-7.9Z" /></svg>
                LinkedIn
              </a>
              <a className="group flex items-center gap-2 rounded-full border border-ink/20 px-4 py-2 text-sm font-medium text-ink/65 transition-transform duration-300 ease-fluid hover:-translate-y-1 hover:scale-[1.03]" href="mailto:abhinayboya2@gmail.com">
                <svg className="size-4 fill-none stroke-current transition duration-300 group-hover:scale-110 group-hover:text-rose-600" viewBox="0 0 24 24" aria-hidden="true"><path d="M3 6.5h18v12H3z" strokeWidth="1.7" strokeLinejoin="round" /><path d="m4 7.5 8 6 8-6" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>
                Email
              </a>
            </div>
          </div>

          <footer className="grid grid-cols-[1fr_auto] items-center gap-4 border-t border-ink/20 pt-6 md:grid-cols-[1fr_auto_1fr]">
            <p className="m-0 text-xs tracking-[.07em] uppercase">© {new Date().getFullYear()} Boya Abhinay Kumar</p>
            <p className="m-0 hidden text-xs tracking-[.07em] uppercase md:block">Designing with clarity and character.</p>
            <a className="justify-self-end border-b border-current text-xs tracking-[.07em] uppercase" href="#home" onClick={(event) => navigate(event, '#home')}>Back to top</a>
          </footer>
        </section>
      </main>

      <div className={cn('pointer-events-none fixed right-6 bottom-6 z-[150] bg-ink px-4 py-3 text-paper transition-all duration-400 ease-fluid', toastVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0')} role="status" aria-live="polite">
        Email copied
      </div>

    </>
  )
}

export default App
