import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { API_ENDPOINTS } from '../config/api';

interface Skill {
  _id: string;
  name: string;
  level: number;
  category: string;
}

interface SkillCategory {
  title: string;
  skills: Skill[];
  color: string;
}

const categoryColors: Record<string, string> = {
  'Programming Languages': 'from-yellow-500/20 to-orange-500/20',
  'Frontend': 'from-blue-500/20 to-cyan-500/20',
  'Backend': 'from-green-500/20 to-emerald-500/20',
  'Databases': 'from-purple-500/20 to-pink-500/20',
  'Cloud & Tools': 'from-red-500/20 to-rose-500/20',
  'Other': 'from-gray-500/20 to-slate-500/20'
};

export default function Skills() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/skills`);
        const data: Skill[] = await response.json();
        
        // Group skills by category
        const grouped = data.reduce((acc: Record<string, Skill[]>, skill: Skill) => {
          if (!acc[skill.category]) {
            acc[skill.category] = [];
          }
          acc[skill.category].push(skill);
          return acc;
        }, {});
        
        // Convert to array format
        const categoriesArray: SkillCategory[] = Object.entries(grouped).map(([title, skills]) => ({
          title,
          skills,
          color: categoryColors[title] || categoryColors['Other']
        }));
        
        setSkillCategories(categoriesArray);
      } catch {
        // Use default empty state if fetch fails
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  return (
    <section id="skills" className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 overflow-x-clip">
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
              Skills
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold mt-4"
            >
              Technical Expertise
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-base sm:text-lg text-gray-400 mt-4 max-w-2xl"
            >
              A comprehensive toolkit for building modern, scalable applications
            </motion.p>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {loading &&
              [1, 2, 3].map((i) => (
                <div key={i} className="p-6 rounded-2xl bg-white/5 border border-white/10 animate-pulse">
                  <div className="h-5 w-32 bg-white/10 rounded mb-4" />
                  <div className="space-y-3">
                    <div className="h-4 w-full bg-white/10 rounded" />
                    <div className="h-4 w-5/6 bg-white/10 rounded" />
                    <div className="h-4 w-4/6 bg-white/10 rounded" />
                  </div>
                </div>
              ))}

            {skillCategories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                className="group relative p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all duration-300"
              >
                {/* Gradient background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${category.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-lg font-semibold mb-4">{category.title}</h3>
                  <div className="space-y-3">
                    {category.skills.map((skill) => {
                      return (
                      <div key={skill._id} className="space-y-1.5">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-white/90">{skill.name}</span>
                          <span className="text-white/60">{skill.level}%</span>
                        </div>

                        <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={isInView ? { width: `${skill.level}%` } : { width: 0 }}
                            transition={{ duration: 1, delay: 0.5 + category.skills.indexOf(skill) * 0.1, ease: 'easeOut' }}
                            className="h-full bg-gradient-to-r from-white/80 to-white/40 rounded-full"
                          />
                        </div>
                      </div>
                    );})}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
