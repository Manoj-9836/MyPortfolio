import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRef } from 'react';
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
import { initSwarm } from './lib/cursorSwarm';
import './App.css';

function MainPortfolio() {
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!mainRef.current) return;

    const cleanupSwarm = initSwarm(mainRef.current);

    return () => {
      cleanupSwarm();
    };
  }, []);

  return (
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
  );
}

function App() {
  const [isLoading, setIsLoading] = useState(true);

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
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/" element={
          <div className="min-h-screen bg-black text-white overflow-x-hidden">
            <AnimatePresence mode="wait">
              {isLoading ? (
                <IntroAnimation key="intro" />
              ) : (
                <MainPortfolio />
              )}
            </AnimatePresence>
          </div>
        } />
      </Routes>
    </Router>
  );
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
