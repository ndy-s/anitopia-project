"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapRarity = void 0;
const mapRarity = (rarity) => {
    return {
        5: 'Common',
        4: 'Uncommon',
        3: 'Rare',
        2: 'Epic',
        1: 'Legendary'
    }[rarity] ?? 'Common';
};
exports.mapRarity = mapRarity;
