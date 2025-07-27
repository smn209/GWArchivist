import { memo } from "react"
import Image from "next/image"
import { WallpaperProps } from '@/types'

const containerClass = "fixed inset-0 -z-10 w-full h-full overflow-hidden"
const contentClass = "relative w-full h-full"

export const Wallpaper = memo(function Wallpaper({ 
  children, 
  src = "/wallpapers/meditation.png" 
}: WallpaperProps) {
  return (
    <div className={containerClass}>
      <Image  
        src={src}
        alt="Background wallpaper"
        fill
        className="object-cover object-center will-change-auto"
        priority
        sizes="100vw"
        quality={85}
        loading="eager"
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkrHB0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyLDSGZQRAiRhJE8q"
      />
      <div className={contentClass}>{children}</div>
    </div>
  )
}) 