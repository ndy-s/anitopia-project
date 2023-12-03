import { ICharacterModel } from "../interfaces";

enum Rarity {
    Common = 5,
    Uncommon = 4,
    Rare = 3,
    Epic = 2,
    Legendary = 1,
}

interface RarityChances {
    [Rarity.Common]: number;
    [Rarity.Uncommon]: number;
    [Rarity.Rare]: number;
    [Rarity.Epic]: number;
    [Rarity.Legendary]: number;
}

const rarityAdjustments = {
    [Rarity.Common]: 0,
    [Rarity.Uncommon]: 50,
    [Rarity.Rare]: 100,
    [Rarity.Epic]: 150,
    [Rarity.Legendary]: 200,
};

export async function summonCharacters(
    characters: ICharacterModel[],
    rarityChances: RarityChances,
    guaranteed: number,
    numCharacters: number = 1,
    guaranteedRarity: Rarity | null = null
) {
    const summonedCharacters = [];

    const getRandomRarity = (): Rarity => {
        const randomNum = Math.random() * 100;

        if (guaranteed === 0 && guaranteedRarity === Rarity.Epic) {
            return Rarity.Epic;
        } else if (guaranteed === 0 && guaranteedRarity === Rarity.Legendary) {
            return Rarity.Legendary;
        } else if (randomNum < rarityChances[Rarity.Common]) {
            return Rarity.Common;
        } else if (randomNum < rarityChances[Rarity.Common] + rarityChances[Rarity.Uncommon]) {
            return Rarity.Uncommon;
        } else if (randomNum < rarityChances[Rarity.Common] + rarityChances[Rarity.Uncommon] + rarityChances[Rarity.Rare]) {
            return Rarity.Rare;
        } else if (randomNum < rarityChances[Rarity.Common] + rarityChances[Rarity.Uncommon] + rarityChances[Rarity.Rare] + rarityChances[Rarity.Epic]) {
            return Rarity.Epic;
        } else {
            return Rarity.Legendary;
        }
    };

    for (let i = 0; i < numCharacters; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        const character = JSON.parse(JSON.stringify(characters[randomIndex]));

        const rarity: Rarity = getRandomRarity();
        guaranteed--;

        for (const attr in character.attributes) {
            character.attributes[attr] += rarityAdjustments[rarity];
        }

        summonedCharacters.push({ character, rarity });
    }

    return summonedCharacters;
}
