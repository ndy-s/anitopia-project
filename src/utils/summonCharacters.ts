import { ICharacterModel } from "../interfaces";

interface RarityChances {
    5: number; // Common
    4: number; // Uncommon
    3: number; // Rare
    2: number; // Epic
    1: number; // Legendary
};

const rarityAdjustments = {
    5: 0, // Common
    4: 50, // Uncommon
    3: 100, // Rare
    2: 150, // Epic
    1: 200 // Legendary
};

export async function summonCharacters(characters: ICharacterModel[], rarityChances: RarityChances, guaranted: number, numCharacters: number = 1) {
    const summonedCharacters = [];

    for (let i = 0; i < numCharacters; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        const character = JSON.parse(JSON.stringify(characters[randomIndex]));

        let rarity: keyof RarityChances;
        const randomNum = Math.random() * 100;

        if (guaranted === 0) {
            rarity = 2; // Epic
        } else if (randomNum < rarityChances[5]) {
            rarity = 5; // Common
        } else if (randomNum < rarityChances[5] + rarityChances[4]) {
            rarity = 4; // Uncommon
        } else if (randomNum < rarityChances[5] + rarityChances[4] + rarityChances[3]) {
            rarity = 3; // Rare
        } else if (randomNum < rarityChances[5] + rarityChances[4] + rarityChances[3] + rarityChances[2]) {
            rarity = 2; // Epic
        } else {
            rarity = 1; // Legendary
        }

        guaranted--;

        for (const attr in character.attributes) {
            character.attributes[attr] += rarityAdjustments[rarity];
        }

        summonedCharacters.push({ character, rarity });
    }

    return summonedCharacters;
}
