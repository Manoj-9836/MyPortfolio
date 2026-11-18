import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { API_ENDPOINTS } from '../config/api';
import type { Project } from '../types/project';

const MotionLink = motion.create(Link);

export default function Projects() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const shouldReduceMotion = useReducedMotion();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/projects`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Projects request failed: ${response.status}`);

        const data: Project[] = await response.json();
        setProjects(Array.isArray(data) ? data : []);
      } catch (fetchError) {
        if (controller.signal.aborted) return;
        console.error('Failed to fetch projects:', fetchError);
        setError('Projects could not be loaded. Please try again later.');
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    fetchProjects();
    return () => controller.abort();
  }, []);

  return (
    <section id="projects" data-gsap-reveal className="bg-[#111111] px-5 py-16 text-[#F3EEE3] sm:px-8 md:py-24 lg:px-12">
      <div className="mx-auto max-w-[1200px]" ref={ref}>
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          animate={isInView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: shouldReduceMotion ? 0 : 0.55 }}
        >
          <div className="mb-12 grid gap-6 border-t border-[#F3EEE3]/25 pt-5 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#F3EEE3]/60">
              04 / Selected work
            </span>
            <div>
              <h2 className="font-display text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
                Featured Work
              </h2>
              <p className="mt-5 max-w-2xl font-sans text-lg leading-8 text-[#F3EEE3]/70">
                Showcasing my best work in AI-powered applications and full-stack development
              </p>
            </div>
          </div>

          {isLoading ? (
            <p className="border-t border-[#F3EEE3]/20 py-10 font-mono text-xs uppercase tracking-[0.08em] text-[#F3EEE3]/55" role="status">
              Loading projects…
            </p>
          ) : error ? (
            <p className="border-t border-[#F3EEE3]/20 py-10 text-sm text-[#F3EEE3]/70" role="alert">
              {error}
            </p>
          ) : projects.length === 0 ? (
            <p className="border-t border-[#F3EEE3]/20 py-10 font-mono text-xs uppercase tracking-[0.08em] text-[#F3EEE3]/55">
              Project case studies are being updated.
            </p>
          ) : (
            <div className="grid grid-cols-1 border-t border-[#F3EEE3]/20 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project, index) => (
                <MotionLink
                  key={project._id}
                  to={`/projects/${encodeURIComponent(project._id)}`}
                  aria-label={`View case study: ${project.title}`}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
                  animate={isInView ? { opacity: 1, y: 0 } : undefined}
                  transition={{
                    duration: shouldReduceMotion ? 0 : 0.45,
                    delay: shouldReduceMotion ? 0 : index * 0.08,
                  }}
                  data-project-card
                  className="group border-b border-[#F3EEE3]/20 py-6 outline-none sm:mx-4 sm:first:ml-0 lg:mx-5 lg:first:ml-0"
                >
                  <article className="flex h-full flex-col justify-between border border-[#F3EEE3]/15 p-4 transition-colors duration-200 group-hover:border-[#D9541E] group-focus-visible:border-[#D9541E] sm:p-6">
                    <div>
                      {project.bgImage && (
                        <div className="mb-5 aspect-[16/9] overflow-hidden border border-[#F3EEE3]/20">
                          <img
                            src={project.bgImage}
                            alt={`${project.title} project preview`}
                            loading="lazy"
                            decoding="async"
                            width="960"
                            height="540"
                            className="h-full w-full object-cover"
                          />
                        </div>
                      )}
                      <div className="mb-3 flex flex-wrap items-center gap-3">
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
                      <p className="mt-2 font-sans text-sm leading-6 text-[#F3EEE3]/65">
                        {project.subtitle}
                      </p>
                    </div>
                    <div className="relative z-10 mt-6 flex items-center justify-between gap-3 border-t border-[#F3EEE3]/15 pt-3">
                      <span className="truncate font-mono text-[10px] uppercase tracking-[0.08em] text-[#F3EEE3]/45">
                        {project.tech.slice(0, 2).join(' / ')}
                      </span>
                      <span className="shrink-0 text-xs font-medium text-[#D9541E]">
                        View case study →
                      </span>
                    </div>
                  </article>
                </MotionLink>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
