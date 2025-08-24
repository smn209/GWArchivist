import Link from "next/link"
import Image from "next/image"
import { Input } from "./ui/input"
import { useRouter, usePathname } from "next/navigation"
import { useState } from "react"

interface HeaderProps {
  searchPlaceholder?: string
  showSearch?: boolean
  onSearch?: (query: string) => void
  showBanner?: boolean
}

export function Header({ 
  searchPlaceholder = "Search matches...", 
  showSearch = true,
  onSearch,
  showBanner = true
}: HeaderProps = {}) {
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const pathname = usePathname()
  
  const getWallpaperForRoute = () => {
    if (pathname.startsWith('/skills')) {
      return "/wallpapers/concepts/_Twin_Towers__concept_art.jpg"
    }
    if (pathname.startsWith('/skill/')) {
      return "/wallpapers/concepts/_Twin_Towers__concept_art.jpg"
    }
    if (pathname.startsWith('/memorial')) {
      return "/wallpapers/concepts/_Tower_Scene__concept_art.jpg"
    }
    if (pathname.startsWith('/match')) {
      return "/wallpapers/uncharted.png"
    }
    return "/wallpapers/concepts/_4s7__concept_art.jpg"
  }
  
  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      if (onSearch) {
        onSearch(searchQuery.trim())
      } else {
        router.push(`/memorial?search=${encodeURIComponent(searchQuery.trim())}`)
      }
    }
  }

  return (
    <>
      {showBanner && (
        <div className="relative w-full h-[20vh]">
          <Image 
            src={getWallpaperForRoute()} 
            alt="Guild Wars Concept Art" 
            fill
            className="object-cover"
          />
        </div>
      )}
      <nav className="w-full flex items-center justify-between py-4 bg-white border-b border-gray-200 z-50 gap-4 px-20" role="navigation" aria-label="Main navigation"> 
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
        {showSearch ? (
          <Input 
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
            className="max-w-xs w-full bg-white border-gray-300 text-black placeholder:text-gray-500 focus:ring-2 focus:ring-gray-400 focus:border-gray-400" 
            aria-label={searchPlaceholder}
          />
        ) : (
          <span className="text-black font-medium">Search in archive</span>
        )}
      </div>
      <div className="flex-1 flex justify-end gap-2">
        <Link 
          href="/skills" 
          className="px-4 py-2 rounded-md hover:bg-gray-100 transition-colors font-medium text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
          aria-label="Go to Skills page"
        >
          Skills
        </Link>
        <Link 
          href="/memorial" 
          className="px-4 py-2 rounded-md hover:bg-gray-100 transition-colors font-medium text-black focus:outline-none focus:ring-2 focus:ring-gray-400"
          aria-label="Go to Memorial page"
        >
          Memorial
        </Link>
      </div>
    </nav>
    </>
  )
} 