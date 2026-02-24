import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, X, Save, Briefcase, ExternalLink, Github, Star } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';
import { toast } from 'sonner';

interface Project {
  _id?: string;
  title: string;
  subtitle: string;
  description: string;
  caseStudy?: {
    problem: string;
    approach: string;
    impact: string;
  };
  tech: string[];
  date: string;
  liveUrl?: string;
  githubUrl?: string;
  highlights: string[];
  featured?: boolean;
  bgImage?: string;
  order?: number;
}

interface ProjectsFormProps {
  onSave: () => void;
}

export default function ProjectsForm({ onSave }: ProjectsFormProps) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Project>({
    title: '',
    subtitle: '',
    description: '',
    caseStudy: {
      problem: '',
      approach: '',
      impact: '',
    },
    tech: [],
    date: '',
    liveUrl: '',
    githubUrl: '',
    highlights: [],
    featured: false,
    bgImage: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [techInput, setTechInput] = useState('');
  const [highlightInput, setHighlightInput] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/projects`);
      const data = await response.json();
      const normalizedProjects = (Array.isArray(data) ? data : []).map((project: Project & {
        caseStudy?: { problem?: string; approach?: string; impact?: string };
        casestudy?: { problem?: string; approach?: string; impact?: string };
        problem?: string;
        approach?: string;
        impact?: string;
      }) => ({
        ...project,
        caseStudy: {
          problem: project.caseStudy?.problem || project.casestudy?.problem || project.problem || '',
          approach: project.caseStudy?.approach || project.casestudy?.approach || project.approach || '',
          impact: project.caseStudy?.impact || project.casestudy?.impact || project.impact || '',
        },
      }));

      setProjects(normalizedProjects);
    } catch {
      setError('Failed to load projects');
      toast.error('Failed to load projects.');
    } finally {
      setLoading(false);
    }
  };

  const normalizeCaseStudy = (project?: Project) => ({
    problem: project?.caseStudy?.problem || '',
    approach: project?.caseStudy?.approach || '',
    impact: project?.caseStudy?.impact || '',
  });

  const handleOpenModal = (project?: Project) => {
    if (project) {
      setEditingId(project._id || null);
      setFormData({
        ...project,
        caseStudy: normalizeCaseStudy(project),
      });
      if (project._id) {
        fetch(`${API_ENDPOINTS.PORTFOLIO}/projects/${project._id}`)
          .then((response) => response.json())
          .then((data) => {
            if (!data || !data._id) return;
            setFormData({
              ...data,
              caseStudy: normalizeCaseStudy(data),
            });
          })
          .catch(() => {
            // Keep existing data if fetch fails
          });
      }
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        subtitle: '',
        description: '',
        caseStudy: {
          problem: '',
          approach: '',
          impact: '',
        },
        tech: [],
        date: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        liveUrl: '',
        githubUrl: '',
        highlights: [],
        featured: false,
        bgImage: '',
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setTechInput('');
    setHighlightInput('');
  };

  const handleAddTech = () => {
    if (techInput.trim()) {
      setFormData({ ...formData, tech: [...formData.tech, techInput.trim()] });
      setTechInput('');
    }
  };

  const handleRemoveTech = (index: number) => {
    setFormData({ ...formData, tech: formData.tech.filter((_, i) => i !== index) });
  };

  const handleAddHighlight = () => {
    if (highlightInput.trim()) {
      setFormData({ ...formData, highlights: [...formData.highlights, highlightInput.trim()] });
      setHighlightInput('');
    }
  };

  const handleRemoveHighlight = (index: number) => {
    setFormData({ ...formData, highlights: formData.highlights.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const token = localStorage.getItem('adminToken');
      const url = editingId
        ? `${API_ENDPOINTS.PORTFOLIO}/projects/${editingId}`
        : `${API_ENDPOINTS.PORTFOLIO}/projects`;
      const method = editingId ? 'PUT' : 'POST';
      const payload = {
        ...formData,
        caseStudy: normalizeCaseStudy(formData),
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setSuccess(editingId ? 'Project updated!' : 'Project added!');
        toast.success(editingId ? 'Project updated.' : 'Project added.');
        await fetchProjects();
        setTimeout(() => {
          setSuccess('');
          handleCloseModal();
          onSave();
        }, 1500);
      } else {
        setError('Failed to save project');
        toast.error('Failed to save project.');
      }
    } catch {
      setError('Failed to save changes');
      toast.error('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this project?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/projects/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setSuccess('Project deleted!');
        toast.success('Project deleted.');
        await fetchProjects();
        setTimeout(() => {
          setSuccess('');
          onSave();
        }, 1500);
      }
    } catch {
      setError('Failed to delete project');
      toast.error('Failed to delete project.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2].map((i) => (
          <motion.div
            key={i}
            className="h-40 bg-gradient-to-r from-gray-800 via-gray-700 to-gray-800 rounded-lg"
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
        Add Project
      </button>

      {/* Projects List */}
      <div className="space-y-4">
        {projects.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No projects added yet</p>
          </div>
        ) : (
          projects.map((project) => (
            <motion.div
              key={project._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-lg p-4 sm:p-5 hover:bg-white/8 transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 sm:gap-4">
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <h3 className="font-semibold text-base sm:text-lg">{project.title}</h3>
                    {project.featured && (
                      <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-400 mb-2">{project.subtitle}</p>
                  <p className="text-xs sm:text-sm text-gray-500 mb-3 line-clamp-2">{project.description}</p>
                  
                  {/* Tech Stack */}
                  <div className="flex flex-wrap gap-2 mb-3">
                    {project.tech.map((tech, i) => (
                      <span key={i} className="px-2 py-1 bg-white/10 text-xs rounded-md text-gray-300">
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Links & Date */}
                  <div className="flex items-center gap-2 sm:gap-3 text-xs text-gray-500 flex-wrap">
                    <span>{project.date}</span>
                    {project.liveUrl && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <a
                          href={project.liveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-white transition-colors"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Live
                        </a>
                      </>
                    )}
                    {project.githubUrl && (
                      <>
                        <span className="hidden sm:inline">•</span>
                        <a
                          href={project.githubUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 hover:text-white transition-colors"
                        >
                          <Github className="w-3 h-3" />
                          Code
                        </a>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 sm:opacity-0 group-hover:opacity-100 transition-opacity self-end sm:self-start flex-shrink-0">
                  <button
                    onClick={() => handleOpenModal(project)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => project._id && handleDelete(project._id)}
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
              className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-br from-black via-gray-950 to-black border border-white/10 rounded-2xl p-4 sm:p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-4 sm:mb-6">
                  <h3 className="text-lg sm:text-xl font-bold">
                    {editingId ? 'Edit Project' : 'Add Project'}
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
                        Project Title *
                      </label>
                      <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:outline-none focus:border-white/30 transition-all"
                        placeholder="e.g., ApexResume"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                        Subtitle *
                      </label>
                      <input
                        type="text"
                        value={formData.subtitle}
                        onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:outline-none focus:border-white/30 transition-all"
                        placeholder="e.g., AI Resume Analyzer"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                        Description *
                      </label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:outline-none focus:border-white/30 transition-all min-h-[100px] resize-y"
                        placeholder="Detailed project description..."
                        required
                      />
                    </div>

                    <div className="md:col-span-2 rounded-xl border border-white/10 bg-white/5 p-3 sm:p-4 space-y-3">
                      <h4 className="text-sm sm:text-base font-semibold text-white">Case Study Details</h4>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                          Problem
                        </label>
                        <textarea
                          value={formData.caseStudy?.problem || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            caseStudy: {
                              ...normalizeCaseStudy(formData),
                              problem: e.target.value,
                            },
                          })}
                          className="w-full bg-black/30 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:outline-none focus:border-white/30 transition-all min-h-[85px] resize-y"
                          placeholder="What challenge did this project solve?"
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                          Approach
                        </label>
                        <textarea
                          value={formData.caseStudy?.approach || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            caseStudy: {
                              ...normalizeCaseStudy(formData),
                              approach: e.target.value,
                            },
                          })}
                          className="w-full bg-black/30 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:outline-none focus:border-white/30 transition-all min-h-[85px] resize-y"
                          placeholder="How did you design and implement the solution?"
                        />
                      </div>

                      <div>
                        <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                          Impact
                        </label>
                        <textarea
                          value={formData.caseStudy?.impact || ''}
                          onChange={(e) => setFormData({
                            ...formData,
                            caseStudy: {
                              ...normalizeCaseStudy(formData),
                              impact: e.target.value,
                            },
                          })}
                          className="w-full bg-black/30 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:outline-none focus:border-white/30 transition-all min-h-[85px] resize-y"
                          placeholder="What measurable result or outcome did you achieve?"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                        Date
                      </label>
                      <input
                        type="text"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:outline-none focus:border-white/30 transition-all"
                        placeholder="e.g., Jun 2025"
                      />
                    </div>

                    <div>
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                        Background Image URL
                      </label>
                      <input
                        type="url"
                        value={formData.bgImage}
                        onChange={(e) => setFormData({ ...formData, bgImage: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:outline-none focus:border-white/30 transition-all"
                        placeholder="https://..."
                      />
                      {formData.bgImage && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-3 rounded-lg overflow-hidden border border-white/10 h-32"
                        >
                          <img
                            src={formData.bgImage}
                            alt="Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </motion.div>
                      )}
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                        Live URL
                      </label>
                      <input
                        type="url"
                        value={formData.liveUrl}
                        onChange={(e) => setFormData({ ...formData, liveUrl: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:outline-none focus:border-white/30 transition-all"
                        placeholder="https://..."
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                        GitHub URL
                      </label>
                      <input
                        type="url"
                        value={formData.githubUrl}
                        onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:outline-none focus:border-white/30 transition-all"
                        placeholder="https://github.com/..."
                      />
                    </div>

                    {/* Tech Stack */}
                    <div className="md:col-span-2">
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                        Tech Stack
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={techInput}
                          onChange={(e) => setTechInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTech())}
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:outline-none focus:border-white/30 transition-all"
                          placeholder="e.g., React.js"
                        />
                        <button
                          type="button"
                          onClick={handleAddTech}
                          className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {formData.tech.map((tech, i) => (
                          <span
                            key={i}
                            className="px-3 py-1.5 bg-white/10 rounded-md text-sm flex items-center gap-2 group/tag"
                          >
                            {tech}
                            <button
                              type="button"
                              onClick={() => handleRemoveTech(i)}
                              className="opacity-0 group-hover/tag:opacity-100 transition-opacity"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Highlights */}
                    <div className="md:col-span-2">
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
                        Key Highlights
                      </label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={highlightInput}
                          onChange={(e) => setHighlightInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddHighlight())}
                          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 sm:px-4 py-2 sm:py-2.5 text-sm sm:text-base text-white focus:outline-none focus:border-white/30 transition-all"
                          placeholder="e.g., 40% improved engagement"
                        />
                        <button
                          type="button"
                          onClick={handleAddHighlight}
                          className="px-3 sm:px-4 py-2 sm:py-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="space-y-2">
                        {formData.highlights.map((highlight, i) => (
                          <div
                            key={i}
                            className="px-3 py-2 bg-white/5 rounded-lg text-sm flex items-center justify-between group/highlight"
                          >
                            <span>{highlight}</span>
                            <button
                              type="button"
                              onClick={() => handleRemoveHighlight(i)}
                              className="opacity-0 group-hover/highlight:opacity-100 transition-opacity"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="flex items-center gap-3 cursor-pointer group">
                        <input
                          type="checkbox"
                          checked={formData.featured || false}
                          onChange={(e) => setFormData({ ...formData, featured: e.target.checked })}
                          className="w-5 h-5 bg-white/5 border border-white/10 rounded cursor-pointer accent-white"
                        />
                        <div>
                          <span className="text-sm font-medium text-gray-300 group-hover:text-white transition-colors">
                            Featured Project
                          </span>
                          <p className="text-xs text-gray-500">
                            Mark this project to be highlighted prominently
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
