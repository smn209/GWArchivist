"use client"

import { useState, useMemo, useEffect } from 'react'
import { 
  Profession, 
  Attribute,
  PROFESSION_NAMES, 
  ATTRIBUTE_NAMES,
  getSkillDetails,
  getSkillImageId
} from '../lib/skills'
import { ProfessionImage } from '../components/ProfessionImage'
import { SkillImage } from '../components/SkillImage'
import { Tooltip, TooltipTrigger, TooltipContent } from '../components/ui/tooltip'
import { SkillTooltip } from '../components/SkillTooltip'
import Image from 'next/image'
import Link from 'next/link'
import { Input } from '../components/ui/input'

const PROFESSION_ATTRIBUTES: Record<Profession, Attribute[]> = {
  [Profession.None]: [],
  [Profession.Warrior]: [
    Attribute.Strength, Attribute.AxeMastery, Attribute.HammerMastery, 
    Attribute.Swordsmanship, Attribute.Tactics
  ],
  [Profession.Ranger]: [
    Attribute.BeastMastery, Attribute.Expertise, Attribute.WildernessSurvival, Attribute.Marksmanship
  ],
  [Profession.Monk]: [
    Attribute.DivineFavor, Attribute.HealingPrayers, Attribute.ProtectionPrayers, Attribute.SmitingPrayers
  ],
  [Profession.Necromancer]: [
    Attribute.SoulReaping, Attribute.BloodMagic, Attribute.DeathMagic, Attribute.Curses
  ],
  [Profession.Mesmer]: [
    Attribute.FastCasting, Attribute.DominationMagic, Attribute.IllusionMagic, Attribute.InspirationMagic
  ],
  [Profession.Elementalist]: [
    Attribute.EnergyStorage, Attribute.AirMagic, Attribute.EarthMagic, 
    Attribute.FireMagic, Attribute.WaterMagic
  ],
  [Profession.Assassin]: [
    Attribute.CriticalStrikes, Attribute.DaggerMastery, Attribute.DeadlyArts, Attribute.ShadowArts
  ],
  [Profession.Ritualist]: [
    Attribute.SpawningPower, Attribute.Communing, Attribute.RestorationMagic, Attribute.ChannelingMagic
  ],
  [Profession.Paragon]: [
    Attribute.Leadership, Attribute.SpearMastery, Attribute.Command, Attribute.Motivation
  ],
  [Profession.Dervish]: [
    Attribute.Mysticism, Attribute.WindPrayers, Attribute.EarthPrayers, Attribute.ScytheMastery
  ]
}

const SkillItem = ({ skillId, skillName }: { skillId: number; skillName: string }) => {
  const [hasValidImage, setHasValidImage] = useState(false)
  const [imageChecked, setImageChecked] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const img = document.createElement('img')
    img.onload = () => {
      setHasValidImage(true)
      setImageChecked(true)
    }
    img.onerror = () => {
      setHasValidImage(false)
      setImageChecked(true)
    }
    img.src = `/skills/${getSkillImageId(skillId)}.jpg`
  }, [skillId])

  if (!imageChecked || !hasValidImage) return null

  return (
    <div className="flex items-center gap-2 hover:bg-gray-50 py-1 px-2 rounded transition-colors">
      <SkillImage 
        skillId={skillId} 
        width={28} 
        height={28}
        className="flex-shrink-0"
      />
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="text-sm text-gray-700 cursor-pointer hover:text-gray-900">
            {skillName}
          </span>
        </TooltipTrigger>
        <TooltipContent side="right" sideOffset={8}>
          <SkillTooltip skillId={skillId} />
        </TooltipContent>
      </Tooltip>
    </div>
  )
}

export function SkillsView() {
  const [selectedProfession, setSelectedProfession] = useState<Profession>(Profession.Warrior)
  const [searchQuery, setSearchQuery] = useState("")

  const professionSkills = useMemo(() => {
    const skillsByAttribute: Record<Attribute, { id: number; name: string }[]> = {} as Record<Attribute, { id: number; name: string }[]>
    
    PROFESSION_ATTRIBUTES[selectedProfession].forEach(attr => {
      skillsByAttribute[attr] = []
    })

    for (let i = 0; i < 4000; i++) {
      const skillDetail = getSkillDetails(i)
      
      if (skillDetail && skillDetail.p === selectedProfession && skillDetail.a !== undefined && skillDetail.n && skillDetail.n.trim()) {
        const attr = skillDetail.a as Attribute
        if (skillsByAttribute[attr]) {
          const skillName = skillDetail.n.toLowerCase()
          if (!searchQuery || skillName.includes(searchQuery.toLowerCase())) {
            skillsByAttribute[attr].push({ id: i, name: skillDetail.n })
          }
        }
      }
    }

    Object.keys(skillsByAttribute).forEach(attr => {
      skillsByAttribute[attr as unknown as Attribute].sort((a, b) => a.name.localeCompare(b.name))
    })

    return skillsByAttribute
  }, [selectedProfession, searchQuery])

  const professions = [
    Profession.Warrior, Profession.Ranger, Profession.Monk, Profession.Necromancer,
    Profession.Mesmer, Profession.Elementalist, Profession.Assassin, 
    Profession.Ritualist, Profession.Paragon, Profession.Dervish
  ]

  return (
    <div className="min-h-screen flex flex-col w-full bg-white">
      <div className="relative w-full h-[15vh]">
        <Image 
          src="/wallpapers/concepts/_4s7__concept_art.jpg" 
          alt="Guild Wars Concept Art" 
          fill
          className="object-cover"
        />
      </div>
      
      <div className="w-full flex items-center justify-between py-4 px-20 border-b border-gray-200">
        <div className="flex-1">
          <Link href="/" className="inline-block hover:opacity-80 transition-opacity">
            <Image 
              src="/icons/The_Frog.png" 
              alt="The Frog logo" 
              width={40} 
              height={40}
              className="rounded"
            />
          </Link>
        </div>
        <div className="flex-1 flex justify-center">
          <Input 
            placeholder="Search skills..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs w-full bg-white border-gray-300 text-black placeholder:text-gray-500" 
          />
        </div>
        <div className="flex-1 flex justify-end">
          <Link 
            href="/memorial" 
            className="px-4 py-2 rounded-md hover:bg-gray-100 transition-colors font-medium text-black"
          >
            Memorial
          </Link>
        </div>
      </div>

      <div className="flex-1 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Title */}
          <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">Guild Wars Skills</h1>
          
          <div className="flex justify-center mb-8">
            <div className="flex gap-1 p-1 bg-gray-50 rounded-md border border-gray-200">
              {professions.map(profession => (
                <button
                  key={profession}
                  onClick={() => setSelectedProfession(profession)}
                  className={`p-2 rounded transition-all duration-300 transform ${
                    selectedProfession === profession
                      ? 'bg-white shadow-sm border border-gray-300 scale-110'
                      : 'hover:bg-gray-100 hover:scale-105'
                  }`}
                  title={PROFESSION_NAMES[profession]}
                >
                  <ProfessionImage profId={profession} width={24} height={24} />
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {PROFESSION_ATTRIBUTES[selectedProfession].map(attribute => {
              const skills = professionSkills[attribute] || []
              
              if (skills.length === 0 && searchQuery) return null
              
              return (
                <div key={attribute} className="mb-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-3 border-b border-gray-200 pb-1">
                    {ATTRIBUTE_NAMES[attribute]} ({skills.length})
                  </h3>
                  
                  <div className="space-y-1">
                    {skills.length === 0 ? (
                      <p className="text-gray-500 text-sm">
                        {searchQuery ? 'No skills found' : 'No skills available'}
                      </p>
                    ) : (
                      skills.map(skill => (
                        <SkillItem 
                          key={skill.id} 
                          skillId={skill.id} 
                          skillName={skill.name} 
                        />
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
