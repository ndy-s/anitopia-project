"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const discord_js_1 = require("discord.js");
const mongoose_1 = require("mongoose");
const eventHandler_1 = require("./handlers/eventHandler");
const client = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMembers,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.GuildPresences,
        discord_js_1.GatewayIntentBits.MessageContent,
    ],
});
(async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error("MONGODB_URI environment variable is not defined.");
        }
        await mongoose_1.default.connect(process.env.MONGODB_URI);
        console.log("Connected to Anitopia Database.");
        (0, eventHandler_1.default)(client);
        client.login(process.env.TOKEN);
    }
    catch (error) {
        console.log(`Connection Error: ${error}`);
    }
})();
