import { NextResponse } from 'next/server'
import pool from '@/lib/db'

export async function GET() {
  try {
    await pool.query('SELECT 1')
    return NextResponse.json({ status: 'ok' }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ status: 'error', error: (error as Error).message }, { status: 500 })
  }
}
