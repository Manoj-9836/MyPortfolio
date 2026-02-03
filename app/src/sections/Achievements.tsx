import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Trophy, Code2, Medal, Star } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';

interface Achievement {
  _id: string;
  title: string;
  description: string;
  category: string;
  date: string;
  order?: number;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'Competitive Programming':
      return Code2;
    case 'Technical Leadership':
      return Trophy;
    case 'Project Innovation':
      return Star;
    case 'Academic Excellence':
      return Medal;
    default:
      return Trophy;
  }
};

export default function Achievements() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/achievements`);
        const data = await response.json();
        setAchievements(data);
      } catch {
        // Use empty state if fetch fails
      }
    };

    fetchAchievements();
  }, []);

  return (
    <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-8">
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
              Achievements
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold mt-4"
            >
              Milestones & Recognition
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg text-gray-400 mt-4 max-w-2xl"
            >
              Key accomplishments that mark my journey in tech
            </motion.p>
          </div>

          {/* Achievements Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {achievements.map((achievement, index) => {
              const Icon = getCategoryIcon(achievement.category);
              return (
                <motion.div
                  key={achievement._id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={isInView ? { opacity: 1, y: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                  className="group relative p-5 md:p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300"
                >
                  {/* Category Badge */}
                  <div className="absolute top-3 md:top-4 right-3 md:right-4 px-2 md:px-3 py-1 bg-white/10 rounded-full text-[10px] md:text-xs font-medium">
                    {achievement.category}
                  </div>

                  <div className="flex items-start gap-3 md:gap-4">
                    {/* Icon */}
                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gradient-to-br from-white/20 to-white/5 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5 md:w-6 md:h-6 text-white" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 pt-0.5">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-semibold">{achievement.title}</h3>
                      </div>
                      <p className="text-sm text-gray-400 mb-3 leading-relaxed">
                        {achievement.description}
                      </p>
                      <span className="text-xs text-gray-500">{achievement.date}</span>
                    </div>
                  </div>

                  {/* Decorative corner */}
                  <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-white/5 to-transparent rounded-tl-full opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.div>
              );
            })}
          </div>

          {/* Bottom CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 1 }}
            className="mt-16 text-center"
          >
            <p className="text-gray-400 mb-6">
              Always striving for excellence and pushing boundaries
            </p>
            <div className="flex justify-center gap-2">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />
              ))}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
