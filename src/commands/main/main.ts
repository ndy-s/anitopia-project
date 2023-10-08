import { Client, CommandInteraction } from "discord.js";

export default {
    name: 'main',
    description: 'Central hub for Anitopia commands',
    cooldown: 5_000,
    options: [],
    deleted: false,
    
    // Optional
    devOnly: false,
    testOnly: false,
    botPermissions: [],
    permissionsRequired: [],

    callback: async (client: Client, interaction: CommandInteraction, followUp = false) => {
        
    }
};