import { getEnemyForStage } from "../data/enemies.js";

export function createEnemyState(stage) {
  const baseEnemy = getEnemyForStage(stage);
  const isBossStage = stage > 1 && stage % 10 === 0;

  return {
    id: isBossStage ? "boss" : baseEnemy.id,
    name: isBossStage ? "魔王の使徒" : baseEnemy.name,
    imageClass: isBossStage ? "boss" : baseEnemy.imageClass,
    stage,
    maxHp: isBossStage ? Math.floor(baseEnemy.maxHp * 2.8) : baseEnemy.maxHp,
    hp: isBossStage ? Math.floor(baseEnemy.maxHp * 2.8) : baseEnemy.maxHp,
    goldReward: isBossStage ? Math.floor((baseEnemy.goldReward || 25) * 5.2) : baseEnemy.goldReward,
    isBoss: isBossStage
  };
}
