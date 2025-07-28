"use client"
import { PlayerDetails } from '../components/PlayerDetails'
import { Player } from '@/types'
import Image from "next/image"
import Link from "next/link"
import { Input } from "../components/ui/input"
import { useRouter } from "next/navigation"
import { useState } from "react"

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
        <h1 className="text-4xl font-bold text-black">Match {id}</h1>
      </div>
      
      <div className="p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[1, 2].map(teamId => (
            <div key={teamId} className="rounded-lg p-6 bg-white shadow-xl border border-gray-300">
            <h2 className="text-xl font-semibold mb-4 text-black">
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
    </div>
  )
}