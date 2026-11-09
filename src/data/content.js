export const portfolioData = {
  meta: {
    name: "Mubassir Shah",
    role: "AI Engineer",
    title: "Mubassir Shah — AI Engineer",
    description: "Personal portfolio of Mubassir Shah. AI/ML student and indie SaaS builder. Creator of Siffty. Open to AI Engineer, AI/ML, and Agentic AI roles 2026.",
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
      prefix: "Shipping real AI, one",
      words: ["feature", "test", "release"]
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
      prefix: "Open to AI Engineer roles. Let's",
      words: ["talk", "build", "ship"]
    }
  },

  hero: {
    badge: "OPEN TO AI ENGINEER ROLES • 2026 •",
    col1: "AI ENGINEER / PYTHON · FASTAPI · NEXT.JS",
    col2: "BASED IN LAKHNADON, MP, INDIA / OPEN TO AI-ML ROLES 2026",
    title: "Mubassir.",
    verticalText: "MUBASSIR SHAH — AI ENGINEER — PORTFOLIO 2026",
    indexNum: "001"
  },

  about: {
    index: "001",
    label: "About",
    headlinePrefix: "Shipping real AI, one",
    rotatingWords: ["feature", "test", "release"],
    headlineSuffix: "at a time",
    p1: "I design, build and ship AI-powered software. My main project is Siffty, an AI platform that turns Instagram DMs into organised leads and replies. I built it in under six months and it was approved by Meta.",
    p2: "I work with Python, FastAPI, Node.js and Next.js, and I connect LLM APIs with task-based routing, failover and automated tests. I care about reliability and cost: moving one classification task to a faster model cut Gemini token use by over 90 percent.",
    p3: "I am now going deeper into Agentic AI, RAG and Deep Learning, and I am adding an AI agent workflow to Siffty. I am looking for an AI Engineer role where I can build and ship AI features with a team.",
    atAGlance: [
      { label: "Target role", value: "AI Engineer" },
      { label: "Education", value: "B.Sc. Computer Science, 2023 to 2026, CGPA 6.8" },
      { label: "Core stack", value: "Python, FastAPI, Node.js, Next.js" },
      { label: "Learning now", value: "Agentic AI, RAG" },
      { label: "Proof", value: "Siffty, in use by early-access creators" }
    ],
    proofCards: [
      { num: "01", title: "Meta-approved product", text: "Siffty passed Meta App Review (Sept 2026)" },
      { num: "02", title: "Production AI design", text: "task-based routing and automatic failover between AI providers" },
      { num: "03", title: "Cost-aware", text: "over 90 percent lower Gemini token use after moving classification to Cloudflare Workers AI" },
      { num: "04", title: "Tested", text: "five automated test suites, all passing" }
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
      status: "Live in Early Access",
      image: "assets/projects/siffty-1600.webp",
      imageMobile: "assets/projects/siffty-800.webp"
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
      status: "Precursor Prototype to Siffty",
      image: "assets/projects/dealradar-1600.webp",
      imageMobile: "assets/projects/dealradar-800.webp"
    },
    {
      id: "aegischat",
      num: "03",
      title: "AegisChat",
      tagline: "Zero-Knowledge Hardware-Backed Messenger",
      category: "Privacy & Security / Mobile",
      year: "2025",
      tech: ["Flutter", "FastAPI", "Python", "AES-256-GCM", "WebSockets"],
      desc: "Zero-knowledge, hardware-backed end-to-end encrypted mobile messaging system. Preserves message confidentiality with on-device AES-256-GCM encryption and a FastAPI opaque ciphertext relay.",
      link: "https://github.com/dev-mubassir/AegisChat",
      status: "Prototype & Architecture",
      image: "assets/projects/aegischat-1600.webp",
      imageMobile: "assets/projects/aegischat-800.webp"
    },
    {
      id: "citykirana",
      num: "04",
      title: "CityKirana",
      tagline: "Hyperlocal Grocery Delivery Platform",
      category: "Web Commerce",
      year: "Earlier",
      tech: ["Vanilla JavaScript", "HTML5", "CSS3", "Local Storage"],
      desc: "Lightweight, zero-framework eCommerce web application engineered for local grocery delivery in Lakhnadon. Fast loading on 3G connections.",
      link: "https://github.com/dev-mubassir",
      status: "Deployed Locally",
      image: "assets/projects/citykirana-1600.webp",
      imageMobile: "assets/projects/citykirana-800.webp"
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
        year: "Earlier",
        title: "CityKirana",
        desc: "Earlier: built CityKirana, a vanilla JavaScript grocery delivery site for Lakhnadon."
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
        year: "Oct 2026",
        title: "Workers AI Edge Optimization",
        desc: "Moved Siffty's DM classification to Cloudflare Workers AI, cutting Gemini token use by over 90 percent."
      },
      {
        year: "NEXT",
        isUpcoming: true,
        tag: "UPCOMING",
        title: "Siffty major update",
        desc: "Adding an AI agent workflow, improving the label system and adding more automation. I am learning Agentic AI as I build it."
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
