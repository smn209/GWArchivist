# API Reference

This document provides comprehensive information about all available API endpoints.

# GET /api/health

Health check endpoint to verify database connectivity.

**Parameters:** None

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

**Error Codes:**
- `500` - Database connection failed

# GET /api/guild

Retrieve a list of all guilds.

**Parameters:**
- `limit` (optional) - Number of guilds to return

**Response:**
```json
[
  {
    "id": 1,
    "name": "Guild Name",
    "tag": "TAG"
  }
]
```

**Error Codes:**
- `500` - Failed to fetch guilds

# GET /api/guild/[id]

Retrieve a specific guild by ID, name, or tag.

**Parameters:**
- `id` (path) - Guild ID (number), name (string), or tag (string)

**Response:**
```json
{
  "id": 1,
  "name": "Guild Name",
  "tag": "TAG"
}
```

**Error Codes:**
- `404` - Guild not found
- `500` - Failed to fetch guild

# GET /api/matchs

Retrieve a list of matches or specific match details.

**Parameters:**
- `limit` (optional) - Number of matches to return (default: 50)
- `match_id` (optional) - Get detailed view of specific match
- `match_ids` (optional) - Comma-separated list of match IDs for multiple detailed views

**Response (list view):**
```json
[
  {
    "match_id": "1753813824032000",
    "match_date": "2012-09-29",
    "map_name": "Corrupted Isle",
    "occasion": "Playoffs",
    "flux": "Like a Boss",
    "guild1_id": 1,
    "guild1_name": "Guild One",
    "guild1_tag": "G1",
    "guild1_rank": 1,
    "guild2_id": 2,
    "guild2_name": "Guild Two",
    "guild2_tag": "G2",
    "guild2_rank": 2,
    "guild1_professions": [1, 2, 3, 4, 5, 6, 7, 8],
    "guild2_professions": [1, 2, 3, 4, 5, 6, 7, 8]
  }
]
```

**Response (detailed view with match_id):**
```json
{
  "match_info": {
    "match_id": "1753813824032000",
    "map_id": 1,
    "map_name": "Corrupted Isle",
    "flux": "Like a Boss",
    "occasion": "Playoffs",
    "match_date": "2012-09-29",
    "duration": "15:32",
    "original_duration": "15:32",
    "end_time_ms": 932000,
    "end_time_formatted": "15:32.000",
    "winner_party_id": 2,
    "winner_guild_id": 2,
    "description": null,
    "vods": [],
    "credits": "Guild Wars Memorial",
    "added_to_website": "25 Apr 2015 02:38:19 CEST"
  },
  "guilds": {
    "1": {
      "id": 1,
      "name": "Guild One",
      "tag": "G1",
      "rank": 1,
      "rating": 1200,
      "faction": 0,
      "faction_points": 0,
      "qualifier_points": 0
    }
  },
  "parties": {
    "1": {
      "PLAYER": [
        {
          "agent_id": 1001,
          "pseudo_name": "Player Name",
          "username": "",
          "guild_id": 1,
          "team_id": 1,
          "player_number": 1,
          "model_id": 0,
          "primary_profession": 1,
          "secondary_profession": 8,
          "level": 20,
          "skill_template_code": "",
          "used_skills": [1697, 352, 331, 332, 326, 1404, 1414, 1481]
        }
      ],
      "OTHER": []
    }
  },
  "stats": {
    "total_players": 16,
    "total_npcs": 0,
    "team1_players": 8,
    "team2_players": 8
  }
}
```

**Error Codes:**
- `404` - Match not found (when using match_id)
- `400` - No valid match IDs provided (when using match_ids)
- `500` - Failed to fetch matches

# POST /api/matchs

Submit new match data.

**Request Body:** See [Data Collection Documentation](data-collection.md#api-structure-sample) for complete JSON structure.

**Response:**
```json
{
  "success": true,
  "match_id": "1753813824032000",
  "players_inserted": 16,
  "npcs_inserted": 0
}
```

**Error Codes:**
- `500` - Failed to process match data

# GET /api/matchs/[id]

Retrieve detailed information for a specific match.

**Parameters:**
- `id` (path) - Match ID

**Response:**
```json
{
  "match_info": {
    "match_id": "1753813824032000",
    "map_id": 1,
    "map_name": "Corrupted Isle",
    "flux": "Like a Boss",
    "occasion": "Playoffs",
    "match_date": "2012-09-29",
    "duration": "15:32",
    "original_duration": "15:32",
    "end_time_ms": 932000,
    "end_time_formatted": "15:32.000",
    "winner_party_id": 2,
    "winner_guild_id": 2
  },
  "guilds": {
    "1": {
      "id": 1,
      "name": "Guild One",
      "tag": "G1",
      "rank": 1,
      "rating": 1200,
      "faction": 0,
      "faction_points": 0,
      "qualifier_points": 0,
      "full_data": {}
    }
  },
  "parties": {
    "1": {
      "PLAYER": [],
      "OTHER": []
    },
    "2": {
      "PLAYER": [],
      "OTHER": []
    }
  },
  "stats": {
    "total_players": 16,
    "total_npcs": 0,
    "team1_players": 8,
    "team2_players": 8
  }
}
```

**Error Codes:**
- `404` - Match not found
- `500` - Failed to fetch match data

# GET /api/matchs/ids

Retrieve all match IDs.

**Parameters:** None

**Response:**
```json
[
  "1753813824032000",
  "1753813824031999",
  "1753813824031998"
]
```

**Error Codes:**
- `500` - Failed to fetch match IDs

# GET /api/memorial

Search and filter matches with advanced filtering options.

**Parameters:**
- `limit` (optional) - Number of matches per page (default: 50)
- `offset` (optional) - Number of matches to skip (default: 0)
- `search` (optional) - Text search in guild names, tags, or player names
- `dateFrom` (optional) - Start date filter (YYYY-MM-DD)
- `dateTo` (optional) - End date filter (YYYY-MM-DD)
- `mapId` (optional) - Filter by map ID
- `flux` (optional) - Filter by flux condition
- `occasion` (optional) - Filter by occasion
- `guildId` (optional) - Filter matches containing specific guild
- `profession1Count` through `profession10Count` (optional) - Minimum count of each profession required

**Response:**
```json
{
  "matches": [
    {
      "match_id": "1753813824032000",
      "match_date": "2012-09-29",
      "map_id": 1,
      "map_name": "Corrupted Isle",
      "flux": "Like a Boss",
      "occasion": "Playoffs",
      "duration_formatted": "15:32",
      "guild1_id": 1,
      "guild1_name": "Guild One",
      "guild1_tag": "G1",
      "guild1_rank": 1,
      "guild1_professions": [1, 2, 3, 4, 5, 6, 7, 8],
      "guild2_id": 2,
      "guild2_name": "Guild Two",
      "guild2_tag": "G2",
      "guild2_rank": 2,
      "guild2_professions": [1, 2, 3, 4, 5, 6, 7, 8],
      "winner_guild_id": 2,
      "total_players": 16
    }
  ],
  "pagination": {
    "total": 1500,
    "limit": 50,
    "offset": 0,
    "hasMore": true
  }
}
```

**Error Codes:**
- `500` - Failed to fetch memorial data

# GET /api/memorial (Filter Options)

Retrieve filter options for the memorial interface using query parameters.

**Parameters:**
- `type` (required) - Filter type: "occasions", "fluxes", "maps", or "guilds"  
- `search` (optional) - Search term for filtering results (mainly used with "guilds")

**Response (occasions/fluxes):**
```json
[
  "Playoffs",
  "Finals",
  "Automated Tournaments"
]
```

**Response (maps):**
```json
[
  {
    "map_id": 1,
    "map_name": "Corrupted Isle"
  }
]
```

**Response (guilds):**
```json
[
  {
    "id": 1,
    "name": "Guild Name",
    "tag": "TAG"
  }
]
```

**Example Requests:**
- `/api/memorial?type=occasions`
- `/api/memorial?type=guilds&search=zero`

**Error Codes:**
- `400` - Type parameter is required or invalid filter type
- `500` - Failed to fetch filter options