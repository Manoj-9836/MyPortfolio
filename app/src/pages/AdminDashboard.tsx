import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { API_ENDPOINTS } from '../config/api';
import {
  LogOut,
  Home,
  User,
  GraduationCap,
  Code,
  Briefcase,
  BookOpen,
  Users,
  Trophy,
  Mail,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  BarChart3,
  FileText,
  Image as ImageIcon,
  Settings,
  TrendingUp,
  Heart,
  MessageCircle,
  Eye,
  Zap
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { SkeletonContent } from '../components/admin/SkeletonLoader';
import StatCard from '../components/admin/StatCard';
import ActivityTimeline from '../components/admin/ActivityTimeline';
import QuickActions from '../components/admin/QuickActions';
import HeroForm from '../components/admin/HeroForm';
import AboutForm from '../components/admin/AboutForm';
import EducationForm from '../components/admin/EducationForm';
import SkillsForm from '../components/admin/SkillsForm';
import ProjectsForm from '../components/admin/ProjectsForm';
import BlogForm from '../components/admin/BlogForm';
import LeadershipForm from '../components/admin/LeadershipForm';
import AchievementsForm from '../components/admin/AchievementsForm';
import ContactForm from '../components/admin/ContactForm';

interface BlogPost {
  _id?: string;
  title: string;
  excerpt: string;
  content: string;
  image?: string;
  date: string;
  category: string;
  tags: string[];
  views?: number;
  likes?: number;
  comments?: Comment[];
}

interface Comment {
  _id?: string;
  author: string;
  email: string;
  content: string;
  createdAt: string;
  approved?: boolean;
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('home');
  const token = localStorage.getItem('adminToken');
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [stats, setStats] = useState([
    { title: 'Total Projects', value: 0, icon: Briefcase, change: { value: 0, trend: 'up' as const } },
    { title: 'Skills', value: 0, icon: Code, change: { value: 0, trend: 'up' as const } },
    { title: 'Achievements', value: 0, icon: Trophy, change: { value: 0, trend: 'up' as const } },
    { title: 'Blog Posts', value: 0, icon: FileText, change: { value: 0, trend: 'up' as const } },
  ]);
  const [chartData, setChartData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [engagementStats, setEngagementStats] = useState({
    totalViews: 0,
    totalLikes: 0,
    totalComments: 0,
    totalEngagement: 0,
  });
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [mostEngagedPosts, setMostEngagedPosts] = useState<(BlogPost & { engagement: number })[]>([]);

  useEffect(() => {
    if (!token) {
      navigate('/');
    } else {
      // Fetch data counts from API
      const fetchStats = async () => {
        try {
          const res = await fetch(`${API_ENDPOINTS.PORTFOLIO}/stats`);
          const data = await res.json();

          setStats([
            { title: 'Total Projects', value: data.projects || 0, icon: Briefcase, change: { value: 20, trend: 'up' as const } },
            { title: 'Skills', value: data.skills || 0, icon: Code, change: { value: 8, trend: 'up' as const } },
            { title: 'Achievements', value: data.achievements || 0, icon: Trophy, change: { value: 5, trend: 'up' as const } },
            { title: 'Blog Posts', value: data.blogs || 0, icon: FileText, change: { value: 12, trend: 'up' as const } },
          ]);

          // Prepare chart data
          setChartData([
            { name: 'Projects', value: data.projects || 0, color: '#3b82f6' },
            { name: 'Skills', value: data.skills || 0, color: '#10b981' },
            { name: 'Achievements', value: data.achievements || 0, color: '#f59e0b' },
            { name: 'Blog Posts', value: data.blogs || 0, color: '#ef4444' },
          ]);

          // Fetch blog posts for engagement analytics
          const blogsRes = await fetch(`${API_ENDPOINTS.PORTFOLIO}/blogs`);
          const blogs: BlogPost[] = await blogsRes.json();
          setBlogPosts(blogs);

          // Calculate engagement metrics
          let totalViews = 0;
          let totalLikes = 0;
          let totalComments = 0;

          blogs.forEach((blog: BlogPost) => {
            totalViews += blog.views || 0;
            totalLikes += blog.likes || 0;
            totalComments += (blog.comments?.length || 0);
          });

          setEngagementStats({
            totalViews,
            totalLikes,
            totalComments,
            totalEngagement: totalViews + totalLikes + totalComments,
          });

          // Get top 5 most engaged posts
          const engagedPosts = blogs
            .map((blog: BlogPost) => ({
              ...blog,
              engagement: (blog.views || 0) + (blog.likes || 0) + (blog.comments?.length || 0),
            }))
            .sort((a: BlogPost & { engagement: number }, b: BlogPost & { engagement: number }) => b.engagement - a.engagement)
            .slice(0, 5);

          setMostEngagedPosts(engagedPosts);
        } catch (error) {
          console.error('Failed to fetch stats:', error);
        }
      };

      fetchStats();
      
      // Simulate data loading
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 1500);

      return () => clearTimeout(timer);
    }
  }, [token, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    navigate('/');
  };

  const handleRefresh = () => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  };

  const sections = [
    { id: 'home', label: 'Dashboard', icon: BarChart3 },
    { id: 'hero', label: 'Hero', icon: Home },
    { id: 'about', label: 'About', icon: User },
    { id: 'education', label: 'Education', icon: GraduationCap },
    { id: 'skills', label: 'Skills', icon: Code },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'blog', label: 'Blog', icon: BookOpen },
    { id: 'leadership', label: 'Leadership', icon: Users },
    { id: 'achievements', label: 'Achievements', icon: Trophy },
    { id: 'contact', label: 'Contact', icon: Mail },
  ];

  // Mock data for dashboard


  const activities = [
    { id: '1', action: 'Admin dashboard loaded', section: 'Dashboard', timestamp: 'just now', type: 'update' as const },
    { id: '2', action: 'Portfolio content synced', section: 'System', timestamp: '5 minutes ago', type: 'create' as const },
    { id: '3', action: 'All sections available', section: 'Status', timestamp: '10 minutes ago', type: 'create' as const },
  ];

  const handleMediaUpload = (files: FileList | null) => {
    if (files && files.length > 0) {
      const file = files[0];
      console.log('File selected:', file.name);
      alert(`Media upload ready: ${file.name}\n\nNote: Full media upload feature coming soon.`);
      // In a real implementation, this would upload to a server or storage service
    }
  };

  const quickActions = [
    { label: 'New Project', description: 'Add a portfolio project', icon: Plus, onClick: () => setActiveTab('projects'), color: 'hover:bg-green-500/5' },
    { label: 'Edit Hero', description: 'Update main section', icon: Edit, onClick: () => setActiveTab('hero'), color: 'hover:bg-blue-500/5' },
    { label: 'Manage Skills', description: 'Add or update skills', icon: Code, onClick: () => setActiveTab('skills'), color: 'hover:bg-purple-500/5' },
    { label: 'Upload Media', description: 'Add images/files', icon: ImageIcon, onClick: () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => handleMediaUpload((e.target as HTMLInputElement).files);
      input.click();
    }, color: 'hover:bg-amber-500/5' },
  ];

  if (!token) {
    navigate('/');
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full bg-gradient-to-b from-gray-950 to-black border-r border-white/10 transition-all duration-300 z-40 ${
        isSidebarCollapsed ? 'w-20' : 'w-64'
      }`}>
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="h-16 flex items-center justify-between px-6 border-b border-white/10">
            {!isSidebarCollapsed && (
              <motion.h2
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-xl font-bold"
              >
                BMK Admin
              </motion.h2>
            )}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <Settings className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <div className="space-y-1">
              {sections.map((section) => {
                const Icon = section.icon;
                const isActive = activeTab === section.id;
                return (
                  <motion.button
                    key={section.id}
                    onClick={() => setActiveTab(section.id)}
                    whileHover={{ x: 4 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-white text-black font-semibold'
                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <Icon className="w-5 h-5 flex-shrink-0" />
                    {!isSidebarCollapsed && (
                      <span className="truncate">{section.label}</span>
                    )}
                  </motion.button>
                );
              })}
            </div>
          </nav>

          {/* Footer Actions */}
          <div className="p-3 border-t border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {!isSidebarCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`flex-1 transition-all duration-300 ${isSidebarCollapsed ? 'ml-20' : 'ml-64'}`}>
        {/* Header */}
        <header className="sticky top-0 z-30 bg-black/80 backdrop-blur-xl border-b border-white/10">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold capitalize">{sections.find(s => s.id === activeTab)?.label}</h1>
                <p className="text-sm text-gray-400 mt-1">
                  Manage your portfolio content
                </p>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href="/"
                  className="px-4 py-2 text-sm text-gray-400 hover:text-white transition-colors"
                >
                  View Site
                </a>
                <button
                  onClick={handleRefresh}
                  disabled={isLoading}
                  className="flex items-center gap-2 px-4 py-2 text-sm bg-white/5 hover:bg-white/10 rounded-lg transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                  {!isLoading && 'Refresh'}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="p-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'home' ? (
              // Dashboard Home
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {stats.map((stat) => (
                    <StatCard
                      key={stat.title}
                      title={stat.title}
                      value={stat.value}
                      icon={stat.icon}
                      change={stat.change}
                      loading={isLoading}
                    />
                  ))}
                </div>

                {/* Engagement Analytics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-br from-blue-500/10 to-blue-500/5 border border-blue-500/20 rounded-xl p-6 hover:border-blue-500/40 transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-blue-500/20 rounded-lg">
                          <Eye className="w-5 h-5 text-blue-400" />
                        </div>
                        <span className="text-gray-400 text-sm">Total Views</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold">{engagementStats.totalViews.toLocaleString()}</h3>
                    <p className="text-xs text-gray-500 mt-2">
                      {blogPosts.length > 0 ? `Avg ${(engagementStats.totalViews / blogPosts.length).toFixed(1)} per post` : 'No posts yet'}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-gradient-to-br from-red-500/10 to-red-500/5 border border-red-500/20 rounded-xl p-6 hover:border-red-500/40 transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-red-500/20 rounded-lg">
                          <Heart className="w-5 h-5 text-red-400" />
                        </div>
                        <span className="text-gray-400 text-sm">Total Likes</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold">{engagementStats.totalLikes.toLocaleString()}</h3>
                    <p className="text-xs text-gray-500 mt-2">
                      {blogPosts.length > 0 ? `Avg ${(engagementStats.totalLikes / blogPosts.length).toFixed(1)} per post` : 'No posts yet'}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20 rounded-xl p-6 hover:border-green-500/40 transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-green-500/20 rounded-lg">
                          <MessageCircle className="w-5 h-5 text-green-400" />
                        </div>
                        <span className="text-gray-400 text-sm">Total Comments</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold">{engagementStats.totalComments.toLocaleString()}</h3>
                    <p className="text-xs text-gray-500 mt-2">
                      {blogPosts.length > 0 ? `Avg ${(engagementStats.totalComments / blogPosts.length).toFixed(1)} per post` : 'No posts yet'}
                    </p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border border-purple-500/20 rounded-xl p-6 hover:border-purple-500/40 transition-all"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-500/20 rounded-lg">
                          <Zap className="w-5 h-5 text-purple-400" />
                        </div>
                        <span className="text-gray-400 text-sm">Total Engagement</span>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold">{engagementStats.totalEngagement.toLocaleString()}</h3>
                    <p className="text-xs text-gray-500 mt-2">
                      {blogPosts.length > 0 ? `Avg ${(engagementStats.totalEngagement / blogPosts.length).toFixed(1)} per post` : 'No posts yet'}
                    </p>
                  </motion.div>
                </div>

                {/* Most Engaged Posts */}
                {mostEngagedPosts.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white/5 border border-white/10 rounded-xl p-6"
                  >
                    <div className="flex items-center gap-2 mb-6">
                      <TrendingUp className="w-5 h-5 text-purple-400" />
                      <h3 className="text-lg font-semibold">Top 5 Most Engaged Posts</h3>
                    </div>
                    <div className="space-y-3">
                      {mostEngagedPosts.map((post, index) => (
                        <motion.div
                          key={post._id}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/8 transition-all flex items-center justify-between"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-sm font-bold text-purple-400 bg-purple-500/20 w-8 h-8 rounded-full flex items-center justify-center">
                                #{index + 1}
                              </span>
                              <h4 className="font-semibold truncate text-white">{post.title}</h4>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />{post.views || 0} views
                              </span>
                              <span className="flex items-center gap-1">
                                <Heart className="w-3 h-3" />{post.likes || 0} likes
                              </span>
                              <span className="flex items-center gap-1">
                                <MessageCircle className="w-3 h-3" />{post.comments?.length || 0} comments
                              </span>
                            </div>
                          </div>
                          <div className="ml-4 text-right">
                            <div className="text-lg font-bold text-purple-400">{post.engagement}</div>
                            <div className="text-xs text-gray-500">engagement</div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Recent Activity & Quick Actions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <ActivityTimeline activities={activities} loading={isLoading} />
                  <QuickActions actions={quickActions} />
                </div>

                {/* Overview Chart */}
                {!isLoading && chartData.length > 0 && (
                  <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                    <div className="flex items-center gap-2 mb-6">
                      <TrendingUp className="w-5 h-5 text-gray-400" />
                      <h3 className="text-lg font-semibold">Content Distribution</h3>
                    </div>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, value }) => `${name}: ${value}`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#1f2937', 
                              border: '1px solid #374151',
                              borderRadius: '8px'
                            }}
                            labelStyle={{ color: '#fff' }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              // Section Content
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold">Manage {sections.find(s => s.id === activeTab)?.label}</h2>
                    <p className="text-sm text-gray-400 mt-1">
                      Create, edit, and organize your content
                    </p>
                  </div>
                  {activeTab !== 'hero' && activeTab !== 'about' && activeTab !== 'education' && activeTab !== 'skills' && activeTab !== 'projects' && activeTab !== 'blog' && !isLoading && (
                    <button className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium">
                      <Plus className="w-4 h-4" />
                      Add New
                    </button>
                  )}
                </div>
                {/* Content Cards/Table */}
                <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                  {isLoading ? (
                    <SkeletonContent />
                  ) : activeTab === 'hero' ? (
                    // Hero Edit Form
                    <div>
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Edit Hero Section</h3>
                        <p className="text-sm text-gray-400">
                          Update the title and description that appear on your homepage
                        </p>
                      </div>
                      <HeroForm onSave={() => {
                        setIsLoading(true);
                        setTimeout(() => setIsLoading(false), 1500);
                      }} />
                    </div>
                  ) : activeTab === 'about' ? (
                    // About Edit Form
                    <div>
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Edit About Section</h3>
                        <p className="text-sm text-gray-400">
                          Update your professional summary and background
                        </p>
                      </div>
                      <AboutForm onSave={() => {
                        setIsLoading(true);
                        setTimeout(() => setIsLoading(false), 1500);
                      }} />
                    </div>
                  ) : activeTab === 'education' ? (
                    // Education Management
                    <div>
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Manage Education</h3>
                        <p className="text-sm text-gray-400">
                          Add, edit, and remove your educational qualifications
                        </p>
                      </div>
                      <EducationForm onSave={() => {
                        setIsLoading(true);
                        setTimeout(() => setIsLoading(false), 1500);
                      }} />
                    </div>
                  ) : activeTab === 'skills' ? (
                    // Skills Management
                    <div>
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Manage Skills</h3>
                        <p className="text-sm text-gray-400">
                          Add, edit, and organize your technical skills by category
                        </p>
                      </div>
                      <SkillsForm onSave={() => {
                        setIsLoading(true);
                        setTimeout(() => setIsLoading(false), 1500);
                      }} />
                    </div>
                  ) : activeTab === 'projects' ? (
                    // Projects Management
                    <div>
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Manage Projects</h3>
                        <p className="text-sm text-gray-400">
                          Showcase your best work with detailed project information
                        </p>
                      </div>
                      <ProjectsForm onSave={() => {
                        setIsLoading(true);
                        setTimeout(() => setIsLoading(false), 1500);
                      }} />
                    </div>
                  ) : activeTab === 'blog' ? (
                    // Blog Management
                    <div>
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Manage Blog</h3>
                        <p className="text-sm text-gray-400">
                          Create and manage your blog posts with publishing controls
                        </p>
                      </div>
                      <BlogForm onSave={() => {
                        setIsLoading(true);
                        setTimeout(() => setIsLoading(false), 1500);
                      }} />
                    </div>
                  ) : activeTab === 'leadership' ? (
                    // Leadership Management
                    <div>
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Manage Leadership</h3>
                        <p className="text-sm text-gray-400">
                          Manage your leadership positions and community engagement
                        </p>
                      </div>
                      <LeadershipForm onSave={() => {
                        setIsLoading(true);
                        setTimeout(() => setIsLoading(false), 1500);
                      }} />
                    </div>
                  ) : activeTab === 'achievements' ? (
                    // Achievements Management
                    <div>
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Manage Achievements</h3>
                        <p className="text-sm text-gray-400">
                          Track your milestones, awards, and key accomplishments
                        </p>
                      </div>
                      <AchievementsForm onSave={() => {
                        setIsLoading(true);
                        setTimeout(() => setIsLoading(false), 1500);
                      }} />
                    </div>
                  ) : activeTab === 'contact' ? (
                    // Contact Management
                    <div>
                      <div className="mb-6">
                        <h3 className="text-lg font-semibold mb-2">Manage Contact Information</h3>
                        <p className="text-sm text-gray-400">
                          Update your contact details and social links
                        </p>
                      </div>
                      <ContactForm onSave={() => {
                        setIsLoading(true);
                        setTimeout(() => setIsLoading(false), 1500);
                      }} />
                    </div>
                  ) : (
                    <>
                      <div className="text-center py-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-white/5 rounded-full mb-4">
                          {sections.find(s => s.id === activeTab)?.icon && (
                            <div className="w-8 h-8 text-gray-400">
                              {(() => {
                                const Icon = sections.find(s => s.id === activeTab)?.icon;
                                return Icon ? <Icon className="w-full h-full" /> : null;
                              })()}
                            </div>
                          )}
                        </div>
                        <h3 className="text-lg font-semibold mb-2">
                          {activeTab === 'hero' || activeTab === 'about'
                            ? 'Edit Section Content'
                            : 'No Items Yet'}
                        </h3>
                        <p className="text-gray-400 text-sm mb-6 max-w-md mx-auto">
                          {activeTab === 'hero' || activeTab === 'about'
                            ? `Update your ${activeTab} section content and settings.`
                            : `Start by adding your first ${activeTab} item to showcase your work.`}
                        </p>
                        <button className="px-6 py-3 bg-white text-black rounded-lg hover:bg-gray-200 transition-colors font-medium">
                          {activeTab === 'hero' || activeTab === 'about' ? 'Edit Content' : 'Create First Item'}
                        </button>
                      </div>

                      {/* Example items for projects */}
                      {activeTab === 'projects' && (
                        <div className="space-y-3 mt-6">
                          {[1, 2].map((item) => (
                            <motion.div
                              key={item}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: item * 0.1 }}
                              className="bg-white/5 border border-white/10 rounded-lg p-5 hover:bg-white/8 hover:border-white/20 transition-all group"
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1">
                                  <div className="flex items-center gap-3 mb-2">
                                    <h3 className="font-semibold text-lg">Sample Project {item}</h3>
                                    <span className="px-2 py-0.5 bg-green-500/20 text-green-400 text-xs rounded-full font-medium">
                                      Published
                                    </span>
                                  </div>
                                  <p className="text-sm text-gray-400 mb-3">
                                    A comprehensive description of the project with key features and technologies used.
                                  </p>
                                  <div className="flex flex-wrap gap-2">
                                    {['React', 'TypeScript', 'Tailwind'].map((tech) => (
                                      <span
                                        key={tech}
                                        className="px-2 py-1 bg-white/5 text-xs rounded-md text-gray-300"
                                      >
                                        {tech}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div className="flex items-center gap-2 ml-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button className="p-2 hover:bg-white/10 rounded-lg transition-colors" title="Edit">
                                    <Edit className="w-4 h-4" />
                                  </button>
                                  <button className="p-2 hover:bg-red-500/10 text-red-400 rounded-lg transition-colors" title="Delete">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
}
