import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/clickhouse';
import { QueryResult } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: matchId } = await params;

    // get match info
    const matchResult = await client.query({
      query: `
        SELECT * FROM gvg_matches 
        WHERE match_id = {match_id:UInt64}
      `,
      query_params: { match_id: matchId }
    });

    const matchRows = await matchResult.json() as QueryResult<Record<string, unknown>>;
    if (matchRows.data.length === 0) {
      return NextResponse.json(
        { error: 'match not found' },
        { status: 404 }
      );
    }

    const match = matchRows.data[0] as Record<string, unknown>;

    // get players
    const playersResult = await client.query({
      query: `
        SELECT 
          mp.*,
          p.pseudo as pseudo_name_resolved,
          '' as username
        FROM match_players mp
        LEFT JOIN pseudos p ON mp.pseudo_id = p.id
        WHERE mp.match_id = {match_id:UInt64}
        ORDER BY mp.team_id, mp.player_number
      `,
      query_params: { match_id: matchId }
    });

    const players = await playersResult.json() as QueryResult<Record<string, unknown>>;

    // get npcs
    const npcsResult = await client.query({
      query: `
        SELECT * FROM match_npcs 
        WHERE match_id = {match_id:UInt64}
        ORDER BY team_id, agent_id
      `,
      query_params: { match_id: matchId }
    });

    const npcs = await npcsResult.json() as QueryResult<Record<string, unknown>>;

    // get guilds info
    const guild1Result = await client.query({
      query: 'SELECT * FROM guilds WHERE id = {id:UInt32}',
      query_params: { id: match.guild1_id }
    });

    const guild2Result = await client.query({
      query: 'SELECT * FROM guilds WHERE id = {id:UInt32}',
      query_params: { id: match.guild2_id }
    });

    const guild1Data = await guild1Result.json() as QueryResult<Record<string, unknown>>;
    const guild2Data = await guild2Result.json() as QueryResult<Record<string, unknown>>;

    // structure response similar to original format
    const response = {
      match_info: {
        match_id: match.match_id,
        map_id: match.map_id,
        map_name: match.map_name,
        flux: match.flux,
        occasion: match.occasion,
        match_date: match.match_date,
        duration: match.duration_formatted,
        original_duration: match.match_original_duration,
        end_time_ms: match.match_end_time_ms,
        end_time_formatted: match.match_end_time_formatted,
        winner_party_id: match.winner_party_id,
        winner_guild_id: match.winner_guild_id
      },
      guilds: {
        [match.guild1_id as string]: {
          id: match.guild1_id,
          name: match.guild1_name,
          tag: match.guild1_tag,
          rank: match.guild1_rank,
          rating: match.guild1_rating,
          faction: match.guild1_faction,
          faction_points: match.guild1_faction_points,
          qualifier_points: match.guild1_qualifier_points,
          full_data: guild1Data.data[0] || null
        },
        [match.guild2_id as string]: {
          id: match.guild2_id,
          name: match.guild2_name,
          tag: match.guild2_tag,
          rank: match.guild2_rank,
          rating: match.guild2_rating,
          faction: match.guild2_faction,
          faction_points: match.guild2_faction_points,
          qualifier_points: match.guild2_qualifier_points,
          full_data: guild2Data.data[0] || null
        }
      },
      parties: {
        "1": {
          PLAYER: players.data.filter((p) => (p as Record<string, unknown>).team_id === 1),
          OTHER: npcs.data.filter((n) => (n as Record<string, unknown>).team_id === 1)
        },
        "2": {
          PLAYER: players.data.filter((p) => (p as Record<string, unknown>).team_id === 2),
          OTHER: npcs.data.filter((n) => (n as Record<string, unknown>).team_id === 2)
        }
      },
      stats: {
        total_players: players.data.length,
        total_npcs: npcs.data.length,
        team1_players: players.data.filter((p) => (p as Record<string, unknown>).team_id === 1).length,
        team2_players: players.data.filter((p) => (p as Record<string, unknown>).team_id === 2).length
      }
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('match fetch error:', error);
    return NextResponse.json(
      { error: 'failed to fetch match data' },
      { status: 500 }
    );
  }
}