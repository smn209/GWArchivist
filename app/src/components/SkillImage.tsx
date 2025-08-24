'use client'
import Image from 'next/image'
import { memo, useState, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { getSkillImageId } from '../lib/skills'
import { SkillImageProps } from '@/types'
import { Tooltip, TooltipTrigger, TooltipContent } from './ui/tooltip'
import { SkillTooltip } from './SkillTooltip'

const fallbackStyle = { background: '#f5f5f5', borderRadius: 2 }
const imageStyle = { background: '#fff', borderRadius: 2 }

export const SkillImage = memo(function SkillImage({ 
  skillId, 
  width, 
  height, 
  className,
  showTooltip = true,
  clickable = false
}: SkillImageProps) {
  const [hasError, setHasError] = useState(false)
  const router = useRouter()
  
  const imageId = useMemo(() => getSkillImageId(skillId), [skillId])
  const handleError = useCallback(() => setHasError(true), [])
  const handleClick = useCallback(() => {
    if (clickable && skillId !== 0) {
      router.push(`/skill/${skillId}`)
    }
  }, [clickable, skillId, router])
  
  const skillImage = (
    <Image
      src={`/skills/${imageId}.jpg`}
      alt={String(skillId)}
      width={width}
      height={height}
      className={`${className} transition-transform duration-200 hover:scale-105 ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
      onError={(e) => {
        e.preventDefault()
        handleError()
      }}
      onClick={handleClick}
      style={imageStyle}
      priority={width <= 40}
      loading={width <= 40 ? "eager" : "lazy"}
      quality={75}
      unoptimized={false}
    />
  )

  const fallbackDiv = (
    <div 
      style={{ width, height, ...fallbackStyle }} 
      className={`${className} transition-transform duration-200 hover:scale-105 ${clickable ? 'cursor-pointer' : 'cursor-default'}`}
      onClick={handleClick}
    />
  )
  
  if (hasError) {
    return showTooltip && skillId !== 0 ? (
      <Tooltip>
        <TooltipTrigger asChild>
          {fallbackDiv}
        </TooltipTrigger>
        <TooltipContent side="left" sideOffset={8}>
          <SkillTooltip skillId={skillId} />
        </TooltipContent>
      </Tooltip>
    ) : fallbackDiv
  }
  
  return showTooltip && skillId !== 0 ? (
    <Tooltip>
      <TooltipTrigger asChild>
        {skillImage}
      </TooltipTrigger>
      <TooltipContent side="left" sideOffset={8}>
        <SkillTooltip skillId={skillId} />
      </TooltipContent>
    </Tooltip>
  ) : skillImage
}) 