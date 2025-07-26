'use client'
import { memo } from 'react'
import { SkillImage } from './SkillImage'
import { PlayerSkillsProps } from '@/types'

const containerStyle = { display: 'flex', gap: 2 }
const emptySkillStyle = { width: 40, height: 40, background: '#f5f5f5', borderRadius: 2 }

export const PlayerSkills = memo(function PlayerSkills({ 
  skills, 
  className 
}: PlayerSkillsProps) {
  return (
    <div className={className} style={containerStyle}>
      {skills.map((skill, i) =>
        skill === 0 ? (
          <div key={`empty-${i}`} style={emptySkillStyle} />
        ) : (
          <SkillImage key={`skill-${skill}-${i}`} skillId={skill} width={40} height={40} />
        )
      )}
    </div>
  )
}) 