import { loadSave, saveGame } from "./save.js";
import { buildPlayerState, buyUpgrade, equipEquipment, upgradeEquipment } from "./player.js";
import { createEnemyState } from "./enemy.js";
import { handleEnemyDefeat } from "./item.js";
import {
  createUiRefs,
  renderHud,
  renderEnemy,
  setHint,
  showDamage,
  flashBattle,
  setDropBadge,
  renderCollectionChips,
  openModal,
  closeModal
} from "./ui.js";
import { executeAttack } from "./battle.js";
import { GameAudio } from "./audio.js";
import { ITEM_LIBRARY } from "../data/items.js";
import { EQUIPMENT_LIBRARY } from "../data/equipment.js";
import { ACHIEVEMENTS } from "../data/achievements.js";

const saveData = loadSave();
const state = {
  player: buildPlayerState(saveData),
  inventory: saveData.inventory || {},
  collection: saveData.collection || [],
  settings: saveData.settings || { bgm: true, se: true }
};

const ui = createUiRefs();
const audio = new GameAudio();
audio.setEnabled(state.settings.bgm !== false);

const itemMap = Object.fromEntries([...ITEM_LIBRARY, ...EQUIPMENT_LIBRARY].map((item) => [item.id, item]));
const equipmentMap = Object.fromEntries(EQUIPMENT_LIBRARY.map((item) => [item.id, item]));
let enemy = createEnemyState(state.player.stage);
let lastDropName = "なし";

function renderCollectionPreview() {
  renderCollectionChips(ui, state.collection, itemMap);
}

function renderAll() {
  const inventoryCount = Object.values(state.inventory).reduce((sum, count) => sum + Number(count || 0), 0);
  renderHud(ui, { ...state.player, audioEnabled: state.settings.bgm !== false }, inventoryCount, state.collection.length);
  renderEnemy(ui, enemy);
  renderCollectionPreview();
  setDropBadge(ui, lastDropName === "なし" ? null : lastDropName);
  ui.audioToggle.textContent = state.settings.bgm !== false ? "ON" : "OFF";
  ui.audioToggle.classList.toggle("off", state.settings.bgm === false);
}

function saveCurrentState() {
  saveGame(state);
}

function openSaveModal() {
  const timestamp = new Date().toLocaleString("ja-JP");
  const html = `
    <div class="modal-item">
      <div class="icon">💾</div>
      <div class="meta">
        <strong>保存</strong>
        <small>最終保存: ${timestamp}</small>
      </div>
      <div class="modal-actions">
        <button class="mini-btn" data-save-now="true">今すぐ保存</button>
      </div>
    </div>
  `;
  openModal(ui, "セーブ", html);
}

function openEquipmentModal() {
  const equipmentEntries = EQUIPMENT_LIBRARY.filter((item) => Number(state.inventory[item.id] || 0) > 0 || Object.values(state.player.equipment || {}).includes(item.id));

  if (!equipmentEntries.length) {
    openModal(ui, "装備", '<div class="empty-state">まだ装備を入手していません。</div>');
    return;
  }

  const html = equipmentEntries
    .map((item) => {
      const isEquipped = Object.values(state.player.equipment || {}).includes(item.id);
      const level = Number(state.player.equipmentLevels?.[item.id] || 0);
      const upgradeCost = Math.floor(item.baseCost * Math.pow(1.7, level));
      const slotLabel = item.slot === "weapon" ? "武器" : item.slot === "armor" ? "防具" : "アクセサリ";

      return `
        <div class="modal-item">
          <div class="icon">${item.icon}</div>
          <div class="meta">
            <strong>${item.name}</strong>
            <small>${slotLabel} / Lv.${level}</small>
          </div>
          <div class="modal-actions">
            <button class="mini-btn ${isEquipped ? "warn" : ""}" data-equip-item="${item.id}" data-slot="${item.slot}">${isEquipped ? "装備中" : "装備"}</button>
            <button class="mini-btn" data-upgrade-equipment="${item.id}">+強化(${upgradeCost}G)</button>
          </div>
        </div>
      `;
    })
    .join("");

  openModal(ui, "装備", html);
}

function openDetailsModal() {
  const achievementHtml = ACHIEVEMENTS.map((achievement) => {
    const unlocked = achievement.check(state);
    return `
      <div class="modal-item">
        <div class="icon">${unlocked ? "✅" : "⬜️"}</div>
        <div class="meta">
          <strong>${achievement.title}</strong>
          <small>${achievement.description}</small>
        </div>
      </div>
    `;
  }).join("");

  const collectionIds = [...new Set(state.collection)];
  const collectionHtml = collectionIds.length
    ? collectionIds
        .map((itemId) => {
          const item = itemMap[itemId];
          if (!item) return "";
          return `
            <div class="modal-item">
              <div class="icon">${item.icon}</div>
              <div class="meta">
                <strong>${item.name}</strong>
                <small>${item.rarity}</small>
              </div>
            </div>
          `;
        })
        .join("")
    : '<div class="empty-state">まだ収集したアイテムがありません。</div>';

  openModal(
    ui,
    "実績 / 図鑑",
    `
      <div class="detail-section">
        <h4>実績</h4>
        ${achievementHtml}
      </div>
      <div class="detail-section">
        <h4>図鑑</h4>
        ${collectionHtml}
      </div>
    `
  );
}

function performRebirth() {
  if (state.player.stage < 10) {
    setHint(ui, "転生は Stage 10 到達で解放されます");
    return;
  }

  const bonus = 1 + Math.floor((state.player.stage - 1) / 8);
  state.player.rebirthCount += 1;
  state.player.rebirthPoints += bonus;
  state.player.permanentUpgrades.permAtkLevel += 1;
  state.player.gold = 0;
  state.player.stage = 1;
  state.player.upgrades = { atk: 0, crit: 0, hp: 0 };
  state.player.equipment = { weapon: "iron_sword", armor: "leather_armor", accessory: null };
  state.player.equipmentLevels = { iron_sword: 0, leather_armor: 0, sapphire_ring: 0, dragon_blade: 0, guardian_mail: 0, moon_talisman: 0 };
  enemy = createEnemyState(state.player.stage);

  audio.play("rebirth");
  setHint(ui, `転生成功！ +${bonus}PT`);
  renderAll();
  saveCurrentState();
}

function onUpgradeClick(event) {
  const button = event.currentTarget;
  const key = button.dataset.upgrade;
  if (!key) return;

  const result = buyUpgrade(state.player, key);
  if (!result.purchased) {
    setHint(ui, "GOLDが足りません");
    audio.play("hit");
    return;
  }

  audio.play("upgrade");
  setHint(ui, `${key.toUpperCase()} を強化しました`);
  renderAll();
  saveCurrentState();
}

function triggerImpactBurst(isCritical = false) {
  const shell = document.querySelector(".game-shell");
  if (!shell) return;

  [shell, ui.battleArea].forEach((element) => {
    element.classList.remove("shake", "crit-flash");
    void element.offsetWidth;
    element.classList.add("shake");
    if (isCritical) {
      element.classList.add("crit-flash");
    }
  });

  window.setTimeout(() => {
    [shell, ui.battleArea].forEach((element) => {
      element.classList.remove("shake", "crit-flash");
    });
  }, 220);
}

function onEnemyTap(event) {
  const rect = ui.enemyButton.getBoundingClientRect();
  const x = Math.max(25, Math.min(rect.width - 20, event.clientX - rect.left + 20));
  const y = Math.max(22, Math.min(rect.height - 8, event.clientY - rect.top + 10));

  const result = executeAttack(state.player, enemy);
  showDamage(ui, x, y, result.damage, result.critical);
  flashBattle(ui);
  triggerImpactBurst(result.critical);
  audio.play(result.critical ? "crit" : "hit");

  if (enemy.hp <= 0) {
    const defeatResult = handleEnemyDefeat(state, enemy);
    state.player.totalKills = (state.player.totalKills || 0) + 1;
    if (enemy.isBoss) {
      state.player.bossKills = (state.player.bossKills || 0) + 1;
    }
    lastDropName = defeatResult.drop ? defeatResult.drop.name : "なし";
    const dropText = defeatResult.drop ? ` / ${defeatResult.drop.name}獲得` : "";
    setHint(ui, `討伐成功！ +${defeatResult.goldGain}GOLD${dropText}`);
    audio.play("defeat");

    enemy = createEnemyState(state.player.stage);
    renderAll();
    saveCurrentState();

    window.setTimeout(() => {
      setHint(ui, "敵をタップして攻撃！");
    }, 1100);
    return;
  }

  setHint(ui, result.critical ? "クリティカルヒット！" : "敵にダメージを与えた！");
  renderEnemy(ui, enemy);
  saveCurrentState();
}

function handleModalClick(event) {
  const saveAction = event.target.closest("[data-save-now]");
  if (saveAction) {
    saveCurrentState();
    setHint(ui, "セーブしました");
    closeModal(ui);
    return;
  }

  const equipAction = event.target.closest("[data-equip-item]");
  if (equipAction) {
    const itemId = equipAction.dataset.equipItem;
    const slot = equipAction.dataset.slot;
    equipEquipment(state.player, itemId, slot);
    setHint(ui, `${equipmentMap[itemId]?.name || itemId} を装備しました`);
    saveCurrentState();
    renderAll();
    openEquipmentModal();
    return;
  }

  const upgradeAction = event.target.closest("[data-upgrade-equipment]");
  if (upgradeAction) {
    const itemId = upgradeAction.dataset.upgradeEquipment;
    const result = upgradeEquipment(state.player, itemId);
    if (!result.purchased) {
      setHint(ui, "GOLDが足りません");
      return;
    }

    audio.play("upgrade");
    setHint(ui, `${equipmentMap[itemId]?.name || itemId} を強化しました`);
    saveCurrentState();
    renderAll();
    openEquipmentModal();
  }
}

function bindEvents() {
  ui.enemyButton.onclick = onEnemyTap;

  document.querySelectorAll("[data-upgrade]").forEach((button) => {
    button.onclick = onUpgradeClick;
  });

  ui.equipmentBtn.onclick = openEquipmentModal;
  ui.saveBtn.onclick = openSaveModal;
  ui.rebirthBtn.onclick = performRebirth;
  ui.collectionBtn.onclick = openDetailsModal;
  ui.closeModal.onclick = () => closeModal(ui);
  ui.modalLayer.onclick = (event) => {
    if (event.target === ui.modalLayer) {
      closeModal(ui);
    }
  };
  ui.modalBody.addEventListener("click", handleModalClick);

  ui.audioToggle.onclick = () => {
    state.settings.bgm = !state.settings.bgm;
    state.settings.se = state.settings.bgm;
    audio.setEnabled(state.settings.bgm);
    renderAll();
    saveCurrentState();
  };
}

function initGame() {
  bindEvents();
  renderAll();
  setHint(ui, "敵をタップして攻撃！");
}

initGame();
