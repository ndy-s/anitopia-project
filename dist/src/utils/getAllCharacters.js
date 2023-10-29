"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllCharacters = void 0;
const redis_1 = require("../lib/redis");
const models_1 = require("../models");
async function getAllCharacters() {
    const characterResult = await redis_1.default.get('characters');
    let characters;
    if (characterResult) {
        characters = JSON.parse(characterResult);
    }
    else {
        characters = await models_1.CharacterModel.find({}).lean();
        await redis_1.default.set('characters', JSON.stringify(characters), 'EX', 60);
    }
    return characters;
}
exports.getAllCharacters = getAllCharacters;
