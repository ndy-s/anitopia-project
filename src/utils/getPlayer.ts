import { CollectedInteraction, CommandInteraction } from "discord.js";
import redis from "../lib/redis";

import { PlayerModel } from "../models";

export async function getPlayer(interaction: CommandInteraction | CollectedInteraction) {
    const result = await redis.get(interaction.user.id);
    let player;

    if (result) {
        player = JSON.parse(result);
    } else {
        player = await PlayerModel.findOne({
            userId: interaction.member && 'id' in interaction.member ? interaction.member.id : undefined,
        });
        await redis.set(interaction.user.id, JSON.stringify(player), 'EX', 60);
    }
    return player;
}
