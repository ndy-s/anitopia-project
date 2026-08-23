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
        const insertedPassiveSkills = await SkillModel.insertMany(passiveSkillsData);
        const insertedActiveSkills = await SkillModel.insertMany(activeSkillsData);

        const skillIdByName = new Map<string, mongoose.Types.ObjectId>();
        for (const skill of [...insertedPassiveSkills, ...insertedActiveSkills]) {
            skillIdByName.set(skill.name, skill._id);
        }

        const resolveSkillRef = (skillBlock: { skillRef?: string }) => {
            if (!skillBlock.skillRef) return skillBlock;

            const skillId = skillIdByName.get(skillBlock.skillRef);
            if (!skillId) {
                throw new Error(`No skill named "${skillBlock.skillRef}" found in passiveSkillsData/activeSkillsData.`);
            }

            const { skillRef, ...rest } = skillBlock;
            return { ...rest, skill: skillId };
        };

        const charactersWithResolvedSkills = charactersData.map((character) => ({
            ...character,
            passiveSkill: resolveSkillRef(character.passiveSkill),
            activeSkill: resolveSkillRef(character.activeSkill),
        }));

        await CharacterModel.insertMany(charactersWithResolvedSkills);
        console.log("Skills and character data inserted successfully.");
    } catch (error) {
        console.error("Seed failed:", error);
    } finally {
        await mongoose.disconnect();
    }
})();
