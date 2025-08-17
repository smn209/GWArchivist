"use client"

import { MatchHoverTooltip } from './MatchHoverTooltip'
import { ProfessionImage } from './ProfessionImage'
import { MatchDetail } from '@/types'

interface ProfessionLineupProps {
  professions: number[]
  matchDetail?: MatchDetail
  iconSize?: number
}

export function ProfessionLineup({ professions, matchDetail, iconSize = 20 }: ProfessionLineupProps) {
  const containerClass = iconSize === 16 ? "flex gap-0.5 flex-nowrap" : "flex gap-1"
  const itemClass = iconSize === 16 ? "flex-shrink-0" : ""
  
  return (
    <MatchHoverTooltip matchDetail={matchDetail} triggerOnHover={true}>
      <div className={containerClass} role="list" aria-label="Team professions">
        {professions.filter(profId => profId != null).map((profId: number, idx: number) => (
          <div key={idx} role="listitem">
            <ProfessionImage profId={profId} width={iconSize} height={iconSize} className={itemClass} />
          </div>
        ))}
      </div>
    </MatchHoverTooltip>
  )
}
