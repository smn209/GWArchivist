'use client'
import Image from 'next/image'
import { memo, useState, useCallback, useEffect } from 'react'
import { ProfessionImageProps } from '@/types'

const fallbackStyle = { background: 'transparent', borderRadius: 2 }
const imageStyle = { background: 'transparent', borderRadius: 2 }

const professionNames: Record<number, string> = {
  1: 'Warrior',
  2: 'Ranger', 
  3: 'Monk',
  4: 'Necromancer',
  5: 'Mesmer',
  6: 'Elementalist',
  7: 'Assassin',
  8: 'Ritualist',
  9: 'Paragon',
  10: 'Dervish'
}

export const ProfessionImage = memo(function ProfessionImage({ 
  profId, 
  width, 
  height, 
  className 
}: ProfessionImageProps) {
  const [hasError, setHasError] = useState(false)
  const [isClient, setIsClient] = useState(false)
  
  useEffect(() => {
    setIsClient(true)
  }, [])
  
  const handleError = useCallback(() => setHasError(true), [])
  const professionName = professionNames[profId] || `Profession ${profId}`
  
  if (!profId || profId === undefined || hasError) {
    return (
      <div 
        style={{ width, height, ...fallbackStyle }} 
        className={className}
        aria-label={`Unknown profession`}
        role="img"
      />
    )
  }

  if (!isClient) {
    return (
      <div 
        style={{ width, height, ...fallbackStyle }} 
        className={className}
        aria-label={professionName}
        role="img"
      />
    )
  }
  
  return (
    <Image
      src={`/professions/${profId}.png`}
      alt={professionName}
      width={width}
      height={height}
      className={className}
      onError={handleError}
      style={imageStyle}
      priority={width <= 32}
      loading={width <= 32 ? "eager" : "lazy"}
      quality={75}
      title={professionName}
    />
  )
}) 