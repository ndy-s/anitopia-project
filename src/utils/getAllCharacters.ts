import redis from '../lib/redis';
import { CharacterModel } from "../models";

// Used exclusively by /summon's gacha pools — Enemy-role characters (e.g. Dire Wolf) must never be
// pullable, so every query here is scoped to role: 'Hero'.
export async function getAllCharacters(seriesName = null) {
    if (seriesName !== null) {
        const characters = await CharacterModel.find({ series: seriesName, role: 'Hero' })
            .populate('activeSkill.skill')
            .populate('passiveSkill.skill')
            .lean();
        return characters;
    }

    const cachedCharacters = await redis.get('characters');

    if (cachedCharacters) {
        return JSON.parse(cachedCharacters);
    } else {
        const characters = await CharacterModel.find({ role: 'Hero' })
            .populate('activeSkill.skill')
            .populate('passiveSkill.skill')
            .lean();
        await redis.set('characters', JSON.stringify(characters), 'EX', 60);
        return characters;
    }
}
