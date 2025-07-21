export default interface Match {
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