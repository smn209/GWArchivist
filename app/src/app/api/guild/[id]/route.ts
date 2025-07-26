import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/clickhouse';
import { QueryResult } from '@/types';

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id: rawId } = await params;
    let id = decodeURIComponent(rawId);
    if (id?.startsWith('"') && id.endsWith('"')) {
      id = id.slice(1, -1);
    }
    
    // single query with priority order: id > name > tag
    const query = `
      SELECT id, name, tag FROM guilds 
      WHERE id = toUInt32OrZero({id:String}) OR name = {id:String} OR tag = {id:String}
      ORDER BY 
        CASE 
          WHEN id = toUInt32OrZero({id:String}) AND toUInt32OrZero({id:String}) > 0 THEN 1
          WHEN name = {id:String} THEN 2
          WHEN tag = {id:String} THEN 3
        END
      LIMIT 1
    `;
    
    const result = await client.query({ 
      query, 
      query_params: { id } 
    });
    
    const rows = await result.json() as QueryResult<Record<string, unknown>>;
    
    if (rows.data.length === 0) {
      return NextResponse.json({ error: 'Guild not found' }, { status: 404 });
    }
    
    return NextResponse.json(rows.data[0]);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch guild' }, { status: 500 });
  }
}