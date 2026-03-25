import { NextResponse } from 'next/server';
import { searchAthletesByName } from '../../../../lib/data/athletes';
import { enforceRateLimit } from '@/lib/server/api';

export async function GET(request) {
  try {
    enforceRateLimit(request, {
      name: 'athlete-search',
      limit: 60,
      windowMs: 5 * 60 * 1000,
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
