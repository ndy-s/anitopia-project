export const MAX_LEVEL = 60;

const BASE_XP = 50;
const XP_GROWTH_EXPONENT = 1.5;

// +2% of a character's current (rarity-adjusted) stat per level above 1. At MAX_LEVEL that's
// roughly a 2.2x multiplier on top of whatever rarity already gave the character.
const STAT_GROWTH_RATE = 0.02;

// XP awarded automatically after a /duel or /battle resolves.
export const BATTLE_WIN_XP = 40;
export const BATTLE_LOSS_XP = 12;

// The "Enhance" menu: spend AniCoin directly for XP instead of waiting on battles.
export const ENHANCE_COST_ANICOIN = 300;
export const ENHANCE_XP_GAIN = 80;

export function xpToNextLevel(level: number): number {
    if (level >= MAX_LEVEL) return 0;
    return Math.round(BASE_XP * Math.pow(level, XP_GROWTH_EXPONENT));
}

export function applyLevelGrowth(baseStat: number, level: number): number {
    return Math.round(baseStat * (1 + STAT_GROWTH_RATE * (level - 1)));
}

export interface LevelUpResult {
    level: number;
    experience: number;
    levelsGained: number;
}

export function addExperience(currentLevel: number, currentExperience: number, gainedExperience: number): LevelUpResult {
    let level = currentLevel;
    let experience = currentExperience + gainedExperience;
    let levelsGained = 0;

    while (level < MAX_LEVEL) {
        const needed = xpToNextLevel(level);
        if (needed === 0 || experience < needed) break;

        experience -= needed;
        level++;
        levelsGained++;
    }

    if (level >= MAX_LEVEL) {
        experience = 0;
    }

    return { level, experience, levelsGained };
}
