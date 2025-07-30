import { NextResponse } from 'next/server';
import client from '@/lib/clickhouse';
import { QueryResult } from '@/types';

export async function GET() {
  try {
    const query = `
      SELECT match_id 
      FROM gvg_matches 
      ORDER BY match_date DESC, match_id DESC
    `;
    
    const result = await client.query({ query });
    const matches = (await result.json() as QueryResult<{ match_id: string }>).data;
    
    return NextResponse.json(matches.map(match => match.match_id));
  } catch {
    return NextResponse.json({ error: 'failed to fetch match IDs' }, { status: 500 });
  }
}