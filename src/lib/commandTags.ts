const commandTags: Record<string, string> = {};

export function setCommandTag(name: string, id: string): void {
    commandTags[name] = `</${name}:${id}>`;
}

export function getCommandTag(name: string): string {
    return commandTags[name] ?? `/${name}`;
}
