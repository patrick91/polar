'use client'

import { ArrowUpRightIcon } from '@heroicons/react/24/outline'
import { ArrowForward } from '@mui/icons-material'
import { HTMLMotionProps, Variants, motion } from 'framer-motion'
import NextLink, { LinkProps } from 'next/link'
import { LogoIcon } from 'polarkit/components/brand'
import { PropsWithChildren, useEffect, useRef } from 'react'
import { twMerge } from 'tailwind-merge'
import { Gradient } from '../components/LandingPage/MeshGradient'

const Link = ({
  children,
  className,
  ...props
}: PropsWithChildren<LinkProps & { className?: string }>) => {
  const variants: Variants = {
    initial: {
      y: '100%',
    },
    animate: {
      y: '0%',
      transition: {
        duration: 0.4,
        ease: [0.65, 0, 0.35, 1],
      },
    },
  }

  const variantsOutgoing: Variants = {
    initial: {
      y: '0%',
    },
    animate: {
      y: '-100%',
      transition: {
        duration: 0.4,
        ease: [0.65, 0, 0.35, 1],
      },
    },
  }

  return (
    <motion.div
      className="overflow-hidden"
      initial="initial"
      whileHover="animate"
    >
      <NextLink {...props} className="relative">
        <motion.div
          className={twMerge('absolute', className)}
          variants={variants}
        >
          {children}
        </motion.div>
        <motion.div className={className} variants={variantsOutgoing}>
          {children}
        </motion.div>
      </NextLink>
    </motion.div>
  )
}

const ClientPage = () => {
  const ref = useRef(null)

  useEffect(() => {
    const gradient = new Gradient()
    /** @ts-ignore */
    gradient.initGradient('#gradient-canvas')
  }, [])

  return (
    <>
      <main className="flex flex-col bg-black text-white">
        <motion.header
          className="fixed left-0 right-0 top-0 z-50 flex w-full flex-row items-center justify-between px-32 py-16"
          variants={{
            initial: { opacity: 0 },
            animate: { opacity: 1, transition: { delay: 1.2, duration: 1 } },
          }}
          initial="initial"
          animate="animate"
        >
          <div className="flex flex-row items-center gap-x-24">
            <Link href="/">
              <LogoIcon className="h-16 w-16" />
            </Link>
            <ul className="flex flex-row gap-x-12 text-xl font-light">
              <Link href="#maintainer">Creator</Link>
              <Link href="#backer">Supporter</Link>
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
        <motion.section
          ref={ref}
          className="relative flex h-screen w-full flex-col justify-between p-32"
        >
          <canvas
            id="gradient-canvas"
            className="absolute inset-0 z-0 h-full w-full"
            data-transition-in
          />
          <motion.div
            className="relative flex flex-grow flex-col items-start justify-end gap-y-16 lg:gap-y-24"
            variants={{
              initial: { opacity: 1 },
              animate: { opacity: 1, transition: { staggerChildren: 0.2 } },
            }}
            initial="initial"
            animate="animate"
          >
            <h1 className="text-5xl !font-light leading-snug tracking-tight lg:text-[calc(100vw_/_20)]">
              <TextReveal>
                A creator platform for
                <br className="hidden lg:block" />
              </TextReveal>
              <TextReveal>Developers</TextReveal>
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
                  transition: { duration: 1, delay: 1.5 },
                },
              }}
            >
              <button className="flex flex-row items-center gap-x-4 whitespace-nowrap rounded-full bg-blue-500 px-8 py-4 font-light text-white transition-colors duration-300 hover:bg-white hover:text-blue-500 md:text-xl">
                <span>Create with Polar</span>
                <ArrowForward />
              </button>

              <Link
                className="flex flex-row items-center gap-x-4 whitespace-nowrap bg-transparent py-4 font-light md:text-xl"
                href="https://github.com/polarsource/polar"
              >
                <span>Open Source</span>
                <ArrowUpRightIcon className="h-5 w-5" />
              </Link>
            </motion.div>
          </motion.div>
        </motion.section>
        <motion.section className="flex w-full flex-row justify-between gap-y-12 bg-blue-500 p-32">
          <div className="flex flex-col gap-y-12">
            <h1 className="text-6xl !font-light leading-snug">
              Grow an audience
            </h1>
            <p className="max-w-lg text-2xl font-light leading-normal text-blue-100">
              Distribute exclusive content & transform your coding passion into
              a monthly income stream.
            </p>
          </div>
        </motion.section>
        {/*  <motion.footer className="flex w-full flex-col items-center bg-black p-32">
          <div
            className={twMerge(
              'flex w-full flex-col gap-x-16 gap-y-24 md:max-w-7xl md:flex-row md:justify-between md:gap-y-12',
            )}
          >
            <div className="flex flex-col gap-y-8">
              <h3 className="dark:text-polar-50 text-xl">Creator</h3>
              <div className="flex flex-col gap-y-1">
                <FooterLink href="/new">Subscriptions</FooterLink>
                <FooterLink href="/new">Benefits</FooterLink>
                <FooterLink href="/new">Posts</FooterLink>
                <FooterLink href="/new">Backlog Funding</FooterLink>
                <FooterLink href="https://docs.polar.sh">
                  Documentation
                </FooterLink>
              </div>
            </div>
            <div className="flex flex-col gap-y-8">
              <h3 className="dark:text-polar-50 text-xl">Supporter</h3>
              <div className="flex flex-col gap-y-1">
                <FooterLink href="/new">Subscriptions</FooterLink>
                <FooterLink href="/new">Benefits</FooterLink>
                <FooterLink href="/new">Posts</FooterLink>
                <FooterLink href="/new">Backlog Funding</FooterLink>
              </div>
            </div>
            <div className="flex flex-col gap-y-8">
              <h3 className="dark:text-polar-50 text-xl">Company</h3>
              <div className="flex flex-col gap-y-1">
                <FooterLink href="/careers">Careers</FooterLink>
                <FooterLink href="https://blog.polar.sh">Blog</FooterLink>
                <FooterLink href="https://polarsource.github.io/legal/terms.pdf">
                  Terms of Service
                </FooterLink>
                <FooterLink href="https://polarsource.github.io/legal/privacy-policy.pdf">
                  Privacy Policy
                </FooterLink>
              </div>
            </div>
            <div className="flex flex-col gap-y-8">
              <h3 className="dark:text-polar-50 text-xl">Community</h3>
              <div className="flex flex-col gap-y-1">
                <FooterLink href="https://discord.gg/STfRufb32V">
                  Join our Discord
                </FooterLink>
                <FooterLink href="https://github.com/polarsource">
                  Github
                </FooterLink>
                <FooterLink href="https://x.com/polar_sh">
                  X / Twitter
                </FooterLink>
              </div>
            </div>
            <div className="flex flex-col gap-y-8">
              <h3 className="dark:text-polar-50 text-xl">Support</h3>
              <div className="flex flex-col gap-y-1">
                <FooterLink href="/faq">FAQ</FooterLink>
                <FooterLink href="mailto:support@polar.sh">Contact</FooterLink>
              </div>
            </div>
          </div>
        </motion.footer> */}
      </main>
    </>
  )
}

export default ClientPage

const FooterLink = (props: PropsWithChildren<LinkProps>) => {
  return (
    <Link
      className="flex flex-row items-center gap-x-1 text-blue-500 hover:text-blue-400 dark:text-blue-400 dark:hover:text-blue-300"
      {...props}
    >
      {props.children}
    </Link>
  )
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
