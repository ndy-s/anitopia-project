import { getAppEmojiMention } from "../lib/appEmojis";

// Unicode fallback, used only until the `element_*` Application Emojis (registered in
// src/events/ready/05registerAppEmojis.ts from the game's own pixel-art icons) have finished
// uploading on first boot — after that, getElementEmoji always returns the real game asset.
const ELEMENT_EMOJI_FALLBACK: Record<string, string> = {
    pyro: '🔥',
    aqua: '💧',
    volt: '⚡',
    terra: '🪨',
    aero: '💨',
    lumen: '✨',
    shade: '🌑',
    neutralis: '⚪',
};

export function getElementEmoji(element: string): string {
    const key = element.toLowerCase();
    return getAppEmojiMention(`element_${key}`) || ELEMENT_EMOJI_FALLBACK[key] || '❔';
}
