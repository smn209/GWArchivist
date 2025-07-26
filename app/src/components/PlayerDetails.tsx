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
  marginBottom: 8,
  color: '#111'
}

const headerStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 6,
  marginBottom: 6
}

const nameStyle = { fontWeight: 500 }
const idStyle = { color: '#555', fontSize: 12 }
const infoStyle = { fontSize: 12, color: '#555', marginTop: 2 }

export const PlayerDetails = memo(function PlayerDetails({ player }: PlayerDetailsProps) {
  return (
    <div style={playerCardStyle}>
      <div style={headerStyle}>
        <ProfessionImage profId={player.build.primary} width={24} height={24} />
        <ProfessionImage profId={player.build.secondary} width={24} height={24} />
        <span style={nameStyle}>{player.pseudo.name}</span>
        <span style={idStyle}>#{player.pseudo.id}</span>
      </div>
      <PlayerSkills skills={player.build.skills} />
      <div style={infoStyle}>Position: {player.position} | Guild: {player.guild_id}</div>
    </div>
  )
}) 