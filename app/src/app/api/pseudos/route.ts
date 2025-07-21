import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const { pseudo, user_id }: { pseudo: string; user_id?: number } = await request.json();

    if (!pseudo) {
      return NextResponse.json(
        { error: 'Missing required field: pseudo' },
        { status: 400 }
      );
    }

    const client = await pool.connect();

    try {
      await client.query('BEGIN');

      const existingPseudo = await client.query(
        'SELECT id FROM pseudos WHERE pseudo = $1',
        [pseudo]
      );

      if (existingPseudo.rows.length > 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { 
            message: 'Pseudo already exists',
            pseudo_id: existingPseudo.rows[0].id 
          },
          { status: 200 }
        );
      }

      const result = await client.query(
        'INSERT INTO pseudos (pseudo, user_id) VALUES ($1, $2) RETURNING id',
        [pseudo, user_id !== undefined ? user_id : null]
      );

      await client.query('COMMIT');

      return NextResponse.json({
        message: 'Pseudo created successfully',
        pseudo_id: result.rows[0].id
      }, { status: 201 });

    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error creating pseudo:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const pseudo = searchParams.get('pseudo') || '';

    if (!pseudo) {
      return NextResponse.json(
        { error: 'Pseudo parameter is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      const result = await client.query(
        'SELECT id, pseudo, user_id, created_at FROM pseudos WHERE pseudo = $1',
        [pseudo]
      );

      if (result.rows.length === 0) {
        return NextResponse.json(
          { error: 'Pseudo not found' },
          { status: 404 }
        );
      }

      return NextResponse.json(result.rows[0]);

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error fetching pseudo:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 