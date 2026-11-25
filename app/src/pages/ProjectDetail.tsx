import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2, ExternalLink, Github, Mail, Play, X } from 'lucide-react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { API_ENDPOINTS } from '../config/api';
import type { Project } from '../types/project';
import { cleanProjectText, sanitizeProjectHtml } from '../utils/projectContent';
import { SkeletonBlock, SkeletonStatus } from '../components/PortfolioSkeleton';

gsap.registerPlugin(ScrollTrigger);

function RichText({ value, className = '' }: { value?: string; className?: string }) {
  if (!value?.trim()) return null;

  return (
    <div
      className={`project-rich min-w-0 overflow-hidden text-base leading-7 text-[#F3EEE3]/75 ${className}`}
      dangerouslySetInnerHTML={{ __html: sanitizeProjectHtml(value) }}
    />
  );
}

function googleDriveFileId(value: string) {
  try {
    const url = new URL(value);
    if (url.hostname !== 'drive.google.com') return null;

    const pathId = url.pathname.match(/^\/file\/d\/([A-Za-z0-9_-]+)/)?.[1];
    const fileId = pathId || url.searchParams.get('id');
    return fileId && /^[A-Za-z0-9_-]+$/.test(fileId) ? fileId : null;
  } catch {
    return null;
  }
}

function videoEmbedUrl(value: string) {
  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, '');
    const driveId = googleDriveFileId(value);

    if (driveId) {
      return `https://drive.google.com/file/d/${encodeURIComponent(driveId)}/preview?autoplay=1`;
    }

    if (host === 'youtu.be') {
      const videoId = url.pathname.slice(1);
      return videoId
        ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1`
        : null;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const videoId = url.searchParams.get('v');
      if (videoId) {
        return `https://www.youtube-nocookie.com/embed/${encodeURIComponent(videoId)}?autoplay=1`;
      }

      const embedMatch = url.pathname.match(/^\/embed\/([A-Za-z0-9_-]+)$/);
      return embedMatch
        ? `https://www.youtube-nocookie.com/embed/${encodeURIComponent(embedMatch[1])}?autoplay=1`
        : null;
    }

    if (host === 'vimeo.com' || host === 'player.vimeo.com') {
      const videoId = url.pathname.split('/').filter(Boolean).pop();
      return videoId && /^\d+$/.test(videoId)
        ? `https://player.vimeo.com/video/${videoId}?autoplay=1`
        : null;
    }
  } catch {
    return null;
  }

  return null;
}

export default function ProjectDetail() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [screenshotPage, setScreenshotPage] = useState(1);
  const [screenshotDirection, setScreenshotDirection] = useState(1);
  const [selectedScreenshotIndex, setSelectedScreenshotIndex] = useState<number | null>(null);
  const [useProjectPreview, setUseProjectPreview] = useState(false);
  const [isPosterUnavailable, setIsPosterUnavailable] = useState(false);
  const galleryRef = useRef<HTMLDivElement>(null);
  const videoDialogRef = useRef<HTMLDialogElement>(null);
  const closeVideoButtonRef = useRef<HTMLButtonElement>(null);
  const screenshotDialogRef = useRef<HTMLDialogElement>(null);
  const closeScreenshotButtonRef = useRef<HTMLButtonElement>(null);
  const screenshotTriggerRef = useRef<HTMLButtonElement | null>(null);
  const pageRef = useRef<HTMLElement>(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!projectId) {
      setError('Project not found.');
      setIsLoading(false);
      return;
    }

    const controller = new AbortController();
    setIsLoading(true);
    setError('');
    setProject(null);

    const fetchProjects = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/projects`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(`Projects request failed: ${response.status}`);

        const data: Project[] = await response.json();
        const allProjects = Array.isArray(data) ? data : [];
        const selected = allProjects.find((item) => item._id === projectId);

        if (!selected) {
          setError('Project not found.');
          return;
        }

        setProjects(allProjects);
        setProject(selected);
      } catch (fetchError) {
        if (controller.signal.aborted) return;
        console.error('Failed to load project details:', fetchError);
        setError('Project details could not be loaded. Please try again later.');
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    };

    fetchProjects();
    window.scrollTo({ top: 0, behavior: 'instant' });

    return () => controller.abort();
  }, [projectId]);

  useEffect(() => {
    setIsVideoOpen(false);
    setScreenshotPage(1);
    setSelectedScreenshotIndex(null);
    setUseProjectPreview(false);
    setIsPosterUnavailable(false);
  }, [projectId]);

  useEffect(() => {
    const page = pageRef.current;
    if (!page || !project || reduceMotion) return;

    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>('[data-project-reveal]').forEach((section) => {
        gsap.fromTo(
          section,
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.65,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 86%',
              once: true,
            },
          },
        );
      });
    }, pageRef);

    return () => context.revert();
  }, [project, reduceMotion]);

  useEffect(() => {
    const dialog = videoDialogRef.current;
    if (!isVideoOpen || !dialog || dialog.open) return;

    dialog.showModal();
    closeVideoButtonRef.current?.focus();
  }, [isVideoOpen]);

  useEffect(() => {
    const dialog = screenshotDialogRef.current;
    if (selectedScreenshotIndex === null || !dialog || dialog.open) return;

    dialog.showModal();
    closeScreenshotButtonRef.current?.focus();
  }, [selectedScreenshotIndex]);

  const closeScreenshot = () => {
    setSelectedScreenshotIndex(null);
    window.requestAnimationFrame(() => screenshotTriggerRef.current?.focus());
  };

  const goToScreenshotPage = (page: number) => {
    setScreenshotDirection(page > screenshotPage ? 1 : -1);
    setScreenshotPage(page);
    galleryRef.current?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  if (isLoading) {
    return (
      <main className="mx-auto max-w-[1200px] px-5 pb-24 pt-28 text-[#F3EEE3] sm:px-8 lg:px-12" aria-busy="true">
        <SkeletonStatus label="project details">
          <div aria-hidden="true">
            <SkeletonBlock tone="dark" className="h-4 w-32" />
            <SkeletonBlock tone="dark" className="mt-10 aspect-[16/8] w-full border border-[#F3EEE3]/10" />
            <div className="mt-10 grid gap-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
              <div className="space-y-4">
                <SkeletonBlock tone="dark" className="h-3 w-24" />
                <SkeletonBlock tone="dark" className="h-10 w-3/4" />
                <SkeletonBlock tone="dark" className="h-5 w-1/2" />
              </div>
              <div className="space-y-4 border-t border-[#F3EEE3]/20 pt-6">
                <SkeletonBlock tone="dark" className="h-5 w-full" />
                <SkeletonBlock tone="dark" className="h-5 w-full" />
                <SkeletonBlock tone="dark" className="h-5 w-4/5" />
              </div>
            </div>
            <div className="mt-16 border-t border-[#F3EEE3]/20 pt-8">
              <SkeletonBlock tone="dark" className="h-8 w-1/3" />
              <SkeletonBlock tone="dark" className="mt-6 h-5 w-full" />
              <SkeletonBlock tone="dark" className="mt-3 h-5 w-5/6" />
            </div>
          </div>
        </SkeletonStatus>
      </main>
    );
  }

  if (error || !project) {
    return (
      <main className="mx-auto max-w-[1200px] px-5 pb-24 pt-28 text-[#F3EEE3] sm:px-8 lg:px-12">
        <Link
          to="/#projects"
          className="inline-flex min-h-11 items-center gap-2 font-mono text-xs uppercase tracking-[0.08em] text-[#F3EEE3]/70 transition-colors hover:text-[#D9541E]"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to projects
        </Link>
        <p className="mt-8 border-t border-[#F3EEE3]/20 py-8 text-sm text-[#F3EEE3]/70" role="alert">
          {error || 'Project not found.'}
        </p>
      </main>
    );
  }

  const currentIndex = projects.findIndex((item) => item._id === project._id);
  const previousProject = currentIndex > 0 ? projects[currentIndex - 1] : undefined;
  const nextProject = currentIndex >= 0 ? projects[currentIndex + 1] : undefined;
  const videoUrl = project.demoVideoUrl?.trim();
  const embeddedVideo = videoUrl ? videoEmbedUrl(videoUrl) : null;
  const isVideoFile = Boolean(videoUrl && /\.(mp4|webm|ogg)(?:$|[?#])/i.test(videoUrl));
  const driveId = videoUrl ? googleDriveFileId(videoUrl) : null;
  const driveThumbnail = driveId
    ? `https://drive.google.com/thumbnail?id=${encodeURIComponent(driveId)}&sz=w960`
    : null;
  const videoPoster = driveThumbnail && !useProjectPreview ? driveThumbnail : project.bgImage;
  const screenshots = project.screenshots?.length
    ? project.screenshots
    : project.bgImage
      ? [{ src: project.bgImage, alt: `${project.title} project preview`, caption: 'Project preview' }]
      : [];
  const screenshotsPerPage = 3;
  const totalScreenshotPages = Math.ceil(screenshots.length / screenshotsPerPage);
  const visibleScreenshots = screenshots.slice(
    (screenshotPage - 1) * screenshotsPerPage,
    screenshotPage * screenshotsPerPage,
  );
  const selectedScreenshot = selectedScreenshotIndex === null
    ? null
    : screenshots[selectedScreenshotIndex];

  return (
      <main ref={pageRef} className="mx-auto max-w-[1200px] px-5 pb-16 pt-24 text-[#F3EEE3] sm:px-8 md:pt-28 lg:px-12">
      <nav aria-label="Breadcrumb" className="mb-8 flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-[0.08em] text-[#F3EEE3]/55">
        <Link to="/#projects" className="inline-flex min-h-11 items-center gap-2 transition-colors hover:text-[#D9541E]">
          <ArrowLeft className="h-4 w-4" />
          Back to projects
        </Link>
        <span aria-hidden="true">/</span>
        <span>Projects</span>
        <span aria-hidden="true">/</span>
        <span className="text-[#F3EEE3]/80">{project.title}</span>
      </nav>

      <header data-project-reveal className="grid gap-8 border-b border-[#F3EEE3]/20 pb-10 lg:grid-cols-[1fr_1.1fr] lg:items-center lg:gap-12">
        <div>
          <span className="inline-flex border border-[#D9541E] px-3 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[#D9541E]">
            {project.featured ? 'Featured project' : 'Project case study'}
          </span>
          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-[-0.04em] sm:text-5xl">
            {project.title}
          </h1>
          <p className="mt-3 text-lg leading-7 text-[#F3EEE3]/75">{project.subtitle}</p>
          <RichText value={project.description} className="mt-5 text-base leading-7 text-[#F3EEE3]/80" />
          <div className="mt-6 flex flex-wrap gap-3">
            {videoUrl && (
              <button
                type="button"
                onClick={() => setIsVideoOpen(true)}
                className="inline-flex min-h-11 items-center gap-2 border border-[#D9541E] bg-[#D9541E] px-5 text-sm font-medium text-[#111111] transition-colors hover:bg-[#F3EEE3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D9541E]"
              >
                <Play className="h-4 w-4 fill-current" />
                Watch demo
              </button>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 border border-[#F3EEE3]/35 px-5 text-sm transition-colors hover:border-[#D9541E] hover:text-[#D9541E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D9541E]"
              >
                <Github className="h-4 w-4" />
                View code
              </a>
            )}
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center gap-2 border border-[#F3EEE3]/35 px-5 text-sm transition-colors hover:border-[#D9541E] hover:text-[#D9541E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D9541E]"
              >
                <ExternalLink className="h-4 w-4" />
                Live project
              </a>
            )}
          </div>
        </div>

        {project.bgImage && (
          <img
            src={project.bgImage}
            alt={`${project.title} project preview`}
            width="1200"
            height="750"
            fetchPriority="high"
            className="aspect-[16/10] w-full border border-[#F3EEE3]/20 object-cover"
          />
        )}
      </header>

      {project.metrics && project.metrics.length > 0 && (
        <section data-project-reveal aria-label="Project results" className="grid border-b border-[#F3EEE3]/20 py-6 sm:grid-cols-2 lg:grid-cols-4">
          {project.metrics.map((metric, index) => (
            <motion.div
              key={`${metric.label}-${index}`}
              initial={reduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: reduceMotion ? 0 : 0.45, delay: reduceMotion ? 0 : index * 0.08 }}
              className={`border-[#F3EEE3]/15 px-4 py-3 first:pl-0 ${index > 0 ? 'border-t sm:border-t-0 sm:border-l' : ''}`}
            >
              <p className="font-display text-2xl font-semibold text-[#D9541E] sm:text-3xl">{metric.value}</p>
              <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.08em] text-[#F3EEE3]/65">{metric.label}</p>
            </motion.div>
          ))}
        </section>
      )}

      {(project.caseStudy?.problem || project.caseStudy?.approach) && (
        <section data-project-reveal className="grid gap-8 border-b border-[#F3EEE3]/20 py-8 lg:grid-cols-2 lg:gap-12">
          {project.caseStudy?.problem && (
            <div>
              <SectionHeading>Project overview</SectionHeading>
              <RichText value={project.caseStudy.problem} />
            </div>
          )}
          {project.caseStudy?.approach && (
            <div>
              <SectionHeading>Approach</SectionHeading>
              <RichText value={project.caseStudy.approach} />
            </div>
          )}
        </section>
      )}

      <section data-project-reveal className="border-b border-[#F3EEE3]/20 py-8">
        <SectionHeading>Application screenshots</SectionHeading>
        {screenshots.length > 0 ? (
          <AnimatePresence initial={false} mode="wait" custom={screenshotDirection}>
            <motion.div
              key={screenshotPage}
              ref={galleryRef}
              custom={screenshotDirection}
              variants={{
                enter: (direction: number) => ({ opacity: 0, x: direction * 32 }),
                center: { opacity: 1, x: 0 },
                exit: (direction: number) => ({ opacity: 0, x: direction * -32 }),
              }}
              initial={reduceMotion ? false : 'enter'}
              animate="center"
              exit={reduceMotion ? undefined : 'exit'}
              transition={{ duration: reduceMotion ? 0 : 0.24, ease: 'easeInOut' }}
              className="grid grid-cols-1 gap-4 sm:grid-cols-3 sm:auto-rows-[180px]"
              aria-label={`Project screenshots, page ${screenshotPage}`}
            >
              {visibleScreenshots.map((screenshot, index) => {
                const screenshotIndex = (screenshotPage - 1) * screenshotsPerPage + index;
                const alt = screenshot.alt || screenshot.caption || `${project.title} screenshot ${screenshotIndex + 1}`;

                return (
                  <motion.figure
                    key={`${screenshot.src}-${screenshotIndex}`}
                    initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.96 }}
                    whileInView={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
                    viewport={{ once: true, amount: 0.15 }}
                    transition={{
                      duration: reduceMotion ? 0 : 0.6,
                      delay: reduceMotion ? 0 : index * 0.12,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className={`group relative min-h-[240px] overflow-hidden border border-[#F3EEE3]/20 bg-[#111111] sm:min-h-0 ${index === 0 ? 'sm:col-span-2 sm:row-span-2' : 'sm:col-span-1'}`}
                  >
                    <button
                      type="button"
                      onClick={(event) => {
                        screenshotTriggerRef.current = event.currentTarget;
                        setSelectedScreenshotIndex(screenshotIndex);
                      }}
                      aria-label={`Enlarge screenshot: ${alt}`}
                      className="relative block h-full w-full overflow-hidden text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D9541E]"
                    >
                      <img
                        src={screenshot.src}
                        alt={alt}
                        loading="lazy"
                        decoding="async"
                        width="960"
                        height="600"
                        className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.04]"
                      />
                      <span className="absolute inset-0 bg-gradient-to-t from-[#080808]/90 via-[#080808]/10 to-transparent opacity-70 transition-opacity duration-300 group-hover:opacity-90" aria-hidden="true" />
                      {screenshot.caption && (
                        <span className="absolute inset-x-4 bottom-4 font-mono text-[11px] uppercase tracking-[0.08em] text-[#F3EEE3]/85">
                          {screenshot.caption}
                        </span>
                      )}
                    </button>
                  </motion.figure>
                );
              })}
            </motion.div>
          </AnimatePresence>
        ) : (
          <p className="border-t border-[#F3EEE3]/15 pt-4 text-base leading-7 text-[#F3EEE3]/65">
            Screenshots have not been added for this project yet.
          </p>
        )}
        {totalScreenshotPages > 1 && (
          <nav aria-label="Screenshot pagination" className="mt-8 flex flex-wrap items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => goToScreenshotPage(screenshotPage - 1)}
              disabled={screenshotPage === 1}
              aria-label="Previous screenshots page"
              className="flex h-11 w-11 items-center justify-center border border-[#F3EEE3]/25 text-[#F3EEE3] transition-colors hover:border-[#D9541E] disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: totalScreenshotPages }, (_, index) => index + 1).map((page) => (
              <button
                type="button"
                key={page}
                onClick={() => goToScreenshotPage(page)}
                aria-current={page === screenshotPage ? 'page' : undefined}
                aria-label={`Screenshots page ${page}`}
                className={`min-h-11 min-w-11 border px-3 font-mono text-xs transition-colors ${
                  page === screenshotPage
                    ? 'border-[#D9541E] text-[#D9541E]'
                    : 'border-[#F3EEE3]/25 text-[#F3EEE3]/70 hover:border-[#D9541E]'
                }`}
              >
                {String(page).padStart(2, '0')}
              </button>
            ))}
            <button
              type="button"
              onClick={() => goToScreenshotPage(screenshotPage + 1)}
              disabled={screenshotPage === totalScreenshotPages}
              aria-label="Next screenshots page"
              className="flex h-11 w-11 items-center justify-center border border-[#F3EEE3]/25 text-[#F3EEE3] transition-colors hover:border-[#D9541E] disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ArrowRight className="h-4 w-4" />
            </button>
          </nav>
        )}
        {totalScreenshotPages > 1 && (
          <p aria-live="polite" className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-[#F3EEE3]/45">
            Page {screenshotPage} of {totalScreenshotPages}
          </p>
        )}
      </section>

      <section data-project-reveal className="border-b border-[#F3EEE3]/20 py-8">
        <SectionHeading>Demo video</SectionHeading>
        {videoUrl ? (
          <figure className="w-full max-w-3xl">
            <button
              type="button"
              onClick={() => setIsVideoOpen(true)}
              aria-label={`Play demo video for ${project.title}`}
              className="group relative block aspect-video w-full overflow-hidden border border-[#F3EEE3]/25 bg-[#111111] text-[#F3EEE3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D9541E]"
            >
              {videoPoster && !isPosterUnavailable ? (
                <img
                  src={videoPoster}
                  alt={driveThumbnail && !useProjectPreview ? `${project.title} demo video thumbnail` : `${project.title} project preview`}
                  loading="lazy"
                  decoding="async"
                  width="960"
                  height="540"
                  onError={() => {
                    if (driveThumbnail && !useProjectPreview && project.bgImage) {
                      setUseProjectPreview(true);
                    } else {
                      setIsPosterUnavailable(true);
                    }
                  }}
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center font-mono text-xs uppercase tracking-[0.08em] text-[#F3EEE3]/60">
                  Play project demo
                </span>
              )}
              <span className="absolute inset-0 flex items-center justify-center bg-[#111111]/35 transition-colors group-hover:bg-[#111111]/55">
                <span className="flex h-14 w-14 items-center justify-center rounded-full border border-[#111111] bg-[#D9541E]">
                  <Play className="h-6 w-6 fill-[#F3EEE3] text-[#F3EEE3]" aria-hidden="true" />
                </span>
              </span>
            </button>
            <figcaption className="mt-2 font-mono text-[11px] text-[#F3EEE3]/60">
              Play demo video
            </figcaption>
          </figure>
        ) : (
          <p className="border-t border-[#F3EEE3]/15 pt-4 text-base leading-7 text-[#F3EEE3]/65">
            A demo video has not been added for this project yet.
          </p>
        )}
      </section>

      {project.features && project.features.length > 0 && (
        <section data-project-reveal className="border-b border-[#F3EEE3]/20 py-8">
          <SectionHeading>Key features</SectionHeading>
          <ul className="grid gap-x-8 divide-y divide-[#F3EEE3]/15 sm:grid-cols-2 sm:divide-y-0">
            {project.features.map((feature, index) => (
              <li key={`${feature.title}-${index}`} className="flex gap-3 border-b border-[#F3EEE3]/15 py-4 first:pt-0 sm:border-b-0 sm:py-3">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#D9541E]" />
                <div>
                  <h3 className="font-display text-lg font-semibold">{feature.title}</h3>
                  <p className="mt-1 text-base leading-6 text-[#F3EEE3]/65">{feature.description}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      {project.tech.length > 0 && (
        <section data-project-reveal className="border-b border-[#F3EEE3]/20 py-8">
          <SectionHeading>Tech stack</SectionHeading>
          <ul className="flex flex-wrap gap-2">
            {project.tech.map((technology) => (
              <li key={technology} className="border border-[#F3EEE3]/25 px-3 py-2 font-mono text-xs text-[#F3EEE3]/75">
                {technology}
              </li>
            ))}
          </ul>
        </section>
      )}

      {isVideoOpen && videoUrl && (
        <dialog
          ref={videoDialogRef}
          aria-labelledby="project-video-dialog-title"
          aria-modal="true"
          onCancel={(event) => {
            event.preventDefault();
            setIsVideoOpen(false);
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) setIsVideoOpen(false);
          }}
          className="fixed inset-0 m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-5xl border border-[#F3EEE3]/25 bg-[#111111] p-0 text-[#F3EEE3] backdrop:bg-[#111111]/90"
        >
          <div className="flex min-h-14 items-center justify-between gap-4 border-b border-[#F3EEE3]/20 px-4 py-2 sm:px-5">
            <h2 id="project-video-dialog-title" className="font-display text-lg font-semibold">
              {project.title} demo
            </h2>
            <button
              ref={closeVideoButtonRef}
              type="button"
              onClick={() => setIsVideoOpen(false)}
              aria-label="Close demo video"
              className="flex h-11 w-11 shrink-0 items-center justify-center border border-[#F3EEE3]/35 transition-colors hover:border-[#D9541E] hover:text-[#D9541E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D9541E]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="aspect-video w-full bg-[#111111]">
            {isVideoFile ? (
              <video
                src={videoUrl}
                controls
                autoPlay
                playsInline
                preload="metadata"
                className="h-full w-full"
              >
                Your browser does not support embedded video.
              </video>
            ) : embeddedVideo ? (
              <iframe
                src={embeddedVideo}
                title={`${project.title} project demo`}
                allow="autoplay; fullscreen; picture-in-picture"
                referrerPolicy="strict-origin-when-cross-origin"
                className="h-full w-full border-0"
              />
            ) : (
              <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
                <p className="text-base text-[#F3EEE3]/70">This video link cannot be embedded.</p>
                <a
                  href={videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center gap-2 border border-[#D9541E] px-4 text-sm text-[#F3EEE3] transition-colors hover:bg-[#D9541E] hover:text-[#111111]"
                >
                  Open video
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            )}
          </div>
        </dialog>
      )}

      {selectedScreenshot && (
        <dialog
          ref={screenshotDialogRef}
          aria-labelledby="project-screenshot-dialog-title"
          aria-modal="true"
          onCancel={(event) => {
            event.preventDefault();
            closeScreenshot();
          }}
          onClick={(event) => {
            if (event.target === event.currentTarget) closeScreenshot();
          }}
          className="fixed inset-0 m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-6xl border border-[#F3EEE3]/25 bg-[#111111] p-0 text-[#F3EEE3] backdrop:bg-[#111111]/90"
        >
          <div className="flex min-h-14 items-center justify-between gap-4 border-b border-[#F3EEE3]/20 px-4 py-2 sm:px-5">
            <h2 id="project-screenshot-dialog-title" className="font-display text-lg font-semibold">
              {selectedScreenshot.caption || `${project.title} screenshot`}
            </h2>
            <button
              ref={closeScreenshotButtonRef}
              type="button"
              onClick={closeScreenshot}
              aria-label="Close enlarged screenshot"
              className="flex h-11 w-11 shrink-0 items-center justify-center border border-[#F3EEE3]/35 transition-colors hover:border-[#D9541E] hover:text-[#D9541E] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D9541E]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="flex max-h-[calc(90vh-4rem)] items-center justify-center p-3 sm:p-5">
            <img
              src={selectedScreenshot.src}
              alt={selectedScreenshot.alt || selectedScreenshot.caption || `${project.title} screenshot`}
              className="max-h-[calc(90vh-7rem)] max-w-full object-contain"
            />
          </div>
        </dialog>
      )}

      {project.architectureImage && (
        <section data-project-reveal className="border-b border-[#F3EEE3]/20 py-8">
          <SectionHeading>System architecture</SectionHeading>
          <img
            src={project.architectureImage}
            alt={`${project.title} system architecture`}
            loading="lazy"
            decoding="async"
            width="1200"
            height="720"
            className="w-full border border-[#F3EEE3]/20 object-contain"
          />
        </section>
      )}

      {(project.challengesAndLearnings?.length || project.caseStudy?.impact || project.highlights.length > 0) && (
        <section data-project-reveal className="grid gap-8 border-b border-[#F3EEE3]/20 py-8 lg:grid-cols-2 lg:gap-12">
          {project.challengesAndLearnings && project.challengesAndLearnings.length > 0 && (
            <div>
              <SectionHeading>Challenges and learnings</SectionHeading>
              <ul className="space-y-3">
                {project.challengesAndLearnings.map((item, index) => (
                  <li key={`${item}-${index}`} className="flex gap-3 text-base leading-6 text-[#F3EEE3]/75">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 bg-[#D9541E]" aria-hidden="true" />
                    {cleanProjectText(item)}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {(project.caseStudy?.impact || project.highlights.length > 0) && (
            <div>
              <SectionHeading>Impact and results</SectionHeading>
              <RichText value={project.caseStudy?.impact} />
              {project.highlights.length > 0 && (
                <ul className="mt-4 space-y-3">
                  {project.highlights.map((highlight, index) => (
                    <li key={`${highlight}-${index}`} className="flex gap-3 text-base leading-6 text-[#F3EEE3]/75">
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#D9541E]" />
                      {cleanProjectText(highlight)}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </section>
      )}

      <nav aria-label="Project navigation" className="grid grid-cols-2 gap-4 pt-8">
        {previousProject ? (
          <Link
            to={`/projects/${encodeURIComponent(previousProject._id)}`}
            className="group flex min-h-16 items-center gap-3 border border-[#F3EEE3]/20 p-4 transition-colors hover:border-[#D9541E]"
          >
            <ArrowLeft className="h-4 w-4 shrink-0 text-[#D9541E]" />
            <span className="min-w-0">
              <span className="block font-mono text-[10px] uppercase tracking-[0.08em] text-[#F3EEE3]/55">Previous project</span>
              <span className="mt-1 block truncate text-sm group-hover:text-[#D9541E]">{previousProject.title}</span>
            </span>
          </Link>
        ) : <span />}
        {nextProject ? (
          <Link
            to={`/projects/${encodeURIComponent(nextProject._id)}`}
            className="group flex min-h-16 items-center justify-end gap-3 border border-[#F3EEE3]/20 p-4 text-right transition-colors hover:border-[#D9541E]"
          >
            <span className="min-w-0">
              <span className="block font-mono text-[10px] uppercase tracking-[0.08em] text-[#F3EEE3]/55">Next project</span>
              <span className="mt-1 block truncate text-sm group-hover:text-[#D9541E]">{nextProject.title}</span>
            </span>
            <ArrowRight className="h-4 w-4 shrink-0 text-[#D9541E]" />
          </Link>
        ) : <span />}
      </nav>

      <motion.section
        initial={reduceMotion ? false : { opacity: 0, y: 24 }}
        whileInView={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: reduceMotion ? 0 : 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mt-8 w-full border border-[#D9541E]/60 bg-[#171717] px-5 py-5 text-[#F3EEE3] sm:px-6 sm:py-6"
      >
        <p className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-[#D9541E]">
          <Mail aria-hidden="true" className="h-3.5 w-3.5" />
          Have a project in mind?
        </p>
        <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="max-w-lg font-sans text-xl font-semibold leading-tight tracking-[-0.02em] sm:text-2xl">
            Let’s build something useful together.
          </h2>
          <Link
            to="/#contact"
            className="inline-flex min-h-10 shrink-0 items-center justify-center border border-[#D9541E] bg-[#D9541E] px-4 py-2 text-xs font-medium text-[#111111] transition-colors hover:bg-[#F3EEE3] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#D9541E]"
          >
            Start a conversation
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </motion.section>
    </main>
  );
}

function SectionHeading({ children }: { children: string }) {
  return (
    <h2 className="mb-4 border-l-2 border-[#D9541E] pl-3 font-display text-xl font-semibold leading-tight sm:text-2xl">
      {children}
    </h2>
  );
}
