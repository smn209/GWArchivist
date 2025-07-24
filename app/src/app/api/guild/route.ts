import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/clickhouse';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get('limit');

    let query = 'SELECT id, name, tag FROM guilds';
    let query_params: any = {};

    if (limit) {
      query += ' ORDER BY id DESC LIMIT {limit:UInt32}';
      query_params.limit = Number(limit);
    }

    const result = await client.query({ query, query_params });
    const rows = await result.json();

    return NextResponse.json(rows.data);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch guilds' }, { status: 500 });
  }
}