import express from 'express';
import mongoose from 'mongoose';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import {
  Project,
  Skill,
  Education,
  Blog,
  Leadership,
  Achievement,
  Certification,
  Hero,
  About,
  Contact
} from '../models/Portfolio.js';

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const RESUME_PATH = path.join(__dirname, '..', '..', 'app', 'public', 'resume.pdf');

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const buildTransportConfig = () => {
  const port = Number(process.env.SMTP_PORT || 587);
  const rejectUnauthorized = String(process.env.SMTP_TLS_REJECT_UNAUTHORIZED || 'true').toLowerCase() !== 'false';
  const smtpPass = String(process.env.SMTP_PASS || '').replace(/\s+/g, '');

  if (!rejectUnauthorized) {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
  }

  return {
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    requireTLS: true,
    auth: {
      user: process.env.SMTP_USER,
      pass: smtpPass
    },
    tls: {
      rejectUnauthorized,
      minVersion: 'TLSv1.2'
    }
  };
};

const canSendMail = () => {
  return Boolean(
    process.env.SMTP_HOST &&
    process.env.SMTP_PORT &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    process.env.EMAIL_FROM
  );
};

const escapeHtml = (value = '') => {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Generic CRUD routes generator
const createCRUDRoutes = (Model, name) => {
  // Get all
  router.get(`/${name}`, async (req, res) => {
    try {
      const items = await Model.find().sort({ order: 1, createdAt: -1 });
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Get one
  router.get(`/${name}/:id`, async (req, res) => {
    try {
      const item = await Model.findById(req.params.id);
      if (!item) {
        return res.status(404).json({ message: `${name} not found` });
      }
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });

  // Create (protected)
  router.post(`/${name}`, verifyToken, async (req, res) => {
    try {
      const item = new Model(req.body);
      await item.save();
      res.status(201).json(item);
    } catch (error) {
      res.status(400).json({ message: 'Validation error', error: error.message });
    }
  });

  // Update (protected)
  router.put(`/${name}/:id`, verifyToken, async (req, res) => {
    try {
      const item = await Model.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );
      if (!item) {
        return res.status(404).json({ message: `${name} not found` });
      }
      res.json(item);
    } catch (error) {
      res.status(400).json({ message: 'Validation error', error: error.message });
    }
  });

  // Delete (protected)
  router.delete(`/${name}/:id`, verifyToken, async (req, res) => {
    try {
      const item = await Model.findByIdAndDelete(req.params.id);
      if (!item) {
        return res.status(404).json({ message: `${name} not found` });
      }
      res.json({ message: `${name} deleted successfully` });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  });
};

// Achievements with default data
router.get('/achievements', async (req, res) => {
  try {
    let achievements = await Achievement.find().sort({ order: 1 });
    if (achievements.length === 0) {
      achievements = await Achievement.insertMany([
        {
          title: 'TCS CodeVita Achievement',
          description: 'Cracked TCS CodeVita Round 1 and successfully participated in Round 2, demonstrating strong problem-solving skills in competitive programming.',
          category: 'Competitive Programming',
          date: '2024',
          order: 1
        },
        {
          title: 'Technical Leadership',
          description: 'Serving as Technical Head of AI Club, leading technical initiatives and mentoring 100+ students in programming and AI technologies.',
          category: 'Technical Leadership',
          date: 'Present',
          order: 2
        },
        {
          title: 'AI Project Innovation',
          description: 'Built ApexResume, an AI-powered resume analysis platform that improved user engagement by 40% through intelligent features.',
          category: 'Project Innovation',
          date: '2025',
          order: 3
        },
        {
          title: 'Academic Excellence',
          description: 'Maintaining CGPA of 8.1 in B.Tech Computer Science while actively participating in technical clubs and project development.',
          category: 'Academic Excellence',
          date: 'Ongoing',
          order: 4
        }
      ]);
    }
    res.json(achievements);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/achievements', verifyToken, async (req, res) => {
  try {
    const achievement = await Achievement.create(req.body);
    res.status(201).json(achievement);
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
});

router.put('/achievements/:id', verifyToken, async (req, res) => {
  try {
    const achievement = await Achievement.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!achievement) {
      return res.status(404).json({ message: 'Achievement not found' });
    }
    res.json(achievement);
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
});

router.delete('/achievements/:id', verifyToken, async (req, res) => {
  try {
    const achievement = await Achievement.findByIdAndDelete(req.params.id);
    if (!achievement) {
      return res.status(404).json({ message: 'Achievement not found' });
    }
    res.json({ message: 'Achievement deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

const normalizeCertificationPayload = (payload = {}) => {
  const normalized = {
    title: typeof payload.title === 'string' ? payload.title.trim() : '',
    description: typeof payload.description === 'string' ? payload.description.trim() : '',
    image: typeof payload.image === 'string' ? payload.image.trim() : '',
    issuer: typeof payload.issuer === 'string' ? payload.issuer.trim() : '',
    issueDate: typeof payload.issueDate === 'string' ? payload.issueDate.trim() : '',
    credentialUrl: typeof payload.credentialUrl === 'string' ? payload.credentialUrl.trim() : '',
  };

  return Object.fromEntries(
    Object.entries(normalized).filter(([key, value]) => {
      if (key === 'title' || key === 'description') {
        return true;
      }
      return value !== '';
    })
  );
};

// Certifications with default data
router.get('/certifications', async (req, res) => {
  try {
    let certifications = await Certification.find().sort({ order: 1, createdAt: -1 });
    if (certifications.length === 0) {
      certifications = await Certification.insertMany([
        {
          title: 'Meta Front-End Developer Certificate',
          description: 'Completed core frontend development training including React, responsive design, and production-ready UI workflows.',
          image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=900&h=600&fit=crop',
          issuer: 'Meta',
          issueDate: '2025',
          credentialUrl: '',
          order: 1
        },
        {
          title: 'AWS Cloud Practitioner',
          description: 'Validated foundational cloud knowledge covering AWS services, architecture, security, and cost management basics.',
          image: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=900&h=600&fit=crop',
          issuer: 'Amazon Web Services',
          issueDate: '2025',
          credentialUrl: '',
          order: 2
        }
      ]);
    }
    res.json(certifications);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/certifications', verifyToken, async (req, res) => {
  try {
    const certification = await Certification.create(normalizeCertificationPayload(req.body));
    res.status(201).json(certification);
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
});

router.put('/certifications/:id', verifyToken, async (req, res) => {
  try {
    const certification = await Certification.findByIdAndUpdate(
      req.params.id,
      normalizeCertificationPayload(req.body),
      { new: true, runValidators: true }
    );
    if (!certification) {
      return res.status(404).json({ message: 'Certification not found' });
    }
    res.json(certification);
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
});

router.delete('/certifications/:id', verifyToken, async (req, res) => {
  try {
    const certification = await Certification.findByIdAndDelete(req.params.id);
    if (!certification) {
      return res.status(404).json({ message: 'Certification not found' });
    }
    res.json({ message: 'Certification deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Leadership with default data
router.get('/leadership', async (req, res) => {
  try {
    let leadership = await Leadership.find().sort({ order: 1 });
    if (leadership.length === 0) {
      leadership = await Leadership.insertMany([
        {
          title: 'Technical Head',
          organization: 'AI Club | Lendi Institute of Engineering & Technology',
          period: '2023 - Present',
          description: 'Leading innovation projects and mentoring peers on AI-powered web solutions.',
          achievements: [
            'Organized and led coding workshops, technical sessions, and AI bootcamps for 100+ students',
            'Promoted problem-solving, competitive programming, and developer best practices',
            'Leading innovation projects and mentoring peers on AI-powered web solutions'
          ],
          order: 1
        }
      ]);
    }
    res.json(leadership);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/leadership', verifyToken, async (req, res) => {
  try {
    const leadership = await Leadership.create(req.body);
    res.status(201).json(leadership);
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
});

router.put('/leadership/:id', verifyToken, async (req, res) => {
  try {
    const leadership = await Leadership.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!leadership) {
      return res.status(404).json({ message: 'Leadership not found' });
    }
    res.json(leadership);
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
});

router.delete('/leadership/:id', verifyToken, async (req, res) => {
  try {
    const leadership = await Leadership.findByIdAndDelete(req.params.id);
    if (!leadership) {
      return res.status(404).json({ message: 'Leadership not found' });
    }
    res.json({ message: 'Leadership deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Blog with default data
router.get('/blogs', async (req, res) => {
  try {
    let blogs = await Blog.find().sort({ date: -1, order: 1 });
    if (blogs.length === 0) {
      blogs = await Blog.insertMany([
        {
          title: 'Getting Started with React Hooks',
          date: '2024-01-15',
          category: 'React',
          excerpt: 'Learn how to use React Hooks to manage state and side effects in functional components.',
          content: 'React Hooks have revolutionized the way we write React components. In this post, we explore the basics of useState, useEffect, and custom hooks. Hooks allow you to use state and other React features without writing a class component. They make it easier to reuse logic between components and organize your code based on what it does rather than the lifecycle method you use.',
          image: 'https://images.unsplash.com/photo-1633356122544-f134324ef6db?w=500&h=300&fit=crop',
          readTime: '5 min read',
          tags: ['react', 'hooks', 'javascript'],
          published: true,
          order: 1
        },
        {
          title: 'Building Responsive Web Design',
          date: '2024-01-10',
          category: 'Web Design',
          excerpt: 'Master the art of creating responsive websites that work on all devices.',
          content: 'Responsive design is no longer optional. Learn the principles and techniques to build websites that adapt to any screen size. With mobile-first approach, CSS media queries, and flexible layouts, you can create websites that look great on any device. We\'ll explore best practices for typography, images, and layout patterns that work across different screen sizes.',
          image: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=500&h=300&fit=crop',
          readTime: '7 min read',
          tags: ['responsive', 'css', 'web-design'],
          published: true,
          order: 2
        },
        {
          title: 'JavaScript ES6 Features You Should Know',
          date: '2024-01-05',
          category: 'JavaScript',
          excerpt: 'Discover the most important ES6 features that will improve your coding productivity.',
          content: 'ES6 introduced many powerful features like arrow functions, destructuring, template literals, and more. Let\'s dive deep into each one. Arrow functions provide a concise syntax and lexical this binding. Destructuring allows you to unpack values from arrays and objects. Template literals make string interpolation easier. Promises and async/await revolutionized asynchronous programming in JavaScript.',
          image: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=500&h=300&fit=crop',
          readTime: '8 min read',
          tags: ['javascript', 'es6', 'programming'],
          published: true,
          order: 3
        }
      ]);
    }
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/blogs', verifyToken, async (req, res) => {
  try {
    const blog = await Blog.create(req.body);
    res.status(201).json(blog);
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
});

router.put('/blogs/:id', verifyToken, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.json(blog);
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
});

router.delete('/blogs/:id', verifyToken, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.json({ message: 'Blog deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Increment blog views
router.post('/blogs/:id/view', async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    );
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }
    res.json({ views: blog.views });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Toggle like on a blog post
router.post('/blogs/:id/like', async (req, res) => {
  try {
    const { userId } = req.body; // This could be IP address or session ID
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const hasLiked = blog.likedBy.includes(userId);
    
    if (hasLiked) {
      // Unlike
      blog.likedBy = blog.likedBy.filter(id => id !== userId);
      blog.likes = Math.max(0, blog.likes - 1);
    } else {
      // Like
      blog.likedBy.push(userId);
      blog.likes += 1;
    }
    
    await blog.save();
    res.json({ likes: blog.likes, hasLiked: !hasLiked });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Add comment to blog post
router.post('/blogs/:id/comments', async (req, res) => {
  try {
    const { author, email, content } = req.body;
    
    if (!author || !content) {
      return res.status(400).json({ message: 'Author and content are required' });
    }

    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    const newComment = {
      author,
      email,
      content,
      createdAt: new Date(),
      approved: true
    };

    blog.comments.push(newComment);
    await blog.save();

    res.status(201).json(blog.comments[blog.comments.length - 1]);
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
});

// Delete comment from blog post (protected)
router.delete('/blogs/:id/comments/:commentId', verifyToken, async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    blog.comments = blog.comments.filter(
      comment => comment._id.toString() !== req.params.commentId
    );
    
    await blog.save();
    res.json({ message: 'Comment deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Get related posts
router.get('/blogs/:id/related', async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: 'Blog not found' });
    }

    // Find posts with similar tags or category
    const relatedPosts = await Blog.find({
      _id: { $ne: req.params.id },
      published: true,
      $or: [
        { category: blog.category },
        { tags: { $in: blog.tags } }
      ]
    })
    .limit(3)
    .sort({ date: -1 });

    res.json(relatedPosts);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Projects with default data
router.get('/projects', async (req, res) => {
  try {
    let projects = await Project.find().sort({ featured: -1, order: 1 });
    if (projects.length === 0) {
      projects = await Project.insertMany([
        {
          title: 'ApexResume',
          subtitle: 'AI Resume Analyzer',
          description: 'An AI-powered resume analysis platform providing ATS score, skill recommendations, and job role suggestions using NLP and Gemini API. Features real-time leaderboard, company-specific resume generation, and skill roadmap visualization.',
          caseStudy: {
            problem: 'Job seekers often submit resumes that fail ATS screening due to weak structure and missing skill alignment.',
            approach: 'Built an AI-driven analysis pipeline with Gemini API to score resumes, suggest improvements, and generate role-focused optimization guidance.',
            impact: 'Improved engagement by 40% through actionable feedback loops and personalized recommendations.'
          },
          tech: ['React.js', 'Node.js', 'MongoDB', 'Gemini API'],
          date: 'Jun 2025',
          liveUrl: 'https://apexresume.netlify.app',
          githubUrl: 'https://github.com/Manoj-9836',
          highlights: ['40% improved engagement', 'ATS scoring', 'AI-powered analysis'],
          featured: true,
          bgImage: 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?w=800&q=80',
          order: 1
        },
        {
          title: 'NutroTrack',
          subtitle: 'Nutrition Tracker',
          description: 'A nutrition tracking dashboard with real-time calorie analytics and interactive visualizations. Optimized component rendering for faster data load performance.',
          caseStudy: {
            problem: 'Users needed a simple nutrition dashboard that loads quickly and provides understandable daily insights.',
            approach: 'Designed reusable React UI blocks with API-based nutrition metrics and optimized render cycles for key dashboard widgets.',
            impact: 'Achieved 30% faster load time and improved usability for regular tracking behavior.'
          },
          tech: ['React.js', 'REST APIs'],
          date: 'Oct 2024',
          liveUrl: 'https://manoj-9836.github.io/NutroTrack',
          githubUrl: 'https://github.com/Manoj-9836/NutroTrack',
          highlights: ['30% faster load time', 'Real-time analytics', 'Interactive charts'],
          featured: false,
          bgImage: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&q=80',
          order: 2
        }
      ]);
    }
    const normalizedProjects = projects.map((project) => {
      const projectObject = typeof project.toObject === 'function' ? project.toObject() : project;
      const safeCaseStudy = projectObject.caseStudy || {};

      return {
        ...projectObject,
        caseStudy: {
          problem: safeCaseStudy.problem || projectObject.problem || '',
          approach: safeCaseStudy.approach || projectObject.approach || '',
          impact: safeCaseStudy.impact || projectObject.impact || '',
        },
      };
    });

    res.json(normalizedProjects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/projects/:id', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: 'Invalid project id' });
    }
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }

    const projectObject = project.toObject();
    const safeCaseStudy = projectObject.caseStudy || {};

    res.json({
      ...projectObject,
      caseStudy: {
        problem: safeCaseStudy.problem || projectObject.problem || '',
        approach: safeCaseStudy.approach || projectObject.approach || '',
        impact: safeCaseStudy.impact || projectObject.impact || '',
      },
    });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

const normalizeProjectPayload = (payload = {}) => {
  const safeCaseStudy = payload.caseStudy || payload.casestudy || {};

  return {
    ...payload,
    caseStudy: {
      problem: typeof safeCaseStudy.problem === 'string'
        ? safeCaseStudy.problem.trim()
        : typeof payload.problem === 'string'
          ? payload.problem.trim()
          : '',
      approach: typeof safeCaseStudy.approach === 'string'
        ? safeCaseStudy.approach.trim()
        : typeof payload.approach === 'string'
          ? payload.approach.trim()
          : '',
      impact: typeof safeCaseStudy.impact === 'string'
        ? safeCaseStudy.impact.trim()
        : typeof payload.impact === 'string'
          ? payload.impact.trim()
          : '',
    },
  };
};

router.post('/projects', verifyToken, async (req, res) => {
  try {
    const project = await Project.create(normalizeProjectPayload(req.body));
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
});

router.put('/projects/:id', verifyToken, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(
      req.params.id,
      normalizeProjectPayload(req.body),
      { new: true, runValidators: true }
    );
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json(project);
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
});

router.delete('/projects/:id', verifyToken, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ message: 'Project not found' });
    }
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Skills with default data
router.get('/skills', async (req, res) => {
  try {
    let skills = await Skill.find().sort({ category: 1, order: 1 });
    if (skills.length === 0) {
      skills = await Skill.insertMany([
        // Programming Languages
        { name: 'JavaScript', level: 85, category: 'Programming Languages', order: 1 },
        { name: 'Java (Core)', level: 80, category: 'Programming Languages', order: 2 },
        { name: 'C++', level: 75, category: 'Programming Languages', order: 3 },
        // Frontend
        { name: 'React.js', level: 90, category: 'Frontend', order: 1 },
        { name: 'HTML5', level: 95, category: 'Frontend', order: 2 },
        { name: 'CSS3', level: 90, category: 'Frontend', order: 3 },
        { name: 'Tailwind CSS', level: 85, category: 'Frontend', order: 4 },
        { name: 'Bootstrap', level: 80, category: 'Frontend', order: 5 },
        // Backend
        { name: 'Node.js', level: 85, category: 'Backend', order: 1 },
        { name: 'Express.js', level: 85, category: 'Backend', order: 2 },
        { name: 'REST APIs', level: 80, category: 'Backend', order: 3 },
        // Databases
        { name: 'MongoDB', level: 85, category: 'Databases', order: 1 },
        { name: 'MySQL', level: 75, category: 'Databases', order: 2 },
        // Cloud & Tools
        { name: 'Git', level: 90, category: 'Cloud & Tools', order: 1 },
        { name: 'GitHub', level: 90, category: 'Cloud & Tools', order: 2 },
        { name: 'AWS (Basic)', level: 65, category: 'Cloud & Tools', order: 3 },
        { name: 'Gemini API', level: 80, category: 'Cloud & Tools', order: 4 },
        { name: 'GenAI Tools', level: 75, category: 'Cloud & Tools', order: 5 }
      ]);
    }
    res.json(skills);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/skills', verifyToken, async (req, res) => {
  try {
    const skill = await Skill.create(req.body);
    res.status(201).json(skill);
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
});

router.put('/skills/:id', verifyToken, async (req, res) => {
  try {
    const skill = await Skill.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    res.json(skill);
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
});

router.delete('/skills/:id', verifyToken, async (req, res) => {
  try {
    const skill = await Skill.findByIdAndDelete(req.params.id);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }
    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Education with default data
router.get('/education', async (req, res) => {
  try {
    let education = await Education.find().sort({ order: 1 });
    if (education.length === 0) {
      education = await Education.insertMany([
        {
          institution: 'Lendi Institute of Engineering & Technology',
          degree: 'B.Tech, Computer Science & Engineering',
          gpa: 'CGPA: 8.1',
          location: 'Vizianagaram',
          period: '2024 – Present',
          current: true,
          order: 1
        },
        {
          institution: 'Andhra Polytechnic, Kakinada',
          degree: 'Diploma, Computer Management & Engineering',
          gpa: 'Percentage: 85%',
          location: 'Kakinada',
          period: '2021 – 2024',
          current: false,
          order: 2
        }
      ]);
    }
    res.json(education);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/education', verifyToken, async (req, res) => {
  try {
    const education = await Education.create(req.body);
    res.status(201).json(education);
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
});

router.put('/education/:id', verifyToken, async (req, res) => {
  try {
    const education = await Education.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!education) {
      return res.status(404).json({ message: 'Education not found' });
    }
    res.json(education);
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
});

router.delete('/education/:id', verifyToken, async (req, res) => {
  try {
    const education = await Education.findByIdAndDelete(req.params.id);
    if (!education) {
      return res.status(404).json({ message: 'Education not found' });
    }
    res.json({ message: 'Education deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Special routes for Hero and About (single document)
router.get('/hero', async (req, res) => {
  try {
    let hero = await Hero.findOne();
    if (!hero) {
      hero = await Hero.create({
        name: 'BAVISETTI MANOJ KUMAR',
        title: 'AI & Full-Stack Development Enthusiast',
        subtitle: '',
        description: 'Computer Science undergraduate and Technical Head of the AI Club with strong experience in full-stack development and AI-powered applications. Passionate about mentoring peers and organizing programming initiatives to empower student developers.',
        tagline: ''
      });
    }
    res.json(hero);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/hero', verifyToken, async (req, res) => {
  try {
    let hero = await Hero.findOne();
    if (!hero) {
      hero = new Hero(req.body);
    } else {
      Object.assign(hero, req.body);
    }
    await hero.save();
    res.json(hero);
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
});

router.get('/about', async (req, res) => {
  try {
    let about = await About.findOne();
    if (!about) {
      about = await About.create({
        title: 'Professional Summary',
        description: 'Computer Science undergraduate and Technical Head of the AI Club with strong experience in full-stack development and AI-powered applications. Actively involved in developer community building, technical workshops, and coding culture promotion. Passionate about mentoring peers, organizing programming initiatives to empower student developers.',
        highlights: []
      });
    }
    res.json(about);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/about', verifyToken, async (req, res) => {
  try {
    let about = await About.findOne();
    if (!about) {
      about = new About(req.body);
    } else {
      Object.assign(about, req.body);
    }
    await about.save();
    res.json(about);
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
});

// Contact with default data
router.get('/contact', async (req, res) => {
  try {
    let contact = await Contact.findOne();
    if (!contact) {
      contact = await Contact.create({
        email: 'manojbavisetti75@gmail.com',
        phone: '+91-6305321506',
        location: 'Vizianagaram, Andhra Pradesh',
        linkedin: 'linkedin.com/in/mkmanoj-dev',
        github: 'github.com/Manoj-9836',
        leetcode: 'leetcode.com/u/Manoj9836',
        portfolio: 'manoj-9836.github.io/Portfolio',
        message: 'Open to collaborations, opportunities, and interesting conversations'
      });
    }
    res.json(contact);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/contact', verifyToken, async (req, res) => {
  try {
    const existing = await Contact.findOne();
    if (existing) {
      const contact = await Contact.findByIdAndUpdate(existing._id, req.body, { new: true, runValidators: true });
      return res.json(contact);
    }
    const contact = await Contact.create(req.body);
    res.status(201).json(contact);
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
});

router.put('/contact/:id', verifyToken, async (req, res) => {
  try {
    const contact = await Contact.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!contact) {
      return res.status(404).json({ message: 'Contact not found' });
    }
    res.json(contact);
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
});

router.post('/contact/message', async (req, res) => {
  try {
    const name = String(req.body?.name || '').trim();
    const email = String(req.body?.email || '').trim().toLowerCase();
    const message = String(req.body?.message || '').trim();

    if (!name || !email || !message) {
      return res.status(400).json({ message: 'Name, email, and message are required.' });
    }

    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: 'Invalid email address.' });
    }

    if (!canSendMail()) {
      console.error('Contact email configuration missing SMTP or sender environment variables.');
      return res.status(500).json({ message: 'Email service is not configured.' });
    }

    const transporter = nodemailer.createTransport(buildTransportConfig());
    const safeName = escapeHtml(name);
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br/>');
    const emailHtml = `
      <div style="margin:0;padding:24px 12px;background:#edf2f7;font-family:Arial,sans-serif;">
        <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:16px;overflow:hidden;">
          <tr>
            <td style="padding:0;background:#0f172a;">
              <img src="https://raw.githubusercontent.com/Manoj-9836/images/refs/heads/main/hello%40reallygreatsite.com.png" alt="Manoj Kumar" style="width:100%;display:block;border:0;" />
            </td>
          </tr>

          <tr>
            <td style="padding:26px 24px 10px 24px;">
              <h2 style="margin:0;text-align:center;color:#1f2937;font-size:30px;line-height:1.2;font-weight:800;">Thanks for reaching out</h2>
              <p style="margin:14px 0 0 0;color:#334155;font-size:15px;line-height:1.75;">Hi <strong>${safeName}</strong>,</p>
              <p style="margin:10px 0 0 0;color:#334155;font-size:15px;line-height:1.75;">I received your message through my portfolio. I appreciate your time and I will get back to you soon.</p>
            </td>
          </tr>

          <tr>
            <td style="padding:14px 24px 0 24px;">
              <table width="100%" cellspacing="0" cellpadding="0" role="presentation" style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;">
                <tr>
                  <td style="padding:14px 16px;">
                    <p style="margin:0;color:#0f172a;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;">Your Message</p>
                    <p style="margin:8px 0 0 0;color:#334155;font-size:14px;line-height:1.75;">${safeMessage}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:18px 24px 0 24px;">
              <p style="margin:0;color:#475569;font-size:14px;">You can also explore my work here:</p>
            </td>
          </tr>

          <tr>
            <td style="padding:12px 18px 4px 18px;">
              <table width="100%" cellspacing="8" cellpadding="0" role="presentation" style="table-layout:fixed;">
                <tr>
                  <td align="center" valign="middle" style="background:#16a34a;border-radius:10px;">
                    <a href="https://manoj-9836.github.io/Portfolio" style="display:block;padding:11px 6px;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;line-height:1.2;white-space:nowrap;">
                      <img src="https://img.icons8.com/ios-filled/50/FFFFFF/domain.png" alt="Portfolio" width="15" height="15" style="vertical-align:-2px;border:0;"/> Portfolio
                    </a>
                  </td>
                  <td align="center" valign="middle" style="background:#111827;border-radius:10px;">
                    <a href="https://github.com/Manoj-9836" style="display:block;padding:11px 6px;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;line-height:1.2;white-space:nowrap;">
                      <img src="https://img.icons8.com/ios-glyphs/30/FFFFFF/github.png" alt="GitHub" width="15" height="15" style="vertical-align:-2px;border:0;"/> GitHub
                    </a>
                  </td>
                  <td align="center" valign="middle" style="background:#0a66c2;border-radius:10px;">
                    <a href="https://linkedin.com/in/mkmanoj-dev" style="display:block;padding:11px 6px;color:#ffffff;text-decoration:none;font-size:13px;font-weight:700;line-height:1.2;white-space:nowrap;">
                      <img src="https://img.icons8.com/ios-filled/50/FFFFFF/linkedin.png" alt="LinkedIn" width="15" height="15" style="vertical-align:-2px;border:0;"/> LinkedIn
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <tr>
            <td style="padding:16px 24px 0 24px;">
              <p style="margin:0;color:#334155;font-size:14px;line-height:1.8;">Best regards,<br/><strong>Bavisetti Manoj Kumar</strong><br/>AI Web Developer</p>
            </td>
          </tr>

          <tr>
            <td style="padding:18px 24px 24px 24px;">
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:0 0 12px 0;" />
              <p style="margin:0;text-align:center;color:#64748b;font-size:12px;line-height:1.6;">This is an automated response from my portfolio contact form.</p>
            </td>
          </tr>
        </table>
      </div>
    `;

    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: email,
      replyTo: process.env.ADMIN_EMAIL || process.env.EMAIL_FROM,
      subject: 'Thanks for contacting Manoj',
      text: `Hi ${name},\n\nThanks for reaching out through my portfolio website. I received your message and will respond soon.\n\nYour message:\n${message}\n\nExplore my work:\nPortfolio: https://manoj-9836.github.io/Portfolio\nGitHub: https://github.com/Manoj-9836\nLinkedIn: https://linkedin.com/in/mkmanoj-dev\n\nBest regards,\nBavisetti Manoj Kumar\nAI Web Developer`,
      html: emailHtml
    });

    res.json({ message: 'Message received and acknowledgement email sent.' });
  } catch (error) {
    console.error('Failed to process contact message:', error);
    res.status(500).json({ message: 'Failed to send acknowledgement email.' });
  }
});

router.post('/resume', verifyToken, async (req, res) => {
  try {
    const { fileName, contentBase64 } = req.body;

    if (!contentBase64) {
      return res.status(400).json({ message: 'Missing resume content' });
    }

    if (fileName && !String(fileName).toLowerCase().endsWith('.pdf')) {
      return res.status(400).json({ message: 'Resume must be a PDF' });
    }

    const base64 = String(contentBase64).includes('base64,')
      ? String(contentBase64).split('base64,')[1]
      : String(contentBase64);

    const buffer = Buffer.from(base64, 'base64');

    if (!buffer.length) {
      return res.status(400).json({ message: 'Invalid resume content' });
    }

    await fs.writeFile(RESUME_PATH, buffer);

    res.json({ message: 'Resume updated' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// Stats endpoint - get counts of all portfolio sections
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      projects: await Project.countDocuments(),
      skills: await Skill.countDocuments(),
      achievements: await Achievement.countDocuments(),
      certifications: await Certification.countDocuments(),
      blogs: await Blog.countDocuments(),
      education: await Education.countDocuments(),
      leadership: await Leadership.countDocuments(),
      total: 0
    };

    // Calculate total content items
    stats.total = Object.values(stats).reduce((acc, val) => acc + val, 0);

    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

export default router;
