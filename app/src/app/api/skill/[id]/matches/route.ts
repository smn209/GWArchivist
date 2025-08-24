import { NextRequest, NextResponse } from 'next/server'
import client from '../../../../../lib/clickhouse'
import { QueryResult, SkillMatchPlayer, SkillMatch } from '../../../../../types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const skillId = parseInt(id)
    
    if (isNaN(skillId)) {
      return NextResponse.json({ error: 'Invalid skill ID' }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100)
    const offset = parseInt(searchParams.get('offset') || '0')

    const query = `
      SELECT 
        m.match_id as match_id,
        m.match_date,
        m.map_name,
        m.occasion,
        m.flux,
        p.player_number,
        p.guild_id,
        p.pseudo_name as encoded_name,
        p.primary_profession,
        p.secondary_profession,
        p.used_skills,
        g.name as guild_name,
        g.tag as guild_tag,
        CASE 
          WHEN p.guild_id = m.guild1_id THEN m.guild1_rank
          WHEN p.guild_id = m.guild2_id THEN m.guild2_rank
          ELSE 0
        END as guild_rank
      FROM gvg_matches m
      JOIN match_players p ON m.match_id = p.match_id
      JOIN guilds g ON p.guild_id = g.id
      WHERE arrayExists(x -> x = ${skillId}, p.used_skills)
      ORDER BY m.match_date DESC
      LIMIT ${limit}
      OFFSET ${offset}
    `

    const countQuery = `
      SELECT count(DISTINCT m.match_id) as total
      FROM gvg_matches m
      JOIN match_players p ON m.match_id = p.match_id
      WHERE arrayExists(x -> x = ${skillId}, p.used_skills)
    `

    const [matchData, countData] = await Promise.all([
      client.query({
        query,
        query_params: {},
      }),
      client.query({
        query: countQuery,
        query_params: {},
      })
    ])

    const matchResult = await matchData.json() as QueryResult<SkillMatchPlayer & { match_id: string; match_date: string; map_name: string; occasion: string; flux: string }>
    const countQueryResult = await countData.json() as QueryResult<{ total: number }>
    
    const matches = matchResult.data
    const total = countQueryResult.data[0]?.total || 0

    const matchesGrouped = matches.reduce((acc: Record<string, SkillMatch>, row) => {
      const matchId = row.match_id
      if (!acc[matchId]) {
        acc[matchId] = {
          match_id: matchId,
          match_date: row.match_date,
          map_name: row.map_name,
          occasion: row.occasion,
          flux: row.flux,
          players: []
        }
      }
      
      acc[matchId].players.push({
        player_number: row.player_number,
        guild_id: row.guild_id,
        encoded_name: row.encoded_name,
        primary_profession: row.primary_profession,
        secondary_profession: row.secondary_profession,
        used_skills: row.used_skills,
        guild_name: row.guild_name,
        guild_tag: row.guild_tag,
        guild_rank: row.guild_rank
      })
      
      return acc
    }, {})

    const result = Object.values(matchesGrouped)

    return NextResponse.json({
      matches: result,
      pagination: {
        total: parseInt(total.toString()),
        limit,
        offset,
        hasMore: offset + limit < parseInt(total.toString())
      }
    })

  } catch (error) {
    console.error('Error fetching skill matches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch skill matches' },
      { status: 500 }
    )
  }
}
