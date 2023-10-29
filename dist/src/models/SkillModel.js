"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SkillModel = void 0;
const mongoose_1 = require("mongoose");
const effectSchema = new mongoose_1.Schema({
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
const rarityEffectSchema = new mongoose_1.Schema({
    effects: [effectSchema],
    description: {
        type: String,
        required: true
    }
}, { _id: false });
const skillSchema = new mongoose_1.Schema({
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
exports.SkillModel = (0, mongoose_1.model)('Skill', skillSchema);
