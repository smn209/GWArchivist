export interface GuildInfo {
  key: number[];
  name: string;
  tag: string;
}

export interface CreateMatchRequest {
  map_name: string;
  duration_ut: number;
  winner_guild_key: number[];
  match_date: string;
  state?: number;
  description?: string;
  vods?: string[];
  flux?: string;
  occasion?: string;
  match_original_duration?: string;
  match_end_time_ms?: number;
  match_end_time_formatted?: string;
  guilds: GuildInfo[];
  guild_match_states: GuildMatchState[];
  match_players: MatchPlayer[];
}

export interface GuildMatchState {
  guild_key: number[];
  rank: number;
  rating: number;
  faction: number;
  faction_point: number;
  qualifier_point: number;
  cape_trim: number;
}

export interface MatchPlayer {
  guild_key: number[];
  pseudo_id: number;
  primary_stat: number;
  secondary_stat: number;
  skills_id: number[];
  team_position: number;
}

export interface Match {
  id: number;
  map_name: string;
  duration_ut: number;
  winner_guild_id: number;
  match_date: string;
  state: number;
  description?: string;
  vods?: string[];
  flux?: string;
  occasion?: string;
  match_original_duration?: string;
  match_end_time_ms?: number;
  match_end_time_formatted?: string;
  created_at: string;
} 