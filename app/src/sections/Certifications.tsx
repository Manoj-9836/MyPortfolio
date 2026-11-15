import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

interface Certification {
  _id: string;
  title: string;
  description: string;
  image?: string;
  issuer?: string;
  issueDate?: string;
  credentialUrl?: string;
}

const PAGE_SIZE = 6;

export default function Certifications() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/certifications`);
        if (!response.ok) throw new Error(`Certifications request failed: ${response.status}`);
        const data: Certification[] = await response.json();
        setCertifications(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch certifications:', error);
      }
    };
    fetchCertifications();
  }, []);

  const totalPages = Math.ceil(certifications.length / PAGE_SIZE);
  const currentCertifications = certifications.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const goToPage = (page: number) => {
    const nextPage = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(nextPage);
    ref.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section id="certifications" className="bg-[#111111] px-5 py-16 text-[#F3EEE3] sm:px-8 md:py-24 lg:px-12">
      <div className="mx-auto max-w-[1200px]">
        <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}}>
          <div className="mb-14 grid gap-8 border-t border-[#F3EEE3]/25 pt-5 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#F3EEE3]/60">06 / Credentials</span>
            <div>
              <h2 className="relative inline-block pb-3 font-display text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
                Certifications
                <svg viewBox="0 0 260 14" className="absolute -bottom-0 left-6 w-[200px] sm:w-[250px]" aria-hidden="true">
                  <path d="M3 10 C60 3 160 2 257 6" fill="none" stroke="#EA580C" strokeWidth="3.5" strokeLinecap="round" />
                </svg>
              </h2>
              <p className="mt-5 max-w-xl font-serif text-base leading-7 text-[#F3EEE3]/65">
                Selected credentials that document the tools and disciplines I keep developing.
              </p>
            </div>
          </div>

          <div className="grid border-t border-[#F3EEE3]/20 sm:grid-cols-2 lg:grid-cols-3">
            {currentCertifications.map((cert, index) => (
              <motion.article
                key={cert._id || cert.title}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="group relative border-b border-[#F3EEE3]/20 py-7 sm:mx-4 sm:first:ml-0 lg:mx-5 lg:first:ml-0"
              >
                <div className="absolute inset-x-0 top-0 h-0.5 bg-[#D9541E] opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                {cert.image && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ duration: 0.5, delay: 0.7 + index * 0.1 }}
                    className="relative mb-5 flex h-40 items-center justify-center overflow-hidden border border-[#F3EEE3]/15 bg-[#F3EEE3]/5 p-4"
                  >
                    <img src={cert.image} alt={cert.title} className="h-full w-full object-contain transition-transform duration-500 group-hover:scale-105" loading="lazy" decoding="async" />
                  </motion.div>
                )}
                <motion.h3
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.8 + index * 0.1 }}
                  className="font-display text-xl font-semibold leading-tight transition-colors duration-300 group-hover:text-[#D9541E]"
                >
                  {cert.title}
                </motion.h3>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.5, delay: 0.9 + index * 0.1 }}
                  className="mt-3 font-serif text-sm leading-6 text-[#F3EEE3]/65"
                >
                  {cert.description}
                </motion.p>
                {(cert.issuer || cert.issueDate) && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    transition={{ duration: 0.5, delay: 1 + index * 0.1 }}
                    className="mt-4 font-mono text-xs uppercase tracking-[0.06em] text-[#F3EEE3]/50"
                  >
                    {[cert.issuer, cert.issueDate].filter(Boolean).join(' / ')}
                  </motion.p>
                )}
                {cert.credentialUrl && (
                  <motion.a
                    initial={{ opacity: 0, y: 10 }}
                    animate={isInView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.5, delay: 1.05 + index * 0.1 }}
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 inline-flex items-center gap-2 text-sm text-[#D9541E] underline decoration-[#D9541E]/50 underline-offset-4 transition-colors hover:decoration-[#D9541E]"
                  >
                    View credential <ExternalLink className="h-3.5 w-3.5" />
                  </motion.a>
                )}
              </motion.article>
            ))}
          </div>
          {certifications.length === 0 && (
            <p className="border-b border-[#F3EEE3]/20 py-10 font-mono text-xs uppercase tracking-[0.08em] text-[#F3EEE3]/55">
              Credentials are being updated.
            </p>
          )}

          {totalPages > 1 && (
            <nav aria-label="Certifications pagination" className="mt-10 flex items-center justify-center gap-2">
              <button type="button" onClick={() => goToPage(currentPage - 1)} disabled={currentPage === 1} aria-label="Previous certifications page" className="border border-[#F3EEE3]/25 p-2 text-[#F3EEE3] hover:border-[#D9541E] disabled:cursor-not-allowed disabled:opacity-35">
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                <button type="button" key={page} onClick={() => goToPage(page)} aria-current={page === currentPage ? 'page' : undefined} className={`min-w-9 border px-3 py-2 font-mono text-xs ${page === currentPage ? 'border-[#D9541E] text-[#D9541E]' : 'border-[#F3EEE3]/25 text-[#F3EEE3]/60 hover:border-[#D9541E]'}`}>
                  {String(page).padStart(2, '0')}
                </button>
              ))}
              <button type="button" onClick={() => goToPage(currentPage + 1)} disabled={currentPage === totalPages} aria-label="Next certifications page" className="border border-[#F3EEE3]/25 p-2 text-[#F3EEE3] hover:border-[#D9541E] disabled:cursor-not-allowed disabled:opacity-35">
                <ChevronRight className="h-4 w-4" />
              </button>
            </nav>
          )}
          {totalPages > 1 && <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-[#F3EEE3]/45">Page {currentPage} of {totalPages}</p>}
        </motion.div>
      </div>
    </section>
  );
}
