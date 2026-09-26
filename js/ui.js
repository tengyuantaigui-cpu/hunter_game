import { getHeroExpToNext } from "./player.js";

export function createUiRefs() {
  return {
    goldDisplay: document.getElementById("goldDisplay"),
    stageDisplay: document.getElementById("stageDisplay"),
    rebirthDisplay: document.getElementById("rebirthDisplay"),
    heroLevelDisplay: document.getElementById("heroLevelDisplay"),
    heroExpDisplay: document.getElementById("heroExpDisplay"),
    inventoryDisplay: document.getElementById("inventoryDisplay"),
    audioToggle: document.getElementById("audioToggle"),
    enemyName: document.getElementById("enemyName"),
    enemyLevel: document.getElementById("enemyLevel"),
    enemyButton: document.getElementById("enemyButton"),
    hpText: document.getElementById("hpText"),
    hpFill: document.getElementById("hpFill"),
    battleHint: document.getElementById("battleHint"),
    battleArea: document.getElementById("battleArea"),
    damageLayer: document.getElementById("damageLayer"),
    dropBadge: document.getElementById("dropBadge"),
    collectionPreview: document.getElementById("collectionPreview"),
    modalLayer: document.getElementById("modalLayer"),
    modalTitle: document.getElementById("modalTitle"),
    modalBody: document.getElementById("modalBody"),
    closeModal: document.getElementById("closeModal"),
    equipmentBtn: document.getElementById("equipmentBtn"),
    saveBtn: document.getElementById("saveBtn"),
    rebirthBtn: document.getElementById("rebirthBtn"),
    collectionBtn: document.getElementById("collectionBtn")
  };
}

export function renderHud(ui, playerState, inventoryCount, collectionCount) {
  ui.goldDisplay.textContent = String(playerState.gold);
  ui.stageDisplay.textContent = String(playerState.stage);
  ui.rebirthDisplay.textContent = String(playerState.rebirthCount || 0);
  ui.inventoryDisplay.textContent = String(inventoryCount || 0);

  if (ui.heroLevelDisplay) {
    ui.heroLevelDisplay.textContent = `Lv.${Math.max(1, Number(playerState.heroLevel) || 1)}`;
  }

  if (ui.heroExpDisplay) {
    const heroLevel = Math.max(1, Number(playerState.heroLevel) || 1);
    const expNeeded = getHeroExpToNext(heroLevel);
    const currentExp = Math.max(0, Number(playerState.heroExp) || 0);
    const ratio = Math.min(100, Math.max(0, (currentExp / expNeeded) * 100));
    ui.heroExpDisplay.textContent = `${Math.round(ratio)}%`;
  }

  if (ui.audioToggle) {
    ui.audioToggle.textContent = playerState.audioEnabled ? "ON" : "OFF";
    ui.audioToggle.classList.toggle("off", !playerState.audioEnabled);
  }
  if (ui.collectionPreview) {
    ui.collectionPreview.textContent = `図鑑 ${collectionCount || 0}件`;
  }
}

export function renderEnemy(ui, enemy) {
  ui.enemyName.textContent = enemy.name;
  ui.enemyLevel.textContent = `Lv.${enemy.stage}`;
  ui.enemyButton.className = `enemy-button ${enemy.imageClass}`;

  const ratio = Math.max(0, enemy.hp / enemy.maxHp);
  ui.hpFill.style.width = `${(ratio * 100).toFixed(2)}%`;
  ui.hpText.textContent = `${enemy.hp} / ${enemy.maxHp}`;
}

export function setHint(ui, message) {
  ui.battleHint.textContent = message;
}

export function showDamage(ui, x, y, value, critical = false) {
  const marker = document.createElement("div");
  marker.className = `damage-text ${critical ? "crit" : ""}`;
  marker.textContent = `-${value}`;
  marker.style.left = `${x}px`;
  marker.style.top = `${y}px`;
  ui.damageLayer.appendChild(marker);

  setTimeout(() => marker.remove(), 650);
}

export function flashBattle(ui) {
  ui.battleArea.classList.remove("flash");
  void ui.battleArea.offsetWidth;
  ui.battleArea.classList.add("flash");
}

export function setDropBadge(ui, dropLabel) {
  ui.dropBadge.textContent = dropLabel ? `ドロップ: ${dropLabel}` : "ドロップ: なし";
}

export function renderCollectionChips(ui, collectionIds, itemMap) {
  if (!ui.collectionPreview) return;

  const unique = [...new Set(collectionIds)];

  if (!unique.length) {
    ui.collectionPreview.innerHTML = '<span class="empty-chip">未登録</span>';
    return;
  }

  ui.collectionPreview.innerHTML = unique
    .slice(0, 6)
    .map((id) => {
      const item = itemMap[id];
      const icon = item?.icon ?? "✨";
      const label = item?.name ?? id;
      return `<span class="collection-chip ${item?.rarity ?? "COMMON"}">${icon} ${label}</span>`;
    })
    .join("");
}

export function openModal(ui, title, html) {
  ui.modalTitle.textContent = title;
  ui.modalBody.innerHTML = html;
  ui.modalLayer.classList.remove("hidden");
  ui.modalLayer.setAttribute("aria-hidden", "false");
}

export function closeModal(ui) {
  ui.modalLayer.classList.add("hidden");
  ui.modalLayer.setAttribute("aria-hidden", "true");
}
