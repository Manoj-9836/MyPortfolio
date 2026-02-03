import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, X, Save, Users, Award } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';

interface Leadership {
  _id?: string;
  title: string;
  organization: string;
  period: string;
  description?: string;
  achievements?: string[];
  order?: number;
}

interface LeadershipFormProps {
  onSave: () => void;
}

export default function LeadershipForm({ onSave }: LeadershipFormProps) {
  const [leaderships, setLeaderships] = useState<Leadership[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Leadership>({
    title: '',
    organization: '',
    period: '',
    description: '',
    achievements: [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [achievementInput, setAchievementInput] = useState('');

  useEffect(() => {
    fetchLeaderships();
  }, []);

  const fetchLeaderships = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/leadership`);
      const data = await response.json();
      setLeaderships(data);
    } catch {
      setError('Failed to load leadership data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (leadership?: Leadership) => {
    if (leadership) {
      setEditingId(leadership._id || null);
      setFormData(leadership);
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        organization: '',
        period: '',
        description: '',
        achievements: [],
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      title: '',
      organization: '',
      period: '',
      description: '',
      achievements: [],
    });
    setAchievementInput('');
  };

  const handleAddAchievement = () => {
    if (achievementInput.trim()) {
      setFormData({
        ...formData,
        achievements: [...(formData.achievements || []), achievementInput.trim()],
      });
      setAchievementInput('');
    }
  };

  const handleRemoveAchievement = (index: number) => {
    setFormData({
      ...formData,
      achievements: formData.achievements?.filter((_, i) => i !== index) || [],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('adminToken');
      const url = editingId
        ? `${API_ENDPOINTS.PORTFOLIO}/leadership/${editingId}`
        : `${API_ENDPOINTS.PORTFOLIO}/leadership`;
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
        setSuccess(editingId ? 'Leadership updated!' : 'Leadership added!');
        await fetchLeaderships();
        setTimeout(() => {
          setSuccess('');
          handleCloseModal();
          onSave();
        }, 1500);
      } else {
        setError('Failed to save leadership');
      }
    } catch {
      setError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this leadership position?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/leadership/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setSuccess('Leadership deleted!');
        await fetchLeaderships();
        setTimeout(() => {
          setSuccess('');
          onSave();
        }, 1500);
      }
    } catch {
      setError('Failed to delete leadership');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-32 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-lg"
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
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
      >
        <Plus className="w-5 h-5" />
        Add Leadership Position
      </button>

      {/* Leadership List */}
      <div className="space-y-3">
        {leaderships.map((leadership) => (
          <motion.div
            key={leadership._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group relative bg-white/5 border border-white/10 rounded-lg p-4 hover:border-white/30 transition-all"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Users className="w-5 h-5 text-blue-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-white mb-1">
                      {leadership.title}
                    </h3>
                    <p className="text-sm text-gray-400 mb-1">{leadership.organization}</p>
                    <p className="text-xs text-gray-500">{leadership.period}</p>
                    {leadership.description && (
                      <p className="text-sm text-gray-400 mt-2 line-clamp-2">
                        {leadership.description}
                      </p>
                    )}
                    {leadership.achievements && leadership.achievements.length > 0 && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
                        <Award className="w-3 h-3" />
                        <span>{leadership.achievements.length} achievement{leadership.achievements.length !== 1 ? 's' : ''}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleOpenModal(leadership)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => leadership._id && handleDelete(leadership._id)}
                  className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {leaderships.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p>No leadership positions yet. Add your first one!</p>
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
              <div className="bg-gradient-to-br from-black via-gray-950 to-black border border-white/10 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">
                    {editingId ? 'Edit Leadership Position' : 'Add Leadership Position'}
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Title/Role *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/30 transition-all"
                      placeholder="e.g., Technical Head"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Organization *
                    </label>
                    <input
                      type="text"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/30 transition-all"
                      placeholder="e.g., AI Club | Lendi Institute"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Period *
                    </label>
                    <input
                      type="text"
                      value={formData.period}
                      onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/30 transition-all"
                      placeholder="e.g., 2023 - Present"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/30 transition-all min-h-[100px] resize-y"
                      placeholder="Brief description of your role and responsibilities..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Achievements
                    </label>
                    <div className="flex gap-2 mb-3">
                      <input
                        type="text"
                        value={achievementInput}
                        onChange={(e) => setAchievementInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddAchievement())}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/30 transition-all"
                        placeholder="Add an achievement..."
                      />
                      <button
                        type="button"
                        onClick={handleAddAchievement}
                        className="px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <Plus className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {formData.achievements?.map((achievement, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2"
                        >
                          <Award className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          <span className="flex-1 text-sm text-gray-300">{achievement}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveAchievement(index)}
                            className="p-1 hover:bg-red-500/10 text-red-400 rounded transition-colors"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="flex-1 px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-lg transition-colors font-medium"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
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
