import { NextResponse } from 'next/server';
import { searchAthletesByName } from '@/lib/server/repositories/athletes';
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

  if (!query || query.trim().length < 2) {
    return NextResponse.json({ results: [] });
  }

  const results = searchAthletesByName(query.trim());
  return NextResponse.json({ results: results.slice(0, 6) });
}
