import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, X, Save, Trophy } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';
import { toast } from 'sonner';

interface Achievement {
  _id?: string;
  title: string;
  description: string;
  category: string;
  date: string;
  order?: number;
}

interface AchievementsFormProps {
  onSave: () => void;
}

export default function AchievementsForm({ onSave }: AchievementsFormProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Achievement>({
    title: '',
    description: '',
    category: '',
    date: new Date().getFullYear().toString(),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const categories = [
    'Competitive Programming',
    'Technical Leadership',
    'Project Innovation',
    'Academic Excellence',
    'Community Building',
    'Awards & Recognition',
    'Other'
  ];

  useEffect(() => {
    fetchAchievements();
  }, []);

  const fetchAchievements = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/achievements`);
      const data = await response.json();
      setAchievements(data);
    } catch {
      setError('Failed to load achievements');
      toast.error('Failed to load achievements.');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (achievement?: Achievement) => {
    if (achievement) {
      setEditingId(achievement._id || null);
      setFormData(achievement);
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        description: '',
        category: '',
        date: new Date().getFullYear().toString(),
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      title: '',
      description: '',
      category: '',
      date: new Date().getFullYear().toString(),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('adminToken');
      const url = editingId
        ? `${API_ENDPOINTS.PORTFOLIO}/achievements/${editingId}`
        : `${API_ENDPOINTS.PORTFOLIO}/achievements`;
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSuccess(editingId ? 'Achievement updated!' : 'Achievement added!');
        toast.success(editingId ? 'Achievement updated.' : 'Achievement added.');
        await fetchAchievements();
        setTimeout(() => {
          setSuccess('');
          handleCloseModal();
          onSave();
        }, 1500);
      } else {
        setError('Failed to save achievement');
        toast.error('Failed to save achievement.');
      }
    } catch {
      setError('Failed to save changes');
      toast.error('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this achievement?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/achievements/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setSuccess('Achievement deleted!');
        toast.success('Achievement deleted.');
        await fetchAchievements();
        setTimeout(() => {
          setSuccess('');
          onSave();
        }, 1500);
      }
    } catch {
      setError('Failed to delete achievement');
      toast.error('Failed to delete achievement.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-24 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-lg"
            animate={{ backgroundPosition: ['200% 0', '-200% 0'] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{ backgroundSize: '200% 100%' }}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Success/Error Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-red-400 text-sm"
          >
            {error}
          </motion.div>
        )}
        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 text-green-400 text-sm"
          >
            {success}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Button */}
      <button
        onClick={() => handleOpenModal()}
        className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base font-medium bg-white text-black rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Plus className="w-4 sm:w-5 h-4 sm:h-5" />
        Add Achievement
      </button>

      {/* Achievements List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {achievements.map((achievement) => (
          <motion.div
            key={achievement._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative bg-white/5 border border-white/10 rounded-lg p-4 sm:p-5 hover:border-white/30 transition-all"
          >
            <div className="flex items-start justify-between gap-4 mb-3">
              <div className="flex items-start gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 bg-yellow-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-white line-clamp-1 break-words">
                    {achievement.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">{achievement.category}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button
                  onClick={() => handleOpenModal(achievement)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => achievement._id && handleDelete(achievement._id)}
                  className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-400 line-clamp-2">{achievement.description}</p>
            <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
              <span>{achievement.date}</span>
            </div>
          </motion.div>
        ))}

        {achievements.length === 0 && (
          <div className="col-span-1 md:col-span-2 text-center py-12 text-gray-500">
            <Trophy className="w-10 sm:w-12 h-10 sm:h-12 mx-auto mb-3 opacity-20" />
            <p>No achievements yet. Add your first one!</p>
          </div>
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-br from-black via-gray-950 to-black border border-white/10 rounded-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto overflow-x-hidden">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">
                    {editingId ? 'Edit Achievement' : 'Add Achievement'}
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:outline-none focus:border-white/30 transition-all"
                      placeholder="e.g., TCS CodeVita Achievement"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                      Category *
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:outline-none focus:border-white/30 transition-all"
                      required
                    >
                      <option value="" disabled className="bg-gray-900 text-gray-400">
                        Select a category
                      </option>
                      {categories.map((cat) => (
                        <option key={cat} value={cat} className="bg-gray-900 text-white">
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                      Date/Year *
                    </label>
                    <input
                      type="text"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:outline-none focus:border-white/30 transition-all"
                      placeholder="e.g., 2024, Present, Ongoing"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                      Description *
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:outline-none focus:border-white/30 transition-all min-h-[120px] resize-y"
                      placeholder="Detailed description of your achievement..."
                      required
                    />
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 pt-3 sm:pt-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors font-medium text-xs sm:text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium text-xs sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? (
                        <>
                          <motion.div
                            className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                          />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-5 h-5" />
                          {editingId ? 'Update' : 'Save'}
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
