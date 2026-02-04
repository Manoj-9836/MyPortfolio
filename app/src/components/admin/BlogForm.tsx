import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit, Trash2, X, Save, BookOpen, Eye, EyeOff } from 'lucide-react';
import { API_ENDPOINTS } from '../../config/api';

interface BlogPost {
  _id?: string;
  title: string;
  excerpt: string;
  content: string;
  image?: string;
  leetcodeImage?: string;
  date: string;
  category: string;
  tags: string[];
  readTime?: string;
  published?: boolean;
  order?: number;
}

interface BlogFormProps {
  onSave: () => void;
}

export default function BlogForm({ onSave }: BlogFormProps) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<BlogPost>({
    title: '',
    excerpt: '',
    content: '',
    image: '',
    leetcodeImage: '',
    date: new Date().toISOString().split('T')[0],
    category: 'Technology',
    tags: [],
    readTime: '',
    published: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [tagInput, setTagInput] = useState('');
  const [publishedFilter, setPublishedFilter] = useState<'all' | 'published' | 'draft'>('all');

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/blogs`);
      const data = await response.json();
      setPosts(data);
    } catch {
      setError('Failed to load blog posts');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (post?: BlogPost) => {
    if (post) {
      setEditingId(post._id || null);
      const loadedData = {
        ...post,
        leetcodeImage: post.leetcodeImage || '',
        image: post.image || '',
      };
      console.log('Loading post for editing:', loadedData);
      console.log('Is LeetCode post?', isLeetCodePost(loadedData));
      setFormData(loadedData);
    } else {
      setEditingId(null);
      setFormData({
        title: '',
        excerpt: '',
        content: '',
        image: '',
        leetcodeImage: '',
        date: new Date().toISOString().split('T')[0],
        category: 'Technology',
        tags: [],
        readTime: '',
        published: true,
      });
    }
    setIsModalOpen(true);
  };

  const isLeetCodePost = (post: BlogPost) => {
    const category = post.category?.toLowerCase() || '';
    const tags = post.tags?.map((tag) => tag.toLowerCase()) || [];
    return category.includes('leetcode') || tags.includes('leetcode');
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
    setTagInput('');
  };

  const handleAddTag = () => {
    if (tagInput.trim()) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (index: number) => {
    setFormData({ ...formData, tags: formData.tags.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    console.log('Submitting blog post:', formData);
    console.log('LeetCode Image being sent:', formData.leetcodeImage);

    try {
      const token = localStorage.getItem('adminToken');
      const url = editingId
        ? `${API_ENDPOINTS.PORTFOLIO}/blogs/${editingId}`
        : `${API_ENDPOINTS.PORTFOLIO}/blogs`;
      const method = editingId ? 'PUT' : 'POST';

      console.log('Request URL:', url);
      console.log('Request method:', method);

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);

      const responseData = await response.json();
      console.log('Response from server:', responseData);
      console.log('Returned leetcodeImage:', responseData.leetcodeImage);

      if (response.ok) {
        setSuccess(editingId ? 'Post updated!' : 'Post created!');
        await fetchPosts();
        setTimeout(() => {
          setSuccess('');
          handleCloseModal();
          onSave();
        }, 1500);
      } else {
        setError('Failed to save post');
      }
    } catch (err) {
      console.error('Error saving post:', err);
      setError('Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/blogs/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setSuccess('Post deleted!');
        await fetchPosts();
        setTimeout(() => {
          setSuccess('');
          onSave();
        }, 1500);
      }
    } catch {
      setError('Failed to delete post');
    }
  };

  const filteredPosts = posts.filter(post => {
    if (publishedFilter === 'published') return post.published;
    if (publishedFilter === 'draft') return !post.published;
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
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

      {/* Add Button & Filters */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPublishedFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              publishedFilter === 'all'
                ? 'bg-white text-black'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            All ({posts.length})
          </button>
          <button
            onClick={() => setPublishedFilter('published')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              publishedFilter === 'published'
                ? 'bg-white text-black'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Published ({posts.filter(p => p.published).length})
          </button>
          <button
            onClick={() => setPublishedFilter('draft')}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
              publishedFilter === 'draft'
                ? 'bg-white text-black'
                : 'bg-white/5 text-gray-400 hover:bg-white/10'
            }`}
          >
            Drafts ({posts.filter(p => !p.published).length})
          </button>
        </div>
        <button
          onClick={() => handleOpenModal()}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          <Plus className="w-4 h-4" />
          New Post
        </button>
      </div>

      {/* Posts List */}
      <div className="space-y-3">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <BookOpen className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>No posts in this category</p>
          </div>
        ) : (
          filteredPosts.map((post) => (
            <motion.div
              key={post._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/8 transition-all group"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-lg">{post.title}</h3>
                    <div className="flex items-center gap-1.5">
                      {!post.published && (
                        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full font-medium">
                          Draft
                        </span>
                      )}
                      <span className="px-2 py-0.5 bg-white/10 text-xs rounded-full text-gray-400">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-400 mb-2 line-clamp-2">{post.excerpt}</p>
                  
                  {/* Date & Read Time */}
                  <div className="flex items-center gap-3 text-xs text-gray-500 flex-wrap">
                    <span>{new Date(post.date).toLocaleDateString()}</span>
                    {post.readTime && (
                      <>
                        <span>•</span>
                        <span>{post.readTime}</span>
                      </>
                    )}
                    {post.tags.length > 0 && (
                      <>
                        <span>•</span>
                        <div className="flex gap-1">
                          {post.tags.slice(0, 2).map((tag, i) => (
                            <span key={i} className="text-gray-600">#{tag}</span>
                          ))}
                          {post.tags.length > 2 && <span className="text-gray-600">+{post.tags.length - 2}</span>}
                        </div>
                      </>
                    )}
                    {post.leetcodeImage && (
                      <>
                        <span>•</span>
                        <span className="text-green-400">📊 LeetCode Image</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleOpenModal(post)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                    title="Edit"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => post._id && handleDelete(post._id)}
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
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-br from-black via-gray-950 to-black border border-white/10 rounded-2xl p-6 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold">
                    {editingId ? 'Edit Post' : 'Create Post'}
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
                      Title *
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/30 transition-all"
                      placeholder="Post title"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Category *
                      </label>
                      <input
                        type="text"
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/30 transition-all"
                        placeholder="e.g., Technology"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Date
                      </label>
                      <input
                        type="date"
                        value={formData.date}
                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/30 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Excerpt *
                    </label>
                    <textarea
                      value={formData.excerpt}
                      onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/30 transition-all min-h-[80px] resize-y"
                      placeholder="Brief summary of the post"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.image || ''}
                      onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/30 transition-all"
                      placeholder="https://..."
                    />
                    {formData.image && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-3 rounded-lg overflow-hidden border border-white/10 h-32"
                      >
                        <img
                          src={formData.image}
                          alt="Preview"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </motion.div>
                    )}
                  </div>

                  {isLeetCodePost(formData) && (
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        LeetCode Image URL
                      </label>
                      <input
                        type="url"
                        value={formData.leetcodeImage || ''}
                        onChange={(e) => setFormData({ ...formData, leetcodeImage: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/30 transition-all"
                        placeholder="https://..."
                      />
                      {formData.leetcodeImage && (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="mt-3 rounded-lg overflow-hidden border border-white/10 h-32"
                        >
                          <img
                            src={formData.leetcodeImage}
                            alt="LeetCode Preview"
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </motion.div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Content *
                    </label>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/30 transition-all min-h-[200px] resize-y font-mono text-sm"
                      placeholder="Full post content..."
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Read Time (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.readTime}
                        onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/30 transition-all"
                        placeholder="e.g., 5 min read"
                      />
                    </div>

                    <div>
                      <label className="flex items-center gap-3 cursor-pointer group pt-6">
                        <input
                          type="checkbox"
                          checked={formData.published || false}
                          onChange={(e) => setFormData({ ...formData, published: e.target.checked })}
                          className="w-5 h-5 bg-white/5 border border-white/10 rounded cursor-pointer accent-white"
                        />
                        <div className="flex items-center gap-2">
                          {formData.published ? (
                            <>
                              <Eye className="w-4 h-4" />
                              <span className="text-sm font-medium text-gray-300">Published</span>
                            </>
                          ) : (
                            <>
                              <EyeOff className="w-4 h-4" />
                              <span className="text-sm font-medium text-gray-300">Draft</span>
                            </>
                          )}
                        </div>
                      </label>
                    </div>
                  </div>

                  {/* Tags */}
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Tags
                    </label>
                    <div className="flex gap-2 mb-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                        className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-white/30 transition-all"
                        placeholder="Add a tag and press Enter"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="px-4 py-2.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag, i) => (
                        <span
                          key={i}
                          className="px-3 py-1.5 bg-white/10 rounded-md text-sm flex items-center gap-2 group/tag"
                        >
                          #{tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(i)}
                            className="opacity-0 group-hover/tag:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                    <button
                      type="button"
                      onClick={handleCloseModal}
                      className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                      disabled={saving}
                    >
                      Cancel
                    </button>
                    <motion.button
                      type="submit"
                      disabled={saving}
                      whileHover={{ scale: saving ? 1 : 1.02 }}
                      whileTap={{ scale: saving ? 1 : 0.98 }}
                      className="flex items-center gap-2 px-6 py-2.5 bg-white text-black rounded-lg hover:bg-gray-200 transition-all disabled:opacity-50 font-medium"
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
                          {editingId ? 'Update' : 'Create'}
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
