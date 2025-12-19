// lib/rag/skills.ts

/**
 * Skill synonym mapping for normalization
 */
export const SKILL_SYNONYMS: Record<string, string[]> = {
  // Frontend Frameworks
  "react": ["reactjs", "react.js", "react js"],
  "nextjs": ["next.js", "next", "next js"],
  "vue": ["vuejs", "vue.js", "vue js"],
  "angular": ["angularjs", "angular.js"],

  // Languages
  "javascript": ["js", "es6", "es2015", "ecmascript"],
  "typescript": ["ts"],
  "python": ["py", "python3"],

  // CSS Frameworks
  "tailwind": ["tailwindcss", "tailwind css"],
  "bootstrap": ["bootstrap5", "bootstrap 5", "bootstrap4"],
  "css": ["css3", "stylesheet"],
  "html": ["html5"],

  // Backend
  "nodejs": ["node.js", "node", "node js"],
  "express": ["expressjs", "express.js"],
  "php": ["php7", "php8"],

  // Database
  "mysql": ["my sql"],
  "postgresql": ["postgres", "psql", "pg"],
  "mongodb": ["mongo", "mongo db"],
  "firebase": ["firestore", "firebase db"],
  "sql": ["structured query language"],

  // Tools
  "git": ["version control"],
  "github": ["gh"],
  "docker": ["containerization", "containers"],
  "figma": ["figma design"],

  // Cloud
  "aws": ["amazon web services"],
  "gcp": ["google cloud", "google cloud platform"],
  "vercel": ["vercel deploy"],
};

/**
 * Skill categories for grouping
 */
export const SKILL_CATEGORIES: Record<string, string[]> = {
  frontend: [
    "react", "nextjs", "vue", "angular", "svelte",
    "html", "css", "javascript", "typescript",
    "tailwind", "bootstrap", "sass", "less",
    "redux", "zustand", "mobx"
  ],
  backend: [
    "nodejs", "express", "nestjs", "fastify",
    "php", "laravel", "python", "django", "flask",
    "java", "spring", "go", "rust", "ruby", "rails"
  ],
  database: [
    "mysql", "postgresql", "mongodb", "firebase",
    "redis", "elasticsearch", "sql", "nosql",
    "prisma", "sequelize", "typeorm"
  ],
  devops: [
    "docker", "kubernetes", "aws", "gcp", "azure",
    "ci/cd", "jenkins", "github actions", "terraform"
  ],
  tools: [
    "git", "github", "gitlab", "bitbucket",
    "figma", "sketch", "adobe xd",
    "vscode", "postman", "insomnia"
  ],
  mobile: [
    "react native", "flutter", "swift", "kotlin",
    "ionic", "capacitor"
  ],
  soft: [
    "problem-solving", "teamwork", "communication",
    "time-management", "leadership", "adaptability"
  ]
};

/**
 * Normalize a skill to its canonical form
 */
export function normalizeSkill(skill: string): string {
  const lower = skill.toLowerCase().trim()
    .replace(/[^a-z0-9\s\-\.]/g, '')
    .replace(/\s+/g, ' ');

  // Check if it's an alias
  for (const [canonical, aliases] of Object.entries(SKILL_SYNONYMS)) {
    if (aliases.includes(lower) || canonical === lower) {
      return canonical;
    }
  }

  // Return cleaned version if no alias found
  return lower.replace(/[\s\-\.]/g, '');
}

/**
 * Extract skills from job text
 */
export function extractSkillsFromText(text: string): string[] {
  const lower = text.toLowerCase();
  const found: string[] = [];

  // Check all known skills
  const allSkills = Object.values(SKILL_CATEGORIES).flat();

  for (const skill of allSkills) {
    // Check canonical name
    if (lower.includes(skill)) {
      found.push(skill);
      continue;
    }

    // Check variations
    const variations = SKILL_SYNONYMS[skill] || [];
    for (const variant of variations) {
      if (lower.includes(variant)) {
        found.push(skill);
        break;
      }
    }
  }

  return [...new Set(found)];
}
