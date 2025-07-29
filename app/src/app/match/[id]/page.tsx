import { notFound } from "next/navigation"
import { MatchView } from '../../../views/MatchView'
import type { Metadata } from 'next'

export const revalidate = 1800

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:3000"}/api/matchs/${id}`, { 
      cache: "force-cache",
      next: { revalidate: 1800 }
    })
    
    if (!res.ok) {
      return {
        title: 'Match Not Found',
        description: 'The requested match could not be found.'
      }
    }
    
    const data = await res.json()
    const [guild1, guild2] = Object.values(data.guilds) as { name: string; tag: string }[]
    
    return {
      title: `${guild1?.name} vs ${guild2?.name} - Match ${id}`,
      description: `Guild Wars match between ${guild1?.name} [${guild1?.tag}] and ${guild2?.name} [${guild2?.tag}] on ${data.match_info?.match_date}`
    }
  } catch {
    return {
      title: `Match ${id}`,
      description: 'Guild Wars match details'
    }
  }
}

export async function generateStaticParams() {
  return []
}

export default async function MatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || "http://127.0.0.1:3000"}/api/matchs/${id}`, { 
      cache: "force-cache",
      next: { revalidate: 1800 }
    })
    
    if (!res.ok) return notFound()
    
    const data = await res.json()

    if (!data.match_info || !data.guilds || !data.parties) {
      return notFound()
    }

    return <MatchView data={data} />
  } catch {
    return notFound()
  }
}
