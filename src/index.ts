import "dotenv/config";
import { Client, GatewayIntentBits } from 'discord.js';
import mongoose from 'mongoose';

import eventHandler from './handlers/eventHandler';

import { SkillModel, CharacterModel } from "../../common/models";
import { passiveSkillsData } from "./passiveSkillsData";
import { activeSkillsData } from "./activeSkillsData";
import { charactersData } from "./charactersData";

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

        // try {
        //     await SkillModel.insertMany(passiveSkillsData);
        //     await SkillModel.insertMany(activeSkillsData);
        //     await CharacterModel.insertMany(charactersData);
        //     console.log('Skills data has been inserted successfully.');
        // } catch (error) {
        //     console.error('An error occurred, skipping insert the data', error);
        // }
        
        eventHandler(client);
        await client.login(process.env.TOKEN);
    } catch (error) {
        console.error(`Database connection error: ${error}`);
    }
})();