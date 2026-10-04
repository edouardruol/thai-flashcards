let cachedData = null;

export async function loadAlphabetData() {
  if (cachedData) return cachedData;
  const response = await fetch("data/thai-alphabet.json");
  cachedData = await response.json();
  return cachedData;
}

export function getAllCards(data) {
  const consonants = data.consonants.filter((c) => !c.obsolete);
  return [
    ...consonants.map((c) => ({ ...c, kind: "consonant" })),
    ...data.vowels.map((v) => ({ ...v, kind: "vowel" })),
  ];
}

export function getCardById(data, id) {
  return (
    data.consonants.find((c) => c.id === id) ||
    data.vowels.find((v) => v.id === id) ||
    null
  );
}
