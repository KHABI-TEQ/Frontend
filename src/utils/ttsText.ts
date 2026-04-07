/** @format */

/**
 * Strip emoji and common variation selectors so speech synthesis does not read them.
 */
export function stripEmojiForSpeech(text: string): string {
  if (!text) return "";
  return (
    text
      // Emoji blocks + symbols often paired with emoji
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{1F900}-\u{1F9FF}\u{1F1E6}-\u{1F1FF}]/gu, "")
      .replace(/\uFE0F/gu, "")
      .replace(/\u200D/gu, "")
      .replace(/\*{1,2}([^*]+)\*{1,2}/g, "$1")
      .replace(/\s+/g, " ")
      .trim()
  );
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
  s = stripEmojiForSpeech(s);
  return s || stripEmojiForSpeech(msg.content || "");
}
