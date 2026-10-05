import { loadAlphabetData, getAllCards } from "./data-store.js";
import { getAllStates } from "./progress-store.js";
import { computeStats } from "./stats.js";
import { buildTodayQueue, gradeCurrentCard } from "./review-session.js";

const CLASS_LABELS = { low: "classe basse", mid: "classe moyenne", high: "classe haute" };

const dashboardView = document.getElementById("dashboard");
const reviewView = document.getElementById("review");
const dueCountEl = document.getElementById("due-count");
const statNewEl = document.getElementById("stat-new");
const statLearningEl = document.getElementById("stat-learning");
const statMasteredEl = document.getElementById("stat-mastered");
const browseTabs = document.getElementById("browse-tabs");
const browseList = document.getElementById("browse-list");

const flashcard = document.getElementById("flashcard");
const cardGlyph = document.getElementById("card-glyph");
const tapHint = document.getElementById("tap-hint");
const tapHintDesktop = document.getElementById("tap-hint-desktop");
const cardBack = document.getElementById("card-back");
const cardNameThai = document.getElementById("card-name-thai");
const cardNameRomanized = document.getElementById("card-name-romanized");
const cardClass = document.getElementById("card-class");
const cardExamples = document.getElementById("card-examples");
const gradeButtons = document.getElementById("grade-buttons");
const doneScreen = document.getElementById("done-screen");

let appData = null;
let allCards = [];
let queue = [];
let currentIndex = 0;
let flipped = false;

async function init() {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.register("service-worker.js").catch(() => {});
  }

  appData = await loadAlphabetData();
  allCards = getAllCards(appData);

  refreshDashboard();
  renderBrowseList("consonant");

  document.getElementById("review-btn").addEventListener("click", startReview);
  document.getElementById("exit-review").addEventListener("click", exitReview);
  document.getElementById("back-to-dashboard").addEventListener("click", exitReview);
  flashcard.addEventListener("click", flipCard);
  gradeButtons.addEventListener("click", onGradeClick);
  browseTabs.addEventListener("click", onBrowseTabClick);
  document.addEventListener("keydown", onKeyDown);
}

function pluralizeCartes(count) {
  return `${count} carte${count === 1 ? "" : "s"}`;
}

function onKeyDown(event) {
  if (reviewView.classList.contains("hidden")) return;
  if (doneScreen && !doneScreen.classList.contains("hidden")) return;

  if (event.key === "Escape") {
    exitReview();
  } else if (event.key === " " && !flipped) {
    event.preventDefault();
    flipCard();
  } else if (flipped && ["1", "2", "3", "4"].includes(event.key)) {
    const grade = { 1: "again", 2: "hard", 3: "good", 4: "easy" }[event.key];
    applyGrade(grade);
  }
}

function refreshDashboard() {
  const allStates = getAllStates();
  const dueQueue = buildTodayQueue(allCards, allStates);
  dueCountEl.textContent = pluralizeCartes(dueQueue.length);

  const stats = computeStats(allCards, allStates);
  statNewEl.textContent = stats.new;
  statLearningEl.textContent = stats.learning;
  statMasteredEl.textContent = stats.mastered;
}

function startReview() {
  const allStates = getAllStates();
  queue = buildTodayQueue(allCards, allStates);
  currentIndex = 0;

  dashboardView.classList.add("hidden");
  reviewView.classList.remove("hidden");
  doneScreen.classList.add("hidden");
  flashcard.closest(".card-area").classList.remove("hidden");

  if (queue.length === 0) {
    showDone();
  } else {
    renderCurrentCard();
  }
}

function exitReview() {
  reviewView.classList.add("hidden");
  dashboardView.classList.remove("hidden");
  refreshDashboard();
}

function renderCurrentCard() {
  flipped = false;
  const card = queue[currentIndex];

  flashcard.classList.remove("flipped");
  cardGlyph.textContent = card.glyph;
  cardGlyph.classList.toggle("glyph-long", card.glyph.length >= 3);
  cardBack.classList.add("hidden");
  gradeButtons.classList.remove("hidden");
  gradeButtons.classList.add("invisible");
  tapHint.classList.remove("hidden");
  tapHintDesktop.classList.remove("hidden");

  if (card.kind === "consonant") {
    cardNameThai.textContent = card.nameThai;
    cardNameThai.classList.remove("hidden");
    cardNameRomanized.textContent = `${card.nameRomanized} — ${card.nameMeaningFr}`;
    cardClass.textContent = CLASS_LABELS[card.class] || "";
    cardClass.classList.remove("hidden");
  } else {
    cardNameThai.classList.add("hidden");
    cardNameRomanized.textContent = card.nameRomanized;
    cardClass.classList.add("hidden");
  }

  cardExamples.innerHTML = "";
  for (const ex of card.examples) {
    const li = document.createElement("li");
    li.innerHTML = `<span class="ex-thai">${ex.thai}</span><span class="ex-meta"><span class="ex-romanized">${ex.romanized}</span><span class="ex-meaning">${ex.meaningFr}</span></span>`;
    cardExamples.appendChild(li);
  }
}

function flipCard() {
  if (flipped) return;
  flipped = true;
  flashcard.classList.add("flipped");
  tapHint.classList.add("hidden");
  tapHintDesktop.classList.add("hidden");
  cardBack.classList.remove("hidden");
  gradeButtons.classList.remove("invisible");
}

function onGradeClick(event) {
  const grade = event.target.dataset.grade;
  if (!grade) return;
  applyGrade(grade);
}

function applyGrade(grade) {
  gradeCurrentCard(queue[currentIndex], grade);
  currentIndex += 1;

  if (currentIndex >= queue.length) {
    showDone();
  } else {
    renderCurrentCard();
  }
}

function showDone() {
  flashcard.closest(".card-area").classList.add("hidden");
  gradeButtons.classList.add("hidden");
  doneScreen.classList.remove("hidden");
}

function onBrowseTabClick(event) {
  const category = event.target.dataset.category;
  if (!category) return;

  for (const tab of browseTabs.children) {
    tab.classList.toggle("active", tab === event.target);
  }
  renderBrowseList(category);
}

function renderBrowseList(category) {
  browseList.innerHTML = "";

  if (category === "consonant") {
    for (const c of appData.consonants) {
      if (c.obsolete) continue;
      browseList.appendChild(
        makeBrowseItem(c.glyph, `${c.nameRomanized} — ${c.nameMeaningFr}`, CLASS_LABELS[c.class])
      );
    }
  } else if (category === "vowel") {
    for (const v of appData.vowels) {
      browseList.appendChild(makeBrowseItem(v.glyph, v.nameRomanized, ""));
    }
  } else if (category === "tone") {
    for (const rule of appData.toneRules) {
      const label = `${CLASS_LABELS[rule.class] || rule.class} + ${rule.syllableType} + ${rule.toneMark} → ${rule.resultingTone}`;
      const meta = `${rule.exampleThai} (${rule.exampleRomanized})`;
      browseList.appendChild(makeBrowseItem("", label, meta));
    }
  }
}

function makeBrowseItem(glyph, name, meta) {
  const div = document.createElement("div");
  div.className = "browse-item";

  const glyphEl = document.createElement("span");
  glyphEl.className = "browse-glyph";
  glyphEl.textContent = glyph;

  const textEl = document.createElement("div");
  textEl.className = "browse-text";
  const nameEl = document.createElement("div");
  nameEl.className = "browse-name";
  nameEl.textContent = name;
  textEl.appendChild(nameEl);

  if (meta) {
    const metaEl = document.createElement("div");
    metaEl.className = "browse-meta";
    metaEl.textContent = meta;
    textEl.appendChild(metaEl);
  }

  div.appendChild(glyphEl);
  div.appendChild(textEl);
  return div;
}

init();
