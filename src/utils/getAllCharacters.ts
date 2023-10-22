import redis from "../lib/redis";
import CharacterModel from "../models/Character";

export async function getAllCharacters() {
    const characterResult = await redis.get('characters');
    let characters;
    if (characterResult) {
        characters = JSON.parse(characterResult);
    } else {
        characters = await CharacterModel.find({}).lean();
        await redis.set('characters', JSON.stringify(characters), 'EX', 60);
    }
    return characters;
}
