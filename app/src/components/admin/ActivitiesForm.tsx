import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { API_ENDPOINTS } from '../../config/api';
import { Plus, Edit3, Trash2, Eye, LogIn, TrendingUp, Filter, Download, Trash } from 'lucide-react';

interface Activity {
  _id: string;
  action: string;
  section: string;
  timestamp: string;
  type: 'create' | 'update' | 'delete' | 'view' | 'login';
  details?: Record<string, any>;
}

interface Stats {
  total: number;
  today: number;
  byType: {
    create: number;
    update: number;
    delete: number;
  };
}

export default function ActivitiesForm() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [stats, setStats] = useState<Stats>({ total: 0, today: 0, byType: { create: 0, update: 0, delete: 0 } });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'create' | 'update' | 'delete' | 'view' | 'login'>('all');
  const [sectionFilter, setSectionFilter] = useState('');
  const [sections, setSections] = useState<string[]>([]);
  const token = localStorage.getItem('adminToken');

  useEffect(() => {
    fetchActivities();
    fetchStats();
  }, []);

  const fetchActivities = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/activities`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setActivities(data);

        // Extract unique sections
        const uniqueSections: string[] = [...new Set<string>(data.map((a: Activity) => a.section))];
        setSections(uniqueSections);
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error);
      toast.error('Failed to load activities');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/activities-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const getFilteredActivities = () => {
    return activities.filter(a => {
      const typeMatch = filter === 'all' || a.type === filter;
      const sectionMatch = !sectionFilter || a.section === sectionFilter;
      return typeMatch && sectionMatch;
    });
  };

  const handleClearOld = async () => {
    if (!window.confirm('Clear activities older than 30 days? This cannot be undone.')) return;

    try {
      const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/activities/clear-old`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        toast.success(data.message);
        await fetchActivities();
        await fetchStats();
      }
    } catch (error) {
      console.error('Failed to clear old activities:', error);
      toast.error('Failed to clear activities');
    }
  };

  const handleExport = () => {
    const csv = [
      ['Action', 'Section', 'Type', 'Timestamp'],
      ...activities.map(a => [
        a.action,
        a.section,
        a.type,
        new Date(a.timestamp).toLocaleString()
      ])
    ]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `activities-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    toast.success('Activities exported to CSV');
  };

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
        return 'bg-green-500/20 text-green-400 border-green-400/20';
      case 'update':
        return 'bg-blue-500/20 text-blue-400 border-blue-400/20';
      case 'delete':
        return 'bg-red-500/20 text-red-400 border-red-400/20';
      case 'view':
        return 'bg-purple-500/20 text-purple-400 border-purple-400/20';
      case 'login':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-400/20';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-400/20';
    }
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const filteredActivities = getFilteredActivities();

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Activities', value: stats.total, color: 'bg-blue-500/10 text-blue-400', icon: TrendingUp },
          { label: 'Today', value: stats.today, color: 'bg-cyan-500/10 text-cyan-400', icon: Eye },
          { label: 'Created', value: stats.byType.create, color: 'bg-green-500/10 text-green-400', icon: Plus },
          { label: 'Updated', value: stats.byType.update, color: 'bg-yellow-500/10 text-yellow-400', icon: Edit3 },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`${stat.color} border border-white/10 rounded-xl p-4`}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-gray-400">{stat.label}</p>
                <Icon className="w-4 h-4 opacity-50" />
              </div>
              <p className="text-3xl font-bold">{stat.value}</p>
            </motion.div>
          );
        })}
      </div>

      {/* Filters and Controls */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <h3 className="text-sm font-medium text-gray-400">Filters</h3>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-3 py-2 bg-green-500/10 text-green-400 border border-green-400/30 rounded-lg hover:bg-green-500/20 transition-all text-sm"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
            <button
              onClick={handleClearOld}
              className="flex items-center gap-2 px-3 py-2 bg-red-500/10 text-red-400 border border-red-400/30 rounded-lg hover:bg-red-500/20 transition-all text-sm"
            >
              <Trash className="w-4 h-4" />
              Clear Old
            </button>
          </div>
        </div>

        {/* Filter Buttons */}
        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500 mb-2">Activity Type</p>
            <div className="flex flex-wrap gap-2">
              {(['all', 'create', 'update', 'delete', 'view', 'login'] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg transition-all text-sm ${
                    filter === f
                      ? 'bg-white/20 text-white border border-white/50'
                      : 'bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {sections.length > 0 && (
            <div>
              <p className="text-xs text-gray-500 mb-2">Section</p>
              <select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
                className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-400/50"
              >
                <option value="">All Sections</option>
                {sections.map((section) => (
                  <option key={section} value={section}>
                    {section}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      {/* Activities Table/List */}
      <div className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-12 bg-white/5 rounded animate-pulse" />
            ))}
          </div>
        ) : filteredActivities.length === 0 ? (
          <div className="text-center py-12">
            <Eye className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No activities found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10 bg-white/5">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Section</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Timestamp</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-400">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredActivities.map((activity, index) => {
                  const IconComponent = getActionIcon(activity.type);
                  return (
                    <motion.tr
                      key={activity._id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.02 }}
                      className="hover:bg-white/5 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${getActionColor(activity.type)} border`}>
                          <IconComponent className="w-4 h-4" />
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm text-white font-medium">{activity.action}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-block px-2.5 py-1 bg-white/10 text-gray-300 text-xs rounded-full">
                          {activity.section}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-xs text-gray-500">{formatDate(activity.timestamp)}</p>
                      </td>
                      <td className="px-4 py-3">
                        {activity.details && Object.keys(activity.details).length > 0 ? (
                          <details className="cursor-pointer">
                            <summary className="text-xs text-gray-500 hover:text-gray-400">
                              View ({Object.keys(activity.details).length})
                            </summary>
                            <div className="mt-2 p-2 bg-black/50 rounded text-xs text-gray-300 space-y-1">
                              {Object.entries(activity.details).map(([key, value]) => (
                                <p key={key}>
                                  <span className="text-gray-500">{key}:</span> {String(value)}
                                </p>
                              ))}
                            </div>
                          </details>
                        ) : (
                          <span className="text-xs text-gray-600">-</span>
                        )}
                      </td>
                    </motion.tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Summary */}
      {filteredActivities.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-sm text-gray-500"
        >
          Showing {filteredActivities.length} of {activities.length} activities
        </motion.div>
      )}
    </div>
  );
}
