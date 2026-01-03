import { prisma } from './client';
import { OutlookCall, Prisma } from '@prisma/client';

export type OutlookFilter = {
  year?: number;
  institution?: string;
  theme?: string;
  themeCategory?: string;
  conviction?: string;
  limit?: number;
  page?: number;
  search?: string;
};

export async function getOutlooks(filter: OutlookFilter) {
  const { year, institution, theme, themeCategory, conviction, limit = 50, page = 1, search } = filter;
  const skip = (page - 1) * limit;

  const where: Prisma.OutlookCallWhereInput = {};

  if (year) where.year = year;
  if (institution) where.institution = { contains: institution }; // Flexible search
  if (theme) where.theme = { contains: theme };
  if (themeCategory) where.themeCategory = themeCategory;
  if (conviction) where.convictionTier = conviction;
  if (search) {
    where.OR = [
      { callText: { contains: search } },
      { theme: { contains: search } },
      { institution: { contains: search } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.outlookCall.findMany({
      where,
      take: limit,
      skip,
      orderBy: { id: 'asc' }, // Stable ordering
    }),
    prisma.outlookCall.count({ where }),
  ]);

  return { data, total, page, limit };
}

export async function getOutlookById(id: number) {
  return prisma.outlookCall.findUnique({
    where: { id },
  });
}

export async function getStats() {
  const [total, years, themes, institutions] = await Promise.all([
    prisma.outlookCall.count(),
    prisma.outlookCall.groupBy({
      by: ['year'],
      _count: { _all: true },
      orderBy: { year: 'desc' },
    }),
    prisma.outlookCall.groupBy({
      by: ['themeCategory'],
      _count: { _all: true },
      // @ts-ignore: Prisma orderBy syntax for aggregated groups can be tricky in TS
      orderBy: { _count: { _all: 'desc' } },
    }),
    prisma.outlookCall.groupBy({
      by: ['institutionCanonical'],
      _count: { _all: true },
      // @ts-ignore
      orderBy: { _count: { _all: 'desc' } },
    }),
  ]);

  return {
    total_records: total,
    // @ts-ignore: _count property existence
    years: years.map(y => ({ year: y.year, count: y._count?._all || 0 })),
    // @ts-ignore
    themes: themes.map(t => ({ theme: t.themeCategory, count: t._count?._all || 0 })),
    // @ts-ignore
    institutions: institutions.map(i => ({ institution: i.institutionCanonical, count: i._count?._all || 0 })),
  };
}

export async function getCompareStats(year1: number, year2: number) {
  const [y1Themes, y2Themes, y1Inst, y2Inst] = await Promise.all([
     prisma.outlookCall.groupBy({
       by: ['themeCategory'],
       where: { year: year1 },
       _count: { _all: true },
     }),
     prisma.outlookCall.groupBy({
       by: ['themeCategory'],
       where: { year: year2 },
       _count: { _all: true },
     }),
     prisma.outlookCall.groupBy({
       by: ['institutionCanonical', 'themeCategory'],
       where: { year: year1 },
     }),
     prisma.outlookCall.groupBy({
       by: ['institutionCanonical', 'themeCategory'],
       where: { year: year2 },
     }),
  ]);

  // Process Themes
  // @ts-ignore
  const themes1Map = new Map(y1Themes.map(t => [t.themeCategory, t._count?._all || 0]));
  // @ts-ignore
  const themes2Map = new Map(y2Themes.map(t => [t.themeCategory, t._count?._all || 0]));
  
  // @ts-ignore: Set iteration downlevel handled by tsconfig
  const allThemes = new Set([...themes1Map.keys(), ...themes2Map.keys()]);
  const themes_emerged: string[] = [];
  const themes_extinct: string[] = [];
  const themes_grew: { theme: string; delta: number }[] = [];
  const themes_declined: { theme: string; delta: number }[] = [];

  allThemes.forEach(theme => {
    const c1 = themes1Map.get(theme) || 0;
    const c2 = themes2Map.get(theme) || 0;
    const delta = c2 - c1;

    if (c1 === 0 && c2 > 0) themes_emerged.push(theme);
    else if (c1 > 0 && c2 === 0) themes_extinct.push(theme);
    else if (delta > 0) themes_grew.push({ theme, delta });
    else if (delta < 0) themes_declined.push({ theme, delta });
  });

  // Process Institutions (Change in themes covered)
  // This is complex, simplification:
  // For each institution, list themes in Y1 vs Y2
  const instMap1 = new Map<string, string[]>();
  y1Inst.forEach(i => {
    const list = instMap1.get(i.institutionCanonical) || [];
    list.push(i.themeCategory);
    instMap1.set(i.institutionCanonical, list);
  });
  
  const instMap2 = new Map<string, string[]>();
  y2Inst.forEach(i => {
    const list = instMap2.get(i.institutionCanonical) || [];
    list.push(i.themeCategory);
    instMap2.set(i.institutionCanonical, list);
  });

  const institutional_changes = [];
  const allInst = new Set([...instMap1.keys(), ...instMap2.keys()]);
  
  for (const inst of allInst) {
    const t1 = instMap1.get(inst) || [];
    const t2 = instMap2.get(inst) || [];
    // Only include if there's a change or significant data
    institutional_changes.push({
      institution: inst,
      year1_themes: t1,
      year2_themes: t2,
    });
  }

  return {
    year1,
    year2,
    themes_emerged,
    themes_extinct,
    themes_grew: themes_grew.sort((a,b) => b.delta - a.delta),
    themes_declined: themes_declined.sort((a,b) => a.delta - b.delta),
    institutional_changes: institutional_changes.slice(0, 50) // Limit to top 50 to avoid massive payload
  };
}
