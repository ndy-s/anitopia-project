interface RarityChances {
    Common: number;
    Uncommon: number;
    Rare: number;
    Epic: number;
    Legendary: number;
}

export function summonCharacter(characters: any[], rarityChances: RarityChances) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    const character = characters[randomIndex];

    let rarity: keyof RarityChances;
    const randomNum = Math.random() * 100;

    if (randomNum < rarityChances.Common) {
        rarity = 'Common';
    } else if (randomNum < rarityChances.Common + rarityChances.Uncommon) {
        rarity = 'Uncommon';
    } else if (randomNum < rarityChances.Common + rarityChances.Uncommon + rarityChances.Rare) {
        rarity = 'Rare';
    } else if (randomNum < rarityChances.Common + rarityChances.Uncommon + rarityChances.Rare + rarityChances.Epic) {
        rarity = 'Epic';
    } else {
        rarity = 'Legendary';
    }

    return { character, rarity };
}
