import { ApplicationCommandOptionData, Client } from "discord.js";
import getLocalCommands from "../../utils/getLocalCommands";
import getApplicationCommands from "../../utils/getApplicationCommands";
import areCommandsDifferent from "../../utils/areCommandsDifferent";

export default async (client: Client) => {
    try {
        const localCommands = getLocalCommands();
        const applicationCommands = await getApplicationCommands(client);

        for (const localCommand of localCommands) {
            const { 
                name, 
                description,
                options,
                deleted,
                devOnly,
                testOnly,
                callback
            } = localCommand;

            const existingCommand = applicationCommands.cache.find((cmd) => cmd.name === name);

            if (existingCommand) {
                if (localCommand.deleted) {
                    await applicationCommands.delete(existingCommand.id);
                    console.log(`🗑 Deleted command "${name}".`);
                    continue;
                }

                if (areCommandsDifferent(existingCommand, localCommand)) {
                    await applicationCommands.edit(existingCommand.id, {
                        description, options: options as ApplicationCommandOptionData[], 
                    });

                    console.log(`🔁 Edited command "${name}".`);
                }
            } else {
                if (localCommand.deleted) {
                    console.log(`⏩ Skipping registering command "${name}" as it's set to delete.`);
                    continue;
                }

                await applicationCommands.create({
                    name, description, options: options as ApplicationCommandOptionData[]
                });

                console.log(`👍 Registered command "${name}."`);
            }
        }
    } catch (error) {
        console.log(`Registering commands error: ${error}`);
    }
};