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
}

export default function Skills() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [skillCategories, setSkillCategories] = useState<SkillCategory[]>([]);

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
          skills
        }));
        
        setSkillCategories(categoriesArray);
      } catch {
        // Use default empty state if fetch fails
      }
    };

    fetchSkills();
  }, []);

  return (
    <section id="skills" data-gsap-reveal className="bg-[#F3EEE3] px-5 py-16 text-[#111111] sm:px-8 md:py-24 lg:px-12">
      <div className="mx-auto max-w-[1200px]">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          {/* Section Header */}
          <div className="mb-16 grid gap-8 border-t border-[#111111]/20 pt-5 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
            <motion.span
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-mono text-xs uppercase tracking-[0.16em] text-[#111111]/60"
            >
              03 / Capabilities
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="font-display text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl"
            >
              Technical Expertise
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="max-w-2xl font-serif text-lg leading-8 text-[#111111]/70"
            >
              A comprehensive toolkit for building modern, scalable applications
            </motion.p>
          </div>

          {/* Skills Grid */}
          <div className="grid grid-cols-1 border-t border-[#111111]/20 md:grid-cols-2 lg:grid-cols-3">
            {skillCategories.map((category, index) => (
              <motion.div
                key={category.title}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                className="group relative border-b border-[#111111]/20 py-6 md:border-r md:px-6 md:first:pl-0 lg:py-8 lg:last:border-r-0"
              >
                <div>
                  <p className="mb-4 font-mono text-xs uppercase tracking-[0.08em] text-[#111111]/55">
                    0{index + 1}
                  </p>
                  <h3 className="font-display text-xl font-semibold">{category.title}</h3>
                  <div className="mt-6 space-y-3">
                    {category.skills.map((skill) => (
                      <div key={skill._id} className="flex items-center gap-3 border-b border-[#111111]/15 py-2.5">
                        <span className="h-1.5 w-1.5 flex-shrink-0 bg-[#D9541E]" aria-hidden="true" />
                        <span className="font-mono text-xs text-[#111111]/85">{skill.name}</span>
                      </div>
                    ))}
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
