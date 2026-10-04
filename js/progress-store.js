const STORAGE_KEY = "thai-flashcards.progress.v1";

function readAll() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function writeAll(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function getCardState(cardId) {
  const all = readAll();
  return all[cardId] || null;
}

export function setCardState(cardId, state) {
  const all = readAll();
  all[cardId] = state;
  writeAll(all);
}

export function getAllStates() {
  return readAll();
}
