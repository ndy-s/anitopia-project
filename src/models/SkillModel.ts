import { Schema, model } from "mongoose";
import { ISkillModel } from "../interfaces";

const effectSchema = new Schema({
    type: {
        type: String,
        required: true
    },
    attribute: {
        type: String,
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
        enum: ['Enemy', 'Ally']
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
        enum: ['Battle Start', 'Each Turn', 'Health -50%', 'Health -25%', 'Damage Taken', 'Attack', 'Defeated', null]
    },
    target: {
        type: String,
        required: true,
        enum: ['Single', 'Area', 'Highest Health', 'Lowest Health', 'Random']
    },
    rarityEffects: {
        type: Map,
        of: rarityEffectSchema
    }
}, { timestamps: true });

export const SkillModel = model<ISkillModel>('Skill', skillSchema);