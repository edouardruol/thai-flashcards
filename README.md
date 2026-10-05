# Thai Flashcards

Progressive web app for learning to read the Thai alphabet (consonants, vowels, tone rules) with spaced-repetition flashcards. Installable on iPhone via Safari "Add to Home Screen" — no App Store, no backend, works offline after first load.

## Romanization convention

All `romanized` / `nameRomanized` fields in `data/thai-alphabet.json` use a simplified Paiboon-style transcription:

- **Tone marking** (suffix/diacritic on the vowel): mid = no mark, low = grave accent (`à`), falling = circumflex (`â`), high = acute accent (`á`), rising = caron (`ǎ`).
- **Vowel length**: long vowels are written with a doubled letter (`aa`, `ii`, `uu`, `ee`, `oo`); short vowels use a single letter.
- Consonant clusters follow common beginner convention (`bp` for the unaspirated ป, `dt` for the unaspirated ต, `ng` for ง, etc.) rather than the official RTGS system, which deliberately drops tones and vowel length and is unsuitable for a reading app.
- **ASCII only, no IPA symbols** (no `ʉ` etc.). The อึ/อือ vowel sound is written as the digraph `ue` (short) / `uue` (long), e.g. `hǔeng`, `muue`, `chûue` — the tone diacritic goes on the first letter of the digraph. The เออ vowel uses the digraph `oe`, e.g. `toe`, `sà-mǒe`.
- Short เอะ (`e`) and short แอะ (`ae`) are spelled with different base letters (`lé` vs `láe`) precisely so they stay distinguishable — don't let both collapse to the same spelling.
- A consonant that is never used as a final gets `"finalSound": null` (not a guessed letter).

## Content accuracy note

The dataset (`data/thai-alphabet.json`) was cross-checked twice: once while building it (consonant classes, the 44-letter table, the tone-mark rule system against multiple sources) and once by an independent adversarial review pass on 2026-10-05, which found and fixed a wrong `finalSound`, one example word filed under the wrong vowel, and several romanization inconsistencies (IPA symbols mixed into the ASCII scheme, two vowels colliding on the same spelling). The consonant classes and the 17 tone rules were verified correct in both passes. That said, Thai script has enough edge cases that **a spot-check by Edouard himself is still worth doing** before trusting the deck fully — pick a handful of entries across the three classes and check them against an independent reference (e.g. thai-language.com) if anything looks off.

Two consonants (ฃ kho khuat, ฅ kho khon) are marked `"obsolete": true` — they're part of the traditional 44-letter set but essentially unused in modern Thai, so they're excluded from the default spaced-repetition queue but still present for completeness.

## Project structure

See the implementation plan for the full file layout, SRS algorithm, and PWA mechanics.

## Local development

```
python3 -m http.server 8743
```

Then open `http://localhost:8743/index.html`. No build step, no dependencies to install.

## Run the SRS unit tests

```
npm test
```

## Install on iPhone

1. Deploy this repo to GitHub Pages (Settings → Pages → deploy from `main`).
2. On the iPhone, open the GitHub Pages URL in **Safari** (not Chrome — iOS only supports "Add to Home Screen" PWA installation from Safari).
3. Share button → **Sur l'écran d'accueil**.
4. Open it from the home screen icon — it runs full-screen with no Safari chrome, and works offline after the first load.
