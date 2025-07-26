'use client'
import Image from 'next/image'
import { memo, useState, useCallback, useEffect } from 'react'
import { ProfessionImageProps } from '@/types'

const fallbackStyle = { background: '#f5f5f5', borderRadius: 2 }
const imageStyle = { background: '#fff', borderRadius: 2 }

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
  
  if (!profId || profId === undefined || hasError) {
    return <div style={{ width, height, ...fallbackStyle }} className={className} />
  }

  if (!isClient) {
    return <div style={{ width, height, ...fallbackStyle }} className={className} />
  }
  
  return (
    <Image
      src={`/professions/${profId}.png`}
      alt={String(profId)}
      width={width}
      height={height}
      className={className}
      onError={handleError}
      style={imageStyle}
      priority={width <= 24}
      loading={width <= 24 ? "eager" : "lazy"}
      quality={75}
    />
  )
}) 