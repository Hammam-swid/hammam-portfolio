export interface Experience {
  id: string;
  company: {
    en: string;
    ar: string;
  };
  position: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  startDate: string; // YYYY-MM format
  endDate?: string; // YYYY-MM format or undefined for current
  technologies: string[];
  location?: {
    en: string;
    ar: string;
  };
}

export const experiences: Experience[] = [
  {
    id: "1",
    company: {
      en: "Tech Solutions Inc.",
      ar: "شركة التقنية المتطورة",
    },
    position: {
      en: "Senior Full-Stack Developer",
      ar: "مطور ويب أول متكامل",
    },
    description: {
      en: "Led development of scalable web applications using MERN stack. Implemented CI/CD pipelines and mentored junior developers. Improved application performance by 40% through optimization.",
      ar: "قيادة تطوير تطبيقات ويب قابلة للتوسع باستخدام MERN. تنفيذ خطوط CI/CD وتوجيه المطورين المبتدئين. تحسين أداء التطبيقات بنسبة 40٪ من خلال التحسين.",
    },
    startDate: "2022-01",
    technologies: ["React", "Node.js", "MongoDB", "AWS", "Docker"],
    location: {
      en: "Remote",
      ar: "عن بعد",
    },
  },
  {
    id: "2",
    company: {
      en: "Digital Agency",
      ar: "الوكالة الرقمية",
    },
    position: {
      en: "Full-Stack Developer",
      ar: "مطور ويب متكامل",
    },
    description: {
      en: "Developed and maintained multiple client projects using modern web technologies. Collaborated with designers and product managers to deliver high-quality solutions.",
      ar: "تطوير وصيانة مشاريع متعددة للعملاء باستخدام تقنيات الويب الحديثة. التعاون مع المصممين ومديري المنتجات لتقديم حلول عالية الجودة.",
    },
    startDate: "2020-06",
    endDate: "2021-12",
    technologies: ["React", "Node.js", "PostgreSQL", "Express", "Redux"],
    location: {
      en: "New York, USA",
      ar: "نيويورك، الولايات المتحدة",
    },
  },
  {
    id: "3",
    company: {
      en: "Startup Ventures",
      ar: "شركة ناشئة",
    },
    position: {
      en: "Frontend Developer",
      ar: "مطور واجهة أمامية",
    },
    description: {
      en: "Built responsive and interactive user interfaces using React and modern CSS. Worked closely with UX team to implement pixel-perfect designs.",
      ar: "بناء واجهات مستخدم متجاوبة وتفاعلية باستخدام React و CSS الحديث. العمل بشكل وثيق مع فريق UX لتنفيذ تصاميم دقيقة.",
    },
    startDate: "2019-03",
    endDate: "2020-05",
    technologies: ["React", "JavaScript", "CSS", "HTML", "Git"],
    location: {
      en: "San Francisco, USA",
      ar: "سان فرانسيسكو، الولايات المتحدة",
    },
  },
];

export const getCurrentExperience = () => {
  return experiences.find((exp) => !exp.endDate);
};

export const getExperienceDuration = (
  startDate: string,
  endDate?: string,
): number => {
  const start = new Date(startDate);
  const end = endDate ? new Date(endDate) : new Date();
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    (end.getMonth() - start.getMonth());
  return months;
};
