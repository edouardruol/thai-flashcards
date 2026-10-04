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
}

function refreshDashboard() {
  const allStates = getAllStates();
  const dueQueue = buildTodayQueue(allCards, allStates);
  dueCountEl.textContent = dueQueue.length;

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

  cardGlyph.textContent = card.glyph;
  cardBack.classList.add("hidden");
  gradeButtons.classList.add("hidden");
  tapHint.classList.remove("hidden");

  if (card.kind === "consonant") {
    cardNameThai.textContent = card.nameThai;
    cardNameRomanized.textContent = `${card.nameRomanized} — ${card.nameMeaningFr}`;
    cardClass.textContent = CLASS_LABELS[card.class] || "";
    cardClass.classList.remove("hidden");
  } else {
    cardNameThai.textContent = card.glyph;
    cardNameRomanized.textContent = card.nameRomanized;
    cardClass.classList.add("hidden");
  }

  cardExamples.innerHTML = "";
  for (const ex of card.examples) {
    const li = document.createElement("li");
    li.innerHTML = `<span class="ex-thai">${ex.thai}</span><span class="ex-romanized">${ex.romanized}</span><span class="ex-meaning">${ex.meaningFr}</span>`;
    cardExamples.appendChild(li);
  }
}

function flipCard() {
  if (flipped) return;
  flipped = true;
  tapHint.classList.add("hidden");
  cardBack.classList.remove("hidden");
  gradeButtons.classList.remove("hidden");
}

function onGradeClick(event) {
  const grade = event.target.dataset.grade;
  if (!grade) return;

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
        makeBrowseItem(`<span class="glyph-small">${c.glyph}</span>${c.nameRomanized} — ${c.nameMeaningFr} (${CLASS_LABELS[c.class]})`)
      );
    }
  } else if (category === "vowel") {
    for (const v of appData.vowels) {
      browseList.appendChild(
        makeBrowseItem(`<span class="glyph-small">${v.glyph}</span>${v.nameRomanized}`)
      );
    }
  } else if (category === "tone") {
    for (const rule of appData.toneRules) {
      browseList.appendChild(
        makeBrowseItem(
          `${CLASS_LABELS[rule.class] || rule.class} + ${rule.syllableType} + ${rule.toneMark} → <strong>${rule.resultingTone}</strong><br><span class="ex-romanized">${rule.exampleThai} (${rule.exampleRomanized})</span>`
        )
      );
    }
  }
}

function makeBrowseItem(html) {
  const div = document.createElement("div");
  div.className = "browse-item";
  div.innerHTML = html;
  return div;
}

init();
