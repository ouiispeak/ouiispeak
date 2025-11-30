import { parseLessonSlug, humanizeLessonSlug, type LessonInfo } from '@/lib/lessonSlug';

const MODULE_ORDER = ['A0', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

export type GroupedLessonsResult = {
  levels: Array<{
    level: string; // e.g. "A0"
    modules: Array<{
      moduleKey: string; // e.g. "module-1"
      moduleNumber: string; // e.g. "1" (for display)
      lessons: LessonInfo[];
    }>;
  }>;
  otherLessons: LessonInfo[];
};

function isTemplateLesson(slug: string): boolean {
  return (
    slug.startsWith('slide-template-ref/') ||
    slug.startsWith('slide-templates/slide-creator-model')
  );
}

function getLessonNumber(lesson: string): number {
  const match = lesson.match(/lesson-(\d+)/);
  if (match && match[1]) {
    return Number.parseInt(match[1], 10);
  }
  return 0;
}

function getModuleNumber(moduleKey: string): number {
  const match = moduleKey.match(/module-(\d+)/);
  if (match && match[1]) {
    return Number.parseInt(match[1], 10);
  }
  return 0;
}

export function groupLessonsForIndex(slugs: string[]): GroupedLessonsResult {
  // 1. Filter out template/dev lessons and templates/blank
  const featuredLessons = slugs.filter(
    (slug: string) => slug !== 'templates/blank' && !isTemplateLesson(slug),
  );

  // 2. Group lessons by level and module
  type LessonsByModule = { [moduleKey: string]: LessonInfo[] };
  type LessonsByLevel = { [level: string]: LessonsByModule };
  const lessonsByLevelAndModule: LessonsByLevel = {};
  const otherLessons: LessonInfo[] = [];

  featuredLessons.forEach((slug: string) => {
    const lessonInfo = parseLessonSlug(slug);
    if (!lessonInfo) {
      // Handle non-standard lessons (like slide-templates)
      otherLessons.push({
        slug,
        module: 'Other',
        lesson: slug,
        displayName: humanizeLessonSlug(slug),
        moduleKey: 'other',
      });
      return;
    }

    if (!lessonsByLevelAndModule[lessonInfo.module]) {
      lessonsByLevelAndModule[lessonInfo.module] = {};
    }
    if (!lessonsByLevelAndModule[lessonInfo.module][lessonInfo.moduleKey]) {
      lessonsByLevelAndModule[lessonInfo.module][lessonInfo.moduleKey] = [];
    }
    lessonsByLevelAndModule[lessonInfo.module][lessonInfo.moduleKey].push(lessonInfo);
  });

  // 3. Sort lessons within each module numerically
  const levelKeys: string[] = Object.keys(lessonsByLevelAndModule);
  for (const level of levelKeys) {
    const moduleKeys: string[] = Object.keys(lessonsByLevelAndModule[level]);
    for (const moduleKey of moduleKeys) {
      lessonsByLevelAndModule[level][moduleKey].sort((a: LessonInfo, b: LessonInfo) => {
        return getLessonNumber(a.lesson) - getLessonNumber(b.lesson);
      });
    }
  }

  // 4. Build result structure matching UI needs, ordered by MODULE_ORDER
  const levels = MODULE_ORDER.map((level: string) => {
    const levelModules = lessonsByLevelAndModule[level];
    if (!levelModules) {
      return null;
    }

    const moduleKeys: string[] = Object.keys(levelModules);
    if (moduleKeys.length === 0) {
      return null;
    }

    // Sort modules by module number
    const sortedModuleKeys = moduleKeys.slice().sort((a: string, b: string) => {
      return getModuleNumber(a) - getModuleNumber(b);
    });

    const modules = sortedModuleKeys.map((moduleKey: string) => {
      const match = moduleKey.match(/module-(\d+)/);
      const moduleNumber = match && match[1] ? match[1] : '';
      return {
        moduleKey,
        moduleNumber,
        lessons: levelModules[moduleKey],
      };
    });

    return {
      level,
      modules,
    };
  }).filter((item): item is NonNullable<typeof item> => item !== null);

  return {
    levels,
    otherLessons,
  };
}

