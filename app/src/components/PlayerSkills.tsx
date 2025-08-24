'use client'
import { memo } from 'react'
import { SkillImage } from './SkillImage'
import { PlayerSkillsProps } from '@/types'



export const PlayerSkills = memo(function PlayerSkills({ 
  skills, 
  className,
  clickable = false,
  size = 40
}: PlayerSkillsProps & { size?: number }) {
  const dynamicContainerStyle = { display: 'flex', gap: 1, height: size }
  const dynamicEmptyStyle = { width: size, height: size, background: '#f5f5f5', borderRadius: 2 }
  
  return (
    <div className={className} style={dynamicContainerStyle}>
      {skills.map((skill, i) =>
        skill === 0 ? (
          <div key={`empty-${i}`} style={dynamicEmptyStyle} />
        ) : (
          <SkillImage 
            key={`skill-${skill}-${i}`} 
            skillId={skill} 
            width={size} 
            height={size} 
            clickable={clickable}
          />
        )
      )}
    </div>
  )
}) 