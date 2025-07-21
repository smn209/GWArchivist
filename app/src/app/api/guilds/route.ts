import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { key, name, tag } = await request.json();

    if (!key || !name || !tag) {
      return NextResponse.json(
        { error: 'Missing required fields: key, name, tag' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const existingGuild = await client.query(
        'SELECT id FROM guilds WHERE name = $1 OR key = $2',
        [name, key]
      );

      if (existingGuild.rows.length > 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { 
            message: 'Guild already exists',
            guild_id: existingGuild.rows[0].id 
          },
          { status: 200 }
        );
      }

      const result = await client.query(
        'INSERT INTO guilds (key, name, tag) VALUES ($1, $2, $3) RETURNING id',
        [key, name, tag]
      );

      await client.query('COMMIT');

      return NextResponse.json({
        message: 'Guild created successfully',
        guild_id: result.rows[0].id
      }, { status: 201 });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error creating guild:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    const key = searchParams.get('key');

    if (!name && !key) {
      return NextResponse.json(
        { error: 'Name or key parameter is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      let result;
      if (name) {
        result = await client.query(
          'SELECT id, key, name, tag FROM guilds WHERE name = $1',
          [name]
        );
      } else {
        result = await client.query(
          'SELECT id, key, name, tag FROM guilds WHERE key = $1',
          [key]
        );
      }

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Guild not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(result.rows[0]);

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error fetching guild:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 