export default interface CreateMatchRequest {
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
  parties: Record<string, any>;
  guilds: Record<string, any>;
} 