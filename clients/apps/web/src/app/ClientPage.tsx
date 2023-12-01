'use client'

import { Variants, motion, useAnimationControls } from 'framer-motion'
import { LogoIcon } from 'polarkit/components/brand'
import { useEffect, useRef } from 'react'

const variants: Variants = {
  initial: {
    height: '100vh',
    width: '100%',
    top: 0,
    borderRadius: 0,
  },
  minimized: {
    height: 200,
    width: 'calc(100% * .8)',
    top: 'calc(100vh * .1)',
    borderRadius: 200,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 100,
    },
  },
}

const ClientPage = () => {
  const ref = useRef(null)
  const controls = useAnimationControls()

  useEffect(() => {
    let scrollStart = false

    window.onscroll = function (e) {
      if (window.scrollY > 100 && !scrollStart) {
        scrollStart = true
        controls.start('minimized')
      }
    }
  }, [controls])

  return (
    <main className="flex flex-col items-center">
      <motion.section
        ref={ref}
        variants={variants}
        initial="initial"
        animate={controls}
        className="fixed flex h-screen w-full flex-col items-center justify-center bg-blue-500 p-24"
      >
        <LogoIcon className="absolute top-24 mx-auto h-24 w-24" />

        <h1 className="absolute w-2/3 text-center text-7xl !font-normal leading-snug">
          Shaping the future of
          <br />
          Open Source communities
        </h1>
      </motion.section>
      <motion.section className="h-screen w-full"></motion.section>
      <motion.section className="h-screen w-full"></motion.section>
      <motion.section className="h-screen w-full"></motion.section>
      <motion.section className="h-screen w-full"></motion.section>
      <motion.section className="h-screen w-full"></motion.section>
    </main>
  )
}

export default ClientPage
