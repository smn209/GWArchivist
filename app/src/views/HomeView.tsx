"use client"
import { ProfessionImage } from "../components/ProfessionImage"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../components/ui/table"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Match, MatchDetail } from '@/types'

export function HomeView() {
  const [matches, setMatches] = useState<Match[]>([])
  const [matchDetails, setMatchDetails] = useState<Record<string, MatchDetail>>({})
  const router = useRouter()

  useEffect(() => {
    fetch("/api/matchs?limit=100")
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
    <div className="min-h-screen flex flex-col items-center justify-start bg-white w-full py-10">
      <h1 className="text-4xl font-bold mb-8 text-black">GWArchivist</h1>
      <div className="w-full max-w-7xl rounded-lg p-4 bg-white shadow border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-black">Date</TableHead>
              <TableHead className="text-black">Occasion</TableHead>
              <TableHead className="text-black">Lineup</TableHead>
              <TableHead className="text-black">Guild</TableHead>
              <TableHead className="text-black">Lineup</TableHead>
              <TableHead className="text-black">Guild</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {matches.map((match) => {
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
                <TableRow key={match.match_id} style={{ cursor: "pointer" }} onClick={() => router.push(`/match/${match.match_id}`)} className="hover:bg-gray-100">
                  <TableCell className="text-black">{new Date(match.match_date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}</TableCell>
                  <TableCell className="text-black">{match.occasion}</TableCell>
                  <TableCell className="flex gap-1">{guild1Professions.filter(profId => profId != null).map((profId: number, idx: number) => <ProfessionImage key={idx} profId={profId} width={24} height={24} />)}</TableCell>
                  <TableCell className="text-black font-semibold">
                    {match.guild1_name} <span className="text-gray-500">[{match.guild1_tag}]</span> <span className="text-xs text-gray-400">#{match.guild1_rank}</span>
                    {winner === 1 && <span className="ml-1">🏆</span>}
                  </TableCell>
                  <TableCell className="flex gap-1">{guild2Professions.filter(profId => profId != null).map((profId: number, idx: number) => <ProfessionImage key={idx} profId={profId} width={24} height={24} />)}</TableCell>
                  <TableCell className="text-black font-semibold">
                    {match.guild2_name} <span className="text-gray-500">[{match.guild2_tag}]</span> <span className="text-xs text-gray-400">#{match.guild2_rank}</span>
                    {winner === 2 && <span className="ml-1">🏆</span>}
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