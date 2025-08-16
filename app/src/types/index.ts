import React from 'react';

export interface QueryResult<T> {
  data: T[];
}

export interface Guild {
  id: number;
  name: string;
  tag: string;
  rank?: number;
  rating?: number;
  faction?: number;
  faction_points?: number;
  qualifier_points?: number;
  country?: string;
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

export interface MatchBase {
  match_id: string;
  match_date: string;
  map_id: number;
  map_name: string;
  flux: string;
  occasion: string;
  duration_formatted: string;
  guild1_id: number;
  guild1_name: string;
  guild1_tag: string;
  guild1_rank: number;
  guild2_id: number;
  guild2_name: string;
  guild2_tag: string;
  guild2_rank: number;
  winner_guild_id: number;
}

export interface Match extends MatchBase {
  guild1_professions: number[];
  guild2_professions: number[];
}

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
  parties: Record<string, {
    PLAYER: Player[];
    OTHER: NPC[];
  }>;
  guilds: Record<string, Guild>;
  credits?: string;
  added_to_website?: string;
  description?: string;
  vod_urls?: string[];
}

export interface MatchInfo {
  match_id: string;
  map_id?: number;
  map_name?: string;
  flux?: string;
  occasion?: string;
  match_date?: string;
  duration?: string;
  original_duration?: string;
  end_time_ms?: number;
  end_time_formatted?: string;
  winner_party_id?: number;
  winner_guild_id?: number;
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
  stats?: {
    total_players: number;
    total_npcs: number;
    team1_players: number;
    team2_players: number;
  };
}

export interface ProfessionImageProps {
  profId: number;
  width: number;
  height: number;
  className?: string;
}

export interface SkillImageProps {
  skillId: number;
  width: number;
  height: number;
  className?: string;
  showTooltip?: boolean;
  clickable?: boolean;
}

export interface PlayerSkillsProps {
  skills: number[];
  className?: string;
  clickable?: boolean;
}

export interface WallpaperProps {
  children: React.ReactNode;
  src?: string;
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
  skillsClickable?: boolean;
}

export interface MemorialFilters {
  search?: string;
  dateFrom?: string;
  dateTo?: string;
  mapId?: number | string;
  flux?: string;
  occasion?: string;
  profession1Count?: number;
  profession2Count?: number;
  profession3Count?: number;
  profession4Count?: number;
  profession5Count?: number;
  profession6Count?: number;
  profession7Count?: number;
  profession8Count?: number;
  profession9Count?: number;
  profession10Count?: number;
  guildId?: number;
  limit?: number;
  offset?: number;
}

export interface MemorialMatch extends MatchBase {
  guild1_professions: number[];
  guild2_professions: number[];
  total_players: number;
}

export interface MemorialResponse {
  matches: MemorialMatch[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface FilterOptions {
  occasions: string[];
  fluxes: string[];
  maps: { map_id: number; map_name: string }[];
  guilds: { id: number; name: string; tag: string }[];
}

export interface MatchViewProps {
  data: MatchDetail;
}

export interface HomeViewMatch {
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
  map_name?: string;
  flux?: string;
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

