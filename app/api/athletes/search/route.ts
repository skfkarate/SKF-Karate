import { NextResponse } from 'next/server';
import {
  getFeaturedAthleteSearchResultsLive,
  searchAthletesByNameLive,
} from '@/lib/server/repositories/athletes-live';
import { enforceRateLimit } from '@/lib/server/api';

export async function GET(request: Request) {
  try {
    await enforceRateLimit(request, {
      name: 'athlete_search',
      limit: 10,
      windowMs: 60000, // 1 minute
    });
  } catch (error) {
    return NextResponse.json(
      { results: [], error: error.message },
      { status: error.status || 429, headers: error.headers }
    );
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q') || '';
  const featured = searchParams.get('featured') === '1';
  const limit = Number.parseInt(searchParams.get('limit') || '6', 10);

  if (featured) {
    const results = await getFeaturedAthleteSearchResultsLive(
      Number.isFinite(limit) ? Math.max(1, Math.min(limit, 24)) : 6
    );
    return NextResponse.json({ results });
  }

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  const results = await searchAthletesByNameLive(query.trim());
  return NextResponse.json({ results: results.slice(0, 6) });
}
