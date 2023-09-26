const { devs, testServer } = require('../../../config.json');

const getLocalCommands = require('../../utils/getLocalCommands');
const Account = require('../../models/Account');
const registerCallback = require('../../commands/account/register');

// Import exceptions
const accountNotFound = require('../../exceptions/accountNotFound');
const commandNotAllowed = require("../../exceptions/commandNotAllowed");

module.exports = async (client, interaction) => {
    if (!interaction.isChatInputCommand()) return;

    if (!interaction.inGuild()) {
        commandNotAllowed(interaction);
        return;
    }

    const localCommands = getLocalCommands();
    try {
        const commandObject = localCommands.find(
            (cmd) => cmd.name === interaction.commandName
        );

        if (!commandObject) return;

        if (commandObject.devOnly) {
            if (!devs.includes(interaction.member.id)) {
                interaction.reply({
                    content: 'Only developers are allowed to run this command.',
                    ephemeral: true,
                });
                return;
            }
        }

        if (commandObject.testOnly) {
            if (!(interaction.guild.id === testServer)) {
                interaction.reply({
                    content: 'This command cannot be ran here.',
                    ephemeral: true,
                });
                return;
            }
        }

        if (commandObject.permissionsRequired?.length) {
            for (const permission of commandObject.permissionsRequired) {
                if (!interaction.member.permissions.has(permission)) {
                    interaction.reply({
                        content: 'Not enough permissions.',
                        ephemeral: true,
                    });
                    return;
                }
            }
        }

        if (commandObject.botPermissions?.length) {
            for (const permission of commandObject.botPermissions) {
                const bot = interaction.guild.members.me;

                if (!bot.permissions.has(permission)) {
                    interaction.reply({
                        content: "I don't have enough permissions.",
                        ephemeral: true,
                    });
                    return;
                }
            }
        }

        const account = await Account.findOne({
            accountId: interaction.member.id,
            guildId: interaction.guild.id
        });

        if (!account) {
            await registerCallback.callback(client, interaction);
        } else if (account) {
            await commandObject.callback(client, interaction);
        }

    } catch (error) {
        console.log(`There was an error running this handle command: ${error}`);
    }

};