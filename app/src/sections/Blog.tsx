import { motion, useInView, AnimatePresence } from 'framer-motion';
import { useRef, useState, useEffect } from 'react';
import { Calendar, X, Heart, Eye, MessageCircle, Share2, Twitter, Facebook, Linkedin, Copy, ChevronLeft, ChevronRight, Search, Link2, User, Mail, Pencil, SlidersHorizontal, ArrowDown } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';
import PostDisplay from '../components/PostDisplay';

interface Comment {
  _id: string;
  author: string;
  email?: string;
  content: string;
  createdAt: string;
  approved: boolean;
}

interface BlogPost {
  _id: string;
  title: string;
  date: string;
  category: string;
  excerpt: string;
  content: string;
  image?: string;
  images?: string[];
  leetcodeImage?: string;
  tags?: string[];
  readTime?: string;
  published?: boolean;
  featured?: boolean;
  views?: number;
  likes?: number;
  likedBy?: string[];
  comments?: Comment[];
}

export default function Blog() {
  const ref = useRef<HTMLDivElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<BlogPost[]>([]);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [relatedPosts, setRelatedPosts] = useState<BlogPost[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [readingProgress, setReadingProgress] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [commentForm, setCommentForm] = useState({ author: '', email: '', content: '' });
  const [commentSort, setCommentSort] = useState<'newest' | 'oldest'>('newest');
  const [visibleCommentCount, setVisibleCommentCount] = useState(5);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState('');
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [currentModalImageIndex, setCurrentModalImageIndex] = useState(0);
  const postsPerPage = 6;

  const getUserId = () => {
    let userId = localStorage.getItem('blogUserId');
    if (!userId) {
      userId = 'user_' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('blogUserId', userId);
    }
    return userId;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCompactNumber = (value: number) => {
    return new Intl.NumberFormat('en', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(value);
  };

  const isLeetCodePost = (post: BlogPost) => {
    const category = post.category?.toLowerCase() || '';
    const tags = post.tags?.map((tag) => tag.toLowerCase()) || [];
    return category.includes('leetcode') || tags.includes('leetcode');
  };

  const getPostImages = (post: BlogPost | null) => {
    if (!post) return [];

    const normalized = Array.from(
      new Set(
        [
          ...(post.images || []),
          post.image || '',
          post.leetcodeImage || '',
        ]
          .map((url) => url.trim())
          .filter(Boolean)
      )
    );

    return normalized;
  };

  const incrementView = async (postId: string) => {
    try {
      await fetch(`${API_ENDPOINTS.PORTFOLIO}/blogs/${postId}/view`, {
        method: 'POST',
      });
      // Update local state
      setPosts(prev => prev.map(p => 
        p._id === postId ? { ...p, views: (p.views || 0) + 1 } : p
      ));
    } catch (error) {
      console.error('Failed to increment view:', error);
    }
  };

  const fetchRelatedPosts = async (postId: string) => {
    try {
      const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/blogs/${postId}/related`);
      const data = await response.json();
      setRelatedPosts(data);
    } catch (error) {
      console.error('Failed to fetch related posts:', error);
    }
  };

  const checkIfLiked = (postId: string) => {
    const post = posts.find(p => p._id === postId);
    if (post?.likedBy) {
      const userId = getUserId();
      setHasLiked(post.likedBy.includes(userId));
    }
  };

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/blogs`);
        if (!response.ok) throw new Error(`Blog request failed: ${response.status}`);
        const data = await response.json();
        const publishedPosts = Array.isArray(data)
          ? data.filter((post: BlogPost) => post.published !== false)
          : [];

        // Sort: featured first, then by date (newest first)
        const sortedPosts = publishedPosts.sort((a: BlogPost, b: BlogPost) => {
          if (a.featured && !b.featured) return -1;
          if (!a.featured && b.featured) return 1;
          return new Date(b.date).getTime() - new Date(a.date).getTime();
        });

        setPosts(sortedPosts);
        setFilteredPosts(sortedPosts);

        // Check if there's a blog ID in the URL query parameter
        const urlParams = new URLSearchParams(window.location.search);
        const blogId = urlParams.get('blog');
        if (blogId) {
          const post = sortedPosts.find((p: BlogPost) => p._id === blogId);
          if (post) {
            setSelectedPost(post);

            // Scroll to blog section after a short delay to ensure the DOM is ready
            setTimeout(() => {
              const blogSection = document.getElementById('blog');
              if (blogSection) {
                blogSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }, 500);
          }
        }
      } catch {
        // Use empty state if fetch fails
      }
    };

    fetchPosts();
  }, []);

  // Search filter
  useEffect(() => {
    let filtered = posts;

    if (searchQuery) {
      filtered = filtered.filter(post =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    setFilteredPosts(filtered);
  }, [searchQuery, posts]);

  // Reset to page 1 only when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Reading progress tracker
  useEffect(() => {
    if (!selectedPost || !modalRef.current) return;

    const handleScroll = () => {
      if (!modalRef.current) return;
      const element = modalRef.current;
      const scrollTop = element.scrollTop;
      const scrollHeight = element.scrollHeight - element.clientHeight;
      const progress = (scrollTop / scrollHeight) * 100;
      setReadingProgress(Math.min(progress, 100));
    };

    const modal = modalRef.current;
    modal.addEventListener('scroll', handleScroll);
    return () => modal.removeEventListener('scroll', handleScroll);
  }, [selectedPost]);

  // Increment view count when post is opened
  useEffect(() => {
    if (selectedPost) {
      incrementView(selectedPost._id);
      fetchRelatedPosts(selectedPost._id);
      checkIfLiked(selectedPost._id);
      setCurrentModalImageIndex(0);
      setVisibleCommentCount(5);
      setCommentSort('newest');
      setCommentError('');
    } else {
      setReadingProgress(0);
      setRelatedPosts([]);
      setShowShareMenu(false);
      setCurrentModalImageIndex(0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPost]);

  useEffect(() => {
    if (!selectedPost) return;

    const modalImages = getPostImages(selectedPost);
    if (modalImages.length <= 1) return;

    const timer = window.setInterval(() => {
      setCurrentModalImageIndex((prev) => (prev + 1) % modalImages.length);
    }, 3500);

    return () => window.clearInterval(timer);
  }, [selectedPost]);

  useEffect(() => {
    if (!selectedPost) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedPost(null);
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedPost]);

  useEffect(() => {
    if (!selectedPost) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [selectedPost]);

  const handleLike = async (postId: string) => {
    try {
      const userId = getUserId();
      const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/blogs/${postId}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      });
      const data = await response.json();
      
      // Update local state with likes count and likedBy array
      setPosts(prev => prev.map(p => {
        if (p._id === postId) {
          const updatedLikedBy = data.hasLiked 
            ? [...(p.likedBy || []), userId]
            : (p.likedBy || []).filter(id => id !== userId);
          return { ...p, likes: data.likes, likedBy: updatedLikedBy };
        }
        return p;
      }));
      
      if (selectedPost && selectedPost._id === postId) {
        const updatedLikedBy = data.hasLiked 
          ? [...(selectedPost.likedBy || []), userId]
          : (selectedPost.likedBy || []).filter(id => id !== userId);
        setSelectedPost({ ...selectedPost, likes: data.likes, likedBy: updatedLikedBy });
      }
      
      setHasLiked(data.hasLiked);
    } catch (error) {
      console.error('Failed to like post:', error);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPost || !commentForm.author || !commentForm.content) return;

    setIsSubmittingComment(true);
    setCommentError('');
    try {
      const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/blogs/${selectedPost._id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(commentForm),
      });
      if (!response.ok) throw new Error(`Comment request failed: ${response.status}`);
      const newComment = await response.json();
      
      const updatedComments = [...(selectedPost.comments || []), newComment];
      
      // Update local state for posts array
      setPosts(prev => prev.map(p => 
        p._id === selectedPost._id 
          ? { ...p, comments: updatedComments }
          : p
      ));
      
      // Update selected post
      setSelectedPost({
        ...selectedPost,
        comments: updatedComments
      });
      
      setCommentForm({ author: '', email: '', content: '' });
    } catch (error) {
      console.error('Failed to add comment:', error);
      setCommentError('Unable to post your comment. Please try again.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const sharePost = (platform: string) => {
    if (!selectedPost) return;

    // Create a URL that includes the blog post ID for direct navigation
    const baseUrl = window.location.origin;
    const postUrl = `${baseUrl}?blog=${selectedPost._id}`;
    const title = selectedPost.title;

    const shareUrls: { [key: string]: string } = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(postUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(postUrl)}`,
    };

    if (platform === 'copy') {
      navigator.clipboard.writeText(postUrl);
      alert('Post link copied to clipboard!');
    } else if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  // Pagination
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const paginate = (pageNumber: number) => {
    setCurrentPage(pageNumber);
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section id="blog" className="bg-[#F3EEE3] px-5 py-16 text-[#111111] sm:px-8 md:py-24 lg:px-12 overflow-x-clip">
      <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
        >
          {/* Section Header */}
          <div className="mb-14 grid gap-8 border-t border-[#111111]/25 pt-5 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
            <motion.span
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : {}}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="font-mono text-xs uppercase tracking-[0.16em] text-[#111111]/55"
            >
              05 / Writing
            </motion.span>
            <div>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="mt-0 font-display text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl"
              >
                My Blog
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="mt-5 max-w-xl font-serif text-base leading-7 text-[#111111]/65"
              >
                Sharing insights, experiences, and thoughts on web development and technology
              </motion.p>
            </div>

            {/* Search Box */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mt-2 w-full lg:col-span-2"
            >
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search posts by title, content, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full border border-[#111111]/25 bg-transparent py-3 pl-12 pr-4 text-sm text-[#111111] placeholder-[#111111]/45 outline-none focus:border-[#D9541E]"
                />
                {searchQuery && (
                  <div className="absolute right-4 top-1/2 hidden -translate-y-1/2 text-xs text-[#111111]/50 sm:block">
                    {filteredPosts.length} result{filteredPosts.length !== 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </motion.div>
          </div>

          {/* Blog Cards Grid */}
          <div className="grid grid-cols-1 border-t border-[#111111]/20 sm:grid-cols-2 lg:grid-cols-3">
            {currentPosts.map((post, index) => (
              <motion.div
                key={post._id || index}
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                onClick={() => setSelectedPost(post)}
                className="group h-auto cursor-pointer border-b border-[#111111]/20 py-6 sm:mx-4 sm:first:ml-0 lg:mx-5 lg:first:ml-0"
              >
                <div className="relative flex h-full flex-col justify-between overflow-hidden border border-[#111111]/15 bg-[#F3EEE3] p-4 transition-colors duration-300 hover:border-[#D9541E] sm:p-6">
                  {/* Background animation */}
                  <div className="absolute inset-0 border-t-2 border-[#D9541E] opacity-0 transition-opacity group-hover:opacity-100" />

                  {/* Image Section */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={isInView ? { opacity: 1, scale: 1 } : {}}
                    transition={{ delay: 0.5 + index * 0.1 + 0.2 }}
                    className="relative z-10 mb-5 h-32 overflow-hidden border border-[#111111]/15 group/image"
                  >
                    {post.image || post.images?.[0] || post.leetcodeImage ? (
                      <img
                        src={post.image || post.images?.[0] || post.leetcodeImage}
                        alt={`${post.title} article preview`}
                        className="h-full w-full object-cover transition-transform duration-500 group-hover/image:scale-110"
                        loading="lazy"
                        decoding="async"
                      />
                    ) : (
                      <div className="flex h-full items-end bg-[#111111]/5 p-3 font-mono text-[10px] uppercase tracking-[0.08em] text-[#111111]/45">
                        Article / {post.category || 'Writing'}
                      </div>
                    )}
                    <div className="absolute inset-0 bg-[#111111]/10" />
                  </motion.div>

                  {/* Content */}
                  <div className="relative z-10 flex flex-col h-full justify-between flex-1">
                    {/* Top Section */}
                    <div>
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 mb-3">
                        <div className="flex flex-wrap items-center gap-2 pr-1">
                          <span className="border border-[#D9541E]/60 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[#D9541E] sm:px-3 sm:text-xs">
                            {post.category}
                          </span>
                          {post.featured && (
                            <span className="border border-[#111111]/20 px-2 py-1 font-mono text-[10px] uppercase tracking-[0.08em] text-[#111111]/60 sm:text-xs">
                              ★ Featured
                            </span>
                          )}
                        </div>
                        {/* Stats */}
                        <div className="flex shrink-0 items-center gap-2 whitespace-nowrap text-xs text-[#111111]/50 self-start sm:self-auto">
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            <span>{formatCompactNumber(post.views || 0)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Heart className="w-3 h-3" />
                            <span>{formatCompactNumber(post.likes || 0)}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="w-3 h-3" />
                            <span>{post.comments?.length || 0}</span>
                          </div>
                        </div>
                      </div>
                      <motion.h3
                        initial={{ opacity: 0, y: 10 }}
                        animate={isInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.5 + index * 0.1 + 0.3 }}
                        className="font-display text-lg font-semibold leading-tight text-[#111111] transition-colors group-hover:text-[#D9541E] md:text-xl"
                      >
                        {post.title}
                      </motion.h3>
                    </div>

                    {/* Bottom Section */}
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={isInView ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: 0.5 + index * 0.1 + 0.4 }}
                      className="flex flex-col gap-2"
                    >
                      <p className="font-serif text-xs leading-6 text-[#111111]/65 md:text-sm">
                        {post.excerpt}
                      </p>
                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#111111]/15 pt-3">
                        <div className="flex items-center gap-2 font-mono text-xs text-[#111111]/50">
                          <Calendar className="w-3 h-3" />
                          {formatDate(post.date)}
                        </div>
                        <div className="ml-auto px-3 py-1">
                          <span className="text-xs font-medium text-[#D9541E]">Read story →</span>
                        </div>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          {currentPosts.length === 0 && (
            <p className="border-t border-[#111111]/20 py-10 font-mono text-xs uppercase tracking-[0.08em] text-[#111111]/55">
              No published stories match this search.
            </p>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.8 }}
              className="mt-10 flex items-center justify-center gap-2"
            >
              <button
                type="button"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                aria-label="Previous blog page"
                className="border border-[#111111]/25 p-2 text-[#111111] hover:border-[#D9541E] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  type="button"
                  key={page}
                  onClick={() => paginate(page)}
                  aria-current={currentPage === page ? 'page' : undefined}
                  className={`min-w-9 border px-3 py-2 font-mono text-xs ${
                    currentPage === page
                      ? 'border-[#D9541E] text-[#D9541E]'
                      : 'border-[#111111]/25 text-[#111111]/60 hover:border-[#D9541E]'
                  }`}
                >
                  {page}
                </button>
              ))}

              <button
                type="button"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                aria-label="Next blog page"
                className="border border-[#111111]/25 p-2 text-[#111111] hover:border-[#D9541E] disabled:cursor-not-allowed disabled:opacity-35"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}
          {totalPages > 1 && (
            <p className="mt-3 text-center font-mono text-[10px] uppercase tracking-[0.12em] text-[#111111]/45">
              Page {currentPage} of {totalPages}
            </p>
          )}
        </motion.div>
      </div>

      {/* Expanded Post Modal */}
      <AnimatePresence>
        {selectedPost && (
          (() => {
            const modalImages = getPostImages(selectedPost);
            const hasMultipleImages = modalImages.length > 1;
            const activeImage = modalImages[currentModalImageIndex] || selectedPost.image || selectedPost.leetcodeImage;

            return (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedPost(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-[#111111]/90 p-2 sm:p-4"
          >
            {/* Reading Progress Bar */}
            <div className="fixed top-0 left-0 right-0 h-1 bg-white/10 z-[60]">
              <motion.div
                className="h-full bg-[#D9541E]"
                style={{ width: `${readingProgress}%` }}
                initial={{ width: 0 }}
                animate={{ width: `${readingProgress}%` }}
                transition={{ duration: 0.1 }}
              />
            </div>

            <motion.div
              ref={modalRef}
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="post-modal-scroll relative min-w-0 w-full max-w-[800px] overflow-x-hidden rounded-lg border border-[#D9541E]/80 border-t-4 border-t-[#D9541E] bg-[#111111] text-[#F3EEE3] shadow-2xl shadow-black/40 h-[90dvh] max-h-[90vh] overflow-y-auto p-4 sm:p-7 md:p-8"
            >
              {/* Close Button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedPost(null)}
                aria-label="Close article"
                className="absolute right-3 top-3 z-10 border border-[#F3EEE3]/25 p-2 text-[#F3EEE3]/70 transition-colors hover:border-[#D9541E] hover:text-[#D9541E] md:right-6 md:top-6"
              >
                <X className="w-6 h-6" />
              </motion.button>

              {/* Featured Image */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="mx-auto mb-6 mt-12 w-full overflow-hidden rounded-lg border border-[#F3EEE3]/20"
              >
                <div className="relative aspect-[16/9] overflow-hidden bg-[#F3EEE3]/5">
                  <AnimatePresence mode="wait">
                    <motion.img
                      key={`${selectedPost._id}-${currentModalImageIndex}`}
                      src={activeImage}
                      alt={`${selectedPost.title} image ${currentModalImageIndex + 1}`}
                      initial={{ opacity: 0, x: 24 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -24 }}
                      transition={{ duration: 0.55, ease: 'easeInOut' }}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </AnimatePresence>
                  <div className="absolute inset-0 bg-[#111111]/15 pointer-events-none" />

                  {hasMultipleImages && (
                    <>
                      <button
                        onClick={() =>
                          setCurrentModalImageIndex((prev) => (prev - 1 + modalImages.length) % modalImages.length)
                        }
                        className="absolute left-3 top-1/2 -translate-y-1/2 border border-[#F3EEE3]/35 bg-[#111111]/75 p-2 text-[#F3EEE3] transition-colors hover:border-[#D9541E] hover:text-[#D9541E]"
                        aria-label="Previous image"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() =>
                          setCurrentModalImageIndex((prev) => (prev + 1) % modalImages.length)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 border border-[#F3EEE3]/35 bg-[#111111]/75 p-2 text-[#F3EEE3] transition-colors hover:border-[#D9541E] hover:text-[#D9541E]"
                        aria-label="Next image"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>

                {hasMultipleImages && (
                  <div className="mt-3 flex items-center justify-center gap-2">
                    {modalImages.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentModalImageIndex(index)}
                        className={`h-2 rounded-full transition-all ${
                          index === currentModalImageIndex ? 'w-6 bg-[#D9541E]' : 'w-2 bg-[#F3EEE3]/40 hover:bg-[#F3EEE3]/70'
                        }`}
                        aria-label={`Go to image ${index + 1}`}
                      />
                    ))}
                  </div>
                )}
              </motion.div>

              {/* Header */}
              <div className="mx-auto mb-5 w-full">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <span className="border border-[#D9541E]/70 px-3 py-1 font-mono text-xs uppercase tracking-[0.08em] text-[#D9541E]">
                    {selectedPost.category}
                  </span>
                  <div className="flex flex-wrap items-center gap-3 font-mono text-xs uppercase tracking-[0.05em] text-[#F3EEE3]/50 sm:gap-4 sm:text-sm">
                    <div className="flex items-center gap-1">
                      <Eye className="w-4 h-4" />
                      <span>{formatCompactNumber(selectedPost.views || 0)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Heart className="w-4 h-4" />
                      <span>{formatCompactNumber(selectedPost.likes || 0)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {formatDate(selectedPost.date)}
                    </div>
                  </div>
                </div>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-3 pr-10 font-display text-[28px] font-semibold leading-[1.15] tracking-[-0.03em] sm:text-[30px]"
                >
                  {selectedPost.title}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="max-w-3xl font-sans text-[15px] leading-7 text-[#F3EEE3]/70 sm:text-base"
                >
                  {selectedPost.excerpt}
                </motion.p>
                {isLeetCodePost(selectedPost) && selectedPost.leetcodeImage && (
                  <div className="mt-5 w-full">
                    <div className="w-[100px] rounded-2xl overflow-hidden border border-white/10 bg-gray-900/50">
                      <img
                        src={selectedPost.leetcodeImage}
                        alt={`${selectedPost.title} - LeetCode`}
                        className="w-full h-auto object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
                className="mx-auto mb-7 flex w-full flex-wrap items-center gap-3 border-y border-[#F3EEE3]/15 py-4"
              >
                <button
                  onClick={() => handleLike(selectedPost._id)}
                  className={`flex min-h-11 items-center gap-2 rounded-md border px-4 py-2 text-sm transition-all ${
                    hasLiked
                      ? 'border-[#D9541E] bg-[#D9541E] text-[#111111]'
                      : 'border-[#F3EEE3]/25 text-[#F3EEE3]/70 hover:border-[#D9541E] hover:text-[#D9541E]'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${hasLiked ? 'fill-current' : ''}`} />
                  <span>{hasLiked ? 'Liked' : 'Like'}</span>
                </button>

                <div className="relative">
                  <button
                    onClick={() => setShowShareMenu(!showShareMenu)}
                    className="flex min-h-11 items-center gap-2 rounded-md border border-[#F3EEE3]/25 px-4 py-2 text-sm text-[#F3EEE3]/70 transition-all hover:border-[#D9541E] hover:text-[#D9541E]"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Share</span>
                  </button>

                  {showShareMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="absolute right-0 top-full z-20 mt-2 min-w-[150px] border border-[#F3EEE3]/25 bg-[#111111] p-2 shadow-xl sm:left-0 sm:right-auto"
                    >
                      <button
                        onClick={() => sharePost('twitter')}
                        className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm hover:bg-[#F3EEE3]/10"
                      >
                        <Twitter className="w-4 h-4" />
                        <span>Twitter</span>
                      </button>
                      <button
                        onClick={() => sharePost('facebook')}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded w-full text-left"
                      >
                        <Facebook className="w-4 h-4" />
                        <span>Facebook</span>
                      </button>
                      <button
                        onClick={() => sharePost('linkedin')}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded w-full text-left"
                      >
                        <Linkedin className="w-4 h-4" />
                        <span>LinkedIn</span>
                      </button>
                      <button
                        onClick={() => sharePost('copy')}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-white/10 rounded w-full text-left"
                      >
                        <Copy className="w-4 h-4" />
                        <span>Copy Link</span>
                      </button>
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Content */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="max-w-none"
              >
                <PostDisplay key={selectedPost._id} content={selectedPost.content} />
              </motion.div>

              {/* Tags */}
              {selectedPost.tags && selectedPost.tags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="mx-auto mt-8 w-full max-w-[800px] border-t border-white/10 pt-6"
                >
                  <div className="flex flex-wrap gap-2">
                    {selectedPost.tags.map((tag, index) => (
                      <motion.span
                        key={index}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.05 }}
                        className="px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-medium text-gray-300 transition-colors"
                      >
                        #{tag}
                      </motion.span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Related Posts */}
              {relatedPosts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="mt-8 border-b border-[#F3EEE3]/20 pb-5 pt-6"
                >
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <h3 className="flex items-center gap-2 text-base font-semibold">
                      <Link2 className="h-4 w-4 text-[#D9541E]" />
                      Related Posts
                    </h3>
                  </div>
                  <div className="flex gap-3 overflow-x-auto pb-1 md:grid md:grid-cols-3 md:overflow-visible">
                    {relatedPosts.slice(0, 3).map((post) => (
                      <div
                        key={post._id}
                        onClick={() => {
                          setSelectedPost(post);
                          modalRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                        className="group min-w-[220px] cursor-pointer border border-[#F3EEE3]/15 bg-[#F3EEE3]/[0.03] p-2 transition-colors hover:border-[#D9541E] md:min-w-0"
                      >
                        <img
                          src={post.image || post.images?.[0] || post.leetcodeImage}
                          alt={post.title}
                          className="mb-2 aspect-[16/8] w-full object-cover"
                        />
                        <h4 className="line-clamp-2 text-xs font-semibold transition-colors group-hover:text-[#D9541E]">
                          {post.title}
                        </h4>
                        <p className="mt-1 text-[10px] text-[#F3EEE3]/50">{formatDate(post.date)}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Comments Section */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="mt-6 border-t border-[#F3EEE3]/20 pt-5"
              >
                <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="flex items-center gap-2 text-base font-semibold">
                    <MessageCircle className="h-4 w-4 text-[#D9541E]" />
                    Comments <span className="text-[#D9541E]">{selectedPost.comments?.length || 0}</span>
                  </h3>
                  <label className="flex items-center gap-2 border border-[#F3EEE3]/20 px-3 py-1.5 text-xs text-[#F3EEE3]/70">
                    <SlidersHorizontal className="h-3.5 w-3.5" />
                    <span className="sr-only">Sort comments</span>
                    <select
                      value={commentSort}
                      onChange={(e) => setCommentSort(e.target.value as 'newest' | 'oldest')}
                      className="bg-transparent text-xs text-[#F3EEE3] outline-none"
                    >
                      <option value="newest" className="bg-[#111111]">Newest First</option>
                      <option value="oldest" className="bg-[#111111]">Oldest First</option>
                    </select>
                  </label>
                </div>

                {/* Comment Form */}
                <form onSubmit={handleComment} className="mb-6 space-y-3 border border-[#F3EEE3]/15 bg-[#F3EEE3]/[0.02] p-3">
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    <label className="flex items-center gap-2 border border-[#F3EEE3]/20 px-3">
                      <User className="h-4 w-4 shrink-0 text-[#F3EEE3]/55" />
                      <input
                        type="text"
                        placeholder="Your Name *"
                        value={commentForm.author}
                        onChange={(e) => setCommentForm({ ...commentForm, author: e.target.value })}
                        required
                        className="h-10 min-w-0 flex-1 bg-transparent text-sm text-[#F3EEE3] outline-none placeholder-[#F3EEE3]/45"
                      />
                    </label>
                    <label className="flex items-center gap-2 border border-[#F3EEE3]/20 px-3">
                      <Mail className="h-4 w-4 shrink-0 text-[#F3EEE3]/55" />
                      <input
                        type="email"
                        placeholder="Your Email (optional)"
                        value={commentForm.email}
                        onChange={(e) => setCommentForm({ ...commentForm, email: e.target.value })}
                        className="h-10 min-w-0 flex-1 bg-transparent text-sm text-[#F3EEE3] outline-none placeholder-[#F3EEE3]/45"
                      />
                    </label>
                  </div>
                  <label className="flex gap-2 border border-[#F3EEE3]/20 px-3 py-2">
                    <Pencil className="mt-1 h-4 w-4 shrink-0 text-[#F3EEE3]/55" />
                    <textarea
                      placeholder="Write your comment *"
                      value={commentForm.content}
                      onChange={(e) => setCommentForm({ ...commentForm, content: e.target.value })}
                      required
                      rows={3}
                      className="min-h-[76px] min-w-0 flex-1 resize-y bg-transparent text-sm text-[#F3EEE3] outline-none placeholder-[#F3EEE3]/45"
                    />
                  </label>
                  {commentError && <p className="text-xs text-red-300" role="alert">{commentError}</p>}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmittingComment}
                      className="border border-[#D9541E] bg-[#D9541E] px-4 py-2 text-xs font-semibold text-[#111111] transition-colors hover:bg-[#F3EEE3] disabled:cursor-wait disabled:opacity-60"
                    >
                      {isSubmittingComment ? 'Posting...' : 'Post Comment'}
                    </button>
                  </div>
                </form>

                {/* Comments List */}
                {(() => {
                  const comments = [...(selectedPost.comments || [])].sort((a, b) =>
                    commentSort === 'newest'
                      ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
                      : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
                  );
                  const visibleComments = comments.slice(0, visibleCommentCount);
                  const remainingComments = Math.max(comments.length - visibleComments.length, 0);

                  return (
                    <>
                      <div className="max-h-[280px] overflow-y-auto overscroll-contain pr-1">
                        {visibleComments.length > 0 ? (
                          visibleComments.map((comment) => (
                            <div key={comment._id} className="flex gap-3 border-b border-[#F3EEE3]/15 py-3 last:border-b-0">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#D9541E]/25 text-xs font-semibold text-[#F3EEE3]">
                                {(comment.author.trim()[0] || '?').toUpperCase()}
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                                  <span className="break-words text-sm font-semibold text-[#F3EEE3]">{comment.author}</span>
                                  <span className="shrink-0 text-[10px] text-[#F3EEE3]/50">{formatDate(comment.createdAt)}</span>
                                </div>
                                <p className="mt-1 whitespace-pre-wrap break-words text-xs leading-5 text-[#F3EEE3]/75">{comment.content}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="py-3 text-sm text-[#F3EEE3]/55">No comments yet. Be the first to comment!</p>
                        )}
                      </div>
                      {remainingComments > 0 && (
                        <button
                          type="button"
                          onClick={() => setVisibleCommentCount((count) => count + 5)}
                          className="mx-auto mt-4 flex items-center gap-2 rounded-full border border-[#D9541E] px-5 py-2 text-xs text-[#F3EEE3] transition-colors hover:bg-[#D9541E] hover:text-[#111111]"
                        >
                          Load More Comments ({Math.min(5, remainingComments)}) <ArrowDown className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </>
                  );
                })()}
              </motion.div>
            </motion.div>
          </motion.div>
            );
          })()
        )}
      </AnimatePresence>
    </section>
  );
}
