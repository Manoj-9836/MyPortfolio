import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect, useRef } from 'react';
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
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const main = mainRef.current;
    if (!main || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    const handleProjectCardMouseOver = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const card = target.closest<HTMLElement>('[data-project-card]');
      if (!card || (event.relatedTarget instanceof Node && card.contains(event.relatedTarget))) return;
      gsap.to(card, { y: -2, duration: 0.2, ease: 'power2.out' });
    };
    const handleProjectCardMouseOut = (event: MouseEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const card = target.closest<HTMLElement>('[data-project-card]');
      if (!card || (event.relatedTarget instanceof Node && card.contains(event.relatedTarget))) return;
      gsap.to(card, { y: 0, duration: 0.2, ease: 'power2.out' });
    };

    main.addEventListener('mouseover', handleProjectCardMouseOver);
    main.addEventListener('mouseout', handleProjectCardMouseOut);

    const context = gsap.context(() => {
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
      main.removeEventListener('mouseover', handleProjectCardMouseOver);
      main.removeEventListener('mouseout', handleProjectCardMouseOut);
      context.revert();
    };
  }, []);

  return (
    <Router>
      <ScrollToHash />
      <Routes>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route
          path="/projects/:projectId"
          element={
            <div className="min-h-screen overflow-x-clip bg-[#111111] text-[#F3EEE3]">
              <Navigation />
              <ProjectDetail />
            </div>
          }
        />
        <Route path="/" element={
          <div className="min-h-screen overflow-x-clip bg-black text-white">
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
          </div>
        } />
      </Routes>
    </Router>
  );
}

function ScrollToHash() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (pathname !== '/') return;

    const targetId = hash ? decodeURIComponent(hash.slice(1)) : 'home';

    let attempts = 0;
    let timeout: ReturnType<typeof setTimeout>;
    const scrollToTarget = () => {
      const target = document.getElementById(targetId);
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

export default App;
