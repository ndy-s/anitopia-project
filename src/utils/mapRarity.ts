enum Rarity {
    Common = 5,
    Uncommon = 4,
    Rare = 3,
    Epic = 2,
    Legendary = 1,
}

export const mapRarity = (rarity: Rarity): string => {
    return {
        [Rarity.Common]: 'Common',
        [Rarity.Uncommon]: 'Uncommon',
        [Rarity.Rare]: 'Rare',
        [Rarity.Epic]: 'Epic',
        [Rarity.Legendary]: 'Legendary',
    }[rarity] ?? 'Common';
};