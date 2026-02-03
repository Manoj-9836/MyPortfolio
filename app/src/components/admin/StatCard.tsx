import type { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  change?: {
    value: number;
    trend: 'up' | 'down';
  };
  loading?: boolean;
}

export default function StatCard({ title, value, icon: Icon, change, loading }: StatCardProps) {
  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="space-y-3">
          <motion.div
            className="h-4 w-24 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded"
            animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ backgroundSize: '200% 100%' }}
          />
          <motion.div
            className="h-8 w-32 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded"
            animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
            transition={{ duration: 2, repeat: Infinity, delay: 0.1 }}
            style={{ backgroundSize: '200% 100%' }}
          />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      className="bg-white/5 border border-white/10 rounded-xl p-6 hover:bg-white/8 hover:border-white/20 transition-all"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-400 font-medium uppercase tracking-wide">{title}</p>
          <h3 className="text-3xl font-bold mt-2 text-white">{value}</h3>
          {change && (
            <div className="flex items-center gap-1 mt-3">
              <span
                className={`text-sm font-medium ${
                  change.trend === 'up' ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {change.trend === 'up' ? '↑' : '↓'} {Math.abs(change.value)}%
              </span>
              <span className="text-xs text-gray-500">vs last month</span>
            </div>
          )}
        </div>
        <div className="p-3 bg-white/5 rounded-lg">
          <Icon className="w-6 h-6 text-gray-400" />
        </div>
      </div>
    </motion.div>
  );
}
