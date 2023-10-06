import "dotenv/config";
import { Client, GatewayIntentBits } from 'discord.js';
import mongoose from 'mongoose';

import eventHandler from './handlers/eventHandler';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.MessageContent,
    ],
});

(async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI environment variable is not defined.");
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to Anitopia Database.")

        eventHandler(client);
        client.login(process.env.TOKEN);
    } catch (error) {
        console.log(`Connection Error: ${error}`);
    }
})();