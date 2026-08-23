import "dotenv/config";
import { Client, GatewayIntentBits } from 'discord.js';
import mongoose from 'mongoose';

import eventHandler from './handlers/eventHandler';

process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection (kept the bot alive):', error);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught exception (kept the bot alive):', error);
});

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
            console.error('MONGODB_URI is not defined in the environment variables.');
            process.exit(1);
        }

        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Bot connected to Anitopia database.")

        eventHandler(client);
        await client.login(process.env.TOKEN);
    } catch (error) {
        console.error(`Database connection error: ${error}`);
    }
})();