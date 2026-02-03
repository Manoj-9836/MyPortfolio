import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  subtitle: { type: String, required: true },
  description: { type: String, required: true },
  tech: [String],
  date: String,
  liveUrl: String,
  githubUrl: String,
  highlights: [String],
  featured: { type: Boolean, default: false },
  bgImage: String,
  order: { type: Number, default: 0 }
}, { timestamps: true });

const skillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  level: { type: Number, required: true, min: 0, max: 100 },
  category: { type: String, required: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

const educationSchema = new mongoose.Schema({
  degree: { type: String, required: true },
  institution: { type: String, required: true },
  location: String,
  period: String,
  gpa: String,
  description: String,
  achievements: [String],
  current: { type: Boolean, default: false },
  order: { type: Number, default: 0 }
}, { timestamps: true });

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  excerpt: { type: String, required: true },
  content: String,
  image: String,
  date: String,
  readTime: String,
  category: String,
  tags: [String],
  published: { type: Boolean, default: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

const leadershipSchema = new mongoose.Schema({
  title: { type: String, required: true },
  organization: { type: String, required: true },
  period: String,
  description: String,
  achievements: [String],
  order: { type: Number, default: 0 }
}, { timestamps: true });

const achievementSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  date: String,
  category: String,
  order: { type: Number, default: 0 }
}, { timestamps: true });

const heroSchema = new mongoose.Schema({
  name: String,
  title: String,
  subtitle: String,
  description: String,
  tagline: String
}, { timestamps: true });

const aboutSchema = new mongoose.Schema({
  title: String,
  description: String,
  highlights: [String]
}, { timestamps: true });

const contactSchema = new mongoose.Schema({
  email: String,
  phone: String,
  location: String,
  linkedin: String,
  github: String,
  leetcode: String,
  portfolio: String,
  message: String
}, { timestamps: true });

export const Project = mongoose.model('Project', projectSchema);
export const Skill = mongoose.model('Skill', skillSchema);
export const Education = mongoose.model('Education', educationSchema);
export const Blog = mongoose.model('Blog', blogSchema);
export const Leadership = mongoose.model('Leadership', leadershipSchema);
export const Achievement = mongoose.model('Achievement', achievementSchema);
export const Hero = mongoose.model('Hero', heroSchema);
export const About = mongoose.model('About', aboutSchema);
export const Contact = mongoose.model('Contact', contactSchema);
