import { Client, ModalSubmitInteraction } from "discord.js";
import { CharaCollectionModel, PlayerModel } from "../../models";
import redis from "../../lib/redis";
import { getPlayer, hiddenValues } from "../../utils";
import detailTeamModal from "./detailTeamModal";

export default {
    name: 'editTeamFormationModal',
    callback: async (client: Client, interaction: ModalSubmitInteraction) => {
        try {
            const teamName = hiddenValues.get(interaction.user.id);
            const frontMiddleInput = interaction.fields.getTextInputValue('frontMiddleInput').toUpperCase();
            const backLeftInput = interaction.fields.getTextInputValue('backLeftInput').toUpperCase();
            const backRightInput = interaction.fields.getTextInputValue('backRightInput').toUpperCase();

            if (new Set([frontMiddleInput, backLeftInput, backRightInput]).size !== 3) {
                throw new Error("Each position must have a unique character.");
                return await detailTeamModal.callback(client, interaction, teamName);
            }

            let player = await getPlayer(interaction);

            const frontMiddleCharacter = await CharaCollectionModel.findOne({ playerId: player._id, characterId: frontMiddleInput });
            const backLeftCharacter = await CharaCollectionModel.findOne({ playerId: player._id, characterId: backLeftInput });
            const backRightCharacter = await CharaCollectionModel.findOne({ playerId: player._id, characterId: backRightInput });

            const newLineup = [
                { position: 'frontMiddle', character: frontMiddleCharacter ? frontMiddleCharacter._id : null },
                { position: 'backLeft', character: backLeftCharacter ? backLeftCharacter._id : null },
                { position: 'backRight', character: backRightCharacter ? backRightCharacter._id : null }
            ];

            player = await PlayerModel.findOneAndUpdate(
                { 
                    userId: interaction.member && 'id' in interaction.member ? interaction.member.id : undefined,
                    'teams.name': teamName
                },
                { $set: { 'teams.$.lineup': newLineup } },
                { new: true }
            ).populate('teams.lineup.character');
            await redis.set(interaction.user.id, JSON.stringify(player), 'EX', 60);

            await detailTeamModal.callback(client, interaction, teamName);
        } catch (error) {
            console.log(`Handle Submit Modal editTeamFormationModal Error: ${error}`);
        }
    }
}