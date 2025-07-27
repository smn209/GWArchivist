"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Search, Calendar, Trophy, Filter, Plus, Minus, Crown } from "lucide-react"
import Image from "next/image"
import { Wallpaper } from "../components/Wallpaper"
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

  useEffect(() => {
    loadFilterOptions()
  }, [])

  useEffect(() => {
    searchMatches()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const loadFilterOptions = async () => {
    try {
      const requests = ['occasions', 'fluxes', 'maps', 'guilds'].map(type =>
        fetch('/api/memorial', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ type })
        }).then(res => res.json())
      )

      const [occasions, fluxes, maps, guilds] = await Promise.all(requests)
      setFilterOptions({ occasions, fluxes, maps, guilds })
    } catch (error) {
      console.error('failed to load filter options:', error)
    }
  }

  const searchMatches = async (newFilters: MemorialFilters = filters, resetOffset = true) => {
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
  }

  const handleFilterChange = (key: keyof MemorialFilters, value: unknown) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleSearch = () => {
    searchMatches(filters, true)
  }

  const handleLoadMore = () => {
    const newFilters = { ...filters, offset: pagination.offset + pagination.limit }
    searchMatches(newFilters, false)
  }

  const clearFilters = () => {
    const clearedFilters = createEmptyFilters()
    setFilters(clearedFilters)
    searchMatches(clearedFilters, true)
  }

  const setProfessionCount = (professionId: number, count: number) => {
    const newFilters = { ...filters }
    const key = `profession${professionId}Count`
    newFilters[key] = count
    setFilters(newFilters)
  }

  const getProfessionCount = (professionId: number) => {
    const key = `profession${professionId}Count`
    return filters[key] || 0
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
        className={`cursor-pointer hover:bg-white/20 border-white/10 transition-colors ${index % 2 === 0 ? 'bg-white/5' : 'bg-white/8'}`}
        onClick={() => router.push(`/match/${match.match_id}`)}
      >
        <TableCell className="text-white text-xs px-2 py-1">
          {new Date(match.match_date).toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
            year: "2-digit"
          })}
        </TableCell>
        <TableCell className="text-white text-xs px-2 py-1">{match.map_name}</TableCell>
        <TableCell className="text-white text-xs px-2 py-1">{match.occasion.replace('Automated Tournaments', 'ATs')}</TableCell>
        <TableCell className="text-white text-xs px-2 py-1">{match.duration_formatted}</TableCell>
        <TableCell className="text-white text-xs px-2 py-1">
          <div className="flex items-center gap-1">
            <span className="font-medium text-xs">{match.guild1_name}</span>
            <span className="text-gray-300 text-xs">[{match.guild1_tag}]</span>
            {isWinner1 && <Crown className="h-3 w-3 text-yellow-400 flex-shrink-0" />}
          </div>
          <div className="text-xs text-gray-400">#{match.guild1_rank}</div>
        </TableCell>
        <TableCell className="px-2 py-1">
          <div className="flex gap-0.5 flex-nowrap">
            {match.guild1_professions.filter(p => p != null).map((profId, idx) => (
              <ProfessionImage key={idx} profId={profId} width={16} height={16} className="flex-shrink-0" />
            ))}
          </div>
        </TableCell>
        <TableCell className="text-white text-xs px-2 py-1">
          <div className="flex items-center gap-1">
            <span className="font-medium text-xs">{match.guild2_name}</span>
            <span className="text-gray-300 text-xs">[{match.guild2_tag}]</span>
            {!isWinner1 && <Crown className="h-3 w-3 text-yellow-400 flex-shrink-0" />}
          </div>
          <div className="text-xs text-gray-400">#{match.guild2_rank}</div>
        </TableCell>
        <TableCell className="px-2 py-1">
          <div className="flex gap-0.5 flex-nowrap">
            {match.guild2_professions.filter(p => p != null).map((profId, idx) => (
              <ProfessionImage key={idx} profId={profId} width={16} height={16} className="flex-shrink-0" />
            ))}
          </div>
        </TableCell>
        <TableCell className="text-white text-xs px-2 py-1">{match.flux}</TableCell>
      </TableRow>
    )
  }

  return (
    <>
      <Wallpaper src="/wallpapers/concepts/_4s7__concept_art.jpg">
        <div className="fixed inset-0 bg-black/20" />
      </Wallpaper>
      
      <div className="relative min-h-screen flex flex-col w-full py-8 z-10">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold mb-4 text-white drop-shadow-2xl">Memorial Archive</h1>
          <p className="text-lg text-gray-200 drop-shadow-lg max-w-2xl mx-auto">
            Search through the complete archive of Guild Wars matches 
          </p>
        </div>

        <div className="w-full max-w-7xl mx-auto px-4 mb-6">
          <div className="flex gap-4 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by guild name, tag, or player pseudo..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="pl-10 bg-white/90 border-white/20 text-black placeholder:text-gray-500"
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setShowFilters(true)}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20"
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
                      onChange={(e) => handleFilterChange('mapId', e.target.value ? parseInt(e.target.value) : undefined)}
                    >
                      <SelectOption value="">All Maps</SelectOption>
                      {filterOptions.maps.map(map => (
                        <SelectOption key={map.map_id} value={map.map_id.toString()}>
                          {map.map_name}
                        </SelectOption>
                      ))}
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
                    handleSearch()
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
            <p className="text-white drop-shadow-lg">
              {loading ? 'searching...' : `found ${pagination.total} matches`}
              {filters.search && ` for "${filters.search}"`}
            </p>
          </div>

          <div className="rounded-lg bg-white/10 backdrop-blur-sm shadow-xl border border-white/20 overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/20">
                    <TableHead className="text-white font-semibold text-xs px-2 w-20">Date</TableHead>
                    <TableHead className="text-white font-semibold text-xs px-2 w-24">Map</TableHead>
                    <TableHead className="text-white font-semibold text-xs px-2 w-20">Event</TableHead>
                    <TableHead className="text-white font-semibold text-xs px-2 w-16">Time</TableHead>
                    <TableHead className="text-white font-semibold text-xs px-2 w-32">Team 1</TableHead>
                    <TableHead className="text-white font-semibold text-xs px-2 w-36">Lineup</TableHead>
                    <TableHead className="text-white font-semibold text-xs px-2 w-32">Team 2</TableHead>
                    <TableHead className="text-white font-semibold text-xs px-2 w-36">Lineup</TableHead>
                    <TableHead className="text-white font-semibold text-xs px-2 w-16">Flux</TableHead>
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
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                {loading ? 'loading...' : 'load more'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}