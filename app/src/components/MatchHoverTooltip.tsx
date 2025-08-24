"use client"

import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { ProfessionImage } from './ProfessionImage'
import { PlayerSkills } from './PlayerSkills'
import { MatchDetail, Player } from '@/types'

interface MatchHoverTooltipProps {
  matchDetail?: MatchDetail
  children: React.ReactElement
  triggerOnHover?: boolean
}

interface TeamSkillBarsProps {
  players: Player[]
  guild: { name: string; tag: string }
  isWinner?: boolean
}

function TeamSkillBars({ players, guild, isWinner }: TeamSkillBarsProps) {
  return (
    <div className="bg-white border border-gray-200 rounded p-2 min-w-[240px]">
      <div className="text-xs font-medium text-gray-700 mb-2 text-center">
        {guild.name} [{guild.tag}] {isWinner && '🏆'}
      </div>
      
      <div className="space-y-1">
        {players
          .sort((a, b) => a.player_number - b.player_number)
          .map((player, idx) => (
            <div key={`${player.agent_id || player.id}-${idx}`} className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                <ProfessionImage 
                  profId={player.primary_profession || player.primary} 
                  width={14} 
                  height={14} 
                />
                <span className="text-gray-400 text-xs">/</span>
                <ProfessionImage 
                  profId={player.secondary_profession || player.secondary} 
                  width={14} 
                  height={14} 
                />
              </div>
              
              <div className="flex-1">
                <PlayerSkills 
                  skills={player.used_skills} 
                  clickable={false}
                  size={24}
                  className="flex gap-0.5"
                />
              </div>
            </div>
          ))}
      </div>
    </div>
  )
}

export function MatchHoverTooltip({ matchDetail, children, triggerOnHover = false }: MatchHoverTooltipProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  const handleMouseEnter = (e: React.MouseEvent) => {
    setIsHovered(true)
    setMousePosition({ x: e.clientX, y: e.clientY })
  }

  const handleMouseLeave = () => {
    setIsHovered(false)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ x: e.clientX, y: e.clientY })
  }

  if (!matchDetail || !matchDetail.parties) {
    return children
  }

  const team1Players = matchDetail.parties["1"]?.PLAYER || []
  const team2Players = matchDetail.parties["2"]?.PLAYER || []
  
  if (team1Players.length === 0 || team2Players.length === 0) {
    return children
  }

  const guilds = Object.values(matchDetail.guilds)
  const guild1 = guilds.find(g => team1Players.some(p => p.guild_id === g.id))
  const guild2 = guilds.find(g => team2Players.some(p => p.guild_id === g.id))
  
  if (!guild1 || !guild2) {
    return children
  }

  const isGuild1Winner = matchDetail.match_info.winner_guild_id === guild1.id

  return (
    <>
      {triggerOnHover ? React.cloneElement(children, {
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        onMouseMove: handleMouseMove,
      } as Partial<React.DOMAttributes<Element>>) : children}
      
      {isHovered && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: mousePosition.x + 15,
            top: mousePosition.y - 120,
            transform: mousePosition.x > window.innerWidth - 600 ? 'translateX(-100%)' : 'none'
          }}
        >
          <div className="flex gap-2 bg-white border border-gray-300 rounded-lg shadow-xl p-1 max-w-none">
            <TeamSkillBars
              players={team1Players}
              guild={guild1}
              isWinner={isGuild1Winner}
            />
            
            <TeamSkillBars
              players={team2Players}
              guild={guild2}
              isWinner={!isGuild1Winner}
            />
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
