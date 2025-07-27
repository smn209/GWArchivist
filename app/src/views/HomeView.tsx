"use client"
import { ProfessionImage } from "../components/ProfessionImage"
import { Wallpaper } from "../components/Wallpaper"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../components/ui/table"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Match, MatchDetail } from '@/types'

export function HomeView() {
  const [matches, setMatches] = useState<Match[]>([])
  const [matchDetails, setMatchDetails] = useState<Record<string, MatchDetail>>({})
  const router = useRouter()

  useEffect(() => {
    fetch("/api/matchs?limit=10")
      .then(res => res.json())
      .then(data => {
        const matchData = data || []
        setMatches(matchData)
        
        if (matchData.length > 0) {
          const matchIdsString = matchData.map((match: Match) => match.match_id).join(',')
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
    <>
      <Wallpaper src="/wallpapers/concepts/_Twin_Towers__concept_art.jpg">
        <div className="fixed inset-0 bg-black/15" />
      </Wallpaper>
      <div className="relative min-h-screen flex flex-col items-center justify-start w-full py-10 z-10">
        <h1 className="text-[3.7rem] font-bold mb-8 text-white drop-shadow-2xl">Guild Wars Archivist</h1>
        <div className="w-full max-w-6xl rounded-lg p-3 bg-white/10 backdrop-blur-sm shadow-xl border border-white/20">
          <Table role="table" aria-label="Match history table">
            <TableHeader role="rowgroup">
              <TableRow role="row">
                <TableHead className="text-white font-semibold text-[0.82rem]" scope="col">Date</TableHead>
                <TableHead className="text-white font-semibold text-[0.82rem]" scope="col">Occasion</TableHead>
                <TableHead className="text-white font-semibold text-[0.82rem]" scope="col">Team 1 Lineup</TableHead>
                <TableHead className="text-white font-semibold text-[0.82rem]" scope="col">Team 1 Guild</TableHead>
                <TableHead className="text-white font-semibold text-[0.82rem]" scope="col">Team 2 Lineup</TableHead>
                <TableHead className="text-white font-semibold text-[0.82rem]" scope="col">Team 2 Guild</TableHead>
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
                    className={`cursor-pointer hover:bg-white/15 border-white/20 min-h-[36px] focus:outline-none focus:ring-2 focus:ring-white/50 focus:bg-white/15 ${index % 2 === 0 ? 'bg-white/3' : 'bg-white/6'}`}
                    onClick={() => router.push(`/match/${match.match_id}`)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        router.push(`/match/${match.match_id}`)
                      }
                    }}
                    aria-label={`View match between ${match.guild1_name} and ${match.guild2_name} on ${new Date(match.match_date).toLocaleDateString('en-GB')}`}
                  >
                    <TableCell className="text-white text-[0.82rem] py-2">{new Date(match.match_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</TableCell>
                    <TableCell className="text-white text-[0.82rem] py-2">{match.occasion}</TableCell>
                    <TableCell className="py-2">
                      <div className="flex gap-1" role="list" aria-label="Team 1 professions">
                        {guild1Professions.filter(profId => profId != null).map((profId: number, idx: number) => (
                          <div key={idx} role="listitem">
                            <ProfessionImage profId={profId} width={80} height={80} />
                          </div>
                        ))}
                      </div>
                    </TableCell>
                    <TableCell className="text-white font-semibold text-[0.82rem] py-2">
                      {match.guild1_name} <span className="text-gray-200">[{match.guild1_tag}]</span> <span className="text-[0.7rem] text-gray-300">#{match.guild1_rank}</span>
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
                    <TableCell className="text-white font-semibold text-[0.82rem] py-2">
                      {match.guild2_name} <span className="text-gray-200">[{match.guild2_tag}]</span> <span className="text-[0.7rem] text-gray-300">#{match.guild2_rank}</span>
                      {winner === 2 && <span className="ml-1" aria-label="Winner">🏆</span>}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </>
  )
} 