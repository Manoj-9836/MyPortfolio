import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Users, Calendar, Award } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

interface LeadershipItem {
  _id: string;
  title: string;
  organization: string;
  period: string;
  description: string;
  achievements: string[];
  order?: number;
}

export default function Leadership() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [experiences, setExperiences] = useState<LeadershipItem[]>([]);

  useEffect(() => {
    const fetchLeadership = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/leadership`);
        const data = await response.json();
        setExperiences(data);
      } catch {
        // Use empty state if fetch fails
      }
    };

    fetchLeadership();
  }, []);

  return (
    <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-gray-900/10">
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
              Leadership
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold mt-4"
            >
              Community Engagement
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg text-gray-400 mt-4 max-w-2xl"
            >
              Building developer communities and empowering student programmers
            </motion.p>
          </div>

          {/* Experience Cards */}
          <div className="space-y-8">
            {experiences.map((exp, index) => (
              <motion.div
                key={exp._id}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.15 }}
                className="relative group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="relative p-6 md:p-8 rounded-3xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300">
                  <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                    {/* Left - Role Info */}
                    <div className="lg:w-1/3">
                      <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 flex items-center justify-center mb-4 md:mb-6">
                        <Users className="w-7 h-7 md:w-8 md:h-8 text-white" />
                      </div>
                      <h3 className="text-xl md:text-2xl font-bold mb-2">{exp.title}</h3>
                      <p className="text-sm md:text-base text-gray-400 mb-4">{exp.organization}</p>
                      <div className="flex items-center gap-2 text-xs md:text-sm text-gray-500">
                        <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span>{exp.period}</span>
                      </div>
                    </div>

                    {/* Right - Achievements */}
                    <div className="lg:w-2/3">
                      <p className="text-sm md:text-base text-gray-300 mb-6">{exp.description}</p>
                      
                      <div className="space-y-4">
                        <h4 className="text-xs md:text-sm font-semibold text-gray-500 uppercase tracking-wider">
                          Key Achievements
                        </h4>
                        <ul className="space-y-3">
                          {exp.achievements.map((achievement, i) => (
                            <motion.li
                              key={i}
                              initial={{ opacity: 0, x: -20 }}
                              animate={isInView ? { opacity: 1, x: 0 } : {}}
                              transition={{ duration: 0.5, delay: 0.7 + i * 0.1 }}
                              className="flex items-start gap-3"
                            >
                              <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                                <Award className="w-3 h-3 text-white" />
                              </div>
                              <span className="text-gray-300">{achievement}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Stats Banner */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { value: '100+', label: 'Students Mentored' },
              { value: '10+', label: 'Workshops Conducted' },
              { value: '5+', label: 'AI Bootcamps' },
              { value: '3+', label: 'Innovation Projects' },
            ].map((stat) => (
              <div
                key={stat.label}
                className="p-6 rounded-2xl bg-white/5 border border-white/10 text-center"
              >
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-sm text-gray-400">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
