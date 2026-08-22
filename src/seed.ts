import "dotenv/config";
import mongoose from "mongoose";

import { SkillModel, CharacterModel } from "./models";
import { passiveSkillsData } from "./passiveSkillsData";
import { activeSkillsData } from "./activeSkillsData";
import { charactersData } from "./charactersData";

(async () => {
    if (!process.env.MONGODB_URI) {
        console.error("MONGODB_URI is not defined in the environment variables.");
        process.exit(1);
    }

    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to Anitopia database.");

    try {
        await SkillModel.insertMany(passiveSkillsData);
        await SkillModel.insertMany(activeSkillsData);
        await CharacterModel.insertMany(charactersData);
        console.log("Skills and character data inserted successfully.");
    } catch (error) {
        console.error("Seed failed:", error);
    } finally {
        await mongoose.disconnect();
    }
})();
