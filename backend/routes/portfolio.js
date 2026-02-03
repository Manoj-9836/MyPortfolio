import express from 'express';
import jwt from 'jsonwebtoken';
import {
  Project,
  Skill,
  Education,
  Blog,
  Leadership,
  Achievement,
  Hero,
  About,
  Contact
} from '../models/Portfolio.js';

const router = express.Router();

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
    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.post('/projects', verifyToken, async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json(project);
  } catch (error) {
    res.status(400).json({ message: 'Validation error', error: error.message });
  }
});

router.put('/projects/:id', verifyToken, async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
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

// Stats endpoint - get counts of all portfolio sections
router.get('/stats', async (req, res) => {
  try {
    const stats = {
      projects: await Project.countDocuments(),
      skills: await Skill.countDocuments(),
      achievements: await Achievement.countDocuments(),
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
