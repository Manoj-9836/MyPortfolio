import { motion, useInView } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Trophy, Target, Zap, TrendingUp, Info, AlertCircle } from 'lucide-react';

interface LeetCodeData {
  username: string;
  realName: string;
  avatar: string;
  reputation: number;
  ranking: number;
  totalSolved: number;
  totalQuestions: number;
  totalSubmissions: number;
  streak: {
    streakCounter: number;
    longestStreak: number;
    currentDayStreakCount: number;
  };
  submissionStats: {
    acSubmissionNum: Array<{ difficulty: string; count: number; submissions: number }>;
    totalSubmissionNum: Array<{ difficulty: string; count: number; submissions: number }>;
  };
  activity: {
    submissionCalendar: { [timestamp: string]: number };
  };
}

const fetchLeetCodeData = async (username: string): Promise<LeetCodeData> => {
  // Mock data as fallback since this component is no longer used
  return {
    username,
    realName: 'Manoj Kumar',
    avatar: '',
    reputation: 0,
    ranking: 0,
    totalSolved: 0,
    totalQuestions: 0,
    totalSubmissions: 0,
    streak: { streakCounter: 0, longestStreak: 0, currentDayStreakCount: 0 },
    submissionStats: { acSubmissionNum: [], totalSubmissionNum: [] },
    activity: { submissionCalendar: {} }
  };
};

const convertCalendarToHeatmapData = (submissionCalendar: { [timestamp: string]: number }) => {
  const data: { date: string; count: number; level: number }[] = [];
  
  Object.entries(submissionCalendar).forEach(([timestamp, count]) => {
    const date = new Date(Number(timestamp) * 1000);
    const dateStr = date.toISOString().split('T')[0];
    
    let level = 0;
    if (count === 0) level = 0;
    else if (count <= 1) level = 1;
    else if (count <= 3) level = 2;
    else if (count <= 5) level = 3;
    else level = 4;
    
    data.push({ date: dateStr, count, level });
  });
  
  return data.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
};

const getLeetCodeUsername = () => 'Manoj9836';

const getLevelColor = (level: number) => {
  switch (level) {
    case 0: return 'bg-[#2d333b]';
    case 1: return 'bg-[#0e4429]';
    case 2: return 'bg-[#006d32]';
    case 3: return 'bg-[#26a641]';
    case 4: return 'bg-[#39d353]';
    default: return 'bg-[#2d333b]';
  }
};

export default function LeetCodeStats() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [leetcodeData, setLeetcodeData] = useState<LeetCodeData | null>(null);
  const [heatmapData, setHeatmapData] = useState<{ date: string; count: number; level: number }[]>([]);
  const [hoveredCell, setHoveredCell] = useState<{ date: string; count: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLeetCodeData = async () => {
      try {
        const data = await fetchLeetCodeData(getLeetCodeUsername());
        setLeetcodeData(data);
        const heatmap = convertCalendarToHeatmapData(data.activity.submissionCalendar);
        setHeatmapData(heatmap);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch LeetCode data:', err);
        setError('Failed to load LeetCode stats');
      }
    };

    loadLeetCodeData();
  }, []);

  if (error) {
    return (
      <section id="leetcode" className="py-20 md:py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/20">
            <AlertCircle className="w-5 h-5 text-red-400" />
            <span className="text-red-400">{error}</span>
          </div>
        </div>
      </section>
    );
  }

  const stats = leetcodeData
    ? [
        { label: 'Total Solved', value: leetcodeData.totalSolved, icon: Trophy, color: 'text-yellow-400' },
        {
          label: 'Easy',
          value: leetcodeData.submissionStats.acSubmissionNum.find((s: { difficulty: string; count: number }) => s.difficulty === 'Easy')?.count || 0,
          icon: Target,
          color: 'text-green-400',
        },
        {
          label: 'Medium',
          value: leetcodeData.submissionStats.acSubmissionNum.find((s: { difficulty: string; count: number }) => s.difficulty === 'Medium')?.count || 0,
          icon: Zap,
          color: 'text-yellow-400',
        },
        {
          label: 'Hard',
          value: leetcodeData.submissionStats.acSubmissionNum.find((s: { difficulty: string; count: number }) => s.difficulty === 'Hard')?.count || 0,
          icon: TrendingUp,
          color: 'text-red-400',
        },
      ]
    : [
        { label: 'Total Solved', value: '--', icon: Trophy, color: 'text-yellow-400' },
        { label: 'Easy', value: '--', icon: Target, color: 'text-green-400' },
        { label: 'Medium', value: '--', icon: Zap, color: 'text-yellow-400' },
        { label: 'Hard', value: '--', icon: TrendingUp, color: 'text-red-400' },
      ];

  // Group data by weeks for the grid
  const weeks: { date: string; count: number; level: number }[][] = [];
  for (let i = 0; i < heatmapData.length; i += 7) {
    weeks.push(heatmapData.slice(i, i + 7));
  }

  const getMonthLabelsAndSeparators = () => {
    const labels: { month: string; index: number }[] = [];
    const separators: number[] = [];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    let prevMonth = -1;
    
    weeks.forEach((week, index) => {
      if (week.length > 0) {
        const date = new Date(week[0].date);
        const currentMonth = date.getMonth();
        
        if (currentMonth !== prevMonth) {
          const monthName = months[currentMonth];
          labels.push({ month: monthName, index });
          if (prevMonth !== -1) {
            separators.push(index);
          }
          prevMonth = currentMonth;
        }
      }
    });
    
    return { labels, separators };
  };

  const { labels: monthLabels, separators: monthSeparators } = getMonthLabelsAndSeparators();

  return (
    <section id="leetcode" className="py-20 md:py-32 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          {/* Section Header */}
          <div className="mb-12">
            <motion.span
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-sm text-gray-500 uppercase tracking-wider"
            >
              Coding Profile
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-3xl sm:text-4xl md:text-5xl font-bold mt-4"
            >
              LeetCode Stats
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="text-lg text-gray-400 mt-4"
            >
              Tracking my competitive programming journey
            </motion.p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-12">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                className="p-4 md:p-6 rounded-2xl bg-white/5 border border-white/10 text-center hover:bg-white/10 transition-colors"
              >
                <stat.icon className={`w-5 h-5 md:w-6 md:h-6 mx-auto mb-2 md:mb-3 ${stat.color}`} />
                <div className="text-xl md:text-2xl lg:text-3xl font-bold mb-1">{stat.value}</div>
                <div className="text-xs md:text-sm text-gray-400">{stat.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Submission Heatmap */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay: 0.9 }}
            className="p-4 md:p-6 rounded-2xl bg-[#0d1117] border border-white/10"
          >
            {/* Heatmap Header */}
            <div className="flex flex-col gap-4 mb-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xl md:text-2xl font-bold">{leetcodeData?.totalSubmissions || '--'}</span>
                <span className="text-sm md:text-base text-gray-400">submissions in the past one year</span>
                <Info className="w-3.5 h-3.5 md:w-4 md:h-4 text-gray-500" />
              </div>
              <div className="flex flex-wrap items-center gap-3 md:gap-4 text-xs md:text-sm text-gray-400">
                <span>Total active days: <span className="text-white font-medium">{leetcodeData?.streak.longestStreak || '--'}</span></span>
                <span>Max streak: <span className="text-white font-medium">{leetcodeData?.streak.streakCounter || '--'}</span></span>
                <select className="bg-white/10 border border-white/20 rounded px-2 py-1 text-xs md:text-sm">
                  <option>Current</option>
                </select>
              </div>
            </div>

            {/* Heatmap Grid */}
            <div className="overflow-x-auto pb-4 -mx-4 md:mx-0 px-4 md:px-0">
              <div className="min-w-[680px] md:min-w-[800px]">
                {/* Month Labels */}
                <div className="flex mb-2">
                  <div className="w-8" /> {/* Spacer for alignment */}
                  <div className="flex-1 flex relative h-6">
                    {monthLabels.map((label) => (
                      <span
                        key={label.month}
                        className="absolute text-xs text-gray-500"
                        style={{ left: `${(label.index / weeks.length) * 100}%` }}
                      >
                        {label.month}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Grid with Month Separators */}
                <div className="flex gap-1">
                  {weeks.map((week, weekIndex) => (
                    <div key={weekIndex} className="flex flex-col gap-1 relative">
                      {monthSeparators.includes(weekIndex) && (
                        <div className="absolute -left-0.5 top-0 bottom-0 w-0.5 bg-white/20" />
                      )}
                      {week.map((day, dayIndex) => (
                        <motion.div
                          key={`${weekIndex}-${dayIndex}`}
                          initial={{ scale: 0 }}
                          animate={isInView ? { scale: 1 } : {}}
                          transition={{ 
                            duration: 0.3, 
                            delay: 1 + (weekIndex * 7 + dayIndex) * 0.002 
                          }}
                          className={`w-3 h-3 rounded-sm ${getLevelColor(day.level)} cursor-pointer hover:ring-2 hover:ring-white/50 transition-all`}
                          onMouseEnter={() => setHoveredCell({ date: day.date, count: day.count })}
                          onMouseLeave={() => setHoveredCell(null)}
                        />
                      ))}
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-end gap-2 mt-4 text-xs text-gray-500">
                  <span>Less</span>
                  {[0, 1, 2, 3, 4].map((level) => (
                    <div
                      key={level}
                      className={`w-3 h-3 rounded-sm ${getLevelColor(level)}`}
                    />
                  ))}
                  <span>More</span>
                </div>
              </div>
            </div>

            {/* Tooltip */}
            {hoveredCell && (
              <div className="fixed z-50 px-3 py-2 bg-gray-800 rounded-lg text-sm shadow-lg border border-white/10 pointer-events-none"
                style={{
                  left: '50%',
                  transform: 'translateX(-50%)',
                  bottom: '20%'
                }}
              >
                <div className="font-medium">{hoveredCell.count} submissions</div>
                <div className="text-gray-400 text-xs">{hoveredCell.date}</div>
              </div>
            )}
          </motion.div>

          {/* Profile Link */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="mt-6 text-center"
          >
            <a
              href={`https://leetcode.com/u/${getLeetCodeUsername()}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
            >
              <span>View Full Profile</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
