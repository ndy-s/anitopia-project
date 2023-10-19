import "dotenv/config";
import { Client, GatewayIntentBits } from 'discord.js';
import mongoose from 'mongoose';

import eventHandler from './handlers/eventHandler';

import SkillModel from "./models/Skill";
import { passiveSkillsData } from "./passiveSkillsData";
import { activeSkillsData } from "./activeSkillsData";
import { charactersData } from "./charactersData";
import CharacterModel from "./models/Character";

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

        // Insert the data into MongoDB
        // try {
        //     await SkillModel.insertMany(passiveSkillsData);
        //     await SkillModel.insertMany(activeSkillsData);
        //     await CharacterModel.insertMany(charactersData);
        //     console.log('Skills data has been inserted successfully.');
        // } catch (error) {
        //     console.error('An error occurred, skipping insert the data', error);
        // }
        
        eventHandler(client);
        client.login(process.env.TOKEN);
    } catch (error) {
        console.log(`Connection Error: ${error}`);
    }
})();