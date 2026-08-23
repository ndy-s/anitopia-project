interface AppEmojiRecord {
    id: string;
    name: string;
}

const appEmojis: Record<string, AppEmojiRecord> = {};

export function setAppEmoji(name: string, id: string): void {
    appEmojis[name] = { id, name };
}

export function getAppEmojiMention(name: string): string {
    const emoji = appEmojis[name];
    return emoji ? `<:${emoji.name}:${emoji.id}>` : '';
}

export function getButtonEmoji(name: string, fallback: string): { id: string; name: string } | string {
    return appEmojis[name] ?? fallback;
}
