import { Client, EmbedBuilder, ModalSubmitInteraction } from "discord.js";
import { CharaCollectionModel, PlayerModel } from "../../models";
import redis from "../../lib/redis";
import { getPlayer, hiddenValues } from "../../utils";
import detailTeamModal from "./detailTeamModal";
import { config } from "../../config";
import { ICharaCollectionModel, ICharacterModel } from "../../interfaces";

export default {
    name: 'editTeamFormationModal',
    callback: async (client: Client, interaction: ModalSubmitInteraction) => {
        try {
            const teamName = hiddenValues.get(interaction.user.id);
            if (interaction.fields.fields.size === 3) {
                const frontMiddleInput = interaction.fields.getTextInputValue('frontMiddleInput').toUpperCase();
                const backLeftInput = interaction.fields.getTextInputValue('backLeftInput').toUpperCase();
                const backRightInput = interaction.fields.getTextInputValue('backRightInput').toUpperCase();
    
                const inputs = [frontMiddleInput, backLeftInput, backRightInput];
                if (!inputs.some(input => input == null || input.trim() === '') && new Set(inputs).size !== 3) {
                    const duplicateErrorEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('🚫 Duplicate Characters Detected')
                        .setDescription('It seems like you have used the same character in multiple positions. In order to create a balanced team, each position must have a unique character. \n\nCould you please adjust your lineup and try again? We appreciate your patience and cooperation! 😊') // Set the embed description
                        .addFields(
                            { name: `${frontMiddleInput === backLeftInput || frontMiddleInput === backRightInput ? '⚠️' : ''} Position 1`, value: `Character ID: \`${frontMiddleInput}\``, inline: true },
                            { name: `${backLeftInput === frontMiddleInput || backLeftInput === backRightInput ? '⚠️' : ''} Position 2`, value: `Character ID: \`${backLeftInput}\``, inline: true },
                            { name: `${backRightInput === frontMiddleInput || backRightInput === backLeftInput ? '⚠️' : ''} Position 3`, value: `Character ID: \`${backRightInput}\``, inline: true }
                        )
                        .setFooter({
                            iconURL: interaction.client.user.displayAvatarURL({ extension: 'png', size: 512}),
                            text: `${config.messages.footerText}`
                        });
                        
                    await interaction.deferUpdate();
                    await interaction.followUp({
                        embeds: [duplicateErrorEmbed],
                        ephemeral: true
                    });
                    return;
                }
    
                let player = await getPlayer(interaction);
                const currentLineup = player.teams.find((team: Record<string, string>) => team.name === teamName).lineup;
    
                const frontMiddleCharacter = await CharaCollectionModel.findOne({ playerId: player._id, characterId: frontMiddleInput });
                const backLeftCharacter = await CharaCollectionModel.findOne({ playerId: player._id, characterId: backLeftInput });
                const backRightCharacter = await CharaCollectionModel.findOne({ playerId: player._id, characterId: backRightInput });
    
                const newLineup = [
                    { position: 'frontMiddle', character: frontMiddleCharacter ? frontMiddleCharacter._id : currentLineup.find((char: Record<string, string>) => char.position === 'frontMiddle').character },
                    { position: 'backLeft', character: backLeftCharacter ? backLeftCharacter._id : currentLineup.find((char: Record<string, string>) => char.position === 'backLeft').character },
                    { position: 'backRight', character: backRightCharacter ? backRightCharacter._id : currentLineup.find((char: Record<string, string>) => char.position === 'backRight').character }
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
    
                const createNotFoundField = (position: number, character: ICharaCollectionModel | null, input: string) => {
                    let status = input == null || input === '' ? '**Empty**' : character ? '**Updated**' : '**Not Found**';
                    let characterID = input == null || input === '' ? '_None_' : `Character ID: \`${input}\``;
                    let positionStatus = character ? '✅' : '⚠️';
                
                    return { 
                        name: `${positionStatus} Position ${position}`, 
                        value: `${characterID}\nStatus: ${status}`, 
                        inline: true 
                    };
                }
    
                const isValidCharacter = (character: ICharaCollectionModel | null, input: string) => {
                    return !character && !(input == null || input.trim() === '');
                }
                
                if (isValidCharacter(frontMiddleCharacter, frontMiddleInput) || isValidCharacter(backLeftCharacter, backLeftInput) || isValidCharacter(backRightCharacter, backRightInput)) {
                    const notFoundEmbed = new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('⚠️ Input Error Detected')
                        .setDescription('We encountered a problem with one or more of your inputs. It seems like some characters were not found in our database. For these positions, we have kept your previous characters. The other characters have been updated to your new inputs.')
                        .addFields(
                            createNotFoundField(1, frontMiddleCharacter, frontMiddleInput),
                            createNotFoundField(2, backLeftCharacter, backLeftInput),
                            createNotFoundField(3, backRightCharacter, backRightInput)
                        )
                        .setFooter({
                            iconURL: interaction.client.user.displayAvatarURL({ extension: 'png', size: 512}),
                            text: `${config.messages.footerText}`
                        });
                        
                    await interaction.deferUpdate();
                    await interaction.followUp({ embeds: [notFoundEmbed], ephemeral: true });
                    return await detailTeamModal.callback(client, interaction, teamName, false);
                }
    
                await detailTeamModal.callback(client, interaction, teamName);
            } else {
                console.log('its 5!!!!!!!');
            }
            
        } catch (error) {
            console.log(`Handle Submit Modal editTeamFormationModal Error: ${error}`);
        }
    }
}