// Import library
require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const mongoose = require('mongoose');

// Import other files
const eventHandler = require('./handlers/eventHandler.js');


const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.MessageContent,
    ]
});

(async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("Connected to Anitopia Database.");

        eventHandler(client);
        client.login(process.env.TOKEN);
    } catch (error) {
        console.log(`Connection Error: ${error}`);
    }
})();