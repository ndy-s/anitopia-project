import { Schema, model } from "mongoose";
import { ISkillModel } from "../interfaces";

const effectSchema = new Schema({
    type: {
        type: String,
        required: true
    },
    value: {
        type: Number,
        required: true
    },
    chance: {
        type: Number,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    target: {
        type: String,
        required: true,
    }
}, { _id: false });

const rarityEffectSchema = new Schema({
    effects: [effectSchema],
    description: {
        type: String,
        required: true
    }
}, { _id: false });

const skillSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    type: {
        type: String,
        required: true,
        enum: ['Active', 'Passive']
    },
    cooldown: {
        type: Number,
    },
    trigger: {
        type: String,
        enum: ['Battle Start', 'Each Turn', 'Health -50%', 'Damage Taken', 'Attack', null]
    },
    target: {
        type: String,
        required: true,
        enum: ['Single', 'Area']
    },
    rarityEffects: {
        type: Map,
        of: rarityEffectSchema
    }
}, { timestamps: true });

export const SkillModel = model<ISkillModel>('Skill', skillSchema);