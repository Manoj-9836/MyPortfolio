import { motion, useReducedMotion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';

interface HeroData {
  title: string;
  description: string;
}

export default function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const [heroData, setHeroData] = useState<HeroData>({
    title: 'AI & Full-Stack Development Enthusiast',
    description: 'Computer Science undergraduate and Technical Head of the AI Club with strong experience in full-stack development and AI-powered applications. Passionate about mentoring peers and organizing programming initiatives to empower student developers.',
  });

  useEffect(() => {
    // Fetch hero data from backend
    const fetchHeroData = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/hero`);
        const data = await response.json();
        if (data && data.title && data.description) {
          setHeroData({
            title: data.title,
            description: data.description,
          });
        }
      } catch {
        console.log('Using default hero content');
      }
    };

    fetchHeroData();
  }, []);

  return (
    <section id="home" className="relative flex min-h-screen items-center overflow-hidden border-b border-[#F3EEE3]/15 bg-[#111111] px-5 pb-16 pt-28 text-[#F3EEE3] sm:px-8 lg:px-12">
      <div className="mx-auto grid w-full max-w-[1200px] gap-12 lg:grid-cols-[minmax(0,1.25fr)_minmax(300px,0.75fr)] lg:items-end lg:gap-16">
        <div>
          <motion.p
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.45 }}
            className="mb-8 font-mono text-xs font-medium uppercase tracking-[0.18em] text-[#F3EEE3]/60"
          >
            Software developer / AI builder
          </motion.p>

        <motion.h1
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.7, delay: prefersReducedMotion ? 0 : 0.1 }}
          className="max-w-4xl font-display text-[clamp(3.25rem,8vw,7rem)] font-semibold leading-[0.93] tracking-[-0.07em]"
        >
          <span className="block">Bavisetti</span>
          <motion.span
            initial={{ opacity: 0, x: prefersReducedMotion ? 0 : -14 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: prefersReducedMotion ? 0 : 0.55, delay: prefersReducedMotion ? 0 : 0.35 }}
            className="block text-[#D9541E]"
          >
            Manoj Kumar
          </motion.span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.55, delay: prefersReducedMotion ? 0 : 0.55 }}
          className="mt-7 max-w-xl font-sans text-xl leading-tight text-[#F3EEE3] sm:text-2xl"
        >
          {heroData.title}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.55, delay: prefersReducedMotion ? 0 : 0.7 }}
          className="mt-4 max-w-2xl font-serif text-base leading-7 text-[#F3EEE3]/70 sm:text-lg"
        >
          {heroData.description}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.55, delay: prefersReducedMotion ? 0 : 0.85 }}
          className="mt-8 flex flex-col items-start gap-3 sm:flex-row"
        >
          <motion.a
            href="#projects"
            className="inline-flex min-h-12 items-center border border-[#D9541E] bg-[#D9541E] px-6 font-sans text-sm font-medium text-[#111111] transition-colors hover:bg-[#F3EEE3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D9541E]"
          >
            View Projects
          </motion.a>
          <motion.a
            href="#contact"
            className="inline-flex min-h-12 items-center border border-[#F3EEE3] px-6 font-sans text-sm font-medium text-[#F3EEE3] transition-colors hover:bg-[#F3EEE3] hover:text-[#111111] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D9541E]"
          >
            Get in Touch
          </motion.a>
          <motion.a
            href="/Manoj_Kumar_Bavisetti_Resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 items-center border border-[#F3EEE3]/30 px-6 font-sans text-sm font-medium text-[#F3EEE3]/80 transition-colors hover:border-[#D9541E] hover:text-[#D9541E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#D9541E]"
          >
            Download Resume
          </motion.a>
        </motion.div>

        </div>

        <motion.aside
          initial={{ opacity: 0, x: prefersReducedMotion ? 0 : 24 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: prefersReducedMotion ? 0 : 0.65, delay: prefersReducedMotion ? 0 : 0.35 }}
          className="border-l border-[#D9541E] pl-5 lg:mb-2"
          data-gsap-hero
          aria-label="Professional focus"
        >
          <p className="font-mono text-xs uppercase tracking-[0.16em] text-[#F3EEE3]/55">
            00 / Focus
          </p>
          <p className="mt-5 max-w-sm font-sans text-2xl font-medium leading-tight">
            Turning complex ideas into useful products.
          </p>
          <dl className="mt-10 space-y-4 border-t border-[#F3EEE3]/20 pt-5 font-mono text-xs uppercase tracking-[0.08em]">
            <div className="flex items-start justify-between gap-4">
              <dt className="text-[#F3EEE3]/50">Based in</dt>
              <dd className="text-right">Andhra Pradesh, IN</dd>
            </div>
            <div className="flex items-start justify-between gap-4">
              <dt className="text-[#F3EEE3]/50">Builds with</dt>
              <dd className="text-right">React / AI / Node</dd>
            </div>
          </dl>
          <div className="mt-8 grid grid-cols-2 gap-3 border-t border-[#F3EEE3]/20 pt-5">
            <div>
              <p className="font-display text-2xl font-semibold text-[#D9541E]">100+</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[#F3EEE3]/50">Students mentored</p>
            </div>
            <div>
              <p className="font-display text-2xl font-semibold text-[#D9541E]">8.1</p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[#F3EEE3]/50">Current CGPA</p>
            </div>
          </div>
        </motion.aside>
      </div>
    </section>
  );
}
