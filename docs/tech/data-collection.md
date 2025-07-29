# Data Collection

![C++](https://img.shields.io/badge/c++-%2300599C.svg?style=for-the-badge&logo=c%2B%2B&logoColor=white)
![Open Source](https://img.shields.io/badge/Open%20Source-brightgreen?style=for-the-badge&logo=opensource&logoColor=white)

## Data Source: ObserverPlugin

The match data in this project is collected using the **[ObserverPlugin](https://github.com/kd209/ObserverPlugin)**, an open-source plugin for Gwtoolboxpp using GWCA that captures comprehensive Guild Wars match information in real-time.

### Plugin Architecture

The ObserverPlugin operates as a completely **open-source** solution. You can:

- **Build from source**: Complete C++ source code available
- **Download precompiled**: Ready-to-use binaries provided
- **Contribute**: Full development access on GitHub

You can export yourself the whole data of a match by just seeing it with ObserverPlugin.

> [!IMPORTANT]  
> The widget allowing direct API uploads from the plugin is currently private but aims to be public with API protected with keys later.)

## Data Capture Types

### 1. Basic Match Information


```json
{
  "map_id": 1,
  "map_name": "Corrupted Isle",
  "flux": "Like a Boss (2013, until September 26th)",
  "day": 29,
  "month": 9,
  "year": 2012,
  "occasion": "Playoffs",
  "match_duration": "15:32",
  "match_original_duration": "15:32",
  "match_end_time_ms": 932000,
  "match_end_time_formatted": "15:32.000",
  "winner_party_id": 2,
  "parties": {
    "1": {
      "PLAYER": [
        {
          "id": 1001,
          "primary": 1,
          "secondary": 8,
          "level": 20,
          "team_id": 1,
          "player_number": 1,
          "guild_id": 1,
          "model_id": 0,
          "gadget_id": 0,
          "encoded_name": "Player Name",
          "skill_template_code": "",
          "used_skills": [1697, 352, 331, 332, 326, 1404, 1414, 1481]
        }
      ],
      "OTHER": [
        {
          "id": 1101,
          "primary": 0,
          "secondary": 0,
          "level": 20,
          "team_id": 1,
          "player_number": 9,
          "guild_id": 1,
          "model_id": 2619,
          "gadget_id": 0,
          "encoded_name": "Guild Lord",
          "skill_template_code": "",
          "used_skills": []
        }
      ]
    },
    "2": {
      "PLAYER": [
        {
          "id": 2001,
          "primary": 1,
          "secondary": 8,
          "level": 20,
          "team_id": 2,
          "player_number": 1,
          "guild_id": 2,
          "model_id": 0,
          "gadget_id": 0,
          "encoded_name": "Enemy Player",
          "skill_template_code": "",
          "used_skills": [355, 352, 331, 332, 1404, 2196, 316, 0]
        }
      ],
      "OTHER": []
    }
  },
  "guilds": {
    "1": {
      "id": 1,
      "name": "Guild Name One",
      "tag": "GN1",
      "rank": 1,
      "features": 0,
      "rating": 1200,
      "faction": 0,
      "faction_points": 0,
      "qualifier_points": 0,
      "cape": {},
      "country": "US"
    },
    "2": {
      "id": 2,
      "name": "Guild Name Two",
      "tag": "GN2",
      "rank": 2,
      "features": 0,
      "rating": 1100,
      "faction": 0,
      "faction_points": 0,
      "qualifier_points": 0,
      "cape": {},
      "country": "EU"
    }
  },
  "credits": "Guild Wars Memorial",
  "added_to_website": "25 Apr 2015 02:38:19 CEST",
  "description": "Optional match description",
  "vod_urls": ["https://example.com/video1", "https://example.com/video2"]
}
```

### Field Specifications

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `map_id` | number/null | No | Unique map identifier |
| `map_name` | string | No | Human-readable map name |
| `flux` | string | Yes | Active flux condition |
| `day`, `month`, `year` | number | Yes | Match date components |
| `occasion` | string | Yes | Match context (e.g., "Playoffs") |
| `match_duration` | string | Yes | Match duration in MM:SS format |
| `match_original_duration` | string | Yes | Original duration before modifications |
| `match_end_time_ms` | number | Yes | End time in milliseconds |
| `match_end_time_formatted` | string | Yes | Human-readable end time |
| `winner_party_id` | number | Yes | Winning party ID (1 or 2) |
| `parties` | object | Yes | Player and NPC data by team |
| `guilds` | object | Yes | Guild information by ID |
| `credits` | string | No | Data source attribution |
| `added_to_website` | string | No | Ingestion timestamp |
| `description` | string | No | Optional match description |
| `vod_urls` | string[] | No | Video-on-demand URLs |

**Player Object Fields:**
- `id`: Unique agent identifier
- `primary`/`secondary`: Profession IDs (1-10)
- `level`: Character level (typically 20)
- `team_id`: Team identifier (1 or 2)
- `player_number`: Position in team (1-8)
- `guild_id`: Guild identifier
- `model_id`/`gadget_id`: Visual model identifiers
- `encoded_name`: Player character name
- `skill_template_code`: Build template (usually empty)
- `used_skills`: Array of skill IDs used in match

### 2. Complete Match Capture

Beyond basic match information, the ObserverPlugin captures comprehensive event streams throughout the entire match duration. This includes all player actions, movements, skill usage, combat events, positioning data, and communication logs.

The complete capture functionality enables full match reconstruction and analysis. This comprehensive data collection allows for complete match replay through **ObserverLite**, providing frame-by-frame recreation of the entire match experience.

