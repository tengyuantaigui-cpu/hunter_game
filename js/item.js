import { pickDropForStage } from "../data/items.js";

export function handleEnemyDefeat(state, enemy) {
  const goldGain = enemy.goldReward || 25;
  state.player.gold += goldGain;

  const drop = pickDropForStage(enemy.stage);
  if (drop) {
    state.inventory[drop.id] = (state.inventory[drop.id] || 0) + 1;
    state.collection = Array.from(new Set([...state.collection, drop.id]));
  }

  state.player.stage += 1;
  return { goldGain, drop };
}
