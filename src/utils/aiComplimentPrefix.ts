/** @format */

/** Random short praise + emoji to open successful AI suggestion messages (no “here’s what I have” phrasing). */
const COMPLIMENTS = [
  "Awesome! 🎉",
  "Perfect! ✨",
  "Great work! 👏",
  "Nice one! 🌟",
  "Love it! 💚",
  "Excellent! ⭐",
  "Brilliant! 🙌",
  "Fantastic! 🔥",
  "Well done! 🎯",
  "Super! 💫",
];

export function pickAiComplimentPrefix(): string {
  return COMPLIMENTS[Math.floor(Math.random() * COMPLIMENTS.length)] ?? "Great! ✨";
}
