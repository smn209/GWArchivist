import rawSkillsData from './skills.data.json'

type SkillData = [
  id: number,           // ID
  name: string,         // Name
  activation: number,   // Activation
  recharge: number,     // Recharge
  type: number,         // Type
  energy: number,       // Energy Cost
  flags: number,        // Flags
  flags2: number,       // Flags2
  target: number,       // Target
  attribute: number,    // Attribute
  profession: number,   // Profession
  campaign: number,     // Campaign
  rarity: number,       // Rarity
  progression: number,  // Progression
  linkId: number        // Link ID
]

const skillsData = rawSkillsData as unknown as SkillData[]

const pvpToPveSkillMap = new Map<number, number>()
const pveSkills = new Set<number>()

skillsData.forEach((skill) => {
  const [id, , , , , , , , , , , , , , linkId] = skill
  
  if (linkId !== 0) {

    const linkedSkill = skillsData.find(s => s[0] === linkId)
    
    if (linkedSkill) {
      const [linkedId, , , , , , flags] = linkedSkill
      const isPvP = (flags & 4194304) !== 0 
      
      if (isPvP) {
        pveSkills.add(id)
        pvpToPveSkillMap.set(linkId, id)
      } else {
        pveSkills.add(linkedId)
        pvpToPveSkillMap.set(id, linkedId)
      }
    }
  }
})

export function getSkillImageId(skillId: number): number {
  return pvpToPveSkillMap.get(skillId) || skillId
}

export function isPvESkill(skillId: number): boolean {
  return pveSkills.has(skillId)
}

export type { SkillData }
export { skillsData } 