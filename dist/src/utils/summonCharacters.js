"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.summonCharacters = void 0;
;
const rarityAdjustments = {
    5: 0,
    4: 50,
    3: 100,
    2: 150,
    1: 200 // Legendary
};
async function summonCharacters(characters, rarityChances, guaranted, numCharacters = 1, guarantedRarity = 'epic') {
    const summonedCharacters = [];
    for (let i = 0; i < numCharacters; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        const character = JSON.parse(JSON.stringify(characters[randomIndex]));
        let rarity;
        const randomNum = Math.random() * 100;
        if (guaranted === 0 && guarantedRarity == 'epic') {
            rarity = 2; // Epic
        }
        else if (guaranted === 0 && guarantedRarity == 'legendary') {
            rarity = 1; // Legendary
        }
        else if (randomNum < rarityChances[5]) {
            rarity = 5; // Common
        }
        else if (randomNum < rarityChances[5] + rarityChances[4]) {
            rarity = 4; // Uncommon
        }
        else if (randomNum < rarityChances[5] + rarityChances[4] + rarityChances[3]) {
            rarity = 3; // Rare
        }
        else if (randomNum < rarityChances[5] + rarityChances[4] + rarityChances[3] + rarityChances[2]) {
            rarity = 2; // Epic
        }
        else {
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
exports.summonCharacters = summonCharacters;
