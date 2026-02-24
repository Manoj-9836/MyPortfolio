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
  logoPath?: string;
}

const defaultEducationData: EducationData[] = [
  {
    institution: 'Lendi Institute of Engineering & Technology',
    degree: 'B.Tech, Computer Science & Engineering',
    gpa: 'CGPA: 8.1',
    location: 'Vizianagaram',
    period: '2024 – Present',
    current: true,
    logoPath: '/Images/Lendi.png'
  },
  {
    institution: 'Andhra Polytechnic, Kakinada',
    degree: 'Diploma, Computer Management & Engineering',
    gpa: 'Percentage: 85%',
    location: 'Kakinada',
    period: '2021 – 2024',
    current: false,
    logoPath: '/Images/APT.png'
  }
];

export default function Education() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [educationData, setEducationData] = useState<EducationData[]>(defaultEducationData);

  // Map institution names to logo paths
  const getLogoPath = (institution: string, currentLogoPath?: string): string => {
    // If logoPath is already set from backend, use it
    if (currentLogoPath) return currentLogoPath;
    
    // Otherwise, try to match institution name to available logos
    const lowerInstitution = institution.toLowerCase();
    
    if (lowerInstitution.includes('lendi')) {
      return '/Images/Lendi.png';
    }
    if (lowerInstitution.includes('polytechnic') || lowerInstitution.includes('apt')) {
      return '/Images/APT.png';
    }
    
    // Return empty string if no match found
    return '';
  };

  useEffect(() => {
    const fetchEducation = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/education`);
        const data = await response.json();
        if (data && data.length > 0) {
          // Add logoPath to each education item if not already present
          const dataWithLogos = data.map((edu: EducationData) => ({
            ...edu,
            logoPath: getLogoPath(edu.institution, edu.logoPath)
          }));
          setEducationData(dataWithLogos);
        }
      } catch {
        // Use default data if fetch fails
      }
    };

    fetchEducation();
  }, []);

  return (
    <section className="py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black to-gray-900/10 overflow-x-clip">
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
              Education
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold mt-4"
            >
              Academic Background
            </motion.h2>
          </div>

          {/* Education Cards */}
          <div className="space-y-6">
            {educationData.map((edu, index) => (
              <motion.div
                key={edu.institution}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                animate={isInView ? { opacity: 1, x: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 + index * 0.2 }}
                className="relative group"
              >
                <div className="p-6 md:p-8 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300">
                  <div className="flex flex-col gap-6">
                    {/* Top Content */}
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {edu.logoPath ? (
                          <img 
                            src={edu.logoPath} 
                            alt={edu.institution}
                            className="w-12 h-12 object-contain p-1"
                            onError={(e) => {
                              // Fallback to icon if image fails to load
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <GraduationCap className="w-6 h-6 text-white" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg md:text-xl font-semibold mb-1">{edu.institution}</h3>
                        <p className="text-sm md:text-base text-gray-400">{edu.degree}</p>
                      </div>
                    </div>

                    {/* Bottom Content */}
                    <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span>{edu.period}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span>{edu.location}</span>
                      </div>
                      <span className={`px-2.5 md:px-3 py-1 rounded-full text-xs font-medium ${
                        edu.current 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-white/10 text-gray-300'
                      }`}>
                        {edu.gpa}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timeline connector */}
                {index < educationData.length - 1 && (
                  <div className="absolute left-8 bottom-0 w-px h-6 bg-white/10 translate-y-full" />
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
