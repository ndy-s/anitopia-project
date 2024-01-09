import redis from '../lib/redis';
import { CharacterModel } from "../models";

export async function getAllCharacters(seriesName = null) {
    if (seriesName !== null) {
        const characters = await CharacterModel.find({ series: seriesName }).lean();
        return characters;
    }

    const cachedCharacters = await redis.get('characters');

    if (cachedCharacters) {
        return JSON.parse(cachedCharacters);
    } else {
        const characters = await CharacterModel.find({}).lean();
        await redis.set('characters', JSON.stringify(characters), 'EX', 60);
        return characters;
    }
}
