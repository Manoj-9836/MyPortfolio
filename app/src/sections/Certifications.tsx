import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
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

export default function Certifications() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const certificationsPerPage = 6;

  useEffect(() => {
    const fetchCertifications = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/certifications`);
        const data = await response.json();
        setCertifications(data);
      } catch {
        setCertifications([]);
      }
    };

    fetchCertifications();
  }, []);

  const indexOfLastCertification = currentPage * certificationsPerPage;
  const indexOfFirstCertification = indexOfLastCertification - certificationsPerPage;
  const currentCertifications = certifications.slice(indexOfFirstCertification, indexOfLastCertification);
  const totalPages = Math.ceil(certifications.length / certificationsPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="certifications" className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-gray-900/10 overflow-x-clip">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          <div className="mb-16">
            <motion.span
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm text-gray-500 uppercase tracking-wider"
            >
              Certifications
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold mt-4"
            >
              Credentials & Learning
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-base sm:text-lg text-gray-400 mt-4 max-w-2xl"
            >
              Professional certifications that validate my technical knowledge and continuous learning.
            </motion.p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {currentCertifications.map((cert, index) => (
              <motion.article
                key={cert._id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.08 }}
                className="group bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 hover:bg-white/10 transition-all"
              >
                {cert.image && (
                  <div className="w-full h-56 flex items-center justify-center overflow-hidden bg-gradient-to-br from-white/10 to-white/5 p-4">
                    <img
                      src={cert.image}
                      alt={cert.title}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  </div>
                )}

                <div className="p-5">
                  <h3 className="text-lg font-semibold leading-snug mb-2 line-clamp-2">{cert.title}</h3>
                  <p className="text-sm text-gray-400 line-clamp-3">{cert.description}</p>

                  {(cert.issuer || cert.issueDate) && (
                    <p className="text-xs text-gray-500 mt-4">
                      {[cert.issuer, cert.issueDate].filter(Boolean).join(' • ')}
                    </p>
                  )}

                  {cert.credentialUrl && (
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block mt-4 text-sm text-white underline underline-offset-4 hover:text-gray-300 transition-colors"
                    >
                      View Credential
                    </a>
                  )}
                </div>
              </motion.article>
            ))}
          </div>

          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-12 flex items-center justify-center gap-2"
            >
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => paginate(page)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentPage === page
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-400/50'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
