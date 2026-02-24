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
        const data = await response.json();
        if (data && data.title && data.description) {
          setAboutData({
            title: data.title,
            description: data.description,
          });
        }
      } catch {
        console.log('Using default about content');
      }
    };

    fetchAboutData();
  }, []);

  return (
    <section id="about" className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 overflow-x-clip">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          {/* Section Header */}
          <div className="mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm text-gray-500 uppercase tracking-wider"
            >
              About Me
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold mt-4 mb-6"
            >
              {aboutData.title}
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-base sm:text-lg text-gray-400 max-w-3xl leading-relaxed"
            >
              {aboutData.description}
            </motion.p>
          </div>

          {/* Highlights Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {highlights.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <item.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-sm text-gray-400">{item.description}</p>
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
                <img
                  src="https://img.shields.io/badge/GitHub-Profile-111?logo=github"
                  alt="GitHub profile badge"
                  className="h-7 w-fit"
                  loading="lazy"
                />
                <img
                  src="https://img.shields.io/badge/LinkedIn-Connect-0A66C2?logo=linkedin&logoColor=white"
                  alt="LinkedIn profile badge"
                  className="h-7 w-fit"
                  loading="lazy"
                />
                <img
                  src="https://img.shields.io/badge/LeetCode-Active%20Coder-f89f1b?logo=leetcode&logoColor=white"
                  alt="LeetCode profile badge"
                  className="h-7 w-fit"
                  loading="lazy"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
