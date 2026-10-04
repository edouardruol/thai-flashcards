// SM-2-style spaced repetition scheduler. Pure functions, no DOM/storage dependency.

export const MIN_EFACTOR = 1.3;
export const NEW_CARDS_PER_DAY = 12;

export const Grade = Object.freeze({
  AGAIN: "again",
  HARD: "hard",
  GOOD: "good",
  EASY: "easy",
});

export function createCardState() {
  return {
    efactor: 2.5,
    interval: 0,
    repetitions: 0,
    dueDate: null,
    lastReviewed: null,
  };
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

export function gradeCard(state, grade, today = new Date()) {
  const next = { ...state };

  switch (grade) {
    case Grade.AGAIN:
      next.repetitions = 0;
      next.interval = 0;
      next.efactor = Math.max(MIN_EFACTOR, state.efactor - 0.2);
      break;
    case Grade.HARD:
      next.repetitions = state.repetitions;
      next.interval = Math.max(1, Math.round((state.interval || 1) * 1.2));
      next.efactor = Math.max(MIN_EFACTOR, state.efactor - 0.15);
      break;
    case Grade.GOOD:
      next.repetitions = state.repetitions + 1;
      next.efactor = state.efactor;
      if (next.repetitions === 1) next.interval = 1;
      else if (next.repetitions === 2) next.interval = 6;
      else next.interval = Math.round(state.interval * state.efactor);
      break;
    case Grade.EASY:
      next.repetitions = state.repetitions + 1;
      next.efactor = state.efactor + 0.15;
      if (next.repetitions === 1) next.interval = 1;
      else if (next.repetitions === 2) next.interval = 6;
      else next.interval = Math.round(state.interval * state.efactor);
      next.interval = Math.round(next.interval * 1.3);
      break;
    default:
      throw new Error(`Unknown grade: ${grade}`);
  }

  next.lastReviewed = toIsoDate(today);
  next.dueDate = toIsoDate(addDays(today, next.interval));
  return next;
}

export function isDue(state, today = new Date()) {
  if (!state.dueDate) return true; // never reviewed = always due (new card)
  return state.dueDate <= toIsoDate(today);
}

export function masteryLevel(state) {
  if (!state.lastReviewed) return "new";
  if (state.repetitions >= 3 && state.interval >= 21) return "mastered";
  return "learning";
}
