import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Code2, Brain, Users, Rocket } from 'lucide-react';
import DOMPurify from 'dompurify';
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
  highlights?: string[];
}

const sanitizeAboutHtml = (value: string) => {
  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(value);
  if (!looksLikeHtml) {
    return value.replace(/\r\n/g, '\n').replace(/\n/g, '<br />');
  }

  return DOMPurify.sanitize(value, {
    USE_PROFILES: { html: true },
    ALLOWED_ATTR: ['style', 'class', 'href', 'target', 'rel'],
    ALLOW_DATA_ATTR: false,
  });
};

export default function About() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [aboutData, setAboutData] = useState<AboutData>({
    title: 'Professional Summary',
    description: 'Computer Science undergraduate and Technical Head of the AI Club with strong experience in full-stack development and AI-powered applications. Actively involved in developer community building, technical workshops, and coding culture promotion. Passionate about mentoring peers, organizing programming initiatives to empower student developers.',
    highlights: [],
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
            highlights: Array.isArray(data.highlights) ? data.highlights : [],
          });
        }
      } catch {
        console.log('Using default about content');
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
          {/* Editorial profile */}
          <div className="grid gap-10 border-t border-[#111111]/20 pt-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center lg:gap-20">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="order-1 flex min-h-[300px] items-center justify-center lg:min-h-[430px]"
            >
              <img
                src="/Images/ManojKumar.png"
                alt="Bavisetti Manoj Kumar"
                className="h-auto max-h-[440px] w-full max-w-[360px] object-contain object-bottom sm:max-w-[400px] lg:max-h-[500px] lg:max-w-[430px]"
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={isInView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.7, delay: 0.25 }}
              className="order-2"
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={isInView ? { opacity: 1 } : {}}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="block font-mono text-xs uppercase tracking-[0.16em] text-[#111111]/60"
              >
                01 / ABOUT
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="relative mt-3 inline-block max-w-3xl pb-3 font-display text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl"
              >
                {aboutData.title}
                {/* hand-drawn underline */}
                <svg
                  viewBox="0 0 260 14"
                  className="absolute -bottom-0 left-6 w-[200px] sm:w-[250px]"
                  aria-hidden="true"
                >
                  <path
                    d="M3 10 C60 3 160 2 257 6"
                    fill="none"
                    stroke="#EA580C"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                </svg>
              </motion.h2>
              <div
                className="about-rich mt-7 max-w-2xl font-sans text-base leading-8 text-[#111111]/75 sm:text-lg"
                dangerouslySetInnerHTML={{ __html: sanitizeAboutHtml(aboutData.description) }}
              />
            </motion.div>
          </div>

          {/* Highlights Grid */}
          <div className="mt-16 grid grid-cols-1 border-t border-[#111111]/20 sm:grid-cols-2 lg:grid-cols-4">
            {highlights.map((item, index) => (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                className="group border-b border-[#111111]/20 py-6 sm:border-r sm:px-6 sm:first:pl-0 lg:border-b-0 lg:last:border-r-0 lg:py-7"
              >
                <div className="mb-6 flex h-10 w-10 items-center justify-center border border-[#D9541E] text-[#D9541E]">
                  <item.icon className="h-5 w-5" />
                </div>
                <p className="mb-3 font-mono text-xs text-[#111111]/55">0{index + 1}</p>
                <h3 className="font-display text-lg font-semibold">{item.title}</h3>
                <p className="mt-3 font-serif text-sm leading-6 text-[#111111]/65">
                  {aboutData.highlights?.[index] || item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
