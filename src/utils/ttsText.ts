/** @format */

/**
 * Strip emoji and common variation selectors so speech synthesis does not read them.
 */
export function stripEmojiForSpeech(text: string): string {
  if (!text) return "";
  return (
    text
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E6}-\u{1F1FF}]/gu, "")
      .replace(/\uFE0F/gu, "")
      .replace(/\u200D/gu, "")
      .replace(/\*{1,2}([^*]+)\*{1,2}/g, "$1")
      .replace(/\s+/g, " ")
      .trim()
  );
}

/**
 * Expand common abbreviations and remove symbols so TTS reads like natural speech.
 */
export function prepareTextForNaturalSpeech(text: string): string {
  if (!text || typeof text !== "string") return "";

  let s = text
    .replace(/\u2018|\u2019/g, "'")
    .replace(/\u201c|\u201d/g, '"')
    .replace(/\u2014|—/g, ", ")
    .replace(/~/g, " about ");

  const pairs: [RegExp, string][] = [
    [/\bLGAs\b/gi, "local government areas"],
    [/\bLGA's\b/gi, "local government areas"],
    [/\bLGA\b/gi, "local government area"],
    [/\bi\.e\.\s*/gi, "that is "],
    [/\be\.g\.\s*/gi, "for example "],
    [/\betc\.\s*/gi, "and so on "],
    [/\betc\b/gi, "and so on"],
    [/\bJV\b/gi, "joint venture"],
    [/\bvs\.\s*/gi, "versus "],
    [/\bvs\b/gi, "versus"],
    [/\bapprox\.\s*/gi, "approximately "],
    [/\bapprox\b/gi, "approximately"],
    [/\bNGN\b/gi, "Naira"],
    [/\bC of O\b/gi, "Certificate of Occupancy"],
    [/\bSqm\b/g, "square metres"],
    [/\bsqm\b/gi, "square metres"],
    [/\bSQM\b/g, "square metres"],
    [/\s*&\s*/g, " and "],
    [/\s*@\s*/g, " at "],
  ];
  for (const [re, rep] of pairs) {
    s = s.replace(re, rep);
  }

  s = s.replace(/₦/g, "Naira ");

  s = s.replace(/[*_#`|~]/g, " ");
  s = s.replace(/[•·▪►◆◇★☆→←↑↓▶]/g, " ");
  s = s.replace(/[{}\[\]]/g, " ");
  s = s.replace(/\s+/g, " ").trim();

  s = stripEmojiForSpeech(s);
  return s.trim();
}

/**
 * Text for TTS: prefer dedicated speak line; never read "(format: ...)" hints.
 */
export function assistantMessageToSpeakable(msg: {
  content?: string;
  speakLine?: string;
}): string {
  const raw = (msg.speakLine && msg.speakLine.trim()) || (msg.content && msg.content.trim()) || "";
  let s = raw.replace(/\s*\(format\s*:\s*[^)]+\)\s*/gi, "").trim();
  s = prepareTextForNaturalSpeech(s);
  if (s) return s;
  const fallback = (msg.content && msg.content.trim()) || "";
  return prepareTextForNaturalSpeech(fallback.replace(/\s*\(format\s*:\s*[^)]+\)\s*/gi, "").trim());
}
