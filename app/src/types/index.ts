import React from 'react';

// api query result
export interface QueryResult<T> {
  data: T[];
}

// database row interfaces
export interface PseudoRow {
  id: number;
}

export interface GuildRow {
  id: number;
}

export interface MatchIdRow {
  match_id: string;
}

// match related types
export interface MatchData {
  map_id: number;
  map_name?: string;
  flux: string;
  day: number;
  month: number;
  year: number;
  occasion: string;
  match_duration: string;
  match_original_duration: string;
  match_end_time_ms: number;
  match_end_time_formatted: string;
  winner_party_id: number;
  parties: {
    [key: string]: {
      PLAYER: Player[];
      OTHER: NPC[];
    };
  };
  guilds: {
    [key: string]: Guild;
  };
  credits?: string;
  added_to_website?: string;
  description?: string;
  vod_urls?: string[];
}

export interface Player {
  id: number;
  agent_id?: number;
  primary: number;
  secondary: number;
  level: number;
  team_id: number;
  player_number: number;
  guild_id: number;
  model_id: number;
  gadget_id: number;
  encoded_name: string;
  skill_template_code: string;
  used_skills: number[];
  primary_profession?: number;
  secondary_profession?: number;
  pseudo_name?: string;
  username?: string;
}

export interface NPC {
  id: number;
  primary: number;
  secondary: number;
  level: number;
  team_id: number;
  player_number: number;
  guild_id: number;
  model_id: number;
  gadget_id: number;
  encoded_name: string;
  skill_template_code: string;
  used_skills: number[];
}

export interface Guild {
  id: number;
  name: string;
  tag: string;
  rank: number;
  features?: number;
  rating: number;
  faction: number;
  faction_points: number;
  qualifier_points: number;
  cape?: object;
  country?: string;
}

export interface Match {
  match_id: string;
  match_date: string;
  occasion: string;
  guild1_id: number;
  guild1_name: string;
  guild1_tag: string;
  guild1_rank: number;
  guild1_professions: number[];
  guild2_id: number;
  guild2_name: string;
  guild2_tag: string;
  guild2_rank: number;
  guild2_professions: number[];
  winner_guild_id: number;
}

export interface MatchInfo {
  match_id: string;
  winner_guild_id: number;
  description?: string;
  vods?: string[];
  credits?: string;
  added_to_website?: string;
}

export interface MatchDetail {
  match_info: MatchInfo;
  guilds: Record<string, Guild>;
  parties: Record<string, {
    PLAYER: Player[];
    OTHER?: NPC[];
  }>;
}

// component props
export interface ProfessionImageProps {
  profId: number;
  width: number;
  height: number;
  className?: string;
}

export interface PlayerDetailsProps {
  player: {
    pseudo: { id: number; name: string };
    position: number;
    guild_id: number;
    build: {
      primary: number;
      secondary: number;
      skills: number[];
    };
  };
}

export interface SkillImageProps {
  skillId: number;
  width: number;
  height: number;
  className?: string;
}

export interface PlayerSkillsProps {
  skills: number[];
  className?: string;
}

export interface WallpaperProps {
  children: React.ReactNode;
  src?: string;
}

// legacy types (to be migrated)
export interface MatchPlayer {
  guild_key: number[];
  pseudo_id: number;
  primary_stat: number;
  secondary_stat: number;
  skills_id: number[];
  team_position: number;
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

export interface GuildInfo {
  key: number[];
  name: string;
  tag: string;
}

export interface CreateMatchRequest {
  map_id?: string | number;
  flux?: string;
  day: number;
  month: number;
  year: number;
  occasion?: string;
  match_duration?: string;
  match_original_duration?: string;
  match_end_time_ms?: number;
  match_end_time_formatted?: string;
  winner_party_id?: number;
  parties: Record<string, { PLAYER: unknown[]; OTHER: unknown[] }>;
  guilds: Record<string, { id: number; name: string; tag: string; rank: number; rating: number; faction: string; faction_points: number; qualifier_points: number }>;
}

export interface MemorialFilters {
  search?: string
  dateFrom?: string
  dateTo?: string
  mapId?: number | string
  flux?: string
  occasion?: string
  profession1?: number
  profession1Count?: number
  profession2?: number
  profession2Count?: number
  profession3?: number
  profession3Count?: number
  profession4?: number
  profession4Count?: number
  profession5?: number
  profession5Count?: number
  profession6?: number
  profession6Count?: number
  profession7?: number
  profession7Count?: number
  profession8?: number
  profession8Count?: number
  profession9?: number
  profession9Count?: number
  profession10?: number
  profession10Count?: number
  guildId?: number
  limit?: number
  offset?: number
}

export interface MemorialMatch {
  match_id: string
  match_date: string
  map_id: number
  map_name: string
  flux: string
  occasion: string
  duration_formatted: string
  guild1_id: number
  guild1_name: string
  guild1_tag: string
  guild1_rank: number
  guild1_professions: number[]
  guild2_id: number
  guild2_name: string
  guild2_tag: string
  guild2_rank: number
  guild2_professions: number[]
  winner_guild_id: number
  total_players: number
}

export interface MemorialResponse {
  matches: MemorialMatch[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

export interface FilterOptions {
  occasions: string[]
  fluxes: string[]
  maps: { map_id: number; map_name: string }[]
  guilds: { id: number; name: string; tag: string }[]
}

export interface MatchViewProps {
  data: {
    match_info: {
      match_id: string;
      winner_guild_id?: number;
    };
    guilds: Record<string, {
      id: number;
      name: string;
      tag: string;
    }>;
    parties: Record<string, {
      PLAYER: Player[];
    }>;
  };
}

export const PROFESSIONS = [
  { id: 1, name: "Warrior" },
  { id: 2, name: "Ranger" },
  { id: 3, name: "Monk" },
  { id: 4, name: "Necromancer" },
  { id: 5, name: "Mesmer" },
  { id: 6, name: "Elementalist" },
  { id: 7, name: "Assassin" },
  { id: 8, name: "Ritualist" },
  { id: 9, name: "Paragon" },
  { id: 10, name: "Dervish" },
]

