"use client"
import { PlayerDetails } from '../components/PlayerDetails'
import { Player, MatchViewProps } from '@/types'
import Image from "next/image"
import Link from "next/link"
import { Input } from "../components/ui/input"
import { useRouter } from "next/navigation"
import { useState } from "react"

export function MatchView({ data }: MatchViewProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/memorial?search=${encodeURIComponent(searchQuery.trim())}`)
    }
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
      
      <div className="w-full flex items-center justify-between py-4 px-20 border-b border-gray-200">
        <div className="flex-1">
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity" aria-label="Go to home page">
            <Image 
              src="/icons/The_Frog.png" 
              alt="The Frog logo" 
              width={40} 
              height={40}
              className="rounded"
            />
          </Link>
        </div>
        <div className="flex-1 flex justify-center">
          <Input 
            placeholder="Search matches..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="max-w-xs w-full bg-white border-gray-300 text-black placeholder:text-gray-500 focus:ring-2 focus:ring-gray-400 focus:border-gray-400" 
            aria-label="Search matches"
          />
        </div>
        <div className="flex-1 flex justify-end">
          <Link 
            href="/memorial" 
            className="px-4 py-2 rounded-md hover:bg-gray-100 transition-colors font-medium text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
            aria-label="Go to Memorial page"
          >
            Memorial
          </Link>
        </div>
      </div>
      
      <div className="text-center py-8">
        <div className="flex items-center justify-center gap-4">
          <div className="text-2xl font-bold text-black flex items-center">
            {data.guilds[data.parties[1]?.PLAYER?.[0]?.guild_id]?.name}
            {data.match_info.winner_guild_id === data.guilds[data.parties[1]?.PLAYER?.[0]?.guild_id]?.id && (
              <span className="ml-2" aria-label="Winner">🏆</span>
            )}
          </div>
          <span className="text-xl text-gray-500">vs</span>
          <div className="text-2xl font-bold text-black flex items-center">
            {data.guilds[data.parties[2]?.PLAYER?.[0]?.guild_id]?.name}
            {data.match_info.winner_guild_id === data.guilds[data.parties[2]?.PLAYER?.[0]?.guild_id]?.id && (
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
                      primary: player.primary_profession || player.primary,
                      secondary: player.secondary_profession || player.secondary,
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
      
    </div>
  )
}