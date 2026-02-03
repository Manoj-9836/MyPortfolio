import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';

interface Activity {
  id: string;
  action: string;
  section: string;
  timestamp: string;
  type: 'create' | 'update' | 'delete';
}

interface ActivityTimelineProps {
  activities: Activity[];
  loading?: boolean;
}

export default function ActivityTimeline({ activities, loading }: ActivityTimelineProps) {
  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <motion.div
                className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800"
                animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{ backgroundSize: '200% 100%' }}
              />
              <div className="flex-1 space-y-2">
                <motion.div
                  className="h-4 w-3/4 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded"
                  animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ backgroundSize: '200% 100%' }}
                />
                <motion.div
                  className="h-3 w-1/2 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded"
                  animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  style={{ backgroundSize: '200% 100%' }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const getActionColor = (type: Activity['type']) => {
    switch (type) {
      case 'create':
        return 'bg-green-500/20 text-green-400';
      case 'update':
        return 'bg-blue-500/20 text-blue-400';
      case 'delete':
        return 'bg-red-500/20 text-red-400';
    }
  };

  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-6">
      <div className="flex items-center gap-2 mb-6">
        <Clock className="w-5 h-5 text-gray-400" />
        <h3 className="text-lg font-semibold">Recent Activity</h3>
      </div>

      {activities.length === 0 ? (
        <div className="text-center py-8">
          <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
          <p className="text-gray-400">No recent activity</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex gap-4 pb-4 border-b border-white/5 last:border-0"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActionColor(activity.type)}`}>
                {activity.type === 'create' && '+'}
                {activity.type === 'update' && '✓'}
                {activity.type === 'delete' && '×'}
              </div>
              <div className="flex-1">
                <p className="text-sm text-white font-medium">{activity.action}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {activity.section} • {activity.timestamp}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
