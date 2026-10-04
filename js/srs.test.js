import { test } from "node:test";
import assert from "node:assert/strict";
import { createCardState, gradeCard, isDue, masteryLevel, Grade, MIN_EFACTOR } from "./srs.js";

test("three consecutive Good grades produce intervals 1, 6, ~15", () => {
  const day0 = new Date("2026-01-01T00:00:00Z");
  let state = createCardState();

  state = gradeCard(state, Grade.GOOD, day0);
  assert.equal(state.interval, 1);
  assert.equal(state.repetitions, 1);

  state = gradeCard(state, Grade.GOOD, day0);
  assert.equal(state.interval, 6);
  assert.equal(state.repetitions, 2);

  state = gradeCard(state, Grade.GOOD, day0);
  assert.equal(state.interval, Math.round(6 * 2.5));
  assert.equal(state.repetitions, 3);
});

test("Again resets repetitions and interval to 0", () => {
  const day0 = new Date("2026-01-01T00:00:00Z");
  let state = createCardState();
  state = gradeCard(state, Grade.GOOD, day0);
  state = gradeCard(state, Grade.GOOD, day0);
  assert.equal(state.interval, 6);

  state = gradeCard(state, Grade.AGAIN, day0);
  assert.equal(state.repetitions, 0);
  assert.equal(state.interval, 0);
});

test("efactor never drops below the floor despite repeated Again grades", () => {
  const day0 = new Date("2026-01-01T00:00:00Z");
  let state = createCardState();
  for (let i = 0; i < 20; i++) {
    state = gradeCard(state, Grade.AGAIN, day0);
  }
  assert.equal(state.efactor, MIN_EFACTOR);
});

test("Easy grants a longer interval than Good from the same starting state", () => {
  const day0 = new Date("2026-01-01T00:00:00Z");
  let goodState = createCardState();
  goodState = gradeCard(goodState, Grade.GOOD, day0);
  goodState = gradeCard(goodState, Grade.GOOD, day0);

  let easyState = createCardState();
  easyState = gradeCard(easyState, Grade.EASY, day0);
  easyState = gradeCard(easyState, Grade.EASY, day0);

  assert.ok(easyState.interval > goodState.interval);
});

test("a never-reviewed card is always due", () => {
  const state = createCardState();
  assert.equal(isDue(state), true);
});

test("a card due in the future is not due today", () => {
  const day0 = new Date("2026-01-01T00:00:00Z");
  let state = createCardState();
  state = gradeCard(state, Grade.GOOD, day0);
  state = gradeCard(state, Grade.GOOD, day0); // interval = 6 days
  assert.equal(isDue(state, day0), false);
  const sixDaysLater = new Date("2026-01-07T00:00:00Z");
  assert.equal(isDue(state, sixDaysLater), true);
});

test("masteryLevel classifies new, learning and mastered cards", () => {
  const day0 = new Date("2026-01-01T00:00:00Z");
  let state = createCardState();
  assert.equal(masteryLevel(state), "new");

  state = gradeCard(state, Grade.GOOD, day0);
  assert.equal(masteryLevel(state), "learning");

  // Push repetitions/interval past the mastery threshold.
  for (let i = 0; i < 4; i++) {
    state = gradeCard(state, Grade.GOOD, day0);
  }
  assert.equal(masteryLevel(state), "mastered");
});
