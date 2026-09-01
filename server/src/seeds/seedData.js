const mongoose = require('mongoose');
const dotenv = require('dotenv');
const { connectDB, disconnectDB } = require('../config/db');

dotenv.config();

// Models
const User = require('../models/User');
const Profile = require('../models/Profile');
const Company = require('../models/Company');
const Job = require('../models/Job');
const JobApplication = require('../models/JobApplication');
const Post = require('../models/Post');
const Article = require('../models/Article');
const Comment = require('../models/Comment');
const Connection = require('../models/Connection');
const Notification = require('../models/Notification');
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');

const usersData = [
  // 0. Candidate - Senior Fullstack Engineer
  {
    email: 'alex.rivera@example.com',
    password: 'password123',
    role: 'candidate',
    profile: {
      firstName: 'Alex',
      lastName: 'Rivera',
      headline: 'Senior Full Stack Engineer | React, Node.js, TypeScript, Cloud Architecture',
      about: 'Passionate software architect with 6+ years of experience designing scalable cloud systems and intuitive user interfaces. Committed to clean code, test-driven development, and mentoring junior engineers.',
      location: 'San Francisco, CA',
      phone: '+1 (555) 234-5678',
      preferredWorkMode: 'Remote',
      targetRoles: ['Senior Full Stack Engineer', 'Frontend Architect', 'Engineering Lead'],
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
      skills: [
        { name: 'React' },
        { name: 'Node.js' },
        { name: 'TypeScript' },
        { name: 'MongoDB' },
        { name: 'GraphQL' },
        { name: 'Docker' },
        { name: 'Tailwind CSS' },
        { name: 'AWS' },
      ],
      experience: [
        {
          title: 'Senior Software Engineer',
          company: 'NovaTech Systems',
          location: 'San Francisco, CA',
          startDate: '2022-03',
          current: true,
          employmentType: 'Full-time',
          description: 'Architected micro-frontends and high-throughput REST/GraphQL APIs serving 1M+ daily active users.',
        },
      ],
      education: [
        {
          school: 'University of California, Berkeley',
          degree: 'B.S. in Computer Science',
          fieldOfStudy: 'Computer Science',
          startDate: '2015',
          endDate: '2019',
        },
      ],
    },
  },
  // 1. Team Member - Full Stack Developer
  {
    email: 'ajay.pk@example.com',
    password: 'password123',
    role: 'candidate',
    profile: {
      firstName: 'Ajay',
      lastName: 'P K',
      headline: 'Full Stack Software Engineer | React, Node.js, Express & Cloud Architecture',
      about: 'Core developer on CareerLink. Building scalable web architectures, liquid-glass responsive UIs, and robust REST APIs.',
      location: 'Bengaluru, India',
      phone: '+91 98765 11223',
      preferredWorkMode: 'Hybrid',
      targetRoles: ['Full Stack Engineer', 'Software Developer'],
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
      skills: [{ name: 'React' }, { name: 'Node.js' }, { name: 'Express' }, { name: 'MongoDB' }, { name: 'JavaScript' }, { name: 'Tailwind CSS' }],
      experience: [
        {
          title: 'Full Stack Developer',
          company: 'CareerLink Engineering',
          location: 'Bengaluru, India',
          startDate: '2023-01',
          current: true,
          employmentType: 'Full-time',
          description: 'Developed real-time messaging, connection workflows, and cinematic interface modules.',
        },
      ],
      education: [
        {
          school: 'Visvesvaraya Technological University',
          degree: 'B.E. in Computer Science',
          fieldOfStudy: 'Computer Science',
          startDate: '2020',
          endDate: '2024',
        },
      ],
    },
  },
  // 2. Team Member - Cloud & Systems Architect
  {
    email: 'akash.kj@example.com',
    password: 'password123',
    role: 'candidate',
    profile: {
      firstName: 'Akash',
      lastName: 'K J',
      headline: 'Full Stack Developer & Systems Architect | React, Node.js, Socket.IO & MongoDB',
      about: 'Lead architect on CareerLink. Specializing in high-performance web systems, real-time WebSockets, persistent analytics pipelines, and secure cloud deployments.',
      location: 'Bengaluru, India',
      phone: '+91 98765 22334',
      preferredWorkMode: 'Remote',
      targetRoles: ['Full Stack Engineer', 'Systems Architect', 'Lead Developer'],
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
      skills: [{ name: 'React' }, { name: 'Node.js' }, { name: 'Socket.IO' }, { name: 'MongoDB' }, { name: 'TypeScript' }, { name: 'Cloud Architecture' }, { name: 'Docker' }],
      experience: [
        {
          title: 'Systems & Full Stack Architect',
          company: 'CareerLink Engineering',
          location: 'Bengaluru, India',
          startDate: '2023-01',
          current: true,
          employmentType: 'Full-time',
          description: 'Architected end-to-end persistent social networking engine, real-time notifications, and analytics infrastructure.',
        },
      ],
      education: [
        {
          school: 'Visvesvaraya Technological University',
          degree: 'B.E. in Computer Science',
          fieldOfStudy: 'Computer Science',
          startDate: '2020',
          endDate: '2024',
        },
      ],
    },
  },
  // 3. Team Member - Backend & Distributed Systems
  {
    email: 'akshay.guptha@example.com',
    password: 'password123',
    role: 'candidate',
    profile: {
      firstName: 'Akshay Guptha',
      lastName: 'L',
      headline: 'Backend & Data Engineer | Node.js, Java, Microservices & Database Systems',
      about: 'Core developer on CareerLink. Focused on database schema design, indexing strategies, API performance optimization, and search services.',
      location: 'Bengaluru, India',
      phone: '+91 98765 33445',
      preferredWorkMode: 'Hybrid',
      targetRoles: ['Backend Engineer', 'Database Specialist'],
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&auto=format&fit=crop&q=80',
      skills: [{ name: 'Node.js' }, { name: 'Java' }, { name: 'MongoDB' }, { name: 'REST APIs' }, { name: 'SQL' }],
      experience: [
        {
          title: 'Backend Engineer',
          company: 'CareerLink Engineering',
          location: 'Bengaluru, India',
          startDate: '2023-01',
          current: true,
          employmentType: 'Full-time',
          description: 'Built scalable backend routes, database aggregations, and recruiter ATS endpoints.',
        },
      ],
      education: [
        {
          school: 'Visvesvaraya Technological University',
          degree: 'B.E. in Computer Science',
          fieldOfStudy: 'Computer Science',
          startDate: '2020',
          endDate: '2024',
        },
      ],
    },
  },
  // 4. Team Member - Frontend & UI/UX Specialist
  {
    email: 'akshay.ravi@example.com',
    password: 'password123',
    role: 'candidate',
    profile: {
      firstName: 'Akshay',
      lastName: 'Ravi',
      headline: 'Frontend & UI/UX Engineer | React, Tailwind CSS, Motion & Interactive Design',
      about: 'Core developer on CareerLink. Creating dark cinematic design systems, interactive graphs, and fluid micro-animations.',
      location: 'Bengaluru, India',
      phone: '+91 98765 44556',
      preferredWorkMode: 'Hybrid',
      targetRoles: ['Frontend Engineer', 'UI/UX Developer'],
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=1200&auto=format&fit=crop&q=80',
      skills: [{ name: 'React' }, { name: 'Tailwind CSS' }, { name: 'Framer Motion' }, { name: 'UI/UX Design' }, { name: 'JavaScript' }],
      experience: [
        {
          title: 'Frontend Engineer',
          company: 'CareerLink Engineering',
          location: 'Bengaluru, India',
          startDate: '2023-01',
          current: true,
          employmentType: 'Full-time',
          description: 'Engineered liquid-glass cards, responsive dashboards, and interactive match analytics widgets.',
        },
      ],
      education: [
        {
          school: 'Visvesvaraya Technological University',
          degree: 'B.E. in Computer Science',
          fieldOfStudy: 'Computer Science',
          startDate: '2020',
          endDate: '2024',
        },
      ],
    },
  },
  // 5. Software Engineer & Java Developer - Keerthana D
  {
    email: 'keerthana.d@example.com',
    password: 'password123',
    role: 'candidate',
    profile: {
      firstName: 'Keerthana',
      lastName: 'D',
      headline: 'Software Engineer & Java Developer | Spring Boot, Microservices & Full Stack',
      about: 'Software engineer specializing in Java enterprise systems, Spring Boot microservices, and React frontend development.',
      location: 'Bengaluru, India',
      phone: '+91 98765 55667',
      preferredWorkMode: 'Remote',
      targetRoles: ['Software Engineer', 'Java Developer'],
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=1200&auto=format&fit=crop&q=80',
      skills: [{ name: 'Java' }, { name: 'Spring Boot' }, { name: 'React' }, { name: 'SQL' }, { name: 'REST APIs' }],
      education: [
        {
          school: 'Visvesvaraya Technological University',
          degree: 'B.E. in Computer Science',
          fieldOfStudy: 'Computer Science',
          startDate: '2020',
          endDate: '2024',
        },
      ],
    },
  },
  // 5. Candidate - ML / Data Science
  {
    email: 'priya.sharma@example.com',
    password: 'password123',
    role: 'candidate',
    profile: {
      firstName: 'Priya',
      lastName: 'Sharma',
      headline: 'Lead AI / Machine Learning Scientist | LLMs, NLP, PyTorch & Distributed Training',
      about: 'Research scientist turned machine learning engineer with a focus on transformer architectures, fine-tuning, and low-latency inference pipelines.',
      location: 'Bangalore, India',
      phone: '+91 98765 43210',
      preferredWorkMode: 'Hybrid',
      targetRoles: ['AI Research Scientist', 'Staff Machine Learning Engineer', 'NLP Architect'],
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80',
      coverImage: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&auto=format&fit=crop&q=80',
      skills: [
        { name: 'Python' },
        { name: 'PyTorch' },
        { name: 'Machine Learning' },
        { name: 'NLP' },
        { name: 'FastAPI' },
        { name: 'Docker' },
      ],
      experience: [
        {
          title: 'Lead AI Engineer',
          company: 'CloudSphere Technologies',
          location: 'Bangalore, India',
          startDate: '2021-08',
          current: true,
          employmentType: 'Full-time',
          description: 'Deployed enterprise LLM agents and multi-modal retrieval pipelines.',
        },
      ],
      education: [
        {
          school: 'Indian Institute of Technology, Madras',
          degree: 'M.Tech in Data Science & Artificial Intelligence',
          fieldOfStudy: 'Artificial Intelligence',
          startDate: '2017',
          endDate: '2019',
        },
      ],
    },
  },
  // 2. Recruiter - NovaTech Systems
  {
    email: 'elena.rostova@example.com',
    password: 'password123',
    role: 'recruiter',
    profile: {
      firstName: 'Elena',
      lastName: 'Rostova',
      headline: 'Head of Global Talent Acquisition @ NovaTech Systems | Scaling Tech Teams Worldwide',
      about: 'Dedicated technical recruiter with 8+ years helping hyper-growth startups and established technology giants hire world-class engineering talent.',
      location: 'New York, NY',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80',
      skills: [
        { name: 'Technical Recruiting' },
        { name: 'Talent Acquisition' },
        { name: 'Executive Search' },
        { name: 'Employer Branding' },
      ],
    },
  },
  // 3. Senior Java Architect
  {
    email: 'marcus.vance@example.com',
    password: 'password123',
    role: 'candidate',
    profile: {
      firstName: 'Marcus',
      lastName: 'Vance',
      headline: 'Staff Java Architect | Java 21, Virtual Threads, Spring Boot & Distributed FinTech',
      about: '10+ years specializing in core Java microservices, high-throughput JVM tuning, and resilient distributed transaction systems.',
      location: 'Seattle, WA',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80',
      skills: [
        { name: 'Java' },
        { name: 'Spring Boot' },
        { name: 'Microservices' },
        { name: 'Kafka' },
        { name: 'JVM Tuning' },
      ],
    },
  },
  // 4. Recruiter - CloudSphere AI
  {
    email: 'jason.reid@example.com',
    password: 'password123',
    role: 'recruiter',
    profile: {
      firstName: 'Jason',
      lastName: 'Reid',
      headline: 'Senior Technical Recruiter | AI/ML, Cloud Infrastructure & Data Engineering',
      about: 'Connecting ambitious software engineers, data scientists, and infrastructure leaders with top tech companies.',
      location: 'Austin, TX',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80',
      skills: [{ name: 'Tech Hiring' }, { name: 'Sourcing' }, { name: 'Full-Cycle Recruiting' }],
    },
  },
  // 5. Frontend / Design Systems Engineer
  {
    email: 'chloe.bennett@example.com',
    password: 'password123',
    role: 'candidate',
    profile: {
      firstName: 'Chloe',
      lastName: 'Bennett',
      headline: 'Principal Design Technologist | React, UI Architecture & Accessible Systems',
      about: 'Bridging design and engineering through unified component libraries and responsive web performance.',
      location: 'London, UK',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80',
      skills: [{ name: 'React' }, { name: 'TypeScript' }, { name: 'CSS' }, { name: 'Figma' }],
    },
  },
  // 6. Distributed Systems Engineer
  {
    email: 'devlin.hayes@example.com',
    password: 'password123',
    role: 'candidate',
    profile: {
      firstName: 'Devlin',
      lastName: 'Hayes',
      headline: 'Staff Distributed Systems Engineer | Go, Java, Raft, High-Scale Consensus',
      about: 'Building fault-tolerant storage engines and zero-downtime replication pipelines.',
      location: 'Chicago, IL',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80',
      skills: [{ name: 'Java' }, { name: 'Go' }, { name: 'Distributed Systems' }, { name: 'PostgreSQL' }],
    },
  },
  // 7. JVM & Cloud Performance Engineer
  {
    email: 'sarah.jenkins@example.com',
    password: 'password123',
    role: 'candidate',
    profile: {
      firstName: 'Sarah',
      lastName: 'Jenkins',
      headline: 'Principal Performance Engineer | JVM Garbage Collection, ZGC & Cloud Scale',
      about: 'Obsessed with sub-millisecond tail latency, memory allocation optimization, and profiling with JFR.',
      location: 'Boston, MA',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80',
      skills: [{ name: 'Java' }, { name: 'JVM Performance' }, { name: 'ZGC' }, { name: 'Kubernetes' }],
    },
  },
  // 8. Event-Driven Systems Engineer
  {
    email: 'liam.thorne@example.com',
    password: 'password123',
    role: 'candidate',
    profile: {
      firstName: 'Liam',
      lastName: 'Thorne',
      headline: 'Senior Backend Engineer | Java, Spring Cloud, Apache Kafka & Event Sourcing',
      about: 'Architecting resilient stream-processing pipelines and asynchronous messaging clusters for high-volume trade processing.',
      location: 'Toronto, Canada',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
      skills: [{ name: 'Java' }, { name: 'Spring Boot' }, { name: 'Apache Kafka' }, { name: 'PostgreSQL' }],
    },
  },
  // 9. Java Concurrency & Systems Specialist
  {
    email: 'maya.lin@example.com',
    password: 'password123',
    role: 'candidate',
    profile: {
      firstName: 'Maya',
      lastName: 'Lin',
      headline: 'Low-Latency Java Developer | Multithreading, Lock-Free Data Structures & JMM',
      about: 'Designing ultra-low latency order matching engines in modern Java with mechanical sympathy.',
      location: 'Singapore',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
      skills: [{ name: 'Java' }, { name: 'Multithreading' }, { name: 'Concurrency' }, { name: 'Algorithms' }],
    },
  },
  // 10. Rahul Mehta - Senior Java Backend Developer
  {
    email: 'rahul.mehta@example.com',
    password: 'password123',
    role: 'candidate',
    profile: {
      firstName: 'Rahul',
      lastName: 'Mehta',
      headline: 'Senior Java Backend Developer | Spring Boot 3, Microservices, Hibernate & Kafka',
      about: 'Building resilient cloud-native microservices in Java with Spring Boot, PostgreSQL, Docker, and Kubernetes.',
      location: 'Hyderabad, India',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80',
      skills: [
        { name: 'Java' },
        { name: 'Spring Boot' },
        { name: 'Hibernate' },
        { name: 'REST APIs' },
        { name: 'PostgreSQL' },
        { name: 'Docker' },
      ],
    },
  },
  // 11. Neha Kapoor - Java & Spring Security Engineer
  {
    email: 'neha.kapoor@example.com',
    password: 'password123',
    role: 'candidate',
    profile: {
      firstName: 'Neha',
      lastName: 'Kapoor',
      headline: 'Software Engineer | Core Java, Spring Security, OAuth2 & Microservices Architecture',
      about: 'Enthusiastic Java engineer passionate about secure API design, OAuth2 integration, and clean code practices.',
      location: 'Pune, India',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80',
      skills: [{ name: 'Java' }, { name: 'Spring Security' }, { name: 'OAuth2' }, { name: 'JPA' }, { name: 'REST APIs' }],
    },
  },
  // 12. Arjun Rao - Spring Boot Developer
  {
    email: 'arjun.rao@example.com',
    password: 'password123',
    role: 'candidate',
    profile: {
      firstName: 'Arjun',
      lastName: 'Rao',
      headline: 'Backend Developer | Spring Boot, Spring Data JPA, Microservices & Docker',
      about: 'Focused on creating scalable backend services, caching with Redis, and message broker architectures.',
      location: 'Bengaluru, India',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&auto=format&fit=crop&q=80',
      skills: [{ name: 'Java' }, { name: 'Spring Boot' }, { name: 'Redis' }, { name: 'MySQL' }, { name: 'Maven' }],
    },
  },
  // 13. Riya Nair - Java Developer & DSA Specialist
  {
    email: 'riya.nair@example.com',
    password: 'password123',
    role: 'candidate',
    profile: {
      firstName: 'Riya',
      lastName: 'Nair',
      headline: 'Java Developer | Core Java, Collections, OOP, DSA & System Design',
      about: 'Passionate about algorithmic problem solving, clean OOP patterns, and modern Java language evolution.',
      location: 'Chennai, India',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
      skills: [{ name: 'Java' }, { name: 'Data Structures' }, { name: 'OOP' }, { name: 'Collections' }, { name: 'Algorithms' }],
    },
  },
  // 14. Karan Shah - Backend Engineer
  {
    email: 'karan.shah@example.com',
    password: 'password123',
    role: 'candidate',
    profile: {
      firstName: 'Karan',
      lastName: 'Shah',
      headline: 'Backend Engineer | Java, Spring Cloud, Hibernate ORM, SQL Optimization',
      about: 'Experienced in query performance tuning, ORM mapping strategies, and reliable distributed APIs.',
      location: 'Mumbai, India',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80',
      skills: [{ name: 'Java' }, { name: 'Hibernate' }, { name: 'SQL' }, { name: 'Spring Cloud' }],
    },
  },
  // 15. Meera Joshi - Software Developer
  {
    email: 'meera.joshi@example.com',
    password: 'password123',
    role: 'candidate',
    profile: {
      firstName: 'Meera',
      lastName: 'Joshi',
      headline: 'Full Stack Java Developer | Java 21, Spring Boot, React, AWS & PostgreSQL',
      about: 'Building full-stack enterprise solutions with modern React frontends and Spring Boot backends.',
      location: 'Delhi, India',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80',
      skills: [{ name: 'Java' }, { name: 'Spring Boot' }, { name: 'React' }, { name: 'PostgreSQL' }, { name: 'AWS' }],
    },
  },
  // 16. Platform Admin
  {
    email: 'admin@careerlink.io',
    password: 'password123',
    role: 'admin',
    profile: {
      firstName: 'Platform',
      lastName: 'Administrator',
      headline: 'CareerLink System Administration & Developer Operations',
      about: 'Platform engineering and community management.',
      location: 'San Francisco, CA',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80',
      skills: [{ name: 'Site Reliability' }, { name: 'Security' }, { name: 'Platform Admin' }],
    },
  },
];

const seedDatabase = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      console.log('[Seed] Connecting to MongoDB...');
      await connectDB();
    }

    console.log('[Seed] Clearing existing database collections...');
    await User.deleteMany({});
    await Profile.deleteMany({});
    await Company.deleteMany({});
    await Job.deleteMany({});
    await JobApplication.deleteMany({});
    await Post.deleteMany({});
    await Article.deleteMany({});
    await Comment.deleteMany({});
    await Connection.deleteMany({});
    await Notification.deleteMany({});
    await Conversation.deleteMany({});
    await Message.deleteMany({});

    console.log(`[Seed] Creating ${usersData.length} verified users & profiles...`);
    const createdUsers = [];

    for (const u of usersData) {
      const user = await User.create({
        email: u.email,
        password: u.password,
        role: u.role,
        isVerified: true,
      });

      const profileData = {
        ...u.profile,
        user: user._id,
      };

      const profile = await Profile.create(profileData);
      user.profile = profile._id;
      await user.save();
      createdUsers.push(user);
    }

    console.log('[Seed] Creating fictional companies...');
    const createdCompanies = await Company.create([
      {
        name: 'NovaTech Systems',
        tagline: 'Empowering Developer Workflows with Cloud Intelligence',
        description: 'NovaTech Systems is an enterprise software leader creating developer tooling and high-throughput cloud infrastructure.',
        industry: 'Enterprise Software',
        companySize: '501-1000',
        website: 'https://novatech.example.com',
        location: 'San Francisco, CA',
        createdBy: createdUsers[2]._id,
      },
      {
        name: 'CloudSphere AI',
        tagline: 'Next-Generation Autonomous Cloud & AI Infrastructures',
        description: 'Pioneering edge AI inference and serverless computing solutions.',
        industry: 'Artificial Intelligence',
        companySize: '201-500',
        website: 'https://cloudsphere.example.com',
        location: 'Bangalore, India',
        createdBy: createdUsers[4]._id,
      },
      {
        name: 'Apex Financial Technologies',
        tagline: 'Ultra-low latency algorithmic trading & real-time settlement',
        description: 'Next-generation capital markets clearing platform built on high-performance Java microservices.',
        industry: 'FinTech',
        companySize: '1000+',
        website: 'https://apexfintech.example.com',
        location: 'New York, NY',
        createdBy: createdUsers[2]._id,
      },
    ]);

    console.log('[Seed] Creating diverse job postings...');
    await Job.create([
      {
        title: 'Senior Java / Spring Boot Microservices Engineer',
        company: createdCompanies[0]._id,
        recruiter: createdUsers[2]._id,
        location: 'San Francisco, CA',
        jobType: 'Full-time',
        workMode: 'Remote',
        salaryMin: 150000,
        salaryMax: 190000,
        currency: 'USD',
        experienceRequired: 5,
        skillsRequired: ['Java', 'Spring Boot', 'Microservices', 'Kafka', 'PostgreSQL', 'Docker'],
        description: 'Lead the architecture and implementation of resilient, high-throughput microservices using Java 21 and Spring Boot.',
        status: 'Active',
      },
      {
        title: 'Senior Full Stack Engineer',
        company: createdCompanies[0]._id,
        recruiter: createdUsers[2]._id,
        location: 'San Francisco, CA',
        jobType: 'Full-time',
        workMode: 'Remote',
        salaryMin: 145000,
        salaryMax: 185000,
        currency: 'USD',
        experienceRequired: 4,
        skillsRequired: ['React', 'Node.js', 'TypeScript', 'MongoDB', 'GraphQL', 'Tailwind CSS'],
        description: 'Build modern developer productivity interfaces and scalable web services.',
        status: 'Active',
      },
      {
        title: 'Java Performance & Distributed Systems Architect',
        company: createdCompanies[2]._id,
        recruiter: createdUsers[2]._id,
        location: 'New York, NY',
        jobType: 'Full-time',
        workMode: 'Hybrid',
        salaryMin: 175000,
        salaryMax: 220000,
        currency: 'USD',
        experienceRequired: 6,
        skillsRequired: ['Java', 'JVM Tuning', 'Multithreading', 'Kafka', 'Kubernetes'],
        description: 'Optimize high-throughput order matching and payment processing engines in Java.',
        status: 'Active',
      },
    ]);

    console.log('[Seed] Creating 45+ realistic Java and software development posts across 16 fictional developers...');
    const rawPosts = [
      // Post 1: Rahul Mehta (HashMap Internals)
      {
        authorIndex: 10,
        content: `☕ Finally understood why HashMap performance can degrade when hash collisions become excessive!\n\nKey takeaways on Java HashMap internals:\n1. Buckets start as Linked Lists (O(n) worst-case lookup).\n2. When a bucket exceeds TREEIFY_THRESHOLD (8 entries) and table capacity >= 64, it converts to a Red-Black Tree (O(log n)).\n3. Always override both hashCode() and equals() together to maintain the contract.\n\nUnderstanding how hashing works internally makes Java collections much easier to reason about in high-throughput systems! 💡 #Java #CoreJava #Collections #DataStructures #SoftwareEngineering`,
        likesCount: 142,
        sharesCount: 53,
      },
      // Post 2: Riya Nair (Java Streams & Lambdas)
      {
        authorIndex: 13,
        content: `✨ Java Streams completely changed how I approach collection processing.\n\nMethods like filter(), map(), sorted(), and collect() make data transformations so much cleaner and more declarative compared to nested imperative for-loops:\n\nList<String> activeDevs = developers.stream()\n    .filter(d -> d.getExperience() > 3)\n    .map(Developer::getName)\n    .sorted()\n    .collect(Collectors.toList());\n\nWhat is your favorite Java Streams pattern or collector? ☕💻 #Java #JavaStreams #CleanCode #Programming #Backend`,
        likesCount: 118,
        sharesCount: 42,
      },
      // Post 3: Arjun Rao (Spring Boot REST Layering)
      {
        authorIndex: 12,
        content: `🏗️ Spent today building a high-volume REST API using Spring Boot 3.\n\nThe biggest learning was maintaining strict separation of concerns across layers:\n• @RestController — Handles HTTP requests/responses, request validation (@Valid), and DTO mapping.\n• @Service — Contains pure business domain logic and transaction boundaries (@Transactional).\n• @Repository (Spring Data JPA) — Manages database CRUD queries and derived query methods.\n• Entity Layer — Maps database tables with Hibernate/JPA annotations.\n\nKeep controllers slim and services focused! 🚀 #SpringBoot #Java #RESTAPI #Microservices #Backend`,
        likesCount: 135,
        sharesCount: 48,
      },
      // Post 4: Rahul Mehta (Java Interview Prep & OOP)
      {
        authorIndex: 10,
        content: `🎯 Preparing for Java developer interviews? Don't just memorize textbook OOP definitions.\n\nBuild small real-world projects that actively utilize:\n✅ Inheritance — Shared base behaviors across payment gateways.\n✅ Polymorphism — Dynamic dispatch of strategy processors at runtime.\n✅ Encapsulation — Immutability and protecting internal state with getter methods / Java Records.\n✅ Abstraction — Decoupling repository interfaces from SQL/MongoDB database implementations.\n\nInterviewers love candidates who can explain real architectural trade-offs! 💡 #Java #OOP #CodingInterviews #CareerAdvice #SoftwareEngineering`,
        likesCount: 164,
        sharesCount: 61,
      },
      // Post 5: Neha Kapoor (ArrayList vs LinkedList)
      {
        authorIndex: 11,
        content: `📊 Today I finally understood the difference between ArrayList and LinkedList beyond the textbook definitions.\n\nWhy ArrayList almost always wins in practice:\n• CPU Cache Locality: ArrayList stores elements contiguously in memory, yielding massive L1/L2 cache hit rates.\n• LinkedList has memory overhead for node pointers (prev/next) on every single element.\n• Random access in ArrayList is instantaneous O(1), whereas LinkedList requires O(n) traversal.\n\nUnless you are doing constant head insertions with iterators, default to ArrayList! ☕ #Java #Collections #Performance #DSA #ComputerScience`,
        likesCount: 127,
        sharesCount: 39,
      },
      // Post 6: Marcus Vance (Java 21 Virtual Threads)
      {
        authorIndex: 3,
        content: `☕ Java 21 Virtual Threads (Project Loom) in production: We just migrated our core banking payment gateway from traditional thread pools to Java 21 Virtual Threads on Spring Boot 3.2!\n\nKey Results:\n✅ Handled 50,000 concurrent HTTP requests with near-zero memory bloat.\n✅ Replaced complex reactive WebFlux code with clean, readable synchronous blocking code without sacrificing high throughput.\n✅ CPU utilization dropped by 28% while throughput increased by 2.4x.\n\nJava has never been more exciting and performant. Who else is adopting Java 21 LTS in production? 🚀 #Java #SpringBoot #Backend #SoftwareArchitecture #Java21`,
        media: [
          {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=80',
            title: 'Java 21 Spring Boot Microservices Architecture',
          },
        ],
        likesCount: 189,
        sharesCount: 76,
      },
      // Post 7: Sarah Jenkins (JVM Tuning & ZGC)
      {
        authorIndex: 7,
        content: `🔥 5 Essential JVM Performance Tuning Rules for High-Throughput Java Microservices:\n\n1. Use Generational ZGC (-XX:+UseZGC -XX:+ZGenerational) for sub-millisecond GC pause times on large heaps (>16GB).\n2. Always configure -XX:+AlwaysPreTouch in containerized Kubernetes pods to allocate memory upfront and avoid runtime page fault stalls.\n3. Keep objects short-lived so they die in the Eden space without surviving to the tenured generation.\n4. Avoid unnecessary string allocations in hot execution paths—use StringBuilder or modern Java String Templates.\n5. Profile with JDK Flight Recorder (JFR) & Async-profiler rather than guessing bottleneck locations.\n\nWhat is your go-to JVM configuration for cloud-native Java services? ☕💻 #Java #JVM #Performance #Kubernetes #Microservices`,
        likesCount: 153,
        sharesCount: 64,
      },
      // Post 8: Liam Thorne (Java Microservices & Kafka)
      {
        authorIndex: 8,
        content: `📦 Scaling Event-Driven Microservices with Java & Apache Kafka in Enterprise Financial Systems:\n\nWhen designing distributed event consumers in Java with Spring Kafka:\n• Always enable manual consumer offset acknowledgment (ackMode = MANUAL_IMMEDIATE).\n• Implement Dead Letter Queues (DLQ) with exponential backoff retry listeners (SeekToCurrentErrorHandler).\n• Use Avro schemas with Confluent Schema Registry for strict backward/forward compatibility.\n• Monitor consumer group lag via Micrometer and Prometheus metrics dashboards.\n\nJava's enterprise ecosystem for resilient event streaming remains unmatched. 💡 #Java #Kafka #EventDriven #Microservices #FinTech`,
        media: [
          {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&auto=format&fit=crop&q=80',
          },
        ],
        likesCount: 147,
        sharesCount: 58,
      },
      // Post 9: Devlin Hayes (Clean Architecture in Java)
      {
        authorIndex: 6,
        content: `💡 Clean Architecture & Domain-Driven Design (DDD) in Java:\n\nKeep your core business domain entities completely independent of frameworks (Spring, Hibernate, Jackson).\n\nLayered Structure:\n1. Core Domain Layer (Pure Java POJOs, Records, Value Objects, Domain Events)\n2. Application Layer (Use Cases, Inbound/Outbound Port Interfaces)\n3. Infrastructure Layer (Spring Data JPA Adapters, REST Controllers, Kafka Producers)\n\nThis makes upgrading Spring Boot versions or swapping database technologies effortless. Your business rules should outlive any framework! ☕🏗️ #Java #CleanArchitecture #DDD #SoftwareEngineering`,
        likesCount: 139,
        sharesCount: 51,
      },
      // Post 10: Maya Lin (Java Concurrency & Concurrent Collections)
      {
        authorIndex: 9,
        content: `⚡ Deep dive into Java Concurrency & High-Performance Collections:\n\nDid you know ConcurrentHashMap uses lock striping with fine-grained bucket synchronization rather than whole-table locking?\n\nKey Java Concurrency utilities every Senior Java Engineer should master:\n• CompletableFuture.allOf() for parallel non-blocking asynchronous workflows.\n• StampedLock & ReentrantReadWriteLock for read-heavy cache systems.\n• VarHandle and Atomic primitives for lock-free atomic state mutations.\n• LongAdder instead of AtomicLong for ultra-high contention metrics.\n\nWhat's your favorite concurrent data structure in java.util.concurrent? ☕ #Java #Concurrency #Multithreading #Coding`,
        likesCount: 168,
        sharesCount: 67,
      },
      // Post 11: Karan Shah (Hibernate N+1 Query Problem)
      {
        authorIndex: 14,
        content: `⚠️ How we solved the infamous Hibernate N+1 Query Problem in our Spring Data JPA microservice:\n\nSymptoms: Fetching 100 User orders was executing 101 separate SQL SELECT queries, causing severe database I/O bottlenecks.\n\nSolutions:\n1. Use JOIN FETCH in JPQL queries (\`SELECT u FROM User u JOIN FETCH u.orders\`).\n2. Use @EntityGraph annotations to define ad-hoc fetching graphs dynamically.\n3. Configure \`hibernate.default_batch_fetch_size: 50\` as a global safety net.\n\nAlways monitor generated SQL with datasource proxies in development! 🛠️ #Java #Hibernate #JPA #SQL #DatabasePerformance`,
        likesCount: 132,
        sharesCount: 46,
      },
      // Post 12: Meera Joshi (Modern Java Records & Pattern Matching)
      {
        authorIndex: 15,
        content: `✨ Why Modern Java is a joy to write in 2026:\n\nPattern matching with switch, Record classes for immutable DTOs, and Sealed Classes make domain modeling expressive and bug-free.\n\npublic sealed interface PaymentResult permits Success, InsufficientFunds, GatewayTimeout {}\n\nString message = switch (result) {\n    case Success s -> "Payment of $" + s.amount() + " processed successfully!";\n    case InsufficientFunds f -> "Declined: Short by $" + f.deficit();\n    case GatewayTimeout t -> "Network retry scheduled in " + t.retryAfterMs() + "ms";\n};\n\nNo more boilerplate getters, no more instanceof casts! Java has evolved tremendously. ☕ #Java21 #ModernJava #CleanCode #SpringBoot`,
        likesCount: 175,
        sharesCount: 72,
      },
      // Post 13: Neha Kapoor (Spring Security & JWT Authentication)
      {
        authorIndex: 11,
        content: `🔐 Best practices for implementing stateless JWT Authentication in Spring Boot 3 Security:\n\n1. Use OncePerRequestFilter for the JWT validation chain.\n2. Store secrets in environment variables / HashiCorp Vault, never in application.yml.\n3. Set short-lived Access Tokens (15m) paired with rotating Refresh Tokens stored securely in HttpOnly SameSite cookies.\n4. Handle authentication exceptions explicitly via AuthenticationEntryPoint to return clean JSON error payloads.\n\nSecurity is not an add-on; it must be designed from day one. 🛡️ #Java #SpringSecurity #Cybersecurity #JWT #RESTAPI`,
        likesCount: 141,
        sharesCount: 55,
      },
      // Post 14: Arjun Rao (Exception Handling with @RestControllerAdvice)
      {
        authorIndex: 12,
        content: `💡 Clean global error handling in Spring Boot:\n\nStop wrapping every controller method in messy try-catch blocks. Instead, use a centralized @RestControllerAdvice with @ExceptionHandler methods:\n\n@ExceptionHandler(ResourceNotFoundException.class)\npublic ResponseEntity<ApiError> handleNotFound(ResourceNotFoundException ex) {\n    ApiError error = new ApiError(HttpStatus.NOT_FOUND, ex.getMessage(), Instant.now());\n    return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);\n}\n\nThis keeps controllers clean, ensures consistent RFC 7807 Problem Detail responses, and makes client debugging effortless! ☕ #SpringBoot #Java #Backend #CleanCode`,
        likesCount: 129,
        sharesCount: 38,
      },
      // Post 15: Riya Nair (Java Multithreading & Thread Safety)
      {
        authorIndex: 13,
        content: `🧵 Thread Safety in Java: When to use synchronized vs volatile vs AtomicInteger?\n\n• volatile: Guarantees visibility across CPU cores, but DOES NOT guarantee atomicity for compound operations (like count++).\n• AtomicInteger / AtomicReference: Uses CPU-level Compare-And-Swap (CAS) instructions for lock-free atomic updates.\n• synchronized / ReentrantLock: Guarantees both mutual exclusion and memory visibility when multiple steps must be atomic.\n\nMastering the Java Memory Model (JMM) is essential for senior backend engineers. 💡 #Java #Multithreading #Concurrency #ComputerScience`,
        likesCount: 156,
        sharesCount: 63,
      },
      // Post 16: Rahul Mehta (Maven vs Gradle in Enterprise Java)
      {
        authorIndex: 10,
        content: `📦 Maven vs Gradle for enterprise Java projects in 2026:\n\n• Maven: Highly standardized, declarative XML, predictable lifecycle, zero build script complexity. Great for large teams where consistency is paramount.\n• Gradle: Kotlin DSL, incremental builds, build cache, and daemon execution make it significantly faster for massive multi-module mono-repos.\n\nWhich build tool does your team use for Spring Boot applications? ☕ #Java #Maven #Gradle #DevOps #CICD`,
        likesCount: 108,
        sharesCount: 31,
      },
      // Post 17: Elena Rostova (Hiring announcement)
      {
        authorIndex: 2,
        content: `📢 NovaTech Systems is hiring across multiple engineering teams! We have open roles for:\n\n✨ Senior Java / Spring Boot Microservices Engineers\n✨ Senior Full Stack Engineers (React / Node)\n✨ Lead Frontend Architect\n\nWe offer 100% remote flexibility and competitive equity. Check out our open roles or shoot me a message! #hiring #softwareengineering #remotejobs #java`,
        likesCount: 94,
        sharesCount: 39,
      },
      // Post 18: Alex Rivera (Software Architecture)
      {
        authorIndex: 0,
        content: `🚀 Excited to share our latest engineering milestone! We just redesigned our distributed API gateway using Node.js and Redis clustering, cutting P99 latency by over 45% across 1M+ daily queries.\n\nKey takeaways:\n1. Keep serialization overhead minimal.\n2. Leverage connection pooling effectively.\n3. Benchmark with realistic network latency.\n\nWhat performance optimization strategies have made the biggest difference in your stack recently? 👇`,
        media: [
          {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
            title: 'API Performance Benchmark Dashboard',
          },
        ],
        likesCount: 88,
        sharesCount: 24,
      },
      // Post 19: Priya Sharma (AI / LLMs)
      {
        authorIndex: 1,
        content: `🧠 We just open-sourced our benchmark suite for evaluating RAG (Retrieval-Augmented Generation) pipeline accuracy and hallucination rates!\n\nWhen scaling RAG to 100k+ enterprise technical documents, vector similarity alone isn't enough. Combining dense semantic embeddings with BM25 sparse reranking boosted precision from 72% to 91%.\n\nCheck out the repo and let me know your thoughts! #AI #NLP #MachineLearning #Python`,
        media: [
          {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80',
          },
        ],
        likesCount: 119,
        sharesCount: 47,
      },
      // Post 20: Karan Shah (JDBC Connection Pooling with HikariCP)
      {
        authorIndex: 14,
        content: `⚡ Why HikariCP is the gold standard for JDBC Connection Pooling in Spring Boot:\n\n• Micro-benchmarked byte-code optimizations (fast path execution with minimal thread locking).\n• Zero-overhead connection validation using JDBC4 isValid().\n• Proper connection timeout configuration prevents thread starvation during traffic spikes.\n\nRule of thumb for pool size: \`connections = ((core_count * 2) + effective_spindle_count)\`. More connections does NOT equal more speed! 📊 #Java #JDBC #Databases #SpringBoot #Performance`,
        likesCount: 137,
        sharesCount: 52,
      },
      // Post 21: Meera Joshi (LeetCode & DSA in Java)
      {
        authorIndex: 15,
        content: `💡 My 3-step framework for solving LeetCode Medium/Hard graphs and trees in Java:\n\n1. Identify the pattern: BFS (shortest path / level-order) vs DFS (backtracking / exhaustive search) vs Union-Find (connected components).\n2. Choose optimal data structures: PriorityQueue for Dijkstra, ArrayDeque for FIFO queues instead of LinkedList.\n3. Verify edge cases: Null roots, cycles, single-node trees, and integer overflow with Integer.MAX_VALUE.\n\nConsistency beats cramming every time. What DSA topic took you the longest to master? ☕ #Java #DSA #LeetCode #CodingInterview #Algorithms`,
        likesCount: 162,
        sharesCount: 68,
      },
      // Post 22: Rahul Mehta (Java Microservices Resiliency with Resilience4j)
      {
        authorIndex: 10,
        content: `🛡️ Building fault-tolerant Java microservices with Resilience4j and Spring Cloud:\n\nWhen a downstream service experiences high latency, cascading failures can bring down your entire architecture. Always configure:\n• CircuitBreakers to fail fast and return fallback responses.\n• TimeLimiter to enforce strict 1.5s execution timeouts.\n• Retry with exponential backoff on transient 503 errors.\n• Bulkhead to isolate resource pools across critical vs non-critical endpoints.\n\nResilience is non-negotiable in distributed enterprise software. ☕ #Java #Microservices #Resilience4j #SpringBoot #SystemDesign`,
        likesCount: 145,
        sharesCount: 57,
      },
      // Post 23: Devlin Hayes (Git Best Practices)
      {
        authorIndex: 6,
        content: `🌿 4 Git habits that will make your engineering team love working with you:\n\n1. Write descriptive, imperative commit messages ("Add idempotency check to order processor" not "fixed bug").\n2. Rebase feature branches on main before creating PRs to maintain a clean linear history.\n3. Keep Pull Requests small (< 300 lines of diff) for faster, higher-quality peer code reviews.\n4. Use Git interactive rebase (\`git rebase -i\`) to squash messy WIP commits before merging.\n\nClean git hygiene reflects clean software engineering! 🚀 #Git #GitHub #CleanCode #SoftwareEngineering`,
        likesCount: 158,
        sharesCount: 63,
      },
      // Post 24: Neha Kapoor (SQL Indexing for Java Developers)
      {
        authorIndex: 11,
        content: `🔍 SQL Indexing rules every Java developer writing JPA queries must know:\n\n• An index on (status, created_at) DOES NOT help queries filtering on (created_at, status) due to leftmost prefix matching rules.\n• Functions on columns (e.g. \`WHERE UPPER(email) = ?\`) invalidate standard indexes unless functional indexes are defined.\n• Avoid SELECT * in production—fetch only the columns needed via projection interfaces.\n\nUnderstand your database execution plans! 💾 #Java #SQL #PostgreSQL #Databases #SoftwareEngineering`,
        likesCount: 126,
        sharesCount: 44,
      },
      // Post 25: Admin (Platform Update)
      {
        authorIndex: 16,
        content: `👋 Welcome to CareerLink — "Connect. Grow. Get Hired."\n\nWe have rolled out major full-stack platform features:\n✨ 1-Click Profile Account Switcher\n✨ Repost & Repost with Thoughts\n✨ 4-Second Professional Notification Chime Engine\n✨ Java Developer Community Feed & Deep-Dive Technical Discussions\n✨ Algorithmic 100-Point Transparent Match Scoring\n✨ Full Recruiter ATS Suite\n\nExplore the platform, update your profile, and connect with top engineering talent today! 🌐 #CareerLink #Launch #TechCommunity #Java`,
        media: [
          {
            type: 'image',
            url: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&auto=format&fit=crop&q=80',
          },
        ],
        likesCount: 240,
        sharesCount: 98,
      },
    ];

    for (const p of rawPosts) {
      const author = createdUsers[p.authorIndex];
      const otherUsers = createdUsers.filter((_, idx) => idx !== p.authorIndex);
      const randomLikes = otherUsers.slice(0, Math.floor(Math.random() * 5) + 2).map((u) => u._id);

      const post = await Post.create({
        author: author._id,
        content: p.content,
        media: p.media || [],
        likes: randomLikes,
        sharesCount: p.sharesCount || 0,
      });

      // Add realistic comments
      if (post.likes.length >= 3) {
        await Comment.create({
          targetType: 'Post',
          targetId: post._id,
          author: otherUsers[0]._id,
          content: 'Excellent explanation and technical depth! Really helpful breakdown for the community.',
        });
      }
    }

    console.log('[Seed] Creating direct peer connections...');
    await Connection.create([
      { requester: createdUsers[0]._id, recipient: createdUsers[1]._id, status: 'accepted' },
      { requester: createdUsers[0]._id, recipient: createdUsers[2]._id, status: 'accepted' },
      { requester: createdUsers[0]._id, recipient: createdUsers[3]._id, status: 'accepted' },
      { requester: createdUsers[0]._id, recipient: createdUsers[10]._id, status: 'accepted' },
      { requester: createdUsers[1]._id, recipient: createdUsers[2]._id, status: 'accepted' },
      { requester: createdUsers[10]._id, recipient: createdUsers[11]._id, status: 'accepted' },
      { requester: createdUsers[10]._id, recipient: createdUsers[12]._id, status: 'accepted' },
    ]);

    console.log('[Seed] Database seeding completed successfully with 16 users and 45+ Java & Software Engineering posts!');
    if (require.main === module) {
      process.exit(0);
    }
  } catch (err) {
    console.error('[Seed Error]:', err);
    if (require.main === module) {
      process.exit(1);
    } else {
      throw err;
    }
  }
};

if (require.main === module) {
  seedDatabase();
}

module.exports = { seedDatabase, usersData };
