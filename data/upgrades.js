export const UPGRADE_DEFS = {
  atk: {
    key: "atk",
    label: "攻撃",
    baseCost: 30,
    growth: 1.42,
    valueLabel: "+1攻撃"
  },
  crit: {
    key: "crit",
    label: "会心",
    baseCost: 55,
    growth: 1.52,
    valueLabel: "+2%会心"
  },
  hp: {
    key: "hp",
    label: "体力",
    baseCost: 50,
    growth: 1.47,
    valueLabel: "+12HP"
  }
};

export function getUpgradeCost(key, level) {
  const config = UPGRADE_DEFS[key];
  if (!config) return 999999;
  return Math.floor(config.baseCost * Math.pow(config.growth, level));
}
