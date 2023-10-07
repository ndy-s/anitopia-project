import { Client, CommandInteraction, EmbedBuilder } from 'discord.js';
import { devs, testServer } from '../../../config.json';
import getLocalCommands from '../../utils/getLocalCommands';

import AccountModel from '../../models/Account';
import redis from '../../lib/redis';
import register from '../../commands/account/register';

import commandNA from '../../commands/exceptions/commandNA';
import cooldownMS from '../../commands/exceptions/cooldownMS';
import { config } from '../../config';

export default async (client: Client, interaction: CommandInteraction) => {
    if (!interaction.isChatInputCommand()) return;

    if (!interaction.inGuild()) {
        commandNA(interaction);
        return;
    }
    
    const localCommands = getLocalCommands();
    try {
        const commandObject = localCommands.find(
            (cmd) => cmd.name === interaction.commandName
        );

        if (!commandObject) return;

        if (commandObject.devOnly) {
            if (
                interaction.member &&
                'id' in interaction.member &&
                typeof interaction.member.id === 'string' &&
                !devs.includes(interaction.member.id)
            ) {
                interaction.reply({
                    embeds: [
                        new EmbedBuilder()
                            .setColor('#FF0000')
                            .setTitle('🚫 Access Denied')
                            .setDescription("I'm sorry, but this command is restricted to developers only.")
                            .setFooter({
                                text: config.messages.footerText
                            })
                    ],
                    ephemeral: true,
                });
                return;
            } else {
                console.error('Invalid interaction.member:', interaction.member);
                return;
            }
        }

        if (commandObject.testOnly && !(interaction.guild?.id === testServer)) {
            (interaction as CommandInteraction).reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('🚫 Command Restriction')
                        .setDescription("I'm sorry, but this command is not allowed to be executed in this server.")
                        .setFooter({
                            text: config.messages.footerText
                        })
                ],
                ephemeral: true,
            });
            return;
        }

        if (commandObject.permissionsRequired?.some(permission => typeof interaction.member.permissions !== 'string' && !interaction.member.permissions.has(permission))) {
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('🚫 Permission Error')
                        .setDescription("I'm sorry, but you don't have the necessary permissions to execute this command. Please verify your permissions and try again.")
                        .setFooter({
                            text: config.messages.footerText
                        })
                ],
                ephemeral: true,
            });
            return;
        }

        if (commandObject.botPermissions?.some(permission => !interaction.guild?.members.me?.permissions.has(permission))) {
            interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setColor('#FF0000')
                        .setTitle('🚫 Permission Error')
                        .setDescription("I'm sorry, but I don't have the necessary permissions to execute this command. Could you please verify my permissions and try again? I appreciate your cooperation!")
                        .setFooter({
                            text: config.messages.footerText
                        })
                ],
                ephemeral: true,
            });
            return;
        }

        if (await cooldownMS(interaction, commandObject) === false) return;

        // Redis Caching
        const result = await redis.get(interaction.user.id);
        let account;

        if (result) {
            account = JSON.parse(result);
        } else {
            account = await AccountModel.findOne({
                accountId: 'id' in interaction.member ? interaction.member.id : undefined,
                guildId: interaction.guild?.id
            });

            await redis.set(interaction.user.id, JSON.stringify(account), 'EX', 60);
        }

        
        // Temporary
        commandObject.callback(client, interaction);

        // if (!account) {
        //     await register.callback(client, interaction);
        // } else if (account) {
        //     commandObject.callback(client, interaction);
        // }

    } catch (error) {
        console.log(`There was an error running this handle command: ${error}`);
    }
}