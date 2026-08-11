export type SearchIntent = {
  rawQuery: string;
  terms: string[];
  mode: "local" | "ai";
};

const KNOWN_TERMS = [
  "既婚", "未婚", "メガネ", "眼鏡", "ロレックス", "ゴルフ", "財布", "時計", "犬", "猫", "響", "白州",
];

const STOP_WORDS = new Set([
  "の", "を", "が", "は", "に", "で", "と", "も", "な", "人", "客", "お客", "お客様", "いる", "してる", "している", "誰", "だれ", "教えて", "探して", "好き",
]);

export function parseLocalSearchIntent(rawQuery: string): SearchIntent {
  const normalized = rawQuery
    .normalize("NFKC")
    .replace(/[、。,.!?！？/・]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  const known = KNOWN_TERMS.filter((term) => normalized.includes(term));
  if (known.length > 0) {
    return { rawQuery, terms: Array.from(new Set(known)), mode: "local" };
  }

  const terms = Array.from(new Set(
    normalized
      .replace(/(好き|な人|の人|している人|してる人|いる人)/g, " ")
      .split(/[\sのをがはにでとも、]+/)
      .map((value) => value.trim())
      .filter((value) => value.length >= 1 && !STOP_WORDS.has(value)),
  ));

  return { rawQuery, terms, mode: "local" };
}

export function matchesAllTerms(haystack: string, terms: string[]) {
  const normalized = haystack.normalize("NFKC").toLowerCase();
  return terms.every((term) => normalized.includes(term.normalize("NFKC").toLowerCase()));
}
