export const EQUIPMENT_LIBRARY = [
  {
    id: "iron_sword",
    name: "鉄の剣",
    rarity: "COMMON",
    icon: "🗡️",
    slot: "weapon",
    type: "equipment",
    bonus: { atk: 2, crit: 0, hp: 0 },
    baseCost: 25
  },
  {
    id: "leather_armor",
    name: "革鎧",
    rarity: "COMMON",
    icon: "🛡️",
    slot: "armor",
    type: "equipment",
    bonus: { atk: 0, crit: 0, hp: 14 },
    baseCost: 30
  },
  {
    id: "sapphire_ring",
    name: "サファイアリング",
    rarity: "RARE",
    icon: "💍",
    slot: "accessory",
    type: "equipment",
    bonus: { atk: 1, crit: 4, hp: 5 },
    baseCost: 70
  },
  {
    id: "dragon_blade",
    name: "竜剣",
    rarity: "EPIC",
    icon: "⚔️",
    slot: "weapon",
    type: "equipment",
    bonus: { atk: 8, crit: 5, hp: 2 },
    baseCost: 110
  },
  {
    id: "guardian_mail",
    name: "守護鎧",
    rarity: "EPIC",
    icon: "🧥",
    slot: "armor",
    type: "equipment",
    bonus: { atk: 0, crit: 1, hp: 26 },
    baseCost: 120
  },
  {
    id: "moon_talisman",
    name: "月の守護符",
    rarity: "LEGENDARY",
    icon: "✨",
    slot: "accessory",
    type: "equipment",
    bonus: { atk: 5, crit: 8, hp: 18 },
    baseCost: 180
  }
];

export const EQUIPMENT_SLOTS = ["weapon", "armor", "accessory"];

export function getEquipmentUpgradeCost(itemId, level) {
  const item = EQUIPMENT_LIBRARY.find((entry) => entry.id === itemId);
  if (!item) return 999999;
  return Math.floor(item.baseCost * Math.pow(1.7, level));
}
