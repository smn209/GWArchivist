"use client"

import { useState, useEffect } from 'react'
import { Header } from '../components/Header'
import { PlayerSkills } from '../components/PlayerSkills'
import { ProfessionImage } from '../components/ProfessionImage'
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from '../components/ui/table'
import { Button } from '../components/ui/button'
import { 
  getSkillDetails, 
  getSkillImageId, 
  getSkillTypeName,
  PROFESSION_NAMES,
  ATTRIBUTE_NAMES,
  type Profession,
  type Attribute
} from '../lib/skills'
import Image from 'next/image'

interface SkillDetailViewProps {
  skillId: number
}

interface SkillMatchPlayer {
  player_number: number
  guild_id: number
  encoded_name: string
  primary_profession: number
  secondary_profession: number
  used_skills: number[]
  guild_name: string
  guild_tag: string
  guild_rank: number
}

interface SkillMatch {
  match_id: string
  match_date: string
  map_name: string
  occasion: string
  flux: string
  players: SkillMatchPlayer[]
}

interface SkillMatchesResponse {
  matches: SkillMatch[]
  pagination: {
    total: number
    limit: number
    offset: number
    hasMore: boolean
  }
}

export function SkillDetailView({ skillId }: SkillDetailViewProps) {
  const [matches, setMatches] = useState<SkillMatch[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ total: 0, limit: 20, offset: 0, hasMore: false })
  
  const skillDetail = getSkillDetails(skillId)
  const imageId = getSkillImageId(skillId)
  
  useEffect(() => {
    loadMatches()
  }, [skillId])

  const loadMatches = async (resetOffset = true) => {
    setLoading(true)
    try {
      const newOffset = resetOffset ? 0 : pagination.offset + pagination.limit
      const response = await fetch(`/api/skill/${skillId}/matches?limit=20&offset=${newOffset}`)
      const data: SkillMatchesResponse = await response.json()
      
      if (resetOffset) {
        setMatches(data.matches)
      } else {
        setMatches(prev => [...prev, ...data.matches])
      }
      
      setPagination(data.pagination)
    } catch (error) {
      console.error('Failed to load skill matches:', error)
    } finally {
      setLoading(false)
    }
  }
  
  if (!skillDetail) {
    return (
      <div className="min-h-screen flex flex-col w-full bg-white">
        <Header />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Skill Not Found</h1>
            <p className="text-gray-600">Skill #{skillId} could not be found.</p>
          </div>
        </div>
      </div>
    )
  }

  const profession = PROFESSION_NAMES[skillDetail.p as Profession]
  const skillType = getSkillTypeName(skillDetail)
  const attribute = skillDetail.a ? ATTRIBUTE_NAMES[skillDetail.a as Attribute] : undefined

  const formatTime = (time?: number) => {
    if (time === undefined || time === null) return '0s'
    if (time === 0) return 'Instant'
    if (time < 1) return `${(time * 1000).toFixed(0)}ms`
    if (time % 1 === 0) return `${time}s`
    return `${time.toFixed(1)}s`
  }

  const formatDescription = (desc: string) => {
    return desc
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/%s(\d+)\.\.%s(\d+)/g, (match, min, max) => {
        const minVal = skillDetail.v?.s?.[0] || min
        const maxVal = skillDetail.v?.s?.[1] || max
        return `${minVal}...${maxVal}`
      })
      .replace(/%d(\d+)\.\.%d(\d+)/g, (match, min, max) => {
        const minVal = skillDetail.v?.d?.[0] || min
        const maxVal = skillDetail.v?.d?.[1] || max
        return `${minVal}...${maxVal}`
      })
      .replace(/%b(\d+)\.\.%b(\d+)/g, (match, min, max) => {
        const minVal = skillDetail.v?.b?.[0] || min
        const maxVal = skillDetail.v?.b?.[1] || max
        return `${minVal}...${maxVal}`
      })
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

      <div className="flex-1 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-lg border border-gray-200 shadow-xl p-6 mb-6">
            <div className="flex items-start gap-6 mb-6">
              <div className="flex-shrink-0">
                <Image
                  src={`/skills/${imageId}.jpg`}
                  alt={skillDetail.n}
                  width={96}
                  height={96}
                  className="rounded-lg border border-gray-300"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-4">
                  <h1 className="text-3xl font-bold text-gray-900">
                    {skillDetail.n}
                  </h1>
                  {skillDetail.e && (
                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                      Elite
                    </span>
                  )}
                </div>
                
                <div className="flex flex-wrap items-center gap-4 text-sm mb-4">
                  {skillDetail.z?.d !== undefined && skillDetail.z.d < 0 && (
                    <div className="flex items-center gap-2">
                      <Image src="/icons/Tango-upkeep.png" alt="Upkeep" width={18} height={18} />
                      <span className="text-purple-600 font-semibold">{Math.abs(skillDetail.z.d)}</span>
                    </div>
                  )}
                  
                  {skillDetail.z?.a !== undefined && skillDetail.z.a > 0 && (
                    <div className="flex items-center gap-2">
                      <Image src="/icons/Tango-adrenaline.png" alt="Adrenaline" width={18} height={18} />
                      <span className="text-yellow-600 font-semibold">{skillDetail.z.a}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Image src="/icons/Tango-energy.png" alt="Energy" width={18} height={18} />
                    <span className="text-blue-600 font-semibold">{skillDetail.z?.e || 0}</span>
                  </div>
                  
                  {skillDetail.z?.s !== undefined && skillDetail.z.s > 0 && (
                    <div className="flex items-center gap-2">
                      <Image src="/icons/Tango-sacrifice.png" alt="Sacrifice" width={18} height={18} />
                      <span className="text-red-700 font-semibold">{skillDetail.z.s}</span>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-2">
                    <Image src="/icons/Tango-activation-darker.png" alt="Activation" width={18} height={18} />
                    <span className="text-orange-600 font-semibold">{formatTime(skillDetail.z?.c)}</span>
                  </div>
                  
                  {skillDetail.z?.r !== undefined && skillDetail.z.r > 0 && (
                    <div className="flex items-center gap-2">
                      <Image src="/icons/Tango-recharge-darker.png" alt="Recharge" width={18} height={18} />
                      <span className="text-red-600 font-semibold">{formatTime(skillDetail.z.r)}</span>
                    </div>
                  )}
                  
                  {skillDetail.z?.x !== undefined && skillDetail.z.x > 0 && (
                    <div className="flex items-center gap-2">
                      <Image src="/icons/Tango-overcast.png" alt="Overcast" width={18} height={18} />
                      <span className="text-gray-600 font-semibold">{skillDetail.z.x}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-3">Description</h2>
              <div className="text-base text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-lg">
                <div dangerouslySetInnerHTML={{ __html: formatDescription(skillDetail.d) }} />
              </div>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Skill Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Type:</span>
                  <span className="ml-2 text-gray-900 font-semibold">{skillType}</span>
                </div>
                {profession && profession !== 'None' && (
                  <div className="flex items-center">
                    <span className="font-medium text-gray-600">Profession:</span>
                    <div className="ml-2 flex items-center gap-2">
                      <ProfessionImage profId={skillDetail.p as Profession} width={20} height={20} />
                      <span className="text-gray-900 font-semibold">{profession}</span>
                    </div>
                  </div>
                )}
                {attribute && attribute !== 'None' && (
                  <div>
                    <span className="font-medium text-gray-600">Attribute:</span>
                    <span className="ml-2 text-gray-900 font-semibold">{attribute}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 shadow-xl p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Matches Using This Skill</h2>
            
            {loading && matches.length === 0 ? (
              <p className="text-gray-600">Loading matches...</p>
            ) : matches.length === 0 ? (
              <p className="text-gray-600">No matches found using this skill.</p>
            ) : (
              <>
                <div className="mb-4 text-sm text-gray-600">
                  Found {pagination.total} matches
                </div>
                
                <div className="rounded-lg bg-white shadow border border-gray-300 overflow-hidden">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-gray-200">
                          <TableHead className="text-black font-semibold text-sm px-4">Date</TableHead>
                          <TableHead className="text-black font-semibold text-sm px-4">Map</TableHead>
                          <TableHead className="text-black font-semibold text-sm px-4">Event</TableHead>
                          <TableHead className="text-black font-semibold text-sm px-4">Player</TableHead>
                          <TableHead className="text-black font-semibold text-sm px-4">Team</TableHead>
                          <TableHead className="text-black font-semibold text-sm px-4">Skillbar</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {matches.map(match => (
                          match.players.map((player, idx) => (
                            <TableRow
                              key={`${match.match_id}-${player.player_number}-${idx}`}
                              className={`cursor-pointer hover:bg-gray-100 border-gray-200 transition-colors ${idx % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
                              onClick={() => window.open(`/match/${match.match_id}`, '_blank')}
                            >
                              <TableCell className="text-black text-sm px-4 py-3">
                                {new Date(match.match_date).toLocaleDateString("en-GB", {
                                  day: "2-digit",
                                  month: "short",
                                  year: "2-digit"
                                })}
                              </TableCell>
                              <TableCell className="text-black text-sm px-4 py-3">{match.map_name}</TableCell>
                              <TableCell className="text-black text-sm px-4 py-3">
                                {match.occasion.replace("Automated Tournaments", "ATs")}
                              </TableCell>
                              <TableCell className="text-black text-sm px-4 py-3">
                                <div className="font-medium">{player.encoded_name}</div>
                              </TableCell>
                              <TableCell className="text-black text-sm px-4 py-3">
                                <div className="flex items-center gap-1">
                                  <span className="font-medium">{player.guild_name}</span>
                                  <span className="text-gray-600">[{player.guild_tag}]</span>
                                </div>
                                <div className="text-xs text-gray-500">#{player.guild_rank}</div>
                              </TableCell>
                              <TableCell className="px-4 py-3">
                                <div onClick={(e) => e.stopPropagation()}>
                                  <PlayerSkills 
                                    skills={player.used_skills} 
                                    clickable={true}
                                    className="flex gap-1"
                                  />
                                </div>
                              </TableCell>
                            </TableRow>
                          ))
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                
                {pagination.hasMore && (
                  <div className="text-center mt-6">
                    <Button
                      onClick={() => loadMatches(false)}
                      disabled={loading}
                      variant="outline"
                      className="bg-white border-gray-300 text-black hover:bg-gray-100"
                    >
                      {loading ? 'Loading...' : 'Load More'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
