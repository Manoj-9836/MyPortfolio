import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import {
  Briefcase,
  CheckCircle2,
  ExternalLink,
  Github
} from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

interface Project {
  _id: string;
  title: string;
  subtitle: string;
  description: string;
  tech: string[];
  date: string;
  liveUrl?: string;
  githubUrl?: string;
  highlights: string[];
  featured: boolean;
  bgImage?: string;
}

export default function Projects() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/projects`);
        if (!response.ok) throw new Error(`Projects request failed: ${response.status}`);
        const data = await response.json();
        setProjects(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch projects:', error);
      }
    };

    fetchProjects();
  }, []);

  return (
    <section id="projects" data-gsap-reveal className="bg-[#111111] px-5 py-16 text-[#F3EEE3] sm:px-8 md:py-24 lg:px-12">
      <div className="mx-auto max-w-[1200px]">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          {/* Section Header */}
          <div className="mb-16 grid gap-8 border-t border-[#F3EEE3]/25 pt-5 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
            <motion.span
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-mono text-xs uppercase tracking-[0.16em] text-[#F3EEE3]/60"
            >
              02 / Selected work
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="font-display text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl"
            >
              Featured Work
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="max-w-2xl font-serif text-lg leading-8 text-[#F3EEE3]/70"
            >
              Showcasing my best work in AI-powered applications and full-stack development
            </motion.p>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 gap-12">
            {projects.map((project, index) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.15 }}
                data-project-card
                className="group relative border-t border-[#F3EEE3]/30 pt-6 transition-colors duration-300 hover:border-[#D9541E] md:pt-8"
              >
                {/* Featured badge */}
                {project.featured && (
                  <div className="mb-5 flex w-full justify-end">
                    <div className="inline-flex w-fit border border-[#F3EEE3]/40 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[#F3EEE3]/70 md:px-3 md:text-xs">
                      Featured Project
                    </div>
                  </div>
                )}

                <div className="flex flex-col gap-8 md:flex-row md:gap-12">
                  {/* Icon/Visual with Background Image */}
                  <div className="relative flex-shrink-0 md:w-1/3">
                    {/* Background Image Container */}
                    <div className="group/img relative mb-5 overflow-hidden border border-[#F3EEE3]/20">
                      <motion.img
                        src={project.bgImage}
                        alt={project.title}
                        loading="lazy"
                        decoding="async"
                        className="h-48 w-full object-cover grayscale transition duration-500 group-hover/img:grayscale-0"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      />
                      <div className="absolute bottom-3 left-3">
                        <div className="flex h-12 w-12 items-center justify-center border border-[#D9541E] bg-[#111111] text-[#D9541E]">
                          <Briefcase className="h-6 w-6" />
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="font-display text-2xl font-semibold tracking-[-0.03em]">{project.title}</h3>
                    <p className="mt-1 font-serif text-sm text-[#F3EEE3]/65">{project.subtitle}</p>
                    <p className="mt-4 font-mono text-xs uppercase tracking-[0.08em] text-[#F3EEE3]/45">{project.date}</p>
                  </div>

                  {/* Content */}
                  <div className="flex-1 md:w-2/3">
                    <p className="max-w-2xl font-serif text-lg leading-8 text-[#F3EEE3]/80">
                      {project.description}
                    </p>

                    {/* Highlights */}
                    <div className="mb-6 flex flex-wrap gap-2">
                      {project.highlights.map((highlight) => (
                        <span
                          key={highlight}
                          className="inline-flex items-center gap-1.5 border border-[#F3EEE3]/20 px-2 py-1 text-xs text-[#F3EEE3]/75"
                        >
                          <CheckCircle2 className="h-3 w-3 text-[#D9541E]" />
                          {highlight}
                        </span>
                      ))}
                    </div>
                    {projects.length === 0 && (
                      <p className="border-t border-[#F3EEE3]/20 pt-6 font-mono text-xs uppercase tracking-[0.08em] text-[#F3EEE3]/55">
                        Selected work is being updated.
                      </p>
                    )}

                    {/* Tech Stack */}
                    <div className="mb-8 flex flex-wrap gap-2">
                      {project.tech.map((tech) => (
                        <span
                          key={tech}
                          className="border border-[#F3EEE3]/25 px-3 py-1 font-mono text-xs text-[#F3EEE3]/65"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>

                    {/* Links */}
                    <div className="flex flex-wrap gap-3 md:gap-4">
                      <motion.a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center gap-2 border border-[#D9541E] bg-[#D9541E] px-4 font-sans text-xs font-medium text-[#111111] transition-colors hover:bg-[#F3EEE3] hover:text-[#111111] md:px-5 md:text-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <ExternalLink className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        Live Demo
                      </motion.a>
                      {project.githubUrl && (
                        <motion.a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex min-h-11 items-center gap-2 border border-[#F3EEE3]/40 px-4 font-sans text-xs text-[#F3EEE3] transition-colors hover:border-[#D9541E] hover:text-[#D9541E] md:px-5 md:text-sm"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          <Github className="w-3.5 h-3.5 md:w-4 md:h-4" />
                          GitHub
                        </motion.a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
