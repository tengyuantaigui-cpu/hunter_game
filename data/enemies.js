export const ENEMIES = [
  {
    id: "slime",
    name: "スライム",
    imageClass: "slime",
    baseHp: 120,
    hpGrowth: 1.18,
    baseGold: 25,
    goldGrowth: 1.14,
    minStage: 1,
    maxStage: 14,
    isBoss: false,
    dropTableId: "goblin"
  },
  {
    id: "orc",
    name: "オーク",
    imageClass: "orc",
    baseHp: 220,
    hpGrowth: 1.2,
    baseGold: 60,
    goldGrowth: 1.18,
    minStage: 15,
    maxStage: 29,
    isBoss: false,
    dropTableId: "orc"
  },
  {
    id: "demon",
    name: "デーモン",
    imageClass: "boss",
    baseHp: 420,
    hpGrowth: 1.26,
    baseGold: 140,
    goldGrowth: 1.2,
    minStage: 30,
    maxStage: 99,
    isBoss: true,
    dropTableId: "demon"
  }
];

export function getEnemyForStage(stage) {
  const normalizedStage = Math.max(1, Number(stage) || 1);

  const candidate = ENEMIES.find((enemy) => {
    return normalizedStage >= enemy.minStage && normalizedStage <= enemy.maxStage;
  }) ?? ENEMIES[0];

  const growthFactor = Math.max(0, normalizedStage - candidate.minStage + 1);

  return {
    ...candidate,
    stage: normalizedStage,
    maxHp: Math.floor(candidate.baseHp * Math.pow(candidate.hpGrowth, growthFactor)),
    goldReward: Math.floor(candidate.baseGold * Math.pow(candidate.goldGrowth, growthFactor))
  };
}
