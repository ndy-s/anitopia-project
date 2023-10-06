import { Client } from "discord.js";
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

                console.log(existingCommand.options);
                console.log(localCommand.options);

                
            }

        }

    } catch (e) {

    }
};