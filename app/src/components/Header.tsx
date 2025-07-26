import Link from "next/link"
import { Input } from "./ui/input"

export function Header() {
  return (
    <nav className="w-full flex items-center justify-between py-4 bg-background z-50 gap-4 px-20"> 
      <div className="flex-1" />
      <div className="flex-1 flex justify-center">
        <Input placeholder="Search" className="max-w-xs w-full" />
      </div>
      <div className="flex-1 flex justify-end">
        <Link href="/memorial" className="px-4 py-2 rounded-md hover:bg-accent transition-colors font-medium">Memorial</Link>
      </div>
    </nav>
  )
} 