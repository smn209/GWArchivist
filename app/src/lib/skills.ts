import rawSkillsData from './skills.data.json'
import skillsDetailData from '../../public/skills.json'

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

export enum Profession {
  None = 0,
  Warrior = 1,
  Ranger = 2,
  Monk = 3,
  Necromancer = 4,
  Mesmer = 5,
  Elementalist = 6,
  Assassin = 7,
  Ritualist = 8,
  Paragon = 9,
  Dervish = 10,
}

export enum Attribute {
  FastCasting = 0,
  IllusionMagic = 1,
  DominationMagic = 2,
  InspirationMagic = 3,
  BloodMagic = 4,
  DeathMagic = 5,
  SoulReaping = 6,
  Curses = 7,
  AirMagic = 8,
  EarthMagic = 9,
  FireMagic = 10,
  WaterMagic = 11,
  EnergyStorage = 12,
  HealingPrayers = 13,
  SmitingPrayers = 14,
  ProtectionPrayers = 15,
  DivineFavor = 16,
  Strength = 17,
  AxeMastery = 18,
  HammerMastery = 19,
  Swordsmanship = 20,
  Tactics = 21,
  BeastMastery = 22,
  Expertise = 23,
  WildernessSurvival = 24,
  Marksmanship = 25,
  DaggerMastery = 29,
  DeadlyArts = 30,
  ShadowArts = 31,
  Communing = 32,
  RestorationMagic = 33,
  ChannelingMagic = 34,
  CriticalStrikes = 35,
  SpawningPower = 36,
  SpearMastery = 37,
  Command = 38,
  Motivation = 39,
  Leadership = 40,
  ScytheMastery = 41,
  WindPrayers = 42,
  EarthPrayers = 43,
  Mysticism = 44,
  None = 51,
}

export enum SkillType {
  Skill = 10,
  Stance = 3,
  HexSpell = 4,
  Spell = 5,
  EnchantmentSpell = 6,
  Signet = 7,
  WellSpell = 9,
  WardSpell = 11,
  Glyph = 12,
  Attack = 14,
  Shout = 15,
  Preparation = 19,
  PetAttack = 20,
  Trap = 21,
  Ritual = 22,
  ItemSpell = 24,
  WeaponSpell = 25,
  Form = 26,
  Chant = 27,
  Echo = 28,
}

export enum Title {
  KurzickRank = 5,
  LuxonRank = 6,
  SunspearRank = 17,
  LightbringerRank = 20,
  AsuraRank = 38,
  DeldrimorRank = 39,
  EbonVanguardRank = 40,
  NornRank = 41,
}

export interface SkillDetail {
  n: string;       // name
  d: string;       // description
  cd: string;      // concise description
  t: SkillType;    // type
  p: Profession;   // profession
  a?: Attribute;   // attribute
  tt?: Title;      // title
  e?: 1;           // elite
  c: number;       // campaign
  z?: {            // stats
    d?: number;    // upkeep (negative = upkeep cost)
    a?: number;    // adrenaline requirement
    e?: number;    // energy cost
    s?: number;    // sacrifice (health cost)
    c?: number;    // activation/cast time in seconds
    r?: number;    // recharge time in seconds
    x?: number;    // overcast cost
    sp?: number;   // special flags
    co?: number;   // combo type (for attacks)
    q?: number;    // weapon/attack requirement
  };
  v?: Partial<Record<'s' | 'b' | 'd', [number, number]>>;  // variable values
}

export const PROFESSION_NAMES: Record<Profession, string> = {
  [Profession.None]: 'None',
  [Profession.Warrior]: 'Warrior',
  [Profession.Ranger]: 'Ranger',
  [Profession.Monk]: 'Monk',
  [Profession.Necromancer]: 'Necromancer',
  [Profession.Mesmer]: 'Mesmer',
  [Profession.Elementalist]: 'Elementalist',
  [Profession.Assassin]: 'Assassin',
  [Profession.Ritualist]: 'Ritualist',
  [Profession.Paragon]: 'Paragon',
  [Profession.Dervish]: 'Dervish',
}

export const ATTRIBUTE_NAMES: Record<Attribute, string> = {
  [Attribute.FastCasting]: 'Fast Casting',
  [Attribute.IllusionMagic]: 'Illusion Magic',
  [Attribute.DominationMagic]: 'Domination Magic',
  [Attribute.InspirationMagic]: 'Inspiration Magic',
  [Attribute.BloodMagic]: 'Blood Magic',
  [Attribute.DeathMagic]: 'Death Magic',
  [Attribute.SoulReaping]: 'Soul Reaping',
  [Attribute.Curses]: 'Curses',
  [Attribute.AirMagic]: 'Air Magic',
  [Attribute.EarthMagic]: 'Earth Magic',
  [Attribute.FireMagic]: 'Fire Magic',
  [Attribute.WaterMagic]: 'Water Magic',
  [Attribute.EnergyStorage]: 'Energy Storage',
  [Attribute.HealingPrayers]: 'Healing Prayers',
  [Attribute.SmitingPrayers]: 'Smiting Prayers',
  [Attribute.ProtectionPrayers]: 'Protection Prayers',
  [Attribute.DivineFavor]: 'Divine Favor',
  [Attribute.Strength]: 'Strength',
  [Attribute.AxeMastery]: 'Axe Mastery',
  [Attribute.HammerMastery]: 'Hammer Mastery',
  [Attribute.Swordsmanship]: 'Swordsmanship',
  [Attribute.Tactics]: 'Tactics',
  [Attribute.BeastMastery]: 'Beast Mastery',
  [Attribute.Expertise]: 'Expertise',
  [Attribute.WildernessSurvival]: 'Wilderness Survival',
  [Attribute.Marksmanship]: 'Marksmanship',
  [Attribute.DaggerMastery]: 'Dagger Mastery',
  [Attribute.DeadlyArts]: 'Deadly Arts',
  [Attribute.ShadowArts]: 'Shadow Arts',
  [Attribute.Communing]: 'Communing',
  [Attribute.RestorationMagic]: 'Restoration Magic',
  [Attribute.ChannelingMagic]: 'Channeling Magic',
  [Attribute.CriticalStrikes]: 'Critical Strikes',
  [Attribute.SpawningPower]: 'Spawning Power',
  [Attribute.SpearMastery]: 'Spear Mastery',
  [Attribute.Command]: 'Command',
  [Attribute.Motivation]: 'Motivation',
  [Attribute.Leadership]: 'Leadership',
  [Attribute.ScytheMastery]: 'Scythe Mastery',
  [Attribute.WindPrayers]: 'Wind Prayers',
  [Attribute.EarthPrayers]: 'Earth Prayers',
  [Attribute.Mysticism]: 'Mysticism',
  [Attribute.None]: 'None',
}

const skillsData = rawSkillsData as unknown as SkillData[]
const skillsDetails = skillsDetailData as (SkillDetail | null)[]

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

export function getSkillDetails(skillId: number): SkillDetail | null {
  if (skillId <= 0 || skillId >= skillsDetails.length) {
    return null
  }
  return skillsDetails[skillId]
}

export function getSkillBasicData(skillId: number): SkillData | null {
  return skillsData.find(skill => skill[0] === skillId) || null
}

export function getSkillTypeName(skillDetail: SkillDetail): string {
  if (skillDetail.e) {
    return `Elite ${getTypeName(skillDetail)}`
  }
  return getTypeName(skillDetail)
}

function getTypeName(skillDetail: SkillDetail): string {
  switch (skillDetail.t) {
    case SkillType.Stance:
      return 'Stance'
    case SkillType.HexSpell:
      return 'Hex Spell'
    case SkillType.Spell:
      return 'Spell'
    case SkillType.EnchantmentSpell:
      if (skillDetail.z?.sp && skillDetail.z.sp & 0x800000) {
        return 'Flash Enchantment Spell'
      }
      return 'Enchantment Spell'
    case SkillType.Signet:
      return 'Signet'
    case SkillType.WellSpell:
      return 'Well Spell'
    case SkillType.Skill:
      if (skillDetail.z?.sp && skillDetail.z.sp & 0x2) {
        return 'Touch Skill'
      }
      return 'Skill'
    case SkillType.WardSpell:
      return 'Ward Spell'
    case SkillType.Glyph:
      return 'Glyph'
    case SkillType.Attack:
      switch (skillDetail.z?.q) {
        case 1:
          return 'Axe Attack'
        case 2:
          return 'Bow Attack'
        case 8:
          switch (skillDetail.z?.co) {
            case 1:
              return 'Lead Attack'
            case 2:
              return 'Off-Hand Attack'
            case 3:
              return 'Dual Attack'
            default:
              return 'Dagger Attack'
          }
        case 16:
          return 'Hammer Attack'
        case 32:
          return 'Scythe Attack'
        case 64:
          return 'Spear Attack'
        case 70:
          return 'Ranged Attack'
        case 128:
          return 'Sword Attack'
      }
      return 'Melee Attack'
    case SkillType.Shout:
      return 'Shout'
    case SkillType.Preparation:
      return 'Preparation'
    case SkillType.PetAttack:
      return 'Pet Attack'
    case SkillType.Trap:
      return 'Trap'
    case SkillType.Ritual:
      switch (skillDetail.p) {
        case Profession.Ritualist:
          return 'Binding Ritual'
        case Profession.Ranger:
          return 'Nature Ritual'
        default:
          return 'Ebon Vanguard Ritual'
      }
    case SkillType.ItemSpell:
      return 'Item Spell'
    case SkillType.WeaponSpell:
      return 'Weapon Spell'
    case SkillType.Form:
      return 'Form'
    case SkillType.Chant:
      return 'Chant'
    case SkillType.Echo:
      return 'Echo'
    default:
      return 'Skill'
  }
}

export type { SkillData }
export { skillsData }