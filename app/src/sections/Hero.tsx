import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';

interface HeroData {
  title: string;
  description: string;
}

export default function Hero() {
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
    <section id="home" className="min-h-screen flex flex-col items-center justify-center relative px-4 sm:px-6 pt-20 md:pt-24 overflow-x-clip">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-gray-900/20 pointer-events-none" />
      
      {/* Content */}
      <div className="relative z-10 text-center max-w-5xl mx-auto w-full">
        {/* Main Name */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl xl:text-9xl font-bold tracking-tight leading-tight mb-6 break-words"
          style={{ fontFamily: '"Montserrat", sans-serif' }}
        >
          <span className="block">BAVISETTI</span>
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="block text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-300 to-gray-500"
          >
            MANOJ KUMAR
          </motion.span>
        </motion.h1>

        {/* Title */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="text-lg sm:text-xl md:text-2xl text-gray-400 mb-8"
        >
          {heroData.title}
        </motion.p>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.9 }}
          className="text-sm sm:text-base text-gray-500 max-w-2xl mx-auto leading-relaxed mb-12"
        >
          {heroData.description}
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 1.1 }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4 w-full max-w-md sm:max-w-none mx-auto"
        >
          <motion.a
            href="#projects"
            className="px-7 sm:px-8 py-3 bg-white text-black font-medium rounded-full hover:bg-gray-200 transition-colors w-full sm:w-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            View Projects
          </motion.a>
          <motion.a
            href="/resume.pdf"
            target="_blank"
            rel="noopener noreferrer"
            download
            className="px-7 sm:px-8 py-3 border border-white/20 rounded-full hover:bg-white/5 transition-colors w-full sm:w-auto"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            My Resume
          </motion.a>
        </motion.div>
      </div>
    </section>
  );
}
