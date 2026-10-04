import { masteryLevel } from "./srs.js";

export function computeStats(cards, allStates) {
  const counts = { new: 0, learning: 0, mastered: 0 };
  for (const card of cards) {
    const state = allStates[card.id];
    const level = state ? masteryLevel(state) : "new";
    counts[level] += 1;
  }
  return counts;
}
