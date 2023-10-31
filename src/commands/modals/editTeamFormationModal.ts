import { Client, ModalSubmitInteraction } from "discord.js";
import { CharaCollectionModel, PlayerModel } from "../../models";
import redis from "../../lib/redis";
import { hiddenValues } from "../../utils";

export default {
    name: 'editTeamFormationModal',
    callback: async (client: Client, interaction: ModalSubmitInteraction) => {
        try {
            const teamName = hiddenValues.get(interaction.user.id);
            const frontMiddleInput = interaction.fields.getTextInputValue('frontMiddleInput').toUpperCase();
            const backLeftInput = interaction.fields.getTextInputValue('backLeftInput').toUpperCase();
            const backRightInput = interaction.fields.getTextInputValue('backRightInput').toUpperCase();

            const frontMiddleCharacter = await CharaCollectionModel.findOne({ characterId: frontMiddleInput });
            const backLeftCharacter = await CharaCollectionModel.findOne({ characterId: backLeftInput });
            const backRightCharacter = await CharaCollectionModel.findOne({ characterId: backRightInput });

            console.log(frontMiddleCharacter)
            console.log(backLeftCharacter)
            console.log(backRightCharacter)

            const newLineup = [
                { position: 'frontMiddle', character: frontMiddleCharacter ? frontMiddleCharacter._id : null },
                { position: 'backLeft', character: backLeftCharacter ? backLeftCharacter._id : null },
                { position: 'backRight', character: backRightCharacter ? backRightCharacter._id : null }
            ];

            const player = await PlayerModel.findOneAndUpdate(
                { 
                    userId: interaction.member && 'id' in interaction.member ? interaction.member.id : undefined,
                    'teams.name': teamName
                },
                { $set: { 'teams.$.lineup': newLineup } },
                { new: true }
            );

            console.log(player);

            // await redis.set(interaction.user.id, JSON.stringify(player), 'EX', 60);


        } catch (error) {
            console.log(`Handle Submit Modal editTeamFormationModal Error: ${error}`);
        }
    }
}