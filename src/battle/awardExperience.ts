import { ILineup } from "../interfaces";
import { CharaCollectionModel } from "../models";
import { addExperience, BATTLE_WIN_XP, BATTLE_LOSS_XP } from "../utils";

export async function awardBattleExperience(lineup: ILineup[], won: boolean): Promise<void> {
    const gainedExperience = won ? BATTLE_WIN_XP : BATTLE_LOSS_XP;

    await Promise.all(lineup.map(async (slot) => {
        const collectionEntry = slot.character as any;
        if (!collectionEntry || typeof collectionEntry.level !== 'number') return;

        const { level, experience } = addExperience(collectionEntry.level, collectionEntry.experience, gainedExperience);

        await CharaCollectionModel.findByIdAndUpdate(collectionEntry._id, {
            $set: { level, experience }
        });
    }));
}
