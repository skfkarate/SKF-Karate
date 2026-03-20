import { compareRankingEntries } from '@/lib/utils/rankings';

function titleCase(value) {
  return String(value || '')
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

export function formatRankingCategory(entry) {
  const category = entry?.rankingCategory;
  if (!category) return 'Athlete Rankings';

  const bits = [
    category.ageGroup ? titleCase(category.ageGroup) : null,
    category.gender ? titleCase(category.gender) : null,
    category.discipline ? titleCase(category.discipline) : null,
    category.weightCategory ? titleCase(category.weightCategory) : null,
  ].filter(Boolean);

  return bits.join(' · ') || 'Athlete Rankings';
}

export function buildRankingBoards(entries = []) {
  const buckets = new Map();

  for (const entry of entries) {
    const key = entry?.rankingCategory?.key || 'general';
    const bucket = buckets.get(key) || [];
    bucket.push(entry);
    buckets.set(key, bucket);
  }

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
      const aScore = a.items[0]?.totalPoints || 0;
      const bScore = b.items[0]?.totalPoints || 0;
      return bScore - aScore;
    });
}
