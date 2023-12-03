"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const models_1 = require("../../models");
const redis_1 = require("../../lib/redis");
const utils_1 = require("../../utils");
const detailTeamModal_1 = require("./detailTeamModal");
const config_1 = require("../../config");
exports.default = {
    name: 'editTeamFormationModal',
    callback: async (client, interaction) => {
        try {
            const teamName = utils_1.hiddenValues.get(interaction.user.id);
            const positions = interaction.fields.fields.size === 3 ? ['frontMiddle', 'backLeft', 'backRight'] : ['frontLeft', 'frontRight', 'backLeft', 'backMiddle', 'backRight'];
            const inputs = [];
            positions.forEach(position => {
                inputs.push(interaction.fields.getTextInputValue(`${position}Input`).toUpperCase());
            });
            const filterEmptyValue = inputs.filter(input => input && input.trim());
            if (new Set(filterEmptyValue).size !== filterEmptyValue.length) {
                const duplicateErrorEmbed = new discord_js_1.EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('🚫 Duplicate Characters Detected')
                    .setDescription('It seems like you have used the same character in multiple positions. In order to create a balanced team, each position must have a unique character. \n\nCould you please adjust your lineup and try again? We appreciate your patience and cooperation! 😊')
                    .setFooter({
                    iconURL: interaction.client.user.displayAvatarURL({ extension: 'png', size: 512 }),
                    text: `${config_1.config.messages.footerText}`
                });
                let duplicates = [];
                for (let i = 0; i < inputs.length; i++) {
                    for (let j = i + 1; j < inputs.length; j++) {
                        if (inputs[i] === inputs[j] && inputs[i].trim() !== '') {
                            duplicates.push(inputs[i]);
                        }
                    }
                }
                for (let i = 0; i < inputs.length; i++) {
                    let warning = (duplicates.includes(inputs[i]) && inputs[i].trim() !== '') ? '⚠️' : '';
                    let displayValue = inputs[i].trim() !== '' ? 'Character ID: \`' + inputs[i] + '\`' : '_None_';
                    duplicateErrorEmbed.addFields({
                        name: `${warning} Position ${i + 1}`,
                        value: `${displayValue}`, inline: true
                    });
                }
                await interaction.deferUpdate();
                await interaction.followUp({
                    embeds: [duplicateErrorEmbed],
                    ephemeral: true
                });
                return;
            }
            let player = await (0, utils_1.getPlayer)(interaction);
            const currentLineup = player.teams.find((team) => team.name === teamName).lineup;
            const newLineup = await Promise.all(inputs.map(async (input, index) => {
                const getChara = await models_1.CharaCollectionModel.findOne({ playerId: player._id, characterId: input });
                const position = positions[index];
                return {
                    position: position,
                    character: (getChara ? getChara._id : currentLineup.find((char) => char.position === position)?.character) ?? null,
                };
            }));
            player = await models_1.PlayerModel.findOneAndUpdate({
                userId: interaction.member && 'id' in interaction.member ? interaction.member.id : undefined,
                'teams.name': teamName
            }, { $set: { 'teams.$.lineup': newLineup } }, { new: true }).populate('teams.lineup.character');
            await redis_1.default.set(interaction.user.id, JSON.stringify(player), 'EX', 60);
            const createNotFoundField = (position, character, input) => {
                let status = input == null || input === '' ? '**Empty**' : character ? '**Updated**' : '**Not Found**';
                let characterID = input == null || input === '' ? '_None_' : `Character ID: \`${input}\``;
                let positionStatus = character ? '✅' : '⚠️';
                return {
                    name: `${positionStatus} Position ${position}`,
                    value: `${characterID}\nStatus: ${status}`,
                    inline: true
                };
            };
            const isValidCharacter = (character, input) => {
                return !character && !(input == null || input.trim() === '');
            };
            if (newLineup.some((lineup, index) => isValidCharacter(lineup.character, inputs[index]))) {
                const notFoundEmbed = new discord_js_1.EmbedBuilder()
                    .setColor('#FF0000')
                    .setTitle('⚠️ Input Error Detected')
                    .setDescription('We encountered a problem with one or more of your inputs. It seems like some characters were not found in our database. For these positions, we have kept your previous characters. The other characters have been updated to your new inputs.')
                    .addFields(newLineup.map((lineup, index) => createNotFoundField(lineup.position, lineup.character, inputs[index])))
                    .setFooter({
                    iconURL: interaction.client.user.displayAvatarURL({ extension: 'png', size: 512 }),
                    text: `${config_1.config.messages.footerText}`
                });
                await interaction.deferUpdate();
                await interaction.followUp({ embeds: [notFoundEmbed], ephemeral: true });
                return await detailTeamModal_1.default.callback(client, interaction, teamName, false);
            }
            await detailTeamModal_1.default.callback(client, interaction, teamName);
        }
        catch (error) {
            console.log(`Handle Submit Modal editTeamFormationModal Error: ${error}`);
        }
    }
};
