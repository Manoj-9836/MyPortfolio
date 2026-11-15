import { motion } from 'framer-motion';
import { Clock, Plus, Edit3, Trash2, Eye, LogIn, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { API_ENDPOINTS } from '../../config/api';

interface Activity {
  _id?: string;
  action: string;
  section: string;
  timestamp: string;
  type: 'create' | 'update' | 'delete' | 'view' | 'login';
  details?: Record<string, any>;
}

interface ActivityTimelineProps {
  activities?: Activity[];
  loading?: boolean;
}

export default function ActivityTimeline({ activities: initialActivities, loading: initialLoading }: ActivityTimelineProps) {
  const [activities, setActivities] = useState<Activity[]>(initialActivities || []);
  const [loading, setLoading] = useState(initialLoading ?? true);
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    if (!initialActivities) {
      fetchActivities();
    }
  }, [initialActivities, token]);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/activities`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setActivities(data.slice(0, 10)); // Show last 10 activities
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/5 border border-white/10 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Clock className="w-5 h-5 text-gray-400" />
          <h3 className="text-lg font-semibold">Recent Activity</h3>
        </div>
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
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

  const getActionIcon = (type: Activity['type']) => {
    switch (type) {
      case 'create':
        return Plus;
      case 'update':
        return Edit3;
      case 'delete':
        return Trash2;
      case 'view':
        return Eye;
      case 'login':
        return LogIn;
      default:
        return TrendingUp;
    }
  };

  const getActionColor = (type: Activity['type']) => {
    switch (type) {
      case 'create':
        return 'bg-green-500/20 text-green-400';
      case 'update':
        return 'bg-blue-500/20 text-blue-400';
      case 'delete':
        return 'bg-red-500/20 text-red-400';
      case 'view':
        return 'bg-purple-500/20 text-purple-400';
      case 'login':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
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
          {activities.map((activity, index) => {
            const IconComponent = getActionIcon(activity.type);
            return (
              <motion.div
                key={activity._id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex gap-4 pb-4 border-b border-white/5 last:border-0 last:pb-0 group hover:bg-white/5 -mx-2 px-2 py-2 rounded transition-colors"
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${getActionColor(activity.type)}`}>
                  <IconComponent className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white font-medium truncate">{activity.action}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="inline-block px-2 py-0.5 bg-white/10 text-gray-300 text-xs rounded">
                      {activity.section}
                    </span>
                    <p className="text-xs text-gray-500">
                      {formatRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                  {activity.details && Object.keys(activity.details).length > 0 && (
                    <p className="text-xs text-gray-600 mt-1 line-clamp-1">
                      {Object.entries(activity.details)
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(', ')}
                    </p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {activities.length > 0 && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          onClick={fetchActivities}
          className="w-full mt-4 px-3 py-2 text-xs text-gray-400 hover:text-white hover:bg-white/5 rounded transition-colors"
        >
          Refresh Activity
        </motion.button>
      )}
    </div>
  );
}

