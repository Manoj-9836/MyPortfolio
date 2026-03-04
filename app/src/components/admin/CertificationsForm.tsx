import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, X, Award } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';
import { toast } from 'react-toastify';

interface Certification {
  _id?: string;
  title: string;
  description: string;
  image?: string;
  issuer?: string;
  issueDate?: string;
  credentialUrl?: string;
  order?: number;
}

interface CertificationsFormProps {
  onSave: () => void;
}

export default function CertificationsForm({ onSave }: CertificationsFormProps) {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState<Certification>({
    title: '',
    description: '',
    image: '',
    issuer: '',
    issueDate: new Date().getFullYear().toString(),
    credentialUrl: '',
  });

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/certifications`);
      const data = await response.json();
      setCertifications(data);
    } catch {
      setError('Failed to load certifications');
      toast.error('Failed to load certifications.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      image: '',
      issuer: '',
      issueDate: new Date().getFullYear().toString(),
      credentialUrl: '',
    });
  };

  const handleOpenModal = (certification?: Certification) => {
    if (certification) {
      setEditingId(certification._id || null);
      setFormData({
        ...certification,
        image: certification.image || '',
        issuer: certification.issuer || '',
        issueDate: certification.issueDate || '',
        credentialUrl: certification.credentialUrl || '',
      });
    } else {
      setEditingId(null);
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    resetForm();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Session expired. Please login again.');
        toast.error('Session expired. Please login again.');
        return;
      }

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        image: (formData.image || '').trim(),
        issuer: (formData.issuer || '').trim(),
        issueDate: (formData.issueDate || '').trim(),
        credentialUrl: (formData.credentialUrl || '').trim(),
      };

      if (!payload.title || !payload.description) {
        setError('Title and description are required.');
        toast.error('Title and description are required.');
        return;
      }

      const url = editingId
        ? `${API_ENDPOINTS.PORTFOLIO}/certifications/${editingId}`
        : `${API_ENDPOINTS.PORTFOLIO}/certifications`;
      const method = editingId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccess(editingId ? 'Certification updated!' : 'Certification added!');
        toast.success(editingId ? 'Certification updated.' : 'Certification added.');
        await fetchCertifications();
        setTimeout(() => {
          setSuccess('');
          handleCloseModal();
          onSave();
        }, 1200);
      } else {
        const errorData = await response.json().catch(() => ({}));
        const serverMessage = errorData?.message || errorData?.error;

        if (response.status === 401) {
          localStorage.removeItem('adminToken');
          setError('Session expired. Please login again.');
          toast.error('Session expired. Please login again.');
        } else {
          const message = serverMessage || 'Failed to save certification';
          setError(message);
          toast.error(message);
        }
      }
    } catch {
      setError('Failed to save changes');
      toast.error('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this certification?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      if (!token) {
        setError('Session expired. Please login again.');
        toast.error('Session expired. Please login again.');
        return;
      }

      const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/certifications/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setSuccess('Certification deleted!');
        toast.success('Certification deleted.');
        await fetchCertifications();
        setTimeout(() => {
          setSuccess('');
          onSave();
        }, 1200);
      } else {
        const errorData = await response.json().catch(() => ({}));
        const serverMessage = errorData?.message || errorData?.error || 'Failed to delete certification';
        setError(serverMessage);
        toast.error(serverMessage);
      }
    } catch {
      setError('Failed to delete certification');
      toast.error('Failed to delete certification.');
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

      <button
        onClick={() => handleOpenModal()}
        className="w-full flex items-center justify-center gap-2 px-3 sm:px-4 py-2 sm:py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm sm:text-base"
      >
        <Plus className="w-4 sm:w-5 h-4 sm:h-5" />
        Add Certification
      </button>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {certifications.map((certification) => (
          <motion.div
            key={certification._id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="group bg-white/5 border border-white/10 rounded-lg p-4 sm:p-5 hover:border-white/30 transition-all"
          >
            <div className="flex items-start justify-between gap-3 mb-3">
              <div className="flex items-start gap-3 min-w-0">
                <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-blue-400" />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base sm:text-lg font-semibold text-white line-clamp-1 break-words">
                    {certification.title}
                  </h3>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                    {[certification.issuer, certification.issueDate].filter(Boolean).join(' • ')}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button
                  onClick={() => handleOpenModal(certification)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Edit"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => certification._id && handleDelete(certification._id)}
                  className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-400 line-clamp-2">{certification.description}</p>
          </motion.div>
        ))}

        {certifications.length === 0 && (
          <div className="col-span-1 md:col-span-2 text-center py-12 text-gray-500">
            <Award className="w-10 sm:w-12 h-10 sm:h-12 mx-auto mb-3 opacity-20" />
            <p>No certifications yet. Add your first one!</p>
          </div>
        )}
      </div>

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
                    {editingId ? 'Edit Certification' : 'Add Certification'}
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
                    <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/30 transition-all"
                      placeholder="e.g., AWS Cloud Practitioner"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Description *</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/30 transition-all resize-none"
                      placeholder="Short certification summary"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Issuer</label>
                      <input
                        type="text"
                        value={formData.issuer}
                        onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/30 transition-all"
                        placeholder="e.g., Coursera"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">Issue Date</label>
                      <input
                        type="text"
                        value={formData.issueDate}
                        onChange={(e) => setFormData({ ...formData, issueDate: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/30 transition-all"
                        placeholder="e.g., 2025"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Image URL</label>
                    <input
                      type="url"
                      value={formData.image}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/30 transition-all"
                      placeholder="https://... or /Images/aws-ml-badge.png"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Credential URL</label>
                    <input
                      type="url"
                      value={formData.credentialUrl}
                      onChange={(e) => setFormData({ ...formData, credentialUrl: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/30 transition-all"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="flex-1 bg-white text-black py-3 rounded-lg font-medium hover:bg-gray-200 transition-colors disabled:opacity-50"
                    >
                      {saving ? 'Saving...' : editingId ? 'Update Certification' : 'Create Certification'}
                    </button>
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-6 py-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                    >
                      Cancel
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
