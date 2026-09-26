export const ACHIEVEMENTS = [
  {
    id: "first_kill",
    title: "初陣",
    description: "敵を1体討伐",
    check: (state) => (state.player.totalKills || 0) >= 1
  },
  {
    id: "collector",
    title: "収集家",
    description: "図鑑を3件登録",
    check: (state) => (state.collection || []).length >= 3
  },
  {
    id: "boss_hunter",
    title: "ボスハンター",
    description: "ボスを1体討伐",
    check: (state) => (state.player.bossKills || 0) >= 1
  },
  {
    id: "reborn",
    title: "再誕",
    description: "1回転生",
    check: (state) => (state.player.rebirthCount || 0) >= 1
  },
  {
    id: "stage_30",
    title: "層突破",
    description: "Stage 30 到達",
    check: (state) => (state.player.stage || 1) >= 30
  }
];
