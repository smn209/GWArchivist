'use client'
import { memo } from 'react'
import { 
  getSkillDetails, 
  getSkillImageId, 
  getSkillTypeName,
  PROFESSION_NAMES,
  ATTRIBUTE_NAMES,
  type SkillDetail,
  type Profession,
  type Attribute
} from '../lib/skills'
import Image from 'next/image'

interface SkillTooltipProps {
  skillId: number
}

export const SkillTooltip = memo(function SkillTooltip({ skillId }: SkillTooltipProps) {
  const skillDetail = getSkillDetails(skillId)
  const imageId = getSkillImageId(skillId)
  
  if (!skillDetail) {
    return (
      <div className="min-w-[300px]">
        <div className="text-gray-400">Skill #{skillId}</div>
        <div className="text-sm text-gray-500">No data available</div>
      </div>
    )
  }

  const profession = PROFESSION_NAMES[skillDetail.p as Profession]
  const skillType = getSkillTypeName(skillDetail)
  const attribute = skillDetail.a ? ATTRIBUTE_NAMES[skillDetail.a as Attribute] : undefined

  const formatTime = (time?: number) => {
    if (time === undefined || time === null) return '0s'
    if (time === 0) return 'Instant'
    if (time < 1) return `${(time * 1000).toFixed(0)}ms`
    if (time % 1 === 0) return `${time}s`
    return `${time.toFixed(1)}s`
  }

  const formatDescription = (desc: string) => {
    return desc
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/%s(\d+)\.\.%s(\d+)/g, (match, min, max) => {
        const minVal = skillDetail.v?.s?.[0] || min
        const maxVal = skillDetail.v?.s?.[1] || max
        return `${minVal}...${maxVal}`
      })
      .replace(/%d(\d+)\.\.%d(\d+)/g, (match, min, max) => {
        const minVal = skillDetail.v?.d?.[0] || min
        const maxVal = skillDetail.v?.d?.[1] || max
        return `${minVal}...${maxVal}`
      })
      .replace(/%b(\d+)\.\.%b(\d+)/g, (match, min, max) => {
        const minVal = skillDetail.v?.b?.[0] || min
        const maxVal = skillDetail.v?.b?.[1] || max
        return `${minVal}...${maxVal}`
      })
  }

  return (
    <div className="min-w-[350px] max-w-[450px] p-3 rounded-lg">
      <div className="flex items-start gap-3 mb-3">
        <div className="flex-shrink-0">
          <Image
            src={`/skills/${imageId}.jpg`}
            alt={skillDetail.n}
            width={64}
            height={64}
            className="rounded border border-gray-300"
          />
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-bold text-gray-900 text-lg leading-tight mb-2">
            {skillDetail.n}
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            {/* Upkeep (negative value means upkeep cost) */}
            {skillDetail.z?.d !== undefined && skillDetail.z.d < 0 && (
              <div className="flex items-center gap-1">
                <Image src="/icons/Tango-upkeep.png" alt="Upkeep" width={16} height={16} />
                <span className="text-purple-600">{Math.abs(skillDetail.z.d)}</span>
              </div>
            )}
            
            {/* Adrenaline requirement */}
            {skillDetail.z?.a !== undefined && skillDetail.z.a > 0 && (
              <div className="flex items-center gap-1">
                <Image src="/icons/Tango-adrenaline.png" alt="Adrenaline" width={16} height={16} />
                <span className="text-yellow-600">{skillDetail.z.a}</span>
              </div>
            )}
            
            {/* Energy cost */}
            <div className="flex items-center gap-1">
              <Image src="/icons/Tango-energy.png" alt="Energy" width={16} height={16} />
              <span className="text-blue-600">{skillDetail.z?.e || 0}</span>
            </div>
            
            {/* Sacrifice (health cost) */}
            {skillDetail.z?.s !== undefined && skillDetail.z.s > 0 && (
              <div className="flex items-center gap-1">
                <Image src="/icons/Tango-sacrifice.png" alt="Sacrifice" width={16} height={16} />
                <span className="text-red-700">{skillDetail.z.s}</span>
              </div>
            )}
            
            {/* Activation/Cast time */}
            <div className="flex items-center gap-1">
              <Image src="/icons/Tango-activation-darker.png" alt="Activation" width={16} height={16} />
              <span className="text-orange-600">{formatTime(skillDetail.z?.c)}</span>
            </div>
            
            {/* Recharge time */}
            {skillDetail.z?.r !== undefined && skillDetail.z.r > 0 && (
              <div className="flex items-center gap-1">
                <Image src="/icons/Tango-recharge-darker.png" alt="Recharge" width={16} height={16} />
                <span className="text-red-600">{formatTime(skillDetail.z.r)}</span>
              </div>
            )}
            
            {/* Overcast cost */}
            {skillDetail.z?.x !== undefined && skillDetail.z.x > 0 && (
              <div className="flex items-center gap-1">
                <Image src="/icons/Tango-overcast.png" alt="Overcast" width={16} height={16} />
                <span className="text-gray-600">{skillDetail.z.x}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="text-sm text-gray-700 leading-relaxed mb-2">
        <div dangerouslySetInnerHTML={{ __html: formatDescription(skillDetail.d) }} />
      </div>

      <div className="text-xs text-gray-500 flex items-center gap-2">
        <span>{skillType}</span>
        {profession && profession !== 'None' && (
          <>
            <span>•</span>
            <span>{profession}</span>
          </>
        )}
        {attribute && attribute !== 'None' && (
          <>
            <span>•</span>
            <span>{attribute}</span>
          </>
        )}
        {skillDetail.e && (
          <>
            <span>•</span>
            <span className="text-yellow-600 font-medium">Elite</span>
          </>
        )}
      </div>
    </div>
  )
})
