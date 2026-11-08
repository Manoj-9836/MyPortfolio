import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Code2, Brain, Users, Rocket } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

const highlights = [
  {
    icon: Code2,
    title: 'Full-Stack Development',
    description: 'Building scalable web applications with modern technologies'
  },
  {
    icon: Brain,
    title: 'AI Integration',
    description: 'Creating intelligent solutions using Gemini API and GenAI tools'
  },
  {
    icon: Users,
    title: 'Community Leadership',
    description: 'Leading AI Club and mentoring 100+ student developers'
  },
  {
    icon: Rocket,
    title: 'Problem Solving',
    description: 'Active competitive programmer with strong DSA skills'
  }
];

interface AboutData {
  title: string;
  description: string;
}

export default function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [aboutData, setAboutData] = useState<AboutData>({
    title: 'Professional Summary',
    description: 'Computer Science undergraduate and Technical Head of the AI Club with strong experience in full-stack development and AI-powered applications. Actively involved in developer community building, technical workshops, and coding culture promotion. Passionate about mentoring peers, organizing programming initiatives to empower student developers.',
  });

  useEffect(() => {
    // Fetch about data from backend
    const fetchAboutData = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/about`);
        if (!response.ok) throw new Error(`About request failed: ${response.status}`);
        const data = await response.json();
        if (data && data.title && data.description) {
          setAboutData({
            title: data.title,
            description: data.description,
          });
        }
      } catch (error) {
        console.error('Failed to fetch professional summary:', error);
      }
    };

    fetchAboutData();
  }, []);

  return (
    <section id="about" data-gsap-reveal className="bg-[#F3EEE3] px-5 py-16 text-[#111111] sm:px-8 md:py-24 lg:px-12">
      <div className="mx-auto max-w-[1200px]">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          {/* Section Header */}
          <div className="grid gap-12 border-t border-[#111111]/20 pt-5 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
            <motion.span
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-mono text-xs uppercase tracking-[0.16em] text-[#111111]/60"
            >
              01 / About
            </motion.span>
            <div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="max-w-3xl font-display text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl"
              >
                {aboutData.title}
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-6 max-w-3xl font-serif text-lg leading-8 text-[#111111]/75"
              >
                {aboutData.description}
              </motion.p>
            </div>
          </div>

          {/* Highlights Grid */}
          <div className="mt-16 grid grid-cols-1 border-t border-[#111111]/20 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                className="group border-b border-[#111111]/20 py-6 sm:border-r sm:px-6 sm:first:pl-0 lg:border-b-0 lg:last:border-r-0"
              >
                <div className="mb-6 flex h-10 w-10 items-center justify-center border border-[#D9541E] text-[#D9541E]">
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="mb-3 font-mono text-xs text-[#111111]/55">0{index + 1}</p>
                <h3 className="font-display text-lg font-semibold">{item.title}</h3>
                <p className="mt-3 font-serif text-sm leading-6 text-[#111111]/65">{item.description}</p>
              </motion.div>
            ))}
          </div>
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">Impact Snapshot</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl bg-black/30 border border-white/10 p-3 text-center">
                  <p className="text-xl font-semibold">100+</p>
                  <p className="text-xs text-gray-400 mt-1">Students Mentored</p>
                </div>
                <div className="rounded-xl bg-black/30 border border-white/10 p-3 text-center">
                  <p className="text-xl font-semibold">10+</p>
                  <p className="text-xs text-gray-400 mt-1">Projects Built</p>
                </div>
                <div className="rounded-xl bg-black/30 border border-white/10 p-3 text-center">
                  <p className="text-xl font-semibold">5+</p>
                  <p className="text-xs text-gray-400 mt-1">Workshops Led</p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-xs uppercase tracking-wider text-gray-500 mb-3">Live Profiles</p>
              <div className="flex flex-col gap-3">
                <a
                  href="https://github.com/Manoj-9836"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Visit Manoj's GitHub profile"
                >
                  <img
                    src="https://img.shields.io/badge/GitHub-Profile-111?logo=github"
                    alt="GitHub profile badge"
                    className="h-7 w-fit"
                    loading="lazy"
                  />
                </a>
                <a
                  href="https://www.linkedin.com/in/mkmanoj-dev/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Visit Manoj's LinkedIn profile"
                >
                  <img
                    src="https://img.shields.io/badge/LinkedIn-Connect-0A66C2?logo=linkedin&logoColor=white"
                    alt="LinkedIn profile badge"
                    className="h-7 w-fit"
                    loading="lazy"
                  />
                </a>
                <a
                  href="https://leetcode.com/u/Manoj9836/"
                  target="_blank"
                  rel="noreferrer"
                  aria-label="Visit Manoj's LeetCode profile"
                >
                  <img
                    src="https://img.shields.io/badge/LeetCode-Active%20Coder-f89f1b?logo=leetcode&logoColor=white"
                    alt="LeetCode profile badge"
                    className="h-7 w-fit"
                    loading="lazy"
                  />
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
