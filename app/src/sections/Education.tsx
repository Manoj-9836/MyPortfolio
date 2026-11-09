import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { GraduationCap, MapPin, Calendar } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

interface EducationData {
  _id?: string;
  institution: string;
  degree: string;
  gpa: string;
  location: string;
  period: string;
  current?: boolean;
  achievements?: string[];
}

const defaultEducationData: EducationData[] = [
  {
    institution: 'Lendi Institute of Engineering & Technology',
    degree: 'B.Tech, Computer Science & Engineering',
    gpa: 'CGPA: 8.1',
    location: 'Vizianagaram',
    period: '2024 – Present',
    current: true
  },
  {
    institution: 'Andhra Polytechnic, Kakinada',
    degree: 'Diploma, Computer Management & Engineering',
    gpa: 'Percentage: 86%',
    location: 'Kakinada',
    period: '2021 – 2024',
    current: false
  }
];

export default function Education() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [educationData, setEducationData] = useState<EducationData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEducation = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/education`);
        if (!response.ok) {
          throw new Error(`Education request failed with status ${response.status}`);
        }
        const data: EducationData[] = await response.json();
        if (Array.isArray(data)) {
          setEducationData(data);
        }
      } catch (error) {
        console.error('Failed to fetch education data:', error);
        setEducationData(defaultEducationData);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEducation();
  }, []);

  return (
    <section id="education" className="bg-[#111111] px-5 py-16 text-[#F3EEE3] sm:px-8 md:py-24 lg:px-12">
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
              04 / Education
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="relative inline-block pb-3 font-display text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl"
            >
              Academic Background
              <svg viewBox="0 0 260 14" className="absolute -bottom-0 left-6 w-[200px] sm:w-[250px]" aria-hidden="true">
                <path d="M3 10 C60 3 160 2 257 6" fill="none" stroke="#EA580C" strokeWidth="3.5" strokeLinecap="round" />
              </svg>
            </motion.h2>
          </div>

          {isLoading ? (
            <p className="border-t border-[#F3EEE3]/20 pt-6 font-mono text-xs uppercase tracking-[0.08em] text-[#F3EEE3]/55">
              Loading academic timeline...
            </p>
          ) : (
          <div className="relative border-t border-[#F3EEE3]/25 pt-8">
            <div className="absolute bottom-8 left-[7px] top-8 w-px bg-[#D9541E]/60 md:left-1/2 md:-translate-x-1/2" />
            {educationData.map((edu, index) => (
              <motion.div
                key={edu._id || edu.institution}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.2 }}
                className="relative mb-12 grid grid-cols-[16px_1fr] gap-6 last:mb-0 md:grid-cols-[1fr_32px_1fr] md:gap-8"
              >
                <div className={`col-start-2 md:col-start-1 ${index % 2 === 0 ? 'md:text-right' : 'md:col-start-3'}`}>
                  <p className={`font-mono text-xs uppercase tracking-[0.08em] text-[#F3EEE3]/55 ${index % 2 === 0 ? 'md:pr-8' : 'md:pl-8'}`}>
                    {edu.period}
                  </p>
                  <div className={`mt-3 border border-[#F3EEE3]/25 p-5 transition-colors hover:border-[#D9541E] ${index % 2 === 0 ? 'md:mr-8' : 'md:ml-8'}`}>
                    <div className={`flex items-start gap-3 ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                      <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center border border-[#D9541E] text-[#D9541E]">
                        <GraduationCap className="h-5 w-5" />
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-display text-xl font-semibold leading-tight">{edu.institution}</h3>
                        <p className="mt-2 font-serif text-sm leading-6 text-[#F3EEE3]/70">{edu.degree}</p>
                      </div>
                    </div>
                    <div className={`mt-5 flex flex-wrap gap-4 font-mono text-xs uppercase tracking-[0.05em] text-[#F3EEE3]/55 ${index % 2 === 0 ? 'md:justify-end' : ''}`}>
                      <span className="inline-flex items-center gap-2">
                        <MapPin className="h-3.5 w-3.5 text-[#D9541E]" />
                        {edu.location}
                      </span>
                      <span className="inline-flex items-center gap-2">
                        <Calendar className="h-3.5 w-3.5 text-[#D9541E]" />
                        {edu.gpa}
                      </span>
                      {edu.current && (
                        <span className="text-[#D9541E]">Current</span>
                      )}
                    </div>
                    {edu.achievements && edu.achievements.length > 0 && (
                      <ul className={`mt-4 space-y-2 border-t border-[#F3EEE3]/15 pt-4 font-serif text-sm leading-6 text-[#F3EEE3]/65 ${index % 2 === 0 ? 'md:text-right' : ''}`}>
                        {edu.achievements.map((achievement) => (
                          <li key={achievement}>{achievement}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
                <div className="col-start-1 row-start-1 flex justify-center md:col-start-2 md:row-start-1">
                  <span className="z-10 mt-1 flex h-4 w-4 rounded-full border-4 border-[#111111] bg-[#D9541E]" />
                </div>
                <div className="hidden md:col-start-1 md:row-start-1 md:block">
                  {index % 2 !== 0 && (
                    <p className="pt-1 text-right font-mono text-xs uppercase tracking-[0.08em] text-[#F3EEE3]/55">{edu.period}</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
