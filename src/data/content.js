export const portfolioData = {
  meta: {
    name: "Mubassir Shah",
    role: "AI Product Builder & Engineer",
    title: "Mubassir Shah — AI Product Builder & Software Engineer",
    description: "Personal portfolio of Mubassir Shah. AI/ML student and indie SaaS builder. Creator of Siffty. Open to AI Product, AI/ML, Generative AI, and Agentic AI roles 2026.",
    url: "https://dev-mubassir.github.io/my-port/",
    location: "Lakhnadon, Seoni, MP, India",
    email: "mubassirrr2005@gmail.com",
    github: "https://github.com/dev-mubassir",
    githubUsername: "dev-mubassir",
    linkedin: "https://linkedin.com/in/mubassir-shah",
    instagram: "https://instagram.com/mubassir.shah_",
    resumeUrl: "assets/Mubassir_Shah_Resume.pdf"
  },

  rotators: {
    hero: {
      prefix: "I build AI that",
      words: ["ships", "scales", "sells", "works"]
    },
    about: {
      prefix: "Student by degree, builder by",
      words: ["habit", "choice", "night", "design"]
    },
    projects: {
      prefix: "Things I have",
      words: ["built", "shipped", "tested", "broken"]
    },
    skills: {
      prefix: "My stack, always",
      words: ["learning", "growing", "shipping"]
    },
    contact: {
      prefix: "Let's build something",
      words: ["useful", "fast", "smart", "real"]
    }
  },

  hero: {
    badge: "AVAILABLE FOR WORK • AI / ML • 2026 •",
    col1: "AI PRODUCT BUILDER / PYTHON · FASTAPI · NEXT.JS",
    col2: "BASED IN LAKHNADON, MP, INDIA / OPEN TO AI-ML ROLES 2026",
    title: "mubassir.",
    verticalText: "MUBASSIR SHAH — AI PRODUCT BUILDER — PORTFOLIO 2026",
    indexNum: "001"
  },

  about: {
    index: "001",
    label: "PROFILE & BACKGROUND",
    headlinePrefix: "Student by degree, builder by",
    degree: "B.Sc. Computer Science (2023–2026)",
    institution: "Govt. Swami Vivekanand College, Lakhnadon",
    cgpa: "6.8 CGPA",
    location: "Lakhnadon, Seoni District, Madhya Pradesh, India",
    focus: "Python & Deep Learning",
    targetRoles: [
      "AI Product Manager / Engineer",
      "AI / ML Engineer",
      "Generative AI Specialist",
      "Agentic AI Engineer"
    ],
    narrative: [
      "I am an indie builder based in Lakhnadon, Madhya Pradesh. I study Computer Science and spend my days and nights shipping production software.",
      "My core focus is Python, Deep Learning, and building practical AI agents that solve immediate operational bottlenecks.",
      "I do not stop at prototypes. I architect complete full-stack SaaS systems with Python, FastAPI/Flask, Node.js backends, robust database models, and resilient AI API failover chains.",
      "I learn by shipping real code to real users. When launch day comes, I craft motion design and launch videos using state-of-the-art AI video tools."
    ],
    highlights: [
      { num: "01", label: "Autonomous Builder", text: "End-to-end development from zero to Meta-approved deployment." },
      { num: "02", label: "Production AI", text: "Multi-model routing, fallback pipelines, and real-time inference." },
      { num: "03", label: "Clean Engineering", text: "Automated test suites, strict data isolation, and low latency." }
    ]
  },

  siffty: {
    index: "002",
    tagline: "FLAGSHIP CASE STUDY",
    name: "Siffty",
    website: "https://siffty.com",
    instagram: "https://instagram.com/siffty.dev",
    instagramHandle: "@siffty.dev",
    summary: "AI Instagram DM intelligence SaaS designed for Indian creators and growing brands. Automatically uncovers brand sponsorship deals, qualifies high-intent leads, and provides automated customer support.",
    timeline: "Built in under 6 months. Official Meta App Review approval achieved in September 2026.",
    stack: [
      "Next.js",
      "React",
      "Node.js",
      "Express",
      "Socket.io",
      "Prisma",
      "PostgreSQL",
      "Cloudflare Workers AI",
      "Google Gemini",
      "OpenAI",
      "xAI"
    ],
    architecture: {
      steps: [
        { id: "client", name: "Instagram DM Webhook / Client", desc: "Real-time incoming DM events received via Meta Graph API." },
        { id: "api", name: "Node.js & Express API Gateway", desc: "Token authentication, schema validation, and queue ingestion." },
        { id: "router", name: "Plan-Based AI Router", desc: "Determines subscription tiers, priority, and token quotas." },
        { id: "primary", name: "Primary: Cloudflare Workers AI", desc: "Edge classification model handling bulk triage in ~430ms." },
        { id: "fallback", name: "Fallback: Gemini / OpenAI / xAI", desc: "Triggered on edge timeout, rate limit, or complex reasoning." },
        { id: "database", name: "Prisma & PostgreSQL", desc: "Stores sanitized chat threads with strict creator data isolation." }
      ]
    },
    metrics: [
      { value: "99.6%", label: "Primary Model Success", sub: "Last 500 inference calls served by Cloudflare Workers AI" },
      { value: "~430ms", label: "Median Latency", sub: "Real-time response time for creator DM triage" },
      { value: ">90%", label: "Token Cost Savings", sub: "Reduced reliance on external commercial tokens via edge tier" },
      { value: "700k+", label: "Creator Reach", sub: "In early access use, including an Indian creator with 700k followers" }
    ],
    testing: [
      "General SaaS core validation",
      "Automated auto-reply loop suite",
      "Multi-provider AI failover suite",
      "Thread deletion and GDPR compliance",
      "Creator data isolation enforcement"
    ]
  },

  projects: [
    {
      id: "siffty",
      num: "01",
      title: "Siffty",
      tagline: "AI Instagram DM Intelligence Platform",
      category: "AI SaaS / Indie Product",
      year: "2026",
      tech: ["Next.js", "Node.js", "Workers AI", "Gemini", "Prisma", "Postgres"],
      desc: "Meta-approved AI DM triage engine for creators and businesses. Automatically classifies incoming messages into sponsorships, high-value leads, and support queries.",
      link: "https://siffty.com",
      status: "Live in Early Access"
    },
    {
      id: "dealradar",
      num: "02",
      title: "DealRadar",
      tagline: "AI Email & DM Sponsorship Scanner",
      category: "AI Utility / Scanner",
      year: "2025",
      tech: ["Python", "FastAPI", "OpenAI API", "Regex Parsers"],
      desc: "An intelligent scanner engineered to surface high-paying brand sponsorship deals buried inside creator inboxes, extracting deliverables and proposed budgets.",
      link: "https://github.com/dev-mubassir",
      status: "Precursor Prototype to Siffty"
    },
    {
      id: "citykirana",
      num: "03",
      title: "CityKirana",
      tagline: "Hyperlocal Grocery Delivery Platform",
      category: "Web Commerce",
      year: "2024",
      tech: ["Vanilla JavaScript", "HTML5", "CSS3", "Local Storage"],
      desc: "Lightweight, zero-framework eCommerce web application tailored for local grocery and essentials ordering in Lakhnadon. Fast loading on 3G connections.",
      link: "https://github.com/dev-mubassir",
      status: "Deployed Locally"
    },
    {
      id: "skyjump",
      num: "04",
      title: "Sky Jump",
      tagline: "HTML5 Canvas Arcade Experience",
      category: "Game Development",
      year: "2023",
      tech: ["HTML5 Canvas", "JavaScript ES6", "Web Audio API"],
      desc: "Physics-based vertical arcade jumper built purely in vanilla JS and canvas. Features responsive collision physics, procedural platform generation, and high-score tracking.",
      link: "https://github.com/dev-mubassir",
      status: "Complete Playable Build"
    }
  ],

  skills: {
    index: "004",
    headlinePrefix: "My stack, always",
    marqueeItems: [
      "Python",
      "FastAPI",
      "Flask",
      "Next.js",
      "React",
      "Node.js",
      "Express",
      "Prisma",
      "PostgreSQL",
      "Socket.io",
      "PyTorch",
      "Hugging Face",
      "LangChain",
      "RAG Architecture",
      "LLM Integrations",
      "Deep Learning",
      "Generative AI",
      "Agentic AI",
      "Cloudflare Workers AI",
      "Google Gemini",
      "OpenAI",
      "Motion Design"
    ],
    philosophy: {
      headline: "How I Work",
      steps: [
        { title: "Build with AI Tools", text: "I leverage leading AI coding assistants, foundational models, and automation workflows to compress development cycles from months to days." },
        { title: "Test Thoroughly", text: "Automated test suites ensure every edge case is handled: failover paths, chat data isolation, memory bounds, and latency budgets." },
        { title: "Debug Systematically", text: "Every error log is a clue. I dissect failure points with structured telemetry, root-cause isolation, and minimal reproduction cases." },
        { title: "Ship Without Delay", text: "Software has value only in user hands. I prioritize production deployment, user feedback loops, and measurable real-world outcomes." }
      ]
    }
  },

  timeline: {
    index: "005",
    title: "Trajectory",
    milestones: [
      {
        year: "2023",
        title: "Started B.Sc. Computer Science",
        desc: "Enrolled at Govt. Swami Vivekanand College in Lakhnadon. Immersed in foundational algorithms, data structures, and Python programming."
      },
      {
        year: "2024",
        title: "Full-Stack Development & Local Solutions",
        desc: "Engineered CityKirana and Sky Jump, exploring client-side performance, state management, and real-time canvas rendering."
      },
      {
        year: "2025",
        title: "Deep Learning & DealRadar",
        desc: "Shifted focus towards neural networks, PyTorch, Hugging Face, and building DealRadar to extract sponsorship intent with LLMs."
      },
      {
        year: "2026",
        title: "Built and Shipped Siffty",
        desc: "Architected Siffty in under six months, integrating Cloudflare Workers AI with Gemini fallback and multi-tenant creator dashboards."
      },
      {
        year: "Sept 2026",
        title: "Meta App Review Approved",
        desc: "Passed Meta's rigorous App Review for Instagram Graph API access, validating enterprise-grade security and user data privacy."
      },
      {
        year: "2026+",
        title: "Targeting AI Product & AI/ML Roles",
        desc: "Ready to bring autonomous builder mindset, production AI integration skills, and fast execution to visionary engineering teams."
      }
    ]
  },

  contact: {
    index: "006",
    headlinePrefix: "Let's build something",
    subhead: "Available for full-time AI Product, AI/ML, and Generative AI roles in 2026.",
    email: "mubassirrr2005@gmail.com",
    location: "Lakhnadon, Madhya Pradesh, India (IST)",
    links: [
      { name: "GitHub", handle: "dev-mubassir", url: "https://github.com/dev-mubassir" },
      { name: "LinkedIn", handle: "in/mubassir-shah", url: "https://linkedin.com/in/mubassir-shah" },
      { name: "Instagram", handle: "@mubassir.shah_", url: "https://instagram.com/mubassir.shah_" },
      { name: "Email", handle: "mubassirrr2005@gmail.com", url: "mailto:mubassirrr2005@gmail.com" }
    ]
  }
};
