export interface Project {
  id: string;
  title: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  technologies: string[];
  image: string;
  demoUrl?: string;
  githubUrl?: string;
  featured: boolean;
}

export const projects: Project[] = [
  {
    id: "1",
    title: {
      en: "E-Commerce Platform",
      ar: "منصة التجارة الإلكترونية",
    },
    description: {
      en: "A full-stack e-commerce platform with React, Node.js, MongoDB, and Stripe integration. Features include user authentication, product management, shopping cart, and secure payments.",
      ar: "منصة تجارة إلكترونية متكاملة باستخدام React و Node.js و MongoDB وتكامل Stripe. تشمل الميزات المصادقة، إدارة المنتجات، عربة التسوق، والدفع الآمن.",
    },
    technologies: ["React", "Node.js", "MongoDB", "Express", "Stripe", "Redux"],
    image: "/projects/ecommerce.jpg",
    demoUrl: "https://demo.example.com",
    githubUrl: "https://github.com/yourusername/project",
    featured: true,
  },
  {
    id: "2",
    title: {
      en: "Task Management App",
      ar: "تطبيق إدارة المهام",
    },
    description: {
      en: "A collaborative task management application with real-time updates using Socket.io. Built with MERN stack featuring drag-and-drop functionality and team collaboration.",
      ar: "تطبيق إدارة مهام تعاوني مع تحديثات فورية باستخدام Socket.io. تم بناؤه باستخدام MERN مع ميزة السحب والإفلات والتعاون الجماعي.",
    },
    technologies: ["React", "Node.js", "MongoDB", "Socket.io", "TypeScript"],
    image: "/projects/taskmanager.jpg",
    demoUrl: "https://demo.example.com",
    githubUrl: "https://github.com/yourusername/project",
    featured: true,
  },
  {
    id: "3",
    title: {
      en: "Social Media Dashboard",
      ar: "لوحة تحكم وسائل التواصل",
    },
    description: {
      en: "An analytics dashboard for social media metrics with interactive charts and real-time data visualization. Integrates with multiple social media APIs.",
      ar: "لوحة تحكم تحليلية لمقاييس وسائل التواصل الاجتماعي مع مخططات تفاعلية وتصور البيانات الفوري. يتكامل مع عدة واجهات برمجية لوسائل التواصل.",
    },
    technologies: ["React", "Chart.js", "Node.js", "PostgreSQL", "REST API"],
    image: "/projects/dashboard.jpg",
    demoUrl: "https://demo.example.com",
    githubUrl: "https://github.com/yourusername/project",
    featured: true,
  },
  {
    id: "4",
    title: {
      en: "Blog Platform",
      ar: "منصة التدوين",
    },
    description: {
      en: "A modern blogging platform with markdown support, user authentication, and comment system. Built with Next.js for optimal SEO performance.",
      ar: "منصة تدوين حديثة مع دعم Markdown ومصادقة المستخدمين ونظام التعليقات. تم بناؤها باستخدام Next.js لأداء SEO الأمثل.",
    },
    technologies: ["Next.js", "MongoDB", "TypeScript", "TailwindCSS"],
    image: "/projects/blog.jpg",
    githubUrl: "https://github.com/yourusername/project",
    featured: false,
  },
];
