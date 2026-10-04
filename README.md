# Thai Flashcards

Progressive web app for learning to read the Thai alphabet (consonants, vowels, tone rules) with spaced-repetition flashcards. Installable on iPhone via Safari "Add to Home Screen" — no App Store, no backend, works offline after first load.

## Romanization convention

All `romanized` / `nameRomanized` fields in `data/thai-alphabet.json` use a simplified Paiboon-style transcription:

- **Tone marking** (suffix/diacritic on the vowel): mid = no mark, low = grave accent (`à`), falling = circumflex (`â`), high = acute accent (`á`), rising = caron (`ǎ`).
- **Vowel length**: long vowels are written with a doubled letter (`aa`, `ii`, `uu`, `ee`, `oo`); short vowels use a single letter.
- Consonant clusters follow common beginner convention (`bp` for the unaspirated ป, `dt` for the unaspirated ต, `ng` for ง, etc.) rather than the official RTGS system, which deliberately drops tones and vowel length and is unsuitable for a reading app.

## Content accuracy note

The dataset (`data/thai-alphabet.json`) was built by cross-checking the standard 44-consonant table, the three consonant classes (mid/high/low), and the tone-mark rule system against multiple independent sources before being written out — this isn't freehand-generated. That said, Thai script and tone rules have enough edge cases that **a spot-check by Edouard himself is worth doing** before trusting the deck fully: pick a handful of consonants across the three classes and a few tone-rule entries, and check them against an independent reference (e.g. thai-language.com or a textbook) if anything looks off.

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
