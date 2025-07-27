import { NextRequest, NextResponse } from 'next/server'
import client from '@/lib/clickhouse'
import { QueryResult, MemorialFilters, MemorialMatch } from '@/types'

const parseFilters = (searchParams: URLSearchParams): MemorialFilters => {
  const filters: MemorialFilters = {
    limit: parseInt(searchParams.get('limit') || '50', 10),
    offset: parseInt(searchParams.get('offset') || '0', 10)
  }

  // string filters
  const search = searchParams.get('search')
  const dateFrom = searchParams.get('dateFrom')
  const dateTo = searchParams.get('dateTo')
  const flux = searchParams.get('flux')
  const occasion = searchParams.get('occasion')
  
  if (search) filters.search = search
  if (dateFrom) filters.dateFrom = dateFrom
  if (dateTo) filters.dateTo = dateTo
  if (flux) filters.flux = flux
  if (occasion) filters.occasion = occasion

  // number filters
  const mapId = searchParams.get('mapId')
  const guildId = searchParams.get('guildId')
  
  if (mapId) filters.mapId = parseInt(mapId)
  if (guildId) filters.guildId = parseInt(guildId)

  // profession filters
  for (let i = 1; i <= 10; i++) {
    const prof = searchParams.get(`profession${i}`)
    const count = searchParams.get(`profession${i}Count`)
    
    if (prof) {
      const key = `profession${i}` as keyof MemorialFilters
      filters[key] = parseInt(prof) as never
    }
    if (count) {
      const key = `profession${i}Count` as keyof MemorialFilters
      filters[key] = parseInt(count) as never
    }
  }

  return filters
}

const buildWhereConditions = (filters: MemorialFilters): { conditions: string[], params: Record<string, unknown> } => {
  const conditions: string[] = []
  const params: Record<string, unknown> = {}

  if (filters.dateFrom) {
    conditions.push('m.match_date >= {dateFrom:Date}')
    params.dateFrom = filters.dateFrom
  }
  
  if (filters.dateTo) {
    conditions.push('m.match_date <= {dateTo:Date}')
    params.dateTo = filters.dateTo
  }

  if (filters.mapId) {
    conditions.push('m.map_id = {mapId:UInt32}')
    params.mapId = filters.mapId
  }

  if (filters.flux) {
    conditions.push('m.flux = {flux:String}')
    params.flux = filters.flux
  }

  if (filters.occasion) {
    conditions.push('m.occasion = {occasion:String}')
    params.occasion = filters.occasion
  }

  if (filters.guildId) {
    conditions.push('(m.guild1_id = {guildId:UInt32} OR m.guild2_id = {guildId:UInt32})')
    params.guildId = filters.guildId
  }

  // simplified text search to prevent timeouts
  if (filters.search) {
    const searchTerm = filters.search.toLowerCase()
    conditions.push(`(
      lower(m.guild1_name) LIKE {searchPattern:String} OR
      lower(m.guild1_tag) LIKE {searchPattern:String} OR
      lower(m.guild2_name) LIKE {searchPattern:String} OR
      lower(m.guild2_tag) LIKE {searchPattern:String} OR
      m.match_id IN (
        SELECT mp.match_id 
        FROM match_players mp 
        WHERE lower(mp.pseudo_name) LIKE {searchPattern:String}
        LIMIT 1000
      )
    )`)
    params.searchPattern = `%${searchTerm}%`
  }

  // profession filtering using subqueries
  for (let i = 1; i <= 10; i++) {
    const professionKey = `profession${i}` as keyof MemorialFilters
    const countKey = `profession${i}Count` as keyof MemorialFilters
    
    if (filters[professionKey] && filters[countKey]) {
      conditions.push(`
        m.match_id IN (
          SELECT mp.match_id 
          FROM match_players mp 
          WHERE mp.primary_profession = {profession${i}:UInt8}
          GROUP BY mp.match_id, mp.guild_id
          HAVING count() >= {profession${i}Count:UInt8}
        )
      `)
      params[`profession${i}`] = filters[professionKey]
      params[`profession${i}Count`] = filters[countKey]
    }
  }

  params.limit = filters.limit
  params.offset = filters.offset

  return { conditions, params }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const filters = parseFilters(searchParams)
    const { conditions, params } = buildWhereConditions(filters)
    
    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''
    
    // optimized query with proper aggregation
    const query = `
      SELECT 
        m.match_id,
        m.match_date,
        m.map_id,
        m.map_name,
        m.flux,
        m.occasion,
        m.duration_formatted,
        m.guild1_id,
        m.guild1_name,
        m.guild1_tag,
        m.guild1_rank,
        m.guild2_id,
        m.guild2_name,
        m.guild2_tag,
        m.guild2_rank,
        m.winner_guild_id,
        groupArrayIf(p.primary_profession, p.guild_id = m.guild1_id) as guild1_professions,
        groupArrayIf(p.primary_profession, p.guild_id = m.guild2_id) as guild2_professions,
        count(DISTINCT p.agent_id) as total_players
      FROM gvg_matches m
      LEFT JOIN match_players p ON m.match_id = p.match_id
      ${whereClause}
      GROUP BY 
        m.match_id, m.match_date, m.map_id, m.map_name, m.flux, m.occasion,
        m.duration_formatted, m.guild1_id, m.guild1_name, m.guild1_tag, m.guild1_rank,
        m.guild2_id, m.guild2_name, m.guild2_tag, m.guild2_rank, m.winner_guild_id
      ORDER BY m.match_date DESC, m.match_id DESC
      LIMIT {limit:UInt32} OFFSET {offset:UInt32}
    `

    // separate count query for pagination (more reliable than window functions with complex WHERE)
    const countQuery = `
      SELECT count(DISTINCT m.match_id) as total
      FROM gvg_matches m
      LEFT JOIN match_players p ON m.match_id = p.match_id
      ${whereClause}
    `

    const [result, countResult] = await Promise.all([
      client.query({ query, query_params: params }),
      client.query({ query: countQuery, query_params: params })
    ])
    
    const matches = (await result.json() as QueryResult<MemorialMatch>).data
    const totalCount = (await countResult.json() as QueryResult<{ total: number }>).data[0]?.total || 0

    return NextResponse.json({
      matches,
      pagination: {
        total: totalCount,
        limit: filters.limit,
        offset: filters.offset,
        hasMore: (filters.offset || 0) + (filters.limit || 50) < totalCount
      }
    })

  } catch (error) {
    console.error('memorial api error:', error)
    return NextResponse.json(
      { error: 'failed to fetch memorial data' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { type, search = '' } = await request.json()

    const queries = {
      occasions: `
        SELECT DISTINCT occasion 
        FROM gvg_matches 
        WHERE notEmpty(occasion) 
        ORDER BY occasion
      `,
      fluxes: `
        SELECT DISTINCT flux 
        FROM gvg_matches 
        WHERE notEmpty(flux) 
        ORDER BY flux
      `,
      maps: `
        SELECT DISTINCT map_id, any(map_name) as map_name
        FROM gvg_matches 
        WHERE map_id > 0 
        GROUP BY map_id
        ORDER BY map_name
      `,
      guilds: search 
        ? `
          SELECT id, name, tag, count() as match_count
          FROM guilds 
          WHERE lower(concat(name, ' ', tag)) LIKE {searchPattern:String}
          GROUP BY id, name, tag
          ORDER BY match_count DESC, name
          LIMIT 100
        `
        : `
          SELECT id, name, tag 
          FROM guilds 
          ORDER BY name 
          LIMIT 100
        `
    }

    const query = queries[type as keyof typeof queries]
    if (!query) {
      return NextResponse.json({ error: 'invalid request type' }, { status: 400 })
    }

    const result = await client.query({
      query,
      query_params: search ? { searchPattern: `%${search.toLowerCase()}%` } : {}
    })

    const data = await result.json() as QueryResult<Record<string, unknown>>
    
    // optimize response format based on type
    const response = type === 'occasions' || type === 'fluxes' 
      ? data.data.map(row => row[type.slice(0, -1)] as string)
      : data.data

    return NextResponse.json(response)
    
  } catch (error) {
    console.error('memorial filter options error:', error)
    return NextResponse.json(
      { error: 'failed to fetch filter options' },
      { status: 500 }
    )
  }
}