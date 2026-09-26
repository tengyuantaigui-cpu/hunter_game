const STORAGE_KEY = "TAP_HUNTER_SAVE_V1";

export function createDefaultSave() {
  return {
    version: 1,
    timestamp: Date.now(),
    player: {
      gold: 0,
      stage: 1,
      heroLevel: 1,
      heroExp: 0,
      rebirthCount: 0,
      rebirthPoints: 0,
      totalKills: 0,
      bossKills: 0,
      upgrades: {
        atk: 0,
        crit: 0,
        hp: 0
      },
      permanentUpgrades: {
        permAtkLevel: 0
      },
      equipment: {
        weapon: "iron_sword",
        armor: "leather_armor",
        accessory: null
      },
      equipmentLevels: {
        iron_sword: 0,
        leather_armor: 0,
        sapphire_ring: 0,
        dragon_blade: 0,
        guardian_mail: 0,
        moon_talisman: 0
      }
    },
    inventory: {
      iron_sword: 1,
      leather_armor: 1
    },
    collection: ["iron_sword", "leather_armor"],
    settings: {
      bgm: true,
      se: true
    }
  };
}

function isValidNumber(value) {
  return typeof value === "number" && Number.isFinite(value) && !Number.isNaN(value);
}

export function loadSave() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createDefaultSave();

    const parsed = JSON.parse(raw);
    const safe = createDefaultSave();

    safe.timestamp = Date.now();
    safe.player.gold = isValidNumber(parsed.player?.gold) ? parsed.player.gold : safe.player.gold;
    safe.player.stage = isValidNumber(parsed.player?.stage) ? Math.max(1, Math.round(parsed.player.stage)) : safe.player.stage;
    safe.player.heroLevel = isValidNumber(parsed.player?.heroLevel) ? Math.max(1, Math.round(parsed.player.heroLevel)) : safe.player.heroLevel;
    safe.player.heroExp = isValidNumber(parsed.player?.heroExp) ? Math.max(0, parsed.player.heroExp) : safe.player.heroExp;
    safe.player.rebirthCount = isValidNumber(parsed.player?.rebirthCount) ? Math.max(0, Math.round(parsed.player.rebirthCount)) : safe.player.rebirthCount;
    safe.player.rebirthPoints = isValidNumber(parsed.player?.rebirthPoints) ? Math.max(0, Math.round(parsed.player.rebirthPoints)) : safe.player.rebirthPoints;
    safe.player.totalKills = isValidNumber(parsed.player?.totalKills) ? Math.max(0, Math.round(parsed.player.totalKills)) : 0;
    safe.player.bossKills = isValidNumber(parsed.player?.bossKills) ? Math.max(0, Math.round(parsed.player.bossKills)) : 0;

    safe.player.upgrades = {
      atk: isValidNumber(parsed.player?.upgrades?.atk) ? Math.max(0, Math.round(parsed.player.upgrades.atk)) : safe.player.upgrades.atk,
      crit: isValidNumber(parsed.player?.upgrades?.crit) ? Math.max(0, Math.round(parsed.player.upgrades.crit)) : safe.player.upgrades.crit,
      hp: isValidNumber(parsed.player?.upgrades?.hp) ? Math.max(0, Math.round(parsed.player.upgrades.hp)) : safe.player.upgrades.hp
    };

    safe.player.permanentUpgrades = {
      permAtkLevel: isValidNumber(parsed.player?.permanentUpgrades?.permAtkLevel)
        ? Math.max(0, Math.round(parsed.player.permanentUpgrades.permAtkLevel))
        : safe.player.permanentUpgrades.permAtkLevel
    };

    safe.player.equipment = {
      weapon: parsed.player?.equipment?.weapon || safe.player.equipment.weapon,
      armor: parsed.player?.equipment?.armor || safe.player.equipment.armor,
      accessory: parsed.player?.equipment?.accessory || safe.player.equipment.accessory
    };

    safe.player.equipmentLevels = {
      ...safe.player.equipmentLevels,
      ...(parsed.player?.equipmentLevels || {})
    };

    safe.inventory = parsed.inventory && typeof parsed.inventory === "object" ? parsed.inventory : {};
    safe.collection = Array.isArray(parsed.collection) ? parsed.collection : [];
    safe.settings = {
      bgm: parsed.settings?.bgm !== undefined ? Boolean(parsed.settings.bgm) : safe.settings.bgm,
      se: parsed.settings?.se !== undefined ? Boolean(parsed.settings.se) : safe.settings.se
    };

    return safe;
  } catch (error) {
    console.warn("セーブデータの読み込みに失敗したため初期化します。", error);
    return createDefaultSave();
  }
}

export function saveGame(state) {
  try {
    const snapshot = {
      version: 1,
      timestamp: Date.now(),
      player: {
        gold: Number(state.player.gold) || 0,
        stage: Number(state.player.stage) || 1,
        heroLevel: Math.max(1, Number(state.player.heroLevel) || 1),
        heroExp: Math.max(0, Number(state.player.heroExp) || 0),
        rebirthCount: Number(state.player.rebirthCount) || 0,
        rebirthPoints: Number(state.player.rebirthPoints) || 0,
        totalKills: Number(state.player.totalKills) || 0,
        bossKills: Number(state.player.bossKills) || 0,
        upgrades: {
          atk: Number(state.player.upgrades.atk) || 0,
          crit: Number(state.player.upgrades.crit) || 0,
          hp: Number(state.player.upgrades.hp) || 0
        },
        permanentUpgrades: {
          permAtkLevel: Number(state.player.permanentUpgrades.permAtkLevel) || 0
        },
        equipment: state.player.equipment || { weapon: "iron_sword", armor: "leather_armor", accessory: null },
        equipmentLevels: state.player.equipmentLevels || {}
      },
      inventory: state.inventory || {},
      collection: state.collection || [],
      settings: state.settings || { bgm: true, se: true }
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
    return true;
  } catch (error) {
    console.warn("セーブに失敗しました。", error);
    return false;
  }
}
