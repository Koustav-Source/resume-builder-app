import type { ResumeData, ResumeProject, SectionConfig, ThemeConfig } from '../types';

const uid = () => Math.random().toString(36).slice(2, 9);

export const DEFAULT_SECTIONS: SectionConfig[] = [
  { key: 'summary', label: 'Professional Summary', enabled: true },
  { key: 'skills', label: 'Key Skills', enabled: true },
  { key: 'experience', label: 'Work Experience', enabled: true },
  { key: 'projects', label: 'Projects', enabled: true },
  { key: 'education', label: 'Education', enabled: true },
  { key: 'internships', label: 'Internships', enabled: true },
  { key: 'certifications', label: 'Certifications', enabled: true },
  { key: 'achievements', label: 'Achievements', enabled: true },
];

export const defaultTheme = (templateId: string): ThemeConfig => ({
  templateId,
  accent: '#1d4ed8',
  fontScale: 'normal',
  fontFamily: 'sans',
  paper: 'A4',
});

// ---- Fresher: CS graduate -------------------------------------------------
export const FRESHER: ResumeData = {
  level: 'fresher',
  contact: {
    name: 'Ananya Sharma',
    role: 'Software Engineer (Fresher)',
    email: 'ananya.sharma@email.com',
    phone: '+91 98XXX XXX12',
    location: 'Bengaluru, Karnataka',
    linkedin: 'linkedin.com/in/ananya-sharma',
    github: 'github.com/ananyas',
    portfolio: 'ananya.dev',
  },
  summary:
    'Computer Science graduate (2024) with strong foundations in DSA, Java and full-stack development. Built 3 production-grade academic projects and contributed to open source. Seeking an entry-level SDE role to deliver reliable, well-tested software.',
  skills: [
    { id: uid(), category: 'Languages', items: 'Java, Python, JavaScript, SQL, C++' },
    { id: uid(), category: 'Frameworks', items: 'Spring Boot, React, Node.js, Express' },
    { id: uid(), category: 'Tools & Cloud', items: 'Git, Docker, Postman, AWS (basics), MySQL, MongoDB' },
    { id: uid(), category: 'CS Fundamentals', items: 'Data Structures, Algorithms, OOP, DBMS, OS, Computer Networks' },
  ],
  experience: [],
  projects: [
    {
      id: uid(),
      name: 'CampusConnect — College Event Platform',
      tech: 'React, Node.js, Express, MongoDB',
      link: 'github.com/ananyas/campusconnect',
      bullets: [
        'Built a full-stack event registration platform used by 1,200+ students across 6 college fests.',
        'Reduced manual registration effort by ~70% by automating QR-based check-in and email confirmations.',
        'Implemented JWT auth and role-based access for admins, organisers and attendees.',
      ],
    },
    {
      id: uid(),
      name: 'StockSense — Price Prediction (Mini Project)',
      tech: 'Python, Pandas, scikit-learn, Streamlit',
      link: 'github.com/ananyas/stocksense',
      bullets: [
        'Trained an LSTM model achieving 87% directional accuracy on 5 years of NSE data.',
        'Deployed an interactive Streamlit dashboard for real-time visualisation.',
      ],
    },
  ],
  education: [
    {
      id: uid(),
      degree: 'B.E. Computer Science & Engineering',
      institute: 'RV College of Engineering',
      city: 'Bengaluru, Karnataka',
      year: '2020 – 2024',
      score: 'CGPA: 8.7/10',
    },
    {
      id: uid(),
      degree: 'Class XII (CBSE)',
      institute: 'Delhi Public School',
      city: 'Bengaluru, Karnataka',
      year: '2020',
      score: '94.2%',
    },
  ],
  internships: [
    {
      id: uid(),
      title: 'SDE Intern — Infosys (Summer 2023)',
      detail:
        'Developed REST APIs in Spring Boot for an internal HR tool; wrote 40+ JUnit tests raising module coverage to 82%.',
    },
  ],
  certifications: [
    { id: uid(), name: 'AWS Certified Cloud Practitioner', issuer: 'Amazon Web Services', year: '2023' },
    { id: uid(), name: 'Meta Front-End Developer', issuer: 'Coursera', year: '2023' },
  ],
  achievements: [
    { id: uid(), title: 'Smart India Hackathon 2023', detail: 'Finalist (top 6 of 240 teams) — healthcare track.' },
    { id: uid(), title: 'LeetCode', detail: 'Solved 450+ problems; Knight badge (rating 1850+).' },
  ],
};

// ---- Senior SDE (5+ years) ------------------------------------------------
export const SENIOR: ResumeData = {
  level: 'senior',
  contact: {
    name: 'Rahul Verma',
    role: 'Senior Software Engineer',
    email: 'rahul.verma@email.com',
    phone: '+91 99XXX XXX45',
    location: 'Hyderabad, Telangana',
    linkedin: 'linkedin.com/in/rahul-verma',
    github: 'github.com/rahulv',
    portfolio: '',
  },
  summary:
    'Senior Software Engineer with 6+ years building scalable backend systems for fintech and e-commerce. Led teams of 5–7, owned services handling 50M+ daily requests, and cut cloud costs by 32%. Strong in distributed systems, microservices and platform reliability.',
  skills: [
    { id: uid(), category: 'Languages', items: 'Java, Go, Python, TypeScript, SQL' },
    { id: uid(), category: 'Backend & Distributed', items: 'Spring Boot, gRPC, Kafka, Redis, PostgreSQL, Cassandra' },
    { id: uid(), category: 'Cloud & DevOps', items: 'AWS (EKS, Lambda, RDS), Docker, Kubernetes, Terraform, CI/CD' },
    { id: uid(), category: 'Practices', items: 'System Design, Microservices, Observability, TDD, Agile/Scrum' },
  ],
  experience: [
    {
      id: uid(),
      company: 'PhonePe',
      city: 'Bengaluru, Karnataka',
      role: 'Senior Software Engineer',
      start: 'Apr 2021',
      end: 'Present',
      bullets: [
        'Architected a payments reconciliation service processing 50M+ transactions/day with 99.98% uptime.',
        'Reduced p99 latency from 480ms to 120ms (75% improvement) by introducing Redis caching and query optimisation.',
        'Led a team of 6 engineers; mentored 3 to promotion within 18 months.',
        'Cut AWS spend by 32% (~₹1.1 Cr/year) via right-sizing, spot instances and Terraform-managed autoscaling.',
      ],
    },
    {
      id: uid(),
      company: 'Flipkart',
      city: 'Bengaluru, Karnataka',
      role: 'Software Engineer II',
      start: 'Jun 2018',
      end: 'Mar 2021',
      bullets: [
        'Built an order-tracking microservice serving 8M+ active users during Big Billion Days.',
        'Migrated a monolith module to event-driven Kafka pipelines, improving throughput by 3x.',
        'Improved test coverage from 55% to 88%, reducing production incidents by 40%.',
      ],
    },
  ],
  projects: [
    {
      id: uid(),
      name: 'OpenTelemetry Collector Plugin (OSS)',
      tech: 'Go, OpenTelemetry',
      link: 'github.com/rahulv/otel-plugin',
      bullets: ['Authored a sampling plugin adopted by 200+ GitHub stars and used in 3 companies.'],
    },
  ],
  education: [
    {
      id: uid(),
      degree: 'B.Tech Information Technology',
      institute: 'NIT Warangal',
      city: 'Warangal, Telangana',
      year: '2014 – 2018',
      score: 'CGPA: 8.4/10',
    },
  ],
  internships: [],
  certifications: [
    { id: uid(), name: 'AWS Certified Solutions Architect – Associate', issuer: 'Amazon Web Services', year: '2022' },
    { id: uid(), name: 'Certified Kubernetes Administrator (CKA)', issuer: 'CNCF', year: '2021' },
  ],
  achievements: [
    { id: uid(), title: 'Patent (filed)', detail: 'Method for low-latency transaction reconciliation (IN App. No. 2023XXXXX).' },
    { id: uid(), title: 'Internal Hackathon Winner', detail: 'PhonePe Quarterly Hack — fraud-detection prototype.' },
  ],
};

export const makeProject = (title: string, data: ResumeData, templateId: string): ResumeProject => ({
  id: uid(),
  title,
  updatedAt: Date.now(),
  data: structuredClone(data),
  theme: defaultTheme(templateId),
  sections: structuredClone(DEFAULT_SECTIONS),
});

export const emptyResume = (): ResumeData => ({
  level: 'mid',
  contact: {
    name: 'Your Name',
    role: 'Your Target Role',
    email: 'you@email.com',
    phone: '+91 ',
    location: 'City, State',
    linkedin: '',
    github: '',
    portfolio: '',
  },
  summary: '',
  skills: [{ id: uid(), category: 'Languages', items: '' }],
  experience: [
    { id: uid(), company: '', city: '', role: '', start: '', end: '', bullets: [''] },
  ],
  projects: [],
  education: [{ id: uid(), degree: '', institute: '', city: '', year: '', score: '' }],
  internships: [],
  certifications: [],
  achievements: [],
});

export { uid };
