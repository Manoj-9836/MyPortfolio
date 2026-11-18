export interface ProjectMetric {
  value: string;
  label: string;
}

export interface ProjectFeature {
  title: string;
  description: string;
}

export interface ProjectScreenshot {
  src: string;
  alt: string;
  caption: string;
}

export interface Project {
  _id: string;
  title: string;
  subtitle: string;
  description: string;
  tech: string[];
  date: string;
  liveUrl?: string;
  githubUrl?: string;
  highlights: string[];
  featured: boolean;
  bgImage?: string;
  caseStudy?: {
    problem?: string;
    approach?: string;
    impact?: string;
  };
  metrics?: ProjectMetric[];
  features?: ProjectFeature[];
  demoVideoUrl?: string;
  screenshots?: ProjectScreenshot[];
  architectureImage?: string;
  challengesAndLearnings?: string[];
}
