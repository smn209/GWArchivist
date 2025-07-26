import { memo } from "react"
import Image from "next/image"
import { WallpaperProps } from '@/types'

const containerClass = "fixed inset-0 -z-10 w-full h-full"
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
        className="object-cover"
        priority
        sizes="100vw"
        quality={75}
        loading="eager"
      />
      <div className={contentClass}>{children}</div>
    </div>
  )
}) 