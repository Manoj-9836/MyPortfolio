import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import DOMPurify from 'dompurify';
import {
  Briefcase,
  BarChart3,
  Code2,
  CheckCircle2,
  ExternalLink,
  Github,
  Layers3,
  Target,
  X,
  Calendar
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
  caseStudy?: {
    problem?: string;
    approach?: string;
    impact?: string;
  };
}

const cleanProjectText = (value = '') => {
  const decoded = value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&#39;/gi, "'")
    .replace(/&quot;/gi, '"');
  return decoded.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
};

const sanitizeProjectHtml = (value = '') => {
  const decoded = value.replace(/&nbsp;/gi, ' ');
  const looksLikeHtml = /<\/?[a-z][\s\S]*>/i.test(decoded);

  if (!looksLikeHtml) {
    return decoded.replace(/\r\n/g, '\n').replace(/\n/g, '<br />');
  }

  return DOMPurify.sanitize(decoded, {
    USE_PROFILES: { html: true },
    ALLOWED_ATTR: ['style', 'class', 'href', 'target', 'rel', 'src', 'alt', 'width', 'height'],
    ALLOW_DATA_ATTR: false,
  });
};

function ProjectRichText({ value, className = '' }: { value?: string; className?: string }) {
  if (!value?.trim()) return null;

  return (
    <div
      className={`project-rich min-w-0 overflow-hidden font-sans text-sm leading-7 text-[#F3EEE3]/75 ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizeProjectHtml(value) }}
    />
  );
}

const insightSections = [
  { key: 'problem', label: 'Problem', icon: Target },
  { key: 'approach', label: 'Approach', icon: Layers3 },
  { key: 'impact', label: 'Impact', icon: BarChart3 },
] as const;

export default function Projects() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  useEffect(() => {
    if (!selectedProject) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedProject(null);
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedProject]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/projects`);
        if (!response.ok) throw new Error(`Projects request failed: ${response.status}`);
        const data: Project[] = await response.json();
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
            <div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="relative inline-block pb-3 font-display text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl"
              >
                Featured Work
                <svg viewBox="0 0 260 14" className="absolute -bottom-0 left-6 w-[200px] sm:w-[250px]" aria-hidden="true">
                  <path d="M3 10 C60 3 160 2 257 6" fill="none" stroke="#EA580C" strokeWidth="3.5" strokeLinecap="round" />
                </svg>
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-5 max-w-2xl font-serif text-lg leading-8 text-[#F3EEE3]/70"
              >
                Showcasing my best work in AI-powered applications and full-stack development
              </motion.p>
            </div>
          </div>

          {/* Projects Grid */}
          <div className="grid grid-cols-1 border-t border-[#F3EEE3]/20 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project, index) => (
              <motion.div
                key={project.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.15 }}
                data-project-card
                role="button"
                tabIndex={0}
                aria-label={`View details for ${project.title}`}
                onClick={() => setSelectedProject(project)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    setSelectedProject(project);
                  }
                }}
                className="group cursor-pointer border-b border-[#F3EEE3]/20 py-6 outline-none sm:mx-4 sm:first:ml-0 lg:mx-5 lg:first:ml-0"
              >
                <div className="relative flex h-full flex-col justify-between overflow-hidden border border-[#F3EEE3]/15 bg-[#111111] p-4 transition-colors duration-300 group-hover:border-[#D9541E] group-focus-visible:border-[#D9541E] sm:p-6">
                  <div className="absolute inset-0 border-t-2 border-[#D9541E] opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
                  <div className="relative z-10">
                    <div className="group/img relative mb-5 h-36 overflow-hidden border border-[#F3EEE3]/20">
                      {project.bgImage ? (
                        <motion.img
                          src={project.bgImage}
                          alt={`${project.title} project preview`}
                          loading="lazy"
                          decoding="async"
                          className="h-full w-full object-cover grayscale transition duration-500 group-hover/img:scale-105 group-hover/img:grayscale-0"
                          whileHover={{ scale: 1.05 }}
                          transition={{ duration: 0.3 }}
                        />
                      ) : (
                        <div className="flex h-48 items-end bg-[#F3EEE3]/10 p-4 font-mono text-xs uppercase tracking-[0.08em] text-[#F3EEE3]/50">
                          Project visual coming soon
                        </div>
                      )}
                      <div className="absolute bottom-3 left-3">
                        <div className="flex h-10 w-10 items-center justify-center border border-[#D9541E] bg-[#111111] text-[#D9541E]">
                          <Briefcase className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <span className="border border-[#D9541E]/70 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[#D9541E]">
                        {project.featured ? 'Featured work' : 'Project'}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#F3EEE3]/45">
                        {project.date}
                      </span>
                    </div>
                    <h3 className="font-display text-xl font-semibold leading-tight tracking-[-0.03em] transition-colors group-hover:text-[#D9541E]">
                      {project.title}
                    </h3>
                    <p className="mt-2 font-serif text-sm leading-6 text-[#F3EEE3]/65">{project.subtitle}</p>
                  </div>
                  <div className="relative z-10 mt-6 flex items-center justify-between border-t border-[#F3EEE3]/15 pt-3">
                    <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[#F3EEE3]/45">
                      {project.tech.slice(0, 2).join(' / ')}
                    </span>
                    <span className="text-xs font-medium text-[#D9541E]">View case study →</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          {projects.length === 0 && (
            <p className="border-t border-[#F3EEE3]/20 py-10 font-mono text-xs uppercase tracking-[0.08em] text-[#F3EEE3]/55">
              Project case studies are being updated.
            </p>
          )}
        </motion.div>
      </div>

      <AnimatePresence>
        {selectedProject && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#111111]/90 p-4 sm:p-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="project-modal-title"
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) setSelectedProject(null);
            }}
          >
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              className="relative max-h-[92vh] w-full max-w-6xl overflow-y-auto rounded-xl border border-[#D9541E] bg-[#111111] text-[#F3EEE3]"
            >
              <button
                type="button"
                onClick={() => setSelectedProject(null)}
                aria-label="Close project details"
                className="absolute right-4 top-4 z-20 flex h-11 w-11 items-center justify-center border border-[#F3EEE3]/30 bg-[#111111] text-[#F3EEE3] transition-colors hover:border-[#D9541E] hover:text-[#D9541E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D9541E]"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="border-t-2 border-[#D9541E] p-5 sm:p-8 lg:p-10">
                <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-10">
                  <div>
                    {selectedProject.bgImage ? (
                      <img
                        src={selectedProject.bgImage}
                        alt={`${selectedProject.title} project preview`}
                        className="aspect-[4/3] w-full rounded-lg border border-[#F3EEE3]/30 object-cover"
                      />
                    ) : (
                      <div className="flex aspect-[4/3] items-end rounded-lg border border-[#F3EEE3]/20 bg-[#F3EEE3]/10 p-4 font-mono text-xs uppercase tracking-[0.08em] text-[#F3EEE3]/50">
                        Project visual coming soon
                      </div>
                    )}
                    <div className="mt-4 flex items-center gap-2 font-mono text-xs uppercase tracking-[0.08em] text-[#F3EEE3]/55">
                      <Calendar className="h-3.5 w-3.5 text-[#D9541E]" />
                      {selectedProject.date}
                    </div>
                  </div>

                  <div>
                    <span className="inline-flex border border-[#D9541E] px-3 py-1 font-mono text-xs uppercase tracking-[0.12em] text-[#D9541E]">
                      {selectedProject.featured ? 'Featured project' : 'Project case study'}
                    </span>
                    <h2 id="project-modal-title" className="mt-4 border-l-2 border-[#D9541E] pl-3 font-display text-3xl font-semibold leading-tight tracking-[-0.04em] sm:text-4xl">
                      {selectedProject.title}
                    </h2>
                    <p className="mt-3 font-sans text-lg text-[#F3EEE3]/70">{selectedProject.subtitle}</p>
                    <ProjectRichText value={selectedProject.description} className="mt-6 text-base leading-7 text-[#F3EEE3]/80" />
                  </div>
                </div>

                <div className="mt-8 grid border-y border-[#F3EEE3]/20 py-5 lg:grid-cols-3">
                  {insightSections.map(({ key, label, icon: Icon }, index) => {
                    const value = selectedProject.caseStudy?.[key];
                    return (
                      <section
                        key={key}
                        className={`min-w-0 px-1 py-2 lg:px-6 ${index > 0 ? 'border-t border-[#F3EEE3]/20 lg:border-l lg:border-t-0' : ''}`}
                      >
                        <h3 className="mb-4 flex items-center gap-3 font-display text-xl font-semibold">
                          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#D9541E]/20 text-[#D9541E]">
                            <Icon className="h-5 w-5" />
                          </span>
                          {label}
                        </h3>
                        <ProjectRichText value={value} />
                        {key === 'impact' && selectedProject.highlights.length > 0 && (
                          <ul className="mt-4 space-y-2">
                            {selectedProject.highlights.map((highlight) => (
                              <li key={highlight} className="flex items-start gap-2 text-sm leading-6 text-[#F3EEE3]/75">
                                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#D9541E]" />
                                <span>{cleanProjectText(highlight)}</span>
                              </li>
                            ))}
                          </ul>
                        )}
                      </section>
                    );
                  })}
                </div>

                <div className="mt-6 flex flex-col gap-6 border-b border-[#F3EEE3]/20 pb-6 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0">
                    <p className="mb-3 flex items-center gap-2 font-display text-xl font-semibold text-[#D9541E]">
                      <Code2 className="h-5 w-5" />
                      Technologies
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.tech.map((tech) => (
                        <span key={tech} className="rounded-md border border-[#F3EEE3]/30 px-3 py-2 font-mono text-xs text-[#F3EEE3]/75">{tech}</span>
                      ))}
                    </div>
                  </div>
                  <div className="flex shrink-0 flex-wrap gap-3 lg:justify-end">
                    {selectedProject.liveUrl && (
                      <a
                        href={selectedProject.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(event) => event.stopPropagation()}
                        className="order-2 inline-flex min-h-11 items-center gap-2 rounded-md border border-[#D9541E] bg-[#D9541E] px-5 text-sm font-medium text-[#111111] transition-colors hover:bg-[#F3EEE3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D9541E] lg:order-1"
                      >
                        <ExternalLink className="h-4 w-4" />
                        Live demo
                      </a>
                    )}
                    {selectedProject.githubUrl && (
                      <a
                        href={selectedProject.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(event) => event.stopPropagation()}
                        className="order-1 inline-flex min-h-11 items-center gap-2 rounded-md border border-[#F3EEE3]/35 px-5 text-sm transition-colors hover:border-[#D9541E] hover:text-[#D9541E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D9541E] lg:order-2"
                      >
                        <Github className="h-4 w-4" />
                        GitHub
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
