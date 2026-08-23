import { getAppEmojiMention } from "../lib/appEmojis";

// Unicode fallback, used only until the `class_*` Application Emojis (registered in
// src/events/ready/05registerAppEmojis.ts from the game's own pixel-art icons) have finished
// uploading on first boot — after that, getClassEmoji always returns the real game asset.
const CLASS_EMOJI_FALLBACK: Record<string, string> = {
    warrior: '⚔️',
    mage: '🪄',
    tank: '🛡️',
    hunter: '🏹',
    support: '➕',
};

export function getClassEmoji(characterClass: string): string {
    const key = characterClass.toLowerCase();
    return getAppEmojiMention(`class_${key}`) || CLASS_EMOJI_FALLBACK[key] || '❔';
}
