import { ApplicationCommand, ApplicationCommandOptionType, Client, CommandInteraction } from "discord.js";
import getApplicationCommands from "../../utils/getApplicationCommands";

export default {
    name: 'delete-command',
    description: 'Removes a specified command',
    cooldown: 5_000,
    options: [
        {
            name: 'command-name',
            description: 'Name of the command to be removed',
            type: ApplicationCommandOptionType.String,
            required: true,
        }
    ],
    deleted: false,
    
    // Optional
    devOnly: true,
    testOnly: true,
    botPermissions: [],
    permissionsRequired: [],

    callback: async (client: Client, interaction: CommandInteraction) => {
        const commandName = interaction.options.get('command-name')?.value;

        const applicationCommands = await getApplicationCommands(client);
        const existingCommand = applicationCommands.cache.find((cmd) => cmd.name === commandName);

        if (existingCommand) {
            await applicationCommands.delete(existingCommand.id);
            console.log(`🗑 Deleted command "${commandName}".`); 
        }

        await interaction.deferReply();
        if (existingCommand) {
            await interaction.editReply(`The command "${commandName}" has been successfully deleted.`);
        } else {
            await interaction.editReply(`The command "${commandName}" does not exist.`);
        }

    }
};