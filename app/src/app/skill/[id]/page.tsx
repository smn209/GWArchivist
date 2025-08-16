import { notFound } from "next/navigation"
import { SkillDetailView } from '../../../views/SkillDetailView'
import type { Metadata } from 'next'
import { getSkillDetails } from '../../../lib/skills'

export const revalidate = 86400

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params
  const skillId = parseInt(id)
  
  if (isNaN(skillId)) {
    return {
      title: 'Skill Not Found',
      description: 'The requested skill could not be found.'
    }
  }
  
  const skillDetail = getSkillDetails(skillId)
  
  if (!skillDetail) {
    return {
      title: 'Skill Not Found',
      description: 'The requested skill could not be found.'
    }
  }
  
  return {
    title: `${skillDetail.n} - Guild Wars Skill`,
    description: `${skillDetail.n} - ${skillDetail.d?.slice(0, 150)}...`
  }
}

export async function generateStaticParams() {
  return []
}

export default async function SkillPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const skillId = parseInt(id)
  
  if (isNaN(skillId)) {
    return notFound()
  }
  
  const skillDetail = getSkillDetails(skillId)
  
  if (!skillDetail) {
    return notFound()
  }

  return <SkillDetailView skillId={skillId} />
}
