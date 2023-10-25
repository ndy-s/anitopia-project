import { ICharacterModel } from "../interfaces";

interface RarityChances {
    Common: number;
    Uncommon: number;
    Rare: number;
    Epic: number;
    Legendary: number;
};

const rarityAdjustments = {
    Common: 0,
    Uncommon: 50,
    Rare: 100,
    Epic: 150,
    Legendary: 200
};

export async function summonCharacters(characters: ICharacterModel[], rarityChances: RarityChances, guaranted: number, numCharacters: number = 1) {
    const summonedCharacters = [];

    for (let i = 0; i < numCharacters; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        const character = JSON.parse(JSON.stringify(characters[randomIndex]));

        let rarity: keyof RarityChances;
        const randomNum = Math.random() * 100;

        if (guaranted === 0) {
            rarity = 'Epic';
        } else if (randomNum < rarityChances.Common) {
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

        guaranted--;

        for (const attr in character.attributes) {
            character.attributes[attr] += rarityAdjustments[rarity];
        }

        summonedCharacters.push({ character, rarity });
    }

    return summonedCharacters;
}
