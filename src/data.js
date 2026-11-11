// All page content lives here, so editing copy never means touching components.
// Wrap text in **double asterisks** to highlight it.

export const profile = {
  firstName: 'Paramjeet',
  lastName: 'Singh',
  status: 'Building at Wit By Bit, Kolkata',
  email: 'preetbajwa2907@gmail.com',
  phone: '+91 9693512499',
  phoneDisplay: '+91 96935 12499',
  linkedin: 'https://www.linkedin.com/in/paramjeet-singh-dev',
  github: 'https://github.com/Paramjeet29',
}

export const roles = ['React.js', 'Next.js', 'TypeScript', 'Node.js', 'enterprise']

export const stack = [
  'React.js',
  'Next.js',
  'TypeScript',
  'JavaScript',
  'Node.js',
  'Tailwind CSS',
  'PostgreSQL',
  'REST APIs',
  'Express',
  'ISO 27001',
]

export const stats = [
  { value: 40, suffix: '%', text: 'faster grievance form submission on the World Bank system' },
  { value: 35, suffix: '%', text: 'less manual workflow time across 500+ assets in Decorum' },
  { value: 30, suffix: '%', text: 'fewer configuration steps for 1,000+ E-Register users' },
  { value: 50, suffix: '+', text: 'high-risk vulnerabilities fixed in an ISO 27001 push' },
]

export const jobs = [
  {
    when: 'Nov 2024 – Present',
    where: 'Kolkata, India',
    company: 'Wit By Bit',
    role: 'Software Developer',
    current: true,
    points: [
      'Built and maintained frontend modules across three enterprise apps: Decorum and E-Register in React.js, and the World Bank Grievance System in Next.js, for **10,000+ active users**.',
      'Built reusable React components and the core asset scheduling interfaces for Decorum, with analytics that cut manual workflow time **35%** across 500+ assets.',
      'Delivered the World Bank Grievance System frontend in Next.js, cutting average form submission time **40%** and improving case tracking for 5,000+ end users.',
      'Engineered configurable share-form triggers and automated conditional actions in E-Register, removing **30%** of manual configuration steps for 1,000+ users.',
      'Part of a 3-member ISO 27001 compliance team that mitigated **50+** high-risk vulnerabilities and reduced audit findings by 40%.',
    ],
  },
  {
    when: 'Mar 2024 – Sep 2024',
    where: 'Remote',
    company: 'DuBuddy',
    role: 'Software Development Engineer Intern',
    points: [
      "Built web modules for India's first student-centric super app, serving **40,000+ users**.",
      'Improved the event organizer and admin dashboard used by a 50+ member internal team.',
      'Developed and deployed **20+ REST APIs** for a cross-platform CUET Eligibility Checker, improving response times 30% under load.',
    ],
  },
  {
    when: 'Jul 2023 – Aug 2023',
    where: 'Singrauli, India',
    company: 'Reliance Sasan Power Ltd.',
    role: 'Software Developer Intern',
    points: [
      'Built the React.js interface for an enterprise Complaint Log System, improving responsiveness and workflow efficiency by **15%**.',
      'Worked in a 3-member team on ticket management, contributing to a **20%** drop in average resolution time.',
    ],
  },
]

export const projects = [
  {
    kicker: 'Form & workflow platform',
    title: 'E-Register',
    text: 'Reusable components for an enterprise form platform. Admins set up triggers and conditional actions in a few clicks, without writing code.',
    tags: ['React.js', 'TypeScript', 'REST APIs'],
    metric: '30%',
    metricText: 'fewer manual configuration steps',
    demo: 'trigger',
  },
  {
    kicker: 'Asset scheduling & analytics',
    title: 'Decorum',
    text: 'Scheduling, tracking and reporting screens that give operations teams a clear view of 500+ assets and take the manual work out of planning.',
    tags: ['React.js', 'TypeScript', 'Analytics'],
    metric: '35%',
    metricText: 'less manual processing time',
    demo: 'bars',
  },
  {
    kicker: 'Public-sector case management',
    title: 'World Bank Grievance System',
    text: 'I designed and built the frontend in Next.js. Shorter forms and clearer case tracking for more than 5,000 end users.',
    tags: ['Next.js', 'React.js', 'REST APIs'],
    metric: '40%',
    metricText: 'faster form submission',
    demo: 'steps',
  },
]

export const skills = [
  {
    name: 'Frontend',
    desc: 'What I build interfaces with.',
    items: [
      { name: 'React.js', note: 'Decorum, E-Register and the Reliance Complaint Log System. My main tool for reusable, component-driven UI.' },
      { name: 'Next.js', note: 'The World Bank Grievance System frontend, used by 5,000+ end users.' },
      { name: 'TypeScript', note: 'Typed components in E-Register and Decorum, so large enterprise forms stay safe to change.' },
      { name: 'JavaScript ES6+', note: 'The base of everything I write on the web.' },
      { name: 'HTML5' },
      { name: 'CSS3' },
      { name: 'Tailwind CSS' },
      { name: 'Material UI' },
    ],
  },
  {
    name: 'UI engineering',
    desc: 'How I keep interfaces fast and maintainable.',
    items: [
      { name: 'Reusable components', note: 'Shared building blocks for Decorum and E-Register, so new screens ship faster.' },
      { name: 'REST API integration', note: 'Connecting enterprise frontends to live data across all three Wit By Bit products.' },
      { name: 'Responsive design' },
      { name: 'State management' },
      { name: 'JSON' },
      { name: 'Debugging' },
      { name: 'Performance optimization' },
    ],
  },
  {
    name: 'Backend',
    desc: 'Server-side tools I use when a feature needs them.',
    items: [
      { name: 'REST API development', note: 'Built and deployed 20+ REST APIs at DuBuddy for the CUET Eligibility Checker, improving response times by 30%.' },
      { name: 'Node.js' },
      { name: 'Express.js' },
      { name: 'Hono' },
      { name: 'Strapi' },
      { name: 'Sequelize' },
    ],
  },
  {
    name: 'Databases',
    desc: 'Where the data lives.',
    items: [{ name: 'PostgreSQL' }, { name: 'MySQL' }, { name: 'MongoDB' }, { name: 'SQL' }],
  },
  {
    name: 'Tools',
    desc: 'Day-to-day tooling.',
    items: [{ name: 'Git' }, { name: 'GitHub' }, { name: 'Selenium' }],
  },
  {
    name: 'Fundamentals',
    desc: 'The foundation under the frameworks.',
    items: [
      { name: 'ISO 27001', note: 'Part of a 3-member compliance team that mitigated 50+ high-risk vulnerabilities and cut audit findings by 40%.' },
      { name: 'Data structures' },
      { name: 'Algorithms' },
      { name: 'OOP' },
    ],
  },
]

export const education = {
  school: 'Graphic Era Deemed To Be University',
  degree: 'B.Tech in Computer Science and Engineering',
  years: '2020 – 2024',
}
