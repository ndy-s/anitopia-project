import { IEffect } from "../interfaces";

/**
 * Interpolates a character's flavor skill text against the live numbers from the shared Skill
 * template's rarity-tier effects, instead of hand-duplicating the numbers per rarity per character.
 * Placeholders: {v1}, {v2}, ... -> effects[n].value as a percentage; {c1}, {c2}, ... -> effects[n].chance
 * as a percentage; {d1}, {d2}, ... -> effects[n].duration. Index is 1-based and matches the effect's
 * position in the Skill template's `effects` array for that rarity tier.
 */
export function resolveSkillFlavorText(template: string, effects: IEffect[]): string {
    return template.replace(/\{(v|c|d)(\d+)\}/g, (match, kind: string, indexStr: string) => {
        const effect = effects[Number(indexStr) - 1];
        if (!effect) return match;

        if (kind === 'd') return String(effect.duration);

        const percent = (kind === 'v' ? effect.value : effect.chance) * 100;
        return (Number.isInteger(percent) ? percent : +percent.toFixed(1)).toString();
    });
}
