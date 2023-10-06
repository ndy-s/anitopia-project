import { Client, CommandInteraction } from "discord.js";

export default {
    name: 'ping',
    description: 'Pong!',
    options: [],
    deleted: false,
    
    // Optional
    devOnly: false,
    testOnly: false,
    callback: (client: Client, interaction: CommandInteraction) => {
        interaction.reply(`Pong! ${client.ws.ping} ms`);
    },
};