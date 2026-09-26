export const ITEM_LIBRARY = [
  { id: "goblin_tooth", name: "ゴブリンの牙", rarity: "COMMON", icon: "🦷", value: 8, type: "material" },
  { id: "orc_fang", name: "オークの牙", rarity: "UNCOMMON", icon: "🪓", value: 18, type: "material" },
  { id: "demon_core", name: "デーモンコア", rarity: "RARE", icon: "💠", value: 52, type: "material" },
  { id: "dragon_scale", name: "ドラゴンスケール", rarity: "EPIC", icon: "🪙", value: 100, type: "material" },
  { id: "phoenix_feather", name: "不死鳥の羽", rarity: "LEGENDARY", icon: "🪶", value: 220, type: "material" },
  { id: "iron_sword", name: "鉄の剣", rarity: "COMMON", icon: "🗡️", value: 30, type: "equipment", slot: "weapon", bonus: { atk: 2, crit: 0, hp: 0 } },
  { id: "leather_armor", name: "革鎧", rarity: "COMMON", icon: "🛡️", value: 30, type: "equipment", slot: "armor", bonus: { atk: 0, crit: 0, hp: 12 } },
  { id: "sapphire_ring", name: "サファイアリング", rarity: "RARE", icon: "💍", value: 80, type: "equipment", slot: "accessory", bonus: { atk: 1, crit: 4, hp: 5 } },
  { id: "dragon_blade", name: "竜剣", rarity: "EPIC", icon: "⚔️", value: 140, type: "equipment", slot: "weapon", bonus: { atk: 8, crit: 5, hp: 2 } },
  { id: "guardian_mail", name: "守護鎧", rarity: "EPIC", icon: "🧥", value: 150, type: "equipment", slot: "armor", bonus: { atk: 0, crit: 1, hp: 26 } },
  { id: "moon_talisman", name: "月の守護符", rarity: "LEGENDARY", icon: "✨", value: 240, type: "equipment", slot: "accessory", bonus: { atk: 5, crit: 8, hp: 18 } }
];

export const DROP_TABLES = {
  goblin: ["goblin_tooth", "orc_fang"],
  orc: ["orc_fang", "demon_core"],
  demon: ["demon_core", "dragon_scale", "phoenix_feather"]
};

export const RARITY_ORDER = ["COMMON", "UNCOMMON", "RARE", "EPIC", "LEGENDARY"];

export function pickDropForStage(stage) {
  const baseChance = Math.min(0.9, 0.2 + stage * 0.02);

  if (Math.random() > baseChance) {
    return null;
  }

  const roll = Math.random();
  const rarity =
    roll < 0.6 ? "COMMON" : roll < 0.82 ? "UNCOMMON" : roll < 0.94 ? "RARE" : roll < 0.99 ? "EPIC" : "LEGENDARY";

  const item = ITEM_LIBRARY.filter((entry) => entry.rarity === rarity);
  const chosen = item[Math.floor(Math.random() * item.length)] ?? ITEM_LIBRARY[0];

  return {
    ...chosen,
    rarity,
    droppedAt: Date.now()
  };
}
