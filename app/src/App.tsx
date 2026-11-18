import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Navigation from './sections/Navigation';
import Hero from './sections/Hero';
import About from './sections/About';
import Education from './sections/Education';
import Skills from './sections/Skills';
import Projects from './sections/Projects';
import Blog from './sections/Blog';
import Certifications from './sections/Certifications';
import Achievements from './sections/Achievements';
import Contact from './sections/Contact';
import AdminDashboard from './pages/AdminDashboard.tsx';
import ProjectDetail from './pages/ProjectDetail';
import './App.css';

gsap.registerPlugin(ScrollTrigger);

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!mainRef.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const cards = Array.from(mainRef.current.querySelectorAll<HTMLElement>('[data-project-card]'));
    const cardListeners = cards.map((card) => {
      const handleEnter = () => gsap.to(card, { y: -2, duration: 0.2, ease: 'power2.out' });
      const handleLeave = () => gsap.to(card, { y: 0, duration: 0.2, ease: 'power2.out' });
      card.addEventListener('mouseenter', handleEnter);
      card.addEventListener('mouseleave', handleLeave);
      return { card, handleEnter, handleLeave };
    });

    const context = gsap.context(() => {
      gsap.from('[data-gsap-hero]', {
        autoAlpha: 0,
        x: 24,
        duration: 0.7,
        delay: 0.35,
        ease: 'power2.out',
      });

      gsap.utils.toArray<HTMLElement>('[data-gsap-reveal]').forEach((section) => {
        gsap.from(section, {
          autoAlpha: 0,
          y: 18,
          duration: 0.55,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 88%',
            once: true,
          },
        });
      });
    }, mainRef);

    return () => {
      cardListeners.forEach(({ card, handleEnter, handleLeave }) => {
        card.removeEventListener('mouseenter', handleEnter);
        card.removeEventListener('mouseleave', handleLeave);
      });
      context.revert();
    };
  }, [isLoading]);

  useEffect(() => {
    // Simulate loading for the intro animation
    const loadingDuration = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 2500;
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, loadingDuration);

    return () => clearTimeout(timer);
  }, []);

  return (
    <Router>
      <ScrollToHash />
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route
          path="/projects/:projectId"
          element={
            <div className="min-h-screen overflow-x-hidden bg-[#111111] text-[#F3EEE3]">
              <Navigation />
              <ProjectDetail />
            </div>
          }
        />
        <Route path="/" element={
          <div className="min-h-screen bg-black text-white overflow-x-hidden">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <IntroAnimation key="intro" />
              ) : (
                <motion.div
                  key="main"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <Navigation />
                  <main ref={mainRef}>
                    <Hero />
                    <About />
                    <Education />
                    <Skills />
                    <Projects />
                    <Blog />
                    <Certifications />
                    <Achievements />
                    <Contact />
                  </main>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        } />
      </Routes>
    </Router>
  );
}

function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (pathname !== '/' || !hash) return;

    let attempts = 0;
    let timeout: ReturnType<typeof setTimeout>;
    const scrollToTarget = () => {
      const target = document.getElementById(decodeURIComponent(hash.slice(1)));
      if (target) {
        const navHeight = window.matchMedia('(min-width: 768px)').matches ? 80 : 64;
        const elementPosition = target.getBoundingClientRect().top + window.scrollY;
        window.scrollTo({ top: elementPosition - navHeight, behavior: 'instant' });
        return;
      }

      if (attempts < 40) {
        attempts += 1;
        timeout = window.setTimeout(scrollToTarget, 100);
      }
    };

    const frame = window.requestAnimationFrame(scrollToTarget);
    return () => {
      window.cancelAnimationFrame(frame);
      window.clearTimeout(timeout);
    };
  }, [hash, pathname]);

  return null;
}

function IntroAnimation() {
  const name = "MANOJ KUMAR";
  
  return (
    <motion.div
      className="fixed inset-0 bg-black flex items-center justify-center z-50"
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="text-center">
        <h1
          className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl"
          style={{ fontFamily: "'Archivo', sans-serif" }}
        >
          {name.split('').map((char, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.5,
                delay: index * 0.05,
                ease: [0.22, 1, 0.36, 1]
              }}
              className={char === ' ' ? 'inline-block w-4' : 'inline-block'}
              style={{
                color: `rgba(255, 255, 255, ${0.3 + (index / name.length) * 0.7})`
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </motion.span>
          ))}
        </h1>
      </div>
    </motion.div>
  );
}

export default App;
