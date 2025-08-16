'use client'
import { memo } from 'react'
import { ProfessionImage } from './ProfessionImage'
import { PlayerSkills } from './PlayerSkills'
import { PlayerDetailsProps } from '@/types'

const playerCardStyle = {
  background: '#fff',
  border: '1px solid #eee',
  borderRadius: 4,
  padding: 8,
  marginBottom: 4,
  color: '#111',
  display: 'flex',
  alignItems: 'center',
  gap: 8,
  minWidth: 320,
  maxWidth: 570,
  width: '100%',
  height: 70
}

const playerInfoStyle = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'flex-start',
  gap: 4,
  minWidth: 120,
  maxWidth: 200,
  flex: 1
}

const professionIconsStyle = {
  display: 'flex',
  gap: 2,
  alignItems: 'center'
}

const pseudoStyle = { 
  fontWeight: 500,
  fontSize: 16,
  whiteSpace: 'nowrap' as const,
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  width: '100%'
}

const skillsContainerStyle = {
  display: 'flex',
  gap: 1,
  marginLeft: 'auto',
  flexShrink: 0
}

export const PlayerDetails = memo(function PlayerDetails({ player, skillsClickable = false }: PlayerDetailsProps) {
  return (
    <div style={playerCardStyle}>
      <div style={playerInfoStyle}>
        <div style={professionIconsStyle}>
          {player.build.primary > 0 && (
            <ProfessionImage profId={player.build.primary} width={20} height={20} />
          )}
          {player.build.secondary > 0 && (
            <ProfessionImage profId={player.build.secondary} width={20} height={20} />
          )}
        </div>
        <div style={pseudoStyle}>{player.pseudo.name}</div>
      </div>
      <div style={skillsContainerStyle}>
        <PlayerSkills skills={player.build.skills} clickable={skillsClickable} />
      </div>
    </div>
  )
}) 