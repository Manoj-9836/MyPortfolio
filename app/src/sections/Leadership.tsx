import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { Award, Calendar, Users } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

interface LeadershipItem {
  _id: string;
  title: string;
  organization: string;
  period: string;
  description: string;
  achievements: string[];
  logo?: string;
}

export default function Leadership() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [experiences, setExperiences] = useState<LeadershipItem[]>([]);

  useEffect(() => {
    const fetchLeadership = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/leadership`);
        if (!response.ok) throw new Error(`Leadership request failed: ${response.status}`);
        const data: LeadershipItem[] = await response.json();
        setExperiences(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch community engagement:', error);
      }
    };
    fetchLeadership();
  }, []);

  return (
    <section id="leadership" className="bg-[#111111] px-5 py-16 text-[#F3EEE3] sm:px-8 md:py-24 lg:px-12">
      <div className="mx-auto max-w-[1200px]">
        <motion.div ref={ref} initial={{ opacity: 0, y: 40 }} animate={isInView ? { opacity: 1, y: 0 } : {}}>
          <div className="mb-14 grid gap-8 border-t border-[#F3EEE3]/25 pt-5 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#F3EEE3]/60">06 / Community</span>
            <div>
              <h2 className="font-display text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
                Community Engagement
              </h2>
              <p className="mt-5 max-w-xl font-serif text-base leading-7 text-[#F3EEE3]/65">
                Building developer communities and empowering student programmers through practical, shared learning.
              </p>
            </div>
          </div>

          <div className="space-y-0 border-t border-[#F3EEE3]/20">
            {experiences.map((experience, index) => (
              <motion.article
                key={experience._id || experience.title}
                initial={{ opacity: 0, y: 24 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.12 }}
                className="grid gap-8 border-b border-[#F3EEE3]/20 py-8 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24"
              >
                <div>
                  <div className="mb-5 flex h-12 w-12 items-center justify-center border border-[#D9541E] text-[#D9541E]">
                    {experience.logo ? (
                      <img src={experience.logo} alt="" className="h-full w-full object-cover" />
                    ) : (
                      <Users className="h-5 w-5" />
                    )}
                  </div>
                  <h3 className="font-display text-2xl font-semibold leading-tight">{experience.title}</h3>
                  <p className="mt-2 text-sm text-[#F3EEE3]/65">{experience.organization}</p>
                  <p className="mt-4 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.08em] text-[#F3EEE3]/50">
                    <Calendar className="h-3.5 w-3.5 text-[#D9541E]" />
                    {experience.period}
                  </p>
                </div>
                <div>
                  <p className="font-serif text-base leading-7 text-[#F3EEE3]/75">{experience.description}</p>
                  {experience.achievements?.length > 0 && (
                    <ul className="mt-6 grid gap-3 sm:grid-cols-2">
                      {experience.achievements.map((achievement) => (
                        <li key={achievement} className="flex items-start gap-3 text-sm leading-6 text-[#F3EEE3]/65">
                          <Award className="mt-1 h-4 w-4 flex-shrink-0 text-[#D9541E]" />
                          {achievement}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
