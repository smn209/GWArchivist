import { NextRequest, NextResponse } from 'next/server';
import client from '@/lib/clickhouse';
import { MatchData, QueryResult } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const data: MatchData = await request.json();
    const matchDate = new Date(data.year, data.month - 1, data.day);
    
    const additionalInfo = {
      flux: data.flux || null,
      credits: data.credits || null,
      added_to_website: data.added_to_website || null,
      description: data.description || null,
      vod_urls: Array.isArray(data.vod_urls) ? data.vod_urls : []
    };
    // extract unique pseudos
    const pseudos = new Set<string>();
    Object.values(data.parties).forEach(party => {
      party.PLAYER.forEach(player => {
        pseudos.add(player.encoded_name);
      });
    });

    // insert pseudos if not exists
    const pseudoIds = new Map<string, number>();
    for (const pseudo of pseudos) {
      const existingPseudo = await client.query({
        query: 'SELECT id FROM pseudos WHERE pseudo = {pseudo:String}',
        query_params: { pseudo }
      });
      
      const rows = await existingPseudo.json() as QueryResult<{ id: number }>;
      if (rows.data.length > 0) {
        pseudoIds.set(pseudo, rows.data[0].id);
      } else {
        const newId = Math.floor(Math.random() * 1000000) + Date.now();
        await client.insert({
          table: 'pseudos',
          values: [{
            pseudo,
            user_id: null,
            created_at: new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0]
          }],
          format: 'JSONEachRow'
        });
        const newPseudo = await client.query({
          query: 'SELECT id FROM pseudos WHERE pseudo = {pseudo:String} ORDER BY created_at DESC LIMIT 1',
          query_params: { pseudo }
        });
        const newRows = await newPseudo.json() as QueryResult<{ id: number }>;
        pseudoIds.set(pseudo, newRows.data[0].id);
      }
    }

    // ensure guilds exist and get their database IDs
    const guildDbIds = new Map<number, number>();
    for (const [matchGuildId, guildData] of Object.entries(data.guilds)) {
      const existingGuild = await client.query({
        query: 'SELECT id FROM guilds WHERE name = {name:String}',
        query_params: { name: guildData.name }
      });
      
      const rows = await existingGuild.json() as QueryResult<{ id: number }>;
      if (rows.data.length === 0) {
        await client.insert({
          table: 'guilds',
          values: [{
            name: guildData.name,
            tag: guildData.tag,
            created_at: new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0]
          }],
          format: 'JSONEachRow'
        });
        const newGuild = await client.query({
          query: 'SELECT id FROM guilds WHERE name = {name:String} ORDER BY created_at DESC LIMIT 1',
          query_params: { name: guildData.name }
        });
        const newRows = await newGuild.json() as QueryResult<{ id: number }>;
        guildDbIds.set(parseInt(matchGuildId), newRows.data[0].id);
      } else {
        guildDbIds.set(parseInt(matchGuildId), rows.data[0].id);
      }
    }

    const guild1 = data.guilds['1'];
    const guild2 = data.guilds['2'];
    const guild1DbId = guildDbIds.get(1)!;
    const guild2DbId = guildDbIds.get(2)!;

    const now = Date.now();
    const ns = typeof process !== 'undefined' && process.hrtime ? process.hrtime()[1] : Math.floor(Math.random() * 1000);
    const matchId = BigInt(now * 1000 + (ns % 1000));

    // insert match
    await client.insert({
      table: 'gvg_matches',
      values: [{
        match_id: matchId.toString(),
        map_id: data.map_id,
        map_name: data.map_name || 'Unknown',
        flux: data.flux,
        occasion: data.occasion,
        match_date: matchDate.toISOString().split('T')[0],
        match_datetime: matchDate.toISOString().split('T')[0] + ' ' + matchDate.toTimeString().split(' ')[0],
        duration_seconds: timeToSeconds(data.match_duration),
        duration_formatted: data.match_duration,
        match_original_duration: data.match_original_duration,
        match_end_time_ms: data.match_end_time_ms,
        match_end_time_formatted: data.match_end_time_formatted,
        winner_party_id: data.winner_party_id,
        winner_guild_id: data.winner_party_id === 1 ? guild1DbId : guild2DbId,
        guild1_id: guild1DbId,
        guild1_name: guild1.name,
        guild1_tag: guild1.tag,
        guild1_rank: guild1.rank,
        guild1_rating: guild1.rating,
        guild1_faction: guild1.faction,
        guild1_faction_points: guild1.faction_points,
        guild1_qualifier_points: guild1.qualifier_points,
        guild1_country: guild1.country,
        guild2_id: guild2DbId,
        guild2_name: guild2.name,
        guild2_tag: guild2.tag,
        guild2_rank: guild2.rank,
        guild2_rating: guild2.rating,
        guild2_faction: guild2.faction,
        guild2_faction_points: guild2.faction_points,
        guild2_qualifier_points: guild2.qualifier_points,
        guild2_country: guild2.country,
        state: 0,
        description: additionalInfo.description,
        vods: additionalInfo.vod_urls,
        credits: additionalInfo.credits,
        added_to_website: additionalInfo.added_to_website,
        created_at: new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0]
      }],
      format: 'JSONEachRow'
    });

    // insert players
    const players: Record<string, unknown>[] = [];
    Object.values(data.parties).forEach(party => {
      party.PLAYER.forEach(player => {
        const dbGuildId = guildDbIds.get(player.guild_id)!;
        players.push({
          match_id: matchId.toString(),
          agent_id: player.id,
          pseudo_id: pseudoIds.get(player.encoded_name),
          pseudo_name: player.encoded_name,
          guild_id: dbGuildId, 
          team_id: player.team_id,
          party_id: player.team_id,
          player_number: player.player_number,
          model_id: player.model_id,
          gadget_id: player.gadget_id,
          primary_profession: player.primary,
          secondary_profession: player.secondary,
          level: player.level,
          encoded_name: player.encoded_name,
          skill_template_code: player.skill_template_code,
          used_skills: player.used_skills,
          created_at: new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0]
        });
      });
    });

    if (players.length > 0) {
      await client.insert({
        table: 'match_players',
        values: players,
        format: 'JSONEachRow'
      });
    }

    // insert npcs
    const npcs: Record<string, unknown>[] = [];
    Object.values(data.parties).forEach(party => {
      party.OTHER.forEach(other => {
        npcs.push({
          match_id: matchId.toString(),
          agent_id: other.id,
          team_id: other.team_id,
          model_id: other.model_id,
          gadget_id: other.gadget_id,
          primary_profession: other.primary,
          secondary_profession: other.secondary,
          level: other.level,
          encoded_name: other.encoded_name,
          skill_template_code: other.skill_template_code,
          used_skills: other.used_skills,
          created_at: new Date().toISOString().split('T')[0] + ' ' + new Date().toTimeString().split(' ')[0]
        });
      });
    });

    if (npcs.length > 0) {
      await client.insert({
        table: 'match_npcs',
        values: npcs,
        format: 'JSONEachRow'
      });
    }

    return NextResponse.json({ 
      success: true, 
      match_id: matchId.toString(),
      players_inserted: players.length,
      npcs_inserted: npcs.length
    });

  } catch (error) {
    console.error('ingestion error:', error);
    return NextResponse.json(
      { error: 'failed to process match data' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const matchId = searchParams.get('match_id');
    const matchIds = searchParams.get('match_ids');
    
    if (matchIds) {
      // multiple matches detailed view
      const idsArray = matchIds.split(',').map(id => id.trim()).filter(id => id);
      
      if (idsArray.length === 0) {
        return NextResponse.json({ error: 'no valid match IDs provided' }, { status: 400 });
      }

      const placeholders = idsArray.map((_, index) => `{match_id_${index}:String}`).join(',');
      const queryParams = idsArray.reduce((acc, id, index) => {
        acc[`match_id_${index}`] = id;
        return acc;
      }, {} as Record<string, string>);

      const query = `
        SELECT 
          m.*
        FROM gvg_matches m
        WHERE m.match_id IN (${placeholders})
        ORDER BY m.match_date DESC, m.match_id DESC
      `;
      
      const matchResult = await client.query({
        query,
        query_params: queryParams
      });
      
      const matchesData = (await matchResult.json() as QueryResult<Record<string, unknown>>).data;
      
      if (matchesData.length === 0) {
        return NextResponse.json([]);
      }

      // get players for all matches
      const playersQuery = `
        SELECT 
          mp.match_id, mp.agent_id, mp.pseudo_name, mp.guild_id, mp.team_id, mp.party_id,
          mp.player_number, mp.model_id, mp.primary_profession, mp.secondary_profession,
          mp.level, mp.skill_template_code, mp.used_skills,
          COALESCE(u.username, '') as username
        FROM match_players mp
        LEFT JOIN pseudos p ON mp.pseudo_id = p.id
        LEFT JOIN users u ON p.user_id = u.id
        WHERE mp.match_id IN (${placeholders})
        ORDER BY mp.match_id, mp.team_id, mp.player_number
      `;
      
      const npcsQuery = `
        SELECT * FROM match_npcs 
        WHERE match_id IN (${placeholders})
        ORDER BY match_id, team_id, agent_id
      `;
      
      const [playersResult, npcsResult] = await Promise.all([
        client.query({ query: playersQuery, query_params: queryParams }),
        client.query({ query: npcsQuery, query_params: queryParams })
      ]);
      
      const allPlayers = (await playersResult.json() as QueryResult<Record<string, unknown>>).data;
      const allNpcs = (await npcsResult.json() as QueryResult<Record<string, unknown>>).data;
      
      // organize response by match_id
      const response = matchesData.map(matchData => ({
        match_info: {
          match_id: matchData.match_id,
          map_id: matchData.map_id,
          map_name: matchData.map_name,
          flux: matchData.flux,
          occasion: matchData.occasion,
          match_date: matchData.match_date,
          duration: matchData.duration_formatted,
          original_duration: matchData.match_original_duration,
          end_time_ms: matchData.match_end_time_ms,
          end_time_formatted: matchData.match_end_time_formatted,
          winner_party_id: matchData.winner_party_id,
          winner_guild_id: matchData.winner_guild_id,
          description: matchData.description,
          vods: matchData.vods,
          credits: matchData.credits,
          added_to_website: matchData.added_to_website
        },
        guilds: {
          [matchData.guild1_id as string]: {
            id: matchData.guild1_id,
            name: matchData.guild1_name,
            tag: matchData.guild1_tag,
            rank: matchData.guild1_rank,
            rating: matchData.guild1_rating,
            faction: matchData.guild1_faction,
            faction_points: matchData.guild1_faction_points,
            qualifier_points: matchData.guild1_qualifier_points
          },
          [matchData.guild2_id as string]: {
            id: matchData.guild2_id,
            name: matchData.guild2_name,
            tag: matchData.guild2_tag,
            rank: matchData.guild2_rank,
            rating: matchData.guild2_rating,
            faction: matchData.guild2_faction,
            faction_points: matchData.guild2_faction_points,
            qualifier_points: matchData.guild2_qualifier_points
          }
        },
        parties: {
          "1": {
            PLAYER: allPlayers.filter(p => p.match_id === matchData.match_id && p.team_id === 1).map(p => ({
              agent_id: p.agent_id,
              id: p.agent_id,
              encoded_name: p.pseudo_name,
              guild_id: p.guild_id,
              player_number: p.player_number,
              primary_profession: p.primary_profession,
              secondary_profession: p.secondary_profession,
              used_skills: p.used_skills
            })),
            OTHER: allNpcs.filter(n => n.match_id === matchData.match_id && n.team_id === 1)
          },
          "2": {
            PLAYER: allPlayers.filter(p => p.match_id === matchData.match_id && p.team_id === 2).map(p => ({
              agent_id: p.agent_id,
              id: p.agent_id,
              encoded_name: p.pseudo_name,
              guild_id: p.guild_id,
              player_number: p.player_number,
              primary_profession: p.primary_profession,
              secondary_profession: p.secondary_profession,
              used_skills: p.used_skills
            })),
            OTHER: allNpcs.filter(n => n.match_id === matchData.match_id && n.team_id === 2)
          }
        }
      }));
      
      return NextResponse.json(response);
    } else if (matchId) {
      // single match detailed view
      const query = `
        SELECT 
          m.*,
          arrayMap(x -> (x.1, x.2), groupArray((g1.name, g1.tag))) as guild1_info,
          arrayMap(x -> (x.1, x.2), groupArray((g2.name, g2.tag))) as guild2_info
        FROM gvg_matches m
        LEFT JOIN guilds g1 ON m.guild1_id = g1.id
        LEFT JOIN guilds g2 ON m.guild2_id = g2.id
        WHERE m.match_id = {match_id:String}
        GROUP BY m.match_id, m.map_id, m.map_name, m.flux, m.occasion, m.match_date, 
                 m.match_datetime, m.duration_seconds, m.duration_formatted, m.match_original_duration,
                 m.match_end_time_ms, m.match_end_time_formatted, m.winner_party_id, m.winner_guild_id,
                 m.guild1_id, m.guild1_name, m.guild1_tag, m.guild1_rank, m.guild1_rating,
                 m.guild1_faction, m.guild1_faction_points, m.guild1_qualifier_points,
                 m.guild2_id, m.guild2_name, m.guild2_tag, m.guild2_rank, m.guild2_rating,
                 m.guild2_faction, m.guild2_faction_points, m.guild2_qualifier_points,
                 m.state, m.description, m.vods, m.credits, m.added_to_website, m.created_at
      `;
      
      const matchResult = await client.query({
        query,
        query_params: { match_id: matchId }
      });
      
      const matchData = (await matchResult.json() as QueryResult<Record<string, unknown>>).data[0];
      if (!matchData) {
        return NextResponse.json({ error: 'match not found' }, { status: 404 });
      }

      // get players and npcs
      const playersQuery = `
        SELECT 
          mp.agent_id, mp.pseudo_name, mp.guild_id, mp.team_id, mp.party_id,
          mp.player_number, mp.model_id, mp.primary_profession, mp.secondary_profession,
          mp.level, mp.skill_template_code, mp.used_skills,
          COALESCE(u.username, '') as username
        FROM match_players mp
        LEFT JOIN pseudos p ON mp.pseudo_id = p.id
        LEFT JOIN users u ON p.user_id = u.id
        WHERE mp.match_id = {match_id:String}
        ORDER BY mp.team_id, mp.player_number
      `;
      
      const npcsQuery = `
        SELECT * FROM match_npcs 
        WHERE match_id = {match_id:String}
        ORDER BY team_id, agent_id
      `;
      
      const [playersResult, npcsResult] = await Promise.all([
        client.query({ query: playersQuery, query_params: { match_id: matchId } }),
        client.query({ query: npcsQuery, query_params: { match_id: matchId } })
      ]);
      
      const players = (await playersResult.json() as QueryResult<Record<string, unknown>>).data;
      const npcs = (await npcsResult.json() as QueryResult<Record<string, unknown>>).data;
      
      // organize response
      const response = {
        match_info: {
          match_id: matchData.match_id,
          map_id: matchData.map_id,
          map_name: matchData.map_name,
          flux: matchData.flux,
          occasion: matchData.occasion,
          match_date: matchData.match_date,
          duration: matchData.duration_formatted,
          original_duration: matchData.match_original_duration,
          end_time_ms: matchData.match_end_time_ms,
          end_time_formatted: matchData.match_end_time_formatted,
          winner_party_id: matchData.winner_party_id,
          winner_guild_id: matchData.winner_guild_id,
          description: matchData.description,
          vods: matchData.vods,
          credits: matchData.credits,
          added_to_website: matchData.added_to_website
        },
        guilds: {
          [matchData.guild1_id as string]: {
            id: matchData.guild1_id,
            name: matchData.guild1_name,
            tag: matchData.guild1_tag,
            rank: matchData.guild1_rank,
            rating: matchData.guild1_rating,
            faction: matchData.guild1_faction,
            faction_points: matchData.guild1_faction_points,
            qualifier_points: matchData.guild1_qualifier_points
          },
          [matchData.guild2_id as string]: {
            id: matchData.guild2_id,
            name: matchData.guild2_name,
            tag: matchData.guild2_tag,
            rank: matchData.guild2_rank,
            rating: matchData.guild2_rating,
            faction: matchData.guild2_faction,
            faction_points: matchData.guild2_faction_points,
            qualifier_points: matchData.guild2_qualifier_points
          }
        },
        parties: {
          "1": {
            PLAYER: players.filter(p => p.team_id === 1).map(p => ({
              agent_id: p.agent_id,
              pseudo_name: p.pseudo_name,
              username: p.username,
              guild_id: p.guild_id,
              team_id: p.team_id,
              player_number: p.player_number,
              model_id: p.model_id,
              primary_profession: p.primary_profession,
              secondary_profession: p.secondary_profession,
              level: p.level,
              skill_template_code: p.skill_template_code,
              used_skills: p.used_skills
            })),
            OTHER: npcs.filter(n => n.team_id === 1)
          },
          "2": {
            PLAYER: players.filter(p => p.team_id === 2).map(p => ({
              agent_id: p.agent_id,
              pseudo_name: p.pseudo_name,
              username: p.username,
              guild_id: p.guild_id,
              team_id: p.team_id,
              player_number: p.player_number,
              model_id: p.model_id,
              primary_profession: p.primary_profession,
              secondary_profession: p.secondary_profession,
              level: p.level,
              skill_template_code: p.skill_template_code,
              used_skills: p.used_skills
            })),
            OTHER: npcs.filter(n => n.team_id === 2)
          }
        },
        stats: {
          total_players: players.length,
          total_npcs: npcs.length,
          team1_players: players.filter(p => p.team_id === 1).length,
          team2_players: players.filter(p => p.team_id === 2).length
        }
      };
      
      return NextResponse.json(response);
    } else {
      // matches list
      const query = `
        SELECT 
          m.match_id, m.match_date, m.map_name, m.occasion, m.flux,
          m.guild1_id, m.guild1_name, m.guild1_tag, m.guild1_rank,
          m.guild2_id, m.guild2_name, m.guild2_tag, m.guild2_rank,
          groupArrayIf(p.primary_profession, p.guild_id = m.guild1_id) as guild1_professions,
          groupArrayIf(p.primary_profession, p.guild_id = m.guild2_id) as guild2_professions
        FROM (
          SELECT * FROM gvg_matches 
          ORDER BY match_date DESC, match_id DESC 
          LIMIT {limit:UInt32}
        ) m
        LEFT JOIN match_players p ON m.match_id = p.match_id AND (p.guild_id = m.guild1_id OR p.guild_id = m.guild2_id)
        GROUP BY m.match_id, m.match_date, m.map_name, m.occasion, m.flux,
                 m.guild1_id, m.guild1_name, m.guild1_tag, m.guild1_rank,
                 m.guild2_id, m.guild2_name, m.guild2_tag, m.guild2_rank
        ORDER BY m.match_date DESC, m.match_id DESC
      `;
      
      const result = await client.query({
        query,
        query_params: { limit }
      });
      
      const matches = (await result.json() as QueryResult<Record<string, unknown>>).data;
      return NextResponse.json(matches);
    }
  } catch {
    return NextResponse.json({ error: 'failed to fetch matches' }, { status: 500 });
  }
}

// helper to convert MM:SS to seconds
function timeToSeconds(timeStr: string): number {
  const [minutes, seconds] = timeStr.split(':').map(Number);
  return minutes * 60 + seconds;
}