"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlayer = void 0;
const redis_1 = require("../lib/redis");
const models_1 = require("../models");
async function getPlayer(interaction) {
    const result = await redis_1.default.get(interaction.user.id);
    let player;
    if (result) {
        player = JSON.parse(result);
    }
    else {
        player = await models_1.PlayerModel.findOne({
            userId: interaction.member && 'id' in interaction.member ? interaction.member.id : undefined,
        });
        await redis_1.default.set(interaction.user.id, JSON.stringify(player), 'EX', 60);
    }
    return player;
}
exports.getPlayer = getPlayer;
