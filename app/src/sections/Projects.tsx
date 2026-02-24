import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import {
  Briefcase,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Eye,
  X,
  Github
} from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

interface Project {
  _id: string;
  title: string;
  subtitle: string;
  description: string;
  caseStudy?: {
    problem?: string;
    approach?: string;
    impact?: string;
  };
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
  const [expandedCaseStudyId, setExpandedCaseStudyId] = useState<string | null>(null);
  const [previewProject, setPreviewProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/projects`);
        const data = await response.json();
        setProjects(data);
      } catch {
        // Use empty state if fetch fails
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  return (
    <section id="projects" className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-gray-900/10 to-black overflow-x-clip">
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
              className="text-base sm:text-lg text-gray-400 mt-4 max-w-2xl"
            >
              Showcasing my best work in AI-powered applications and full-stack development
            </motion.p>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 gap-8">
            {loading &&
              [1, 2].map((i) => (
                <div key={i} className="p-8 rounded-3xl bg-white/5 border border-white/10 animate-pulse">
                  <div className="h-6 w-1/3 bg-white/10 rounded mb-4" />
                  <div className="h-4 w-full bg-white/10 rounded mb-2" />
                  <div className="h-4 w-5/6 bg-white/10 rounded mb-2" />
                  <div className="h-4 w-2/3 bg-white/10 rounded" />
                </div>
              ))}

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
                    
                    <h3 className="text-xl sm:text-2xl font-bold mb-1 break-words">{project.title}</h3>
                    <p className="text-gray-400 text-sm mb-4">{project.subtitle}</p>
                    <p className="text-xs text-gray-500">{project.date}</p>
                  </div>

                  {/* Content */}
                  <div className="flex-1 md:w-2/3">
                    <p className="text-gray-300 mb-4 leading-relaxed">
                      {project.description}
                    </p>

                    <button
                      onClick={() => setExpandedCaseStudyId(expandedCaseStudyId === project._id ? null : project._id)}
                      className="mb-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs border border-white/15 bg-white/5 hover:bg-white/10 transition-colors"
                    >
                      View Case Study
                      <ChevronDown
                        className={`w-3.5 h-3.5 transition-transform ${expandedCaseStudyId === project._id ? 'rotate-180' : ''}`}
                      />
                    </button>

                    {expandedCaseStudyId === project._id && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mb-5 p-3 sm:p-4 rounded-xl border border-white/10 bg-black/30"
                      >
                        <div className="grid grid-cols-1 gap-3 sm:gap-4">
                          <div>
                            <p className="text-[11px] sm:text-xs uppercase tracking-wider text-gray-500 mb-1">Problem</p>
                            <p className="text-sm text-gray-300 leading-relaxed">
                              {project.caseStudy?.problem || project.subtitle || 'Building a reliable, user-friendly product with real impact.'}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] sm:text-xs uppercase tracking-wider text-gray-500 mb-1">Approach</p>
                            <p className="text-sm text-gray-300 leading-relaxed">
                              {project.caseStudy?.approach || project.description}
                            </p>
                          </div>
                          <div>
                            <p className="text-[11px] sm:text-xs uppercase tracking-wider text-gray-500 mb-1">Impact</p>
                            <p className="text-sm text-gray-300 leading-relaxed">
                              {project.caseStudy?.impact || `Delivered with ${project.tech.slice(0, 3).join(', ')} and production-oriented design decisions.`}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    )}

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
                      <motion.button
                        onClick={() => setPreviewProject(project)}
                        className="flex items-center gap-2 px-4 md:px-5 py-2 md:py-2.5 border border-white/20 rounded-full text-xs md:text-sm hover:bg-white/5 transition-colors"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Eye className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        Quick Preview
                      </motion.button>
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

      {previewProject && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setPreviewProject(null)}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            className="absolute inset-0 p-4 sm:p-6 flex items-center justify-center"
          >
            <div className="w-full max-w-5xl rounded-2xl border border-white/10 bg-black overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div>
                  <p className="text-sm text-gray-400">Live Preview</p>
                  <h3 className="font-semibold text-white">{previewProject.title}</h3>
                </div>
                <button
                  onClick={() => setPreviewProject(null)}
                  className="p-2 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="h-[60vh] sm:h-[70vh] bg-black/40">
                {previewProject.liveUrl ? (
                  <iframe
                    src={previewProject.liveUrl}
                    className="w-full h-full"
                    title={`${previewProject.title} preview`}
                    loading="lazy"
                  />
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400 text-sm px-6 text-center">
                    No live URL available for this project preview.
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
}
