'use client'

// @ts-ignore
import {
  GlobalCanvas,
  SmoothScrollbar,
  Tracker,
  useScrollbar,
  useTracker,
} from '@14islands/r3f-scroll-rig'
import { ArrowForward } from '@mui/icons-material'
import { EffectComposer, Noise } from '@react-three/postprocessing'
import {
  HTMLMotionProps,
  motion,
  useMotionValue,
  useTransform,
} from 'framer-motion'
import Link from 'next/link'
import { LogoIcon } from 'polarkit/components/brand'
import { DetailedHTMLProps, HTMLAttributes, useEffect, useRef } from 'react'

const ClientPage = () => {
  const ref = useRef(null)

  return (
    <>
      <GlobalCanvas
        globalRender={false}
        style={{ pointerEvents: 'none' }}
        gl={{ antialias: true, alpha: true }}
      >
        <ambientLight />
        <EffectComposer>
          <Noise opacity={1} />
        </EffectComposer>
      </GlobalCanvas>
      <SmoothScrollbar config={{ duration: 0.1 }} />
      <main className="flex flex-col bg-black text-white">
        <motion.section
          ref={ref}
          className="relative flex h-screen w-full flex-col justify-between p-32"
        >
          <header className="fixed left-0 right-0 top-0 z-50 flex w-full flex-row items-center justify-between bg-black px-32 py-16">
            <div className="flex flex-row items-center gap-x-24">
              <Link href="/">
                <LogoIcon className="h-16 w-16" />
              </Link>
              <ul className="flex flex-row gap-x-12 text-xl font-light">
                <Link href="#backer">Backer</Link>
                <Link href="#maintainer">Maintainer</Link>
                <Link href="#community">Community</Link>
                <Link href="#company">Company</Link>
              </ul>
            </div>
            <div className="flex flex-row items-center gap-x-24">
              <ul className="flex flex-row gap-x-12 text-xl font-light">
                <Link href="/login">Log in</Link>
              </ul>
            </div>
          </header>
          <div className="flex flex-grow flex-col items-start justify-end gap-y-16 lg:gap-y-24">
            <h1 className="text-5xl !font-light leading-snug tracking-tight lg:text-[calc(100vw_/_20)]">
              Welcome to the <br className="hidden lg:block" />
              Open Source Revolution
            </h1>
            <p className="text-xl font-light md:text-3xl">
              Turn your coding endeavors into a sustainable income
            </p>
            <div className="flex flex-row items-center gap-x-12">
              <button className="flex flex-row items-center gap-x-4 whitespace-nowrap rounded-full bg-blue-500 px-8 py-4 font-light text-white transition-colors hover:bg-white hover:text-blue-500 md:text-xl">
                <span>Get Started</span>
                <ArrowForward />
              </button>

              <button className="whitespace-nowrap bg-transparent py-4 font-light md:text-xl">
                <span>Open Source on GitHub</span>
              </button>
            </div>
          </div>
        </motion.section>
        <motion.section className="flex w-full flex-col gap-y-12 bg-blue-500 py-16">
          <HorizontalMarquee direction="left" />
          <HorizontalMarquee direction="right" />
        </motion.section>
        <Section
          id="backer"
          className="flex h-screen w-full flex-row items-start justify-start p-32"
        ></Section>
        <motion.section className="h-screen w-full"></motion.section>
        <motion.section className="h-screen w-full"></motion.section>
        <motion.section className="h-screen w-full"></motion.section>
      </main>
    </>
  )
}

export default ClientPage

export const Section = (
  props: DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>,
) => {
  const el = useRef<HTMLDivElement>(null)

  return (
    <>
      <div ref={el} {...props} />
    </>
  )
}

const HorizontalMarquee = (
  props: HTMLMotionProps<'div'> & { direction: 'left' | 'right' },
) => {
  const el = useRef<HTMLDivElement>(null)
  const tracker = useTracker(el)
  const progress = useTrackerMotionValue(tracker)

  const x = useTransform(
    progress,
    [0, 1],
    [
      props.direction === 'left' ? '0vw' : '-99vw',
      props.direction === 'left' ? '-99vw' : '0vw',
    ],
  )

  return (
    <motion.div {...props} ref={el} className="relative" style={{ x }}>
      <h1 className="whitespace-nowrap text-5xl !font-light leading-snug tracking-tight lg:text-[calc(100vw_/_20)]">
        OPEN SOURCE OPEN SOURCE OPEN SOURCE OPEN SOURCE OPEN SOURCE OPEN SOURCE
        OPEN SOURCE OPEN SOURCE
      </h1>
    </motion.div>
  )
}

/**
 * Return a Framer Motion value bound to a tracker scrollState
 * @param {Tracker} tracker scroll-rig tracker instance
 * @param {string} prop scrollState prop to bind
 */
export function useTrackerMotionValue(tracker: Tracker, prop = 'progress') {
  const progress = useMotionValue(0)
  const { onScroll } = useScrollbar()
  const { scrollState, rect } = tracker

  useEffect(() => {
    // update progress on scroll
    return onScroll(() => {
      progress.set(scrollState[prop])
    })
  }, [progress, scrollState, prop, onScroll, rect])

  return progress
}
