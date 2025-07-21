import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import CreateMatchRequest from '@/types/create-match-request';
import Match from '@/types/match';

function parseDurationToSeconds(duration: string): number {
  if (!duration) return 0;
  const parts = duration.split(':').map(Number);
  if (parts.length === 2) {
    return parts[0] * 60 + parts[1];
  } else if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

export async function POST(request: NextRequest) {
  try {
    const body: CreateMatchRequest = await request.json();
    const {
      map_id,
      flux,
      day,
      month,
      year,
      occasion,
      match_duration,
      match_original_duration,
      match_end_time_ms,
      match_end_time_formatted,
      winner_party_id,
      parties,
      guilds
    } = body;

    if (!parties || !guilds) {
      return NextResponse.json({ error: 'parties and guilds are required' }, { status: 400 });
    }

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const guildIdMap = new Map();
      for (const [guildKey, guildRaw] of Object.entries(guilds)) {
        const guild = guildRaw as any;
        let dbGuildId = guild.id;
        const existingGuild = await client.query('SELECT id FROM guilds WHERE id = $1', [guild.id]);
        if (existingGuild.rows.length === 0) {
          const result = await client.query(
            'INSERT INTO guilds (id, name, tag) VALUES ($1, $2, $3) RETURNING id',
            [guild.id, guild.name, guild.tag]
          );
          dbGuildId = result.rows[0].id;
        }
        guildIdMap.set(guildKey, dbGuildId);
      }

      const matchDate = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const winnerGuildId = (() => {
        for (const [partyId, partyRaw] of Object.entries(parties)) {
          const party = partyRaw as any;
          if (parseInt(partyId) === winner_party_id) {
            const firstPlayer = party.PLAYER && party.PLAYER.length > 0 ? party.PLAYER[0] : null;
            if (firstPlayer && firstPlayer.guild_id && guildIdMap.has(String(firstPlayer.guild_id))) {
              return guildIdMap.get(String(firstPlayer.guild_id));
            }
          }
        }
        return null;
      })();

      const matchResult = await client.query(
        `INSERT INTO gvg_match (
          map_name, duration_ut, winner_guild_id, match_date, 
          description, vods, flux, occasion, match_original_duration, match_end_time_ms, match_end_time_formatted
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
        [
          map_id ? String(map_id) : null,
          parseDurationToSeconds(match_duration || ''),
          winnerGuildId,
          matchDate,
          null,
          null,
          flux || null,
          occasion || null,
          match_original_duration || null,
          match_end_time_ms || null,
          match_end_time_formatted || null
        ]
      );
      const matchId = matchResult.rows[0].id;

      for (const [guildKey, guildRaw] of Object.entries(guilds)) {
        const guild = guildRaw as any;
        await client.query(
          `INSERT INTO guild_match_states (
            match_id, guild_id, rank, rating, faction, 
            faction_point, qualifier_point, cape_trim
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            matchId,
            guild.id,
            guild.rank || 0,
            guild.rating || 0,
            guild.faction || 0,
            guild.faction_points || 0,
            guild.qualifier_points || 0,
            (guild.cape && guild.cape.trim) || 0
          ]
        );
      }

      for (const [partyId, partyRaw] of Object.entries(parties)) {
        const party = partyRaw as any;
        if (party.PLAYER) {
          for (const player of party.PLAYER) {
            let pseudoId;
            const existingPseudo = await client.query('SELECT id FROM pseudos WHERE id = $1', [player.id]);
            if (existingPseudo.rows.length > 0) {
              pseudoId = existingPseudo.rows[0].id;
            } else {
              const result = await client.query(
                'INSERT INTO pseudos (id, pseudo, user_id) VALUES ($1, $2, $3) RETURNING id',
                [player.id, player.encoded_name, null]
              );
              pseudoId = result.rows[0].id;
            }
            await client.query(
              `INSERT INTO match_ag_players (
                match_id, guild_id, pseudo_id, primary_stat, secondary_stat, level, team_id, player_number, model_id, gadget_id, encoded_name, skill_template_code, used_skills
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
              [
                matchId,
                player.guild_id || null,
                pseudoId,
                player.primary || 0,
                player.secondary || 0,
                player.level || null,
                player.team_id || null,
                player.player_number || null,
                player.model_id || null,
                player.gadget_id || null,
                player.encoded_name || null,
                player.skill_template_code || null,
                player.used_skills || []
              ]
            );
          }
        }
        if (party.OTHER) {
          for (const other of party.OTHER) {
            await client.query(
              `INSERT INTO match_ag_others (
                match_id, guild_id, other_id, primary_stat, secondary_stat, level, team_id, player_number, model_id, gadget_id, encoded_name, skill_template_code, used_skills
              ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
              [
                matchId,
                other.guild_id || null,
                other.id,
                other.primary || 0,
                other.secondary || 0,
                other.level || null,
                other.team_id || null,
                other.player_number || null,
                other.model_id || null,
                other.gadget_id || null,
                other.encoded_name || null,
                other.skill_template_code || null,
                other.used_skills || []
              ]
            );
          }
        }
      }

      await client.query('COMMIT');
      return NextResponse.json({ message: 'Match created successfully', match_id: matchId }, { status: 201 });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error creating match:', error);
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating match:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const matchId = searchParams.get('id') || '';

    if (!matchId) {
      return NextResponse.json(
        { error: 'Match ID parameter is required' },
        { status: 400 }
      );
    }

    const client = await pool.connect();
    
    try {
      const matchResult = await client.query(
        `SELECT m.*, g.name as winner_guild_name, g.tag as winner_guild_tag 
         FROM gvg_match m 
         LEFT JOIN guilds g ON m.winner_guild_id = g.id 
         WHERE m.id = $1`,
        [matchId]
      );

      if (matchResult.rows.length === 0) {
        return NextResponse.json(
          { error: 'Match not found' },
          { status: 404 }
        );
      }

      const match: Match = matchResult.rows[0];

      const guildStatesResult = await client.query(
        `SELECT gms.*, g.name as guild_name, g.tag as guild_tag 
         FROM guild_match_states gms 
         JOIN guilds g ON gms.guild_id = g.id 
         WHERE gms.match_id = $1`,
        [matchId]
      );

      const playersResult = await client.query(
        `SELECT mp.*, p.pseudo, g.name as guild_name, g.tag as guild_tag 
         FROM match_ag_players mp 
         JOIN pseudos p ON mp.pseudo_id = p.id 
         LEFT JOIN guilds g ON mp.guild_id = g.id 
         WHERE mp.match_id = $1`,
        [matchId]
      );

      const othersResult = await client.query(
        `SELECT mo.*, g.name as guild_name, g.tag as guild_tag 
         FROM match_ag_others mo 
         LEFT JOIN guilds g ON mo.guild_id = g.id 
         WHERE mo.match_id = $1`,
        [matchId]
      );

      return NextResponse.json({
        match,
        guild_states: guildStatesResult.rows,
        players: playersResult.rows,
        others: othersResult.rows
      });

    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error fetching match:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 