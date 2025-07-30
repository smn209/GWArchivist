"use client"
import { ProfessionImage } from "../components/ProfessionImage"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../components/ui/table"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { HomeViewMatch, MatchDetail } from '@/types'
import Image from "next/image"
import Link from "next/link"
import { Input } from "../components/ui/input"

export function HomeView() {
  const [matches, setMatches] = useState<HomeViewMatch[]>([])
  const [matchDetails, setMatchDetails] = useState<Record<string, MatchDetail>>({})
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      router.push(`/memorial?search=${encodeURIComponent(searchQuery.trim())}`)
    }
  }

  useEffect(() => {
    fetch("/api/matchs?limit=10")
      .then(res => res.json())
      .then(data => {
        const matchData = data || []
        setMatches(matchData)
        
        if (matchData.length > 0) {
          const matchIdsString = matchData.map((match: HomeViewMatch) => match.match_id).join(',')
          fetch(`/api/matchs?match_ids=${matchIdsString}`)
            .then(res => res.json())
            .then(detailsArray => {
              const detailsMap: Record<string, MatchDetail> = {}
              detailsArray.forEach((detail: MatchDetail) => {
                detailsMap[detail.match_info.match_id] = detail
              })
              setMatchDetails(detailsMap)
            })
        }
      })
  }, [])

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
          <Image 
            src="/icons/The_Frog.png" 
            alt="The Frog logo" 
            width={40} 
            height={40}
            className="rounded"
          />
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
      
      <div className="flex flex-col items-center py-8">
        <h1 className="text-5xl font-bold text-black mb-2">Guild Wars</h1>
        <h2 className="text-4xl font-bold text-black">Archivist</h2>
      </div>
      <div className="w-full max-w-6xl mx-auto rounded-lg p-3 bg-white shadow-xl border border-gray-300">
          <Table role="table" aria-label="Match history table">
            <TableHeader role="rowgroup">
              <TableRow role="row">
                <TableHead className="text-black font-semibold text-[0.82rem]" scope="col">Date</TableHead>
                <TableHead className="text-black font-semibold text-[0.82rem]" scope="col">Occasion</TableHead>
                <TableHead className="text-black font-semibold text-[0.82rem]" scope="col">Team 1 Lineup</TableHead>
                <TableHead className="text-black font-semibold text-[0.82rem]" scope="col">Team 1 Guild</TableHead>
                <TableHead className="text-black font-semibold text-[0.82rem]" scope="col">Team 2 Lineup</TableHead>
                <TableHead className="text-black font-semibold text-[0.82rem]" scope="col">Team 2 Guild</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody role="rowgroup">
              {matches.map((match, index) => {
                const detail = matchDetails[match.match_id]
                const winner = match.guild1_id === match.winner_guild_id ? 1 : 2;
                
                let guild1Professions = match.guild1_professions || []
                let guild2Professions = match.guild2_professions || []
                
                if (detail) {
                  const guild1Id = Object.keys(detail.guilds).find(id => detail.guilds[id].id === match.guild1_id)
                  const guild2Id = Object.keys(detail.guilds).find(id => detail.guilds[id].id === match.guild2_id)
                  
                  if (guild1Id) {
                    guild1Professions = detail.parties["1"]?.PLAYER?.filter(p => p.guild_id.toString() === guild1Id).map(p => p.primary_profession || p.primary).filter((p): p is number => p !== undefined) || guild1Professions
                  }
                  if (guild2Id) {
                    guild2Professions = detail.parties["2"]?.PLAYER?.filter(p => p.guild_id.toString() === guild2Id).map(p => p.primary_profession || p.primary).filter((p): p is number => p !== undefined) || guild2Professions
                  }
                }
                
                return (
                  <TableRow 
                    key={match.match_id} 
                    role="button"
                    tabIndex={0}
                    className={`cursor-pointer hover:bg-gray-100 border-gray-200 min-h-[36px] focus:outline-none focus:ring-2 focus:ring-gray-400 focus:bg-gray-100 ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                    onClick={() => router.push(`/match/${match.match_id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        router.push(`/match/${match.match_id}`)
                      }
                    }}
                    aria-label={`View match between ${match.guild1_name} and ${match.guild2_name} on ${new Date(match.match_date).toLocaleDateString('en-GB')}`}
                  >
                    <TableCell className="text-black text-[0.82rem] py-2">{new Date(match.match_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</TableCell>
                    <TableCell className="text-black text-[0.82rem] py-2">{match.occasion}</TableCell>
                    <TableCell className="py-2">
                      <div className="flex gap-1" role="list" aria-label="Team 1 professions">
                        {guild1Professions.filter(profId => profId != null).map((profId: number, idx: number) => (
                          <div key={idx} role="listitem">
                            <ProfessionImage profId={profId} width={80} height={80} />
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-black font-semibold text-[0.82rem] py-2">
                      {match.guild1_name} <span className="text-gray-600">[{match.guild1_tag}]</span> <span className="text-[0.7rem] text-gray-500">#{match.guild1_rank}</span>
                      {winner === 1 && <span className="ml-1" aria-label="Winner">🏆</span>}
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="flex gap-1" role="list" aria-label="Team 2 professions">
                        {guild2Professions.filter(profId => profId != null).map((profId: number, idx: number) => (
                          <div key={idx} role="listitem">
                            <ProfessionImage profId={profId} width={80} height={80} />
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-black font-semibold text-[0.82rem] py-2">
                      {match.guild2_name} <span className="text-gray-600">[{match.guild2_tag}]</span> <span className="text-[0.7rem] text-gray-500">#{match.guild2_rank}</span>
                      {winner === 2 && <span className="ml-1" aria-label="Winner">🏆</span>}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
      </div>
    </div>
  )
} 