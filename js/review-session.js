import { createCardState, gradeCard, isDue, NEW_CARDS_PER_DAY } from "./srs.js";
import { getCardState, setCardState } from "./progress-store.js";

function shuffle(array) {
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function buildTodayQueue(cards, allStates, today = new Date()) {
  const due = [];
  const fresh = [];

  for (const card of cards) {
    const state = allStates[card.id];
    if (state) {
      if (isDue(state, today)) due.push(card);
    } else {
      fresh.push(card);
    }
  }

  const newBatch = shuffle(fresh).slice(0, NEW_CARDS_PER_DAY);
  return shuffle([...due, ...newBatch]);
}

export function gradeCurrentCard(card, grade, today = new Date()) {
  const existing = getCardState(card.id) || createCardState();
  const next = gradeCard(existing, grade, today);
  setCardState(card.id, next);
  return next;
}
