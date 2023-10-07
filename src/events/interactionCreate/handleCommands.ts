import { Client, CommandInteraction } from 'discord.js';
import { devs, testServer } from '../../../config.json';
import getLocalCommands from '../../utils/getLocalCommands';

import AccountModel from '../../models/Account';
import register from '../../commands/account/register';

import commandNA from '../../commands/exceptions/commandNA';

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
                    content: 'Only developers are allowed to run this command.',
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
                content: 'This command cannot be run here.',
                ephemeral: true,
            });
            return;
        }

        if (commandObject.permissionsRequired?.some(permission => typeof interaction.member.permissions !== 'string' && !interaction.member.permissions.has(permission))) {
            interaction.reply({
                content: 'Not enough permissions.',
                ephemeral: true,
            });
            return;
        }

        if (commandObject.botPermissions?.some(permission => !interaction.guild?.members.me?.permissions.has(permission))) {
            interaction.reply({
                content: "I don't have enough permissions.",
                ephemeral: true,
            });
            return;
        }

        const account = await AccountModel.findOne({
            aaccountId: 'id' in interaction.member ? interaction.member.id : undefined,
            guildId: interaction.guild?.id
        });

        if (!account) {
            await register.callback(client, interaction);
        } else if (account) {
            await commandObject.callback(client, interaction);
        }

    } catch (error) {
        console.log(`There was an error running this handle command: ${error}`);
    }
}