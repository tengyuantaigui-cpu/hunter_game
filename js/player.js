import { getUpgradeCost } from "../data/upgrades.js";
import { EQUIPMENT_LIBRARY } from "../data/equipment.js";

export function buildPlayerState(savedState = {}) {
  const state = savedState.player ?? {
    gold: 0,
    stage: 1,
    heroLevel: 1,
    heroExp: 0,
    rebirthCount: 0,
    rebirthPoints: 0,
    totalKills: 0,
    bossKills: 0,
    upgrades: { atk: 0, crit: 0, hp: 0 },
    permanentUpgrades: { permAtkLevel: 0 },
    equipment: { weapon: "iron_sword", armor: "leather_armor", accessory: null },
    equipmentLevels: { iron_sword: 0, leather_armor: 0 }
  };

  return {
    gold: Number(state.gold) || 0,
    stage: Number(state.stage) || 1,
    heroLevel: Math.max(1, Number(state.heroLevel) || 1),
    heroExp: Math.max(0, Number(state.heroExp) || 0),
    rebirthCount: Number(state.rebirthCount) || 0,
    rebirthPoints: Number(state.rebirthPoints) || 0,
    totalKills: Number(state.totalKills) || 0,
    bossKills: Number(state.bossKills) || 0,
    upgrades: {
      atk: Number(state.upgrades?.atk) || 0,
      crit: Number(state.upgrades?.crit) || 0,
      hp: Number(state.upgrades?.hp) || 0
    },
    permanentUpgrades: {
      permAtkLevel: Number(state.permanentUpgrades?.permAtkLevel) || 0
    },
    equipment: {
      weapon: state.equipment?.weapon || "iron_sword",
      armor: state.equipment?.armor || "leather_armor",
      accessory: state.equipment?.accessory || null
    },
    equipmentLevels: {
      iron_sword: Number(state.equipmentLevels?.iron_sword) || 0,
      leather_armor: Number(state.equipmentLevels?.leather_armor) || 0,
      sapphire_ring: Number(state.equipmentLevels?.sapphire_ring) || 0,
      dragon_blade: Number(state.equipmentLevels?.dragon_blade) || 0,
      guardian_mail: Number(state.equipmentLevels?.guardian_mail) || 0,
      moon_talisman: Number(state.equipmentLevels?.moon_talisman) || 0
    }
  };
}

export function getHeroExpToNext(level = 1) {
  return 45 + (Math.max(1, level) - 1) * 35;
}

export function applyHeroGrowth(playerState, gainedExp = 0) {
  if (!Number.isFinite(gainedExp) || gainedExp <= 0) {
    return { leveled: false, level: playerState.heroLevel, exp: playerState.heroExp };
  }

  const beforeLevel = Math.max(1, Number(playerState.heroLevel) || 1);
  let currentLevel = beforeLevel;
  let currentExp = Math.max(0, Number(playerState.heroExp) || 0);
  let totalGain = gainedExp;

  while (totalGain > 0) {
    const needed = getHeroExpToNext(currentLevel);
    const remaining = needed - currentExp;

    if (totalGain < remaining) {
      currentExp += totalGain;
      totalGain = 0;
      break;
    }

    totalGain -= remaining;
    currentLevel += 1;
    currentExp = 0;
  }

  playerState.heroLevel = currentLevel;
  playerState.heroExp = currentExp;

  return {
    leveled: currentLevel > beforeLevel,
    level: currentLevel,
    exp: currentExp
  };
}

export function getEquipmentBonus(playerState) {
  const bonus = { atk: 0, crit: 0, hp: 0 };
  const equipmentMap = Object.fromEntries(EQUIPMENT_LIBRARY.map((item) => [item.id, item]));

  Object.entries(playerState.equipment || {}).forEach(([slot, itemId]) => {
    if (!itemId || !equipmentMap[itemId]) return;
    const item = equipmentMap[itemId];
    const level = Number(playerState.equipmentLevels?.[itemId] || 0);
    const multiplier = 1 + level * 0.45;

    if (item.bonus?.atk) bonus.atk += Math.floor(item.bonus.atk * multiplier);
    if (item.bonus?.crit) bonus.crit += Math.floor(item.bonus.crit * multiplier);
    if (item.bonus?.hp) bonus.hp += Math.floor(item.bonus.hp * multiplier);
  });

  return bonus;
}

export function getAttackPower(playerState) {
  const attackBonus = (playerState.upgrades.atk || 0) * 4;
  const permBonus = (playerState.permanentUpgrades.permAtkLevel || 0) * 6;
  const heroBonus = (Math.max(1, Number(playerState.heroLevel) || 1) - 1) * 7;
  const equipmentBonus = getEquipmentBonus(playerState).atk;
  return 12 + attackBonus + permBonus + heroBonus + equipmentBonus;
}

export function getCritChance(playerState) {
  const critLevel = playerState.upgrades.crit || 0;
  const heroBonus = (Math.max(1, Number(playerState.heroLevel) || 1) - 1) * 0.005;
  const equipmentBonus = getEquipmentBonus(playerState).crit;
  return Math.min(0.5, 0.08 + critLevel * 0.025 + heroBonus + equipmentBonus * 0.01);
}

export function getMaxHp(playerState) {
  const hpBonus = (playerState.upgrades.hp || 0) * 18;
  const heroBonus = (Math.max(1, Number(playerState.heroLevel) || 1) - 1) * 24;
  const equipmentBonus = getEquipmentBonus(playerState).hp;
  return 120 + hpBonus + heroBonus + equipmentBonus;
}

export function buyUpgrade(playerState, key) {
  const level = playerState.upgrades[key] || 0;
  const cost = getUpgradeCost(key, level);

  if (playerState.gold < cost) {
    return { purchased: false, reason: "gold" };
  }

  playerState.gold -= cost;
  playerState.upgrades[key] = level + 1;

  return { purchased: true, cost };
}

export function equipEquipment(playerState, itemId, slot) {
  if (!itemId) return false;
  playerState.equipment[slot] = itemId;
  return true;
}

export function upgradeEquipment(playerState, itemId) {
  const equipment = EQUIPMENT_LIBRARY.find((entry) => entry.id === itemId);
  if (!equipment) return { purchased: false, reason: "not-found" };

  const level = Number(playerState.equipmentLevels[itemId] || 0);
  const cost = Math.floor(equipment.baseCost * Math.pow(1.7, level));

  if (playerState.gold < cost) {
    return { purchased: false, reason: "gold" };
  }

  playerState.gold -= cost;
  playerState.equipmentLevels[itemId] = level + 1;
  return { purchased: true, cost, level: level + 1 };
}
