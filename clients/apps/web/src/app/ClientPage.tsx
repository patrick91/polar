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
import {
  HTMLMotionProps,
  Variants,
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
      </GlobalCanvas>
      <SmoothScrollbar config={{ duration: 0.2 }} />
      <motion.div className="z-100 fixed inset-0 flex flex-row">
        {Array.from({ length: 5 }).map((_, i) => {
          const distanceFromMiddle = Math.abs(2 - i)
          const blues = [
            'bg-blue-950',
            'bg-blue-700',
            'bg-blue-500',
            'bg-blue-700',
            'bg-blue-950',
          ]
          const blue = blues[i]
          return (
            <motion.div
              className={`z-100 h-full w-1/5 ${blue}`}
              variants={{
                initial: { y: '-100%' },
                animate: {
                  y: '100%',
                  transition: {
                    duration: 1,
                    ease: [0.83, 0, 0.17, 1],
                    delay: distanceFromMiddle * 0.05,
                  },
                },
              }}
              initial="initial"
              animate="animate"
            />
          )
        })}
      </motion.div>
      <main className="flex flex-col bg-black text-white">
        <motion.section
          ref={ref}
          className="relative flex h-screen w-full flex-col justify-between p-32"
        >
          <motion.header
            className="fixed left-0 right-0 top-0 z-50 flex w-full flex-row items-center justify-between bg-black px-32 py-16"
            variants={{
              initial: { opacity: 0 },
              animate: { opacity: 1, transition: { delay: 1.5, duration: 1 } },
            }}
            initial="initial"
            animate="animate"
          >
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
          </motion.header>
          <motion.div
            className="flex flex-grow flex-col items-start justify-end gap-y-16 lg:gap-y-24"
            variants={{
              initial: { opacity: 1 },
              animate: { opacity: 1, transition: { staggerChildren: 0.2 } },
            }}
            initial="initial"
            animate="animate"
          >
            <h1 className="text-5xl !font-light leading-snug tracking-tight lg:text-[calc(100vw_/_20)]">
              <TextReveal>
                Welcome to the <br className="hidden lg:block" />
              </TextReveal>
              <TextReveal>Open Source Revolution</TextReveal>
            </h1>
            <TextReveal>
              <p className="text-xl font-light md:text-3xl">
                Turn your coding endeavors into a sustainable income
              </p>
            </TextReveal>
            <motion.div
              className="flex flex-row items-center gap-x-12"
              variants={{
                initial: { opacity: 0 },
                animate: {
                  opacity: 1,
                  transition: { delay: 1.2, duration: 1 },
                },
              }}
            >
              <button className="flex flex-row items-center gap-x-4 whitespace-nowrap rounded-full bg-blue-500 px-8 py-4 font-light text-white transition-colors hover:bg-white hover:text-blue-500 md:text-xl">
                <span>Get Started</span>
                <ArrowForward />
              </button>

              <button className="whitespace-nowrap bg-transparent py-4 font-light md:text-xl">
                <span>Open Source on GitHub</span>
              </button>
            </motion.div>
          </motion.div>
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

const variants: Variants = {
  initial: {
    y: '100%',
  },
  animate: {
    y: '0%',
    transition: {
      duration: 1.5,
      ease: [0.87, 0, 0.13, 1],
    },
  },
}

const TextReveal = ({ children, ...props }: HTMLMotionProps<'div'>) => {
  return (
    <motion.div {...props} className="relative h-fit overflow-hidden">
      <motion.div variants={variants}>{children}</motion.div>
    </motion.div>
  )
}
