"use client"
import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Trophy, Filter } from "lucide-react"
import Image from "next/image"
import { Header } from "../components/Header"
import { ProfessionImage } from "../components/ProfessionImage"
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "../components/ui/table"
import { Input } from "../components/ui/input"
import { Button } from "../components/ui/button"
import { Select, SelectOption } from "../components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose, DialogBody, DialogFooter } from "../components/ui/dialog"
import { MemorialMatch, MemorialFilters, MemorialResponse, FilterOptions, PROFESSIONS } from "@/types"

function createEmptyFilters(): MemorialFilters {
  return {
    limit: 50,
    offset: 0
  }
}

export default function MemorialView() {
  const [matches, setMatches] = useState<MemorialMatch[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({ total: 0, limit: 50, offset: 0, hasMore: false })
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    occasions: [],
    fluxes: [],
    maps: [],
    guilds: []
  })
  const [showFilters, setShowFilters] = useState(false)
  const [filters, setFilters] = useState<MemorialFilters>(createEmptyFilters())
  const router = useRouter()

  const searchMatches = useCallback(async (newFilters: MemorialFilters, resetOffset = true) => {
    setLoading(true)
    try {
      const searchParams = new URLSearchParams()
      const filtersToUse = resetOffset ? { ...newFilters, offset: 0 } : newFilters

      Object.entries(filtersToUse).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          searchParams.append(key, value.toString())
        }
      })

      const response = await fetch(`/api/memorial?${searchParams}`)
      const data: MemorialResponse = await response.json()

      if (resetOffset) {
        setMatches(data.matches)
      } else {
        setMatches(prev => [...prev, ...data.matches])
      }

      setPagination(data.pagination)

      if (resetOffset) {
        setFilters(filtersToUse)
      }
    } catch (error) {
      console.error('failed to search matches:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const loadFilterOptions = async () => {
    try {
      const requests = ['occasions', 'fluxes', 'maps', 'guilds'].map(type =>
        fetch(`/api/memorial?type=${type}`)
          .then(res => {
            if (!res.ok) {
              throw new Error(`Failed to fetch ${type}: ${res.status}`)
            }
            return res.json()
          })
          .catch(error => {
            console.error(`Error fetching ${type}:`, error)
            return []
          })
      )

      const [occasions, fluxes, maps, guilds] = await Promise.all(requests)
      
      console.log('API responses:', { occasions, fluxes, maps, guilds }) // Debug log
      
      const uniqueOccasions = [...new Set(occasions || [])] as string[]
      const uniqueFluxes = [...new Set(fluxes || [])] as string[]
      const uniqueMaps = Array.isArray(maps) ? maps.filter((map: { map_id: number }, index: number, self: { map_id: number }[]) => 
        index === self.findIndex((m: { map_id: number }) => m.map_id === map.map_id)
      ) : []
      const uniqueGuilds = Array.isArray(guilds) ? guilds.filter((guild: { id: number }, index: number, self: { id: number }[]) => 
        index === self.findIndex((g: { id: number }) => g.id === guild.id)
      ) : []
      
      setFilterOptions({ 
        occasions: uniqueOccasions, 
        fluxes: uniqueFluxes, 
        maps: uniqueMaps, 
        guilds: uniqueGuilds 
      })
    } catch (error) {
      console.error('failed to load filter options:', error)
    }
  }

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const initialFilters = createEmptyFilters()
    
    if (urlParams.get('search')) initialFilters.search = urlParams.get('search')!
    if (urlParams.get('dateFrom')) initialFilters.dateFrom = urlParams.get('dateFrom')!
    if (urlParams.get('dateTo')) initialFilters.dateTo = urlParams.get('dateTo')!
    if (urlParams.get('mapId')) initialFilters.mapId = urlParams.get('mapId')!
    if (urlParams.get('flux')) initialFilters.flux = urlParams.get('flux')!
    if (urlParams.get('occasion')) initialFilters.occasion = urlParams.get('occasion')!
    if (urlParams.get('limit')) initialFilters.limit = parseInt(urlParams.get('limit')!) || 50
    if (urlParams.get('offset')) initialFilters.offset = parseInt(urlParams.get('offset')!) || 0
    
    for (let i = 1; i <= 10; i++) {
      const profCount = urlParams.get(`profession${i}Count`)
      if (profCount) {
        const key = `profession${i}Count` as keyof MemorialFilters
        ;(initialFilters as Record<string, unknown>)[key] = parseInt(profCount)
      }
    }
    
    setFilters(initialFilters)
    searchMatches(initialFilters, true)
    loadFilterOptions()
  }, [searchMatches])

  const handleFilterChange = (key: keyof MemorialFilters, value: unknown) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  
  const updateURLAndSearch = (newFilters: MemorialFilters) => {
    const params = new URLSearchParams()
    
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value !== undefined && value !== '' && value !== null && value !== 0) {
        params.set(key, value.toString())
      }
    })
    
    const newUrl = params.toString() ? `${window.location.pathname}?${params.toString()}` : window.location.pathname
    window.history.pushState({}, '', newUrl)
    
    searchMatches(newFilters, true)
  }

  const handleLoadMore = () => {
    const newFilters = { ...filters, offset: pagination.offset + pagination.limit }
    setFilters(newFilters)
    
    const params = new URLSearchParams(window.location.search)
    params.set('offset', newFilters.offset.toString())
    window.history.replaceState({}, '', `${window.location.pathname}?${params.toString()}`)
    
    searchMatches(newFilters, false)
  }

  const clearFilters = () => {
    const clearedFilters = createEmptyFilters()
    setFilters(clearedFilters)
    window.history.pushState({}, '', window.location.pathname)
    searchMatches(clearedFilters, true)
  }

  const setProfessionCount = (professionId: number, count: number) => {
    const newFilters = { ...filters }

    switch (professionId) {
      case 1: newFilters.profession1Count = count; break;
      case 2: newFilters.profession2Count = count; break;
      case 3: newFilters.profession3Count = count; break;
      case 4: newFilters.profession4Count = count; break;
      case 5: newFilters.profession5Count = count; break;
      case 6: newFilters.profession6Count = count; break;
      case 7: newFilters.profession7Count = count; break;
      case 8: newFilters.profession8Count = count; break;
      case 9: newFilters.profession9Count = count; break;
      case 10: newFilters.profession10Count = count; break;
    }

    setFilters(newFilters)
  }

  const getProfessionCount = (professionId: number): number => {
    switch (professionId) {
      case 1: return filters.profession1Count || 0;
      case 2: return filters.profession2Count || 0;
      case 3: return filters.profession3Count || 0;
      case 4: return filters.profession4Count || 0;
      case 5: return filters.profession5Count || 0;
      case 6: return filters.profession6Count || 0;
      case 7: return filters.profession7Count || 0;
      case 8: return filters.profession8Count || 0;
      case 9: return filters.profession9Count || 0;
      case 10: return filters.profession10Count || 0;
      default: return 0;
    }
  }

  const renderProfessionFilter = (profession: typeof PROFESSIONS[0]) => {
    const count = getProfessionCount(profession.id)

    return (
      <div key={profession.id} className="flex flex-col items-center space-y-1 p-1">
        <ProfessionImage profId={profession.id} width={28} height={28} className="rounded-sm" />
        <div className="text-xs text-center font-medium text-gray-700 leading-tight">{profession.name}</div>
        <div className="flex items-center space-x-1">
          <button
            type="button"
            className="h-5 w-5 border rounded text-xs flex items-center justify-center hover:bg-gray-100"
            onClick={() => setProfessionCount(profession.id, Math.max(0, count - 1))}
          >
            -
          </button>
          <input
            type="number"
            min="0"
            max="8"
            value={count || ''}
            onChange={(e) => {
              const val = parseInt(e.target.value) || 0
              setProfessionCount(profession.id, Math.max(0, Math.min(8, val)))
            }}
            className="h-5 w-10 text-center text-xs border rounded"
            placeholder="0"
          />
          <button
            type="button"
            className="h-5 w-5 border rounded text-xs flex items-center justify-center hover:bg-gray-100"
            onClick={() => setProfessionCount(profession.id, Math.min(8, count + 1))}
          >
            +
          </button>
        </div>
      </div>
    )
  }

  const renderMatchRow = (match: MemorialMatch, index: number) => {
    const isWinner1 = match.winner_guild_id === match.guild1_id

    return (
      <TableRow
        key={match.match_id}
        className={`cursor-pointer hover:bg-gray-100 border-gray-200 transition-colors ${index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}`}
        onClick={() => router.push(`/match/${match.match_id}`)}
      >
        <TableCell className="text-black text-xs px-2 py-1">
          {new Date(match.match_date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "2-digit"
          })}
        </TableCell>
        <TableCell className="text-black text-xs px-2 py-1">{match.map_name}</TableCell>
        <TableCell className="text-black text-xs px-2 py-1">{match.occasion.replace("Automated Tournaments", "ATs")}</TableCell>
        <TableCell className="text-black text-xs px-2 py-1">{match.duration_formatted}</TableCell>
        <TableCell className="text-black text-xs px-2 py-1">
          <div className="flex items-center gap-1">
            <span className="font-medium text-xs">{match.guild1_name}</span>
            <span className="text-gray-600 text-xs">[{match.guild1_tag}]</span>
            {isWinner1 && <span className="ml-1" aria-label="Winner">🏆</span>}
          </div>
          <div className="text-xs text-gray-500">#{match.guild1_rank}</div>
        </TableCell>
        <TableCell className="px-2 py-1">
          <div className="flex gap-0.5 flex-nowrap">
            {match.guild1_professions.filter(p => p != null).map((profId, idx) => (
              <ProfessionImage key={idx} profId={profId} width={16} height={16} className="flex-shrink-0" />
            ))}
          </div>
        </TableCell>
        <TableCell className="text-black text-xs px-2 py-1">
          <div className="flex items-center gap-1">
            <span className="font-medium text-xs">{match.guild2_name}</span>
            <span className="text-gray-600 text-xs">[{match.guild2_tag}]</span>
            {!isWinner1 && <span className="ml-1" aria-label="Winner">🏆</span>}
          </div>
          <div className="text-xs text-gray-500">#{match.guild2_rank}</div>
        </TableCell>
        <TableCell className="px-2 py-1">
          <div className="flex gap-0.5 flex-nowrap">
            {match.guild2_professions.filter(p => p != null).map((profId, idx) => (
              <ProfessionImage key={idx} profId={profId} width={16} height={16} className="flex-shrink-0" />
            ))}
          </div>
        </TableCell>
        <TableCell className="text-black text-xs px-2 py-1">{match.flux}</TableCell>
      </TableRow>
    )
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

      <Header showSearch={false} />

      <div className="text-center py-8">
        <h1 className="text-5xl font-bold mb-4 text-black">Memorial Archive</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Search through the complete archive of Guild Wars matches
        </p>
      </div>

      <div className="w-full max-w-7xl mx-auto px-4 mb-6">
        <div className="flex justify-center mb-4">
          <Button
            variant="outline"
            onClick={() => setShowFilters(true)}
            className="bg-white border-gray-300 text-black hover:bg-gray-100"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>

        <Dialog open={showFilters} onOpenChange={setShowFilters}>
          <DialogContent className="max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Advanced Filters
              </DialogTitle>
              <DialogClose onClose={() => setShowFilters(false)} />
            </DialogHeader>

            <DialogBody className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date From
                  </label>
                  <Input
                    type="date"
                    value={filters.dateFrom || ''}
                    onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Calendar className="h-4 w-4" />
                    Date To
                  </label>
                  <Input
                    type="date"
                    value={filters.dateTo || ''}
                    onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Image src="/icons/Main_PvP.png" alt="Map" width={16} height={16} />
                    Map
                  </label>
                  <Select
                    value={filters.mapId?.toString() || ''}
                    onChange={(e) => handleFilterChange('mapId', e.target.value || undefined)}
                  >
                    <SelectOption value="">All Maps</SelectOption>
                    {filterOptions.maps.map(map => {
                      const value = map.map_id && map.map_id !== null ? map.map_id.toString() : `map_${map.map_name}`
                      return (
                        <SelectOption key={`${map.map_id || 'null'}_${map.map_name}`} value={value}>
                          {map.map_name}
                        </SelectOption>
                      )
                    })}
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Image src="/icons/Flux.jpg" alt="Flux" width={16} height={16} />
                    Flux
                  </label>
                  <Select
                    value={filters.flux || ''}
                    onChange={(e) => handleFilterChange('flux', e.target.value)}
                  >
                    <SelectOption value="">All Flux Types</SelectOption>
                    {filterOptions.fluxes.map(flux => (
                      <SelectOption key={flux} value={flux}>{flux}</SelectOption>
                    ))}
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    Occasion
                  </label>
                  <Select
                    value={filters.occasion || ''}
                    onChange={(e) => handleFilterChange('occasion', e.target.value)}
                  >
                    <SelectOption value="">All Occasions</SelectOption>
                    {filterOptions.occasions.map(occasion => (
                      <SelectOption key={occasion} value={occasion}>{occasion}</SelectOption>
                    ))}
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-lg font-medium flex items-center gap-2">
                  <Image src="/icons/PvP.jpg" alt="Professions" width={20} height={20} />
                  Professions
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-8 xl:grid-cols-10 gap-2 bg-gray-50 p-3 rounded-lg">
                  {PROFESSIONS.map(renderProfessionFilter)}
                </div>
              </div>
            </DialogBody>

            <DialogFooter>
              <Button variant="outline" onClick={clearFilters} disabled={loading}>
                Clear All
              </Button>
              <Button
                onClick={() => {
                  updateURLAndSearch(filters)
                  setShowFilters(false)
                }}
                disabled={loading}
              >
                Apply Filters
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex-1 w-full max-w-7xl mx-auto px-4">
        <div className="mb-4 text-center">
          <p className="text-black">
            {loading ? 'searching...' : `found ${pagination.total} matches`}
            {filters.search && ` for "${filters.search}"`}
          </p>
        </div>

        <div className="rounded-lg bg-white shadow-xl border border-gray-300 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-gray-200">
                  <TableHead className="text-black font-semibold text-xs px-2 w-20">Date</TableHead>
                  <TableHead className="text-black font-semibold text-xs px-2 w-24">Map</TableHead>
                  <TableHead className="text-black font-semibold text-xs px-2 w-20">Event</TableHead>
                  <TableHead className="text-black font-semibold text-xs px-2 w-16">Time</TableHead>
                  <TableHead className="text-black font-semibold text-xs px-2 w-32">Team 1</TableHead>
                  <TableHead className="text-black font-semibold text-xs px-2 w-36">Lineup</TableHead>
                  <TableHead className="text-black font-semibold text-xs px-2 w-32">Team 2</TableHead>
                  <TableHead className="text-black font-semibold text-xs px-2 w-36">Lineup</TableHead>
                  <TableHead className="text-black font-semibold text-xs px-2 w-16">Flux</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {matches.map(renderMatchRow)}
              </TableBody>
            </Table>
          </div>
        </div>

        {pagination.hasMore && (
          <div className="text-center mt-6">
            <Button
              onClick={handleLoadMore}
              disabled={loading}
              variant="outline"
              className="bg-white border-gray-300 text-black hover:bg-gray-100"
            >
              {loading ? 'loading...' : 'load more'}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}