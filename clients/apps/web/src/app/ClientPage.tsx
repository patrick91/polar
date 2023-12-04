'use client'

import { ArrowForward } from '@mui/icons-material'
import { motion } from 'framer-motion'
import { LogoIcon } from 'polarkit/components/brand'
import { useRef } from 'react'

const ClientPage = () => {
  const ref = useRef(null)

  return (
    <main className="bg-polar-950 flex flex-col text-white">
      <motion.section
        ref={ref}
        className="relative flex h-screen w-full flex-col justify-between p-32"
      >
        <header className="bg-polar-950 fixed left-0 right-0 top-0 flex w-full flex-row items-center justify-between px-32 py-24">
          <div className="flex flex-row items-center gap-x-24">
            <LogoIcon className="h-16 w-16" />
            <ul className="flex flex-row gap-x-12 text-xl font-light">
              <li>Backer</li>
              <li>Maintainer</li>
              <li>Community</li>
              <li>Company</li>
            </ul>
          </div>
          <div className="flex flex-row items-center gap-x-24">
            <ul className="flex flex-row gap-x-12 text-xl font-light">
              <li>Maintainer</li>
              <li>Log in</li>
            </ul>
          </div>
        </header>
        <div className="flex flex-grow flex-col items-start justify-end gap-y-32">
          <h1 className="text-[calc(100vw_/_20)] !font-normal leading-snug tracking-tight">
            Welcome to the
            <br />
            Open Source Revolution
          </h1>
          <p className="text-3xl font-light">
            Turn your coding endeavors into a sustainable income
          </p>
          <div className="flex flex-row items-center gap-x-12">
            <button className="flex flex-row items-center gap-x-4 rounded-full bg-blue-500 px-8 py-4 font-light text-white transition-colors hover:bg-blue-400 md:text-xl">
              <span>Get Started</span>
              <ArrowForward />
            </button>

            <button className="bg-transparent py-4 font-light md:text-xl">
              <span>Open Source on GitHub</span>
            </button>
          </div>
        </div>
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
