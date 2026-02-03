import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import {
  Atom,
  Briefcase,
  CheckCircle2,
  Database,
  ExternalLink,
  Github,
  Globe,
  Leaf,
  Server,
  Sparkles,
  Wrench
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
        const data = await response.json();
        setProjects(data);
      } catch {
        // Use empty state if fetch fails
      }
    };

    fetchProjects();
  }, []);

  return (
    <section id="projects" className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900/10 to-black">
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
              Projects
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold mt-4"
            >
              Featured Work
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg text-gray-400 mt-4 max-w-2xl"
            >
              Showcasing my best work in AI-powered applications and full-stack development
            </motion.p>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 gap-8">
            {projects.map((project, index) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.15 }}
                className="group relative p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 overflow-hidden hover:border-white/20 transition-all duration-300"
              >
                {/* Featured badge */}
                {project.featured && (
                  <div className="w-full flex justify-end mb-3">
                    <div className="inline-flex w-fit px-2.5 md:px-3 py-1 bg-white/10 rounded-full text-[10px] md:text-xs font-medium backdrop-blur">
                      Featured Project
                    </div>
                  </div>
                )}

                <div className="flex flex-col md:flex-row gap-6">
                  {/* Icon/Visual with Background Image */}
                  <div className="flex-shrink-0 md:w-1/3 relative">
                    {/* Background Image Container */}
                    <div className="relative rounded-2xl overflow-hidden mb-4 group/img">
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-pink-500/20 to-blue-500/20 z-10" />
                      <motion.img
                        src={project.bgImage}
                        alt={project.title}
                        className="w-full h-32 object-cover"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                      />
                      {/* Overlay gradient */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent z-20" />
                      
                      {/* Tech icon on top of image */}
                      <div className="absolute bottom-3 left-3 z-30">
                        <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30">
                          <Briefcase className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                    
                    <h3 className="text-2xl font-bold mb-1">{project.title}</h3>
                    <p className="text-gray-400 text-sm mb-4">{project.subtitle}</p>
                    <p className="text-xs text-gray-500">{project.date}</p>
                  </div>

                  {/* Content */}
                  <div className="flex-1 md:w-2/3">
                    <p className="text-gray-300 mb-4 leading-relaxed">
                      {project.description}
                    </p>

                    {/* Highlights */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.highlights.map((highlight) => (
                        <span
                          key={highlight}
                          className="px-2 py-1 text-xs bg-white/10 rounded-md inline-flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3 h-3 text-white/80" />
                          {highlight}
                        </span>
                      ))}
                    </div>

                    {/* Tech Stack */}
                    <div className="flex flex-wrap gap-2 mb-6">
                      {project.tech.map((tech) => (
                        <span
                          key={tech}
                          className="px-3 py-1 text-sm border border-white/20 rounded-full"
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
                        className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 bg-white text-black rounded-full text-xs md:text-sm font-medium hover:bg-gray-200 transition-colors"
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
                          className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 border border-white/20 rounded-full text-xs md:text-sm hover:bg-white/5 transition-colors"
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
