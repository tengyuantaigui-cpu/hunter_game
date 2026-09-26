import { getAttackPower, getCritChance } from "./player.js";

export function executeAttack(playerState, enemy) {
  const baseDamage = getAttackPower(playerState);
  const critChance = getCritChance(playerState);
  const critical = Math.random() < critChance;
  const damage = critical ? baseDamage + Math.max(4, Math.round(baseDamage * 0.7)) : baseDamage;
  const finalDamage = Math.max(1, damage);

  enemy.hp = Math.max(0, enemy.hp - finalDamage);

  return {
    damage: finalDamage,
    critical,
    remainingHp: enemy.hp
  };
}
