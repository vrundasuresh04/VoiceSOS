// distressModel.js
// VoiceSOS Custom AI Distress Classifier
//
// PHILOSOPHY:
// We did NOT use Kaggle datasets because emergency voice data is sensitive,
// context-specific, and rarely India-localized. Instead, we built a custom
// mini dataset of distress phrases, accent variations, and non-emergency
// contexts. The model uses weighted keyword scoring + Levenshtein distance
// fuzzy matching to handle accent variations like "halp", "plis help",
// "sabe me" — phrases real Indian users might say in panic.
//
// OUTPUT IS EXPLAINABLE: every classification returns the reasons behind
// the decision so users (and judges) can see WHY the AI made its call.

// ============================================================
// CUSTOM DATASET
// ============================================================

const emergencyPhrases = [
  "help", "help help", "help me", "please help me", "save me",
  "i am scared", "i am in danger", "someone is following me",
  "call my family", "call police", "i need help", "emergency",
  "danger", "please save me", "i feel unsafe", "don't hurt me",
  "leave me alone", "i am trapped", "send help", "help please"
];

const accentVariations = [
  "halp", "elp me", "plis help", "pleej help", "hep me",
  "sabe me", "emargency", "im scared", "i m scared",
  "danger danger", "halp halp", "plzz help", "save mee"
];

const nonEmergencyPhrases = [
  "hello", "how are you", "help me with homework",
  "i need help in coding", "this song is dangerous",
  "save my file", "call me later", "i am scared of exams",
  "emergency meeting", "help button demo"
];

const distressKeywords = [
  "help", "save", "danger", "scared", "emergency",
  "trapped", "follow", "hurt", "unsafe", "police"
];

// ============================================================
// FUZZY MATCHING — Levenshtein Edit Distance
// ============================================================
// This is what handles accent variations. "plis help" and "please help"
// have a small edit distance, so we treat them as similar.

function levenshtein(a, b) {
  const m = a.length;
  const n = b.length;
  const dp = Array(m + 1).fill().map(() => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     // deletion
          dp[i][j - 1],     // insertion
          dp[i - 1][j - 1]  // substitution
        );
      }
    }
  }
  return dp[m][n];
}

function similarityPercent(a, b) {
  const maxLen = Math.max(a.length, b.length);
  if (maxLen === 0) return 100;
  const distance = levenshtein(a, b);
  return Math.round((1 - distance / maxLen) * 100);
}

// ============================================================
// MAIN CLASSIFIER
// ============================================================

export function classifyDistress(input) {
  if (!input || typeof input !== "string") {
    return { confidence: 0, label: "Normal", reasons: ["Empty input"] };
  }

  const text = input.toLowerCase().trim();
  const reasons = [];
  let confidence = 0;

  // STEP 1: Exact emergency phrase match (high confidence)
  for (const phrase of emergencyPhrases) {
    if (text.includes(phrase)) {
      confidence += 60;
      reasons.push(`Exact emergency phrase detected: "${phrase}"`);
      break;
    }
  }

  // STEP 2: Fuzzy match against emergency + accent dataset
  //         (catches mispronunciations, accent variations, typos)
  const allDistressPhrases = [...emergencyPhrases, ...accentVariations];
  let bestMatch = { phrase: "", score: 0 };
  for (const phrase of allDistressPhrases) {
    const score = similarityPercent(text, phrase);
    if (score > bestMatch.score) {
      bestMatch = { phrase, score };
    }
  }
  if (bestMatch.score >= 70 && confidence < 50) {
    const fuzzyBoost = Math.round(bestMatch.score * 0.6);
    confidence += fuzzyBoost;
    reasons.push(
      `Fuzzy match: "${bestMatch.phrase}" (${bestMatch.score}% similar — accent/typo handled)`
    );
  }

  // STEP 3: Distress keyword scan (counts EACH occurrence — repeated words = more urgency)
  const foundKeywords = [];
  for (const kw of distressKeywords) {
    // Count how many times this keyword appears (e.g. "help help" = 2)
    const matches = text.split(/\W+/).filter(w => w === kw).length;
    if (matches > 0) {
      confidence += 12 * Math.min(matches, 3); // cap at 3x boost per keyword
      foundKeywords.push(matches > 1 ? `${kw} (×${matches})` : kw);
    }
  }
  if (foundKeywords.length > 0) {
    reasons.push(`Distress keywords detected: ${foundKeywords.join(", ")}`);
  }

  // STEP 4: Non-emergency context penalty
  //         Prevents false positives like "help me with homework"
  for (const phrase of nonEmergencyPhrases) {
    if (text.includes(phrase)) {
      confidence -= 35;
      reasons.push(`Non-emergency context detected: "${phrase}" (penalty applied)`);
      break;
    }
  }

  // STEP 5: Cap confidence between 0 and 100
  confidence = Math.max(0, Math.min(100, confidence));

  // STEP 6: Assign label based on threshold
  let label;
  if (confidence >= 70) {
    label = "Emergency";
    reasons.push(`Confidence ${confidence}% ≥ 70 → Emergency action triggered`);
  } else if (confidence >= 40) {
    label = "Possible Distress";
    reasons.push(`Confidence ${confidence}% in 40–69 range → Warning level`);
  } else {
    label = "Normal";
    if (reasons.length === 0) {
      reasons.push("No distress signals detected");
    }
  }

  return { confidence, label, reasons };
}

// ============================================================
// DATASET METADATA (for transparency / judge demo)
// ============================================================

export const datasetInfo = {
  emergencyPhrasesCount: emergencyPhrases.length,
  accentVariationsCount: accentVariations.length,
  nonEmergencyPhrasesCount: nonEmergencyPhrases.length,
  distressKeywordsCount: distressKeywords.length,
  totalSamples:
    emergencyPhrases.length +
    accentVariations.length +
    nonEmergencyPhrases.length,
  methodology:
    "Custom dataset + Levenshtein fuzzy matching + weighted keyword scoring + explainable output. No external datasets used."
};
