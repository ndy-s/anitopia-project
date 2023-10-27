
export const mapRarity = (rarity: number): string => {
    return {
        5: 'Common',
        4: 'Uncommon',
        3: 'Rare',
        2: 'Epic',
        1: 'Legendary'
    }[rarity] ?? 'Common';
}