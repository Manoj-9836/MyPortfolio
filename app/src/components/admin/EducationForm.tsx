import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, X, Save, GraduationCap } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';

interface Education {
  _id?: string;
  institution: string;
  degree: string;
  location: string;
  period: string;
  gpa: string;
  description?: string;
  achievements?: string[];
  current?: boolean;
  order?: number;
  logoPath?: string;
}

interface EducationFormProps {
  onSave: () => void;
}

export default function EducationForm({ onSave }: EducationFormProps) {
  const [educations, setEducations] = useState<Education[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Education>({
    institution: '',
    degree: '',
    location: '',
    period: '',
    gpa: '',
    description: '',
    current: false,
    logoPath: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchEducations();
  }, []);

  const fetchEducations = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/education`);
      const data = await response.json();
      setEducations(data);
    } catch {
      setError('Failed to load education data');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (education?: Education) => {
    if (education) {
      setEditingId(education._id || null);
      setFormData(education);
    } else {
      setEditingId(null);
      setFormData({
        institution: '',
        degree: '',
        location: '',
        period: '',
        gpa: '',
        description: '',
        current: false,
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      institution: '',
      degree: '',
      location: '',
      period: '',
      gpa: '',
      description: '',
      current: false,
      logoPath: '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('adminToken');
      const url = editingId
        ? `${API_ENDPOINTS.PORTFOLIO}/education/${editingId}`
        : `${API_ENDPOINTS.PORTFOLIO}/education`;
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
        setSuccess(editingId ? 'Education updated!' : 'Education added!');
        await fetchEducations();
        setTimeout(() => {
          setSuccess('');
          handleCloseModal();
          onSave();
        }, 1500);
      } else {
        setError('Failed to save education');
      }
    } catch {
      setError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this education?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/education/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setSuccess('Education deleted!');
        await fetchEducations();
        setTimeout(() => {
          setSuccess('');
          onSave();
        }, 1500);
      }
    } catch {
      setError('Failed to delete education');
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
        className="w-full sm:w-auto flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm sm:text-base"
      >
        <Plus className="w-4 sm:w-5 h-4 sm:h-5" />
        Add Education
      </button>

      {/* Education List */}
      <div className="space-y-3">
        {educations.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No education added yet</p>
          </div>
        ) : (
          educations.map((edu) => (
            <motion.div
              key={edu._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-5 hover:bg-white/8 transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="font-semibold text-base sm:text-lg">{edu.institution}</h3>
                    {edu.current && (
                      <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full font-medium flex-shrink-0">
                        Current
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-400 mb-2">{edu.degree}</p>
                  <div className="flex flex-wrap gap-2 sm:gap-3 text-xs text-gray-500">
                    <span>{edu.period}</span>
                    <span className="hidden sm:inline">•</span>
                    <span>{edu.location}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="text-green-400">{edu.gpa}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 opacity-0 sm:opacity-0 group-hover:opacity-100 transition-opacity self-end sm:self-start flex-shrink-0">
                  <button
                    onClick={() => handleOpenModal(edu)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => edu._id && handleDelete(edu._id)}
                    className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50"
            />

            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-br from-black via-gray-950 to-black border border-white/10 rounded-2xl p-4 sm:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-bold">
                    {editingId ? 'Edit Education' : 'Add Education'}
                  </h3>
                  <button
                    onClick={handleCloseModal}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors flex-shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                        Institution *
                      </label>
                      <input
                        type="text"
                        value={formData.institution}
                        onChange={(e) => setFormData({ ...formData, institution: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:outline-none focus:border-white/30 transition-all"
                        placeholder="e.g., Lendi Institute of Engineering & Technology"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                        Degree *
                      </label>
                      <input
                        type="text"
                        value={formData.degree}
                        onChange={(e) => setFormData({ ...formData, degree: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:outline-none focus:border-white/30 transition-all"
                        placeholder="e.g., B.Tech, Computer Science & Engineering"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                        Location *
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:outline-none focus:border-white/30 transition-all"
                        placeholder="e.g., Vizianagaram"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                        Period *
                      </label>
                      <input
                        type="text"
                        value={formData.period}
                        onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:outline-none focus:border-white/30 transition-all"
                        placeholder="e.g., 2024 – Present"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                        GPA/Percentage *
                      </label>
                      <input
                        type="text"
                        value={formData.gpa}
                        onChange={(e) => setFormData({ ...formData, gpa: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:outline-none focus:border-white/30 transition-all"
                        placeholder="e.g., CGPA: 8.1 or 85%"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                        Logo Path (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.logoPath}
                        onChange={(e) => setFormData({ ...formData, logoPath: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:outline-none focus:border-white/30 transition-all"
                        placeholder="e.g., /Images/Lendi.png or /Images/APT.png"
                      />
                      <p className="text-xs text-gray-500 mt-1">Available logos: Lendi.png, APT.png</p>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                        Description (Optional)
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:outline-none focus:border-white/30 transition-all min-h-[80px] resize-y"
                        placeholder="Additional information or achievements..."
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="flex items-start sm:items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={formData.current || false}
                          onChange={(e) => setFormData({ ...formData, current: e.target.checked })}
                          className="w-5 h-5 bg-white/5 border border-white/10 rounded cursor-pointer accent-white flex-shrink-0 mt-0.5 sm:mt-0"
                        />
                        <div>
                          <span className="text-xs sm:text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                            Currently Enrolled
                          </span>
                          <p className="text-xs text-gray-500">
                            Check this if you are currently studying here
                          </p>
                        </div>
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-3 sm:px-4 py-2 text-xs sm:text-sm text-gray-400 hover:text-white transition-colors"
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <motion.button
                      type="submit"
                      disabled={saving}
                      whileHover={{ scale: saving ? 1 : 1.02 }}
                      whileTap={{ scale: saving ? 1 : 0.98 }}
                      className="flex items-center justify-center gap-2 px-3 sm:px-6 py-2 sm:py-2.5 bg-white text-black rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 font-medium text-xs sm:text-base"
                    >
                      {saving ? (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                            className="w-4 h-4 border-2 border-gray-400 border-t-black rounded-full"
                          />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4" />
                          {editingId ? 'Update' : 'Add'}
                        </>
                      )}
                    </motion.button>
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
