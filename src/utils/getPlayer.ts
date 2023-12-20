import { CollectedInteraction, CommandInteraction } from "discord.js";
import redis from "../lib/redis";
import { PlayerModel } from "../models";

export async function getPlayer(interaction: CommandInteraction | CollectedInteraction) {
    const cachedPlayer = await redis.get(interaction.user.id);

    if (cachedPlayer) {
        return JSON.parse(cachedPlayer);
    } else {
        const player = await PlayerModel.findOne({
            userId: interaction.member && 'id' in interaction.member ? interaction.member.id : undefined,
        }).populate({
            path: 'teams.lineup.character',
            populate: {
                path: 'character',
                populate: [
                    { path: 'activeSkill.skill' },
                    { path: 'passiveSkill.skill' }
                ]
            },
        });

        await redis.set(interaction.user.id, JSON.stringify(player), 'EX', 60);
        return player;
    }
}
