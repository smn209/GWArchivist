import Link from "next/link"
import Image from "next/image"
import { Input } from "./ui/input"

export function Header() {
  return (
    <nav className="w-full flex items-center justify-between py-4 bg-black/5 z-50 gap-4 px-20" role="navigation" aria-label="Main navigation"> 
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
          className="max-w-xs w-full bg-transparent border-white text-white placeholder:text-white/60 focus:ring-2 focus:ring-white/50 focus:border-white" 
          aria-label="Search matches"
        />
      </div>
      <div className="flex-1 flex justify-end">
        <Link 
          href="/memorial" 
          className="px-4 py-2 rounded-md hover:bg-white/10 transition-colors font-medium text-white focus:outline-none focus:ring-2 focus:ring-white/50"
          aria-label="Go to Memorial page"
        >
          Memorial
        </Link>
      </div>
    </nav>
  )
} 