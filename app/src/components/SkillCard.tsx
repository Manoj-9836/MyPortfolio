import { motion } from 'framer-motion';

interface SkillCardProps {
  name: string;
  level: number;
  isVisible?: boolean;
  index?: number;
}

export default function SkillCard({ name, level, isVisible = true, index = 0 }: SkillCardProps) {
  // Convert skill name to image path (handle spacing and special characters)
  const imageName = name.replace(/[^a-zA-Z0-9]/g, '');
  const imagePath = `/Images/${imageName}.png`;
  
  // Circumference of circle (radius 50 for larger circles)
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (level / 100) * circumference;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isVisible ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: (index || 0) * 0.05 }}
      className="flex flex-col items-center justify-center gap-4"
    >
      {/* Circular Progress Container */}
      <div className="relative w-40 h-40 flex items-center justify-center">
        {/* SVG Circle */}
        <svg 
          className="absolute w-full h-full" 
          style={{ transform: 'rotate(-90deg)' }}
          viewBox="0 0 120 120"
        >
          {/* Background Circle - subtle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth="3"
            fill="none"
          />
          
          {/* Progress Circle - Cyan Blue */}
          <motion.circle
            cx="60"
            cy="60"
            r={radius}
            stroke="#00d9ff"
            strokeWidth="3"
            fill="none"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={isVisible ? { strokeDashoffset } : { strokeDashoffset: circumference }}
            transition={{ duration: 1.5, delay: (index || 0) * 0.08, ease: 'easeOut' }}
            strokeLinecap="round"
          />
        </svg>

        {/* Center Content */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isVisible ? { opacity: 1 } : {}}
          transition={{ duration: 0.6, delay: (index || 0) * 0.08 + 0.2 }}
          className="relative z-10 flex flex-col items-center justify-center gap-2"
        >
          {/* Skill Image - positioned at top */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.5, delay: (index || 0) * 0.08 + 0.3 }}
            className="w-10 h-10 flex items-center justify-center"
          >
            <img
              src={imagePath}
              alt={name}
              className="w-9 h-9 object-contain drop-shadow-lg"
              onError={(e) => {
                // Fallback if image not found
                e.currentTarget.style.display = 'none';
              }}
            />
          </motion.div>

          {/* Percentage Text - Large and prominent */}
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isVisible ? { opacity: 1, scale: 1 } : {}}
            transition={{ duration: 0.6, delay: (index || 0) * 0.08 + 0.4 }}
            className="text-3xl font-bold text-white tracking-tight"
          >
            {level}%
          </motion.span>
        </motion.div>
      </div>

      {/* Skill Name - Below circle */}
      <motion.h4
        initial={{ opacity: 0, y: 8 }}
        animate={isVisible ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: (index || 0) * 0.08 + 0.15 }}
        className="text-sm font-semibold text-center text-gray-200 max-w-32 line-clamp-2 leading-tight"
      >
        {name}
      </motion.h4>
    </motion.div>
  );
}
