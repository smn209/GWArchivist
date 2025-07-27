import { NextResponse } from 'next/server'
import client from '@/lib/clickhouse'

export async function GET() {
  try {
    await client.query({ query: 'SELECT 1' })
    return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ status: 'error', error: (error as Error).message }, { status: 500 })
  }
}
