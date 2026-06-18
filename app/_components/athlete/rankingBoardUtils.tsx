import { compareRankingEntries } from '@/lib/utils/rankings';

type RankingCategoryInfo = {
  key?: string;
  discipline?: string;
  ageGroup?: string;
  gender?: string;
  weightCategory?: string;
};

type RankingEntry = {
  rankingCategory?: RankingCategoryInfo;
  totalPoints?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
};

function titleCase(value: string) {
  return String(value || '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

export function formatRankingCategory(entry: { rankingCategory?: RankingCategoryInfo }) {
  const category = entry?.rankingCategory;
  if (!category) return 'Athlete Rankings';

  // Technical ranking category — don't show kata/kumite/age labels
  if (category.key === 'technical-ranking' || category.discipline === 'technical-ranking') {
    return 'Technical Ranking';
  }

  const bits = [
    category.ageGroup ? titleCase(category.ageGroup) : null,
    category.gender ? titleCase(category.gender) : null,
    category.discipline ? titleCase(category.discipline) : null,
    category.weightCategory ? titleCase(category.weightCategory) : null,
  ].filter(Boolean);

  return bits.join(' · ') || 'Athlete Rankings';
}

export function buildRankingBoards(entries: RankingEntry[] = []): { key: string; label: string; items: (RankingEntry & { categoryRank: number })[] }[] {
  const buckets = new Map();

  for (const entry of entries) {
    const key = entry?.rankingCategory?.key || 'general';
    const bucket = buckets.get(key) || [];
    bucket.push(entry);
    buckets.set(key, bucket);
  }

  // Check if any entries have actual tournament points
  const hasAnyTournamentPoints = entries.some((e) => Number(e.totalPoints || 0) > 0);

  // If no tournament points exist, merge everything into a single "Technical Ranking" board
  if (!hasAnyTournamentPoints) {
    const allEntries = entries.slice();
    const sorted = [...allEntries].sort(compareRankingEntries);
    return [{
      key: 'technical-ranking',
      label: 'Technical Ranking',
      items: sorted.map((item, index) => ({
        ...item,
        categoryRank: index + 1,
      })),
    }];
  }

  // When tournaments exist, separate belt-progression from tournament categories
  return Array.from(buckets.entries())
    .map(([key, bucket]) => {
      const sorted = [...bucket].sort(compareRankingEntries);
      return {
        key,
        label: formatRankingCategory(sorted[0]),
        items: sorted.map((item, index) => ({
          ...item,
          categoryRank: index + 1,
        })),
      };
    })
    .sort((a, b) => {
      // Put tournament categories first, technical-ranking last
      if (a.key === 'technical-ranking' && b.key !== 'technical-ranking') return 1;
      if (b.key === 'technical-ranking' && a.key !== 'technical-ranking') return -1;
      const aScore = a.items[0]?.totalPoints || 0;
      const bScore = b.items[0]?.totalPoints || 0;
      return bScore - aScore;
    });
}
