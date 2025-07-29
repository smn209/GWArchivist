import Link from "next/link"
import Image from "next/image"
import { Input } from "./ui/input"

export function Header() {
  return (
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
        <Input 
          placeholder="Search matches..." 
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
    </nav>
  )
} 