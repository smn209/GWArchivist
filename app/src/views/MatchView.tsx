"use client"
import { PlayerDetails } from '../components/PlayerDetails'
import { Header } from '../components/Header'
import { Player, MatchViewProps } from '@/types'
import Image from "next/image"

export function MatchView({ data }: MatchViewProps) {
  
  const getGuildForTeam = (teamId: string) => {
    const firstPlayer = data.parties[teamId]?.PLAYER?.[0]
    if (!firstPlayer) return null
    return Object.values(data.guilds).find(g => g.id === firstPlayer.guild_id)
  }
  
  return (
    <div className="min-h-screen flex flex-col w-full bg-white">
      <div className="relative w-full h-[15vh]">
        <Image 
          src="/wallpapers/concepts/_4s7__concept_art.jpg" 
          alt="Guild Wars Concept Art" 
          fill
          className="object-cover"
        />
      </div>
      
      <Header />
      
      <div className="text-center py-8">
        <div className="flex items-center justify-center gap-4">
          <div className="text-2xl font-bold text-black flex items-center">
            {getGuildForTeam("1")?.name}
            {data.match_info.winner_guild_id === getGuildForTeam("1")?.id && (
              <span className="ml-2" aria-label="Winner">🏆</span>
            )}
          </div>
          <span className="text-xl text-gray-500">vs</span>
          <div className="text-2xl font-bold text-black flex items-center">
            {getGuildForTeam("2")?.name}
            {data.match_info.winner_guild_id === getGuildForTeam("2")?.id && (
              <span className="ml-2" aria-label="Winner">🏆</span>
            )}
          </div>
        </div>
      </div>
      
      <div className="p-4">
        <div className="flex flex-col lg:flex-row justify-center items-start gap-4 max-w-6xl mx-auto">
          {[1, 2].map(teamId => (
            <div key={teamId} className="rounded-lg p-4 bg-white shadow-lg border border-gray-300 w-full lg:w-auto lg:flex-shrink-0">
            <h2 className="text-lg font-semibold mb-2 text-black">
              {getGuildForTeam(teamId.toString())?.name} [
              {getGuildForTeam(teamId.toString())?.tag}]
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
                      primary: player.primary_profession || player.primary,
                      secondary: player.secondary_profession || player.secondary,
                      skills: player.used_skills || []
                    }
                  }}
                  skillsClickable={true}
                />
              ))}
            </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  )
}