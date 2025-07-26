"use client"
import { PlayerDetails } from '../components/PlayerDetails'
import { Player } from '@/types'

interface MatchViewProps {
  id: string;
  data: {
    match_info: {
      match_id: string;
    };
    guilds: Record<string, {
      name: string;
      tag: string;
    }>;
    parties: Record<string, {
      PLAYER: Player[];
    }>;
  };
}

export function MatchView({ id, data }: MatchViewProps) {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Match {id}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {[1, 2].map(teamId => (
          <div key={teamId} className="rounded p-4" style={{ background: '#fff', color: '#111' }}>
            <h2 className="text-xl font-semibold mb-2">
              {data.guilds[data.parties[teamId]?.PLAYER?.[0]?.guild_id]?.name} [
              {data.guilds[data.parties[teamId]?.PLAYER?.[0]?.guild_id]?.tag}]
            </h2>
            <div>
              {data.parties[teamId]?.PLAYER?.map((player: Player, index: number) => (
                <PlayerDetails
                  key={`${teamId}-${player.id}-${index}`}
                  player={{
                    pseudo: { id: player.id, name: player.encoded_name },
                    position: player.player_number,
                    guild_id: player.guild_id,
                    build: {
                      primary: player.primary,
                      secondary: player.secondary,
                      skills: player.used_skills || []
                    }
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}