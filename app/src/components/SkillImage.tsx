'use client'
import Image from 'next/image'
import { memo, useState, useCallback, useMemo } from 'react'
import { getSkillImageId } from '../lib/skills'
import { SkillImageProps } from '@/types'

const fallbackStyle = { background: '#f5f5f5', borderRadius: 2 }
const imageStyle = { background: '#fff', borderRadius: 2 }

export const SkillImage = memo(function SkillImage({ 
  skillId, 
  width, 
  height, 
  className 
}: SkillImageProps) {
  const [hasError, setHasError] = useState(false)
  
  const imageId = useMemo(() => getSkillImageId(skillId), [skillId])
  const handleError = useCallback(() => setHasError(true), [])
  
  if (hasError) {
    return <div style={{ width, height, ...fallbackStyle }} className={className} />
  }
  
  return (
    <Image
      src={`/skills/${imageId}.jpg`}
      alt={String(skillId)}
      width={width}
      height={height}
      className={className}
      onError={handleError}
      style={imageStyle}
      priority={width <= 40}
      loading={width <= 40 ? "eager" : "lazy"}
      quality={75}
    />
  )
}) 