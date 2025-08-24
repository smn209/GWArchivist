'use client'
import { memo } from 'react'
import { getSkillDetails, getSkillImageId, getSkillTypeName, PROFESSION_NAMES, ATTRIBUTE_NAMES, type Profession, type Attribute } from '../lib/skills'
import Image from 'next/image'

interface SkillTooltipProps {
  skillId: number
}

export const SkillTooltip = memo(function SkillTooltip({ skillId }: SkillTooltipProps) {
  const skillDetail = getSkillDetails(skillId)
  const imageId = getSkillImageId(skillId)
  
  if (!skillDetail) {
    return (
      <div className="w-[420px] p-3">
        <div className="text-gray-400">Skill #{skillId}</div>
        <div className="text-sm text-gray-500">No data available</div>
      </div>
    )
  }

  const profession = PROFESSION_NAMES[skillDetail.p as Profession]
  const skillType = getSkillTypeName(skillDetail)
  const attribute = skillDetail.a ? ATTRIBUTE_NAMES[skillDetail.a as Attribute] : undefined

  const formatTime = (time?: number) => {
    if (!time) return time === 0 ? 'Instant' : '0s'
    return time < 1 ? `${(time * 1000).toFixed(0)}ms` : `${time}s`
  }

  const wrapText = (text: string) => {
    const formatted = text
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/%[sdb](\d+)\.\.%[sdb](\d+)/g, (match, min, max) => `${min}...${max}`)
    
    return formatted.split(' ').reduce((lines: string[], word, i) => {
      const currentLine = lines[lines.length - 1] || ''
      const testLine = currentLine ? `${currentLine} ${word}` : word
      
      if (testLine.length <= 50) {
        lines[lines.length - 1] = testLine
      } else {
        lines.push(word)
      }
      
      if (i === 0 && !lines.length) lines.push(word)
      return lines
    }, []).join('<br/>')
  }

  const stats = [
    { condition: (skillDetail.z?.d || 0) < 0, icon: 'Tango-upkeep.png', value: Math.abs(skillDetail.z?.d || 0), color: 'text-purple-600' },
    { condition: (skillDetail.z?.a || 0) > 0, icon: 'Tango-adrenaline.png', value: skillDetail.z?.a, color: 'text-yellow-600' },
    { condition: true, icon: 'Tango-energy.png', value: skillDetail.z?.e || 0, color: 'text-blue-600' },
    { condition: (skillDetail.z?.s || 0) > 0, icon: 'Tango-sacrifice.png', value: skillDetail.z?.s, color: 'text-red-700' },
    { condition: true, icon: 'Tango-activation-darker.png', value: formatTime(skillDetail.z?.c), color: 'text-orange-600' },
    { condition: (skillDetail.z?.r || 0) > 0, icon: 'Tango-recharge-darker.png', value: formatTime(skillDetail.z?.r), color: 'text-red-600' },
    { condition: (skillDetail.z?.x || 0) > 0, icon: 'Tango-overcast.png', value: skillDetail.z?.x, color: 'text-gray-600' }
  ].filter(stat => stat.condition)

  const metadata = [skillType, profession !== 'None' && profession, attribute !== 'None' && attribute, skillDetail.e && 'Elite'].filter(Boolean)

  return (
    <div className="w-[420px] p-3 rounded-lg">
      <div className="flex items-start gap-3 mb-3">
        <Image src={`/skills/${imageId}.jpg`} alt={skillDetail.n} width={64} height={64} className="rounded border border-gray-300" />
        <div className="flex-1">
          <div className="font-bold text-gray-900 text-lg mb-2">{skillDetail.n}</div>
          <div className="flex flex-wrap gap-3 text-sm">
            {stats.map((stat, i) => (
              <div key={i} className="flex items-center gap-1">
                <Image src={`/icons/${stat.icon}`} alt="" width={16} height={16} />
                <span className={stat.color}>{stat.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="text-sm text-gray-700 mb-2" dangerouslySetInnerHTML={{ __html: wrapText(skillDetail.d) }} />
      <div className="text-xs text-gray-500">
        {metadata.map((item, i) => (
          <span key={i} className={item === 'Elite' ? 'text-yellow-600 font-medium' : ''}>
            {i > 0 && ' • '}{item}
          </span>
        ))}
      </div>
    </div>
  )
})
